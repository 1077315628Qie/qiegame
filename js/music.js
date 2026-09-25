(function (global) {
  'use strict';









  const A = {
    ctx: null, dry: null, wet: null, bus: null, comp: null, conv: null,
    muted: false, mood: 'menu', timer: null, bar: 0, playing: false, duckUntil: 0
  };

  const SCALES = {
    maj:   [0, 2, 4, 5, 7, 9, 11],
    min:   [0, 2, 3, 5, 7, 8, 10],
    penta: [0, 2, 4, 7, 9, 12, 14]
  };

  const CFG = {
    menu:        { bpm: 50, root: 55.00, scale: 'min',   chords: [0, 5, 2, 6], pad: 0.085, lead: 0.075, drums: 'none',  leadWave: 'triangle' },



    headline_us:   { bpm: 132, root: 69.30, scale: 'maj', chords: [0, 4, 3, 4], pad: 0.045, lead: 0.10,  drums: 'march', leadWave: 'square', brass: true, fanfare: true },
    headline_ussr: { bpm: 74,  root: 58.27, scale: 'min', chords: [0, 1, 5, 0], pad: 0.10,  lead: 0.095, drums: 'timpani', leadWave: 'sawtooth', choir: true, fanfare: true },
    headline_cn:   { bpm: 96,  root: 65.41, scale: 'penta', chords: [0, 2, 4, 2], pad: 0.06, lead: 0.09,  drums: 'gong', leadWave: 'triangle', bell: true, fanfare: true },
    tension:     { bpm: 138, root: 61.74, scale: 'min',   chords: [0, 1, 0, 1], pad: 0.06,  lead: 0.07,  drums: 'pulse', leadWave: 'square' }
  };


  const FACTION_BASE = {
    us:   { root: 65.41, scale: 'maj',  chords: [0, 3, 4, 0], leadWave: 'square',  drums: 'march', brass: true },
    ussr: { root: 55.00, scale: 'min',  chords: [0, 5, 2, 6], leadWave: 'sawtooth', drums: 'none',  choir: true },
    cn:   { root: 62.00, scale: 'penta', chords: [0, 4, 2, 5], leadWave: 'triangle', drums: 'brush', bell: true }
  };

  const ERA_MOD = {
    early: { bpm: 0.86, pad: 0.90, lead: 0.95, drum: 'none', oct: 0 },
    mid:   { bpm: 1.00, pad: 1.15, lead: 1.05, drum: null, oct: 0 },
    late:  { bpm: 0.72, pad: 1.30, lead: 0.90, drum: 'sparse', oct: -1 }
  };
  ['us', 'ussr', 'cn'].forEach(side => {
    const base = FACTION_BASE[side];
    ['early', 'mid', 'late'].forEach(era => {
      const em = ERA_MOD[era];
      const baseBpm = side === 'us' ? 116 : side === 'ussr' ? 62 : 78;
      CFG[side + '_' + era] = {
        bpm: Math.round(baseBpm * em.bpm),
        root: base.root * Math.pow(2, em.oct / 12),
        scale: base.scale,
        chords: base.chords,
        pad: 0.075 * em.pad,
        lead: 0.085 * em.lead,
        drums: em.drum === 'none' ? 'none' : (em.drum === 'sparse' ? (base.drums === 'march' ? 'brush' : 'none') : base.drums),
        leadWave: base.leadWave,
        brass: !!base.brass,
        choir: !!base.choir,
        bell: !!base.bell
      };

      if (era === 'early') {
        CFG['victory_' + side] = {
          bpm: Math.round(baseBpm * 1.35), root: base.root * 1.335, scale: 'maj',
          chords: [0, 4, 3, 0], pad: 0.06, lead: 0.11, drums: 'march',
          leadWave: 'triangle', brass: true, choir: !!base.choir, bell: true, fanfare: true
        };
      }
    });
  });

  const MOTIF = {
    menu:        [0, null, 2, null, 4, null, 3, null],
    headline_us:   [4, 2, 4, 6, 4, 2, 0, 2],
    headline_ussr: [0, 0, 1, 0, 4, 3, 1, 0],
    headline_cn:   [0, 2, 3, 4, 2, 3, 2, 0],
    tension:     [0, 0, 1, 0, 3, 1, 4, 3]
  };
  const FACTION_MOTIF = {
    us:   [[0, 2, 4, 2, 3, 4, 2, 0], [0, 4, 2, 4, 3, 2, 4, 0], [0, null, 4, 3, null, 2, 1, null]],
    ussr: [[0, null, 1, 2, 0, null, 4, 3], [0, 1, null, 3, 2, null, 1, 0], [0, null, 4, 3, null, 2, 1, null]],
    cn:   [[0, 2, 4, 2, null, 3, 2, 0], [0, 2, 3, 4, 2, 3, 2, 0], [0, null, 3, 4, 3, 2, null, 0]]
  };
  ['us', 'ussr', 'cn'].forEach(side => {
    ['early', 'mid', 'late'].forEach((era, i) => {
      MOTIF[side + '_' + era] = FACTION_MOTIF[side][i];
    });
    MOTIF['victory_' + side] = [0, 4, 2, 4, 5, 4, 6, 4];
  });

  function cfg() { return CFG[A.mood] || CFG.menu; }
  function deg2semi(deg, scale) {
    const s = SCALES[scale] || SCALES.min;
    const i = ((deg % 7) + 7) % 7;
    return s[i] + 12 * Math.floor(deg / 7);
  }
  function freq(root, semi, oct) { return root * Math.pow(2, (semi + 12 * (oct || 0)) / 12); }
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); }

  function ac() {
    if (!A.ctx) {
      const C = global.AudioContext || global.webkitAudioContext;
      if (!C) return null;
      A.ctx = new C();
    }
    return A.ctx;
  }

  function impulse(sec, decay) {
    const c = ac();
    const len = Math.max(1, Math.floor(c.sampleRate * sec));
    const buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  function build() {
    if (A.bus) return A.bus;
    const c = ac();
    if (!c) return null;
    A.comp = c.createDynamicsCompressor();
    A.comp.threshold.value = -14;
    A.comp.knee.value = 24;
    A.comp.ratio.value = 3.4;
    A.comp.attack.value = 0.008;
    A.comp.release.value = 0.3;
    A.bus = c.createGain();
    A.bus.gain.value = A.muted ? 0 : 0.5;
    A.bus.connect(A.comp);
    A.comp.connect(c.destination);

    A.conv = c.createConvolver();
    A.conv.buffer = impulse(2.8, 2.6);
    A.wet = c.createGain();
    A.wet.gain.value = 0.36;
    A.wet.connect(A.conv);
    A.conv.connect(A.bus);

    A.dry = c.createGain();
    A.dry.gain.value = 1;
    A.dry.connect(A.bus);
    return A.bus;
  }

  function out(wetAmount) {
    const c = ac();
    const g = c.createGain();
    g.gain.value = 1;
    g.connect(A.dry);
    if (wetAmount > 0) {
      const w = c.createGain();
      w.gain.value = wetAmount;
      g.connect(w);
      w.connect(A.conv);
    }
    return g;
  }

  function env(param, t, atk, dur, peak, rel) {
    param.setValueAtTime(0.0001, t);
    param.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + Math.max(0.005, atk));
    param.exponentialRampToValueAtTime(0.0001, t + dur + (rel || 0.05));
  }

  function noiseBuf(sec, curve) {
    const c = ac();
    const len = Math.max(1, Math.floor(c.sampleRate * sec));
    const b = c.createBuffer(1, len, c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, curve);
    return b;
  }



  function pad(semis, t, dur, vol, wave) {
    const c = ac();
    const dest = out(0.9);
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(380, t);
    f.frequency.linearRampToValueAtTime(1450, t + dur * 0.5);
    f.frequency.linearRampToValueAtTime(650, t + dur);
    f.Q.value = 0.9;
    f.connect(dest);
    semis.forEach(s => {
      [0, 6].forEach(det => {
        const o = c.createOscillator();
        o.type = wave || 'sawtooth';
        o.frequency.value = freq(cfg().root, s, 1);
        o.detune.value = det - 3;
        const g = c.createGain();
        env(g.gain, t, dur * 0.35, dur, vol / (semis.length * 2));
        o.connect(g); g.connect(f);
        o.start(t); o.stop(t + dur + 0.4);
      });
    });
  }

  function bass(semi, t, dur, vol) {
    const c = ac();
    const dest = out(0.2);
    const o = c.createOscillator();
    o.type = 'triangle';
    o.frequency.value = freq(cfg().root, semi, 0);
    const o2 = c.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = freq(cfg().root, semi, 0) / 2;
    const g = c.createGain();
    env(g.gain, t, 0.03, dur, vol || 0.13);
    o.connect(g); o2.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.2);
    o2.start(t); o2.stop(t + dur + 0.2);
  }

  function lead(f, t, dur, vol, wave) {
    const c = ac();
    const dest = out(0.45);
    const o = c.createOscillator();
    o.type = wave || cfg().leadWave;
    o.frequency.setValueAtTime(f, t);
    const v = c.createOscillator();
    v.frequency.value = 5.2;
    const vg = c.createGain();
    vg.gain.value = f * 0.006;
    v.connect(vg); vg.connect(o.frequency);
    const f2 = c.createBiquadFilter();
    f2.type = 'lowpass';
    f2.frequency.value = cfg().fanfare ? 4200 : 2600;
    const g = c.createGain();
    env(g.gain, t, 0.05, dur, vol || 0.08);
    o.connect(g); g.connect(f2); f2.connect(dest);
    o.start(t); v.start(t);
    o.stop(t + dur + 0.15); v.stop(t + dur + 0.15);
  }


  function brass(semis, t, dur, vol) {
    const c = ac();
    const dest = out(0.5);
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(700, t);
    f.frequency.linearRampToValueAtTime(3200, t + 0.09);
    f.frequency.linearRampToValueAtTime(1500, t + dur);
    f.Q.value = 1.1;
    f.connect(dest);
    semis.forEach(s => {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = freq(cfg().root, s, 1);
      const o2 = c.createOscillator();
      o2.type = 'square';
      o2.frequency.value = freq(cfg().root, s, 1) * 1.005;
      const g = c.createGain();
      env(g.gain, t, 0.06, dur, vol / (semis.length * 2));
      o.connect(g); o2.connect(g); g.connect(f);
      o.start(t); o.stop(t + dur + 0.2);
      o2.start(t); o2.stop(t + dur + 0.2);
    });
  }


  function choir(semis, t, dur, vol) {
    const c = ac();
    const dest = out(0.8);
    const f1 = c.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 620; f1.Q.value = 3.2;
    const f2 = c.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 1180; f2.Q.value = 2.6;
    const mix = c.createGain(); mix.gain.value = 0.7;
    f1.connect(mix); f2.connect(mix); mix.connect(dest);
    semis.forEach(s => {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = freq(cfg().root, s, 1);
      const g = c.createGain();
      env(g.gain, t, dur * 0.4, dur, vol / semis.length);
      o.connect(g); g.connect(f1); g.connect(f2);
      o.start(t); o.stop(t + dur + 0.3);
    });
  }


  function bell(f, t, dur, vol) {
    const c = ac();
    const dest = out(0.8);
    const g = c.createGain();
    env(g.gain, t, 0.004, dur * 0.25, vol || 0.08, dur);
    g.connect(dest);
    [[1, 1], [2.76, 0.4], [5.4, 0.18]].forEach(([mul, amp]) => {
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.value = f * mul;
      const gg = c.createGain();
      gg.gain.value = amp;
      o.connect(gg); gg.connect(g);
      o.start(t); o.stop(t + dur + 0.2);
    });
  }

  function kick(t, vol) {
    const c = ac();
    const dest = out(0.08);
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.13);
    const g = c.createGain();
    env(g.gain, t, 0.005, 0.16, vol || 0.5);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + 0.35);
  }

  function snare(t, vol) {
    const c = ac();
    const dest = out(0.25);
    const s = c.createBufferSource();
    s.buffer = noiseBuf(0.16, 2);
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1900;
    f.Q.value = 0.9;
    const g = c.createGain();
    g.gain.value = vol || 0.24;
    s.connect(f); f.connect(g); g.connect(dest);
    s.start(t);
  }

  function hat(t, vol) {
    const c = ac();
    const dest = out(0.1);
    const s = c.createBufferSource();
    s.buffer = noiseBuf(0.05, 3);
    const f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 7000;
    const g = c.createGain();
    g.gain.value = vol || 0.1;
    s.connect(f); f.connect(g); g.connect(dest);
    s.start(t);
  }


  function timpani(t, vol, f0) {
    const c = ac();
    const dest = out(0.4);
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(f0 || 82, t);
    o.frequency.exponentialRampToValueAtTime((f0 || 82) * 0.72, t + 0.4);
    const g = c.createGain();
    env(g.gain, t, 0.006, 0.55, vol || 0.42);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + 0.9);
    const s = c.createBufferSource();
    s.buffer = noiseBuf(0.2, 3);
    const f = c.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 420;
    const g2 = c.createGain();
    g2.gain.value = (vol || 0.42) * 0.4;
    s.connect(f); f.connect(g2); g2.connect(dest);
    s.start(t);
  }


  function gong(t, vol) {
    const c = ac();
    const dest = out(0.95);
    const s = c.createBufferSource();
    s.buffer = noiseBuf(1.6, 2.2);
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.setValueAtTime(320, t);
    f.frequency.exponentialRampToValueAtTime(140, t + 1.4);
    f.Q.value = 1.4;
    const g = c.createGain();
    env(g.gain, t, 0.004, 1.2, vol || 0.3, 0.5);
    s.connect(f); f.connect(g); g.connect(dest);
    s.start(t);
  }

  function chordAt(bar) {
    const cf = cfg();
    return cf.chords[bar % cf.chords.length];
  }

  function scheduleBar() {
    const c = ac();
    if (!c || !A.playing) return;
    const cf = cfg();
    const t0 = c.currentTime + 0.08;
    const spb = 60 / cf.bpm;
    const barLen = spb * 4;
    const deg = chordAt(A.bar);
    const ducked = c.currentTime < A.duckUntil;
    const tri = [deg, deg + 2, deg + 4].map(d => deg2semi(d, cf.scale));

    const pv = (ducked ? cf.pad * 0.45 : cf.pad);
    if (cf.choir) choir(tri, t0, barLen * 0.96, pv * 1.6);
    else pad(tri, t0, barLen * 0.96, pv, 'sawtooth');

    if (cf.brass) brass(tri, t0, barLen * 0.5, pv * 0.9);

    bass(deg2semi(deg, cf.scale), t0, spb * 1.7, 0.13);
    bass(deg2semi(deg + 4, cf.scale), t0 + spb * 2, spb * 1.7, 0.11);

    const m = MOTIF[A.mood] || MOTIF.menu;
    const lv = ducked ? cf.lead * 0.5 : cf.lead;
    for (let i = 0; i < m.length; i++) {
      if (m[i] === null) continue;
      const t = t0 + (i * spb) / 2;
      const f = freq(cf.root, deg2semi(deg + m[i], cf.scale), cf.fanfare ? 2 : 2);
      lead(f, t, spb * (cf.fanfare ? 0.5 : 0.42), lv, cf.leadWave);
      if (cf.bell && i % 2 === 0) bell(f * 2, t, 1.2, lv * 0.5);
    }

    if (cf.drums === 'march') {
      kick(t0, 0.5); kick(t0 + spb * 2, 0.42);
      snare(t0 + spb, 0.22); snare(t0 + spb * 3, 0.22);
      for (let i = 0; i < 8; i++) hat(t0 + (i * spb) / 2, i % 2 ? 0.06 : 0.1);
    } else if (cf.drums === 'brush') {
      hat(t0 + spb, 0.09); hat(t0 + spb * 3, 0.09);
      kick(t0, 0.3);
    } else if (cf.drums === 'pulse') {
      kick(t0, 0.34); kick(t0 + spb * 2, 0.3); kick(t0 + spb * 3, 0.24);
      hat(t0 + spb, 0.07); hat(t0 + spb * 3, 0.07);
    } else if (cf.drums === 'timpani') {
      timpani(t0, 0.42); timpani(t0 + spb * 2.5, 0.3, 62);
    } else if (cf.drums === 'gong') {
      gong(t0, 0.26);
      hat(t0 + spb, 0.06); hat(t0 + spb * 3, 0.06);
    }
    if (cf.fanfare && A.bar % 2 === 0) {
      brass([deg2semi(deg, cf.scale) + 12, deg2semi(deg + 2, cf.scale) + 12, deg2semi(deg + 4, cf.scale) + 12],
        t0 + barLen * 0.5, spb * 0.9, pv * 0.8);
    }

    A.bar++;
    A.timer = setTimeout(scheduleBar, barLen * 1000);
  }

  function start() {
    const c = ac();
    if (!c) return false;
    build();
    if (c.state === 'suspended' && c.resume) c.resume();
    if (A.playing) return true;
    A.playing = true;
    A.bar = 0;
    scheduleBar();
    return true;
  }

  function stop() {
    A.playing = false;
    clearTimeout(A.timer);
    A.timer = null;
  }

  function setMood(m) {
    if (A.mood === m) return;
    A.mood = m;
    if (!A.playing) return;
    clearTimeout(A.timer);
    A.bar = 0;
    scheduleBar();
  }

  function setMuted(b) {
    A.muted = !!b;
    if (A.bus) A.bus.gain.value = A.muted ? 0 : 0.5;
  }

  function duck(sec) {
    const c = ac();
    A.duckUntil = (c ? c.currentTime : 0) + (sec || 2.6);
  }




  function noiseHit(t, dur, f0, f1, type, vol, q, wet) {
    const c = ac();
    const dest = out(wet === undefined ? 0.3 : wet);
    const s = c.createBufferSource();
    s.buffer = noiseBuf(dur, 2);
    const f = c.createBiquadFilter();
    f.type = type || 'bandpass';
    f.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
    f.Q.value = q === undefined ? 1.0 : q;
    const g = c.createGain();
    env(g.gain, t, 0.004, dur, vol);
    s.connect(f); f.connect(g); g.connect(dest);
    s.start(t);
  }

  function bellFm(f, t, dur, vol, ratio, index, wet) {
    const c = ac();
    const dest = out(wet === undefined ? 0.5 : wet);
    const car = c.createOscillator();
    car.type = 'sine';
    car.frequency.value = f;
    const mod = c.createOscillator();
    mod.type = 'sine';
    mod.frequency.value = f * (ratio || 2.01);
    const mg = c.createGain();
    mg.gain.setValueAtTime(f * (index || 1.6), t);
    mg.gain.exponentialRampToValueAtTime(f * 0.02, t + dur);
    mod.connect(mg); mg.connect(car.frequency);
    const g = c.createGain();
    env(g.gain, t, 0.004, dur, vol);
    car.connect(g); g.connect(dest);
    car.start(t); mod.start(t);
    car.stop(t + dur + 0.2); mod.stop(t + dur + 0.2);
  }

  function sweep(f0, f1, t, dur, vol, type, wet) {
    const c = ac();
    const dest = out(wet === undefined ? 0.35 : wet);
    const o = c.createOscillator();
    o.type = type || 'sawtooth';
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = c.createGain();
    env(g.gain, t, 0.008, dur, vol);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.1);
  }

  function blip(f, dur, vol, type, delay, to, wet) {
    const c = ac();
    const t = c.currentTime + 0.01 + (delay || 0);
    const dest = out(wet === undefined ? 0.35 : wet);
    const o = c.createOscillator();
    o.type = type || 'square';
    o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = c.createGain();
    env(g.gain, t, 0.008, dur, vol);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.05);
  }

  const SFX = {

    click: t => { noiseHit(t, 0.03, 3200, 1600, 'bandpass', 0.05, 1.2, 0.05); blip(1320, 0.03, 0.05, 'square', 0, 900, 0.05); },
    deny: t => { blip(220, 0.09, 0.09, 'square', 0, 150, 0.1); blip(180, 0.14, 0.08, 'square', 0.09, 120, 0.1); },
    tab: t => { blip(880, 0.05, 0.05, 'triangle', 0, 1320, 0.15); },
    place: t => { noiseHit(t, 0.07, 900, 2600, 'bandpass', 0.09, 2.4, 0.2); blip(520, 0.06, 0.06, 'triangle', 0, 780, 0.2); },

    card: t => { noiseHit(t, 0.06, 5200, 2600, 'highpass', 0.07, 0.8, 0.12); blip(660, 0.05, 0.05, 'triangle', 0.01, 990, 0.2); },

    event: t => { bellFm(784, t, 0.5, 0.10, 2.01, 1.4, 0.5); bellFm(1174, t + 0.09, 0.7, 0.085, 1.41, 1.1, 0.55); brassish(t, 0.4, 0.06); },
    eventSu: t => { sweep(392, 196, t, 0.45, 0.10, 'sawtooth', 0.4); timpani(t + 0.02, 0.3, 74); blip(294, 0.4, 0.07, 'sawtooth', 0.12, 196, 0.35); },
    eventCn: t => { bell(1046, t, 1.2, 0.09); gong(t + 0.02, 0.22); blip(784, 0.3, 0.05, 'triangle', 0.10, 587, 0.5); },

    score: t => { [523, 659, 784, 1046].forEach((f, i) => bellFm(f, t + i * 0.11, 0.55, 0.085, 2.01, 1.2, 0.5)); },
    turn: t => { noiseHit(t, 0.5, 300, 1800, 'bandpass', 0.05, 0.7, 0.4); blip(440, 0.22, 0.07, 'triangle', 0.02, 660, 0.3); blip(660, 0.3, 0.06, 'triangle', 0.16, 880, 0.3); },
    war: t => { timpani(t, 0.6, 92); noiseHit(t, 0.5, 1800, 260, 'bandpass', 0.18, 0.7, 0.3); sweep(150, 44, t, 0.8, 0.16, 'sawtooth', 0.25); },
    defcon: t => { sweep(220, 92, t, 0.7, 0.14, 'sawtooth', 0.2); timpani(t, 0.45, 70); noiseHit(t + 0.28, 0.6, 640, 320, 'bandpass', 0.1, 2.2, 0.5); },
    nuke: t => {
      timpani(t, 0.75, 96);
      noiseHit(t, 2.4, 1200, 120, 'lowpass', 0.2, 0.6, 0.5);
      sweep(180, 28, t, 2.6, 0.2, 'sawtooth', 0.4);
      sweep(60, 22, t + 0.3, 3.0, 0.16, 'sine', 0.6);
      bellFm(58, t + 0.5, 2.6, 0.1, 1.41, 0.6, 0.7);
    },
    ability: t => { bellFm(659, t, 0.6, 0.075, 3.01, 1.0, 0.6); bellFm(988, t + 0.12, 0.8, 0.06, 2.01, 0.9, 0.65); },

    headline: t => { [659, 784, 988, 1319].forEach((f, i) => { bellFm(f, t + i * 0.12, 0.6, 0.085, 2.01, 1.3, 0.5); }); timpani(t, 0.4, 88); },
    headlineSu: t => { [587, 587, 466, 349].forEach((f, i) => sweep(f, f * 0.99, t + i * 0.2, 0.35, 0.09, 'sawtooth', 0.45)); timpani(t, 0.5, 68); timpani(t + 0.4, 0.4, 62); },
    headlineCn: t => { gong(t, 0.3); [523, 587, 784, 1046].forEach((f, i) => bell(f, t + 0.06 + i * 0.14, 1.0, 0.07)); },
    win: t => { [523, 659, 784, 1046, 1319].forEach((f, i) => bellFm(f, t + i * 0.13, 0.9, 0.09, 2.01, 1.2, 0.6)); },
    lose: t => { [440, 415, 392, 294].forEach((f, i) => sweep(f, f * 0.97, t + i * 0.18, 0.5, 0.09, 'sawtooth', 0.45)); timpani(t + 0.6, 0.5, 58); },
    tutorial: t => { blip(988, 0.08, 0.06, 'triangle', 0, 1319, 0.4); blip(1319, 0.12, 0.05, 'triangle', 0.08, 1568, 0.4); }
  };

  function brassish(t, dur, vol) {
    const c = ac();
    const dest = out(0.4);
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(600, t);
    f.frequency.linearRampToValueAtTime(2600, t + 0.08);
    f.frequency.linearRampToValueAtTime(1200, t + dur);
    f.connect(dest);
    [0, 4, 7].forEach(s => {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = 261.63 * Math.pow(2, s / 12) * 2;
      const g = c.createGain();
      env(g.gain, t, 0.05, dur, vol);
      o.connect(g); g.connect(f);
      o.start(t); o.stop(t + dur + 0.1);
    });
  }

  function sfx(name) {
    const c = ac();
    if (!c || A.muted) return;
    build();
    if (c.state === 'suspended' && c.resume) c.resume();
    const fn = SFX[name];
    if (!fn) return;
    fn(c.currentTime + 0.01);
  }



  let IDS = null;
  function cardIds() {
    if (IDS) return IDS;
    const D = global.CWData;
    IDS = (D && D.CARDS) ? D.CARDS.filter(c => !c.score).map(c => c.id).sort() : [];
    return IDS;
  }

  const SIDE_TONE = {
    us: { scale: 'maj', root: 65.41, pool: [0, 3, 4, 5, 2, 6], timbres: ['square', 'triangle', 'sawtooth'] },
    ussr: { scale: 'min', root: 55.00, pool: [0, 5, 2, 6, 3, 4], timbres: ['sawtooth', 'triangle', 'square'] },
    cn: { scale: 'penta', root: 62.00, pool: [0, 2, 4, 3, 5, 6], timbres: ['triangle', 'sine', 'square'] }
  };

  function stingSpec(cardId, side) {
    const ids = cardIds();
    let i = ids.indexOf(cardId);
    if (i < 0) i = hash(String(cardId)) >>> 0;
    const tone = SIDE_TONE[side] || SIDE_TONE.us;
    const shapes = [
      [0, 2, 4], [0, 4, 2], [0, 3, 4], [0, 2, 3], [4, 2, 0], [0, 4, 2, 5],
      [0, 1, 4], [0, 2, 4, 2], [0, 2, 4, 5], [0, 4, 3, 2], [0, 3, 2, 4], [4, 3, 2, 0]
    ];
    const steps = [0.22, 0.26, 0.30, 0.24];
    let n = i;
    const deg = tone.pool[n % tone.pool.length]; n = Math.floor(n / tone.pool.length);
    const shape = shapes[n % shapes.length]; n = Math.floor(n / shapes.length);
    const wave = tone.timbres[n % tone.timbres.length]; n = Math.floor(n / tone.timbres.length);
    const step = steps[n % steps.length];
    return { scale: tone.scale, root: tone.root, deg, shape, wave, step, bell: (i % 3) === 0, index: i, h: hash(String(cardId)) };
  }

  function cardSting(cardId, side) {
    const c = ac();
    if (!c || A.muted) return;
    build();
    if (c.state === 'suspended' && c.resume) c.resume();
    const sp = stingSpec(cardId, side);
    duck(2.8);
    const t0 = c.currentTime + 0.04;
    const tri = [sp.deg, sp.deg + 2, sp.deg + 4].map(d => deg2semi(d, sp.scale));

    const savedMood = A.mood;
    A.mood = side === 'cn' ? 'cn' : (side === 'ussr' ? 'ussr' : 'us');
    pad(tri.map(s => s + 12), t0, 2.4, 0.05, 'sawtooth');
    A.mood = savedMood;
    timpani(t0, 0.42, 92);
    snare(t0 + 0.5, 0.14);
    for (let i = 0; i < sp.shape.length; i++) {
      lead(freq(sp.root, deg2semi(sp.deg + sp.shape[i], sp.scale), 2), t0 + 0.16 + i * sp.step, sp.step * 2.4, 0.082, sp.wave);
    }
    if (sp.bell) bellFm(freq(sp.root, deg2semi(sp.deg + 7, sp.scale), 4), t0 + 0.2 + sp.shape.length * sp.step, 1.6, 0.035, 2.01, 1.0, 0.6);
  }

  function warm() {
    const c = ac();
    if (!c) return false;
    build();
    if (c.state === 'suspended' && c.resume) c.resume();
    return true;
  }

  global.CWMusicProc = {
    start, stop, setMood, setMuted, sfx, warm, cardSting, duck, stingSpec,
    moods: Object.keys(CFG),
    available: !!(global.AudioContext || global.webkitAudioContext)
  };
})(typeof window !== 'undefined' ? window : globalThis);
