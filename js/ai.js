(function (global) {
  'use strict';

  const D = global.CWData;
  const CO = D.BY_ID;
  const R = () => global.CWRules;
  const SIDES = D.SIDES;
  const TURN_ORDER = D.TURN_ORDER;
  const NAME = D.SIDE_NAME;

  const OPS_W = 1.9;
  const DIFF = 0;

  if (typeof process !== 'undefined' && process.env && process.env.CW_DEBUG) global.CW_DEBUG = true;
  function dbg(...a) { if (global.CW_DEBUG) console.error(...a); }

  const NO_CHINA = !!(typeof process !== 'undefined' && process.env && process.env.CW_NO_CHINA);

  function others(side) { return SIDES.filter(s => s !== side); }
  function maxRivalV(G, cid, side) {
    let v = 0;
    for (const s of others(side)) if (G.infl[cid][s] > v) v = G.infl[cid][s];
    return v;
  }

  function clone(G) {
    const infl = {};
    for (const k in G.infl) infl[k] = { us: G.infl[k].us, ussr: G.infl[k].ussr, cn: G.infl[k].cn };
    return {
      seed: G.seed, rngState: G.rngState,
      turn: G.turn, maxTurns: G.maxTurns, short: G.short,
      deckId: G.deckId, sets: (G.sets || []).slice(),
      chinaMode: G.chinaMode, rule: G.rule, idle: G.idle, ability: G.ability,
      human: { us: false, ussr: false, cn: false },
      ai: { us: true, ussr: true, cn: true },
      viewSide: G.viewSide, hotseat: false, tutorial: false,
      era: G.era, phase: G.phase, current: G.current, ar: G.ar, arMax: G.arMax,
      vp: { us: G.vp.us, ussr: G.vp.ussr, cn: G.vp.cn },
      defcon: G.defcon,
      mil: { us: G.mil.us, ussr: G.mil.ussr, cn: G.mil.cn },
      space: { us: G.space.us, ussr: G.space.ussr, cn: G.space.cn },
      spaceFail: { us: G.spaceFail.us, ussr: G.spaceFail.ussr, cn: G.spaceFail.cn },
      abilityUsed: { us: G.abilityUsed.us, ussr: G.abilityUsed.ussr, cn: G.abilityUsed.cn },
      infl,
      hands: { us: G.hands.us.slice(), ussr: G.hands.ussr.slice(), cn: G.hands.cn.slice() },
      deck: G.deck.slice(), discard: G.discard.slice(), removed: G.removed.slice(),
      headline: { us: G.headline.us, ussr: G.headline.ussr, cn: G.headline.cn },
      headlineDone: { us: G.headlineDone.us, ussr: G.headlineDone.ussr, cn: G.headlineDone.cn },
      headlineQueue: [], headlineIndex: 0,
      ops: G.ops ? { side: G.ops.side, cardId: G.ops.cardId, opType: G.ops.opType, remaining: G.ops.remaining } : null,
      pending: null, acting: G.acting, log: [],
      over: G.over, winner: G.winner, reason: G.reason, lastScore: null,
      reveal: null, revealSeq: 0, vpSrc: { us: {}, ussr: {}, cn: {} }
    };
  }

  const DEFCON_PEN = { 5: 0, 4: 1.5, 3: 6, 2: 20, 1: 900 };

  function evaluate(G, side) {
    if (G.over) return G.winner === side ? 900 : (G.winner ? -900 : 0);
    const Rl = R();
    const rest = others(side);
    let v = Rl.netOf(G, side) * 2.0;
    for (const r of D.REGIONS) {
      const mine = Rl.regionScore(G, r.id, side).score;
      let bestOpp = 0;
      for (const o of rest) bestOpp = Math.max(bestOpp, Rl.regionScore(G, r.id, o).score);
      v += (mine - bestOpp) * 1.0;
    }
    let bestSpace = 0;
    for (const o of rest) bestSpace = Math.max(bestSpace, G.space[o]);
    v += G.space[side] * 0.45 - bestSpace * 0.3;
    v -= Math.max(0, G.defcon - G.mil[side]) * 1.6;
    v -= DEFCON_PEN[G.defcon] || 0;
    if (G.abilityUsed && !G.abilityUsed[side]) v += 1.2;
    let inf = 0, bgs = 0;
    for (const c of D.COUNTRIES) {
      inf += G.infl[c.id][side];
      if (c.bg && Rl.controls(G, c.id, side)) bgs++;
    }
    v += inf * 0.04 + bgs * 0.35;
    return v;
  }

  function simProbe(G, side, fn) {
    let c2;
    try { c2 = clone(G); fn(c2); }
    catch (e) {
      if (global.CW_DEBUG) console.error('SIM ERROR:', e && e.message, '\n', e && e.stack);
      return { delta: -1e6, c2: null };
    }
    if (c2.pending) return { delta: 0, c2: null };
    return { delta: evaluate(c2, side) - evaluate(G, side), c2 };
  }
  function simDelta(G, side, fn) { return simProbe(G, side, fn).delta; }

  function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

  function countryValue(G, cid, side) {
    const c = CO[cid];
    const Rl = R();
    const me = G.infl[cid][side], th = maxRivalV(G, cid, side);
    const need = c.stab;
    let v = c.bg ? 5 : 2.2;
    if (me - th >= need) v -= 3.5;
    else {
      const after = me + 1 - th;
      if (after >= need) v += 9;
      else if (after === need - 1) v += 5;
      else v += 2.6;
    }
    if (th - me >= need) v += 4;
    let hasPresence = false;
    for (const x of D.REGION_COUNTRIES[c.region]) if (G.infl[x][side] > 0) { hasPresence = true; break; }
    if (!hasPresence) v += 5;
    if (th > 0) v += 1.0;
    v += c.adj.length * 0.12;
    if (c[D.SIDE_FLAG[side]]) v += 0.8;

    let adjCtrl = 0;
    for (const a of c.adj) if (CO[a] && Rl.controls(G, a, side)) adjCtrl++;
    v += adjCtrl * 0.2;
    v += ((hash(cid) + G.turn * 7) % 10) / 10 * (DIFF ? 0.4 : 1.0);
    return v;
  }

  function pickCountries(G, side, spec, count) {
    const Rl = R();
    const from = spec.from.filter(cid => !Rl.canTarget || Rl.canTarget(G, side, cid));
    return (from.length ? from : spec.from)
      .map(cid => ({ cid, v: countryValue(G, cid, side) }))
      .sort((a, b) => b.v - a.v)
      .slice(0, count)
      .map(x => x.cid);
  }

  function chooseHeadline(G, side) {
    let best = null, bestV = 0.6;
    for (const id of G.hands[side]) {
      const card = D.CARDS_BY_ID[id];
      if (card.score || !card.effect || card.side !== side) continue;
      const d = simDelta(G, side, c => { c.acting = side; R().runEffect(c, card, () => {}); });
      if (d > bestV) { bestV = d; best = id; }
    }
    R().submitHeadline(G, side, best);
  }

  function bestCoup(G, side, ops, handRisky) {
    if (G.defcon <= 2) return null;
    if (G.defcon === 3 && handRisky) return null;
    const Rl = R();
    let best = null, bestV = -Infinity;
    for (const c of D.COUNTRIES) {
      if (Rl.canTarget && !Rl.canTarget(G, side, c.id)) continue;
      const oi = maxRivalV(G, c.id, side);
      const res = 3.5 + ops - 2 * c.stab;
      if (res <= 0) continue;


      const removed = Math.min(res, oi);
      const extra = Math.max(0, res - oi);
      let v = removed * 1.0 + extra * 1.3 + (c.bg ? 1.4 : 0);
      const need = Math.max(0, G.defcon - G.mil[side]);
      v += Math.min(ops, need) * 2.2;
      v -= (DEFCON_PEN[G.defcon - 1] - DEFCON_PEN[G.defcon]) * 0.6;
      if (oi <= 0) v -= 1.2;
      if (v > bestV) { bestV = v; best = c.id; }
    }
    return bestV > ops * OPS_W + 0.5 ? { cid: best, v: bestV } : null;
  }

  function handHasDefconRisk(G, side) {
    const Rl = R();
    for (const id of G.hands[side]) {
      const card = D.CARDS_BY_ID[id];
      if (!card.effect || card.score || card.side === side) continue;
      const p = simProbe(G, side, c => { c.acting = side; Rl.runEffect(c, card, () => {}); });
      if (p.c2 && p.c2.defcon < G.defcon) return true;
    }
    return false;
  }


  function bestAbilityTarget(G, side) {
    const Rl = R();
    const list = Rl.abilityTargets(G, side);
    let best = null, bestV = -Infinity;
    for (const cid of list) {
      const v = countryValue(G, cid, side);
      if (v > bestV) { bestV = v; best = cid; }
    }
    return { cid: best, v: bestV };
  }

  function planAction(G, side) {
    const Rl = R();
    const cands = [];
    const hand = G.hands[side].slice();
    const handRisky = handHasDefconRisk(G, side);

    for (const id of hand) {
      const card = D.CARDS_BY_ID[id];
      if (card.score) {
        const d = simDelta(G, side, c => Rl.playScoring(c, side, id));
        cands.push({ kind: 'score', cardId: id, value: d + 3.0, detail: card.name });
        continue;
      }
      const foreign = card.side !== side;
      let badDelta = 0, urgency = 0, fatal = false;
      if (foreign) {
        const p = simProbe(G, side, c => { c.acting = side; Rl.runEffect(c, card, () => {}); });
        badDelta = p.delta;

        if (p.c2 && (p.c2.over || p.c2.defcon <= 1) && p.c2.winner !== side) fatal = true;
        if (badDelta <= -800) fatal = true;
        if (p.c2 && p.c2.defcon < G.defcon) {
          const drop = G.defcon - p.c2.defcon;
          const futureCost = DEFCON_PEN[Math.max(1, G.defcon - 1)] - DEFCON_PEN[G.defcon];
          const forced = (G.hands[side].length <= 2 || G.defcon <= 3) ? 1.8 : 0.5;
          urgency = Math.min(30, drop * futureCost * forced);
        }
      }
      if (card.side === side) {
        const d = simDelta(G, side, c => Rl.playEvent(c, side, id));
        cands.push({ kind: 'event', cardId: id, value: d, detail: card.name + '（事件）' });
      }
      if (card.ops) {
        const riskVal = foreign ? badDelta + urgency : 0;
        const ban = fatal ? -1e6 : 0;
        cands.push({ kind: 'ops', opType: 'influence', cardId: id, value: ban + card.ops * OPS_W + riskVal, detail: card.name + '（影响力）' });
        cands.push({ kind: 'ops', opType: 'realign', cardId: id, value: ban + card.ops * 0.95 + riskVal, detail: card.name + '（重新结盟）' });

        const bc = bestCoup(G, side, card.ops, handRisky);
        if (bc) cands.push({ kind: 'ops', opType: 'coup', cardId: id, value: ban + bc.v + riskVal, detail: card.name + '（政变）' });

        const idx = G.space[side];
        if (idx < 8 && card.ops >= D.SPACE_REQ[idx] && G.spaceFail[side] !== idx) {
          const k = D.SPACE_REQ[idx] + 4 - card.ops;
          const p = Math.max(0, Math.min(1, (7 - k) / 6));
          let v = p * D.SPACE_VP[idx] * 2 - 0.8;

          if (foreign) v += Math.max(0, -badDelta);
          cands.push({ kind: 'space', cardId: id, value: v, detail: card.name + '（太空）' });
        }
      }
    }

    if (!NO_CHINA && Rl.canAbility(G, side)) {
      const bt = bestAbilityTarget(G, side);
      if (bt.cid && bt.v > 2.0) {
        cands.push({ kind: 'ability', cardId: null, cid: bt.cid, value: 2.4 + bt.v * 0.25, detail: D.ABILITIES[side].name });
      }
    }

    if (!cands.length) {
      const sc = hand.filter(id => D.CARDS_BY_ID[id].score);
      if (sc.length) {
        let best = sc[0], bv = -Infinity;
        for (const id of sc) {
          const d = simDelta(G, side, c => Rl.playScoring(c, side, id));
          if (d > bv) { bv = d; best = id; }
        }
        Rl.playScoring(G, side, best);
        return;
      }
      Rl.forcePass(G, side);
      return;
    }
    cands.sort((a, b) => b.value - a.value);
    const pick = cands[0];

    if (pick.value <= -800) {
      dbg(`[AI ${side}] 全部候选都是自杀选项，选择跳过行动轮`);
      Rl.forcePass(G, side);
      return;
    }
    if (pick.value < -50 || (cands[1] && cands[0].value - cands[1].value < 0.3)) {
      dbg(`[AI ${side}] 手牌 ${hand.map(id => D.CARDS_BY_ID[id].name).join('/')}`);
      cands.slice(0, 6).forEach(c => dbg(`    ${c.value.toFixed(1).padStart(8)}  ${c.kind}/${c.opType || ''} ${c.detail}`));
    }

    if (pick.kind === 'score') Rl.playScoring(G, side, pick.cardId);
    else if (pick.kind === 'event') Rl.playEvent(G, side, pick.cardId);
    else if (pick.kind === 'ability') Rl.useAbility(G, side, pick.cid);
    else if (pick.kind === 'space') Rl.playSpace(G, side, pick.cardId);
    else Rl.startOps(G, side, pick.cardId, pick.opType);
  }

  function spendOneOp(G, side) {
    const Rl = R();
    const o = G.ops;
    if (!o) return false;
    const allow = cid => !Rl.canTarget || Rl.canTarget(G, side, cid);

    if (o.opType === 'coup') {
      const bc = bestCoup(G, side, o.remaining, handHasDefconRisk(G, side));
      if (bc && bc.cid) Rl.opsCoup(G, bc.cid);
      else { o.remaining = 0; Rl.endOps(G); }
      return true;
    }

    if (o.opType === 'realign') {
      let best = null, bestV = 1.0;
      for (const c of D.COUNTRIES) {
        if (!allow(c.id)) continue;
        if (maxRivalV(G, c.id, side) <= 0) continue;
        let bMe = 0, bTh = 0;
        for (const s of others(side)) bTh = Math.max(bTh, Rl.realignBonus(G, c.id, s));
        bMe = Rl.realignBonus(G, c.id, side);
        const v = (bMe - bTh) * 0.8 + (c.bg ? 1.0 : 0) + Math.min(maxRivalV(G, c.id, side), 2) * 0.5;
        if (v > bestV) { bestV = v; best = c.id; }
      }
      if (best && o.remaining > 0) Rl.opsRealign(G, best);
      else { o.remaining = 0; Rl.endOps(G); }
      return true;
    }

    let best = null, bestV = -Infinity;
    for (const c of D.COUNTRIES) {
      if (!allow(c.id)) continue;
      const cost = Rl.influenceCost(G, c.id, side);
      if (cost > o.remaining) continue;





      const toll = Rl.cnTax ? Rl.cnTax(G, c.id, side) : 0;
      const v = countryValue(G, c.id, side) - (cost - 1 - toll) * 1.0 - toll * 0.15;
      if (v > bestV) { bestV = v; best = c.id; }
    }
    if (best && bestV > 0.2) { Rl.opsPlaceInfluence(G, best); return true; }
    o.remaining = 0;
    Rl.endOps(G);
    return true;
  }

  function aiStep(G) {
    if (G.over) return false;
    if (G.pending) return false;
    const Rl = R();
    const order = Rl.turnOrder ? Rl.turnOrder(G) : TURN_ORDER;
    if (G.phase === 'headline') {
      for (const s of order) {
        if (G.ai[s] && !G.headlineDone[s]) { chooseHeadline(G, s); return true; }
      }
      return false;
    }
    if (G.phase === 'headline_show') { Rl.headlineStep(G); return true; }
    if (G.phase !== 'action') return false;
    const side = G.current;
    if (G.idle && G.idle[side]) return false;
    if (!G.ai[side]) return false;
    if (G.ops) {
      if (G.ops.side !== side) return false;
      return spendOneOp(G, side);
    }
    planAction(G, side);
    return true;
  }

  global.CWAI = {
    aiStep, evaluate, countryValue, pickCountries, clone, chooseHeadline,
    planAction, bestCoup, bestAbilityTarget, maxRivalV
  };
})(typeof window !== 'undefined' ? window : globalThis);
