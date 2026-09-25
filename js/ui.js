(function () {
  'use strict';

  const D = window.CWData;
  const R = window.CWRules;
  const AI = window.CWAI;
  const TUT = window.CWTutorial;
  const CO = D.BY_ID;
  const SIDES = D.SIDES;
  const TURN_ORDER = D.TURN_ORDER;
  const NAME = D.SIDE_NAME;
  const SIDE_CLS = D.SIDE_CLS;

  const UI = {
    G: null, sel: [], timer: null, logRendered: 0, overShown: false,

    seats: { us: true, ussr: false, cn: false },
    deck: 'std', startLen: 'std', speed: null, auto: false,

    viewer: 'us',
    hlKey: null, hlTimer: null, vpPrev: null, flashTimer: null,
    eraPrev: null, eraTimer: null, hoverCid: null, selCid: null, suppressClick: false,
    hoverNc: null, selNc: null, popSeq: 0, popTimer: null, popHide: null,
    abilityMode: false, tutorialOpen: true, tutorialRun: false, curtainFor: null, seed: undefined
  };

  function reportError(msg) {
    const d = document.documentElement;
    d.dataset.err = ((d.dataset.err || '') + ' | ' + msg).slice(0, 900);
    console.error(msg);
  }
  window.addEventListener('error', e => reportError('JS 错误: ' + (e.message || e.error)));
  window.addEventListener('unhandledrejection', e => reportError('未处理的 Promise 拒绝: ' + e.reason));

  const $ = id => document.getElementById(id);
  function mk(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt !== undefined) e.textContent = txt;
    return e;
  }

  function startGame() {
    if (UI.timer) { clearTimeout(UI.timer); UI.timer = null; }
    const humans = { us: false, ussr: false, cn: false };
    SIDES.forEach(s => { humans[s] = !!UI.seats[s]; });
    if (UI.deck === 'twin') humans.cn = false;
    if (!SIDES.some(s => humans[s])) humans.us = true;
    UI.G = R.newGame({
      humans,
      deck: UI.deck,
      short: UI.startLen === 'short',
      tutorial: !!UI.tutorialRun,
      seed: UI.seed === undefined ? (Math.random() * 1e9) | 0 : UI.seed
    });
    UI.viewer = R.humanSides(UI.G)[0] || 'us';
    UI.G.viewSide = UI.viewer;
    UI.sel = [];
    UI.logRendered = 0;
    UI.overShown = false;
    UI.vpPrev = null;
    UI.defconPrev = null;
    UI.popSeq = 0;
    UI.abilityMode = false;
    clearTimeout(UI.popTimer); clearTimeout(UI.popHide);
    $('eventpop').classList.add('hidden');
    $('eventpop').classList.remove('show');
    UI.hlKey = null;
    UI.eraPrev = null;
    clearTimeout(UI.hlTimer);
    $('headline').classList.add('hidden');
    $('log').innerHTML = '';
    $('startScreen').classList.add('hidden');
    menuPlay(false);
    $('turnMax').textContent = UI.G.maxTurns;
    if (UI.G.tutorial && TUT) { TUT.reset(); TUT.applyHand(UI.G); }
    if (TUT && !UI.G.tutorial) TUT.finish();
    UI.tutorialOpen = !!UI.G.tutorial;
    buildMap();
    renderAll();
    updateCurtain();
    renderTutorial();
    pump(500);
  }

  const NS = 'http://www.w3.org/2000/svg';
  const GEO = window.CWGeo;
  const NCG = (window.CWGeoNeutral && window.CWGeoNeutral.countries) || {};
  const VIEW_W = 2000, VIEW_H = 1000;

  const PAL = {
    us: '#3f7fd0', usDim: '#28598f', usLite: '#8fc0ea',
    su: '#c0392b', suDim: '#8a2f24', suLite: '#e8948a',
    cn: '#d8a13a', cnDim: '#8f6a20', cnLite: '#f0d79a',
    mid: '#7a68a0',
    neutral: '#2a3d4d', neutralLine: '#3a5568',
    region: { europe: '#4a86c8', asia: '#c9724a', mideast: '#c9a24a', africa: '#4f9d72', centam: '#c05f8a', southam: '#8f9bd8' }
  };

  const SIDE_COLOR = { us: PAL.us, ussr: PAL.su, cn: PAL.cn };

  const geoEls = Object.create(null);
  const labelEls = Object.create(null);
  const markEls = Object.create(null);
  const ncEls = Object.create(null);
  const ncLabelEls = Object.create(null);

  const HOME_CLS = { usa: 'home-us', rus: 'home-su' };

  const SU_KEYS = ['rus', 'ukr', 'blr', 'mda', 'ltu', 'lva', 'est',
                   'geo', 'arm', 'aze', 'kaz', 'uzb', 'tkm', 'kgz', 'tjk'];
  const SU_SET = Object.create(null);
  SU_KEYS.forEach(k => { SU_SET[k] = 1; });

  const NC_NAME = { rus: '苏联', usa: '美国', chn: '中国', gbr: '英国', deu: '德国', ussr: '苏联' };

  function ensureLayer(id, before) {
    let g = $(id);
    if (!g) {
      g = document.createElementNS(NS, 'g');
      g.setAttribute('id', id);
      before.parentNode.insertBefore(g, before);
    }
    return g;
  }
  const rowEls = Object.create(null);
  const REGION_BBOX = Object.create(null);
  const view = { k: 1, x: 0, y: 0 };
  let svgScale = 0.5;
  let mapMode = 'control';
  let showLabels = true, showNumbers = true;

  function pathPoints(d) {
    const out = [];
    const re = /(-?\d+(?:\.\d+)?)[ ,](-?\d+(?:\.\d+)?)/g;
    let m;
    while ((m = re.exec(d))) out.push([parseFloat(m[1]), parseFloat(m[2])]);
    return out;
  }

  let geoReady = false;

  function prepareGeoOne(g, radius, ratio) {
    const parts = g.d.split(/(?=M)/).map(s => s.trim()).filter(Boolean);
    const info = parts.map(p => {
      const pts = pathPoints(p);
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, sx = 0, sy = 0;
      for (let i = 0; i < pts.length; i++) {
        const q = pts[i];
        if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0];
        if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1];
        sx += q[0]; sy += q[1];
      }
      const n = pts.length || 1;
      return { p, area: Math.max(0, (x1 - x0) * (y1 - y0)), cx: sx / n, cy: sy / n, ok: pts.length > 0 };
    }).filter(o => o.ok);
    if (!info.length) return;
    info.sort((a, b) => b.area - a.area);
    const main = info[0];
    const keep = info.filter(o =>
      o === main || o.area >= main.area * ratio || Math.hypot(o.cx - main.cx, o.cy - main.cy) <= radius);
    if (keep.length !== parts.length) g.d = keep.map(o => o.p).join('');
    g.area = Math.max(1, main.area);
    if (g.label && Math.hypot(g.label[0] - main.cx, g.label[1] - main.cy) > radius + 20) g.label = [main.cx, main.cy];
  }

  function prepareGeo() {
    if (geoReady) return;
    geoReady = true;
    for (const cid in GEO.countries) {
      if (GEO.countries[cid] && GEO.countries[cid].d) prepareGeoOne(GEO.countries[cid], 300, 0.35);
    }
    const NC = window.CWGeoNeutral;
    if (NC && NC.countries) {
      for (const k in NC.countries) {
        if (NC.countries[k] && NC.countries[k].d) prepareGeoOne(NC.countries[k], 460, 0.10);
      }
    }
  }

  function bboxOf(cids) {
    const items = [];
    cids.forEach(cid => {
      const g = GEO && GEO.countries[cid];
      if (g && g.label) items.push({ cid, p: g.label });
    });
    if (!items.length) return { x0: 400, y0: 200, x1: 1600, y1: 800 };

    const med = arr => { const a = arr.slice().sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
    const mx = med(items.map(o => o.p[0])), my = med(items.map(o => o.p[1]));
    const dist = items.map(o => Math.hypot(o.p[0] - mx, o.p[1] - my));
    const sorted = dist.slice().sort((a, b) => a - b);
    const cut = Math.max((sorted[Math.floor(sorted.length * 0.8)] || 0) * 1.9, 55);
    const keep = items.filter((o, i) => dist[i] <= cut);

    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    keep.forEach(o => {
      pathPoints(GEO.countries[o.cid].d).forEach(pt => {
        if (pt[0] < x0) x0 = pt[0]; if (pt[0] > x1) x1 = pt[0];
        if (pt[1] < y0) y0 = pt[1]; if (pt[1] > y1) y1 = pt[1];
      });
    });
    if (!isFinite(x0)) return { x0: 400, y0: 200, x1: 1600, y1: 800 };
    return { x0, y0, x1, y1 };
  }

  function drawGraticule() {
    const host = $('geoLayer');
    if (!host || !host.parentNode) return;
    let g = $('grat');
    if (!g) {
      g = document.createElementNS(NS, 'g');
      g.setAttribute('id', 'grat');
      host.parentNode.insertBefore(g, host);
    }
    while (g.firstChild) g.removeChild(g.firstChild);
    const lon2x = lon => (lon + 180) / 360 * VIEW_W;

    const miller = lat => 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * lat * Math.PI / 180));
    const yTop = miller(84), yBot = miller(-58);
    const lat2y = lat => (yTop - miller(lat)) / (yTop - yBot) * VIEW_H;
    for (let lon = -180; lon <= 180; lon += 30) {
      const l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', lon2x(lon)); l.setAttribute('x2', lon2x(lon));
      l.setAttribute('y1', 0); l.setAttribute('y2', VIEW_H);
      l.setAttribute('class', 'grat-line');
      g.appendChild(l);
    }
    for (let lat = 60; lat >= -40; lat -= 20) {
      const l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', 0); l.setAttribute('x2', VIEW_W);
      l.setAttribute('y1', lat2y(lat)); l.setAttribute('y2', lat2y(lat));
      l.setAttribute('class', 'grat-line');
      g.appendChild(l);
    }
  }

  function buildMap() {
    const loading = $('mapLoading');
    if (!GEO || !GEO.countries) {
      if (loading) loading.textContent = '缺少 assets/geo.js —— 地图无法绘制';
      return;
    }
    if (loading) loading.classList.add('hidden');
    prepareGeo();
    drawGraticule();

    const layer = $('geoLayer'), labelLayer = $('labelLayer'), markLayer = $('markLayer');
    layer.innerHTML = ''; labelLayer.innerHTML = ''; markLayer.innerHTML = '';
    for (const k in geoEls) delete geoEls[k];
    for (const k in labelEls) delete labelEls[k];
    for (const k in markEls) delete markEls[k];
    for (const k in ncEls) delete ncEls[k];
    for (const k in ncLabelEls) delete ncLabelEls[k];

    const NC = window.CWGeoNeutral;
    const ncLayer = ensureLayer('ncLayer', layer);
    const ncLabelLayer = ensureLayer('ncLabelLayer', labelLayer);
    ncLayer.innerHTML = ''; ncLabelLayer.innerHTML = '';



    if (NC && NC.countries) {
      const promoted = D.PROMOTED || { chn: 'china' };
      for (const gid in promoted) {
        const cid = promoted[gid];
        const g0 = NC.countries[gid];
        if (!g0 || !g0.d || GEO.countries[cid]) continue;
        const meta = D.BY_ID[cid] || {};
        GEO.countries[cid] = {
          name: meta.name || g0.name || cid,
          d: g0.d,
          label: g0.label ? g0.label.slice() : null,
        };
        delete NC.countries[gid];
        delete NCG[gid];
      }
    }
    if (NC && NC.countries) {
      $('geoNeutral').setAttribute('d', '');

      let suD = '', suArea = 0, suLabel = null;
      SU_KEYS.forEach(k => {
        const g = NC.countries[k];
        if (!g || !g.d) return;
        suD += ' ' + g.d;
        suArea += g.area || 0;
        if (k === 'rus') suLabel = g.label;
      });
      if (suD) {
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('d', suD.trim());
        p.setAttribute('class', 'geo-nc home-su su-merged');
        p.dataset.ncid = 'ussr';
        ncLayer.appendChild(p);
        ncEls.ussr = p;
        NCG.ussr = { name: '苏联', label: suLabel || [1150, 200], area: suArea, d: suD.trim() };
        const t = document.createElementNS(NS, 'text');
        t.setAttribute('class', 'geo-label nc');
        t.setAttribute('text-anchor', 'middle');
        t.textContent = '苏联';
        ncLabelLayer.appendChild(t);
        ncLabelEls.ussr = t;
      }
      for (const k in NC.countries) {
        if (SU_SET[k] || k === 'ussr') continue;
        const g = NC.countries[k];
        if (!g || !g.d) continue;
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('d', g.d);
        p.setAttribute('class', 'geo-nc' + (HOME_CLS[k] ? ' ' + HOME_CLS[k] : ''));
        p.dataset.ncid = k;
        ncLayer.appendChild(p);
        ncEls[k] = p;
        const t = document.createElementNS(NS, 'text');
        t.setAttribute('class', 'geo-label nc');
        t.setAttribute('text-anchor', 'middle');
        t.textContent = NC_NAME[k] || g.name || k;
        ncLabelLayer.appendChild(t);
        ncLabelEls[k] = t;
      }
    } else {
      $('geoNeutral').setAttribute('d', (GEO.neutral && GEO.neutral.d) || '');
    }

    D.COUNTRIES.forEach(c => {
      const g = GEO.countries[c.id];
      if (!g || !g.d) return;

      if (g.area === undefined || !g.label) {
        const pts = pathPoints(g.d);
        if (pts.length) {
          let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, sx = 0, sy = 0;
          pts.forEach(pt => {
            if (pt[0] < x0) x0 = pt[0]; if (pt[0] > x1) x1 = pt[0];
            if (pt[1] < y0) y0 = pt[1]; if (pt[1] > y1) y1 = pt[1];
            sx += pt[0]; sy += pt[1];
          });
          if (g.area === undefined) g.area = Math.max(1, (x1 - x0) * (y1 - y0) * 0.34);
          if (!g.label) g.label = [sx / pts.length, sy / pts.length];
        }
      }
      if (!g.label) g.label = [VIEW_W / 2, VIEW_H / 2];
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', g.d);
      p.setAttribute('class', 'geo');
      p.dataset.cid = c.id;
      layer.appendChild(p);
      geoEls[c.id] = p;

      const t = document.createElementNS(NS, 'text');
      t.setAttribute('class', 'geo-label');
      t.setAttribute('text-anchor', 'middle');
      t.textContent = (c.bg ? '★' : '') + c.name;
      labelLayer.appendChild(t);
      labelEls[c.id] = t;

      const mu = document.createElementNS(NS, 'text');
      mu.setAttribute('class', 'geo-num us');
      mu.setAttribute('text-anchor', 'middle');
      mu.setAttribute('data-k', 'us');
      markLayer.appendChild(mu);
      const ms = document.createElementNS(NS, 'text');
      ms.setAttribute('class', 'geo-num su');
      ms.setAttribute('text-anchor', 'middle');
      ms.setAttribute('data-k', 'su');
      markLayer.appendChild(ms);
      const mc = document.createElementNS(NS, 'text');
      mc.setAttribute('class', 'geo-num cn');
      mc.setAttribute('text-anchor', 'middle');
      mc.setAttribute('data-k', 'cn');
      markLayer.appendChild(mc);
      markEls[c.id] = { us: mu, su: ms, cn: mc };
    });

    D.REGIONS.forEach(r => { REGION_BBOX[r.id] = bboxOf(D.REGION_COUNTRIES[r.id]); });
    buildRegionRows();
    measureScale();
    paintMap();

    requestAnimationFrame(() => { measureScale(); clampView(); applyView(); });
  }

  function mapRect() {
    const el = $('map');
    if (!el) return { width: 1000, height: 520, left: 0, top: 0 };
    const r = el.getBoundingClientRect();
    return { width: r.width || 1000, height: r.height || 520, left: r.left || 0, top: r.top || 0 };
  }

  function measureScale() {
    const r = mapRect();
    if (!r.width || !r.height) return;
    svgScale = Math.min(r.width / VIEW_W, r.height / VIEW_H);
  }

  function buildRegionRows() {
    const box = $('regions');
    box.innerHTML = '';
    D.REGIONS.forEach(r => {
      const row = mk('div', 'rrow ' + r.cls);
      row.dataset.region = r.id;
      const head = mk('div', 'rrow-head');
      head.appendChild(mk('span', 'rrow-name', r.name));
      const st = mk('span', 'rrow-stat');
      st.appendChild(mk('span', 'rs-us', '0'));
      st.appendChild(mk('span', 'rs-sep', '·'));
      st.appendChild(mk('span', 'rs-su', '0'));
      st.appendChild(mk('span', 'rs-sep', '·'));
      st.appendChild(mk('span', 'rs-cn', '0'));
      head.appendChild(st);
      row.appendChild(head);
      const bar = mk('div', 'rrow-bar');
      bar.appendChild(mk('i', 'rb-us'));
      bar.appendChild(mk('i', 'rb-su'));
      bar.appendChild(mk('i', 'rb-cn'));
      row.appendChild(bar);
      row.appendChild(mk('div', 'rrow-lv', ''));
      row.addEventListener('click', () => focusRegion(r.id));
      box.appendChild(row);
      rowEls[r.id] = row;
    });
  }

  const LEVEL_CN = { none: '无存在', presence: '存在', domination: '主导', control: '控制' };

  const SHORT_CN = { us: '美', ussr: '苏', cn: '中' };

  function paintRegions() {
    const G = UI.G;
    D.REGIONS.forEach(r => {
      const row = rowEls[r.id];
      if (!row) return;
      const sc = { us: R.regionScore(G, r.id, 'us'), ussr: R.regionScore(G, r.id, 'ussr'), cn: R.regionScore(G, r.id, 'cn') };
      row.querySelector('.rs-us').textContent = sc.us.score;
      row.querySelector('.rs-su').textContent = sc.ussr.score;
      row.querySelector('.rs-cn').textContent = sc.cn.score;
      const tot = sc.us.score + sc.ussr.score + sc.cn.score;
      SIDES.forEach(s => {
        const bar = row.querySelector('.rb-' + (s === 'us' ? 'us' : s === 'ussr' ? 'su' : 'cn'));
        if (bar) bar.style.width = tot ? (sc[s].score / tot * 100) + '%' : (100 / 3) + '%';
      });
      let top = 0;
      SIDES.forEach(s => { top = Math.max(top, sc[s].score); });
      SIDES.forEach(s => {
        row.classList.toggle('lead-' + (s === 'us' ? 'us' : s === 'ussr' ? 'su' : 'cn'), top > 0 && sc[s].score === top);
      });
      const lv = row.querySelector('.rrow-lv');
      lv.textContent = SIDES.map(s => `${SHORT_CN[s]} ${LEVEL_CN[sc[s].level]}`).join(' / ');
    });
  }

  function paintMap() {
    const G = UI.G;
    if (!G) return;
    const mode = inputMode();
    const o = G.ops;
    const choosing = G.pending && !R.isAI(G, G.pending.side);
    const ability = UI.abilityMode && R.abilityNeedsTarget(G.current) && R.canAbility(G, G.current);

    for (const cid in geoEls) {
      const el = geoEls[cid], c = CO[cid];
      const inf = G.infl[cid];
      const ctrlOf = {};
      SIDES.forEach(s => { ctrlOf[s] = R.controls(G, cid, s); });
      const ctrl = SIDES.filter(s => ctrlOf[s]);
      const top = SIDES.slice().sort((a, b) => inf[b] - inf[a]);
      const lead = top[0], leadV = inf[lead], secondV = inf[top[1]];
      const total = inf.us + inf.ussr + inf.cn;
      let fill = PAL.neutral, op = 0.85;
      if (mapMode === 'region') {
        fill = PAL.region[c.region] || PAL.neutral;
        op = 0.55;
      } else if (mapMode === 'influence') {
        if (total === 0) { fill = PAL.neutral; op = 0.85; }
        else { fill = SIDE_COLOR[lead]; op = 0.18 + 0.72 * Math.min(1, total / 5); }
      } else {
        if (ctrl.length === 1) { fill = SIDE_COLOR[ctrl[0]]; op = 1; }
        else if (ctrl.length > 1) { fill = PAL.mid; op = 1; }
        else if (leadV > secondV && leadV > 0) { fill = lead === 'us' ? PAL.usDim : lead === 'ussr' ? PAL.suDim : PAL.cnDim; op = 0.9; }
        else if (total > 0) { fill = PAL.mid; op = 0.9; }
        else { fill = PAL.neutral; op = 0.85; }
      }
      el.style.fill = fill;
      el.style.fillOpacity = String(op);
      el.classList.toggle('sel', UI.selCid === cid);
      el.classList.toggle('hot', UI.hoverCid === cid);
      el.classList.toggle('nb', !!nbSet[cid]);
      el.classList.toggle('bgc', !!c.bg);

      let act = false;
      let taxed = false;
      if (ability) act = R.abilityTargets(G, G.current).indexOf(cid) >= 0;
      else if (o) {
        taxed = R.cnTax(G, cid, o.side) > 0;
        if (o.opType === 'influence') act = R.influenceCost(G, cid, o.side) <= o.remaining;
        else if (o.opType === 'coup') act = G.defcon > 2;
        else if (o.opType === 'realign') act = o.remaining >= 1 && (R.maxRival(G, cid, o.side).v > 0 || G.infl[cid][o.side] > 0);
      } else if (choosing) act = G.pending.spec.from.indexOf(cid) >= 0;
      el.classList.toggle('act', act);
      el.classList.toggle('cant', (!!o || choosing || ability) && !act);

      el.classList.toggle('taxed', taxed);
    }
    paintRegions();
    layoutMapText();
    paintFactions();
  }



  function paintFactions() {
    const G = UI.G;
    const box = $('fcList');
    if (!box || !G) return;
    if (box.childElementCount !== SIDES.length) {
      box.innerHTML = '';
      SIDES.forEach(s => {
        const row = mk('div', 'fc-row ' + SIDE_CLS[s]);
        row.dataset.side = s;
        row.appendChild(mk('span', 'fc-side', NAME[s]));
        row.appendChild(mk('span', 'fc-name', (G.ability && G.ability[s] ? G.ability[s].name : D.ABILITIES[s].name)));
        row.appendChild(mk('span', 'fc-state', ''));
        row.title = G.ability && G.ability[s] ? G.ability[s].desc : D.ABILITIES[s].desc;


        row.addEventListener('click', () => {
          const g = UI.G;
          if (!g || g.over) return;
          if (!R.canAbility(g, s)) { sfx('deny'); toast(abilityDesc(g, s)); return; }
          if (g.current !== s || R.isAI(g, s) || UI.viewer !== s) {
            sfx('deny');
            toast('只能在' + NAME[s] + '自己的行动轮使用');
            return;
          }
          if (R.abilityNeedsTarget(s)) {
            UI.abilityMode = !UI.abilityMode;
          } else {

            R.useAbility(g, s);
            TUT && TUT.note('ability');
            UI.abilityMode = false;
          }
          sfx('click');
          renderAll();
        });
        box.appendChild(row);
      });
    }
    SIDES.forEach(s => {
      const row = box.querySelector('.fc-row[data-side="' + s + '"]');
      if (!row) return;
      const used = !!(G.abilityUsed && G.abilityUsed[s]);
      const mine = !G.over && G.phase === 'action' && G.current === s && !R.isAI(G, s) && UI.viewer === s;
      const can = mine && R.canAbility(G, s);
      const needsTarget = R.abilityNeedsTarget(s);
      row.classList.toggle('used', used);
      row.classList.toggle('ready', can);
      row.classList.toggle('mine', mine);
      row.querySelector('.fc-state').textContent = used
        ? '本回合已用'
        : (can ? (needsTarget && UI.abilityMode ? '选择目标…' : '可使用') : '未就绪');
      row.querySelector('.fc-state').title = abilityDesc(G, s);
    });
    paintCnPoints(G);
    const btn = $('btnAbility');
    if (btn) {
      const can = !G.over && G.phase === 'action' && !R.isAI(G, G.current) && UI.viewer === G.current && R.canAbility(G, G.current);
      const needsTarget = R.abilityNeedsTarget(G.current);
      btn.classList.toggle('hidden', !can);
      btn.classList.toggle('primary', needsTarget && UI.abilityMode);
      btn.textContent = needsTarget ? (UI.abilityMode ? '取消选择目标' : '阵营能力') : '发动不结盟运动';
    }
  }


  function abilityName(G, side) {
    const a = (G && G.ability && G.ability[side]) || D.ABILITIES[side];
    return a.name || '';
  }


  function abilityDesc(G, side) {
    const a = (G && G.ability && G.ability[side]) || D.ABILITIES[side];
    return a.desc || '';
  }


  function paintCnPoints(G) {
    const box = $('cnPoints');
    if (!box || !G) return;
    box.classList.remove('hidden');
    const cur = R.cnPoints(G);
    const cap = D.CN_POINT.cap;
    const dots = $('cnpDots');
    if (dots) {
      if (dots.childElementCount !== cap) {
        dots.innerHTML = '';
        for (let i = 0; i < cap; i++) dots.appendChild(mk('i', 'cnp-dot'));
      }
      [...dots.children].forEach((d, i) => d.classList.toggle('on', i < cur));
    }
    const val = $('cnpVal');
    if (val) val.textContent = cur + '/' + cap;
    const note = $('cnpNote');
    if (note) {
      const tax = Math.min(D.CN_POINT.taxMax, cur);
      const vacant = D.COUNTRIES.filter(c => R.isVacantForSuperpowers(G, c.id) && R.cnTax(G, c.id, 'us') > 0).length;
      note.textContent = tax > 0
        ? `美苏进入亚/非/中东的空余国家每点多花 ${tax} 行动点（当前可加价 ${vacant} 国）；美苏每多付 1 点这里 −1，回合结束再 −${D.CN_POINT.decay}`
        : `暂无压力。中国发动「不结盟运动」或打出自己事件牌即可积攒（当前可加价 ${vacant} 国）`;
      note.title = abilityDesc(G, 'cn');
    }
    box.classList.toggle('active', cur > 0);
  }

  function layoutMapText() {
    const G = UI.G;
    if (!G) return;
    const k = view.k * svgScale;
    if (!(k > 0)) return;
    const fs = 11 / k;
    const fsNum = 10 / k;
    const sw = 3.2 / k;
    const swNum = 2.8 / k;
    const placed = [];
    const order = D.COUNTRIES.slice().sort((a, b) =>
      ((GEO.countries[b.id] && GEO.countries[b.id].area) || 0) - ((GEO.countries[a.id] && GEO.countries[a.id].area) || 0));

    order.forEach(c => {
      const g = GEO.countries[c.id];
      const lb = labelEls[c.id], nm = markEls[c.id];
      if (!g || !lb) return;
      const screenArea = (g.area || 0) * k * k;
      const lx = g.label[0], ly = g.label[1];

      let show = showLabels && screenArea >= 260;
      if (show) {
        const w = lb.textContent.length * fs * 1.02, h = fs * 1.25;
        const r = { x0: lx - w / 2, y0: ly - h, x1: lx + w / 2, y1: ly + fs * 0.3 };
        for (let i = 0; i < placed.length; i++) {
          const q = placed[i];
          if (r.x0 < q.x1 && r.x1 > q.x0 && r.y0 < q.y1 && r.y1 > q.y0) { show = false; break; }
        }
        if (show) placed.push(r);
      }
      const hot = UI.hoverCid === c.id || UI.selCid === c.id;
      lb.classList.toggle('hidden', !(show || hot));
      lb.setAttribute('x', lx);
      lb.setAttribute('y', ly - fs * 0.3);
      lb.setAttribute('font-size', fs);
      lb.setAttribute('stroke-width', sw);

      const inf = G.infl[c.id];
      const showNum = showNumbers && (inf.us > 0 || inf.ussr > 0 || inf.cn > 0) && (screenArea >= 150 || hot);
      const ny = ly + fsNum * 1.15;
      const dx = fsNum * 0.95;
      [['us', inf.us, -dx], ['su', inf.ussr, 0], ['cn', inf.cn, dx]].forEach(pair => {
        const t = nm[pair[0]];
        if (!t) return;
        t.textContent = String(pair[1]);
        t.setAttribute('x', lx + pair[2]);
        t.setAttribute('y', ny);
        t.setAttribute('font-size', fsNum);
        t.setAttribute('stroke-width', swNum);
        t.classList.toggle('hidden', !(showNum && pair[1] > 0));
      });
    });

    const ncOrder = Object.keys(ncLabelEls).sort((a, b) => ((NCG[b] && NCG[b].area) || 0) - ((NCG[a] && NCG[a].area) || 0));
    ncOrder.forEach(key => {
      const g = NCG[key], lb = ncLabelEls[key];
      if (!g || !lb || !g.label) return;
      const screenArea = (g.area || 0) * k * k;
      const lx = g.label[0], ly = g.label[1];
      let show = showLabels && screenArea >= 760;
      if (show) {
        const w = lb.textContent.length * fs * 1.02, h = fs * 1.25;
        const r = { x0: lx - w / 2, y0: ly - h, x1: lx + w / 2, y1: ly + fs * 0.3 };
        for (let i = 0; i < placed.length; i++) {
          const q = placed[i];
          if (r.x0 < q.x1 && r.x1 > q.x0 && r.y0 < q.y1 && r.y1 > q.y0) { show = false; break; }
        }
        if (show) placed.push(r);
      }
      const hot = UI.hoverNc === key || UI.selNc === key;
      lb.classList.toggle('hidden', !(show || (hot && showLabels)));
      lb.setAttribute('x', lx);
      lb.setAttribute('y', ly);
      lb.setAttribute('font-size', fs);
      lb.setAttribute('stroke-width', sw);
    });
  }

  function visibleRect() {
    const r = mapRect();
    const s = Math.min(r.width / VIEW_W, r.height / VIEW_H) || 0.5;
    return { w: r.width / s, h: r.height / s, cx: VIEW_W / 2, cy: VIEW_H / 2 };
  }

  function clampView() {
    const v = visibleRect();
    view.k = Math.max(0.85, Math.min(60, view.k));

    const hw = v.w / 2 / view.k, hh = v.h / 2 / view.k;
    const cx = (v.cx - view.x) / view.k, cy = (v.cy - view.y) / view.k;
    let ncx = Math.max(Math.min(cx, VIEW_W + hw * 0.35), -hw * 0.35);
    let ncy = Math.max(Math.min(cy, VIEW_H + hh * 0.35), -hh * 0.35);
    if (view.k <= 1.02) { ncx = VIEW_W / 2; ncy = VIEW_H / 2; }
    view.x = v.cx - view.k * ncx;
    view.y = v.cy - view.k * ncy;
  }

  function applyView() {
    const root = $('mapRoot');
    if (!root) return;
    root.setAttribute('transform', 'translate(' + view.x.toFixed(2) + ' ' + view.y.toFixed(2) + ') scale(' + view.k.toFixed(4) + ')');
    document.querySelectorAll('#geoLayer .geo').forEach(p => {
      p.setAttribute('stroke-width', String(Math.max(0.25, 1.1 / view.k)));
    });
    $('geoNeutral').setAttribute('stroke-width', String(Math.max(0.2, 0.9 / view.k)));
    layoutMapText();
  }

  function focusBox(x0, y0, x1, y1, pad) {
    if (!isFinite(x0) || !isFinite(x1)) return;
    pad = pad === undefined ? 0.2 : pad;
    const v = visibleRect();
    const bw = Math.max(4, x1 - x0), bh = Math.max(4, y1 - y0);
    let k = Math.min(v.w / (bw * (1 + pad * 2)), v.h / (bh * (1 + pad * 2)));
    k = Math.max(0.85, Math.min(60, k));
    view.k = k;
    view.x = v.cx - k * ((x0 + x1) / 2);
    view.y = v.cy - k * ((y0 + y1) / 2);
    clampView();
    applyView();
  }
  function focusRegion(rid) {
    const b = REGION_BBOX[rid];
    if (b) focusBox(b.x0, b.y0, b.x1, b.y1, 0.14);
  }
  function resetView() { view.k = 1; view.x = 0; view.y = 0; applyView(); }

  function zoomAt(clientX, clientY, factor) {
    const el = $('map');
    const r = el.getBoundingClientRect();
    const s = Math.min(r.width / VIEW_W, r.height / VIEW_H);
    const vx = VIEW_W / 2 + (clientX - r.left - r.width / 2) / s;
    const vy = VIEW_H / 2 + (clientY - r.top - r.height / 2) / s;
    const wx = (vx - view.x) / view.k, wy = (vy - view.y) / view.k;
    view.k = Math.max(0.85, Math.min(60, view.k * factor));
    view.x = vx - view.k * wx;
    view.y = vy - view.k * wy;
    clampView();
    applyView();
  }

  const NC_NOTE = {
    usa: '美国本土 · 玩家老家。本作不在美苏本土放置影响力。',
    rus: '苏联本土 · 玩家老家。本作不在美苏本土放置影响力。',
    ussr: '苏联本土（15 个加盟共和国合并显示）· 玩家老家。本作不在美苏本土放置影响力。'
  };
  function updateNcInspector(key) {
    const box = $('inspector');
    const g = NCG[key];
    if (!g) {
      box.innerHTML = '<div class="ins-empty">把鼠标移到地图上的国家查看详情</div>';
      return;
    }
    box.innerHTML = '';
    const head = mk('div', 'ins-head');
    head.appendChild(mk('span', 'ins-name', NC_NAME[key] || g.name || key));
    head.appendChild(mk('span', 'ins-bg', '非战区'));
    box.appendChild(head);
    const note = NC_NOTE[key] || `不在本作的 ${D.COUNTRIES.length} 个可玩国家之列，无法放置影响力。`;
    box.appendChild(mk('div', 'ins-adj', note));
    box.appendChild(mk('div', 'ins-adj', `本作只覆盖 ${D.COUNTRIES.length} 个可玩国家；其余国家作为地图背景存在。`));
  }

  function setNcHover(key) {
    if (UI.hoverNc === key) return;
    const prev = UI.hoverNc;
    UI.hoverNc = key;
    if (prev && ncEls[prev]) ncEls[prev].classList.remove('hot');
    if (key && ncEls[key]) ncEls[key].classList.add('hot');
    layoutMapText();
    if (key) updateNcInspector(key);
  }

  let nbSet = Object.create(null);

  function setHover(cid) {
    if (UI.hoverCid === cid) return;
    const prev = UI.hoverCid;
    UI.hoverCid = cid;
    nbSet = neighborSet(cid);

    const touched = Object.create(null);
    if (prev) { touched[prev] = 1; CO[prev].adj.forEach(a => { if (geoEls[a]) touched[a] = 1; }); }
    if (cid) { touched[cid] = 1; CO[cid].adj.forEach(a => { if (geoEls[a]) touched[a] = 1; }); }
    for (const k in touched) {
      const el = geoEls[k];
      if (!el) continue;
      el.classList.toggle('hot', k === cid);
      el.classList.toggle('nb', !!nbSet[k]);
    }
    layoutMapText();
    updateInspector(cid);
  }

  function neighborSet(cid) {
    const s = Object.create(null);
    if (!cid) return s;
    CO[cid].adj.forEach(a => { if (geoEls[a]) s[a] = true; });
    return s;
  }

  function updateInspector(cid) {
    const box = $('inspector');
    const G = UI.G;
    if (!cid || !G) {
      box.innerHTML = '<div class="ins-empty">把鼠标移到地图上的国家查看详情</div>';
      return;
    }
    const c = CO[cid];
    const inf = G.infl[cid];
    const me = (G.ops && G.ops.side) || G.current;
    box.innerHTML = '';
    const head = mk('div', 'ins-head');
    head.appendChild(mk('span', 'ins-name', c.name));
    if (c.bg) head.appendChild(mk('span', 'ins-bg', '★战场国'));
    head.appendChild(mk('span', 'ins-reg', (D.REGIONS.find(r => r.id === c.region) || {}).name));
    if (G.tutorial && cid === 'china') head.appendChild(mk('span', 'ins-reg', '第三极'));
    box.appendChild(head);

    const grid = mk('div', 'ins-grid');
    const cell = (k, v, cls) => {
      const d = mk('div', 'ins-cell ' + (cls || ''));
      d.appendChild(mk('span', 'ins-k', k));
      d.appendChild(mk('b', 'ins-v', v));
      grid.appendChild(d);
    };
    cell('稳定度', c.stab);
    SIDES.forEach(s => {
      const ctrl = R.controls(G, cid, s);
      cell(NAME[s] + '影响力', inf[s] + (ctrl ? ' 控制' : ''), ctrl ? SIDE_CLS[s] : '');
    });
    cell('控制线', '差 &gt;= ' + c.stab);
    box.appendChild(grid);

    const nb = c.adj.map(a => CO[a] ? CO[a].name : a).filter(Boolean);
    box.appendChild(mk('div', 'ins-adj', '相邻：' + nb.join('、') + (c.us ? '　◆美国本土' : '') + (c.su ? '　◆苏联本土' : '') + (c.cn ? '　◆中国本土' : '')));

    if (UI.abilityMode && R.abilityNeedsTarget(G.current) && R.canAbility(G, G.current)) {
      const tip = mk('div', 'ins-tip');
      tip.textContent = R.abilityTargets(G, G.current).indexOf(cid) >= 0
        ? `点击发动《${abilityName(G, G.current)}》在此 +${(G.ability[G.current] || D.ABILITIES[G.current]).power || 1} 影响力（免费）`
        : '该能力只能用在「其他两方都没有影响力」的国家';
      box.appendChild(tip);
    } else if (G.ops && !G.pending && !R.isAI(G, G.ops.side)) {
      const tip = mk('div', 'ins-tip');
      if (G.ops.opType === 'influence') {
        const cost = R.influenceCost(G, cid, me);
        const tax = R.cnTax(G, cid, me);
        const base = cost - tax;
        tip.textContent = cost <= G.ops.remaining
          ? (tax > 0
            ? `点击放置 1 点影响力（花费 ${cost} = 基础 ${base} + 中国点数压力 ${tax}）`
            : `点击放置 1 点影响力（花费 ${cost}）`)
          : (tax > 0
            ? `行动点不足（需要 ${cost} = 基础 ${base} + 中国点数压力 ${tax}）`
            : `行动点不足（需要 ${cost}）`);
      } else if (G.ops.opType === 'coup') tip.textContent = '点击发动政变';
      else if (G.ops.opType === 'realign') tip.textContent = '点击重新结盟';
      box.appendChild(tip);
    }
  }

  const DEFCON_CLS = { 5: 'd5', 4: 'd4', 3: 'd3', 2: 'd2', 1: 'd1' };

  const DEFCON_WORD = { 5: '缓和', 4: '戒备', 3: '紧张', 2: '临战', 1: '核战边缘' };

  function buildDefconTrack() {
    const t = $('defconTrack');
    if (t.childElementCount) return;
    t.innerHTML = '';
    for (let i = 5; i >= 1; i--) {
      const d = mk('span', 'dc ' + DEFCON_CLS[i], String(i));
      if (i === 2) d.title = '不可在战场国发动政变';
      if (i === 1) d.title = '核战争：把 DEFCON 降到 1 的一方判负';
      t.appendChild(d);
    }
  }

  function updateTop() {
    const G = UI.G;
    $('turnNum').textContent = G.turn;
    $('turnMax').textContent = G.maxTurns;
    $('eraName').textContent = R.ERA_NAME[G.era] || '';
    $('arLabel').textContent = G.phase === 'action' ? `${G.ar} / ${G.arMax}` : `${G.arMax} 轮`;
    $('turnSide').textContent = G.over ? '—' : NAME[G.current];
    $('turnSideBox').className = 'tb-item' + (G.over ? '' : (G.current === 'us' ? ' on-us' : G.current === 'ussr' ? ' on-su' : ' on-cn'));

    [...$('defconTrack').children].forEach((d, i) => {
      const lvl = 5 - i;
      d.classList.toggle('on', lvl === G.defcon);
      d.classList.toggle('below', lvl < G.defcon);
    });

    paintVp3(G);
    SIDES.forEach(s => {
      const key = s === 'us' ? 'US' : s === 'ussr' ? 'SU' : 'CN';
      const el = $('mil' + key);
      if (el) { el.textContent = G.mil[s]; el.classList.toggle('short', G.mil[s] < G.defcon); }
      const sp = $('sp' + key);
      if (sp) sp.textContent = G.space[s];
    });

    $('defconBox').classList.toggle('alarm', G.defcon <= 2);
    $('defconBox').classList.toggle('warn', G.defcon === 3);
    $('crt').classList.toggle('alarm', G.defcon <= 2);
    $('dcStatus').textContent = DEFCON_WORD[G.defcon] || '';
    if (UI.defconPrev === null || UI.defconPrev === undefined) UI.defconPrev = G.defcon;
    if (G.defcon < UI.defconPrev) sfx('defcon');
    UI.defconPrev = G.defcon;
  }

  function netOf(side) {
    return UI.G ? R.netOf(UI.G, side) : 0;
  }


  function paintVp3(G) {
    const box = $('vp3');
    if (!box) return;
    if (box.childElementCount !== SIDES.length) {
      box.innerHTML = '';
      SIDES.forEach(s => {
        const row = mk('div', 'vp3-row ' + SIDE_CLS[s]);
        row.dataset.side = s;
        row.appendChild(mk('span', 'vp3-name', NAME[s]));
        const track = mk('div', 'vp3-track');
        track.appendChild(mk('i', 'vp3-mid'));
        track.appendChild(mk('i', 'vp3-bar'));
        const marker = mk('i', 'vp3-marker');
        track.appendChild(marker);
        row.appendChild(track);
        const val = mk('b', 'vp3-val', '0');
        row.appendChild(val);
        box.appendChild(row);
      });
    }
    box.classList.toggle('over', !!G.over);
    SIDES.forEach(s => {
      const row = box.querySelector('.vp3-row[data-side="' + s + '"]');
      if (!row) return;
      const net = R.netOf(G, s);
      const pct = Math.max(0, Math.min(100, ((net + D.VICTORY_VP) / (2 * D.VICTORY_VP)) * 100));
      const marker = row.querySelector('.vp3-marker');
      marker.style.left = pct + '%';
      row.querySelector('.vp3-val').textContent = (net > 0 ? '+' : '') + net;
      const bar = row.querySelector('.vp3-bar');
      bar.style.left = (net >= 0 ? 50 : pct) + '%';
      bar.style.width = Math.abs(pct - 50) + '%';
      row.classList.toggle('lead', R.netOf(G, s) >= VICTORY_VP);
      row.classList.toggle('turn', !G.over && G.current === s && G.phase === 'action');
    });
  }

  const VICTORY_VP = D.VICTORY_VP;

  function updatePlayers() {
    const G = UI.G;
    SIDES.forEach(s => {
      const key = s === 'us' ? 'US' : s === 'ussr' ? 'SU' : 'CN';
      let bg = 0, inf = 0;
      D.COUNTRIES.forEach(c => {
        inf += G.infl[c.id][s];
        if (c.bg && R.controls(G, c.id, s)) bg++;
      });
      const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
      set('bg' + key, bg);
      set('inf' + key, inf);
      set('sp' + key + '2', G.space[s] + '/8');
      set('handCount' + key, G.human[s] ? G.hands[s].length : '—');
    });
    $('power').className = 'act-' + (G.over ? 'none' : (G.current === 'us' ? 'us' : G.current === 'ussr' ? 'su' : 'cn')) +
      (G.phase === 'action' ? ' acting' : '');
  }


  function viewerSide() {
    const G = UI.G;
    if (!G) return 'us';
    if (!G.human[UI.viewer]) return R.humanSides(G)[0] || 'us';
    return UI.viewer;
  }

  function renderHand() {
    const G = UI.G;
    const box = $('hand');
    if (!box) return;
    box.innerHTML = '';
    const me = viewerSide();
    const mode = inputMode();
    const owner = $('handOwner');
    if (owner) {
      const multi = R.humanSides(G).length > 1;
      owner.className = 'hand-owner ' + SIDE_CLS[me];
      owner.textContent = (multi ? '当前设备操作方：' : '你执') + NAME[me] + (G.human[me] ? '' : '（电脑）');
      owner.classList.toggle('hidden', G.over);
    }
    G.hands[me].forEach(id => {
      const c = D.CARDS_BY_ID[id];
      const own = c.side === me || c.score;
      const b = mk('button', 'card ' + (c.score ? 'scoring' : 'c-' + (c.side === 'us' ? 'us' : c.side === 'ussr' ? 'su' : 'cn')) + (own ? ' own' : ' enemy'));
      b.dataset.card = id;
      b.type = 'button';
      const head = mk('span', 'card-head');
      head.appendChild(mk('span', 'card-name', c.name));
      head.appendChild(mk('span', 'card-ops', c.score ? '记分' : String(c.ops)));
      b.appendChild(head);
      const eraCode = { early: 'EARLY', mid: 'MID', late: 'LATE' }[c.era] || '';
      const tag = mk('span', 'card-tag', (c.score ? '记分牌' : (c.side === me ? '我方牌' : NAME[c.side] + '的牌')) + (eraCode ? ' · ' + eraCode : ''));
      b.appendChild(tag);
      b.appendChild(mk('span', 'card-desc', c.desc || `立即对${(D.REGIONS.find(r => r.id === c.score) || {}).name}进行记分结算`));
      if (mode === 'play' || mode === 'headline') b.classList.add('pickable');
      if (mode === 'headline' && c.score) b.classList.add('disabled');
      box.appendChild(b);
    });
    if (!G.hands[me].length) box.appendChild(mk('div', 'empty', '（无手牌）'));

    $('handHint').textContent =
      mode === 'play' ? (G.hands[me].length ? '点击卡牌出牌 · 右侧可用「阵营能力」' : '已无手牌 · 请点右侧「跳过行动轮」') :
      mode === 'headline' ? '点击卡牌作为头条（记分牌不可）' :
      mode === 'ability' ? '点击地图上的国家发动阵营能力' :
      '';
  }

  const LOG_CLS = { us: 'l-us', su: 'l-su', good: 'l-good', bad: 'l-bad', warn: 'l-warn', note: 'l-note', era: 'l-era', end: 'l-end', boom: 'l-end', score: 'l-score', war: 'l-war', space: 'l-space' };
  function renderLog() {
    const box = $('log'), G = UI.G;
    if (G.log.length < UI.logRendered) { box.innerHTML = ''; UI.logRendered = 0; }
    let sting = null;
    for (let i = UI.logRendered; i < G.log.length; i++) {
      const l = G.log[i];
      const d = mk('div', 'log-line ' + (LOG_CLS[l.cls] || ''), l.text);
      box.appendChild(d);
      if (l.cls === 'boom') sting = 'nuke';
      else if (l.cls === 'war' && sting !== 'nuke') sting = 'war';
      else if (l.cls === 'score' && !sting) sting = 'score';
    }
    UI.logRendered = G.log.length;
    box.scrollTop = box.scrollHeight;
    if (sting) sfx(sting);
  }

  function renderBanner() {
    const G = UI.G, b = $('banner'), m = inputMode();
    b.className = '';
    if (G.over) { b.classList.add('hidden'); return; }
    let txt = '', cls = 'info';
    const me = viewerSide();
    if (m === 'choice') {
      const spec = G.pending.spec;
      txt = `【${spec.title}】${spec.hint}　已选 ${UI.sel.length}/${spec.count}`;
      cls = 'choice';
    } else if (m === 'headline') {
      txt = `${NAME[me]}头条阶段：从手牌选一张牌作为头条事件（记分牌不可），或点击「跳过头条」。`;
      cls = 'headline';
    } else if (m === 'ability') {
      txt = `阵营能力《${abilityName(G, G.current)}》：点击地图上「其他两方都没有影响力」的国家，免费 +${(G.ability[G.current] || D.ABILITIES[G.current]).power} 影响力（不消耗行动点）。`;
      cls = 'act';
    } else if (m === 'influence') {
      txt = `放置影响力：剩余行动点 ${G.ops.remaining}。点击国家放置 1 点（被他人控制的国家需 2 点）。`;
      cls = 'act';
    } else if (m === 'coup') {
      txt = `发动政变：剩余行动点 ${G.ops.remaining}。点击目标国家（消耗全部剩余行动点、降低 DEFCON，并累积军力行动）。`;
      cls = 'act';
    } else if (m === 'realign') {
      txt = `重新结盟：剩余行动点 ${G.ops.remaining}。点击目标国家（每次消耗 1 点，与另外两方同时掷骰）。`;
      cls = 'act';
    } else if (m === 'play') {
      const hand = G.hands[me];
      if (hand.length) { txt = `${NAME[me]}的行动轮：点击手牌出牌。`; cls = 'info'; }
      else { txt = `${NAME[me]}已没有手牌 —— 点击「跳过行动轮」继续。`; cls = 'act'; }
    } else if (G.hotseat && G.human[G.current] && UI.viewer !== G.current) {
      txt = `等待把设备交给${NAME[G.current]}玩家…`;
      cls = 'wait';
    } else {
      txt = G.phase === 'headline' ? '头条阶段：等待其他方…' : `${NAME[G.current]}（电脑）正在行动…`;
      cls = 'wait';
    }
    b.textContent = txt;
    b.className = cls;

    $('btnEndOps').classList.toggle('hidden', !G.ops || !!G.ops && R.isAI(G, G.ops.side));
    $('btnSkipHeadline').classList.toggle('hidden', m !== 'headline');
    $('btnPass').classList.toggle('hidden', m !== 'play');
  }


  function inputMode() {
    const G = UI.G;
    if (!G || G.over) return 'none';
    if (G.pending) return R.isAI(G, G.pending.side) ? 'wait' : (UI.viewer === G.pending.side ? 'choice' : 'wait');
    if (G.phase === 'headline') {
      const s = nextHeadlineSide();
      if (!s) return 'wait';
      return UI.viewer === s ? 'headline' : 'wait';
    }
    if (G.phase !== 'action') return 'wait';
    if (G.hotseat && UI.viewer !== G.current) return 'wait';
    if (R.isAI(G, G.current)) return 'wait';
    if (UI.abilityMode && R.abilityNeedsTarget(G.current) && R.canAbility(G, G.current)) return 'ability';
    if (G.ops) return G.ops.opType;
    return 'play';
  }


  function nextHeadlineSide() {
    const G = UI.G;
    if (!G || G.phase !== 'headline') return null;
    return TURN_ORDER.find(s => G.human[s] && !G.headlineDone[s]) || null;
  }


  function pendingHumanSide() {
    const G = UI.G;
    if (!G || G.over) return null;
    if (G.pending) return R.isAI(G, G.pending.side) ? null : G.pending.side;
    if (G.phase === 'headline') return nextHeadlineSide();
    if (G.phase === 'action') return R.isAI(G, G.current) ? null : G.current;
    return null;
  }

  function onCountryClick(cid) {
    const G = UI.G, m = inputMode();
    UI.selCid = cid;
    if (m === 'ability') {
      const side = G.current;
      if (R.useAbility(G, side, cid)) {
        TUT && TUT.note('ability');
        UI.abilityMode = false;
        renderAll();
      } else {
        sfx('deny');
        toast('该能力只能用在「其他两方都没有影响力」的国家');
      }
      return;
    }
    if (m === 'choice') {
      const spec = G.pending.spec;
      if (spec.from.indexOf(cid) < 0) return;
      const i = UI.sel.indexOf(cid);
      if (i >= 0) UI.sel.splice(i, 1); else UI.sel.push(cid);
      if (UI.sel.length >= spec.count) {
        const ids = UI.sel.slice();
        UI.sel = [];
        R.resolvePending(G, ids);
        afterAction();
        return;
      }
      renderAll();
      return;
    }
    if (m === 'influence') {
      const r = R.opsPlaceInfluence(G, cid);
      if (!r.ok) { sfx('deny'); toast(r.msg); } else { TUT && TUT.note('influence'); sfx('place'); }
      afterAction();
      return;
    }
    if (m === 'coup') {
      const r = R.opsCoup(G, cid);
      if (!r.ok) { sfx('deny'); toast(r.msg); } else TUT && TUT.note('coup');
      afterAction();
      return;
    }
    if (m === 'realign') {
      const r = R.opsRealign(G, cid);
      if (!r.ok) { sfx('deny'); toast(r.msg); } else TUT && TUT.note('realign');
      afterAction();
      return;
    }
    updateInspector(cid);
    paintMap();
  }

  function onCardClick(cardId) {
    const G = UI.G, m = inputMode();
    const c = D.CARDS_BY_ID[cardId];
    if (m === 'headline') {
      if (c.score) { sfx('deny'); toast('记分牌不能作为头条事件'); return; }
      const side = nextHeadlineSide();
      confirmBox(`以《${c.name}》作为头条？`, `事件将立即为${NAME[c.side]}触发：${c.desc}`, () => {
        R.submitHeadline(G, side, cardId);
        TUT && TUT.note('headline');
        afterAction();
      });
      return;
    }
    if (m !== 'play') return;
    sfx('card');
    openCardModal(cardId);
  }

  function showModal(title, bodyNode, actions) {
    $('modalTitle').textContent = title;
    const body = $('modalBody');
    body.innerHTML = '';
    if (typeof bodyNode === 'string') body.innerHTML = bodyNode; else if (bodyNode) body.appendChild(bodyNode);
    const act = $('modalActions');
    act.innerHTML = '';
    (actions || []).forEach(a => {
      const b = mk('button', 'btn ' + (a.cls || ''), a.label);
      if (a.disabled) b.disabled = true;
      b.addEventListener('click', () => { if (a.keepOpen !== true) closeModal(); a.onClick && a.onClick(); });
      act.appendChild(b);
    });
    $('modal').classList.remove('hidden');
  }
  function closeModal() { $('modal').classList.add('hidden'); }

  function confirmBox(title, text, onYes) {
    showModal(title, `<p class="modal-text">${text}</p>`, [
      { label: '确定', cls: 'primary', onClick: onYes },
      { label: '取消', cls: 'ghost' }
    ]);
  }

  let toastTimer = null;
  function toast(msg) {
    let t = $('toast');
    if (!t) { t = mk('div', ''); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  function eventPreview(card) {
    const G = UI.G;
    try {
      const c2 = AI.clone(G);
      c2.acting = G.current;
      R.runEffect(c2, card, () => {});
      return { defcon: c2.defcon, lethal: c2.defcon <= 1 || (c2.over && c2.winner !== G.current) };
    } catch (e) { return null; }
  }

  function openCardModal(cardId) {
    const G = UI.G, me = G.current, card = D.CARDS_BY_ID[cardId];
    const body = mk('div', 'cardmodal');
    const row = mk('div', 'cm-row');
    row.appendChild(mk('span', 'cm-side ' + (card.score ? 'scoring' : SIDE_CLS[card.side]), card.score ? '记分牌' : NAME[card.side] + '事件牌'));
    if (!card.score) row.appendChild(mk('span', 'cm-ops', '行动点 ' + card.ops));
    body.appendChild(row);
    body.appendChild(mk('p', 'cm-desc', card.desc || `对${(D.REGIONS.find(r => r.id === card.score) || {}).name}进行记分结算`));

    if (!card.score && card.side !== me) {
      body.appendChild(mk('p', 'cm-warn', `⚠ 这是${NAME[card.side]}的牌：若用于行动点，将先为${NAME[card.side]}触发上述事件。`));
      const pv = eventPreview(card);
      if (pv && pv.lethal) body.appendChild(mk('p', 'cm-danger', '☢ 该事件会引发核战争 —— 你将立即判负！'));
      else if (pv && pv.defcon < G.defcon) body.appendChild(mk('p', 'cm-warn', `该事件会使 DEFCON 由 ${G.defcon} 降至 ${pv.defcon}。`));
    }
    if (card.side === me && !card.score) {
      const pv = eventPreview(card);
      if (pv && pv.lethal) body.appendChild(mk('p', 'cm-danger', '☢ 该事件会引发核战争 —— 你将立即判负！'));
    }

    const actions = [];
    if (card.score) {
      const rows = SIDES.map(s => `${NAME[s]} ${R.regionScore(G, card.score, s).score}（${LEVEL[R.regionScore(G, card.score, s).level]}）`);
      body.appendChild(mk('p', 'cm-note', '当前记分：' + rows.join(' / ')));
      actions.push({ label: '立即记分', cls: 'primary', onClick: () => { R.playScoring(G, me, cardId); TUT && TUT.note('score'); afterAction(); } });
    } else {
      if (card.side === me) {
        actions.push({ label: '打出事件', cls: 'primary', onClick: () => { R.playEvent(G, me, cardId); TUT && TUT.note('event'); afterAction(); } });
      } else {
        actions.push({ label: '打出事件（对方受益）', cls: 'ghost', disabled: true, onClick: () => {} });
      }
      actions.push({ label: '放置影响力', onClick: () => { R.startOps(G, me, cardId, 'influence'); afterAction(); } });
      if (G.defcon > 2) actions.push({ label: '发动政变', onClick: () => { R.startOps(G, me, cardId, 'coup'); afterAction(); } });
      actions.push({ label: '重新结盟', onClick: () => { R.startOps(G, me, cardId, 'realign'); afterAction(); } });
      const idx = G.space[me];
      const canSpace = idx < 8 && card.ops >= D.SPACE_REQ[idx] && G.spaceFail[me] !== idx;
      actions.push({ label: '太空竞赛', disabled: !canSpace, cls: canSpace ? '' : 'ghost', onClick: () => { R.playSpace(G, me, cardId); TUT && TUT.note('space'); afterAction(); } });
    }
    actions.push({ label: '取消', cls: 'ghost' });
    showModal('《' + card.name + '》', body, actions);
  }

  const LEVEL = { none: '无存在', presence: '存在', domination: '主导', control: '控制' };

  const RULES_HTML = `
  <div class="rules">
    <h4>目标</h4>
    <p>三个阵营：<b>美国</b>、<b>苏联</b>、<b>中国</b>。在 10 个回合（快局 6 回合）内把自己的<b>相对领先度</b>推到 <b>20 VP</b> 即立刻获胜。相对领先度 = 你的 VP − 另外两方中较高的那一个。回合用尽时领先者获胜。</p>
    <p>每回合三方各会得到若干 VP（事件、区域记分、太空竞赛、别人的军力行动亏欠）。<b>区域记分只有第一名拿分</b>：分数最高的一方获得「第一名 − 第二名」的差额。</p>

    <h4>开局</h4>
    <p>苏联在东欧与亚洲有大量影响力，美国在西欧与美洲有影响力，<b>中国只在亚洲有零星存在</b>（本土很稳，海外几乎没有）。三方初始 VP 都是 0。</p>

    <h4>回合流程</h4>
    <p><b>1. 头条阶段</b>：三方各秘密选一张手牌作为头条，随后同时揭晓，结算顺序为<b>苏联 → 美国 → 中国</b>。头条只结算事件，不使用行动点。记分牌不能作为头条。</p>
    <p><b>2. 行动轮</b>：顺序同为<b>苏联 → 美国 → 中国</b>，轮流行动，每人各有 6～8 个行动轮（随回合数增加）。轮到你时打出一张手牌：</p>
    <ul>
      <li><b>打出事件</b>：只有<b>自己的</b>事件牌才能主动打出。</li>
      <li><b>使用行动点</b>：用于 放置影响力 / 发动政变 / 重新结盟。<b>若这是别人的事件牌，事件会先为对方触发</b>，之后你才使用行动点。</li>
      <li><b>太空竞赛</b>：投入整张牌尝试推进，<b>不会触发事件</b>——这是处理危险牌的主要安全出口。</li>
      <li><b>记分牌</b>：立即结算该区域。回合结束时手上仍未打出的记分牌会被强制自动结算。</li>
    </ul>
    <p><b>3. 回合结束</b>：结算手中记分牌 → 军力行动检查 → DEFCON 缓和 1 级 → 补牌（每方优先拿到至少 2 张自己的事件牌）。</p>

    <h4>阵营能力（每回合一次，免费）</h4>
    <p>每方每回合可以发动一次阵营能力，<b>不消耗行动点、也不结束行动轮</b>。</p>
    <ul>
      <li><b>美国 · 自由世界广播</b>：在 1 个「其他两方都没有影响力」的国家 +1 美国影响力。</li>
      <li><b>苏联 · 国际共运</b>：在 1 个「其他两方都没有影响力」的国家 +1 苏联影响力。</li>
      <li><b>中国 · 不结盟运动</b>：<b>+${D.CN_POINT.abilityGain} 中国点数</b>（上限 ${D.CN_POINT.cap}，每回合结束自然 −${D.CN_POINT.decay}）。中国点数不占地，
        而是<b>抬高美苏进入空余国家的代价</b>。</li>
    </ul>

    <h4>中国点数（第三世界压力）</h4>
    <p>这是中国唯一的「攻击手段」：它不跟美苏抢地盘，而是让<b>美苏更难进入空余国家</b>。</p>
    <ul>
      <li><b>只在中国活动范围内生效</b>：亚洲、非洲、中东。欧洲与美洲的空余国家<b>照常计价</b>
      —— 不结盟运动的压力是第三世界的事，中国管不到那里。</li>
      <li><b>空余国家</b>：美国与苏联都还没有影响力的国家（中国自己有没有影响力不影响判定）。</li>
      <li>美苏在这些国家放置影响力时，<b>每点要多花最多 +${D.CN_POINT.taxMax} 行动点</b>（按中国当前点数）。</li>
      <li>美苏每多付 1 点，<b>中国点数就 −1</b>；每回合结束再自然 −${D.CN_POINT.decay}。所以压力会被一点点顶开，
        中国需要不断补点数。</li>
      <li>中国自己不受影响（放影响力照常 1 点）。被加价的国家在地图上会被描成<b>金色虚线</b>。</li>
    </ul>

    <h4>影响力与控制</h4>
    <p>放置 1 点影响力通常花费 1 点行动点；若目标国已被对方<b>控制</b>，则需 2 点。</p>
    <p><b>控制</b>：你的影响力 - 对方影响力 &gt;= 该国稳定度。</p>

    <h4>政变</h4>
    <p>消耗整张牌的行动点，对目标国掷骰：<code>1d6 + 行动点 - 2 × 稳定度</code>。结果为正时，先移除等量对方影响力，多余部分转为你的影响力。政变会让 <b>DEFCON 下降 1</b>，并为你的军力行动累积等于行动点的数值。</p>
    <p>DEFCON 2 时不能发动政变；任何会把 DEFCON 压到 1 的行动都会引发核战争，由<b>发起方</b>判负。</p>

    <h4>重新结盟</h4>
    <p>每消耗 1 点行动点，你与另外两方<b>同时</b>各掷 <code>1d6</code>，各自加上「相邻的己方控制国数量」与「与己方本土相邻 +1」。你的点数高于对方最高者时按差值转移影响力；否则由点数最高的那一方拿走差额。</p>

    <h4>区域记分</h4>
    <p>每个区域三方各算一次分：<code>存在 1 + 战场国数 + 控制国数 ÷ 3 向下取整 + 主导/控制加成</code>。</p>
    <ul>
      <li><b>存在</b>：在该区域至少有 1 点影响力，否则得 0 分。</li>
      <li><b>主导</b>（+1）：控制的战场国多于其他任何一方，且控制国总数也最多。</li>
      <li><b>控制</b>（+3）：控制了该区域<b>全部</b>战场国。</li>
    </ul>
    <p>分数最高的一方获得与第二名的差额 VP。</p>

    <h4>军力行动</h4>
    <p>每回合结束时要满足「军力行动 &gt;= 当前 DEFCON」，否则差额 VP 由另外两方分走（每方约得一半；两方对局时全额）。政变是累积军力行动的主要方式，也可以对<b>没有对方影响力</b>的国家发动政变来单纯凑军力行动。每回合开始时军力行动清零。</p>

    <h4>太空竞赛</h4>
    <p>共 8 格，每格有行动点下限（1,1,2,2,3,3,4,4）。掷 <code>1d6 + 行动点 &gt;= 下限 + 4</code> 即成功，获得 VP，并立即结束本行动轮。同一回合不能重复尝试失败的格子。</p>

    <h4>中国：第三世界领袖</h4>
    <p>冷战里中国不是与美苏对等的超级大国，所以它<b>玩的不是同一盘棋</b>：</p>
    <ul>
      <li><b>行动范围只到中东、非洲、亚洲</b>：中国不能在欧洲与美洲放置影响力、发动政变或重新结盟
        （它的历史事件也只影响自己的势力范围）。</li>
      <li><b>没有速胜手段</b>：中国不能靠 20 VP 取胜，也不能靠控制欧洲全部战场国取胜。
        它只有一条胜利路径 —— 把两个超级大国都拖到终局，并在终局领先。</li>
      <li><b>它的技能是「不结盟运动」</b>：积攒中国点数，抬高美苏进入空余国家的行动点花费。</li>
      <li>中国每打出一张<b>自己的</b>事件牌，也会 +1 中国点数。</li>
    </ul>
    <p>换句话说：美苏在争夺世界，中国在<b>让世界变得更贵</b>。</p>

    <h4>同机多人</h4>
    <p>在主菜单把两个或三个座位设成「玩家」，即可在一台电脑上轮流操作。轮到别人时会出现遮屏提示，请把设备交给对方 —— 遮屏是礼仪性的，不是防作弊。</p>

    <h4>立刻获胜</h4>
    <ul>
      <li>美苏：相对领先度达到 20 VP，或控制欧洲<b>全部</b>战场国。</li>
      <li>中国：<b>没有速胜手段</b>，只能在第 10 回合结束时以最高相对领先度取胜（美苏都没能吃下对方）。</li>
      <li>别人把 DEFCON 压到 1 时，你在另外两方中 VP 较高即获胜。</li>
    </ul>
  </div>`;

  function showRules() {
    const d = mk('div');
    d.innerHTML = RULES_HTML;
    showModal('规则说明', d, [{ label: '知道了', cls: 'primary' }]);
  }

  const VP_SRC_CN = {
    score: '区域记分', event: '事件与卡牌', mil: '军力行动亏欠',
    space: '太空竞赛', china: '中国相关', eventFor: '触发他人事件'
  };

  function showVpBreak() {
    const G = UI.G;
    const d = mk('div');
    const head = mk('div', 'ci-row');
    head.appendChild(mk('span', '', '阵营'));
    head.appendChild(mk('b', 'vpos', 'VP 合计'));
    head.appendChild(mk('b', 'vneg', '相对领先'));
    d.appendChild(head);
    SIDES.forEach(s => {
      const row = mk('div', 'ci-row');
      row.appendChild(mk('span', '', NAME[s]));
      row.appendChild(mk('b', 'vpos', String(G.vp[s])));
      const net = R.netOf(G, s);
      row.appendChild(mk('b', net > 0 ? 'vpos' : net < 0 ? 'vneg' : '', (net > 0 ? '+' : '') + net));
      d.appendChild(row);
      const keys = Object.keys(G.vpSrc[s]);
      if (!keys.length) { d.appendChild(mk('div', 'ci-sub', '暂无得分记录')); return; }
      keys.sort((a, b) => G.vpSrc[s][b] - G.vpSrc[s][a]).forEach(k => {
        d.appendChild(mk('div', 'ci-sub', `${VP_SRC_CN[k] || k}：+${G.vpSrc[s][k]}`));
      });
    });
    d.appendChild(mk('div', 'ci-sub', '相对领先 = 自己的 VP − 另外两方中较高的那一个；达到 20 即获胜。'));
    showModal('胜利点来源', d, [{ label: '关闭', cls: 'ghost' }]);
  }

  function showGameOver() {
    if (UI.overShown) return;
    UI.overShown = true;
    const G = UI.G;
    const mine = R.humanSides(G);
    const win = !!(G.winner && mine.indexOf(G.winner) >= 0);
    sfx(win ? 'win' : 'lose');

    if (G.winner) musicApply('victory_' + G.winner);
    const d = mk('div');
    d.appendChild(mk('p', 'go-title ' + (G.winner ? SIDE_CLS[G.winner] : ''), G.winner ? NAME[G.winner] + '胜利' : '平局'));
    d.appendChild(mk('p', 'go-reason', G.reason));
    const tbl = mk('div', 'ci-row');
    tbl.appendChild(mk('span', '', '最终 VP'));
    tbl.appendChild(mk('b', '', SIDES.map(s => `${NAME[s]} ${G.vp[s]}`).join('　')));
    d.appendChild(tbl);
    const net = mk('div', 'ci-row');
    net.appendChild(mk('span', '', '相对领先'));
    net.appendChild(mk('b', '', SIDES.map(s => { const v = R.netOf(G, s); return `${NAME[s]} ${v > 0 ? '+' : ''}${v}`; }).join('　')));
    d.appendChild(net);
    const row = mk('div', 'ci-row');
    row.appendChild(mk('span', '', mine.length > 1 ? '本机战绩' : '你的战绩'));
    row.appendChild(mk('b', win ? 'vpos' : 'vneg', win ? '胜利' : (G.winner ? '失败' : '平局')));
    d.appendChild(row);
    showModal('核边缘 · 落幕', d, [
      { label: '再来一局', cls: 'primary', onClick: () => { closeModal(); showMenu(); } },
      { label: '查看棋盘', cls: 'ghost' }
    ]);
  }

  const HL_AUTO_MS = 7000;

  function photoFor(card) {
    const P = window.CWPhotos;
    if (P) {

      const entry = card.score
        ? (P.regions && P.regions[card.score])
        : (P.cards && P.cards[card.id]);
      return (entry && entry.file) ? entry : null;
    }

    const fileId = card.score ? ('region_' + card.score) : card.id;
    return { file: fileId + '.jpg', caption: '', license: '', artist: '' };
  }

  function showPosterFallback(card) {
    const img = $('hlImg'), poster = $('hlPoster');
    if (img) { img.classList.add('hidden'); img.removeAttribute('src'); }
    if (poster) { poster.classList.remove('hidden'); $('hlPosterName').textContent = card.name; }
  }

  function renderHeadlineOverlay() {
    const ov = $('headline');
    if (!ov) return;
    const G = UI.G;
    const it = G ? R.headlineCurrent(G) : null;
    if (!it || G.over) {
      if (UI.hlKey !== null) { ov.classList.add('hidden'); UI.hlKey = null; }
      clearTimeout(UI.hlTimer); UI.hlTimer = null;
      return;
    }
    const key = G.headlineIndex + '|' + it.cid;
    if (key === UI.hlKey) return;
    UI.hlKey = key;

    const card = D.CARDS_BY_ID[it.cid];
    const frame = $('hlFrame');
    frame.className = 'hl-frame ' + (card.score ? 'scoring' : SIDE_CLS[card.side]);
    $('hlFlag').textContent = NAME[it.side];
    $('hlVs').textContent = card.score ? '区域记分' : (NAME[it.side] + ' 头条事件');
    $('hlName').textContent = card.name;
    $('hlOps').textContent = card.score ? '立即记分' : ('行动点 ' + card.ops);
    $('hlEra').textContent = R.ERA_NAME[card.era] || '';
    $('hlDesc').textContent = card.desc || `立即对${(D.REGIONS.find(r => r.id === card.score) || {}).name}进行记分结算`;
    $('hlStamp').textContent = card.score ? '记分' : '绝密';

    const ph = photoFor(card);
    const img = $('hlImg'), poster = $('hlPoster');
    img.onerror = () => showPosterFallback(card);
    if (ph && ph.file) {
      img.classList.remove('hidden');
      poster.classList.add('hidden');
      img.src = 'assets/photos/' + ph.file;
      img.alt = card.name;
      $('hlCaption').textContent = ph.caption || '';
      const bits = [];
      if (ph.license) bits.push(ph.license);
      if (ph.artist) bits.push(ph.artist);
      bits.push('Wikimedia Commons');
      $('hlCredit').textContent = bits.join(' · ');
    } else {
      showPosterFallback(card);
      $('hlCaption').textContent = '';
      $('hlCredit').textContent = '';
    }

    ov.classList.remove('hidden');

    musicApply('headline_' + it.side);
    sfx(it.side === 'us' ? 'headline' : it.side === 'ussr' ? 'headlineSu' : 'headlineCn');
    clearTimeout(UI.hlTimer);
    UI.hlTimer = setTimeout(headlineAdvance, UI.speed === 0 ? 30 : HL_AUTO_MS);
  }

  function headlineAdvance() {
    clearTimeout(UI.hlTimer); UI.hlTimer = null;
    const G = UI.G;
    if (!G || G.over || G.phase !== 'headline_show') return;
    const ov = $('headline');
    if (ov) ov.classList.add('hidden');
    UI.hlKey = null;
    R.headlineStep(G);
    renderAll();
    if (G.over) { showGameOver(); if (UI.auto) finishAuto(); return; }
    pump(240);
  }

  function needsAI(G) {
    if (!G || G.over) return false;
    if (G.pending) return false;
    if (G.phase === 'headline_show') return false;
    if (G.phase === 'headline') return TURN_ORDER.some(s => G.ai[s] && !G.headlineDone[s]);
    if (G.phase === 'action') return !!G.ai[G.current];
    return false;
  }


  function updateCurtain() {
    const G = UI.G;
    const el = $('curtain');
    if (!el) return;
    const hide = () => {
      if (UI.curtainFor !== null || !el.classList.contains('hidden')) {
        el.classList.add('hidden');
        UI.curtainFor = null;
      }
    };
    if (!G || G.over || !G.hotseat) { hide(); return; }
    const s = pendingHumanSide();
    if (!s || UI.viewer === s) { hide(); return; }
    if (UI.curtainFor !== s) {
      UI.curtainFor = s;
      $('curtainSide').textContent = NAME[s];
      $('curtainSide').className = 'curtain-side ' + SIDE_CLS[s];
      const others = R.humanSides(G).filter(x => x !== s).map(x => NAME[x]).join('、');
      $('curtainText').textContent = `请把设备交给${NAME[s]}玩家。${others ? others + '请不要偷看手牌。' : ''}`;
      $('curtainFoot').textContent = `本局共 ${R.humanSides(G).length} 位玩家在同一台电脑上轮流操作 · 回合 ${G.turn} · ${G.phase === 'headline' ? '头条阶段' : '行动轮 ' + G.ar + '/' + G.arMax}`;
    }
    el.classList.remove('hidden');
  }

  function renderTutorial() {
    const G = UI.G;
    const box = $('tutorial');
    if (!box) return;
    const on = !!(G && G.tutorial && TUT && TUT.active() && UI.tutorialOpen);
    const btn = $('btnTutorialToggle');
    if (btn) btn.classList.toggle('hidden', !(G && G.tutorial));
    if (!on) { box.classList.add('hidden'); clearTutorialHighlight(); return; }
    box.classList.remove('hidden');
    const s = TUT.step();
    if (!s) { box.classList.add('hidden'); return; }
    $('tutProg').textContent = (TUT.index() + 1) + '/' + TUT.count();
    $('tutTitle').textContent = s.title;
    $('tutBody').innerHTML = s.body;
    $('tutTip').innerHTML = s.tip ? '👉 ' + s.tip : '';
    const done = TUT.reached(G);
    const act = $('tutActions');
    act.innerHTML = '';
    const back = mk('button', 'btn ghost', '上一步');
    back.disabled = TUT.index() === 0;
    back.addEventListener('click', () => { TUT.prev(); renderTutorial(); });
    act.appendChild(back);
    const nextBtn = mk('button', 'btn ' + (done ? 'primary' : ''), done ? '已完成，继续 ▶' : '跳过本步 ▶');
    nextBtn.addEventListener('click', () => {
      if (!TUT.next()) { UI.tutorialOpen = false; toast('教程结束，接着自由对局吧'); }
      sfx('tutorial');
      renderTutorial();
    });
    act.appendChild(nextBtn);
    if (TUT.index() === 0) nextBtn.textContent = '开始 ▶';
    else if (TUT.index() === TUT.count() - 1) nextBtn.textContent = '结束教程 ▶';
    setTutorialHighlight(s.target);
  }

  let tutHlEl = null;
  function clearTutorialHighlight() {
    if (tutHlEl) { tutHlEl.classList.remove('tut-hl'); tutHlEl = null; }
  }
  function setTutorialHighlight(target) {
    clearTutorialHighlight();
    if (!target) return;
    const el = $(target);
    if (!el) return;
    el.classList.add('tut-hl');
    tutHlEl = el;
  }





  function runAIBatch(limit) {
    const G = UI.G;
    if (!G) return 0;
    const cap = limit || 96;
    let steps = 0;
    while (!G.over && needsAI(G) && steps < cap) {
      let ok = false;
      try { ok = AI.aiStep(G); }
      catch (e) { console.error(e); reportError('AI 异常: ' + e.message); break; }
      steps++;
      if (!ok && !needsAI(G)) break;
    }
    return steps;
  }

  function scheduleAI(delay) {
    if (UI.timer) return;
    UI.timer = setTimeout(() => {
      UI.timer = null;
      const G = UI.G;
      if (!G || G.over) { renderAll(); if (G && G.over) { showGameOver(); if (UI.auto) finishAuto(); } return; }
      const steps = runAIBatch();
      renderAll();
      if (G.over) { showGameOver(); if (UI.auto) finishAuto(); return; }

      if (needsAI(G)) scheduleAI(steps ? 90 : 150);
    }, delay === undefined ? 380 : delay);
  }

  function delayOf(d) { return UI.speed === null ? d : UI.speed; }

  function pump(delay) {
    renderAll();
    const G = UI.G;
    if (!G) return;
    if (G.over) { showGameOver(); if (UI.auto) finishAuto(); return; }
    if (needsAI(G)) scheduleAI(delayOf(delay));
  }

  function afterAction() {
    renderAll();
    const G = UI.G;
    if (!G) return;
    if (G.over) { showGameOver(); if (UI.auto) finishAuto(); return; }
    if (needsAI(G)) scheduleAI(delayOf(360));
  }

  function finishAuto() {
    const G = UI.G;
    document.title = 'CW_DONE winner=' + (G.winner || 'draw') +
      ' vp=' + SIDES.map(s => s + ':' + G.vp[s]).join(',') +
      ' net=' + SIDES.map(s => s + ':' + R.netOf(G, s)).join(',') +
      ' turn=' + G.turn + ' log=' + G.log.length;
  }

  const MUSIC = {
    tracks: (window.CWMusic && window.CWMusic.tracks) || [],
    el: null, pool: [], idx: 0, mood: null, muted: false, usingProc: false, dead: false,

    pos: Object.create(null),
  };

  const MENU = { clips: (window.CWVideo && window.CWVideo.clips) || [], idx: 0, el: null, shots: [], sIdx: 0, timer: null, front: 'A' };

  const MENU_SCENERY = [
    'iron_curtain', 'europe', 'asia', 'mideast',
    'suez_crisis', 'sputnik', 'marshall_plan', 'berlin_airlift',
    'taiwan_strait', 'norad', 'arab_oil', 'missile_gap',
    'afghan_invasion', 'chernobyl', 'berlin_fall', 'counterinsurgency'
  ];

  function menuPhotos() {
    const P = window.CWPhotos;
    if (!P) return [];
    const out = [];
    MENU_SCENERY.forEach(k => {
      const e = (P.cards && P.cards[k]) || (P.regions && P.regions[k]);
      if (e && e.file) out.push(e);
    });
    if (!out.length) {
      if (P.regions) Object.keys(P.regions).forEach(k => { if (P.regions[k].file) out.push(P.regions[k]); });
    }
    return out;
  }

  function menuInit() {
    const v = $('menuVideo');
    if (v && MENU.clips.length) {
      MENU.el = v;
      v.addEventListener('error', () => { v.classList.add('hidden'); });
      v.addEventListener('loadeddata', () => { v.classList.remove('hidden'); });
      menuClipLoad(true);
      return;
    }
    MENU.shots = menuPhotos();
    if (!MENU.shots.length) return;
    for (let i = MENU.shots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = MENU.shots[i]; MENU.shots[i] = MENU.shots[j]; MENU.shots[j] = t;
    }
    menuSlideStep();
    MENU.timer = setInterval(menuSlideStep, 7000);
  }

  function menuSlideStep() {
    if (!MENU.shots.length) return;
    const shot = MENU.shots[MENU.sIdx++ % MENU.shots.length];
    const next = MENU.front === 'A' ? $('menuSlideB') : $('menuSlideA');
    const prev = MENU.front === 'A' ? $('menuSlideA') : $('menuSlideB');
    if (!next || !prev) return;
    next.onload = () => {
      next.classList.add('on');
      prev.classList.remove('on');
      MENU.front = MENU.front === 'A' ? 'B' : 'A';
      const foot = $('menuClip');
      if (foot) foot.textContent = shot.caption ? '历史影像：' + shot.caption : '';
    };
    next.onerror = () => { };
    next.src = 'assets/photos/' + shot.file;
    if (next.complete && next.naturalWidth) next.onload();
  }

  function menuClipLoad(play) {
    if (!MENU.el) return;
    const c = MENU.clips[MENU.idx % MENU.clips.length];
    if (!c) return;
    MENU.el.src = 'assets/video/' + c.file;
    const foot = $('menuClip');
    if (foot) foot.textContent = c.title ? '历史影像：' + c.title : '';
    if (play) { const p = MENU.el.play(); if (p && p.catch) p.catch(() => { }); }
  }

  function menuPlay(on) {
    if (MENU.el) {
      if (on) { const p = MENU.el.play(); if (p && p.catch) p.catch(() => { }); }
      else MENU.el.pause();
      return;
    }
    if (MENU.timer) {
      clearInterval(MENU.timer);
      MENU.timer = on ? setInterval(menuSlideStep, 7000) : null;
    }
  }

  function showMenu() {
    $('startScreen').classList.remove('hidden');
    menuPlay(true);
    musicUpdateMood();
  }

  const ERA_CN = { early: '早期', mid: '中期', late: '晚期' };

  const MOOD_CN = {
    menu: '主菜单', tension: 'DEFCON 告急',
    headline_us: '美国头条', headline_ussr: '苏联头条', headline_cn: '中国头条',
    victory_us: '美国胜利', victory_ussr: '苏联胜利', victory_cn: '中国胜利'
  };


  function moodLabel(mood) {
    if (MOOD_CN[mood]) return MOOD_CN[mood];
    const cut = mood.indexOf('_');
    if (cut > 0) {
      const head = mood.slice(0, cut), tail = mood.slice(cut + 1);
      if (ERA_CN[tail]) return (NAME[head] || head) + ' · ' + ERA_CN[tail];
    }
    return mood;
  }






  function musicInit() {
    const btn = $('btnMusic');
    const procOk = !!(window.CWMusicProc && window.CWMusicProc.available);
    if (!MUSIC.tracks.length && !procOk) { if (btn) btn.classList.add('hidden'); return; }
    if (!MUSIC.tracks.length) return;
    try { MUSIC.el = new Audio(); } catch (e) { MUSIC.el = null; return; }
    MUSIC.el.volume = 0.3;
    MUSIC.el.loop = false;
    MUSIC.el.addEventListener('ended', () => { MUSIC.idx++; musicLoad(true); });
    MUSIC.el.addEventListener('error', () => {
      MUSIC.fails = (MUSIC.fails || 0) + 1;
      if (MUSIC.fails >= MUSIC.tracks.length) { MUSIC.el = null; }
      else { MUSIC.idx++; musicLoad(MUSIC.playing); }
    });

    MUSIC.el.addEventListener('timeupdate', () => {
      const t = MUSIC.cur;
      if (t && t.file && MUSIC.el.currentTime > 0) MUSIC.pos[t.file] = MUSIC.el.currentTime;
      if (!t || !t.loop || MUSIC.el.loop) return;
      MUSIC.el.loop = true;
    });
  }


  function musicMatches(t, mood) {
    if (t.mood) return t.mood === mood;

    if (mood === 'menu' || mood === 'tension') return t.mood === mood;
    const cut = mood.indexOf('_');
    if (cut < 0) return false;
    return t.side === mood.slice(0, cut) && t.era === mood.slice(cut + 1);
  }



  function musicResumable(t) {
    return !/^(headline_|victory_)/.test((t && t.mood) || '');
  }

  function musicLoad(play) {
    if (!MUSIC.el || !MUSIC.pool.length) return;
    const t = MUSIC.pool[((MUSIC.idx % MUSIC.pool.length) + MUSIC.pool.length) % MUSIC.pool.length];
    MUSIC.cur = t;
    MUSIC.el.loop = MUSIC.pool.length === 1;
    const resumeAt = musicResumable(t) ? (MUSIC.pos[t.file] || 0) : 0;
    MUSIC.el.src = 'assets/audio/' + t.file;


    if (resumeAt > 1) {
      const seek = () => { try { MUSIC.el.currentTime = resumeAt; } catch (e) { } };
      seek();
      if (typeof MUSIC.el.addEventListener === 'function') {
        const once = () => {
          if (MUSIC.el.removeEventListener) MUSIC.el.removeEventListener('loadedmetadata', once);
          seek();
        };
        MUSIC.el.addEventListener('loadedmetadata', once);
      }
    }
    const now = $('musicNow');
    if (now) now.textContent = t.title || '';
    if (play) musicPlay();
  }

  function musicPlay() {
    if (MUSIC.muted) return;
    if (MUSIC.usingProc) {
      if (window.CWMusicProc) window.CWMusicProc.start();
      return;
    }
    if (!MUSIC.el) return;
    MUSIC.playing = true;
    const p = MUSIC.el.play();
    if (p && p.catch) p.catch(() => { MUSIC.playing = false; });
  }

  function musicTitleFor(mood) {
    const pool = MUSIC.el ? MUSIC.tracks.filter(t => musicMatches(t, mood)) : [];
    if (!pool.length) return '氛围音:' + moodLabel(mood);
    return pool.map(t => t.title || t.file).join('+');
  }

  function musicApply(mood) {
    MUSIC.mood = mood;
    const pool = MUSIC.el ? MUSIC.tracks.filter(t => musicMatches(t, mood)) : [];
    if (pool.length) {
      if (window.CWMusicProc) window.CWMusicProc.stop();
      MUSIC.usingProc = false;
      MUSIC.pool = pool;
      MUSIC.idx = 0;
      musicLoad(true);
      return;
    }
    if (window.CWMusicProc && window.CWMusicProc.available) {
      if (MUSIC.el) MUSIC.el.pause();
      MUSIC.usingProc = true;
      window.CWMusicProc.start();
      window.CWMusicProc.setMood(mood);
      const now = $('musicNow');
      if (now) now.textContent = '氛围音 · ' + moodLabel(mood);
      return;
    }
    MUSIC.pool = MUSIC.tracks;
    MUSIC.idx = 0;
    musicLoad(true);
  }




  const ALL_MOODS = [
    'menu', 'tension',
    'us_early', 'us_mid', 'us_late',
    'ussr_early', 'ussr_mid', 'ussr_late',
    'cn_early', 'cn_mid', 'cn_late',
    'headline_us', 'headline_ussr', 'headline_cn',
    'victory_us', 'victory_ussr', 'victory_cn'
  ];


  function baseMood(G) {
    if (!G) return 'menu';
    if (!document_visible()) return 'menu';
    if (G.over) return G.winner ? 'victory_' + G.winner : 'menu';
    if (G.phase === 'headline_show') {
      const hl = R.headlineCurrent(G);
      if (hl) return 'headline_' + hl.side;
    }
    if (G.defcon <= 2) return 'tension';
    return (G.current || 'us') + '_' + (G.era || 'early');
  }

  function document_visible() {
    const s = $('startScreen');
    return !(s && !s.classList.contains('hidden'));
  }

  function musicUpdateMood() {
    const procOk = !!(window.CWMusicProc && window.CWMusicProc.available);
    if (!MUSIC.el && !procOk) return;
    const mood = baseMood(UI.G);
    if (mood === MUSIC.mood) return;
    musicApply(mood);
  }

  function musicToggle() {
    MUSIC.muted = !MUSIC.muted;
    if (window.CWMusicProc) window.CWMusicProc.setMuted(MUSIC.muted);
    if (MUSIC.el) {
      if (MUSIC.muted) MUSIC.el.pause();
      else if (!MUSIC.usingProc) musicPlay();
    }
    if (!MUSIC.muted && MUSIC.usingProc) musicPlay();
    const btn = $('btnMusic');
    if (btn) { btn.textContent = MUSIC.muted ? '静音' : '声音'; btn.classList.toggle('ghost', MUSIC.muted); }
    const b2 = $('btnMenuSound');
    if (b2) b2.textContent = MUSIC.muted ? '声音：关' : '声音：开';
  }

  function sfx(name) {
    if (MUSIC.muted) return;
    if (window.CWMusicProc && window.CWMusicProc.sfx) window.CWMusicProc.sfx(name);
  }




  function cardSting(cid, side) {
    if (MUSIC.muted) return;
    if (window.CWMusicProc && window.CWMusicProc.cardSting) window.CWMusicProc.cardSting(cid, side);
  }

  function renderEventPop() {
    const box = $('eventpop');
    const G = UI.G;
    if (!box || !G) return;
    const r = G.reveal;
    if (!r || r.seq === UI.popSeq) return;
    if (G.phase === 'headline_show' || G.phase === 'headline') return;
    UI.popSeq = r.seq;
    const card = D.CARDS_BY_ID[r.cid];
    if (!card) return;
    const ph = photoFor(card);
    const img = $('popImg'), poster = $('popPoster');
    if (ph && ph.file) {
      img.onerror = () => { img.classList.add('hidden'); poster.classList.remove('hidden'); $('popPosterName').textContent = card.name; };
      img.classList.remove('hidden');
      poster.classList.add('hidden');
      img.src = 'assets/photos/' + ph.file;
      img.alt = card.name;
    } else {
      img.classList.add('hidden');
      img.removeAttribute('src');
      poster.classList.remove('hidden');
      $('popPosterName').textContent = card.name;
    }
    $('popFrame').className = 'pop-frame ' + SIDE_CLS[r.side];
    $('popFlag').textContent = NAME[r.side];
    $('popName').textContent = card.name;
    $('popOps').textContent = card.score ? '记分' : '行动点 ' + card.ops;
    $('popDesc').textContent = card.desc || '';
    box.classList.remove('hidden');
    box.classList.remove('show');
    void box.offsetWidth;
    box.classList.add('show');
    clearTimeout(UI.popTimer);
    UI.popTimer = setTimeout(() => {
      box.classList.remove('show');
      UI.popHide = setTimeout(() => box.classList.add('hidden'), 220);
    }, 3200);
    sfx(r.side === 'us' ? 'event' : r.side === 'ussr' ? 'eventSu' : 'eventCn');
    cardSting(r.cid, r.side);


  }

  const ERA_SUB = { early: 'EARLY WAR　1945 — 1962', mid: 'MID WAR　1963 — 1975', late: 'LATE WAR　1975 — 1989' };
  function showEraSplash(era) {
    const el = $('erasplash');
    if (!el) return;
    el.querySelector('b').textContent = R.ERA_NAME[era] || '';
    el.querySelector('span').textContent = ERA_SUB[era] || '';
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(UI.eraTimer);
    UI.eraTimer = setTimeout(() => el.classList.remove('show'), 3000);
  }

  function renderAll() {
    if (!UI.G) return;
    updateTop();
    paintMap();
    updatePlayers();
    renderHand();
    renderBanner();
    renderLog();
    renderHeadlineOverlay();
    renderEventPop();
    musicUpdateMood();
    updateCurtain();
    renderTutorial();
    if (UI.eraPrev === null) UI.eraPrev = UI.G.era;
    if (UI.G.era !== UI.eraPrev) { UI.eraPrev = UI.G.era; showEraSplash(UI.G.era); }
  }



  function cnPlayable() { return UI.deck !== 'twin'; }

  function buildSeatUI() {
    const box = $('seatList');
    if (!box) return;
    if (!cnPlayable()) UI.seats.cn = false;
    box.innerHTML = '';
    SIDES.forEach(s => {
      const locked = s === 'cn' && !cnPlayable();
      const row = mk('button', 'seat-row ' + SIDE_CLS[s] + (locked ? ' is-locked' : ''));
      row.type = 'button';
      row.dataset.side = s;
      row.disabled = locked;
      row.appendChild(mk('span', 'seat-name', NAME[s]));
      row.appendChild(mk('span', 'seat-desc', locked
        ? '美苏对决模式：中国是不可玩阵营，由电脑托管'
        : s === 'cn'
          ? '第三极：开局最弱，亚洲与非洲的牌最好用'
          : s === 'us' ? '先守后攻，靠事件牌与太空竞赛翻盘' : '先手压制，早期扩张，守住领先'));
      row.appendChild(mk('span', 'seat-tag', ''));
      row.addEventListener('click', () => {
        if (locked) { toast('美苏对决模式里中国是不可玩阵营'); return; }
        const humans = SIDES.filter(x => UI.seats[x]).length;
        if (UI.seats[s] && humans <= 1) { toast('至少要有一位玩家'); return; }
        UI.seats[s] = !UI.seats[s];
        sfx('click');
        buildSeatUI();
      });
      box.appendChild(row);
    });
    paintSeatUI();
  }

  function paintSeatUI() {
    const box = $('seatList');
    if (!box) return;
    SIDES.forEach(s => {
      const row = box.querySelector('.seat-row[data-side="' + s + '"]');
      if (!row) return;
      const locked = s === 'cn' && !cnPlayable();
      row.classList.toggle('is-human', !!UI.seats[s] && !locked);
      row.querySelector('.seat-tag').textContent = locked ? '不可玩' : (UI.seats[s] ? '玩家' : '电脑');
    });
    const n = SIDES.filter(s => UI.seats[s]).length;
    const hint = SIDES.filter(s => UI.seats[s]).map(s => NAME[s]).join(' + ');
    const pre = $('seatPresets');
    if (pre) {
      pre.innerHTML = '';
      const info = mk('span', 'seat-info', `本局：${hint}（${n} 位玩家${n > 1 ? '，同机轮流操作' : ''}）`);
      pre.appendChild(info);
    }
  }

  function buildDeckUI() {
    const box = $('deckPick');
    if (!box) return;
    box.innerHTML = '';
    D.DECKS.forEach(dk => {
      const b = mk('button', 'side-btn' + (dk.id === UI.deck ? ' active' : ''));
      b.type = 'button';
      b.dataset.deck = dk.id;
      b.appendChild(mk('b', '', dk.name));
      b.appendChild(mk('span', '', dk.desc));
      box.appendChild(b);
    });
  }

  function bind() {
    $('btnRules').addEventListener('click', showRules);
    $('btnVpBreak').addEventListener('click', showVpBreak);
    $('btnNew').addEventListener('click', () => {
      confirmBox('开始新游戏？', '当前进度将丢失。', () => { closeModal(); showMenu(); });
    });
    $('btnEndOps').addEventListener('click', () => { R.endOps(UI.G); afterAction(); });
    $('btnPass').addEventListener('click', () => {
      const G = UI.G;
      const me = viewerSide();
      if (!G || G.over || inputMode() !== 'play') return;
      const n = G.hands[me].length;
      if (n === 0) { R.forcePass(G, me); afterAction(); return; }
      confirmBox('跳过本行动轮？', `你手上还有 ${n} 张牌，跳过等于白白浪费一次行动机会。`, () => {
        R.forcePass(G, me);
        afterAction();
      });
    });
    $('btnAbility').addEventListener('click', () => {
      const G = UI.G;
      if (!G || G.over) return;
      if (!R.canAbility(G, G.current)) { toast(abilityDesc(G, G.current)); return; }
      if (!R.abilityNeedsTarget(G.current)) {

        R.useAbility(G, G.current);
        TUT && TUT.note('ability');
        UI.abilityMode = false;
        sfx('ability');
        renderAll();
        return;
      }
      UI.abilityMode = !UI.abilityMode;
      renderAll();
    });
    $('btnSkipHeadline').addEventListener('click', () => {
      const side = nextHeadlineSide();
      if (!side) return;
      R.submitHeadline(UI.G, side, null);
      afterAction();
    });
    $('btnTutorialToggle').addEventListener('click', () => {
      UI.tutorialOpen = !UI.tutorialOpen;
      renderTutorial();
    });
    $('btnTutClose').addEventListener('click', () => { UI.tutorialOpen = false; renderTutorial(); });
    $('btnCurtainOk').addEventListener('click', () => {
      const s = pendingHumanSide();
      if (!s) { updateCurtain(); return; }
      UI.viewer = s;
      if (UI.G) UI.G.viewSide = s;
      UI.curtainFor = null;
      sfx('click');
      renderAll();
    });

    $('deckPick').addEventListener('click', e => {
      const b = e.target.closest('.side-btn'); if (!b) return;
      [...$('deckPick').children].forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      UI.deck = b.dataset.deck;
      sfx('click');
      if (!cnPlayable() && UI.seats.cn) { UI.seats.cn = false; toast('美苏对决模式：中国改为电脑托管'); }
      buildSeatUI();
    });
    $('lenPick').addEventListener('click', e => {
      const b = e.target.closest('.side-btn'); if (!b) return;
      [...$('lenPick').children].forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      UI.startLen = b.dataset.len;
    });
    $('btnStart').addEventListener('click', () => {
      if (window.CWMusicProc && window.CWMusicProc.warm) window.CWMusicProc.warm();
      UI.tutorialRun = false;
      UI.seed = undefined;
      startGame();
    });
    $('btnTutorial').addEventListener('click', () => {
      if (window.CWMusicProc && window.CWMusicProc.warm) window.CWMusicProc.warm();
      UI.tutorialRun = true;
      UI.seats = { us: false, ussr: true, cn: false };
      UI.deck = 'std';
      UI.startLen = 'std';
      UI.seed = TUT ? TUT.TUTORIAL_SEED : 19491001;
      buildSeatUI();
      buildDeckUI();
      startGame();
      UI.tutorialOpen = true;
      renderAll();
    });
    $('btnMenuRules').addEventListener('click', showRules);
    $('btnMenuSound').addEventListener('click', () => {
      musicToggle();
      const b = $('btnMenuSound');
      if (b) b.textContent = MUSIC.muted ? '声音：关' : '声音：开';
    });
    $('btnMusic').addEventListener('click', musicToggle);

    $('modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    const mapEl = $('map');
    const tipEl = $('tip');

    mapEl.addEventListener('click', ev => {
      if (UI.suppressClick) { UI.suppressClick = false; return; }
      const t = ev.target.closest('.geo');
      if (t) { onCountryClick(t.dataset.cid); return; }
      const n = ev.target.closest('.geo-nc');
      if (n) { UI.selNc = n.dataset.ncid; updateNcInspector(UI.selNc); }
    });

    mapEl.addEventListener('mousemove', ev => {
      const t = ev.target.closest('.geo');
      if (!t) {
        const n = ev.target.closest('.geo-nc');
        if (n) {
          setHover(null);
          setNcHover(n.dataset.ncid);
          mapEl.style.cursor = 'help';
          const g = NCG[n.dataset.ncid];
          if (g) {
            tipEl.innerHTML = '<b>' + (NC_NAME[n.dataset.ncid] || g.name || '') + '</b><span class="tip-row"><em>非战区 · 不放置影响力</em></span>';
            const r = mapEl.getBoundingClientRect();
            tipEl.style.left = Math.max(4, Math.min(r.width - 158, ev.clientX - r.left + 14)) + 'px';
            tipEl.style.top = Math.max(4, Math.min(r.height - 56, ev.clientY - r.top + 14)) + 'px';
            tipEl.classList.remove('hidden');
          }
          return;
        }
        setHover(null);
        setNcHover(null);
        mapEl.style.cursor = drag ? 'grabbing' : 'default';
        tipEl.classList.add('hidden');
        return;
      }
      setNcHover(null);
      const cid = t.dataset.cid;
      setHover(cid);
      const G = UI.G, c = CO[cid];
      if (!G) return;
      const inf = G.infl[cid];
      const tipBits = SIDES.map(s => {
        const mark = R.controls(G, cid, s) ? '▲' : '';
        const cls = s === 'us' ? 'us' : s === 'ussr' ? 'su' : 'cn';
        return `<em class="${cls}">${SHORT_CN[s]} ${inf[s]}${mark}</em>`;
      }).join('');
      tipEl.innerHTML =
        '<b>' + c.name + (c.bg ? ' ★' : '') + '</b>' +
        '<span class="tip-row">' + tipBits + '<em>稳 ' + c.stab + '</em></span>';
      const r = mapEl.getBoundingClientRect();
      tipEl.style.left = Math.max(4, Math.min(r.width - 158, ev.clientX - r.left + 14)) + 'px';
      tipEl.style.top = Math.max(4, Math.min(r.height - 56, ev.clientY - r.top + 14)) + 'px';
      tipEl.classList.remove('hidden');
    });

    mapEl.addEventListener('mouseleave', () => {
      setHover(null);
      setNcHover(null);
      tipEl.classList.add('hidden');
    });

    let drag = null;
    mapEl.addEventListener('mousedown', ev => {
      if (ev.button !== 0) return;
      drag = { x: ev.clientX, y: ev.clientY, vx: view.x, vy: view.y, moved: false };
      mapEl.classList.add('grabbing');
      tipEl.classList.add('hidden');
      ev.preventDefault();
    });
    window.addEventListener('mousemove', ev => {
      if (!drag) return;
      const r = mapEl.getBoundingClientRect();
      const sc = Math.min(r.width / VIEW_W, r.height / VIEW_H) || 1;
      if (Math.abs(ev.clientX - drag.x) + Math.abs(ev.clientY - drag.y) > 4) drag.moved = true;
      view.x = drag.vx + (ev.clientX - drag.x) / sc;
      view.y = drag.vy + (ev.clientY - drag.y) / sc;
      clampView(); applyView();
    });
    window.addEventListener('mouseup', () => {
      if (drag && drag.moved) UI.suppressClick = true;
      drag = null;
      mapEl.classList.remove('grabbing');
    });
    mapEl.addEventListener('wheel', ev => {
      ev.preventDefault();
      zoomAt(ev.clientX, ev.clientY, ev.deltaY < 0 ? 1.2 : 1 / 1.2);
    }, { passive: false });

    $('mapModes').addEventListener('click', ev => {
      const b = ev.target.closest('.hud-btn'); if (!b) return;
      [...$('mapModes').children].forEach(x => x.classList.toggle('on', x === b));
      mapMode = b.dataset.mode;
      paintMap();
    });
    $('mapToggles').addEventListener('click', ev => {
      const b = ev.target.closest('.hud-btn'); if (!b) return;
      b.classList.toggle('on');
      if (b.dataset.tog === 'labels') showLabels = b.classList.contains('on');
      else showNumbers = b.classList.contains('on');
      layoutMapText();
    });
    $('mapZoom').addEventListener('click', ev => {
      const b = ev.target.closest('.hud-btn'); if (!b) return;
      const r = mapEl.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      if (b.dataset.zoom === 'in') zoomAt(cx, cy, 1.4);
      else if (b.dataset.zoom === 'out') zoomAt(cx, cy, 1 / 1.4);
      else resetView();
    });

    $('hand').addEventListener('click', ev => {
      const t = ev.target.closest('.card');
      if (!t) return;
      onCardClick(t.dataset.card);
    });
    $('headline').addEventListener('click', headlineAdvance);
    let rz = null;
    window.addEventListener('resize', () => {
      clearTimeout(rz);
      rz = setTimeout(() => { measureScale(); clampView(); applyView(); }, 160);
    });
  }

  let inited = false;
  function init() {
    if (inited) return;
    inited = true;
    buildDefconTrack();
    buildSeatUI();
    buildDeckUI();
    bind();
    musicInit();
    menuInit();
    bootFromQuery();
  }

  function setSeatsFromQuery(q) {
    const seats = q.get('seats');
    if (seats === 'hotseat2') { UI.seats = { us: true, ussr: true, cn: false }; return; }
    if (seats === 'hotseat3') { UI.seats = { us: true, ussr: true, cn: true }; return; }
    if (seats === 'solo') { UI.seats = { us: true, ussr: false, cn: false }; return; }
    const one = q.get('play');
    if (one && SIDES.indexOf(one) >= 0) {
      UI.seats = { us: one === 'us', ussr: one === 'ussr', cn: one === 'cn' };
      return;
    }
    if (q.has('bot')) return;
  }

  function bootFromQuery() {
    let q;
    try { q = new URLSearchParams(location.search); } catch (e) { return; }
    if (q.has('deck') && D.DECK_BY_ID[q.get('deck')]) UI.deck = q.get('deck');
    if (q.has('tutorial')) UI.tutorialRun = true;
    if (q.get('len') === 'short') UI.startLen = 'short';
    if (!q.has('auto') && !q.has('tutorial')) { buildDeckUI(); return; }

    UI.auto = q.has('auto');
    setSeatsFromQuery(q);
    if (q.has('speed')) UI.speed = Math.max(0, parseInt(q.get('speed'), 10) || 0);
    else if (UI.auto) UI.speed = 0;
    if (q.get('seed')) UI.seed = parseInt(q.get('seed'), 10) || 0;
    if (UI.tutorialRun && TUT) UI.seed = TUT.TUTORIAL_SEED;
    buildSeatUI();
    buildDeckUI();
    startGame();
    if (q.get('bot') === '1') SIDES.forEach(s => { UI.G.ai[s] = true; });

    const dbg = q.get('debug');
    const hand = UI.G.hands[viewerSide()];
    if (dbg === 'card' && hand.length) openCardModal(hand[0]);
    else if (dbg === 'rules') showRules();
    else if (dbg === 'vp') showVpBreak();
    else if (dbg === 'country') { UI.selCid = 'wgermany'; updateInspector('wgermany'); paintMap(); }
    else if (dbg === 'tutorial') { UI.tutorialOpen = true; renderTutorial(); }
    else if (dbg === 'focus') {
      const rid = q.get('region') || 'europe';
      measureScale();
      focusRegion(rid);
      paintMap();
      document.documentElement.dataset.dbg = 'rid=' + rid +
        ' bbox=' + JSON.stringify(REGION_BBOX[rid]) +
        ' k=' + view.k.toFixed(2) + ' x=' + Math.round(view.x) + ' y=' + Math.round(view.y) +
        ' svgScale=' + svgScale.toFixed(3) + ' tf=' + ($('mapRoot').getAttribute('transform') || '');
    }
    else if (dbg === 'alert') {
      const G = UI.G;
      skipHeadlines(G);
      G.defcon = 2;
      SIDES.forEach(s => { G.mil[s] = 5; });
      renderAll();
      document.documentElement.dataset.dbg = 'defcon=' + G.defcon + ' word=' + $('dcStatus').textContent + ' alarm=' + $('defconBox').classList.contains('alarm') + ' crtAlarm=' + $('crt').classList.contains('alarm');
    }
    else if (dbg === 'popcheck') {
      const G = UI.G;
      skipHeadlines(G);
      const ids = ['berlin_airlift', 'taiwan_strait', 'norad', 'prc_founding', 'bandung'];
      const res = [];
      ids.forEach(id => {
        if (G.hands.us.indexOf(id) < 0) G.hands.us.unshift(id);
        G.phase = 'action'; G.current = 'us'; G.ops = null; G.pending = null;
        R.playEvent(G, 'us', id);
        renderAll();
        const box = $('eventpop');
        res.push(id + '=' + (!box.classList.contains('hidden') && box.classList.contains('show') ? 'shown' : 'MISS') + '(' + $('popName').textContent + ')');
      });
      document.documentElement.dataset.dbg = res.join(' | ') + ' || ' +
        ALL_MOODS
          .map(m => m + '=' + musicTitleFor(m)).join(' ; ') +
        ' || video=' + (MENU.clips.length ? MENU.clips.map(c => c.file).join('+') : '无');
    }
    else if (dbg === 'musiccheck') {
      const moods = ALL_MOODS;
      document.documentElement.dataset.dbg = moods.map(m => m + '=' + musicTitleFor(m)).join(' ; ');
    }
    else if (dbg === 'passcheck') {
      const G = UI.G;
      skipHeadlines(G);
      G.phase = 'action';
      G.current = viewerSide();
      G.ops = null;
      G.pending = null;
      G.hands[viewerSide()] = [];
      renderAll();
      const btn = $('btnPass');
      const visible = !!(btn && !btn.classList.contains('hidden'));
      const mode = inputMode();
      const bannerHint = $('banner').textContent.indexOf('跳过行动轮') >= 0;
      const before = { ar: G.ar, cur: G.current, turn: G.turn, side: viewerSide() };
      if (visible) btn.click();
      const moved = G.over || G.ar !== before.ar || G.current !== before.cur || G.turn !== before.turn;
      document.documentElement.dataset.dbg = 'mode=' + mode +
        ' btnPassVisible=' + visible + ' bannerHasHint=' + bannerHint +
        ' before=' + (before.turn + '/' + before.ar + '/' + before.cur) +
        ' after=' + (G.turn + '/' + G.ar + '/' + G.current) + ' moved=' + moved;
    }
    else if (dbg === 'headline') {
      skipHeadlines(UI.G);
      renderAll();
      document.documentElement.dataset.dbg = 'queue=' + UI.G.headlineQueue.map(x => x.side + ':' + x.cid).join(',') +
        ' phase=' + UI.G.phase + ' index=' + UI.G.headlineIndex;
    }
    else if (dbg === 'curtain') {
      const G = UI.G;
      G.human = { us: true, ussr: true, cn: true };
      G.ai = { us: false, ussr: false, cn: false };
      G.hotseat = true;
      UI.viewer = 'us';
      renderAll();
      document.documentElement.dataset.dbg = 'curtainHidden=' + $('curtain').classList.contains('hidden') +
        ' side=' + $('curtainSide').textContent + ' pending=' + pendingHumanSide();
    }
    else if (dbg === 'ability') {
      const G = UI.G;
      skipHeadlines(G);
      G.phase = 'action'; G.current = viewerSide(); G.ops = null; G.pending = null;
      renderAll();
      const can = R.canAbility(G, G.current);
      const t = R.abilityTargets(G, G.current);
      if (can && t.length) R.useAbility(G, G.current, t[0]);
      renderAll();
      document.documentElement.dataset.dbg = 'canAbility=' + can + ' targets=' + t.length +
        ' used=' + G.abilityUsed[G.current] + ' btnHidden=' + $('btnAbility').classList.contains('hidden') +
        ' after=' + JSON.stringify(G.infl[t[0]]);
    }
    else if (dbg === 'photo') {
      const id = q.get('card') || 'castro';
      const card = D.CARDS_BY_ID[id];
      if (card) {
        UI.G.headlineQueue = [{ side: card.side === 'neutral' ? 'us' : card.side, cid: id }];
        UI.G.headlineIndex = 0;
        UI.G.phase = 'headline_show';
        UI.G.pending = null;
      }
      renderAll();
    }
  }

  function skipHeadlines(G) {
    if (G.phase !== 'headline') return;
    TURN_ORDER.forEach(s => { if (!G.headlineDone[s]) R.submitHeadline(G, s, null); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.CWUI = {
    UI, toast, showRules, renderAll, paintMap, focusRegion, resetView, focusBox, measureScale,
    inputMode, openCardModal, renderHand, updateInspector, paintFactions, renderBanner,
    viewerSide, pendingHumanSide, renderTutorial, musicTitleFor,
    baseMood, moodLabel, ALL_MOODS,
    music: MUSIC, currentMood: () => MUSIC.mood
  };
})();
