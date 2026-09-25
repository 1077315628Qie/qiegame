(function (global) {
  'use strict';









  const TUTORIAL_HAND = [
    'iron_curtain', 'soviet_atom', 'warsaw_pact', 'de_gaulle',
    'score_europe_e', 'marshall_plan', 'truman_doctrine', 'containment'
  ];
  const TUTORIAL_SEED = 19491001;

  const T = { index: 0, stat: {}, finished: false };

  function reset() {
    T.index = 0;
    T.stat = {};
    T.finished = false;
  }


  function note(kind) {
    if (T.finished) return;
    T.stat[kind] = (T.stat[kind] || 0) + 1;
  }

  function stats() { return T.stat; }

  const STEPS = [
    {
      id: 'intro',
      title: '欢迎来到《核边缘》',
      target: null,
      body: '你执<b>苏联</b>，先手，对手是电脑操控的<b>美国</b>与<b>中国</b>。目标是把自己的<b>领先优势</b>推到 20 VP，或者用别的方式直接取胜。这一局是教学局：我会一步一步告诉你要做什么，随时可以跳过。',
      tip: '先点右下角的「继续」。',
      done: () => false
    },
    {
      id: 'headline',
      title: '第一步 · 头条阶段',
      target: 'hand',
      body: '每回合开始时，三方各<b>秘密</b>选一张手牌作为<b>头条事件</b>，然后同时揭晓。<br>记分牌不能当头条。头条只结算事件本身，<b>不消耗行动点</b>，也不会占掉你的行动轮。',
      tip: '在手牌里点一张<b>不是记分牌</b>的牌，把它作为头条（例如《铁幕》）。',
      done: G => (T.stat.headline || 0) > 0
    },
    {
      id: 'headline_show',
      title: '头条揭晓',
      target: 'headline',
      body: '三方头条按<b>苏联 → 美国 → 中国</b>的顺序结算。注意看每一张牌为谁触发、改变了哪些国家的态势。<br>右上角的 VP 三条轨道会告诉你谁在领先。',
      tip: '看完后点头条面板继续。',
      done: G => G.phase === 'action'
    },
    {
      id: 'event',
      title: '第二步 · 行动轮：打出事件',
      target: 'hand',
      body: '进入行动轮。顺序是<b>苏联 → 美国 → 中国</b>，轮流行动，每人每回合有 6～8 个行动轮。<br>轮到你时，点手牌会弹出四种用法。第一种是<b>打出自己的事件牌</b>：立即结算牌面上的历史事件。',
      tip: '点一张<b>苏联的牌</b>（牌框是红色的），选「打出事件」。',
      done: G => (T.stat.event || 0) > 0
    },
    {
      id: 'influence',
      title: '第三步 · 行动点：放置影响力',
      target: 'map',
      body: '第二种用法是<b>使用行动点</b>。卡牌左上角的数字就是行动点。<br>「放置影响力」：点地图上的国家，花 1 点放 1 点影响力（如果目标已被别人<b>控制</b>则要 2 点）。<br><b>控制</b>的条件是：你的影响力 − 其他人中最高的 ≥ 该国稳定度。',
      tip: '选「放置影响力」，然后在地图上点两三个国家。',
      done: G => (T.stat.influence || 0) > 0
    },
    {
      id: 'coup',
      title: '第四步 · 政变（军力行动的关键）',
      target: 'map',
      body: '第三种用法是<b>发动政变</b>：一次性消耗整张牌的行动点，掷 <code>1d6 + 行动点 − 2×稳定度</code>，正数就能把对方影响力打掉、并转成自己的。<br>政变会<b>降低 1 级 DEFCON</b>，同时为你的<b>军力行动</b>累积等于行动点的数值。<br>每回合结束时要求「军力行动 ≥ DEFCON」，否则对方白拿 VP —— 所以政变不只是进攻，也是必须完成的功课。',
      tip: '选「发动政变」，再点一个目标国家。DEFCON 2 时不能政变。',
      done: G => (T.stat.coup || 0) > 0
    },
    {
      id: 'space',
      title: '第五步 · 太空竞赛：安全出口',
      target: 'hand',
      body: '手牌里常常有<b>对方的</b>事件牌（牌框是对方颜色）。用它的行动点时会<b>先替对方触发事件</b>，很吃亏。<br>这时用第四种用法<b>「太空竞赛」</b>：整张牌投进去，<b>不会触发事件</b>，掷骰成功还能拿 VP。<br>中国玩家「不结盟运动」、太空竞赛，都是处理危险牌的安全出口。',
      tip: '挑一张<b>对方的牌</b>（或任意牌），选「太空竞赛」。',
      done: G => (T.stat.space || 0) > 0
    },
    {
      id: 'ability',
      title: '第六步 · 阵营能力',
      target: 'btnAbility',
      body: '每个阵营每回合有一次<b>免费</b>的阵营能力，不花行动点、也不结束行动轮。<br>'
        + '美苏各自是《自由世界广播》与《国际共运》：在「其他两方都没有影响力」的国家免费 +1 影响力。<br>'
        + '<b>中国是《不结盟运动》：+2 中国点数</b>。中国点数不是影响力，而是一种压力 —— '
        + '它会让美苏在<b>中国活动范围内（亚洲 / 非洲 / 中东）</b>的「空余国家」每点多花最多 +1 行动点'
        + '（欧洲与美洲照常计价）。美苏每多付 1 点，中国点数就 −1；'
        + '每回合结束还会自然 −1。',
      tip: '点右侧的「阵营能力」按钮（中国的技能不需要选目标，直接发动）。',
      done: G => (T.stat.ability || 0) > 0
    },
    {
      id: 'score',
      title: '第七步 · 区域记分',
      target: 'hand',
      body: '记分牌（如《欧洲记分》）结算整个区域：<code>存在 1 + 控制的战场国数 + 控制国数 ÷ 3（向下取整）+ 主导/控制加成</code>。<br>三方各算一次分，<b>分最高的一方</b>拿到与第二名的差额 VP。<br>回合结束时手上还剩的记分牌会被强制结算，所以别指望一直捏在手里。',
      tip: '如果你手上有记分牌，就打出去；没有就点「跳过本步」。',
      done: G => (T.stat.score || 0) > 0
    },
    {
      id: 'endturn',
      title: '第八步 · 回合结束',
      target: 'banner',
      body: '一个回合的收尾顺序：结算手中记分牌 → <b>军力行动检查</b>（不足的部分变成对方的 VP）→ DEFCON 缓和 1 级 → 进入下一回合并补牌。<br>补牌时每方会保证拿到至少 2 张<b>自己的</b>事件牌，别担心一直摸到对方的牌。',
      tip: '正常打完本回合，进入第 2 回合。',
      done: G => G.turn >= 2
    },
    {
      id: 'china',
      title: '关于中国：第三世界领袖',
      target: 'factions',
      body: '中国是可玩阵营，但它<b>不是第三个超级大国</b>，玩的也不是同一盘棋：<br>'
        + '· <b>行动范围只到中东、非洲、亚洲</b> —— 它进不了欧洲与美洲；<br>'
        + '· <b>没有速胜手段</b> —— 不能靠 20 VP 取胜，也不能靠控制欧洲取胜，'
        + '只有在终局（第 10 回合结束）领先才算赢；<br>'
        + '· <b>它的技能是「不结盟运动」</b> —— 积攒中国点数，让美苏更难进入空余国家；'
        + '它每打出一张自己的事件牌也会 +1 点数。<br>'
        + '中国牌组里有万隆会议、两弹一星、恢复联合国合法席位、改革开放等一整套自己的历史事件。<br>'
        + '在主菜单把座位交给中国，就能亲自体验这个「让世界变贵」的角色。',
      tip: '点「继续」结束教学，接着自由对局。',
      done: () => false
    }
  ];

  function active() { return !T.finished; }
  function index() { return T.index; }
  function step(i) { return STEPS[i === undefined ? T.index : i] || null; }
  function count() { return STEPS.length; }


  function reached(G) {
    const s = step();
    if (!s || !G) return false;
    try { return !!s.done(G); } catch (e) { return false; }
  }

  function next() {
    if (T.index >= STEPS.length - 1) { T.finished = true; return false; }
    T.index++;
    return true;
  }
  function prev() {
    if (T.index <= 0) return false;
    T.index--;
    return true;
  }
  function skip() { return next(); }
  function finish() { T.finished = true; }
  function finished() { return T.finished; }


  function applyHand(G) {
    if (!G || !G.tutorial) return;
    const deck = G.deck;
    TUTORIAL_HAND.forEach(id => {
      const i = deck.indexOf(id);
      if (i >= 0) deck.splice(i, 1);
    });
    G.hands.ussr = TUTORIAL_HAND.slice(0, G.arMax);
  }

  global.CWTutorial = {
    STEPS, TUTORIAL_HAND, TUTORIAL_SEED,
    reset, note, stats, active, finished, finish,
    index, step, count, reached, next, prev, skip, applyHand
  };
})(typeof window !== 'undefined' ? window : globalThis);
