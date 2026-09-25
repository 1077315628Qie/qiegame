(function (global) {
  'use strict';




  const SIDES = ['us', 'ussr', 'cn'];
  const SIDE_NAME = { us: '美国', ussr: '苏联', cn: '中国' };
  const SIDE_CLS = { us: 'us', ussr: 'su', cn: 'cn' };
  const SIDE_FLAG = { us: 'us', ussr: 'su', cn: 'cn' };
  const TURN_ORDER = ['ussr', 'us', 'cn'];
  const VICTORY_VP = 20;








  const THIRD_WORLD = ['asia', 'africa', 'mideast'];
  const CHINA_RULE = {
    regions: THIRD_WORLD,
    vpTarget: null,
    fastWin: false,
    abilityName: '不结盟运动'
  };
  const CN_POINT = {
    cap: 3,
    taxMax: 1,
    abilityGain: 2,
    eventGain: 1,
    decay: 1
  };

  const ABILITIES = {
    us: {
      name: '自由世界广播', kind: 'influence', power: 1,
      desc: '每回合一次：在 1 个既无苏联也无中国影响力的国家免费 +1 美国影响力。'
    },
    ussr: {
      name: '国际共运', kind: 'influence', power: 1,
      desc: '每回合一次：在 1 个既无美国也无中国影响力的国家免费 +1 苏联影响力。'
    },
    cn: {
      name: CHINA_RULE.abilityName, kind: 'points', power: CN_POINT.abilityGain,
      desc: `每回合一次（免费，不需要选目标）：+${CN_POINT.abilityGain} 中国点数（上限 ${CN_POINT.cap}，`
        + `每回合结束自然消散 ${CN_POINT.decay}）。中国点数会让美国与苏联在`
        + `**中国活动范围内（亚洲 / 非洲 / 中东）**的「空余国家」`
        + `（美苏都还没有影响力的国家）放置影响力时，每点多花最多 +${CN_POINT.taxMax} 行动点；`
        + `美苏每多付 1 点，中国点数就 −1（欧洲与美洲照常计价）。`
    }
  };

  const REGIONS = [
    { id: 'europe',  name: '欧洲',     cls: 'r-europe'  },
    { id: 'asia',    name: '亚洲',     cls: 'r-asia'    },
    { id: 'mideast', name: '中东',     cls: 'r-mideast' },
    { id: 'africa',  name: '非洲',     cls: 'r-africa'  },
    { id: 'centam',  name: '中美洲',   cls: 'r-centam'  },
    { id: 'southam', name: '南美洲',   cls: 'r-southam' }
  ];

  const COUNTRIES = [
    { id: 'canada',        name: '加拿大',     region: 'europe', stab: 4, bg: false, adj: ['uk'],                                                                   us: 1 },
    { id: 'uk',            name: '英国',       region: 'europe', stab: 5, bg: true,  adj: ['canada', 'france', 'norway'] },
    { id: 'france',        name: '法国',       region: 'europe', stab: 3, bg: true,  adj: ['uk', 'wgermany', 'italy', 'spain', 'algeria'] },
    { id: 'wgermany',      name: '西德',       region: 'europe', stab: 4, bg: true,  adj: ['france', 'benelux', 'denmark', 'austria', 'eastgermany'] },
    { id: 'eastgermany',   name: '东德',       region: 'europe', stab: 3, bg: true,  adj: ['wgermany', 'poland', 'czechoslovakia', 'austria'] },
    { id: 'poland',        name: '波兰',       region: 'europe', stab: 3, bg: true,  adj: ['eastgermany', 'czechoslovakia'] },
    { id: 'italy',         name: '意大利',     region: 'europe', stab: 2, bg: true,  adj: ['france', 'austria', 'yugoslavia', 'greece'] },
    { id: 'benelux',       name: '比荷卢',     region: 'europe', stab: 3, bg: false, adj: ['wgermany', 'france', 'uk'] },
    { id: 'denmark',       name: '丹麦',       region: 'europe', stab: 3, bg: false, adj: ['wgermany', 'norway', 'sweden'] },
    { id: 'norway',        name: '挪威',       region: 'europe', stab: 4, bg: false, adj: ['uk', 'denmark', 'sweden'] },
    { id: 'sweden',        name: '瑞典',       region: 'europe', stab: 4, bg: false, adj: ['norway', 'denmark', 'finland'] },
    { id: 'finland',       name: '芬兰',       region: 'europe', stab: 4, bg: false, adj: ['sweden'] },
    { id: 'austria',       name: '奥地利',     region: 'europe', stab: 4, bg: false, adj: ['wgermany', 'italy', 'eastgermany', 'czechoslovakia', 'hungary', 'yugoslavia'] },
    { id: 'czechoslovakia',name: '捷克斯洛伐克',region: 'europe', stab: 3, bg: true,  adj: ['eastgermany', 'poland', 'austria', 'hungary'] },
    { id: 'hungary',       name: '匈牙利',     region: 'europe', stab: 3, bg: true,  adj: ['austria', 'czechoslovakia', 'yugoslavia', 'romania'] },
    { id: 'yugoslavia',    name: '南斯拉夫',   region: 'europe', stab: 3, bg: true,  adj: ['italy', 'austria', 'hungary', 'romania', 'greece'] },
    { id: 'romania',       name: '罗马尼亚',   region: 'europe', stab: 3, bg: true,  adj: ['hungary', 'yugoslavia', 'bulgaria'] },
    { id: 'bulgaria',      name: '保加利亚',   region: 'europe', stab: 3, bg: true,  adj: ['romania', 'yugoslavia', 'greece', 'turkey'] },
    { id: 'greece',        name: '希腊',       region: 'europe', stab: 2, bg: true,  adj: ['yugoslavia', 'bulgaria', 'turkey', 'italy'] },
    { id: 'turkey',        name: '土耳其',     region: 'europe', stab: 2, bg: true,  adj: ['greece', 'bulgaria', 'syria', 'iran'] },
    { id: 'spain',         name: '西班牙',     region: 'europe', stab: 3, bg: false, adj: ['france', 'portugal', 'morocco'] },
    { id: 'portugal',      name: '葡萄牙',     region: 'europe', stab: 3, bg: false, adj: ['spain'] },

    { id: 'china',         name: '中国',       region: 'asia', stab: 4, bg: true,  adj: ['northkorea', 'vietnam', 'laos', 'burma', 'india', 'pakistan', 'afghanistan', 'mongolia'], cn: 1 },
    { id: 'afghanistan',   name: '阿富汗',     region: 'asia', stab: 2, bg: true,  adj: ['pakistan', 'iran', 'china'], cn: 1 },
    { id: 'pakistan',      name: '巴基斯坦',   region: 'asia', stab: 2, bg: true,  adj: ['afghanistan', 'india', 'iran', 'china'], cn: 1 },
    { id: 'india',         name: '印度',       region: 'asia', stab: 3, bg: true,  adj: ['pakistan', 'burma', 'china', 'srilanka', 'bangladesh'], cn: 1 },
    { id: 'northkorea',    name: '朝鲜',       region: 'asia', stab: 3, bg: true,  adj: ['southkorea', 'china'], cn: 1 },
    { id: 'southkorea',    name: '韩国',       region: 'asia', stab: 3, bg: true,  adj: ['northkorea', 'japan'], us: 1 },
    { id: 'japan',         name: '日本',       region: 'asia', stab: 4, bg: true,  adj: ['southkorea', 'taiwan'], us: 1 },
    { id: 'taiwan',        name: '中国台湾',   region: 'asia', stab: 3, bg: true,  adj: ['japan', 'philippines'] },
    { id: 'philippines',   name: '菲律宾',     region: 'asia', stab: 2, bg: false, adj: ['taiwan', 'indonesia'], us: 1 },
    { id: 'indonesia',     name: '印度尼西亚', region: 'asia', stab: 1, bg: false, adj: ['philippines', 'malaysia', 'australia'] },
    { id: 'malaysia',      name: '马来西亚',   region: 'asia', stab: 2, bg: false, adj: ['indonesia', 'thailand'] },
    { id: 'thailand',      name: '泰国',       region: 'asia', stab: 2, bg: true,  adj: ['malaysia', 'laos', 'burma', 'cambodia'] },
    { id: 'laos',          name: '老挝',       region: 'asia', stab: 2, bg: false, adj: ['thailand', 'burma', 'vietnam', 'china', 'cambodia'], cn: 1 },
    { id: 'vietnam',       name: '越南',       region: 'asia', stab: 2, bg: false, adj: ['laos', 'china', 'cambodia'], cn: 1 },
    { id: 'burma',         name: '缅甸',       region: 'asia', stab: 2, bg: false, adj: ['india', 'laos', 'thailand', 'china', 'bangladesh'], cn: 1 },
    { id: 'australia',     name: '澳大利亚',   region: 'asia', stab: 4, bg: true,  adj: ['indonesia'], us: 1 },


    { id: 'mongolia',      name: '蒙古',       region: 'asia',    stab: 3, bg: true,  adj: ['china'], ussr: 1 },
    { id: 'cambodia',      name: '柬埔寨',     region: 'asia',    stab: 1, bg: true,  adj: ['vietnam', 'laos', 'thailand'], cn: 1 },
    { id: 'srilanka',      name: '斯里兰卡',   region: 'asia',    stab: 2, bg: false, adj: ['india'] },
    { id: 'bangladesh',    name: '孟加拉国',   region: 'asia',    stab: 1, bg: false, adj: ['india', 'burma'] },

    { id: 'lebanon',       name: '黎巴嫩',     region: 'mideast', stab: 1, bg: false, adj: ['israel', 'syria', 'jordan'] },
    { id: 'israel',        name: '以色列',     region: 'mideast', stab: 4, bg: true,  adj: ['lebanon', 'syria', 'jordan', 'egypt'], us: 1 },
    { id: 'syria',         name: '叙利亚',     region: 'mideast', stab: 2, bg: false, adj: ['lebanon', 'israel', 'jordan', 'turkey', 'iraq'] },
    { id: 'jordan',        name: '约旦',       region: 'mideast', stab: 2, bg: false, adj: ['israel', 'syria', 'iraq', 'saudi', 'egypt'] },
    { id: 'iraq',          name: '伊拉克',     region: 'mideast', stab: 3, bg: true,  adj: ['syria', 'jordan', 'iran', 'gulfstates', 'saudi', 'turkey'] },
    { id: 'iran',          name: '伊朗',       region: 'mideast', stab: 2, bg: true,  adj: ['iraq', 'afghanistan', 'pakistan', 'turkey'] },
    { id: 'saudi',         name: '沙特阿拉伯', region: 'mideast', stab: 3, bg: true,  adj: ['jordan', 'iraq', 'gulfstates', 'yemen'], us: 1 },
    { id: 'gulfstates',    name: '海湾国家',   region: 'mideast', stab: 3, bg: true,  adj: ['saudi', 'iraq', 'iran'], us: 1 },
    { id: 'egypt',         name: '埃及',       region: 'mideast', stab: 2, bg: true,  adj: ['israel', 'jordan', 'libya', 'sudan'] },
    { id: 'libya',         name: '利比亚',     region: 'mideast', stab: 2, bg: true,  adj: ['egypt', 'tunisia', 'algeria', 'sahara', 'sudan'] },
    { id: 'sudan',         name: '苏丹',       region: 'africa', stab: 1, bg: false, adj: ['egypt', 'libya', 'sahara', 'ethiopia', 'centralafrica'] },
    { id: 'ethiopia',      name: '埃塞俄比亚', region: 'africa', stab: 1, bg: false, adj: ['sudan', 'somalia', 'kenya', 'africa_minors'] },
    { id: 'somalia',       name: '索马里',     region: 'africa', stab: 2, bg: false, adj: ['ethiopia', 'kenya', 'africa_minors'] },


    { id: 'yemen',         name: '也门',       region: 'mideast', stab: 1, bg: false, adj: ['saudi'] },

    { id: 'morocco',       name: '摩洛哥',     region: 'africa', stab: 3, bg: false, adj: ['algeria', 'spain'] },
    { id: 'algeria',       name: '阿尔及利亚', region: 'africa', stab: 2, bg: true,  adj: ['morocco', 'tunisia', 'libya', 'sahara', 'france'] },
    { id: 'tunisia',       name: '突尼斯',     region: 'africa', stab: 2, bg: false, adj: ['algeria', 'libya'] },
    { id: 'sahara',        name: '撒哈拉',     region: 'africa', stab: 1, bg: false, adj: ['algeria', 'libya', 'sudan', 'nigeria', 'westafrica', 'centralafrica'] },
    { id: 'westafrica',    name: '西非',       region: 'africa', stab: 2, bg: false, adj: ['sahara', 'ivorycoast', 'africa_islands'] },
    { id: 'ivorycoast',    name: '科特迪瓦',   region: 'africa', stab: 2, bg: false, adj: ['westafrica', 'nigeria'] },
    { id: 'nigeria',       name: '尼日利亚',   region: 'africa', stab: 1, bg: true,  adj: ['sahara', 'ivorycoast', 'centralafrica'] },
    { id: 'zaire',         name: '扎伊尔',     region: 'africa', stab: 1, bg: true,  adj: ['angola', 'tanzania', 'zambia', 'centralafrica'] },
    { id: 'angola',        name: '安哥拉',     region: 'africa', stab: 1, bg: true,  adj: ['zaire', 'zambia', 'namibia', 'africa_minors'] },
    { id: 'southafrica',   name: '南非',       region: 'africa', stab: 3, bg: true,  adj: ['zimbabwe', 'mozambique', 'africa_islands', 'africa_minors', 'namibia'] },
    { id: 'zimbabwe',      name: '津巴布韦',   region: 'africa', stab: 1, bg: false, adj: ['southafrica', 'zambia', 'mozambique'] },
    { id: 'kenya',         name: '肯尼亚',     region: 'africa', stab: 2, bg: false, adj: ['ethiopia', 'somalia', 'tanzania', 'centralafrica'] },


    { id: 'tanzania',      name: '坦桑尼亚',   region: 'africa',  stab: 2, bg: true,  adj: ['kenya', 'zaire', 'zambia', 'mozambique', 'centralafrica'], cn: 1 },
    { id: 'zambia',        name: '赞比亚',     region: 'africa',  stab: 2, bg: false, adj: ['zaire', 'tanzania', 'mozambique', 'zimbabwe', 'angola', 'centralafrica', 'namibia', 'africa_minors'], cn: 1 },
    { id: 'mozambique',    name: '莫桑比克',   region: 'africa',  stab: 1, bg: true,  adj: ['tanzania', 'zambia', 'zimbabwe', 'southafrica', 'africa_islands'], ussr: 1 },

    { id: 'centralafrica', name: '中部非洲',   region: 'africa',  stab: 2, bg: false, adj: ['nigeria', 'zaire', 'zambia', 'tanzania', 'kenya', 'sudan', 'sahara'] },
    { id: 'africa_islands',name: '非洲岛国',   region: 'africa',  stab: 3, bg: false, adj: ['mozambique', 'westafrica', 'southafrica'] },
    { id: 'africa_minors', name: '非洲小国',   region: 'africa',  stab: 3, bg: false, adj: ['ethiopia', 'somalia', 'southafrica', 'zimbabwe', 'angola', 'zambia'] },
    { id: 'namibia',       name: '纳米比亚',   region: 'africa',  stab: 2, bg: false, adj: ['angola', 'southafrica', 'zambia'] },

    { id: 'mexico',        name: '墨西哥',     region: 'centam', stab: 2, bg: true,  adj: ['guatemala'], us: 1 },
    { id: 'guatemala',     name: '危地马拉',   region: 'centam', stab: 1, bg: false, adj: ['mexico', 'elsalvador', 'honduras'] },
    { id: 'elsalvador',    name: '萨尔瓦多',   region: 'centam', stab: 1, bg: false, adj: ['guatemala', 'honduras'] },
    { id: 'honduras',      name: '洪都拉斯',   region: 'centam', stab: 2, bg: false, adj: ['guatemala', 'elsalvador', 'nicaragua', 'costarica'] },
    { id: 'nicaragua',     name: '尼加拉瓜',   region: 'centam', stab: 1, bg: false, adj: ['honduras', 'costarica', 'cuba'] },
    { id: 'costarica',     name: '哥斯达黎加', region: 'centam', stab: 3, bg: false, adj: ['honduras', 'nicaragua', 'panama'] },
    { id: 'panama',        name: '巴拿马',     region: 'centam', stab: 2, bg: true,  adj: ['costarica', 'colombia'], us: 1 },
    { id: 'cuba',          name: '古巴',       region: 'centam', stab: 3, bg: true,  adj: ['nicaragua', 'haiti', 'venezuela'], us: 1 },
    { id: 'haiti',         name: '海地',       region: 'centam', stab: 1, bg: false, adj: ['cuba', 'dominican'] },
    { id: 'dominican',     name: '多米尼加',   region: 'centam', stab: 1, bg: false, adj: ['haiti'], us: 1 },

    { id: 'venezuela',     name: '委内瑞拉',   region: 'southam', stab: 2, bg: true,  adj: ['colombia', 'brazil', 'cuba'], us: 1 },
    { id: 'colombia',      name: '哥伦比亚',   region: 'southam', stab: 1, bg: false, adj: ['panama', 'venezuela', 'ecuador', 'peru', 'brazil'] },
    { id: 'ecuador',       name: '厄瓜多尔',   region: 'southam', stab: 2, bg: false, adj: ['colombia', 'peru'] },
    { id: 'peru',          name: '秘鲁',       region: 'southam', stab: 2, bg: false, adj: ['ecuador', 'colombia', 'brazil', 'bolivia', 'chile'] },
    { id: 'chile',         name: '智利',       region: 'southam', stab: 3, bg: true,  adj: ['peru', 'bolivia', 'argentina'], us: 1 },
    { id: 'argentina',     name: '阿根廷',     region: 'southam', stab: 2, bg: true,  adj: ['chile', 'bolivia', 'paraguay', 'uruguay', 'brazil'], us: 1 },
    { id: 'uruguay',       name: '乌拉圭',     region: 'southam', stab: 2, bg: false, adj: ['argentina', 'brazil'] },
    { id: 'paraguay',      name: '巴拉圭',     region: 'southam', stab: 2, bg: false, adj: ['argentina', 'bolivia', 'brazil'] },
    { id: 'bolivia',       name: '玻利维亚',   region: 'southam', stab: 2, bg: false, adj: ['peru', 'chile', 'argentina', 'paraguay', 'brazil'] },
    { id: 'brazil',        name: '巴西',       region: 'southam', stab: 2, bg: true,  adj: ['venezuela', 'colombia', 'peru', 'bolivia', 'paraguay', 'uruguay', 'argentina'], us: 1 }
  ];

  const SETUP = {






    ussr: {
      eastgermany: 3, poland: 3, czechoslovakia: 3, hungary: 3, romania: 3,
      bulgaria: 3, northkorea: 3, afghanistan: 1, syria: 1, finland: 2,
      yugoslavia: 1, vietnam: 1, algeria: 1, iran: 1, austria: 1
    },
    us: {
      wgermany: 2, france: 2, italy: 1, benelux: 1, uk: 2, greece: 2,
      turkey: 2, japan: 4, iran: 1, israel: 1, panama: 1, canada: 2,
      australia: 1, mexico: 1, southkorea: 1
    },
    cn: {

      china: 7, burma: 2, indonesia: 2, pakistan: 1, laos: 1, taiwan: 1,
      cambodia: 1, tanzania: 2, zambia: 2
    }
  };

  const AR_STANDARD = [6, 7, 7, 8, 8, 8, 8, 8, 8, 8];
  const AR_SHORT    = [6, 7, 7, 8, 8, 8];
  const ERA_BY_TURN = ['early', 'early', 'early', 'mid', 'mid', 'mid', 'mid', 'late', 'late', 'late'];
  const SPACE_REQ = [1, 1, 2, 2, 3, 3, 4, 4];
  const SPACE_VP  = [1, 1, 1, 2, 1, 1, 2, 3];

  const CARDS = [

    { id: 'iron_curtain', name: '铁幕', side: 'ussr', era: 'early', ops: 3, set: 'base',
      desc: '在波兰、东德、捷克斯洛伐克、匈牙利、罗马尼亚、保加利亚、南斯拉夫各加 1 点苏联影响力。',
      effect(h) { ['poland', 'eastgermany', 'czechoslovakia', 'hungary', 'romania', 'bulgaria', 'yugoslavia'].forEach(cid => h.add(cid, 1)); } },
    { id: 'warsaw_pact', name: '华约成立', side: 'ussr', era: 'early', ops: 3, set: 'base',
      desc: '在东德加 2 点、波兰与捷克斯洛伐克各加 1 点苏联影响力；苏联 +1 VP。',
      effect(h) { h.add('eastgermany', 2); h.add('poland', 1); h.add('czechoslovakia', 1); h.vpMe(1); } },
    { id: 'cominform', name: '共产党情报局', side: 'ussr', era: 'early', ops: 2, set: 'base',
      desc: '在东欧选择 3 个国家，各加 1 点苏联影响力。',
      effect(h) { h.choose({ count: 3, from: h.region('europe'), title: '共产党情报局', hint: '选择 3 个欧洲国家各加 1 点苏联影响力' }, ids => ids.forEach(cid => h.add(cid, 1))); } },
    { id: 'korean_war', name: '朝鲜战争', side: 'ussr', era: 'early', ops: 2, set: 'base',
      desc: '在韩国发动战争（+1）。获胜则苏联控制韩国并 +2 VP。',
      effect(h) { h.war('southkorea', 1, 2); } },
    { id: 'suez_crisis', name: '苏伊士运河危机', side: 'ussr', era: 'early', ops: 1, set: 'base',
      desc: '从英国、法国各移除 2 点美国影响力。',
      effect(h) { h.rmFor('us', 'uk', 2); h.rmFor('us', 'france', 2); } },
    { id: 'hungarian_rev', name: '匈牙利事件', side: 'ussr', era: 'early', ops: 2, set: 'base',
      desc: '在匈牙利加 2 点苏联影响力；苏联 +1 VP。',
      effect(h) { h.add('hungary', 2); h.vpMe(1); } },
    { id: 'sputnik', name: '斯普特尼克', side: 'ussr', era: 'early', ops: 2, set: 'base',
      desc: '苏联太空竞赛前进 2 格。',
      effect(h) { h.space(2); } },
    { id: 'de_gaulle', name: '戴高乐上台', side: 'ussr', era: 'early', ops: 2, set: 'base',
      desc: '从法国移除 2 点美国影响力；苏联 +1 VP。',
      effect(h) { h.rmFor('us', 'france', 2); h.vpMe(1); } },
    { id: 'nasser', name: '纳赛尔革命', side: 'ussr', era: 'early', ops: 1, set: 'base',
      desc: '在埃及加 2 点苏联影响力；苏联 +1 VP。',
      effect(h) { h.add('egypt', 2); h.vpMe(1); } },
    { id: 'castro', name: '古巴革命', side: 'ussr', era: 'early', ops: 2, set: 'base',
      desc: '移除古巴全部美国影响力，并加 3 点苏联影响力；苏联 +1 VP。',
      effect(h) { h.all('cuba', 'us'); h.add('cuba', 3); h.vpMe(1); } },
    { id: 'finlandization', name: '芬兰化', side: 'ussr', era: 'early', ops: 1, set: 'base',
      desc: '在芬兰加 2 点苏联影响力。',
      effect(h) { h.add('finland', 2); } },
    { id: 'soviet_atom', name: '苏联试爆原子弹', side: 'ussr', era: 'early', ops: 2, set: 'base',
      desc: 'DEFCON 下降 1；苏联 +2 VP。',
      effect(h) { h.defcon(-1); h.vpMe(2); } },
    { id: 'arab_israeli', name: '第一次中东战争', side: 'ussr', era: 'early', ops: 2, set: 'base',
      desc: '在以色列发动战争（±0）。',
      effect(h) { h.war('israel', 0, 2); } },


    { id: 'marshall_plan', name: '马歇尔计划', side: 'us', era: 'early', ops: 4, set: 'base',
      desc: '在西欧选择 7 个国家，各加 1 点美国影响力。',
      effect(h) {
        const pool = h.region('europe').filter(cid => h.infl(cid, 'ussr') === 0 && h.infl(cid, 'cn') === 0);
        h.choose({ count: 7, from: pool, title: '马歇尔计划', hint: '选择 7 个西欧国家各加 1 点美国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
      } },
    { id: 'truman_doctrine', name: '杜鲁门主义', side: 'us', era: 'early', ops: 1, set: 'base',
      desc: '从希腊、土耳其各移除 2 点苏联影响力，并各加 1 点美国影响力。',
      effect(h) { ['greece', 'turkey'].forEach(cid => { h.rmFor('ussr', cid, 2); h.add(cid, 1); }); } },
    { id: 'nato', name: '北约成立', side: 'us', era: 'early', ops: 4, set: 'base',
      desc: '在西德、法国、意大利、比荷卢、丹麦、挪威各加 1 点美国影响力；美国 +1 VP。',
      effect(h) { ['wgermany', 'france', 'italy', 'benelux', 'denmark', 'norway'].forEach(cid => h.add(cid, 1)); h.vpMe(1); } },
    { id: 'berlin_airlift', name: '柏林空运', side: 'us', era: 'early', ops: 2, set: 'base',
      desc: '在西德加 2 点美国影响力；美国 +1 VP。',
      effect(h) { h.add('wgermany', 2); h.vpMe(1); } },
    { id: 'containment', name: '遏制政策', side: 'us', era: 'early', ops: 3, set: 'base',
      desc: '在 3 个非战场国各加 1 点美国影响力。',
      effect(h) {
        const pool = h.allCountries().filter(cid => !h.co(cid).bg);
        h.choose({ count: 3, from: pool, title: '遏制政策', hint: '选择 3 个非战场国各加 1 点美国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
      } },
    { id: 'un_korea', name: '联合国军介入', side: 'us', era: 'early', ops: 3, set: 'base',
      desc: '在韩国发动战争（+2）。',
      effect(h) { h.war('southkorea', 2, 2); } },
    { id: 'norad', name: '北美防空司令部', side: 'us', era: 'early', ops: 3, set: 'base',
      desc: '在加拿大加 1 点美国影响力；美国太空竞赛前进 1 格；美国 +1 VP。',
      effect(h) { h.add('canada', 1); h.spaceFor('us', 1); h.vpMe(1); } },
    { id: 'eisenhower', name: '艾森豪威尔主义', side: 'us', era: 'early', ops: 3, set: 'base',
      desc: '在黎巴嫩加 2 点、约旦与沙特各加 1 点美国影响力。',
      effect(h) { h.add('lebanon', 2); h.add('jordan', 1); h.add('saudi', 1); } },
    { id: 'destalinization', name: '去斯大林化', side: 'us', era: 'early', ops: 4, set: 'base',
      desc: '从波兰、匈牙利、捷克斯洛伐克、罗马尼亚、保加利亚各移除 1 点苏联影响力。',
      effect(h) { ['poland', 'hungary', 'czechoslovakia', 'romania', 'bulgaria'].forEach(cid => h.rmFor('ussr', cid, 1)); } },
    { id: 'voice_america', name: '美国之音', side: 'us', era: 'early', ops: 2, set: 'base',
      desc: '在 3 个已有苏联影响力的国家各加 1 点美国影响力。',
      effect(h) {
        const pool = h.allCountries().filter(cid => h.infl(cid, 'ussr') > 0);
        h.choose({ count: 3, from: pool, title: '美国之音', hint: '选择 3 个有苏联影响力的国家各加 1 点美国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
      } },
    { id: 'point_four', name: '第四点计划', side: 'us', era: 'early', ops: 2, set: 'base',
      desc: '在亚洲或非洲选择 3 个国家各加 1 点美国影响力。',
      effect(h) {
        const pool = h.region('asia').concat(h.region('africa'));
        h.choose({ count: 3, from: pool, title: '第四点计划', hint: '选择 3 个亚非国家各加 1 点美国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
      } },
    { id: 'italy_election', name: '意大利大选', side: 'us', era: 'early', ops: 2, set: 'base',
      desc: '在意大利加 3 点美国影响力；美国 +1 VP。',
      effect(h) { h.add('italy', 3); h.vpMe(1); } },
    { id: 'free_elections', name: '自由选举', side: 'us', era: 'early', ops: 1, set: 'base',
      desc: '从匈牙利、罗马尼亚、保加利亚各移除 1 点苏联影响力。',
      effect(h) { ['hungary', 'romania', 'bulgaria'].forEach(cid => h.rmFor('ussr', cid, 1)); } },


    { id: 'score_europe_e', name: '欧洲记分', side: 'neutral', era: 'early', ops: 0, set: 'base', score: 'europe' },
    { id: 'score_asia_e',   name: '亚洲记分', side: 'neutral', era: 'early', ops: 0, set: 'base', score: 'asia' },
    { id: 'score_me_e',     name: '中东记分', side: 'neutral', era: 'early', ops: 0, set: 'base', score: 'mideast' },


    { id: 'berlin_blockade', name: '柏林封锁', side: 'ussr', era: 'early', ops: 3, set: 'expand',
      desc: '在西德移除 2 点、在西欧另 1 个国家移除 1 点美国影响力；苏联 +1 VP。',
      effect(h) {
        h.rmFor('us', 'wgermany', 2);
        const pool = h.region('europe').filter(cid => cid !== 'wgermany' && h.infl(cid, 'us') > 0);
        h.choose({ count: 1, from: pool, title: '柏林封锁', hint: '再选择 1 个西欧国家移除 1 点美国影响力' }, ids => ids.forEach(cid => h.rmFor('us', cid, 1)));
        h.vpMe(1);
      } },
    { id: 'tito_split', name: '苏南决裂', side: 'us', era: 'early', ops: 3, set: 'expand',
      desc: '在南斯拉夫移除 2 点苏联影响力并加 1 点美国影响力；美国 +1 VP。',
      effect(h) { h.rmFor('ussr', 'yugoslavia', 2); h.add('yugoslavia', 1); h.vpMe(1); } },
    { id: 'japan_treaty', name: '旧金山和约', side: 'us', era: 'early', ops: 3, set: 'expand',
      desc: '在日本加 2 点美国影响力；美国太空竞赛前进 1 格；美国 +1 VP。',
      effect(h) { h.add('japan', 2); h.spaceFor('us', 1); h.vpMe(1); } },
    { id: 'greek_civil_war', name: '希腊内战', side: 'us', era: 'early', ops: 2, set: 'expand',
      desc: '在希腊发动战争（+2）。',
      effect(h) { h.war('greece', 2, 2); } },
    { id: 'malayan_emergency', name: '马来亚紧急状态', side: 'us', era: 'early', ops: 2, set: 'expand',
      desc: '在马来西亚、泰国、菲律宾各加 1 点美国影响力。',
      effect(h) { h.add('malaysia', 1); h.add('thailand', 1); h.add('philippines', 1); } },


    { id: 'brezhnev', name: '勃列日涅夫主义', side: 'ussr', era: 'mid', ops: 3, set: 'base',
      desc: '在 3 个与苏联本土相邻的国家各加 1 点苏联影响力。',
      effect(h) {
        const pool = h.allCountries().filter(cid => h.co(cid).su);
        h.choose({ count: 3, from: pool, title: '勃列日涅夫主义', hint: '选择 3 个与苏联相邻的国家各加 1 点苏联影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
      } },
    { id: 'prague_spring', name: '布拉格之春', side: 'ussr', era: 'mid', ops: 2, set: 'base',
      desc: '在捷克斯洛伐克加 2 点苏联影响力；苏联 +1 VP。',
      effect(h) { h.add('czechoslovakia', 2); h.vpMe(1); } },
    { id: 'u2', name: 'U-2 事件', side: 'ussr', era: 'mid', ops: 2, set: 'base',
      desc: '苏联 +2 VP。',
      effect(h) { h.vpMe(2); } },
    { id: 'congo', name: '刚果危机', side: 'ussr', era: 'mid', ops: 1, set: 'base',
      desc: '在扎伊尔加 1 点苏联影响力；苏联 +1 VP。',
      effect(h) { h.add('zaire', 1); h.vpMe(1); } },
    { id: 'che', name: '切·格瓦拉', side: 'ussr', era: 'mid', ops: 2, set: 'base',
      desc: '在南美选择 3 个国家，各加 1 点苏联影响力。',
      effect(h) { h.choose({ count: 3, from: h.region('southam'), title: '切·格瓦拉', hint: '选择 3 个南美国家各加 1 点苏联影响力' }, ids => ids.forEach(cid => h.add(cid, 1))); } },
    { id: 'angola_war', name: '安哥拉内战', side: 'ussr', era: 'mid', ops: 2, set: 'base',
      desc: '在安哥拉发动战争（+1）。',
      effect(h) { h.war('angola', 1, 2); } },
    { id: 'sandinista', name: '桑地诺革命', side: 'ussr', era: 'mid', ops: 2, set: 'base',
      desc: '移除尼加拉瓜 1 点美国影响力，并加 2 点苏联影响力。',
      effect(h) { h.rmFor('us', 'nicaragua', 1); h.add('nicaragua', 2); } },
    { id: 'socialist_ethiopia', name: '社会主义埃塞俄比亚', side: 'ussr', era: 'mid', ops: 1, set: 'base',
      desc: '在埃塞俄比亚加 2 点苏联影响力。',
      effect(h) { h.add('ethiopia', 2); } },
    { id: 'arab_oil', name: '阿拉伯石油禁运', side: 'ussr', era: 'mid', ops: 3, set: 'base',
      desc: '苏联 +2 VP；DEFCON 下降 1。',
      effect(h) { h.vpMe(2); h.defcon(-1); } },
    { id: 'vietnam_war', name: '越南战争', side: 'ussr', era: 'mid', ops: 2, set: 'base',
      desc: '在老挝与越南各加 1 点苏联影响力；苏联 +2 VP。',
      effect(h) { h.add('laos', 1); h.add('vietnam', 1); h.vpMe(2); } },
    { id: 'ogaden', name: '欧加登战争', side: 'ussr', era: 'mid', ops: 2, set: 'base',
      desc: '在埃塞俄比亚发动战争（+1）。',
      effect(h) { h.war('ethiopia', 1, 2); } },
    { id: 'red_army', name: '红军扩张', side: 'ussr', era: 'mid', ops: 3, set: 'base',
      desc: '在中东选择 3 个国家，各加 1 点苏联影响力。',
      effect(h) { h.choose({ count: 3, from: h.region('mideast'), title: '红军扩张', hint: '选择 3 个中东国家各加 1 点苏联影响力' }, ids => ids.forEach(cid => h.add(cid, 1))); } },


    { id: 'cuban_missile', name: '古巴导弹危机', side: 'us', era: 'mid', ops: 3, set: 'base',
      desc: '从古巴移除 2 点苏联影响力；美国 +3 VP；DEFCON 下降 1。',
      effect(h) { h.rmFor('ussr', 'cuba', 2); h.vpMe(3); h.defcon(-1); } },
    { id: 'salt1', name: '第一阶段限制战略武器条约', side: 'us', era: 'mid', ops: 3, set: 'base',
      desc: '美国 +2 VP；DEFCON 上升 1。',
      effect(h) { h.vpMe(2); h.defcon(1); } },
    { id: 'jfk', name: '肯尼迪当选', side: 'us', era: 'mid', ops: 3, set: 'base',
      desc: '美国 +2 VP。',
      effect(h) { h.vpMe(2); } },
    { id: 'shuttle', name: '穿梭外交', side: 'us', era: 'mid', ops: 2, set: 'base',
      desc: '在以色列加 2 点、埃及加 1 点美国影响力。',
      effect(h) { h.add('israel', 2); h.add('egypt', 1); } },
    { id: 'human_rights', name: '人权外交', side: 'us', era: 'mid', ops: 2, set: 'base',
      desc: '在 3 个没有苏联影响力的国家各加 1 点美国影响力。',
      effect(h) {
        const pool = h.allCountries().filter(cid => h.infl(cid, 'ussr') === 0);
        h.choose({ count: 3, from: pool, title: '人权外交', hint: '选择 3 个无苏联影响力的国家各加 1 点美国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
      } },
    { id: 'panama', name: '巴拿马运河条约', side: 'us', era: 'mid', ops: 2, set: 'base',
      desc: '在巴拿马加 1 点美国影响力；美国 +1 VP。',
      effect(h) { h.add('panama', 1); h.vpMe(1); } },
    { id: 'green_berets', name: '绿色贝雷帽', side: 'us', era: 'mid', ops: 2, set: 'base',
      desc: '在中美洲或南美洲选择 3 个国家各加 1 点美国影响力。',
      effect(h) {
        const pool = h.region('centam').concat(h.region('southam'));
        h.choose({ count: 3, from: pool, title: '绿色贝雷帽', hint: '选择 3 个中/南美国家各加 1 点美国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
      } },
    { id: 'missile_gap', name: '导弹差距', side: 'us', era: 'mid', ops: 2, set: 'base',
      desc: '美国太空竞赛前进 1 格；美国 +1 VP。',
      effect(h) { h.spaceFor('us', 1); h.vpMe(1); } },
    { id: 'christian_dem', name: '基督教民主党', side: 'us', era: 'mid', ops: 2, set: 'base',
      desc: '在西欧选择 3 个国家各加 1 点美国影响力。',
      effect(h) {
        const pool = h.region('europe').filter(cid => h.infl(cid, 'ussr') === 0);
        h.choose({ count: 3, from: pool, title: '基督教民主党', hint: '选择 3 个西欧国家各加 1 点美国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
      } },


    { id: 'score_europe_m', name: '欧洲记分', side: 'neutral', era: 'mid', ops: 0, set: 'base', score: 'europe' },
    { id: 'score_asia_m',   name: '亚洲记分', side: 'neutral', era: 'mid', ops: 0, set: 'base', score: 'asia' },
    { id: 'score_me_m',     name: '中东记分', side: 'neutral', era: 'mid', ops: 0, set: 'base', score: 'mideast' },
    { id: 'score_africa_m', name: '非洲记分', side: 'neutral', era: 'mid', ops: 0, set: 'base', score: 'africa' },
    { id: 'score_ca_m',     name: '中美洲记分', side: 'neutral', era: 'mid', ops: 0, set: 'base', score: 'centam' },
    { id: 'score_sa_m',     name: '南美洲记分', side: 'neutral', era: 'mid', ops: 0, set: 'base', score: 'southam' },


    { id: 'chile_allende', name: '智利人民团结阵线', side: 'ussr', era: 'mid', ops: 2, set: 'expand',
      desc: '移除智利 1 点美国影响力，并加 2 点苏联影响力；苏联 +1 VP。',
      effect(h) { h.rmFor('us', 'chile', 1); h.add('chile', 2); h.vpMe(1); } },
    { id: 'domino_theory', name: '多米诺理论', side: 'us', era: 'mid', ops: 3, set: 'expand',
      desc: '在亚洲选择 3 个国家各加 1 点美国影响力；美国 +1 VP。',
      effect(h) {
        h.choose({ count: 3, from: h.region('asia'), title: '多米诺理论', hint: '选择 3 个亚洲国家各加 1 点美国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
        h.vpMe(1);
      } },
    { id: 'npt', name: '不扩散核武器条约', side: 'us', era: 'mid', ops: 3, set: 'expand',
      desc: '美国 +2 VP；DEFCON 上升 1。',
      effect(h) { h.vpMe(2); h.defcon(1); } },
    { id: 'ostpolitik', name: '新东方政策', side: 'us', era: 'mid', ops: 2, set: 'expand',
      desc: '从东德、波兰各移除 1 点苏联影响力；美国 +1 VP。',
      effect(h) { h.rmFor('ussr', 'eastgermany', 1); h.rmFor('ussr', 'poland', 1); h.vpMe(1); } },
    { id: 'laos_crisis', name: '老挝危机', side: 'us', era: 'mid', ops: 2, set: 'expand',
      desc: '在泰国、南越、老挝各加 1 点美国影响力。',
      effect(h) { h.add('thailand', 1); h.add('vietnam', 1); h.add('laos', 1); } },
    { id: 'africa_decade', name: '非洲独立年', side: 'us', era: 'mid', ops: 3, set: 'expand',
      desc: '在非洲选择 4 个国家各加 1 点美国影响力。',
      effect(h) { h.choose({ count: 4, from: h.region('africa'), title: '非洲独立年', hint: '选择 4 个非洲国家各加 1 点美国影响力' }, ids => ids.forEach(cid => h.add(cid, 1))); } },
    { id: 'helsinki_accords', name: '赫尔辛基协议', side: 'ussr', era: 'mid', ops: 2, set: 'expand',
      desc: 'DEFCON 上升 1；在波兰、匈牙利各加 1 点苏联影响力；苏联 +1 VP。',
      effect(h) { h.defcon(1); h.add('poland', 1); h.add('hungary', 1); h.vpMe(1); } },
    { id: 'india_treaty', name: '印苏友好条约', side: 'ussr', era: 'mid', ops: 3, set: 'expand',
      desc: '在印度加 3 点苏联影响力；苏联 +1 VP。',
      effect(h) { h.add('india', 3); h.vpMe(1); } },


    { id: 'iranian_rev', name: '伊朗革命', side: 'ussr', era: 'late', ops: 2, set: 'base',
      desc: '移除伊朗全部美国影响力，并加 2 点苏联影响力；苏联 +1 VP。',
      effect(h) { h.all('iran', 'us'); h.add('iran', 2); h.vpMe(1); } },
    { id: 'afghan_invasion', name: '苏联入侵阿富汗', side: 'ussr', era: 'late', ops: 3, set: 'base',
      desc: '在阿富汗发动战争（+2）；DEFCON 下降 1。',
      effect(h) { h.war('afghanistan', 2, 2); h.defcon(-1); } },
    { id: 'solidarity_crackdown', name: '镇压团结工会', side: 'ussr', era: 'late', ops: 2, set: 'base',
      desc: '在波兰加 2 点苏联影响力；苏联 +1 VP；DEFCON 下降 1。',
      effect(h) { h.add('poland', 2); h.vpMe(1); h.defcon(-1); } },
    { id: 'nicaragua_arms', name: '尼加拉瓜军援', side: 'ussr', era: 'late', ops: 2, set: 'base',
      desc: '在尼加拉瓜加 2 点苏联影响力。',
      effect(h) { h.add('nicaragua', 2); } },
    { id: 'iran_hostage', name: '伊朗人质危机', side: 'ussr', era: 'late', ops: 2, set: 'base',
      desc: '苏联 +3 VP。',
      effect(h) { h.vpMe(3); } },
    { id: 'korean_air', name: '韩国客机事件', side: 'ussr', era: 'late', ops: 2, set: 'base',
      desc: '苏联 +2 VP。',
      effect(h) { h.vpMe(2); } },
    { id: 'cuba_troops', name: '古巴出兵非洲', side: 'ussr', era: 'late', ops: 2, set: 'base',
      desc: '在安哥拉加 2 点、埃塞俄比亚加 1 点苏联影响力。',
      effect(h) { h.add('angola', 2); h.add('ethiopia', 1); } },
    { id: 'euro_missiles', name: '欧洲导弹部署', side: 'ussr', era: 'late', ops: 3, set: 'base',
      desc: '在西欧选择 3 个国家，各移除 1 点美国影响力；苏联 +1 VP。',
      effect(h) {
        h.choose({ count: 3, from: h.region('europe'), title: '欧洲导弹部署', hint: '选择 3 个欧洲国家各移除 1 点美国影响力' }, ids => ids.forEach(cid => h.rmFor('us', cid, 1)));
        h.vpMe(1);
      } },
    { id: 'nuclear_freeze', name: '核冻结运动', side: 'ussr', era: 'late', ops: 2, set: 'base',
      desc: 'DEFCON 上升 1；苏联 +1 VP。',
      effect(h) { h.defcon(1); h.vpMe(1); } },
    { id: 'red_army_late', name: '华约大演习', side: 'ussr', era: 'late', ops: 2, set: 'base',
      desc: '苏联 +2 VP；DEFCON 下降 1。',
      effect(h) { h.vpMe(2); h.defcon(-1); } },


    { id: 'star_wars', name: '星球大战计划', side: 'us', era: 'late', ops: 3, set: 'base',
      desc: '美国太空竞赛前进 2 格；美国 +3 VP。',
      effect(h) { h.spaceFor('us', 2); h.vpMe(3); } },
    { id: 'solidarity', name: '团结工会', side: 'us', era: 'late', ops: 3, set: 'base',
      desc: '从波兰移除 1 点苏联影响力并加 1 点美国影响力；美国 +2 VP。',
      effect(h) { h.rmFor('ussr', 'poland', 1); h.add('poland', 1); h.vpMe(2); } },
    { id: 'evil_empire', name: '邪恶帝国', side: 'us', era: 'late', ops: 2, set: 'base',
      desc: '美国 +2 VP。',
      effect(h) { h.vpMe(2); } },
    { id: 'chernobyl', name: '切尔诺贝利', side: 'us', era: 'late', ops: 2, set: 'base',
      desc: '美国 +2 VP；DEFCON 上升 1。',
      effect(h) { h.vpMe(2); h.defcon(1); } },
    { id: 'afghan_sting', name: '援助阿富汗游击队', side: 'us', era: 'late', ops: 2, set: 'base',
      desc: '在阿富汗发动战争（+1）；美国 +1 VP。',
      effect(h) { h.war('afghanistan', 1, 2); h.vpMe(1); } },
    { id: 'berlin_fall', name: '柏林墙倒塌', side: 'us', era: 'late', ops: 4, set: 'base',
      desc: '移除东德全部苏联影响力；美国 +3 VP。',
      effect(h) { h.all('eastgermany', 'ussr'); h.vpMe(3); } },
    { id: 'gorbachev', name: '戈尔巴乔夫上台', side: 'us', era: 'late', ops: 3, set: 'base',
      desc: '从东欧选择 3 个国家各移除 1 点苏联影响力；美国 +1 VP。',
      effect(h) {
        h.choose({ count: 3, from: ['poland', 'eastgermany', 'czechoslovakia', 'hungary', 'romania', 'bulgaria'], title: '戈尔巴乔夫上台', hint: '选择 3 个东欧国家各移除 1 点苏联影响力' }, ids => ids.forEach(cid => h.rmFor('ussr', cid, 1)));
        h.vpMe(1);
      } },
    { id: 'pershing', name: '潘兴导弹部署', side: 'us', era: 'late', ops: 3, set: 'base',
      desc: '在西德加 1 点美国影响力；美国 +2 VP。',
      effect(h) { h.add('wgermany', 1); h.vpMe(2); } },
    { id: 'nato_expansion', name: '北约东扩', side: 'us', era: 'late', ops: 2, set: 'base',
      desc: '在西欧选择 3 个国家各加 1 点美国影响力。',
      effect(h) {
        const pool = h.region('europe').filter(cid => h.infl(cid, 'ussr') === 0);
        h.choose({ count: 3, from: pool, title: '北约东扩', hint: '选择 3 个西欧国家各加 1 点美国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
      } },
    { id: 'counterinsurgency', name: '反叛乱行动', side: 'us', era: 'late', ops: 2, set: 'base',
      desc: '在中美洲选择 2 个国家，各移除 1 点苏联影响力并加 1 点美国影响力。',
      effect(h) {
        h.choose({ count: 2, from: h.region('centam'), title: '反叛乱行动', hint: '选择 2 个中美洲国家各移除 1 点苏联影响力并加 1 点美国影响力' }, ids => ids.forEach(cid => { h.rmFor('ussr', cid, 1); h.add(cid, 1); }));
      } },


    { id: 'score_europe_l', name: '欧洲记分', side: 'neutral', era: 'late', ops: 0, set: 'base', score: 'europe' },
    { id: 'score_asia_l',   name: '亚洲记分', side: 'neutral', era: 'late', ops: 0, set: 'base', score: 'asia' },
    { id: 'score_me_l',     name: '中东记分', side: 'neutral', era: 'late', ops: 0, set: 'base', score: 'mideast' },
    { id: 'score_africa_l', name: '非洲记分', side: 'neutral', era: 'late', ops: 0, set: 'base', score: 'africa' },
    { id: 'score_ca_l',     name: '中美洲记分', side: 'neutral', era: 'late', ops: 0, set: 'base', score: 'centam' },
    { id: 'score_sa_l',     name: '南美洲记分', side: 'neutral', era: 'late', ops: 0, set: 'base', score: 'southam' },


    { id: 'iran_contra', name: '伊朗门事件', side: 'ussr', era: 'late', ops: 3, set: 'expand',
      desc: '苏联 +3 VP；DEFCON 上升 1。',
      effect(h) { h.vpMe(3); h.defcon(1); } },
    { id: 'able_archer', name: '一九八一年北约演习', side: 'us', era: 'late', ops: 3, set: 'expand',
      desc: '美国 +2 VP；DEFCON 下降 1。',
      effect(h) { h.vpMe(2); h.defcon(-1); } },
    { id: 'korean_olympics', name: '汉城奥运', side: 'us', era: 'late', ops: 2, set: 'expand',
      desc: '在韩国加 1 点美国影响力；美国 +1 VP。',
      effect(h) { h.add('southkorea', 1); h.vpMe(1); } },
    { id: 'malta_summit', name: '马耳他会晤', side: 'us', era: 'late', ops: 3, set: 'expand',
      desc: '美国 +2 VP；DEFCON 上升 1。',
      effect(h) { h.vpMe(2); h.defcon(1); } },
    { id: 'eastern_revolution', name: '东欧剧变', side: 'us', era: 'late', ops: 4, set: 'expand',
      desc: '在东欧选择 3 个国家各移除 2 点苏联影响力；美国 +2 VP。',
      effect(h) {
        h.choose({ count: 3, from: ['poland', 'eastgermany', 'czechoslovakia', 'hungary', 'romania', 'bulgaria'], title: '东欧剧变', hint: '选择 3 个东欧国家各移除 2 点苏联影响力' }, ids => ids.forEach(cid => h.rmFor('ussr', cid, 2)));
        h.vpMe(2);
      } },
    { id: 'glasnost', name: '公开性与新思维', side: 'us', era: 'late', ops: 3, set: 'expand',
      desc: '从东欧 3 国各移除 1 点苏联影响力；美国 +1 VP；DEFCON 上升 1。',
      effect(h) {
        h.choose({ count: 3, from: ['poland', 'eastgermany', 'czechoslovakia', 'hungary', 'romania', 'bulgaria'], title: '公开性与新思维', hint: '选择 3 个东欧国家各移除 1 点苏联影响力' }, ids => ids.forEach(cid => h.rmFor('ussr', cid, 1)));
        h.vpMe(1); h.defcon(1);
      } },
    { id: 'ss20_deployment', name: 'SS-20 导弹部署', side: 'ussr', era: 'late', ops: 3, set: 'expand',
      desc: '苏联 +2 VP；DEFCON 下降 1；在西欧 1 国移除 1 点美国影响力。',
      effect(h) {
        const pool = h.region('europe').filter(cid => h.infl(cid, 'us') > 0);
        h.choose({ count: 1, from: pool, title: 'SS-20 导弹部署', hint: '选择 1 个西欧国家移除 1 点美国影响力' }, ids => ids.forEach(cid => h.rmFor('us', cid, 1)));
        h.vpMe(2); h.defcon(-1);
      } },
    { id: 'vietnam_unification', name: '越南统一', side: 'ussr', era: 'late', ops: 2, set: 'expand',
      desc: '在越南加 2 点、老挝加 1 点苏联影响力；苏联 +1 VP。',
      effect(h) { h.add('vietnam', 2); h.add('laos', 1); h.vpMe(1); } },
    { id: 'angola_offensive', name: '安哥拉攻势', side: 'ussr', era: 'late', ops: 3, set: 'expand',
      desc: '在安哥拉加 2 点苏联影响力；在安哥拉发动战争（+1）；苏联 +1 VP。',
      effect(h) { h.add('angola', 2); h.war('angola', 1, 2); h.vpMe(1); } },




    { id: 'sino_soviet_treaty', name: '中苏友好同盟互助条约', side: 'ussr', era: 'early', ops: 4, set: 'cn',
      desc: '在中国加 2 点苏联影响力；在亚洲选择 2 个国家各加 1 点苏联影响力。',
      effect(h) {
        h.add('china', 2);
        h.choose({ count: 2, from: h.region('asia'), title: '中苏友好同盟互助条约', hint: '选择 2 个亚洲国家各加 1 点苏联影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
      } },
    { id: 'chinese_korea', name: '中国参战朝鲜', side: 'ussr', era: 'early', ops: 3, set: 'cn',
      desc: '在亚洲选择 2 个国家各加 1 点苏联影响力；移除朝鲜 1 点中国影响力。',
      effect(h) {
        h.choose({ count: 2, from: h.region('asia'), title: '中国参战朝鲜', hint: '选择 2 个亚洲国家各加 1 点苏联影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
        h.rmFor('cn', 'northkorea', 1);
      } },
    { id: 'taiwan_strait', name: '台海危机', side: 'us', era: 'early', ops: 2, set: 'cn',
      desc: '在中国台湾加 2 点美国影响力；美国 +1 VP。',
      effect(h) { h.add('taiwan', 2); h.vpMe(1); } },
    { id: 'sino_soviet_split', name: '中苏分裂', side: 'us', era: 'mid', ops: 3, set: 'cn',
      desc: '移除中国 2 点苏联影响力；在亚洲选择 2 个国家各移除 1 点苏联影响力。',
      effect(h) {
        h.rmFor('ussr', 'china', 2);
        h.choose({ count: 2, from: h.region('asia'), title: '中苏分裂', hint: '选择 2 个亚洲国家各移除 1 点苏联影响力' }, ids => ids.forEach(cid => h.rmFor('ussr', cid, 1)));
      } },
    { id: 'chinese_atomic', name: '中国首次核试验', side: 'ussr', era: 'mid', ops: 3, set: 'cn',
      desc: '社会主义阵营掌握核力量：苏联 +1 VP、中国 +1 VP；DEFCON 下降 1。',
      effect(h) { h.vpFor('ussr', 1); h.vpFor('cn', 1); h.defcon(-1); } },
    { id: 'pingpong', name: '乒乓外交', side: 'us', era: 'mid', ops: 3, set: 'cn',
      desc: '在亚洲选择 2 个国家各加 1 点美国影响力；移除中国 1 点苏联影响力；美国 +1 VP。',
      effect(h) {
        h.choose({ count: 2, from: h.region('asia'), title: '乒乓外交', hint: '选择 2 个亚洲国家各加 1 点美国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
        h.rmFor('ussr', 'china', 1); h.vpMe(1);
      } },
    { id: 'un_seat_prc', name: '中国重返联合国', side: 'us', era: 'mid', ops: 3, set: 'cn',
      desc: '在亚洲选择 2 个国家各加 1 点美国影响力；移除中国 1 点苏联影响力。',
      effect(h) {
        h.choose({ count: 2, from: h.region('asia'), title: '中国重返联合国', hint: '选择 2 个亚洲国家各加 1 点美国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
        h.rmFor('ussr', 'china', 1);
      } },
    { id: 'nixon_china', name: '尼克松访华', side: 'us', era: 'mid', ops: 4, set: 'cn',
      desc: '移除中国 2 点苏联影响力；美国 +2 VP。',
      effect(h) { h.rmFor('ussr', 'china', 2); h.vpMe(2); } },
    { id: 'china_recognition', name: '中美建交', side: 'us', era: 'mid', ops: 3, set: 'cn',
      desc: '在亚洲选择 3 个国家各加 1 点美国影响力；美国 +1 VP、中国 +1 VP。',
      effect(h) {
        h.choose({ count: 3, from: h.region('asia'), title: '中美建交', hint: '选择 3 个亚洲国家各加 1 点美国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
        h.vpFor('us', 1); h.vpFor('cn', 1);
      } },
    { id: 'soviet_aid_loans', name: '中苏经济技术合作', side: 'ussr', era: 'early', ops: 3, set: 'cn',
      desc: '在中国加 3 点苏联影响力；苏联 +1 VP。',
      effect(h) { h.add('china', 3); h.vpMe(1); } },
    { id: 'china_bloc_support', name: '社会主义阵营声援', side: 'ussr', era: 'mid', ops: 3, set: 'cn',
      desc: '在亚洲选择 3 个国家各加 1 点苏联影响力；苏联 +2 VP。',
      effect(h) {
        h.choose({ count: 3, from: h.region('asia'), title: '社会主义阵营声援', hint: '选择 3 个亚洲国家各加 1 点苏联影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
        h.vpMe(2);
      } },
    { id: 'sino_soviet_reconciliation', name: '中苏边界谈判', side: 'ussr', era: 'late', ops: 2, set: 'cn',
      desc: '移除中国 2 点美国影响力；苏联 +1 VP。',
      effect(h) { h.rmFor('us', 'china', 2); h.vpMe(1); } },
    { id: 'soviet_advisors', name: '苏联军事顾问团', side: 'ussr', era: 'early', ops: 3, set: 'cn',
      desc: '在中国加 2 点苏联影响力；在亚洲选择 1 个国家加 1 点苏联影响力；苏联 +1 VP。',
      effect(h) {
        h.add('china', 2);
        h.choose({ count: 1, from: h.region('asia'), title: '苏联军事顾问团', hint: '选择 1 个亚洲国家加 1 点苏联影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
        h.vpMe(1);
      } },
    { id: 'socialist_camp_economy', name: '社会主义阵营经济互助', side: 'ussr', era: 'mid', ops: 3, set: 'cn',
      desc: '在中国加 2 点苏联影响力；苏联 +2 VP。',
      effect(h) { h.add('china', 2); h.vpMe(2); } },
    { id: 'soviet_tech_transfer', name: '中苏科技协定', side: 'ussr', era: 'mid', ops: 3, set: 'cn',
      desc: '移除亚洲 1 国 2 点美国影响力；在亚洲选择 1 国加 1 点苏联影响力；苏联 +1 VP。',
      effect(h) {
        const pool = h.region('asia').filter(cid => h.infl(cid, 'us') > 0);
        h.choose({ count: 1, from: pool, title: '中苏科技协定', hint: '选择 1 个有美国影响力的亚洲国家移除 2 点' }, ids => ids.forEach(cid => h.rmFor('us', cid, 2)));
        h.choose({ count: 1, from: h.region('asia'), title: '中苏科技协定', hint: '再选择 1 个亚洲国家加 1 点苏联影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
        h.vpMe(1);
      } },




    { id: 'prc_founding', name: '开国大典', side: 'cn', era: 'early', ops: 4, set: 'cn',
      desc: '在中国加 2 点中国影响力；在亚洲选择 2 个国家各加 1 点中国影响力；中国 +1 VP。',
      effect(h) {
        h.add('china', 2);
        h.choose({ count: 2, from: h.region('asia'), title: '开国大典', hint: '选择 2 个亚洲国家各加 1 点中国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
        h.vpMe(1);
      } },
    { id: 'five_principles', name: '和平共处五项原则', side: 'cn', era: 'early', ops: 2, set: 'cn',
      desc: '在印度、缅甸、印度尼西亚各加 1 点中国影响力；中国 +1 VP。',
      effect(h) { h.add('india', 1); h.add('burma', 1); h.add('indonesia', 1); h.vpMe(1); } },
    { id: 'bandung', name: '万隆会议', side: 'cn', era: 'early', ops: 3, set: 'cn',
      desc: '在亚非选择 3 个「美苏均无影响力」的国家各加 1 点中国影响力；中国 +1 VP。',
      effect(h) {
        const pool = h.region('asia').concat(h.region('africa')).filter(cid => h.infl(cid, 'us') === 0 && h.infl(cid, 'ussr') === 0);
        h.choose({ count: 3, from: pool, title: '万隆会议', hint: '选择 3 个美苏均无影响力的亚非国家各加 1 点中国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
        h.vpMe(1);
      } },
    { id: 'korean_volunteers', name: '抗美援朝', side: 'cn', era: 'early', ops: 4, set: 'cn',
      desc: '在朝鲜加 2 点中国影响力；在韩国发动战争（+1）；中国 +1 VP。',
      effect(h) { h.add('northkorea', 2); h.war('southkorea', 1, 2); h.vpMe(1); } },
    { id: 'soviet_aid_156', name: '苏联援华工程', side: 'cn', era: 'early', ops: 3, set: 'cn',
      desc: '在中国加 2 点中国影响力；在亚洲选择 2 个国家各加 1 点中国影响力。',
      effect(h) {
        h.add('china', 2);
        h.choose({ count: 2, from: h.region('asia'), title: '苏联援华工程', hint: '选择 2 个亚洲国家各加 1 点中国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
      } },
    { id: 'agrarian_reform', name: '土地改革', side: 'cn', era: 'early', ops: 3, set: 'cn',
      desc: '在中国加 2 点中国影响力；在亚洲选择 1 个国家加 1 点中国影响力；中国 +1 VP。',
      effect(h) {
        h.add('china', 2);
        h.choose({ count: 1, from: h.region('asia'), title: '土地改革', hint: '选择 1 个亚洲国家加 1 点中国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
        h.vpMe(1);
      } },
    { id: 'overseas_chinese', name: '海外华侨网络', side: 'cn', era: 'early', ops: 2, set: 'cn',
      desc: '在东南亚选择 2 个国家各加 1 点中国影响力；中国 +1 VP。',
      effect(h) {
        const pool = ['indonesia', 'malaysia', 'thailand', 'burma', 'philippines', 'vietnam'];
        h.choose({ count: 2, from: pool, title: '海外华侨网络', hint: '选择 2 个东南亚国家各加 1 点中国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
        h.vpMe(1);
      } },
    { id: 'sino_burmese_treaty', name: '中缅边界条约', side: 'cn', era: 'early', ops: 2, set: 'cn',
      desc: '在缅甸加 2 点中国影响力；中国 +1 VP。',
      effect(h) { h.add('burma', 2); h.vpMe(1); } },
    { id: 'geneva_1954', name: '日内瓦会议', side: 'cn', era: 'early', ops: 3, set: 'cn',
      desc: '在越南、老挝各加 1 点中国影响力；中国 +1 VP；DEFCON 上升 1。',
      effect(h) { h.add('vietnam', 1); h.add('laos', 1); h.vpMe(1); h.defcon(1); } },

    { id: 'two_bombs', name: '两弹一星', side: 'cn', era: 'mid', ops: 4, set: 'cn',
      desc: '中国太空竞赛前进 2 格；中国 +2 VP；DEFCON 下降 1。',
      effect(h) { h.space(2); h.vpMe(2); h.defcon(-1); } },
    { id: 'dongfanghong', name: '东方红一号', side: 'cn', era: 'mid', ops: 2, set: 'cn',
      desc: '中国太空竞赛前进 1 格；中国 +1 VP。',
      effect(h) { h.space(1); h.vpMe(1); } },
    { id: 'zhenbao_island', name: '珍宝岛事件', side: 'cn', era: 'mid', ops: 3, set: 'cn',
      desc: '移除中国 2 点苏联影响力；在亚洲选择 2 个国家各移除 1 点苏联影响力；中国 +1 VP。',
      effect(h) {
        h.rmFor('ussr', 'china', 2);
        h.choose({ count: 2, from: h.region('asia'), title: '珍宝岛事件', hint: '选择 2 个亚洲国家各移除 1 点苏联影响力' }, ids => ids.forEach(cid => h.rmFor('ussr', cid, 1)));
        h.vpMe(1);
      } },
    { id: 'three_worlds', name: '三个世界理论', side: 'cn', era: 'mid', ops: 3, set: 'cn',
      desc: '在亚洲、非洲、中东各选 1 国加 1 点中国影响力；中国 +2 VP。',
      effect(h) {
        ['asia', 'africa', 'mideast'].forEach(r => {
          h.choose({ count: 1, from: h.region(r), title: '三个世界理论', hint: `在${r === 'asia' ? '亚洲' : r === 'africa' ? '非洲' : '中东'}选择 1 国加 1 点中国影响力` }, ids => ids.forEach(cid => h.add(cid, 1)));
        });
        h.vpMe(2);
      } },
    { id: 'sino_us_detente', name: '中美关系正常化', side: 'cn', era: 'mid', ops: 3, set: 'cn',
      desc: '移除中国 2 点苏联影响力；中国 +2 VP；DEFCON 上升 1。',
      effect(h) { h.rmFor('ussr', 'china', 2); h.vpMe(2); h.defcon(1); } },
    { id: 'un_seat_cn', name: '恢复联合国合法席位', side: 'cn', era: 'mid', ops: 2, set: 'cn',
      desc: '中国 +2 VP；在亚洲选择 2 个国家各加 1 点中国影响力。',
      effect(h) {
        h.vpMe(2);
        h.choose({ count: 2, from: h.region('asia'), title: '恢复联合国合法席位', hint: '选择 2 个亚洲国家各加 1 点中国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
      } },
    { id: 'tazara_railway', name: '援建坦赞铁路', side: 'cn', era: 'mid', ops: 3, set: 'cn',
      desc: '在非洲选择 3 个国家各加 1 点中国影响力；中国 +1 VP。',
      effect(h) {
        h.choose({ count: 3, from: h.region('africa'), title: '援建坦赞铁路', hint: '选择 3 个非洲国家各加 1 点中国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
        h.vpMe(1);
      } },
    { id: 'sino_indian_war', name: '中印边境战争', side: 'cn', era: 'mid', ops: 3, set: 'cn',
      desc: '在印度发动战争（+1）；在巴基斯坦加 1 点中国影响力；中国 +1 VP。',
      effect(h) { h.war('india', 1, 2); h.add('pakistan', 1); h.vpMe(1); } },
    { id: 'vietnam_aid', name: '援越抗美', side: 'cn', era: 'mid', ops: 3, set: 'cn',
      desc: '在越南、老挝各加 2 点中国影响力；中国 +1 VP。',
      effect(h) { h.add('vietnam', 2); h.add('laos', 2); h.vpMe(1); } },
    { id: 'afro_asian_solidarity', name: '亚非团结组织', side: 'cn', era: 'mid', ops: 3, set: 'cn',
      desc: '在亚洲或非洲选择 3 个国家各加 1 点中国影响力；中国 +1 VP。',
      effect(h) {
        const pool = h.region('asia').concat(h.region('africa'));
        h.choose({ count: 3, from: pool, title: '亚非团结组织', hint: '选择 3 个亚非国家各加 1 点中国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
        h.vpMe(1);
      } },
    { id: 'china_space_tracking', name: '中国卫星测控网', side: 'cn', era: 'mid', ops: 2, set: 'cn',
      desc: '中国太空竞赛前进 1 格；中国 +1 VP。',
      effect(h) { h.space(1); h.vpMe(1); } },
    { id: 'chinese_doctors', name: '援非医疗队', side: 'cn', era: 'mid', ops: 2, set: 'cn',
      desc: '在非洲选择 3 个国家各加 1 点中国影响力。',
      effect(h) { h.choose({ count: 3, from: h.region('africa'), title: '援非医疗队', hint: '选择 3 个非洲国家各加 1 点中国影响力' }, ids => ids.forEach(cid => h.add(cid, 1))); } },
    { id: 'world_revolution', name: '世界革命输出', side: 'cn', era: 'mid', ops: 3, set: 'cn',
      desc: '在非洲或中东选择 3 个国家各加 1 点中国影响力；中国 +1 VP。',
      effect(h) {
        const pool = h.region('africa').concat(h.region('mideast'));
        h.choose({ count: 3, from: pool, title: '世界革命输出', hint: '选择 3 个非洲/中东国家各加 1 点中国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
        h.vpMe(1);
      } },

    { id: 'reform_opening', name: '改革开放', side: 'cn', era: 'late', ops: 4, set: 'cn',
      desc: '在中国加 3 点中国影响力；在亚洲选择 2 个国家各加 1 点中国影响力；中国 +3 VP。',
      effect(h) {
        h.add('china', 3);
        h.choose({ count: 2, from: h.region('asia'), title: '改革开放', hint: '选择 2 个亚洲国家各加 1 点中国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
        h.vpMe(3);
      } },
    { id: 'sino_us_established', name: '中美正式建交', side: 'cn', era: 'late', ops: 3, set: 'cn',
      desc: '移除亚洲 1 国 2 点苏联影响力；中国 +2 VP。',
      effect(h) {
        const pool = h.region('asia').filter(cid => h.infl(cid, 'ussr') > 0);
        h.choose({ count: 1, from: pool, title: '中美正式建交', hint: '选择 1 个亚洲国家移除 2 点苏联影响力' }, ids => ids.forEach(cid => h.rmFor('ussr', cid, 2)));
        h.vpMe(2);
      } },
    { id: 'sino_vietnam_war', name: '对越自卫反击战', side: 'cn', era: 'late', ops: 3, set: 'cn',
      desc: '在越南发动战争（+2）；中国 +1 VP。',
      effect(h) { h.war('vietnam', 2, 2); h.vpMe(1); } },
    { id: 'hk_joint_declaration', name: '中英联合声明', side: 'cn', era: 'late', ops: 3, set: 'cn',
      desc: '中国 +2 VP；在亚洲选择 2 个国家各加 1 点中国影响力。',
      effect(h) {
        h.vpMe(2);
        h.choose({ count: 2, from: h.region('asia'), title: '中英联合声明', hint: '选择 2 个亚洲国家各加 1 点中国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
      } },
    { id: 'sino_soviet_normalization', name: '中苏关系正常化', side: 'cn', era: 'late', ops: 3, set: 'cn',
      desc: '移除亚洲 2 国各 1 点苏联影响力；中国 +2 VP；DEFCON 上升 1。',
      effect(h) {
        h.choose({ count: 2, from: h.region('asia').filter(cid => h.infl(cid, 'ussr') > 0), title: '中苏关系正常化', hint: '选择 2 个亚洲国家各移除 1 点苏联影响力' }, ids => ids.forEach(cid => h.rmFor('ussr', cid, 1)));
        h.vpMe(2); h.defcon(1);
      } },
    { id: 'third_world_leader', name: '第三世界领袖', side: 'cn', era: 'late', ops: 3, set: 'cn',
      desc: '在亚非中东的非战场国中选择 3 个「美苏均无影响力」的国家各加 1 点中国影响力；中国 +2 VP。',
      effect(h) {
        const pool = h.allCountries().filter(cid => !h.co(cid).bg && THIRD_WORLD.indexOf(h.co(cid).region) >= 0
          && h.infl(cid, 'us') === 0 && h.infl(cid, 'ussr') === 0);
        h.choose({ count: 3, from: pool, title: '第三世界领袖', hint: '选择 3 个美苏均无影响力的亚非中东非战场国各加 1 点中国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
        h.vpMe(2);
      } },
    { id: 'special_economic_zones', name: '经济特区', side: 'cn', era: 'late', ops: 3, set: 'cn',
      desc: '在中国加 2 点中国影响力；中国 +3 VP。',
      effect(h) { h.add('china', 2); h.vpMe(3); } },
    { id: 'special_zone_boom', name: '特区经济腾飞', side: 'cn', era: 'late', ops: 3, set: 'cn',
      desc: '在中国加 2 点中国影响力；中国 +3 VP。',
      effect(h) { h.add('china', 2); h.vpMe(3); } },
    { id: 'one_country_two_systems', name: '一国两制构想', side: 'cn', era: 'late', ops: 2, set: 'cn',
      desc: '中国 +1 VP；DEFCON 上升 1；在中国台湾加 1 点中国影响力。',
      effect(h) { h.vpMe(1); h.defcon(1); h.add('taiwan', 1); } },
    { id: 'sino_japanese_treaty', name: '中日和平友好条约', side: 'cn', era: 'late', ops: 2, set: 'cn',
      desc: '在日本加 1 点中国影响力；中国 +1 VP。',
      effect(h) { h.add('japan', 1); h.vpMe(1); } },
    { id: 'sino_indonesia_resume', name: '中国印尼复交', side: 'cn', era: 'late', ops: 2, set: 'cn',
      desc: '在印度尼西亚加 2 点中国影响力；中国 +1 VP。',
      effect(h) { h.add('indonesia', 2); h.vpMe(1); } },
    { id: 'cross_strait_exchange', name: '两岸探亲开放', side: 'cn', era: 'late', ops: 2, set: 'cn',
      desc: '在中国台湾加 1 点中国影响力；中国 +1 VP；DEFCON 上升 1。',
      effect(h) { h.add('taiwan', 1); h.vpMe(1); h.defcon(1); } },
    { id: 'multipolar_diplomacy', name: '多极化外交', side: 'cn', era: 'late', ops: 3, set: 'cn',
      desc: '在亚洲、非洲或中东选择 3 个国家各加 1 点中国影响力；中国 +2 VP。',
      effect(h) {
        const pool = h.region('asia').concat(h.region('africa'), h.region('mideast'));
        h.choose({ count: 3, from: pool, title: '多极化外交', hint: '选择 3 个亚非中东国家各加 1 点中国影响力' }, ids => ids.forEach(cid => h.add(cid, 1)));
        h.vpMe(2);
      } }
  ];

  const CARD_SETS = { base: '冷战主线', cn: '中国牌组', expand: '扩展历史事件' };

  const DECKS = [
    { id: 'std',     name: '标准牌组',     desc: '冷战主线 + 中国牌组 + 扩展历史事件。', sets: ['base', 'cn', 'expand'] },
    { id: 'cn_rise', name: '中国崛起牌组', desc: '中国牌组双倍权重，围绕第三世界与中美苏三角博弈。', sets: ['base', 'cn', 'cn', 'expand'] },
    { id: 'twin',    name: '美苏对决牌组', desc: '不含中国专属牌，回到两极对抗；中国是不可玩阵营，由电脑托管。', sets: ['base', 'expand'] }
  ];


  const PROMOTED = { "chn":"china", "mng":"mongolia", "khm":"cambodia", "lka":"srilanka", "bgd":"bangladesh", "yem":"yemen", "tza":"tanzania", "zmb":"zambia", "moz":"mozambique" };

  const BY_ID = Object.create(null);
  COUNTRIES.forEach(c => { BY_ID[c.id] = c; });
  const CARDS_BY_ID = Object.create(null);
  CARDS.forEach(c => { CARDS_BY_ID[c.id] = c; });
  const REGION_COUNTRIES = Object.create(null);
  REGIONS.forEach(r => { REGION_COUNTRIES[r.id] = []; });
  COUNTRIES.forEach(c => { REGION_COUNTRIES[c.region].push(c.id); });
  const DECK_BY_ID = Object.create(null);
  DECKS.forEach(d => { DECK_BY_ID[d.id] = d; });

  global.CWData = {
    SIDES, SIDE_NAME, SIDE_CLS, SIDE_FLAG, TURN_ORDER, VICTORY_VP, ABILITIES,
    THIRD_WORLD, CHINA_RULE, CN_POINT,
    REGIONS, COUNTRIES, CARDS, SETUP,
    AR_STANDARD, AR_SHORT, ERA_BY_TURN, SPACE_REQ, SPACE_VP,
    CARD_SETS, DECKS, DECK_BY_ID,
    PROMOTED, BY_ID, CARDS_BY_ID, REGION_COUNTRIES
  };
})(typeof window !== 'undefined' ? window : globalThis);
