(function (global) {
  'use strict';

  const D = global.CWData;
  const CO = D.BY_ID;
  const SIDES = D.SIDES;
  const TURN_ORDER = D.TURN_ORDER;
  const VICTORY_VP = D.VICTORY_VP;
  const NAME = D.SIDE_NAME;

  const ERA_SHORT = ['early', 'early', 'mid', 'mid', 'late', 'late'];
  const ERA_NAME = { early: '早期战争', mid: '中期战争', late: '晚期战争' };

  function others(side) { return SIDES.filter(s => s !== side); }



  function activeSides(G) { return SIDES.filter(s => !(G && G.idle && G.idle[s])); }
  function otherActive(G, side) { return activeSides(G).filter(s => s !== side); }

  function turnOrder(G) { return TURN_ORDER.filter(s => !(G && G.idle && G.idle[s])); }
  function sideRegions(G, side) {
    const r = G.rule && G.rule[side];
    return (r && r.regions) ? r.regions : null;
  }

  function canTarget(G, side, cid) {
    const regs = sideRegions(G, side);
    if (!regs) return true;
    return regs.indexOf(CO[cid].region) >= 0;
  }
  function bestOf(G, sides) {
    let best = sides[0];
    for (const s of sides) if (G.vp[s] > G.vp[best]) best = s;
    return best;
  }

  function netOf(G, side) {
    let top = -Infinity;
    for (const s of others(side)) if (G.vp[s] > top) top = G.vp[s];
    return G.vp[side] - top;
  }
  function leader(G) { return bestOf(G, SIDES); }

  function rng(G) {
    G.rngState = (G.rngState + 0x6D2B79F5) | 0;
    let t = G.rngState;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function d6(G) { return 1 + Math.floor(rng(G) * 6); }
  function shuffle(G, arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng(G) * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function infl(G, cid, side) { return G.infl[cid][side]; }
  function maxRival(G, cid, side) {
    let v = 0, who = null;
    for (const s of otherActive(G, side)) {
      if (G.infl[cid][s] > v) { v = G.infl[cid][s]; who = s; }
    }
    return { v, who };
  }

  function controls(G, cid, side) {
    if (!side) return false;
    const c = CO[cid];
    return G.infl[cid][side] - maxRival(G, cid, side).v >= c.stab;
  }
  function controller(G, cid) {
    for (const s of activeSides(G)) if (controls(G, cid, s)) return s;
    return null;
  }
  function controlledByAny(G, cid) { return activeSides(G).some(s => controls(G, cid, s)); }

  function eraForTurn(G, t) {
    return G.maxTurns === 6 ? ERA_SHORT[t - 1] : D.ERA_BY_TURN[t - 1];
  }
  function inDeck(G, card) {
    if (!G.sets || !G.sets.length) return true;
    return G.sets.indexOf(card.set) >= 0;
  }

  function eraCards(G, era) {
    const sets = (G.sets && G.sets.length) ? G.sets : null;
    if (!sets) return D.CARDS.filter(c => c.era === era).map(c => c.id);
    const out = [];
    for (const set of sets) {
      for (const c of D.CARDS) if (c.era === era && c.set === set) out.push(c.id);
    }
    return out;
  }

  function log(G, text, cls) {
    G.log.push({ t: G.turn, text, cls: cls || '' });
    if (G.log.length > 3000) G.log.shift();
  }

  function addInfl(G, cid, side, n) {
    if (!n) return;
    G.infl[cid][side] = Math.max(0, G.infl[cid][side] + n);
  }
  function setInfl(G, cid, side, n) { G.infl[cid][side] = Math.max(0, n | 0); }
  function rmInfl(G, cid, side, n) {
    if (!n) return 0;
    const before = G.infl[cid][side];
    G.infl[cid][side] = Math.max(0, before - n);
    return before - G.infl[cid][side];
  }

  function vpFor(G, side, n, src) {
    if (!n || !side) return;
    G.vp[side] += n;
    if (G.vpSrc && G.vpSrc[side]) G.vpSrc[side][src || 'event'] = (G.vpSrc[side][src || 'event'] || 0) + n;
  }
  function milOps(G, side, n) {
    G.mil[side] = Math.max(0, Math.min(5, G.mil[side] + n));
  }

  function defcon(G, delta) {
    const before = G.defcon;
    G.defcon = Math.max(1, Math.min(5, G.defcon + delta));
    if (G.defcon !== before) log(G, `DEFCON ${before} → ${G.defcon}`, delta < 0 ? 'bad' : 'good');
    if (G.defcon <= 1) {
      const guilty = G.acting || turnOrder(G)[0];
      const rest = otherActive(G, guilty);
      const winner = rest.length ? bestOf(G, rest) : null;
      gameOver(G, winner, `${NAME[guilty]}把 DEFCON 压到 1，核战争爆发`);
    }
  }

  function advanceSpace(G, side, n) {
    for (let i = 0; i < n; i++) {
      const idx = G.space[side];
      if (idx >= 8) { log(G, `${NAME[side]}已完成全部太空任务`); break; }
      G.space[side]++;
      vpFor(G, side, D.SPACE_VP[idx], 'space');
      log(G, `${NAME[side]}太空竞赛推进到第 ${G.space[side]} 格（+${D.SPACE_VP[idx]} VP）`, 'good');
    }
  }

  function gameOver(G, winner, reason) {
    if (G.over) return;
    G.over = true;
    G.winner = winner;
    G.reason = reason;
    G.phase = 'over';
    G.pending = null;
    G.ops = null;
    log(G, `★ 游戏结束：${winner ? NAME[winner] + '胜利' : '平局'} —— ${reason}`, 'boom');
  }

  function checkVictory(G) {
    if (G.over) return true;
    for (const s of activeSides(G)) {
      const rule = (G.rule && G.rule[s]) || {};

      if (rule.vpTarget && netOf(G, s) >= rule.vpTarget) {
        gameOver(G, s, `${NAME[s]}把领先优势扩大到 ${rule.vpTarget} VP`);
        return true;
      }
    }
    const bgs = D.REGION_COUNTRIES.europe.map(id => CO[id]).filter(c => c.bg);
    for (const s of activeSides(G)) {
      const rule = (G.rule && G.rule[s]) || {};
      if (rule.fastWin === false) continue;
      if (bgs.every(c => controls(G, c.id, s))) {
        gameOver(G, s, `${NAME[s]}控制了欧洲全部战场国`);
        return true;
      }
    }
    return false;
  }

  function regionScore(G, rid, side) {
    const ids = D.REGION_COUNTRIES[rid];
    let ct = 0, bg = 0, presence = false;
    let oppCt = 0, oppBg = 0;
    ids.forEach(cid => {
      const c = CO[cid];
      if (G.infl[cid][side] > 0) presence = true;
      if (controls(G, cid, side)) { ct++; if (c.bg) bg++; }
    });
    for (const s of otherActive(G, side)) {
      let oct = 0, obg = 0;
      ids.forEach(cid => {
        if (controls(G, cid, s)) { oct++; if (CO[cid].bg) obg++; }
      });
      if (oct > oppCt) oppCt = oct;
      if (obg > oppBg) oppBg = obg;
    }
    const totalBg = ids.filter(id => CO[id].bg).length;
    if (!presence) return { score: 0, ct, bg, level: 'none', presence: false, oppCt, oppBg, totalBg };
    let level = 'presence', bonus = 0;
    if (totalBg > 0 && bg === totalBg && bg > oppBg) { level = 'control'; bonus = 3; }
    else if (bg > oppBg && ct > oppCt) { level = 'domination'; bonus = 1; }
    return { score: 1 + bg + Math.floor(ct / 3) + bonus, ct, bg, level, presence: true, bonus, totalBg, oppCt, oppBg };
  }
  const LEVEL_CN = { none: '无存在', presence: '存在', domination: '主导', control: '控制' };
  const VP_CLS = { us: 'good', ussr: 'bad', cn: 'us' };

  function scoreRegion(G, rid) {
    const r = D.REGIONS.find(x => x.id === rid);
    const act = activeSides(G);
    const rows = act.map(s => Object.assign({ side: s }, regionScore(G, rid, s)));
    log(G, `📊 ${r.name}记分 —— ` + rows.map(x =>
      `${NAME[x.side]} ${x.score}（${LEVEL_CN[x.level]}，控制国 ${x.ct}，战场国 ${x.bg}）`).join(' / '), 'score');
    const sorted = rows.slice().sort((a, b) => b.score - a.score);
    const best = sorted[0], second = sorted[1];
    const diff = best.score - second.score;
    if (diff > 0 && best.score > 0) {
      vpFor(G, best.side, diff, 'score');
      log(G, `${r.name}：${NAME[best.side]}净得 ${diff} VP`, VP_CLS[best.side]);
    } else {
      log(G, `${r.name}：无人领先，无得分`, '');
    }
    checkVictory(G);
    return { rows, diff, winner: diff > 0 && best.score > 0 ? best.side : null };
  }

  function drawCard(G) {
    if (!G.deck.length && G.discard.length) {
      G.deck = shuffle(G, G.discard);
      G.discard = [];
      log(G, '抽牌堆用尽，弃牌堆重新洗入', 'note');
    }
    if (!G.deck.length) {
      const held = new Set();
      for (const s of SIDES) G.hands[s].forEach(id => held.add(id));
      const removed = new Set(G.removed);
      const pool = eraCards(G, G.era).filter(id => !held.has(id) && !removed.has(id));
      G.deck = shuffle(G, pool);
      log(G, '牌库彻底用尽，本时代牌堆重建', 'note');
    }
    return G.deck.pop() || null;
  }
  function removeFromHand(G, side, cardId) {
    const i = G.hands[side].indexOf(cardId);
    if (i >= 0) G.hands[side].splice(i, 1);
  }

  function ownCount(G, side) {
    let n = 0;
    for (const id of G.hands[side]) {
      const c = D.CARDS_BY_ID[id];
      if (c && c.side === side) n++;
    }
    return n;
  }

  function takeOwn(G, side, pile) {
    for (let i = pile.length - 1; i >= 0; i--) {
      const c = D.CARDS_BY_ID[pile[i]];
      if (c && c.side === side) return pile.splice(i, 1)[0];
    }
    return null;
  }

  function drawFor(G, side, preferOwn) {
    if (!preferOwn) return drawCard(G);
    const own = takeOwn(G, side, G.deck) || takeOwn(G, side, G.discard);
    if (own) return own;

    const id = drawCard(G);
    const own2 = takeOwn(G, side, G.deck);
    if (own2) { if (id) G.deck.push(id); return own2; }
    return id;
  }



  const OWN_MIN = 2;
  function refillHands(G) {
    for (const s of activeSides(G)) {
      let guard = 0;
      while (G.hands[s].length < G.arMax && guard++ < 200) {
        const needOwn = ownCount(G, s) < OWN_MIN;
        const id = drawFor(G, s, needOwn);
        if (!id) break;
        G.hands[s].push(id);
      }
    }
  }

  function isAI(G, side) { return !!(G.ai && G.ai[side]); }
  function humanSides(G) { return SIDES.filter(s => G.human && G.human[s]); }

  function runEffect(G, card, onDone) {
    const state = { done: false };
    const finish = () => {
      if (state.done) return;
      state.done = true;
      if (onDone) onDone();
    };
    const side = card.side === 'neutral' ? (G.acting || 'us') : card.side;
    const h = makeHelpers(G, card, side, finish, state);
    if (!card.effect) { finish(); return; }
    card.effect(h);
    if (!G.pending && !state.done) finish();
  }

  function choose(G, h, spec, cont) {
    const from = (spec.from || []).slice();
    const count = Math.max(0, Math.min(spec.count, from.length));
    if (count === 0) { cont([]); return; }
    if (count === from.length) {
      log(G, `${NAME[h.side]}自动选择：${from.map(id => CO[id].name).join('、')}`, 'note');
      cont(from);
      return;
    }
    if (isAI(G, h.side)) {
      const ids = (global.CWAI && global.CWAI.pickCountries)
        ? global.CWAI.pickCountries(G, h.side, spec, count)
        : from.slice(0, count);
      log(G, `${NAME[h.side]}选择：${ids.map(id => CO[id].name).join('、')}`, 'note');
      cont(ids);
    } else {
      G.pending = { spec: { count, from, title: spec.title || '选择国家', hint: spec.hint || '' }, cont, finish: h.finish, state: h.state, side: h.side };
    }
  }

  function resolvePending(G, ids) {
    const p = G.pending;
    if (!p) return;
    G.pending = null;
    log(G, `${NAME[p.side]}选择：${ids.map(id => CO[id].name).join('、')}`, 'note');
    p.cont(ids);
    if (!G.pending && !p.state.done) p.finish();
  }

  function makeHelpers(G, card, side, finish, state) {
    const opp = otherActive(G, side);
    const h = {
      G, side, opp: opp[0], opps: opp, card, state, finish,
      log: t => log(G, t),
      co: cid => CO[cid],
      infl: (cid, s) => G.infl[cid][s || side],
      region: rid => D.REGION_COUNTRIES[rid].slice(),
      allCountries: () => D.COUNTRIES.map(c => c.id),
      ctrl: (cid, s) => controls(G, cid, s || side),
      rivals: () => opp.slice(),
      maxRival: cid => maxRival(G, cid, side),
      canTarget: cid => canTarget(G, side, cid),
      vpMe: n => { vpFor(G, side, n); log(G, `${NAME[side]} +${n} VP`, VP_CLS[side]); checkVictory(G); },
      vpFor: (s, n) => { vpFor(G, s, n); log(G, `${NAME[s]} +${n} VP`, VP_CLS[s]); checkVictory(G); },
      defcon: d => defcon(G, d),
      mil: (s, n) => milOps(G, s, n),
      add: (cid, n) => { addInfl(G, cid, side, n); log(G, `${NAME[side]}在${CO[cid].name} +${n} 影响力`); },
      addFor: (s, cid, n) => { addInfl(G, cid, s, n); log(G, `${NAME[s]}在${CO[cid].name} +${n} 影响力`); },

      rm: (cid, n) => {
        const r = maxRival(G, cid, side);
        if (!r.who) return;
        const done = rmInfl(G, cid, r.who, n);
        if (done) log(G, `${CO[cid].name} 移除 ${done} 点${NAME[r.who]}影响力`);
      },
      rmFor: (s, cid, n) => {
        const done = rmInfl(G, cid, s, n);
        if (done) log(G, `${CO[cid].name} 移除 ${done} 点${NAME[s]}影响力`);
      },
      all: (cid, s) => {
        const done = rmInfl(G, cid, s, 99);
        if (done) log(G, `${CO[cid].name} 移除全部 ${done} 点${NAME[s]}影响力`);
      },
      space: n => advanceSpace(G, side, n),
      spaceFor: (s, n) => advanceSpace(G, s, n),
      war: (cid, mod, winVp) => war(G, side, cid, mod, winVp),
      choose: (spec, cont) => choose(G, h, spec, cont)
    };
    return h;
  }

  function war(G, side, cid, mod, winVp) {
    const c = CO[cid];
    const roll = d6(G);
    const total = roll + (mod || 0);
    const need = 2 * c.stab;
    log(G, `⚔ ${NAME[side]}在${c.name}发动战争：1d6=${roll}${mod ? ` ${mod > 0 ? '+' : ''}${mod}` : ''} = ${total}（需 > ${need}）`, 'war');
    if (total > need) {
      for (const s of otherActive(G, side)) setInfl(G, cid, s, 0);
      setInfl(G, cid, side, c.stab);
      if (winVp) vpFor(G, side, winVp);
      log(G, `战争胜利！${NAME[side]}控制${c.name}${winVp ? `，+${winVp} VP` : ''}`, VP_CLS[side]);
      checkVictory(G);
    } else {
      const target = maxRival(G, cid, side).who || otherActive(G, side)[0];
      addInfl(G, cid, target, 1);
      log(G, `战争失利，${NAME[target]}在${c.name} +1 影响力`, side === 'us' ? 'bad' : 'good');
    }
  }


  function abilityTargets(G, side) {
    const rest = otherActive(G, side);
    const regs = sideRegions(G, side);
    return D.COUNTRIES.map(c => c.id).filter(cid =>
      rest.every(s => G.infl[cid][s] === 0) && (!regs || regs.indexOf(CO[cid].region) >= 0));
  }

  function abilityNeedsTarget(side) {
    return (D.ABILITIES[side] && D.ABILITIES[side].kind) !== 'points';
  }
  function canAbility(G, side) {
    if (!G || G.over || G.phase !== 'action') return false;
    if (G.current !== side || G.pending) return false;
    if (G.abilityUsed && G.abilityUsed[side]) return false;
    if (!abilityNeedsTarget(side)) {
      return cnPoints(G) < D.CN_POINT.cap;
    }
    return abilityTargets(G, side).length > 0;
  }
  function useAbility(G, side, cid) {
    if (!G || G.over || G.phase !== 'action') return false;
    if (G.current !== side || G.pending) return false;
    if (G.abilityUsed && G.abilityUsed[side]) return false;
    const ability = (G.ability && G.ability[side]) || D.ABILITIES[side];
    if (!abilityNeedsTarget(side)) {
      if (cnPoints(G) >= D.CN_POINT.cap) return false;
      G.abilityUsed[side] = true;
      addCnPoints(G, ability.power || D.CN_POINT.abilityGain, `发动「${ability.name}」`);
      return true;
    }
    if (abilityTargets(G, side).indexOf(cid) < 0) return false;
    const power = ability.power || 1;
    G.abilityUsed[side] = true;
    addInfl(G, cid, side, power);
    log(G, `✦ ${NAME[side]}发动阵营能力「${ability.name}」：在${CO[cid].name} +${power} 影响力`, VP_CLS[side]);
    return true;
  }


  function newGame(opts) {
    opts = opts || {};
    const short = opts.short === true || opts.length === 'short';
    const deckId = D.DECK_BY_ID[opts.deck] ? opts.deck : 'std';
    const sets = D.DECK_BY_ID[deckId].sets.slice();

    const rule = {
      us: { vpTarget: VICTORY_VP, regions: null, fastWin: true },
      ussr: { vpTarget: VICTORY_VP, regions: null, fastWin: true },
      cn: {
        vpTarget: D.CHINA_RULE.vpTarget,
        regions: D.CHINA_RULE.regions.slice(),
        fastWin: D.CHINA_RULE.fastWin
      }
    };
    const humans = { us: false, ussr: false, cn: false };
    if (opts.humans) {
      SIDES.forEach(s => { humans[s] = !!opts.humans[s]; });
    } else if (opts.playerSide) {
      humans[opts.playerSide === 'ussr' ? 'ussr' : 'us'] = true;
    } else {
      humans.us = true;
    }
    if (opts.tutorial) {
      humans.us = false; humans.ussr = true; humans.cn = false;
    }
    const mine = humanSides({ human: humans });
    const viewSide = (opts.viewSide && humans[opts.viewSide]) ? opts.viewSide : (mine[0] || 'us');
    const ability = {};
    SIDES.forEach(s => { ability[s] = D.ABILITIES[s]; });

    const G = {
      seed: opts.seed === undefined ? (Date.now() % 2147483647) : opts.seed,
      rngState: 0,
      turn: 1,
      maxTurns: short ? 6 : 10,
      short,
      deckId,
      sets,
      rule,
      ability,
      cnPoints: 0,
      tutorial: !!opts.tutorial,
      human: humans,
      ai: { us: !humans.us, ussr: !humans.ussr, cn: !humans.cn },
      viewSide,
      hotseat: mine.length > 1,
      era: null,
      phase: 'headline',
      current: TURN_ORDER[0],
      ar: 1,
      arMax: 6,
      vp: { us: 0, ussr: 0, cn: 0 },
      defcon: 5,
      mil: { us: 0, ussr: 0, cn: 0 },
      space: { us: 0, ussr: 0, cn: 0 },
      spaceFail: { us: -1, ussr: -1, cn: -1 },
      abilityUsed: { us: false, ussr: false, cn: false },
      infl: {},
      hands: { us: [], ussr: [], cn: [] },
      deck: [],
      discard: [],
      removed: [],
      headline: { us: null, ussr: null, cn: null },
      headlineDone: { us: false, ussr: false, cn: false },
      headlineQueue: [],
      headlineIndex: 0,
      ops: null,
      pending: null,
      acting: null,
      log: [],
      over: false,
      winner: null,
      reason: '',
      lastScore: null,
      reveal: null,
      revealSeq: 0,
      vpSrc: { us: {}, ussr: {}, cn: {} }
    };
    G.rngState = G.seed | 0;
    D.COUNTRIES.forEach(c => {
      G.infl[c.id] = {
        us: D.SETUP.us[c.id] || 0,
        ussr: D.SETUP.ussr[c.id] || 0,
        cn: D.SETUP.cn[c.id] || 0
      };
    });
    log(G, '★ 核边缘：1945 年的世界被划分为两个阵营，而在东方，第三个力量正在成形。', 'end');
    log(G, '◆ 中国定位「第三世界领袖」：行动范围只到中东、非洲、亚洲；没有速胜手段，只能在终局取胜；' +
      '技能「不结盟运动」积攒中国点数，抬高美苏抢占空余国家的行动点花费。', 'note');
    beginTurn(G);
    return G;
  }

  function beginTurn(G) {
    if (G.over) return;
    const era = eraForTurn(G, G.turn);
    if (era !== G.era) {
      G.era = era;
      G.deck = shuffle(G, eraCards(G, era).filter(id => G.removed.indexOf(id) < 0));
      G.discard = [];
      log(G, `═══ 进入${ERA_NAME[era]}（第 ${G.turn} 回合）═══`, 'era');
    } else {
      log(G, `═══ 第 ${G.turn} 回合开始（${ERA_NAME[era]}）═══`, 'era');
    }
    G.arMax = (G.short ? D.AR_SHORT : D.AR_STANDARD)[G.turn - 1] || 8;
    G.phase = 'headline';
    G.headline = { us: null, ussr: null, cn: null };
    G.headlineDone = { us: false, ussr: false, cn: false };
    G.headlineQueue = [];
    G.headlineIndex = 0;
    G.ops = null;
    G.pending = null;
    G.acting = null;
    G.current = turnOrder(G)[0];
    G.ar = 1;
    G.mil = { us: 0, ussr: 0, cn: 0 };
    G.spaceFail = { us: -1, ussr: -1, cn: -1 };
    G.abilityUsed = { us: false, ussr: false, cn: false };
    refillHands(G);
    log(G, `${activeSides(G).map(s => NAME[s]).join('、')}手牌补至 ${G.arMax} 张，本回合各有 ${G.arMax} 个行动轮`, 'note');
  }

  function submitHeadline(G, side, cardId) {
    if (G.over || G.phase !== 'headline' || G.headlineDone[side]) return false;
    if (G.idle && G.idle[side]) return false;
    if (cardId && G.hands[side].indexOf(cardId) < 0) return false;
    if (cardId && D.CARDS_BY_ID[cardId].score) return false;
    G.headlineDone[side] = true;
    G.headline[side] = cardId || null;
    if (cardId) removeFromHand(G, side, cardId);
    if (activeSides(G).every(s => G.headlineDone[s])) resolveHeadline(G);
    return true;
  }

  function resolveHeadline(G) {
    const queue = [];
    turnOrder(G).forEach(s => { if (G.headline[s]) queue.push({ side: s, cid: G.headline[s] }); });
    G.headlineQueue = queue;
    G.headlineIndex = 0;
    log(G, '── 头条事件揭晓 ──', 'note');
    if (!queue.length) { beginActionPhase(G); return; }
    G.phase = 'headline_show';
  }

  function headlineStep(G) {
    if (G.over || G.phase !== 'headline_show') return;
    const q = G.headlineQueue || [];
    if (G.headlineIndex >= q.length) { beginActionPhase(G); return; }
    const it = q[G.headlineIndex++];
    const card = D.CARDS_BY_ID[it.cid];
    markReveal(G, it.cid, it.side, 'headline');
    log(G, `【头条】${NAME[it.side]}打出《${card.name}》：${card.desc}`, VP_CLS[it.side]);
    G.acting = it.side;
    G.discard.push(it.cid);
    const after = () => {
      if (G.over) return;
      if (G.headlineIndex >= q.length) beginActionPhase(G);
      else G.phase = 'headline_show';
    };
    runEffect(G, card, after);
  }

  function headlineCurrent(G) {
    if (G.phase !== 'headline_show') return null;
    const q = G.headlineQueue || [];
    if (G.pending || G.headlineIndex >= q.length) return null;
    return q[G.headlineIndex];
  }

  function beginActionPhase(G) {
    if (G.over) return;
    G.phase = 'action';
    G.current = turnOrder(G)[0];
    G.ar = 1;
    log(G, `── 行动轮 1/${G.arMax}：${NAME[turnOrder(G)[0]]}先手 ──`, 'note');
  }

  function endActionRound(G, side) {
    if (G.over) return;
    G.ops = null;
    const order = turnOrder(G);
    const i = order.indexOf(side);
    const next = order[(i + 1) % order.length];
    if (next === order[0]) {
      G.ar++;
      if (G.ar > G.arMax) { endTurn(G); return; }
      log(G, `── 行动轮 ${G.ar}/${G.arMax} ──`, 'note');
    }
    G.current = next;
  }

  function canAct(G, side) {
    return !G.over && G.phase === 'action' && G.current === side && !G.ops && !G.pending;
  }

  function markReveal(G, cid, side, kind) {
    G.revealSeq = (G.revealSeq || 0) + 1;
    G.reveal = { cid, side, kind, seq: G.revealSeq };
  }

  function playEvent(G, side, cardId) {
    if (!canAct(G, side)) return false;
    const card = D.CARDS_BY_ID[cardId];
    if (!card || card.score || card.side !== side) return false;
    removeFromHand(G, side, cardId);
    G.acting = side;
    markReveal(G, cardId, side, 'event');
    log(G, `${NAME[side]}打出《${card.name}》并发动事件：${card.desc}`, VP_CLS[side]);
    G.discard.push(cardId);

    if (side === 'cn' && D.CN_POINT.eventGain) addCnPoints(G, D.CN_POINT.eventGain, `打出《${card.name}》`);
    runEffect(G, card, () => endActionRound(G, side));
    return true;
  }

  function startOps(G, side, cardId, opType) {
    if (!canAct(G, side)) return false;
    const card = D.CARDS_BY_ID[cardId];
    if (!card || !card.ops || card.score) return false;
    if (['influence', 'coup', 'realign'].indexOf(opType) < 0) return false;
    removeFromHand(G, side, cardId);
    G.acting = side;
    const OPS_CN = { influence: '放置影响力', coup: '发动政变', realign: '重新结盟' };
    const begin = () => {
      if (G.over) return;
      if (opType === 'coup' && G.defcon <= 2) {
        log(G, `DEFCON 已降至 ${G.defcon}，政变无法执行，本行动轮作废`, 'warn');
        endActionRound(G, side);
        return;
      }
      G.ops = { side, cardId, opType, remaining: card.ops };
      log(G, `${NAME[side]}打出《${card.name}》使用行动点（${card.ops}）进行${OPS_CN[opType]}`, VP_CLS[side]);
      if (opType === 'influence' && card.ops <= 0) endOps(G);
    };
    if (card.side !== side) {
      markReveal(G, cardId, card.side, 'trigger');
      log(G, `⚠ 这是${NAME[card.side]}的牌《${card.name}》：事件将先为${NAME[card.side]}触发 —— ${card.desc || ''}`, 'warn');
      G.discard.push(cardId);
      runEffect(G, card, begin);
    } else {
      G.discard.push(cardId);
      begin();
    }
    return true;
  }

  function playSpace(G, side, cardId) {
    if (!canAct(G, side)) return false;
    const card = D.CARDS_BY_ID[cardId];
    if (!card || !card.ops || card.score) return false;
    removeFromHand(G, side, cardId);
    G.acting = side;
    G.discard.push(cardId);
    log(G, `${NAME[side]}打出《${card.name}》投入太空竞赛（不触发事件）`, VP_CLS[side]);
    attemptSpace(G, side, card.ops);
    endActionRound(G, side);
    return true;
  }

  function playScoring(G, side, cardId) {
    if (!canAct(G, side)) return false;
    const card = D.CARDS_BY_ID[cardId];
    if (!card || !card.score) return false;
    removeFromHand(G, side, cardId);
    G.removed.push(cardId);
    G.acting = side;
    log(G, `${NAME[side]}打出《${card.name}》`, VP_CLS[side]);
    G.lastScore = scoreRegion(G, card.score);
    if (!G.over) endActionRound(G, side);
    return true;
  }

  function attemptSpace(G, side, opsVal) {
    const idx = G.space[side];
    if (idx >= 8) { log(G, `${NAME[side]}已完成全部太空任务`, 'note'); return false; }
    const req = D.SPACE_REQ[idx];
    if (opsVal < req) { log(G, `行动点不足：第 ${idx + 1} 格需要 ${req} 点`, 'warn'); return false; }
    if (G.spaceFail[side] === idx) { log(G, `${NAME[side]}本回合已在第 ${idx + 1} 格失败，无法重试`, 'warn'); return false; }
    const roll = d6(G);
    const ok = roll + opsVal >= req + 4;
    log(G, `🚀 ${NAME[side]}太空竞赛第 ${idx + 1} 格：1d6=${roll} + ${opsVal} = ${roll + opsVal}（需 >= ${req + 4}）`, 'space');
    if (ok) {
      G.space[side]++;
      vpFor(G, side, D.SPACE_VP[idx], 'space');
      log(G, `成功！推进到第 ${G.space[side]} 格，+${D.SPACE_VP[idx]} VP`, 'good');
      checkVictory(G);
    } else {
      G.spaceFail[side] = idx;
      log(G, '失败，本回合不能再次尝试这一格', 'bad');
    }
    return ok;
  }

  function influenceCost(G, cid, side) {
    const base = (controlledByAny(G, cid) && !controls(G, cid, side)) ? 2 : 1;
    return base + cnTax(G, cid, side);
  }





  function isVacantForSuperpowers(G, cid) {
    return G.infl[cid].us === 0 && G.infl[cid].ussr === 0;
  }
  function cnTax(G, cid, side) {
    if (side !== 'us' && side !== 'ussr') return 0;
    if (!G.cnPoints || G.cnPoints <= 0) return 0;
    if (!isVacantForSuperpowers(G, cid)) return 0;



    const reg = CO[cid] && CO[cid].region;
    if (!reg || D.THIRD_WORLD.indexOf(reg) < 0) return 0;
    return Math.min(D.CN_POINT.taxMax, G.cnPoints);
  }
  function cnPoints(G) { return G.cnPoints || 0; }
  function addCnPoints(G, n, why) {
    if (!n) return;
    const cap = D.CN_POINT.cap;
    const before = cnPoints(G);
    G.cnPoints = Math.max(0, Math.min(cap, before + n));
    const got = G.cnPoints - before;
    if (got > 0) log(G, `◇ 中国点数 +${got}（${why}）→ ${G.cnPoints}/${cap}`, 'us');
    else if (before >= cap) log(G, `◇ 中国点数已达上限 ${cap}`, 'note');
  }
  function spendCnPoints(G, n, why) {
    if (!n) return 0;
    const before = cnPoints(G);
    G.cnPoints = Math.max(0, before - n);
    const used = before - G.cnPoints;
    if (used > 0) log(G, `◇ 中国点数 −${used}（${why}）→ ${G.cnPoints}/${D.CN_POINT.cap}`, 'su');
    return used;
  }

  function opsPlaceInfluence(G, cid) {
    const o = G.ops;
    if (!o || o.opType !== 'influence') return { ok: false, msg: '当前不是放置影响力阶段' };
    if (!canTarget(G, o.side, cid)) {
      return { ok: false, msg: `${NAME[o.side]}只能在中东、非洲、亚洲行动，不能进入该地区` };
    }
    const cost = influenceCost(G, cid, o.side);
    if (o.remaining < cost) {
      const tax = cnTax(G, cid, o.side);
      return { ok: false, msg: tax > 0
        ? `行动点不足（需要 ${cost} 点：基础 ${cost - tax} + 中国点数压力 ${tax}）`
        : `行动点不足（需要 ${cost} 点）` };
    }
    const tax = cnTax(G, cid, o.side);
    o.remaining -= cost;
    addInfl(G, cid, o.side, 1);
    log(G, `${NAME[o.side]}在${CO[cid].name}放置 1 点影响力（花费 ${cost} 点，剩余 ${o.remaining}）`, VP_CLS[o.side]);
    if (tax > 0) spendCnPoints(G, tax, `${NAME[o.side]}硬闯空余国家 ${CO[cid].name}`);
    if (o.remaining <= 0) endOps(G);
    return { ok: true };
  }

  function opsCoup(G, cid) {
    const o = G.ops;
    if (!o || o.opType !== 'coup') return { ok: false, msg: '当前不是政变阶段' };
    if (!canTarget(G, o.side, cid)) {
      return { ok: false, msg: `${NAME[o.side]}的行动范围不含该地区` };
    }
    const c = CO[cid];
    if (G.defcon <= 2) {
      return { ok: false, msg: c.bg
        ? 'DEFCON 2 时不得在战场国发动政变'
        : '该政变会把 DEFCON 压到 1，引发核战争（你将直接判负）' };
    }
    const opsVal = o.remaining;
    const roll = d6(G);
    const res = roll + opsVal - 2 * c.stab;
    log(G, `💥 ${NAME[o.side]}在${c.name}发动政变：1d6=${roll} + ${opsVal} - 2×${c.stab} = ${res}`, 'war');
    if (res > 0) {
      const target = maxRival(G, cid, o.side).who;
      let removed = 0;
      if (target) {
        removed = rmInfl(G, cid, target, res);
        if (removed) log(G, `移除 ${removed} 点${NAME[target]}影响力`);
      }
      const extra = res - removed;
      if (extra > 0) { addInfl(G, cid, o.side, extra); log(G, `${NAME[o.side]}在${c.name} +${extra} 影响力`); }
    } else {
      log(G, '政变失败，无影响力变化', 'note');
    }
    milOps(G, o.side, opsVal);
    log(G, `${NAME[o.side]}军力行动 +${opsVal}（累计 ${G.mil[o.side]}）`, 'note');
    defcon(G, -1);
    if (G.over) return { ok: true };
    endActionRound(G, o.side);
    return { ok: true };
  }

  function realignBonus(G, cid, side) {
    let n = 0;
    CO[cid].adj.forEach(a => {
      if (a === 'us' || a === 'ussr') { if (a === side) n++; }
      else if (CO[a] && controls(G, a, side)) n++;
    });
    if (CO[cid][D.SIDE_FLAG[side]]) n++;
    return n;
  }

  function opsRealign(G, cid) {
    const o = G.ops;
    if (!o || o.opType !== 'realign') return { ok: false, msg: '当前不是重新结盟阶段' };
    if (!canTarget(G, o.side, cid)) {
      return { ok: false, msg: `${NAME[o.side]}的行动范围不含该地区` };
    }
    if (o.remaining < 1) return { ok: false, msg: '行动点不足' };
    const me = o.side;
    const rMe = d6(G);
    const bMe = realignBonus(G, cid, me);
    const tMe = rMe + bMe;
    const rolls = others(me).map(s => {
      const r = d6(G), b = realignBonus(G, cid, s);
      return { side: s, r, b, t: r + b };
    });
    rolls.sort((a, b) => b.t - a.t);
    const top = rolls[0];
    o.remaining--;
    log(G, `🔄 ${CO[cid].name}重新结盟：${NAME[me]} 1d6=${rMe}+${bMe}=${tMe} vs ` +
      rolls.map(x => `${NAME[x.side]} 1d6=${x.r}+${x.b}=${x.t}`).join(' vs '), 'note');
    if (tMe > top.t) shiftInfluence(G, cid, me, tMe - top.t);
    else if (top.t > tMe) shiftInfluence(G, cid, top.side, top.t - tMe);
    else log(G, '平局，无变化', 'note');
    if (o.remaining <= 0) endOps(G);
    return { ok: true };
  }

  function shiftInfluence(G, cid, winner, diff) {
    const cand = otherActive(G, winner).map(s => ({ s, v: G.infl[cid][s] })).sort((a, b) => b.v - a.v)[0];
    let removed = 0;
    if (cand && cand.v > 0) removed = rmInfl(G, cid, cand.s, diff);
    const extra = diff - removed;
    if (extra > 0) addInfl(G, cid, winner, extra);
    log(G, `${NAME[winner]}在${CO[cid].name} 移除 ${removed} 点对方影响力${extra > 0 ? `，并 +${extra}` : ''}`, VP_CLS[winner]);
  }

  function forcePass(G, side) {
    if (!canAct(G, side)) return false;
    log(G, `${NAME[side]}没有可打出的牌，跳过本次行动轮`, 'warn');
    endActionRound(G, side);
    return true;
  }

  function endOps(G) {
    const o = G.ops;
    if (!o) return;
    const side = o.side;
    if (o.remaining > 0) log(G, `${NAME[side]}放弃剩余 ${o.remaining} 点行动点`, 'note');
    G.ops = null;
    if (!G.over) endActionRound(G, side);
  }

  function endTurn(G) {
    if (G.over) return;
    G.ops = null;
    G.phase = 'endturn';
    log(G, `── 第 ${G.turn} 回合结束 ──`, 'note');

    for (const s of activeSides(G)) {
      const sc = G.hands[s].filter(id => D.CARDS_BY_ID[id].score);
      sc.slice().forEach(id => {
        const card = D.CARDS_BY_ID[id];
        removeFromHand(G, s, id);
        G.removed.push(id);
        log(G, `⏳ ${NAME[s]}未能打出《${card.name}》，回合结束时自动结算`, 'warn');
        scoreRegion(G, card.score);
      });
    }
    if (G.over) return;
    if (checkVictory(G)) return;

    for (const s of activeSides(G)) {
      const gap = Math.min(3, Math.max(0, G.defcon - G.mil[s]));
      if (gap > 0) {


        const rest = otherActive(G, s);
        if (!rest.length) continue;
        const each = rest.length === 1 ? gap : Math.max(1, Math.round(gap / 2));
        rest.forEach(o => {
          vpFor(G, o, each, 'mil');
          log(G, `${NAME[s]}军力行动不足（${G.mil[s]}/${G.defcon}），${NAME[o]} +${each} VP`, s === 'us' ? 'bad' : 'good');
        });
      }
    }
    if (checkVictory(G)) return;

    if (G.defcon < 5) { G.defcon++; log(G, `DEFCON 缓和至 ${G.defcon}`, 'good'); }

    if (D.CN_POINT.decay > 0 && cnPoints(G) > 0) {
      spendCnPoints(G, D.CN_POINT.decay, '回合结束自然消散');
    }
    G.turn++;
    if (G.turn > G.maxTurns) {
      const act = activeSides(G);
      let top = -Infinity;
      for (const s of act) top = Math.max(top, netOf(G, s));
      const tied = act.filter(s => netOf(G, s) === top);
      const txt = tied.map(s => `${NAME[s]} ${top > 0 ? '+' : ''}${top}`).join('、');
      const ruleCn = G.rule && G.rule.cn;

      const chinaOnly = tied.length === 1 && tied[0] === 'cn' && ruleCn && ruleCn.fastWin === false;
      if (tied.length > 1) gameOver(G, null, `第 ${G.maxTurns} 回合结束，${txt}，平局`);
      else if (chinaOnly) gameOver(G, 'cn', `第 ${G.maxTurns} 回合结束，两个超级大国都没能吃下对方，${NAME.cn}以 ${top > 0 ? '+' : ''}${top} 领先`);
      else gameOver(G, tied[0], `第 ${G.maxTurns} 回合结束，${NAME[tied[0]]}以 ${top > 0 ? '+' : ''}${top} VP 领先`);
      return;
    }
    beginTurn(G);
  }

  global.CWRules = {
    SIDES, NAME, ERA_NAME, TURN_ORDER, VICTORY_VP,
    rng, d6, shuffle, log, others, netOf, leader, bestOf, maxRival, inDeck,
    activeSides, otherActive, turnOrder, sideRegions, canTarget,
    cnPoints, addCnPoints, spendCnPoints, cnTax, isVacantForSuperpowers, abilityNeedsTarget,
    newGame, beginTurn, endTurn, beginActionPhase, endActionRound,
    submitHeadline, resolveHeadline, headlineStep, headlineCurrent,
    playEvent, startOps, playSpace, playScoring,
    abilityTargets, canAbility, useAbility,
    opsPlaceInfluence, opsCoup, opsRealign, endOps, forcePass,
    runEffect, makeHelpers,
    influenceCost, realignBonus, attemptSpace,
    scoreRegion, regionScore, checkVictory, gameOver,
    controls, controller, controlledByAny, infl, addInfl, setInfl, rmInfl,
    vpFor, milOps, defcon, advanceSpace,
    resolvePending, isAI, humanSides, eraForTurn, eraCards,
    drawCard, drawFor, ownCount, removeFromHand, refillHands, markReveal
  };
})(typeof window !== 'undefined' ? window : globalThis);
