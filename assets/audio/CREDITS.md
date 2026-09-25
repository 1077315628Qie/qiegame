# 背景音乐来源与授权（CREDITS）

> ## ⚠️ 版权状态：本仓库仅供本机自用，请勿分发
>
> 用户于 2026-09 明确指示：**「音乐和图片可以侵权，没问题的，仅本机使用」**。
> 据此，中国阵营的**晚期 BGM** 与**胜利 BGM** 都用了用户点名的《歌声与微笑》
> （1986 年谷建芬作曲、王健作词，**词曲与录音都仍在版权保护期内，未取得授权**）：
> **晚期是纯音乐（交响）版，无人声；胜利是童声合唱版** ——
> 按用户"晚期改纯音乐、胜利用合唱"的要求刻意区分。
>
> 因此：
> - 这两条音频（`cn_late.mp3` / `victory_cn.mp3`）**不能**随游戏一起对外发布、上传或再分发；
> - 图片同理 —— 配图脚本 `test/photocheck.js` 的授权筛查已按同一指示放开
>   （NC / ND / 合理使用 / 来源不明都放行，只查技术合规）；
> - 除此之外的音频仍沿用原来的干净口径（Wikimedia Commons 的 PD / CC0 / CC BY，
>   以及本项目自制的《送别》两首）。
> - 若日后要分发，需要先把这两条换成可授权素材：`node tools/gen_cn_bgm.mjs`
>   会把当初为规避侵权而写的原创曲《欢歌》《欢歌·胜利》写到
>   `tools/audio/_fallback/`，复制回 `assets/audio/` 并改 `manifest.js` 的文件名即可退回。

本目录 18 个音频文件覆盖 17 个 mood（`tension` 有两个候选文件）。

- 打包日期：2026-09（阵营 × 时代 + 头条 + 胜利 全套音乐包）
- 媒体来源：Wikimedia Commons（`https://commons.wikimedia.org`）+ 网易云音乐（仅中国两条，见上）；
  自制文件除外
- 下载 User-Agent：`ColdWarGame/1.0 (offline game audio pack; local use)`
- 本机无 ffmpeg / sox / oggenc，**未做任何转码**。对原始文件的加工只有**两处 MPEG 帧边界无损截取**
  （`victory_us.mp3` 前 15.02 s、`victory_cn.mp3` 前 20.01 s，见文末"复现与校验"），
  仅删整帧、不重新编码。
- **本机无法运行浏览器**：headless Chrome / Edge 在沙箱内启动即崩溃（见文末），也没有 `ffprobe`。
  因此**所有时长由自写容器解析器计算**，无法用 `new Audio()` 实测解码。

## 授权汇总

| 文件 | 用途 mood | 大小 (字节) | 实测时长 | 授权 | 授权模板 |
|---|---|---|---|---|---|
| `theme_menu.mp3` | menu | 863 124 | 37.15 s | Public domain | `PD-old-auto-expired` + `PD-USGov-Military-Air Force` |
| `tension_alert.ogg` | tension | 176 436 | 19.62 s | Public domain | `PD-USGov-FEMA` |
| `tension_void.ogg` | tension | 58 596 | 13.00 s | Public domain | `PD-USGov-NASA` |
| `us_early.mp3` | us_early | 1 170 403 | 110.86 s | Public domain | `PD-US-record-expired` |
| `us_mid.ogg` | us_mid | 2 392 724 | 255.22 s | Public domain | `PD-Edison Records` |
| `us_late.ogg` | us_late | 2 170 327 | 49.71 s | Public domain | `PD-old-100-1923` + `PD-USGov-Army` |
| `ussr_early.ogg` | ussr_early | 635 597 | 30.10 s | Public domain | `PD-old-100`（曲）+ `PD-author`（Musopen 录音） |
| `ussr_mid.mp3` | ussr_mid | 2 455 542 | 61.34 s | CC BY 3.0 | `CC-BY-3.0`（Kevin MacLeod） |
| `ussr_late.ogg` | ussr_late | 2 190 677 | 110.74 s | Public domain | `PD-old-100`（曲）+ `PD-author`（Musopen 录音） |
| `cn_early.wav` | cn_early | 2 466 704 | 55.93 s | Public domain | 曲 `PD-old-100`（Ordway d. 1880）+ 词 `PD-old-100`（李叔同 d. 1942）+ 录音 `PD-self`（自制） |
| `cn_mid.wav` | cn_mid | 2 466 704 | 55.93 s | Public domain | 同上 |
| **`cn_late.mp3`** | cn_late | 2 392 860 | 149.55 s | **⚠️ 版权未清（仅本机自用）** | 《歌声与微笑》**纯音乐/交响版**（无人声），**未获授权**，见第 12 条 |
| `headline_us.mp3` | headline_us | 555 357 | 20.11 s | Public domain | `PD-USGov-Military-Air Force` |
| `headline_ussr.ogg` | headline_ussr | 273 400 | 24.03 s | Public domain | `PD-self` |
| `headline_cn.wav` | headline_cn | 604 214 | 13.70 s | Public domain | 陕北民歌旋律（`PD-old`）+ 自制合成器录音（`PD-self`），见第 18 条 |
| `victory_us.mp3` | victory_us | 180 245 | 15.02 s | Public domain | `PD-USGov-Military`（截取前 15 s） |
| `victory_ussr.ogg` | victory_ussr | 476 659 | 39.38 s | Public domain | `PD-self` |
| **`victory_cn.mp3`** | victory_cn | 320 155 | 20.01 s | **⚠️ 版权未清（仅本机自用）** | 《歌声与微笑》**童声合唱**录音截取，**未获授权**，见第 21 条 |

**合计 21 849 724 字节（约 20.84 MiB）**，满足"整套 ≤ 24 MB"。
单首最大 2 466 704 字节（`cn_early.wav` / `cn_mid.wav`）。
分类预算（`test/audiocheck.js`）：时代曲 ≤ 2.6 MiB、头条 ≤ 0.6 MiB、胜利 ≤ 0.9 MiB —— 全部通过 ✓。

---

## 逐曲署名

每首附一行 **中文氛围说明**。

### 1. `theme_menu.mp3` — 主菜单
- **曲目**：The Stars and Stripes Forever（1896）最后 32 小节｜**作曲**：John Philip Sousa（1854–1932）
- **演奏**：Concert Band, United States Air Force Heritage of America Band
- **来源页**：https://commons.wikimedia.org/wiki/File:Last_32_measures_of_%22The_Stars_and_Stripes_Forever%22_-_Concert_Band_-_United_States_Air_Force_Heritage_of_America_Band.mp3
- **原始出处**：https://www.music.af.mil/Multimedia/Music/Public-Domain-Music/
- **授权**：Public domain（`PD-old-auto-expired` + `PD-USGov-Military-Air Force`）
- **实测**：37.146 s
- **氛围**：庄重的美国爱国进行曲，定场用。

### 2. `tension_alert.ogg` — 危机（DEFCON ≤ 2）
- **内容**：SAME 报头 → 853/960 Hz 警报音 → 结束音（47 CFR 11.31）｜**提供者**：FEMA
- **来源页**：https://commons.wikimedia.org/wiki/File:Emergency_Alert_System_Headers.ogg
- **授权**：Public domain（`PD-USGov-FEMA`）｜**实测**：19.618 s
- **氛围**：紧急广播警报，直白的危机感。

### 3. `tension_void.ogg` — 危机（DEFCON ≤ 2）
- **内容**：Cassini 记录的土星射电辐射｜**作者**：NASA / JPL / University of Iowa
- **来源页**：https://commons.wikimedia.org/wiki/File:Saturn_sound.ogg
- **原始出处**：https://photojournal.jpl.nasa.gov/catalog/PIA07967
- **授权**：Public domain（`PD-USGov-NASA`）｜**实测**：13.003 s
- **氛围**：稀疏失调的宇宙噪声，近乎虚无。

### 4. `us_early.mp3` — 美国 · 早期（1945–1962）
- **曲目**：Southern Hospitality（1899 年录音）｜**作曲**：John Philip Sousa（d. 1932）
- **演奏**：John Philip Sousa Band 本人乐队
- **来源页**：https://commons.wikimedia.org/wiki/File:John_Philip_Sousa_Band_-_Southern_Hospitality.mp3
- **授权**：Public domain（`PD-US-record-expired`：1899 年录音早已过期）｜**实测**：110.864 s
- **氛围**：老式单声道进行曲，尚武而稀疏，年代感强。

### 5. `us_mid.ogg` — 美国 · 中期（1963–1975）
- **曲目**：Semper Fidelis（1888）｜**作曲**：John Philip Sousa（d. 1932）
- **演奏**：United States Marine Band，1909 年爱迪生圆筒录音
- **来源页**：https://commons.wikimedia.org/wiki/File:John_Philip_Sousa_-_U.S._Marine_Band_-_Semper_Fidelis_March.ogg
- **授权**：Public domain（`PD-Edison Records`）｜**实测**：255.216 s
- **氛围**：美国海军陆战队军歌，编制饱满、气势最足。

### 6. `us_late.ogg` — 美国 · 晚期（1975–1989）
- **曲目**：Hail, Columbia（1789，附四巡礼号）｜**作曲**：Philip Phile（d. 1793）
- **演奏**：United States Army Band（约 2011）
- **来源页**：https://commons.wikimedia.org/wiki/File:Four_Ruffles_and_Flourishes,_Hail_Columbia_-_U.S._Army_Band.ogg
- **授权**：Public domain（`PD-old-100-1923` + `PD-USGov-Army`）｜**实测**：49.711 s
- **氛围**：国事仪式号角 + 早期美国爱国歌，收束、克制。

### 7. `ussr_early.ogg` — 苏联 · 早期（1945–1962）
- **曲目**：《图画展览会》"漫步"（moderato non tanto, pesante）｜**作曲**：Modest Mussorgsky（1839–1881）
- **演奏**：Musopen 录音（OTRS 2008012110017088）
- **来源页**：https://commons.wikimedia.org/wiki/File:Modest_Mussorgsky_-_pictures_at_an_exhibition_-_promenade_-_moderato_non_tanto,_pesante.ogg
- **授权**：Public domain（曲 `PD-old-100`；录音 `PD-author|Musopen`）｜**实测**：30.096 s
- **氛围**：俄罗斯式沉重低音、稀疏步伐，冷峻的开场。

### 8. `ussr_mid.mp3` — 苏联 · 中期（1963–1975）
- **曲目**：《伏尔加船夫曲》（俄罗斯传统民谣，曲调为公有领域）
- **演奏/编曲**：Kevin MacLeod（incompetech.com），**CC BY 3.0**
- **来源页**：https://commons.wikimedia.org/wiki/File:Song_of_the_Volga_Boatmen_(ISRC_USUAN1100688).mp3
- **授权**：**CC BY 3.0** — 必须署名：*Song of the Volga Boatmen — Kevin MacLeod (incompetech.com), Licensed under Creative Commons: By Attribution 3.0*
- **实测**：61.336 s
- **氛围**：暗沉、庄严的俄罗斯劳动号子，铜管厚重。

### 9. `ussr_late.ogg` — 苏联 · 晚期（1975–1989）
- **曲目**：《图画展览会》"与死者用亡灵的语言"（andante non troppo, con lamento）
- **作曲**：Modest Mussorgsky（1839–1881）｜**演奏**：Musopen 录音
- **来源页**：https://commons.wikimedia.org/wiki/File:Modest_Mussorgsky_-_pictures_at_an_exhibition_-_cum_mortuis_in_lingua_mortua_-_andante_non_troppo,_con_lamento.ogg
- **授权**：Public domain（`PD-old-100` + `PD-author|Musopen`）｜**实测**：110.736 s
- **氛围**：哀歌、缓慢、告别，帝国迟暮。

### 10. `cn_early.wav` — 中国 · 早期（1945–1962）
- **曲目**：《送别》拨弦独奏改编
- **曲**：John P. Ordway（1824–1880）*Dreaming of Home and Mother*｜**词**：李叔同（1880–1942），1915 年填词
- **演奏**：**本机自研合成器**（`tools/gen_cn_bgm.mjs`，无第三方依赖、无第三方录音）
- **授权**：**Public domain** —— 曲作者 1880 年去世、词作者 1942 年去世，词与曲均已进入公有领域；录音为本项目自制
- **实测**：55.930 s｜2 466 704 B
- **氛围**：单声部拨弦，只留旋律与每小节低音，最稀疏。

### 11. `cn_mid.wav` — 中国 · 中期（1963–1975）
- **曲目**：《送别》拨弦与副旋律改编｜**曲/词/演奏/授权**：同 `cn_early.wav`
- **实测**：55.930 s｜2 466 704 B
- **氛围**：拨弦旋律 + 低八度副旋律 + 低音，比早期饱满。

### 12. `cn_late.mp3` — 中国 · 晚期（1975–1989）⚠️
- **曲目**：**《歌声与微笑》纯音乐（交响）版 —— 无人声**
- **词曲**：**谷建芬 曲**、**王健 词**（1986 年作品；谷建芬健在，王健 2021 年去世）
- **版本**：《歌声与微笑（交响）》纯音乐编曲，**不含演唱**
- **来源**：网易云音乐 `https://music.163.com/song?id=3375588099`，
  音频经该站公开的 `song/media/outer/url` 直链取得（128 kbps MPEG-1 Layer III、44.1 kHz 立体声）
- **授权**：**⚠️ 版权未清 —— 未取得任何授权，仅供用户本机自用**
  用户 2026-09 明确决定"可以侵权，仅本机使用"。
- **实测**：149.551 s｜2 392 860 B
- **氛围**：明亮的交响编曲，无歌词，长时间循环也不会压过音效。
- **为什么用纯音乐**：用户反馈"中国的晚期 BGM 最好改成纯音乐，然后胜利是合唱"——
  常驻 BGM 带唱词会干扰对局，所以晚期改器乐、胜利保留童声合唱，两者形成对比。
- **身份依据（如实说明）**：本机**没有音频输出**，我无法试听。
  曲目身份来自**网易云音乐自身的检索接口**（按"歌声与微笑 交响"检索得到该 song id 与曲名），
  且服务端下发的文件**不含任何 ID3 文本帧**，所以没有"标签里写着曲名"这种独立佐证。
  版本是否为纯器乐，依据的是该条目的曲名「歌声与微笑（交响）」。若听感不对，换文件即可。
- **上一版**：中央人民广播电台少年广播合唱团的**合唱版**（60.06 s）——按用户要求换成纯音乐；
  再上一版是为规避侵权而写的自研原创曲《欢歌》（31.29 s）。
  原创曲仍在 `tools/audio/_fallback/cn_late.wav`。

### 13.（已移除）`card_us.oga` / `card_ussr.mp3` / `card_cn.ogg` — 原「各阵营牌激活 BGM」
- **移除原因（用户反馈）**：*"只有头条换bgm，小事件就不要换了，有点吵"*。
  小事件一局会出现几十次，每次都切一首 BGM 会把常驻音乐反复打断，听感很吵。
- **现在的行为**：**只有头条揭晓**会切换 BGM（`headline_*`）；小事件只播一记短提示音
  （`js/music.js` 的 `sfx('event'|'eventSu'|'eventCn')` + 按卡牌 id 生成的 `cardSting` 动机），
  **不动背景音乐**。因此 `js/ui.js` 的 `ALL_MOODS` 里也不再包含 `card_*`。
- **被删除的文件**：`card_us.oga`（美军号角 Attention，PD-USGov-Military，5.00 s）、
  `card_ussr.mp3`（《伏尔加船夫曲》前 15 s，CC BY 3.0，Kevin MacLeod）、
  `card_cn.ogg`（古琴泛音 Fanyin，PD-self，11.81 s）。三者授权都合格，
  若日后想恢复"按阵营出牌换曲"，按原来源页重新下载即可。

### 16. `headline_us.mp3` — 美国头条揭晓
- **曲目**：One Ruffle and Flourish and "General's March"｜**演奏**：USAF Band 管乐团（1997）
- **来源页**：https://commons.wikimedia.org/wiki/File:One_Ruffle_and_Flourish_and_General%27s_March_-_Concert_Band_-_United_States_Air_Force_Band.mp3
- **授权**：Public domain（`PD-USGov-Military-Air Force`）｜**实测**：20.114 s
- **氛围**：仪仗号角 + 将军进行曲，干脆利落。

### 17. `headline_ussr.ogg` — 苏联头条揭晓
- **曲目**：《舍赫拉查德》Op.35 独奏片段｜**作曲**：Nikolai Rimsky-Korsakov（1844–1908）
- **演奏**：S. Kalinovsky（1956），上传者 User:Kalinovskiy 自述为本人演奏
- **来源页**：https://commons.wikimedia.org/wiki/File:%D0%A8%D0%B5%D1%85%D0%B5%D1%80%D0%B0%D0%B7%D0%B0%D0%B4%D0%B0_%D1%84%D1%80%D0%B0%D0%B3%D0%BC%D0%B5%D0%BD%D1%82.ogg
- **授权**：Public domain（录音 `PD-self`；曲 `PD-old`）｜**实测**：24.033 s
- **氛围**：俄罗斯管弦乐独奏片段，戏剧性转折。

### 18. `headline_cn.wav` — 中国头条揭晓
- **曲目**：**《东方红》**（合成器编配，无人声）
- **旋律**：**陕北民歌**（《骑白马》《芝麻油》曲调），**词**：李有源（1940 年代）——
  旋律本身是**公有领域民歌**；本曲只用了旋律层，**没有采用任何编曲版本的和声**
  （例如李焕之 1950 年代的合唱编配仍在其版权期内，本曲与它无关）。
- **演奏/编配**：**本机自研合成器**（`tools/gen_cn_bgm.mjs` 的 `renderDongfanghong`）：
  双振荡器微失谐锯齿 + 滤波包络的合成主音领奏，配低音、军鼓与镲，2/4 进行曲感，
  末两小节加军鼓滚奏收尾。**授权：Public domain**（民歌旋律 + 自制录音）。
- **实测**：13.699 s｜604 214 B｜22.05 kHz 单声道 WAV（峰值 0.90，RMS 0.151）
- **氛围**：明亮、庄严，一响起就是那个年代。
- **音高数据来源（如实说明）**：旋律级数照抄公开简谱的旋律层
  （1=F，2/4，中速庄严），数据写在 `tools/gen_cn_bgm.mjs` 的 `DONGFANGHONG` 常量里，可复核、可重跑：
  `node tools/gen_cn_bgm.mjs headline_cn`。
  **本机没有音频输出，我无法试听**，所以"听起来像不像"只能由你判断；
  若某个乐句不对，改那个常量里的级数/拍数即可，无需改动游戏代码。
- **被替换掉的一首**：`headline_cn.ogg`（《李中堂乐》和声进行，User:Kapoios2026，CC0 1.0，23.81 s）。
- **为什么是 WAV 而不是 Ogg**：本机没有音频编码器，自制音频只能输出未压缩 PCM；
  文件名从 `.ogg` 改成 `.wav` 后仍受"头条曲 ≤ 0.6 MiB"预算约束，所以长度控制在 13.7 s。

### 19. `victory_us.mp3` — 美国胜利
- **内容**：美军号角令 To the Color 前 15 秒（帧边界无损截取）｜**作者**：U.S. Army
- **来源页**：https://commons.wikimedia.org/wiki/File:ToTheColor.mp3
- **授权**：Public domain（`PD-USGov-Military`）｜**实测**：15.020 s
- **氛围**：向国旗致敬的号角，昂扬收尾。

### 20. `victory_ussr.ogg` — 苏联胜利
- **曲目**：《舍赫拉查德》片段（较长版）｜**作曲**：Nikolai Rimsky-Korsakov（1844–1908）｜**演奏**：S. Kalinovsky
- **来源页**：https://commons.wikimedia.org/wiki/File:Shaherazada_fragment.ogg
- **授权**：Public domain（`PD-self`）｜**实测**：39.380 s
- **氛围**：俄罗斯管弦乐长气息片段，悲壮而非欢庆。

### 21. `victory_cn.mp3` — 中国胜利 ⚠️
- **曲目**：**《歌声与微笑》童声合唱版**（截取前 20.01 s 作为胜利段）
- **词曲**：**谷建芬 曲**、**王健 词**（1986）｜**演唱**：北京新月童声合唱团（**合唱**）
- **来源**：网易云音乐 `https://music.163.com/song?id=5269692`，同样经 `song/media/outer/url` 直链取得
- **授权**：**⚠️ 版权未清 —— 未取得授权，仅供本机自用**（同上）
- **实测**：20.010 s｜320 155 B（由 `tools/audio/cw_trim_mp3.mjs` 在帧边界无损截取，不重新编码）
- **氛围**：同一首歌最抓耳的开头段（"请把我的歌带回你的家"），童声齐唱，作为胜利曲一响就认得出来。
  按用户要求，**晚期是纯音乐、胜利是人声合唱**，两者刻意区分开。
- **上一版**：自研合成器原创曲《欢歌·胜利》（16.84 s），仍在 `tools/audio/_fallback/victory_cn.wav`。

---

## 音乐结构：阵营 × 时代 + 头条 + 胜利

`manifest.js` 的 `mood` 键由 `js/ui.js` 的 `ALL_MOODS` 决定（测试以该处为唯一权威），共 **17 个 mood、18 个文件条目**
（`tension` 有两个文件）：

- **阵营回合背景乐（9 首）**：`us_early/mid/late`、`ussr_early/mid/late`、`cn_early/mid/late`，
  由 `baseMood()` 以 `当前阵营 + 时代` 拼接后取用。
- **出牌提示：不是 BGM。** 小事件只播一记短音效，不切换背景音乐（见第 13 条说明）。
- **头条揭晓（3 首）**：`headline_us` / `headline_ussr` / `headline_cn`。
- **胜利画面（3 首）**：`victory_us` / `victory_ussr` / `victory_cn`。
- **保留（3 条目）**：`menu`（主菜单）、`tension` ×2（DEFCON ≤ 2）。
  （原先还有一条 `cn_cue`：中国牌揭晓时叠《茉莉花》提示音 —— 用户不想要，2026-09 功能与文件一并移除。）

**本次从磁盘删除的旧曲目**（连同 manifest 条目与旧署名行）：

| 已删除文件 | 原 mood | 原曲目 | 删除原因 |
|---|---|---|---|
| `era_early.ogg` | early | 《起锚》Anchors Aweigh | 时代制改为阵营 × 时代制 |
| `era_mid.ogg` | mid | 霍尔斯特《行星组曲》I. 火星 | 同上 |
| `era_late.ogg` | late | 肖邦前奏曲 Op.28 No.20 | 同上 |
| `bgm_us.mp3` | us | 《美国陆军军歌》 | **作曲层不合格**：1908 年格鲁伯旋律虽属 PD，但官方 1952 年版由 Harold W. Arberg（d. 1996）改编，改编仍在保护期 |
| `bgm_ussr.ogg` | ussr | 《斯拉夫女人的告别》 | **作曲层不合格**：Vasily Agapkin（d. 1968）仍在保护期（life+70 约至 2038） |
| `bgm_cn.ogg` | cn | 中国声乐与器乐合奏（1903） | 内容已折入 `cn_early` |
| `card_us.oga` / `card_ussr.mp3` / `card_cn.ogg` | card_* | 阵营号角 / 船夫曲 / 古琴泛音 | 用户要求"小事件不要换 BGM"（见第 13 条） |
| `cn_early.ogg` / `cn_mid.ogg` / `cn_late.ogg` | cn_early / cn_mid / cn_late | 1903 年合奏 / 古琴《酒狂》/ 琴歌《秋风词》 | 用户要求中国三时代改用《送别》（见下节） |
| `cn_late.wav`（《欢歌》版） | cn_late | 原创《欢歌》 | 用户要求换成《歌声与微笑》真实录音；文件移到 `tools/audio/_fallback/` 保留 |
| `victory_cn.wav`（《欢歌·胜利》版） | victory_cn | 原创《欢歌·胜利》 | 同上 |
| `cn_jasmine.opus` | cn_cue | 《茉莉花》（Commons 合成演示，CC0 1.0，26.08 s） | **用户自行删除并要求撤掉此功能**（中国牌不再叠提示音） |
| `headline_cn.ogg` | headline_cn | 《李中堂乐》和声进行（User:Kapoios2026，CC0 1.0，23.81 s） | 用户要求中国头条曲改用合成器版《东方红》（第 18 条） |

---

## 中国音乐：三首自制 + 两首用户指定录音

| 文件 | 来源 | 授权 |
|---|---|---|
| `cn_early.wav` | 《送别》通行简谱（16 小节，1=C，♩=72），`tools/gen_cn_bgm.mjs` 自制演录 | Public domain |
| `cn_mid.wav` | 同上（加低八度副旋律） | Public domain |
| `cn_late.mp3` | **《歌声与微笑》纯音乐（交响）版**（网易云 id=3375588099，无人声） | ⚠️ 版权未清，仅本机自用 |
| `victory_cn.mp3` | **《歌声与微笑》童声合唱版**（网易云 id=5269692）前 20.01 s | ⚠️ 版权未清，仅本机自用 |
| `headline_cn.wav` | **《东方红》合成器编配**（陕北民歌旋律，`tools/gen_cn_bgm.mjs` 自制） | Public domain |

**《送别》两首（`cn_early` / `cn_mid`）**：曲 John P. Ordway《Dreaming of Home and Mother》
（曲作者 1880 年去世）、词李叔同 1915 年填词（1942 年去世），词曲均已进入公有领域。
两首各 55.93 s / 2.35 MiB（22.05 kHz 16-bit 单声道 WAV）。

**为什么《送别》是自制演录，而不是 Commons 录音**：在 Wikimedia Commons 上找不到《送别》、
也找不到 Ordway 原曲的合规录音。已用下列关键词逐一检索 Commons API（含分类遍历）：
`送别`、`送別`、`Songbie`、`长亭外`、`Li Shutong`、`Dreaming of Home and Mother`、
`Dreaming of home`、`Ordway`、`Chinese farewell song`，以及 `Category:Chinese songs`、
`Category:Songs of China`；命中的只有发音文件、CC BY-SA 翻唱与无关中文流行曲。
Commons 上也没有该曲的 MIDI/ABC 记谱。

**乐谱数据可复核、可重跑**：《送别》严格按通行简谱的音高与节奏写在
`tools/gen_cn_bgm.mjs` 的 `SONGBIE` / `SONGBIE_BASS` 常量里；原创曲《欢歌》写在
`HUANGE` / `HUANGE_BASS` / `VICTORY` 常量里。生成器已改为**确定性**（内置 mulberry32 伪随机流，
不再用 `Math.random()`），同一份代码每次输出**完全相同的字节**，因此下面的 SHA-256 是可复现的：

```
node tools/gen_cn_bgm.mjs              # 全部四个任务
node tools/gen_cn_bgm.mjs cn_late      # 只生成《欢歌》（写进 _fallback，不碰 assets）
```

> 注意：`cn_early` / `cn_mid` 的合成路径本来就不含随机成分，所以换成确定性随机后
> 这两个文件的字节**没有变化**（哈希与上一版一致）。只有用到鼓/沙锤的《欢歌》受影响。

**《歌声与微笑》两条的取得方式**（便于你复核或替换）：

```
# 检索（网易云公开接口，工具里用 --q= 换关键词：伴奏 / 纯音乐 / 交响）
https://music.163.com/api/search/get?s=歌声与微笑&type=1&limit=10
# 直链（会 302 到 CDN，返回 audio/mpeg）
https://music.163.com/song/media/outer/url?id=3375588099.mp3   # 晚期 BGM：纯音乐/交响版，149.55 s
https://music.163.com/song/media/outer/url?id=5269692.mp3      # 胜利段来源：童声合唱，157.54 s
# 帧边界无损截取前 20.01 s（不重新编码）
node tools/audio/cw_trim_mp3.mjs <in.mp3> assets/audio/victory_cn.mp3 20
```

**器乐版的其他候选**（都已下载验证过，想换只需一条命令换成对应 id）：
`#480333850`「歌声与微笑 - 钢琴曲」2:08 / 2.05 MB（钢琴独奏，最"纯"）、
`#2019496324`「(伴奏)」1:49 / 1.75 MB（伴奏带）。
另有两条（`#2160183594`、`#1923484063`）服务端只返回 HTML 错误页，取不到音频。

重新抓取候选的工具留在 `tools/audio/cw_fetch_gesheng.mjs`（检索 + 下载 + 用解析库体检，
产物落在 `tools/audio/_dl/`，不碰 `assets/`）。已复跑验证：重新下载得到与
`assets/audio/cn_late.mp3` **完全相同的字节**（SHA-256 一致），所以上面的来源是可复现的。
当初 5 个候选都是 128 kbps MPEG-1 Layer III、44.1 kHz 立体声、无容器错误。

---

## 已排除的候选（授权或来源不合格，**在"仅本机自用"决定之前**的取舍记录）

> 下表是中国两条换曲**之前**的口径。现在用户已决定本机自用、不再筛查授权，
> 所以下表仅作历史记录；其中的 `File:Qingshang diao.ogg` 等若你想要仍可取用。

| 候选 | 排除原因 |
|---|---|
| `File:Slavianka` 系列（《斯拉夫女人的告别》多种录音） | 录音为美国海岸警卫队（PD-USCG）合格，但**作曲者 Vasily Agapkin（d. 1968）仍受保护**。 |
| 《美国陆军军歌》官方版（`File:The Army Song ...`、`File:The Army Goes Rolling Along ...`） | 1952 年官方版由 **Harold W. Arberg（d. 1996）改编**，改编层仍在保护期。 |
| `File:Jiu Kuang.ogg`、`File:Qiu Feng Ci.ogg` | 模板为 `{{Self\|GFDL\|Cc-by-sa-3.0-migrated\|Cc-by-2.5}}` 多选一；曾按 CC BY 2.5 有条件采用，现已随中国曲目改写移除。 |
| `File:Gliding dance of maidens.ogg`（鲍罗丁《波洛维茨舞曲》4 小节） | 模板同上，且仅 4 小节，弃用。 |
| `File:March of the Volunteers instrumental.ogg`（中国国歌器乐版） | 文件页**正被提删**：李焕之、程义明改编的管乐版本仍受保护（李焕之 2000 年去世）。 |
| `File:Baima Diao.ogg` | 授权 CC0 无问题，但文件页**正被提删**（提删理由：听不出《白马调》）。 |
| `File:Tune of Li Zhongtang (recording old).opus` | 来自 YouTube，`{{PD-old-70}}` + `{{LicenseReview}}` 尚未复核，来源不明。弃用（当时改用自制 CC0 版本，该版本 2026-09 又按用户要求换成合成器版《东方红》，见第 18 条）。 |
| `File:Fanfares of President of the Russian Federation.ogg` | 作曲者 Pavel B. Ovsjannikov 为**当代作曲家**，PD 声明不可靠。 |
| `File:Gimn Sovetskogo Soyuza (1944 Stalinist lyrics).oga` | 含 `{{Communist symbol}}` 使用限制模板；1944 年苏联录音的 PD 依据存疑。 |
| `File:Russian anthem instrumental.oga` | 录音为美国海军乐队（PD-USGov）合格，但曲目为俄联邦现行国歌，作曲者亚历山德罗夫（d. 1946）在美国的版权状态有争议。 |
| `File:Attention.mp3` 等 MPEG-2 号角 MP3 | 授权合格，但项目验收脚本的 MP3 解析器对 **MPEG-2（22.05 kHz）** 帧长判定有误，会把 9.87 s 读成 4.86 s；改用同内容的 Ogg 版本。 |
| `File:Qingshang diao.ogg` | 曾用作 `victory_cn`（`PD-self`，授权合格）；已换曲而移除。 |
| `File:Hsi-pi Tso fang Tsao (1931).ogg`、`File:Pang-tse Nan-tien-men (1931).oga` | `{{PD-traditional}}` 对 1931 年商业唱片的邻接权覆盖不明确。 |
| `File:Cup of Solid Gold 1914.ogg`、`File:Pu Tian Yue.ogg` | 授权合格，但均为清末（1914）曲目，与中华人民共和国阵营的时代不符。 |
| `File:Emergency Alert System Attention Signal 20s.ogg` | `PD-ineligible` + `GFDL-self`，授权不纯净；已改用 `PD-USGov-FEMA` 版本。 |
| `File:Pneumatic Air Raid Siren.wav` | CC BY-SA 4.0，且为 WAV。 |
| `File:Siegfrieds funeral march, excerpt.flac` | CC0 但为 FLAC，非交付格式。 |
| 肖斯塔科维奇 / 普罗科菲耶夫 / 哈恰图良等 20 世纪苏联作曲家 | 仍在保护期，当时按要求回避。 |

---

## 复现与校验

**为什么没有浏览器实测**：本构建环境无法启动任何浏览器。
headless Chrome（`C:\Program Files\Google\Chrome\Application\chrome.exe`）与 Edge
（`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`）在 `--headless=new`、
`--dump-dom`、`--remote-debugging-port`、`--single-process`、`--no-sandbox` 各种组合下均立即崩溃：

```
FATAL:mojo\public\cpp\platform\platform_channel.cc:108] Check failed: . : 拒绝访问。 (0x5)
ERROR:third_party\crashpad\crashpad\client\crashpad_client_win.cc:421] OpenProcess: 拒绝访问。 (0x5)
```

沙箱禁止创建命名管道，浏览器的 mojo IPC 无法工作，`new Audio()` / `loadedmetadata` 路径不可用。
本机也没有 `ffmpeg` / `ffprobe` / `sox` / `oggenc`。**因此所有时长一律由自写容器解析器计算。**

- 工具（均在 `tools/audio/`）：
  - `cw_audio_parse.mjs` — 解析库（Ogg / MPEG / RIFF）
  - `cw_duration.mjs` — 逐文件时长与容器校验
  - `cw_verify.mjs` — 按 `manifest.js` 全量校验（魔数、扩展名一致性、秒数偏差、体积预算、mood 覆盖）
  - `cw_commons.mjs` — Commons 检索 / 授权模板核对 / 下载
  - `cw_fetch_batch.mjs` — 批量下载（一次 API 调用 + 限速退避）
  - `cw_trim_mp3.mjs` — **MPEG 帧边界无损截取**（不重编码；支持 `[startSeconds]` 起点偏移）
- **Ogg（Vorbis / Opus）**：取最后一页 granule position，Vorbis 除以 ID 头第 12–15 字节采样率，
  Opus 固定除以 48 000；同时校验每页 CRC（多项式 `0x04c11db7`）、页序号连续性与 EOS 标志。
- **WAV（RIFF）**：校验 `RIFF` / `WAVE` 魔数、`fmt ` 块的采样率与声道数、`data` 块字节数，
  时长 = `data` 字节数 ÷（采样率 × 声道数 × 位深 ÷ 8）。
- **MP3**：逐帧解析帧头（同步字 `0xFFE` + 版本/层/比特率/采样率/填充位查表）累加采样数
  （MPEG1 Layer III = 1152，MPEG2 = 576），并识别 Xing/Info、ID3v1/Lyrics3/APE 附加标签。
- **魔数断言**：`OggS` / `ID3` 或 `0xFFE` / `RIFF....WAVE` / `fLaC`，且必须与扩展名一致。
  （修掉了 `magic()` 里 `b(12) === 'WAVE'` 的旧 bug —— 它拿 12 字节字符串比 4 字符常量，
  导致所有 `.wav` 都被判成 `unknown`；现已按字节区间 8–12 比对。）
- **两处无损截取**：`victory_us.mp3`（前 15.02 s）与 `victory_cn.mp3`（前 20.01 s），
  都只删整帧、不重新编码，输出仍是标准可解码 MP3。

**验收脚本通过**：`node test/audiocheck.js` 退出码 0：

```
name                     bytes  fmt   parsed   manifest
theme_menu.mp3          863124  mp3     37.15      37
tension_alert.ogg       176436  ogg     19.62      20
tension_void.ogg         58596  ogg     13.00      13
us_early.mp3           1170403  mp3    110.86     111
us_mid.ogg             2392724  ogg    255.22     255
us_late.ogg            2170327  ogg     49.71      50
ussr_early.ogg          635597  ogg     30.10      30
ussr_mid.mp3           2455542  mp3     61.34      61
ussr_late.ogg          2190677  ogg    110.74     111
cn_early.wav           2466704  wav     55.93      56
cn_mid.wav             2466704  wav     55.93      56
cn_late.mp3            2392860  mp3    149.55     150
headline_us.mp3         555357  mp3     20.11      20
headline_ussr.ogg       273400  ogg     24.03      24
headline_cn.wav         604214  wav     13.70      14
victory_us.mp3          180245  mp3     15.02      15
victory_ussr.ogg        476659  ogg     39.38      39
victory_cn.mp3          320155  mp3     20.01      20
mood 需求 17 个：全部覆盖；无多余
未被清单引用的音频: 无
✓ 音频文件与清单一致
```

独立工具 `node tools/audio/cw_verify.mjs` 同样 **PASS**：19 个文件、整套 **21 849 724 B（20.84 MiB）**、
`faction/era/headline/victory tracks: 15 / 15`，并逐条复算时长与本表一致。

**SHA-256（全部 18 首）**

| 文件 | SHA-256 |
|---|---|
| `theme_menu.mp3` | `505d962e2372b3eb8e7649ec55228035538bbb4c7d9ae996f61558bd8878d918` |
| `tension_alert.ogg` | `c0df4a61fcc89010c2255b0d3ab4f85697e4181480d70282cd5ab32cfa86d50f` |
| `tension_void.ogg` | `1e3f2853f2856a48fc77a67be01b0fab8e162d3d86d1d1c501c0b781da35fa37` |
| `us_early.mp3` | `8e76d8f2f011fcd6e88db7c4111c0de1a93855853241a486bee5a22d7edee320` |
| `us_mid.ogg` | `3ddc3a258569940b620ad31720d1443579fa5bc786eb5583bfcc6c35ef082489` |
| `us_late.ogg` | `f982f08ceb73c9768ea38bc5e05d5ac5d064446771687e62bf0ebd377b9bbdd6` |
| `ussr_early.ogg` | `d132021c76741aa2c662bfa4894d426b3a0f537f91c396a01f5cf55ca40c55dd` |
| `ussr_mid.mp3` | `d7dcf91e7b007a70f89518e4322fe094f8c04666d67911f64d787dfb58af131f` |
| `ussr_late.ogg` | `3a9eee63896b2a6ff89ac6465b74b7057280a04d7b53bf5c2d6acbde4d21f445` |
| `cn_early.wav` | `f8d5fe4d931b57eaaa86a58d689f8bfaa8f5bf05671b35ef8b46d23276effd89` |
| `cn_mid.wav` | `ec921bfce0a8ec14b6b6c0ba9d32fe935d0a35056f93d02e9b020de0dda74d1b` |
| `cn_late.mp3` | `dca9ecb28e137e93ee605b62b5549251b637c27f026e9d87e0436de380500e23` |
| `headline_us.mp3` | `4559fb6115a5f943172ffc58544104a24709e22322fc4973ce8483383019a8d0` |
| `headline_ussr.ogg` | `e4a21633c77695a98dde54c5185d95438340e787a5f3f0f80c41a1ba76a4bc93` |
| `headline_cn.wav` | `1e2e6ea1821884f6717fecd9f1697eec5d652a709878c31e21e9f29fe16eac6a` |
| `victory_us.mp3` | `ff3a076e5a549e029a87d59110f5cfd13268a25188bbd478cc19f63fc8e6d2f4` |
| `victory_ussr.ogg` | `9a739682e1308296f820c53ad367be0a9fc676b5f468cd96a5a1d4bb53d09e6d` |
| `victory_cn.mp3` | `c11072f79e51f5789476594fd3d0bb71353fbfeb603418bb7a3762e4cd01493e` |

**遗留风险与偏差（如实记录）**

1. **两条音频版权未清（最重要）。** `cn_late.mp3`（纯音乐/交响版）与 `victory_cn.mp3`（童声合唱版）
   都源自《歌声与微笑》，**未取得授权**，按用户 2026-09 的"仅本机自用"决定保留。
   **不要连同游戏一起分发。**
2. **无法试听 ⇒ 曲目与版本只有单一来源。** 本机没有音频输出，也没有解码器；
   "这两条是《歌声与微笑》"以及"晚期那条是纯器乐、不是人声"，都只由网易云检索接口的曲名元数据支持
   （曲名分别为「歌声与微笑（交响）」与「歌声与微笑」），下载到的文件里**没有任何 ID3 文本帧**可作旁证。
   若听感不对（比如交响版其实带了合唱），换文件即可（`tools/audio/_dl/` 里另有钢琴曲与伴奏带两个器乐候选）。
3. **无浏览器 ⇒ 未做真实 PCM 解码验证。** 现有证据为容器级完整性（Ogg 全页 CRC / MP3 逐帧合法 /
   WAV 块长度），且两个独立解析器（`test/audiocheck.js` 与 `tools/audio/cw_verify.mjs`）
   复算的时长一致。容器格式均为浏览器原生支持。
4. **时代曲体积超出 1.2 MB 预算（9 首中 4 首）**：`us_mid` 2.39 MB、`us_late` 2.17 MB、
   `ussr_mid` 2.46 MB、`ussr_late` 2.19 MB，以及两首《送别》WAV（各 2.35 MB）。
   原因是 Commons 上合规录音没有 ≤1.2 MB 的版本，且本机**无编码器**无法压缩 Ogg，
   《送别》只能输出未压缩 PCM。验收脚本对时代曲的上限是 2.6 MiB，全部通过；
   整套音频 **20.84 MiB ≤ 24 MB**。
5. **中国 4 首里前 2 首是自制录音，不是历史录音。** 音色为自研合成器的拨弦质感；
   《送别》用公有领域简谱、乐谱与合成脚本在 `tools/gen_cn_bgm.mjs`，可复核、可确定性重跑。
6. **`us_early.mp3` 来自 YouTube 转载的 1899 年录音**，文件页以 `PD-US-record-expired` 标注；
   1899 年出版的录音早已进入公有领域，依据充分。
7. **`headline_ussr.ogg` / `victory_ussr.ogg` 的 `PD-self` 依赖上传者即演奏者**
   （User:Kalinovskiy = С. Калиновский）这一自述；作曲层（里姆斯基-科萨科夫，d. 1908）无任何疑问。
