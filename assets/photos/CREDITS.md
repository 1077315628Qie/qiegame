# 图片版权致谢 / Image Credits

> ## ⚠️ 授权口径已于 2026-09 变更：本仓库仅供本机自用，请勿分发
>
> 用户明确指示：**「音乐和图片可以侵权，没问题的，仅本机使用」**。
> 据此，配图的授权**不再作为准入门槛** —— NC / ND / 合理使用 / 来源不明的图片都可能出现在本目录，
> 检查脚本 `test/photocheck.js` 只再校验**技术条件**（文件存在、真实 JPEG、宽 ≤1024、≤320 KiB、
> 以及 license/page/caption 三个字段非空）。
>
> 因此**不要把 `assets/photos/` 里的图片随游戏一起对外发布**。
> 若日后要分发，需要重新按 PD / CC0 / CC BY / CC BY-SA / GFDL 筛一遍（本表已逐张列出许可，便于筛查）。

图片全部取自 [Wikimedia Commons](https://commons.wikimedia.org/)，
通过 Commons 的 `action=query&generator=search` 接口检索并取其官方缩放缩图
（`upload.wikimedia.org`），统一满足宽 ≤1024 px、体积 ≤320 KiB。

- 卡牌图片 **139** 张，区域图片 **6** 张，磁盘文件 **136** 个（合计 10.05 MiB）
- 其中 **9** 张是"同主题共用一张图"（清单里用 `reusedFrom` 标注，指向源卡片），所以文件数少于卡牌数
- **5** 张的作者字段只能填「未标注（见来源页）」（文件页本身没写作者）

## 卡牌图片

| 卡牌 id | 中文说明 | 文件 | 作者 | 许可证 | Commons 页面链接 |
| --- | --- | --- | --- | --- | --- |
| iron_curtain | 1945至1949年东欧苏维埃化地图 | `iron_curtain.jpg` | Fernando Martínez Ruedak eta Mikel Aizpuru Muruak egina, Martínez Rueda, F. eta Urquijo Goitia, M. (2006): Materiales para la historia del mundo actual , Madril, Istmo, I., 107. orrialdetik abiatuz. | CC BY-SA 4.0 | [1945-1949 Ekialdeko Europaren sobietartze-prozesua.jpg](https://commons.wikimedia.org/wiki/File:1945-1949_Ekialdeko_Europaren_sobietartze-prozesua.jpg) |
| warsaw_pact | 华沙条约组织成立会议现场 | `warsaw_pact.jpg` | nieznany/unknown | Public domain | [Warsaw Pact 1955.jpg](https://commons.wikimedia.org/wiki/File:Warsaw_Pact_1955.jpg) |
| cominform | 共产党情报局 | `cominform.jpg` | Vlada Marinković | CC BY-SA 3.0 | [Belgrade iz balona.jpg](https://commons.wikimedia.org/wiki/File:Belgrade_iz_balona.jpg) |
| korean_war | 朝鲜战争中美军士兵登上运输机 | `korean_war.jpg` | USAF photo 83837 AC | Public domain | [C-124 Globemaster with troops in Korea 1951.JPEG](https://commons.wikimedia.org/wiki/File:C-124_Globemaster_with_troops_in_Korea_1951.JPEG) |
| suez_crisis | 苏伊士运河危机中的英法军队 | `suez_crisis.jpg` | Fleet Air Arm official photographer | Public domain | [810 Naval Air Squadron bombing.jpg](https://commons.wikimedia.org/wiki/File:810_Naval_Air_Squadron_bombing.jpg) |
| hungarian_rev | 1956年布达佩斯街头的苏军坦克 | `hungarian_rev.jpg` | FOTO:Fortepan — ID 24628 : Adományozó/Donor: Nagy Gyula. archive copy at the Wayback Machine | CC BY-SA 3.0 | [Férfi portré, tank, 1956. Fortepan 24628.jpg](https://commons.wikimedia.org/wiki/File:F%C3%A9rfi_portr%C3%A9,_tank,_1956._Fortepan_24628.jpg) |
| sputnik | 斯普特尼克1号卫星复制品 | `sputnik.jpg` | NSSDC, NASA [1] | Public domain | [Sputnik asm.jpg](https://commons.wikimedia.org/wiki/File:Sputnik_asm.jpg) |
| de_gaulle | 戴高乐1960年会见本-古里安 | `de_gaulle.jpg` | Fritz Cohen | Public domain | [Charles De Gaulle - David Ben Gurion 1960.jpg](https://commons.wikimedia.org/wiki/File:Charles_De_Gaulle_-_David_Ben_Gurion_1960.jpg) |
| nasser | 纳赛尔总统官方肖像照 | `nasser.jpg` | Not credited | Public domain | [Nasser 1961.jpg](https://commons.wikimedia.org/wiki/File:Nasser_1961.jpg) |
| castro | 卡斯特罗1959年进入哈瓦那 | `castro.jpg` | Desconhecido | Public domain | [Fidel Castro's entry into Havana, 1959.jpg](https://commons.wikimedia.org/wiki/File:Fidel_Castro%27s_entry_into_Havana,_1959.jpg) |
| finlandization | 芬兰总统吉科宁肖像照 | `finlandization.jpg` | Anonymous Unknown author / Kuvasiskot studio | CC BY 4.0 | [Urho-Kekkonen-1977-c.jpg](https://commons.wikimedia.org/wiki/File:Urho-Kekkonen-1977-c.jpg) |
| soviet_atom | 1949年苏联首次核试验 | `soviet_atom.jpg` | Boris Losin (Q116062773) (1919–1990) / TASS | Public domain | [Kurchatov 1930th.jpeg](https://commons.wikimedia.org/wiki/File:Kurchatov_1930th.jpeg) |
| arab_israeli | 1948年帕尔马赫部队进攻萨萨 | `arab_israeli.jpg` | Unknown author Unknown author | Public domain | [Palmach Sasa.jpg](https://commons.wikimedia.org/wiki/File:Palmach_Sasa.jpg) |
| marshall_plan | 马歇尔计划官方宣传海报 | `marshall_plan.jpg` | E. Spreckmeester (also credited as "I. Spreekmeester"), published Economic Cooperation Administration | Public domain | [Marshall Plan poster.JPG](https://commons.wikimedia.org/wiki/File:Marshall_Plan_poster.JPG) |
| truman_doctrine | 杜鲁门总统官方肖像照 | `truman_doctrine.jpg` | Greta Kempton | Public domain | [HarryTruman.jpg](https://commons.wikimedia.org/wiki/File:HarryTruman.jpg) |
| nato | 杜鲁门签署北大西洋公约 | `nato.jpg` | Abbie Rowe | Public domain | [Truman signing North Atlantic Treaty.jpg](https://commons.wikimedia.org/wiki/File:Truman_signing_North_Atlantic_Treaty.jpg) |
| berlin_airlift | 坦佩尔霍夫机场的C-47运输机 | `berlin_airlift.jpg` | U.S. Air Force | Public domain | [C-47s at Tempelhof Airport Berlin 1948.jpg](https://commons.wikimedia.org/wiki/File:C-47s_at_Tempelhof_Airport_Berlin_1948.jpg) |
| containment | 乔治·凯南1947年肖像 | `containment.jpg` | Harris & Ewing | Public domain | [George F. Kennan 1947.jpg](https://commons.wikimedia.org/wiki/File:George_F._Kennan_1947.jpg) |
| un_korea | 首尔街巷中的联合国军士兵 | `un_korea.jpg` | Lt. Strickland/Cpl. Romanowski | Public domain | [United Nations troops fighting in the streets of Seoul, Korea HD-SN-99-03081.jpg](https://commons.wikimedia.org/wiki/File:United_Nations_troops_fighting_in_the_streets_of_Seoul,_Korea_HD-SN-99-03081.jpg) |
| norad | 夏延山北美防空司令部隧道 | `norad.jpg` | 未标注（见来源页） | Public domain | [Cheyenne Mountain - NORAD tunnels and Openings, 1970.jpg](https://commons.wikimedia.org/wiki/File:Cheyenne_Mountain_-_NORAD_tunnels_and_Openings,_1970.jpg) |
| eisenhower | 艾森豪威尔总统官方肖像 | `eisenhower.jpg` | White House | Public domain | [Dwight D. Eisenhower, official photo portrait, May 29, 1959.jpg](https://commons.wikimedia.org/wiki/File:Dwight_D._Eisenhower,_official_photo_portrait,_May_29,_1959.jpg) |
| destalinization | 1956年赫鲁晓夫官方肖像照 | `destalinization.jpg` | TASS | Public domain | [1956 Press Photo Communist Party Secretary Nikita Khrushchev in Moscow (3x4 cropped).jpg](https://commons.wikimedia.org/wiki/File:1956_Press_Photo_Communist_Party_Secretary_Nikita_Khrushchev_in_Moscow_(3x4_cropped).jpg) |
| voice_america | 1953年自由欧洲电台播音员 | `voice_america.jpg` | Radio Free Europe | Public domain | [Peck Radio Free Europe Publicity Photo 1953.jpg](https://commons.wikimedia.org/wiki/File:Peck_Radio_Free_Europe_Publicity_Photo_1953.jpg) |
| point_four | 美国第四点计划全球技术援助分布地图 | `point_four.jpg` | United States. Technical Cooperation Administration | LOC-map | [Point 4 around the world. LOC map53000864.jpg](https://commons.wikimedia.org/wiki/File:Point_4_around_the_world._LOC_map53000864.jpg) |
| italy_election | 意大利德加斯佩里内阁合影 | `italy_election.jpg` | Unknown author Unknown author | Public domain | [Governo De Gasperi II.jpg](https://commons.wikimedia.org/wiki/File:Governo_De_Gasperi_II.jpg) |
| free_elections | 1945年11月匈牙利议会选举选票 | `free_elections.jpg` | Magyar Állam | PD-HU-exempt | [Nemzetgyűlési képviselő-választás budapesti szavazólapja 1945. november 4-én.jpg](https://commons.wikimedia.org/wiki/File:Nemzetgyűlési_képviselő-választás_budapesti_szavazólapja_1945._november_4-én.jpg) |
| berlin_blockade | 柏林封锁期间空运物资的运输机（与 `berlin_airlift` 共用同一张图） | `berlin_airlift.jpg` | U.S. Air Force | Public domain | [C-47s at Tempelhof Airport Berlin 1948.jpg](https://commons.wikimedia.org/wiki/File:C-47s_at_Tempelhof_Airport_Berlin_1948.jpg) |
| tito_split | 南斯拉夫领导人铁托元帅肖像 | `tito_split.jpg` | {{unknown | PD-Slovenia | [Josip Broz Tito uniform portrait.jpg](https://commons.wikimedia.org/wiki/File:Josip_Broz_Tito_uniform_portrait.jpg) |
| japan_treaty | 吉田茂签署《旧金山和约》 | `japan_treaty.jpg` | {{unknown | PD-Japan-oldphoto | [Yoshida signs San Francisco Peace Treaty.jpg](https://commons.wikimedia.org/wiki/File:Yoshida_signs_San_Francisco_Peace_Treaty.jpg) |
| greek_civil_war | 希腊内战中的政府军部队 | `greek_civil_war.jpg` | {{anonymous | PD-North Macedonia | [Vladina edinica, Gradjanska vojna vo Grcija.jpg](https://commons.wikimedia.org/wiki/File:Vladina_edinica,_Gradjanska_vojna_vo_Grcija.jpg) |
| malayan_emergency | 马来亚紧急状态中警察向当地居民问话 | `malayan_emergency.jpg` | Photo by Bert Hardy, uploaded to wikipedia by [[:ms:Pengguna:Rizuan | PD-UKGov | [Police in Malayan Emergency.jpg](https://commons.wikimedia.org/wiki/File:Police_in_Malayan_Emergency.jpg) |
| brezhnev | 勃列日涅夫官方标准肖像 | `brezhnev.jpg` | Vladimir Musaelyan | CC0 | [Leonid Brezjnev, leider van de Sovjet-Unie, Bestanddeelnr 925-6564.jpg](https://commons.wikimedia.org/wiki/File:Leonid_Brezjnev,_leider_van_de_Sovjet-Unie,_Bestanddeelnr_925-6564.jpg) |
| prague_spring | 1968年布拉格街头的苏军坦克 | `prague_spring.jpg` | František Dostál | CC BY-SA 4.0 | [František Dostál Srpen 1968 3.jpg](https://commons.wikimedia.org/wiki/File:Franti%C5%A1ek_Dost%C3%A1l_Srpen_1968_3.jpg) |
| u2 | 莫斯科展出的U-2侦察机残骸 | `u2.jpg` | D. Chernov / Д. Чернов | CC BY-SA 3.0 | [RIAN archive 793499 Exhibition of remains of U.S. U-2 spy-in-the-sky aircraft.jpg](https://commons.wikimedia.org/wiki/File:RIAN_archive_793499_Exhibition_of_remains_of_U.S._U-2_spy-in-the-sky_aircraft.jpg) |
| congo | 刚果民族运动领袖卢蒙巴 | `congo.jpg` | unknown, Présence Congolaise | PD-Democratic Republic of the Congo + PD-1996 | [Patrice Lumumba in 1958.jpg](https://commons.wikimedia.org/wiki/File:Patrice_Lumumba_in_1958.jpg) |
| che | 切·格瓦拉经典传世肖像 | `che.jpg` | Alberto Korda, restored by Adam Cuerden | Public domain | [Che Guevara - Guerrillero Heroico by Alberto Korda.jpg](https://commons.wikimedia.org/wiki/File:Che_Guevara_-_Guerrillero_Heroico_by_Alberto_Korda.jpg) |
| angola_war | 安哥拉人民解放运动领袖内托 | `angola_war.jpg` | Rob Mieremet / Anefo | CC0 | [Agostinho Neto , president Angolese bevrijdingsbeweging MPLA, in Nederland over, Bestanddeelnr 927-8480.jpg](https://commons.wikimedia.org/wiki/File:Agostinho_Neto_,_president_Angolese_bevrijdingsbeweging_MPLA,_in_Nederland_over,_Bestanddeelnr_927-8480.jpg) |
| sandinista | 1989年马那瓜庆祝尼加拉瓜革命十周年 | `sandinista.jpg` | 未标注（见来源页） | cc-by-2.0 + flickrreview | [10th anniversary of the Nicaraguan revolution in Managua, 1989.jpg](https://commons.wikimedia.org/wiki/File:10th_anniversary_of_the_Nicaraguan_revolution_in_Managua,_1989.jpg) |
| socialist_ethiopia | 1974年埃塞俄比亚临时军事行政委员会 | `socialist_ethiopia.jpg` | {{unknown | PD-Ethiopia | [Coordinating Committee of the Armed Forces (Derg) in 1974.jpg](https://commons.wikimedia.org/wiki/File:Coordinating_Committee_of_the_Armed_Forces_(Derg)_in_1974.jpg) |
| arab_oil | 1973年石油危机加油站告示 | `arab_oil.jpg` | David Falconer | Public domain | [OUT OF GASOLINE SIGNS WERE INCREASINGLY EVIDENT IN OREGON DURING THE MONTH OF OCTOBER, 1973. STATIONS SUCH AS THIS... - NARA - 555412.jpg](https://commons.wikimedia.org/wiki/File:OUT_OF_GASOLINE_SIGNS_WERE_INCREASINGLY_EVIDENT_IN_OREGON_DURING_THE_MONTH_OF_OCTOBER,_1973._STATIONS_SUCH_AS_THIS..._-_NARA_-_555412.jpg) |
| vietnam_war | 越战中被俘的越共士兵 | `vietnam_war.jpg` | Unknown author Unknown author or not provided | Public domain | [Thuong Duc, Vietnam - A Viet Cong prisoner awaits interrogation at the A-109 Special Forces Detachment in Thuong - NARA - 531447.jpg](https://commons.wikimedia.org/wiki/File:Thuong_Duc,_Vietnam_-_A_Viet_Cong_prisoner_awaits_interrogation_at_the_A-109_Special_Forces_Detachment_in_Thuong_-_NARA_-_531447.jpg) |
| ogaden | 埃塞俄比亚民兵展示缴获武器 | `ogaden.jpg` | Unknown author Unknown author | Public domain | [Ethiopian revolutionary militiamen with weapons captured from the Somali Army during the Ogaden War, 1977.jpg](https://commons.wikimedia.org/wiki/File:Ethiopian_revolutionary_militiamen_with_weapons_captured_from_the_Somali_Army_during_the_Ogaden_War,_1977.jpg) |
| red_army | 红场阅兵中的苏军方阵 | `red_army.jpg` | Vladimir Rodionov / Владимир Родионов | CC BY-SA 3.0 | [RIAN archive 802356 Military parade on Red Square on May 9.jpg](https://commons.wikimedia.org/wiki/File:RIAN_archive_802356_Military_parade_on_Red_Square_on_May_9.jpg) |
| cuban_missile | U-2侦察机拍摄的导弹基地 | `cuban_missile.jpg` | see above | Public domain | [Cuban missiles.jpg](https://commons.wikimedia.org/wiki/File:Cuban_missiles.jpg) |
| salt1 | 尼克松与勃列日涅夫签署条约 | `salt1.jpg` | President (1969-1974 : Nixon). White House Photo Office. 1969-1974, General Services Administration. National Archives and Records Service. Office of Presidential Libraries. Office of Presidential Papers. 1/20/1969-ca. 12/1974 | Public domain | [President Richard Nixon and General Secretary Leonid Brezhnev Signing the Anti-Ballistic Missile (ABM) Treaty and Interim Strategic Arms Limitations Talks (SALT) Agreement - DPLA - e8e61af3f57b9fdb3beb10652b1fc770.jpg](https://commons.wikimedia.org/wiki/File:President_Richard_Nixon_and_General_Secretary_Leonid_Brezhnev_Signing_the_Anti-Ballistic_Missile_(ABM)_Treaty_and_Interim_Strategic_Arms_Limitations_Talks_(SALT)_Agreement_-_DPLA_-_e8e61af3f57b9fdb3beb10652b1fc770.jpg) |
| jfk | 肯尼迪总统白宫彩色肖像照 | `jfk.jpg` | Cecil W. Stoughton | Public domain | [John F. Kennedy, White House color photo portrait.jpg](https://commons.wikimedia.org/wiki/File:John_F._Kennedy,_White_House_color_photo_portrait.jpg) |
| shuttle | 基辛格国务卿官方肖像 | `shuttle.jpg` | U.S. Department of State from United States | Public domain | [Henry A. Kissinger, U.S. Secretary of State, 1973-1977.jpg](https://commons.wikimedia.org/wiki/File:Henry_A._Kissinger,_U.S._Secretary_of_State,_1973-1977.jpg) |
| human_rights | 卡特总统与中东国家领导人 | `human_rights.jpg` | Unknown author Unknown author | Public domain | [Jimmy Carter with King Hussein of Jordan the Shah of Iran and Shahbanou of Iran - NARA - 177332 04.jpg](https://commons.wikimedia.org/wiki/File:Jimmy_Carter_with_King_Hussein_of_Jordan_the_Shah_of_Iran_and_Shahbanou_of_Iran_-_NARA_-_177332_04.jpg) |
| panama | 卡特与托里霍斯签署运河条约 | `panama.jpg` | White House photo | Public domain | [Jimmy Carter and General Omar Torrijos signing the Panama Canal Treaty.jpg](https://commons.wikimedia.org/wiki/File:Jimmy_Carter_and_General_Omar_Torrijos_signing_the_Panama_Canal_Treaty.jpg) |
| green_berets | 越南战场上的美军特种兵 | `green_berets.jpg` | US Army photographer | Public domain | [US Special Forces Vietnam.jpg](https://commons.wikimedia.org/wiki/File:US_Special_Forces_Vietnam.jpg) |
| missile_gap | 阿特拉斯洲际导弹发射 | `missile_gap.jpg` | US Air Force | Public domain | [Atlas missile launch.jpg](https://commons.wikimedia.org/wiki/File:Atlas_missile_launch.jpg) |
| christian_dem | 意大利基督教民主党德加斯佩里内阁（与 `italy_election` 共用同一张图） | `italy_election.jpg` | Unknown author Unknown author | Public domain | [Governo De Gasperi II.jpg](https://commons.wikimedia.org/wiki/File:Governo_De_Gasperi_II.jpg) |
| chile_allende | 1964年圣地亚哥支持阿连德的游行队伍 | `chile_allende.jpg` | James N. Wallace | LOC-image + PD-USNWR | [Allende supporters.jpg](https://commons.wikimedia.org/wiki/File:Allende_supporters.jpg) |
| domino_theory | 1954年印度支那形势图 | `domino_theory.jpg` | 未标注（见来源页） | PD-USGov-Military-Army | [Indochina 1954.jpg](https://commons.wikimedia.org/wiki/File:Indochina_1954.jpg) |
| npt | 《不扩散核武器条约》纪念首日封 | `npt.jpg` | ArtCraft | PD-US | [First Day Cover commemorating United Nations Treaty on Non-Proliferation of Nuclear Weapons - DPLA - ebc01527560bfafb8088215494b2ae13.jpg](https://commons.wikimedia.org/wiki/File:First_Day_Cover_commemorating_United_Nations_Treaty_on_Non-Proliferation_of_Nuclear_Weapons_-_DPLA_-_ebc01527560bfafb8088215494b2ae13.jpg) |
| ostpolitik | 新东方政策 | `ostpolitik.jpg` | Engelbert Reineke | CC BY-SA 3.0 de | [Bundesarchiv B 145 Bild-F057884-0009, Willy Brandt.jpg](https://commons.wikimedia.org/wiki/File:Bundesarchiv_B_145_Bild-F057884-0009,_Willy_Brandt.jpg) |
| laos_crisis | 老挝爱国战线武装人员 | `laos_crisis.jpg` | {{unknown | PD-USGov-Military-Army | [PathetLao002.jpg](https://commons.wikimedia.org/wiki/File:PathetLao002.jpg) |
| africa_decade | 1960年非洲新独立国家国旗图 | `africa_decade.jpg` | Robert M. Chapin | PD-US-not renewed | [New flags of 1960.jpg](https://commons.wikimedia.org/wiki/File:New_flags_of_1960.jpg) |
| helsinki_accords | 福特在赫尔辛基欧安会全会上讲话 | `helsinki_accords.jpg` | President (1974-1977 : Ford). White House Photographic Office. 1974-1977 | PD-USGov | [President Ford Addressing Delegates during the Plenary Session of the Conference on Security and Cooperation in Europe (CSCE) in Finlandia Hall in Helsinki, Finland - NARA - 23898497.jpg](https://commons.wikimedia.org/wiki/File:President_Ford_Addressing_Delegates_during_the_Plenary_Session_of_the_Conference_on_Security_and_Cooperation_in_Europe_(CSCE)_in_Finlandia_Hall_in_Helsinki,_Finland_-_NARA_-_23898497.jpg) |
| india_treaty | 印度总理英迪拉·甘地肖像 | `india_treaty.jpg` | Defense Department, US government | PD-USGov | [Indira Gandhi in 1967.jpg](https://commons.wikimedia.org/wiki/File:Indira_Gandhi_in_1967.jpg) |
| iranian_rev | 1979年德黑兰大规模示威 | `iranian_rev.jpg` | Unknown author Unknown author | GFDL | [Mass demonstration in Iran, date unknown.jpg](https://commons.wikimedia.org/wiki/File:Mass_demonstration_in_Iran,_date_unknown.jpg) |
| afghan_invasion | 喀布尔公路上的苏军车队 | `afghan_invasion.jpg` | Yuriy Somov / Юрий Сомов | CC BY-SA 3.0 | [RIAN archive 644461 First stage in the Soviet troop withdrawal from Afghanistan.jpg](https://commons.wikimedia.org/wiki/File:RIAN_archive_644461_First_stage_in_the_Soviet_troop_withdrawal_from_Afghanistan.jpg) |
| solidarity_crackdown | 波兰戒严期间街头T-55坦克 | `solidarity_crackdown.jpg` | Jacek Żołnierkiewicz | Public domain | [T-55A Martial law Poland.jpg](https://commons.wikimedia.org/wiki/File:T-55A_Martial_law_Poland.jpg) |
| nicaragua_arms | 尼加拉瓜反政府武装分子 | `nicaragua_arms.jpg` | Tiomono ( talk ) | CC BY-SA 3.0 | [Contra commandas 1987.jpg](https://commons.wikimedia.org/wiki/File:Contra_commandas_1987.jpg) |
| iran_hostage | 伊朗人质危机期间的抗议 | `iran_hostage.jpg` | Marion S. Trikosko | Public domain | [Man holding sign during Iranian hostage crisis protest, 1979.jpg](https://commons.wikimedia.org/wiki/File:Man_holding_sign_during_Iranian_hostage_crisis_protest,_1979.jpg) |
| korean_air | 安理会就007航班被击落开会 | `korean_air.jpg` | Bernard Gotfryd | Public domain | [UNSC meeting on the shootdown of KAL 007 (1983).jpg](https://commons.wikimedia.org/wiki/File:UNSC_meeting_on_the_shootdown_of_KAL_007_(1983).jpg) |
| cuba_troops | 在安哥拉的古巴坦克车组 | `cuba_troops.jpg` | Unknown author Unknown author | Public domain | [Cuban PT-76 Angola.JPG](https://commons.wikimedia.org/wiki/File:Cuban_PT-76_Angola.JPG) |
| euro_missiles | 西德海尔布隆部署的潘兴II导弹储运箱 | `euro_missiles.jpg` | {{unknown | PD-USGov-Military-Army | [Pershing II storage container Heilbronn Waldheide.jpg](https://commons.wikimedia.org/wiki/File:Pershing_II_storage_container_Heilbronn_Waldheide.jpg) |
| nuclear_freeze | 核冻结运动 | `nuclear_freeze.jpg` | https://wellcomeimages.org/indexplus/obf_images/cf/6f/91279e4fdafa505007b4483811cb.jpg Gallery: https://wellcomeimages.org/indexplus/image/L0075336.html | CC BY 4.0 | [Photograph of MCANW Signing Freeze Wellcome L0075336.jpg](https://commons.wikimedia.org/wiki/File:Photograph_of_MCANW_Signing_Freeze_Wellcome_L0075336.jpg) |
| red_army_late | 西方-81演习中的苏联官兵 | `red_army_late.jpg` | Betsy Joyce Bree, Analyst, Soviet/Warsaw Pact Division, Directorate for Research, Defense Intelligence Agency | Public domain | [Советский генералитет среди бойцов-десантников на учениях «Запад-81».jpg](https://commons.wikimedia.org/wiki/File:%D0%A1%D0%BE%D0%B2%D0%B5%D1%82%D1%81%D0%BA%D0%B8%D0%B9_%D0%B3%D0%B5%D0%BD%D0%B5%D1%80%D0%B0%D0%BB%D0%B8%D1%82%D0%B5%D1%82_%D1%81%D1%80%D0%B5%D0%B4%D0%B8_%D0%B1%D0%BE%D0%B9%D1%86%D0%BE%D0%B2-%D0%B4%D0%B5%D1%81%D0%B0%D0%BD%D1%82%D0%BD%D0%B8%D0%BA%D0%BE%D0%B2_%D0%BD%D0%B0_%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D1%8F%D1%85_%C2%AB%D0%97%D0%B0%D0%BF%D0%B0%D0%B4-81%C2%BB.jpg) |
| star_wars | 里根发表星球大战计划演说 | `star_wars.jpg` | President (1981-1989 : Reagan). White House Photographic Office. 1981-1989 | Public domain | [President Giving Speech on Sdi Strategic Defense Initiative at Martin Marrietta Astronautics in Waterton, Colorado - DPLA - a28b62ef8465466a0e95eb810ba68336.jpg](https://commons.wikimedia.org/wiki/File:President_Giving_Speech_on_Sdi_Strategic_Defense_Initiative_at_Martin_Marrietta_Astronautics_in_Waterton,_Colorado_-_DPLA_-_a28b62ef8465466a0e95eb810ba68336.jpg) |
| solidarity | 1980年格但斯克船厂罢工 | `solidarity.jpg` | Giedymin Jabłoński | CC BY-SA 3.0 pl | [Strajk sierpniowy w Stoczni Gdańskiej im. Lenina 22.jpg](https://commons.wikimedia.org/wiki/File:Strajk_sierpniowy_w_Stoczni_Gda%C5%84skiej_im._Lenina_22.jpg) |
| evil_empire | 里根1983年发表邪恶帝国演说 | `evil_empire.jpg` | President (1981-1989 : Reagan). White House Photographic Office. 1981-1989 | Public domain | [President Ronald Reagan Addresses The Annual Convention of The National Association of Evangelicals ("Evil Empire" Speech) in Orlando Florida - DPLA - 8c7ba83d6c2f5bd9e436cd8449d791f9.jpg](https://commons.wikimedia.org/wiki/File:President_Ronald_Reagan_Addresses_The_Annual_Convention_of_The_National_Association_of_Evangelicals_(%22Evil_Empire%22_Speech)_in_Orlando_Florida_-_DPLA_-_8c7ba83d6c2f5bd9e436cd8449d791f9.jpg) |
| chernobyl | 切尔诺贝利核电站厂区 | `chernobyl.jpg` | IAEA Imagebank | CC BY-SA 2.0 | [IAEA 02790015 (5613115146).jpg](https://commons.wikimedia.org/wiki/File:IAEA_02790015_(5613115146).jpg) |
| afghan_sting | 阿富汗圣战者与美方人员 | `afghan_sting.jpg` | T.Sgt. Bob Simons | Public domain | [AfghanGuerillainUS1986e.JPEG](https://commons.wikimedia.org/wiki/File:AfghanGuerillainUS1986e.JPEG) |
| berlin_fall | 勃兰登堡门旁拆除柏林墙 | `berlin_fall.jpg` | SSGT F. Lee Corkran | Public domain | [Crane removed part of Wall Brandenburg Gate.jpg](https://commons.wikimedia.org/wiki/File:Crane_removed_part_of_Wall_Brandenburg_Gate.jpg) |
| gorbachev | 里根与戈尔巴乔夫签署条约 | `gorbachev.jpg` | White House Photographic Office | Public domain | [Reagan and Gorbachev signing.jpg](https://commons.wikimedia.org/wiki/File:Reagan_and_Gorbachev_signing.jpg) |
| pershing | 潘兴II导弹发射车 | `pershing.jpg` | {{unknown | PD-USGov-Military-Army | [Pershing II on EL.jpg](https://commons.wikimedia.org/wiki/File:Pershing_II_on_EL.jpg) |
| nato_expansion | 北约东扩 | `nato_expansion.jpg` | Senior Master Sgt. Adrian Cadiz | Public domain | [160211-D-DT527-007 NATO country flags wave at the entrance of NATO headquarters in Brussels 2016.JPG](https://commons.wikimedia.org/wiki/File:160211-D-DT527-007_NATO_country_flags_wave_at_the_entrance_of_NATO_headquarters_in_Brussels_2016.JPG) |
| counterinsurgency | 萨尔瓦多士兵进行直升机演习 | `counterinsurgency.jpg` | SSGT Lemuel Casillas | Public domain | [Salvadoran troops exit from a US Army CH-47 Chinook helicopter while practicing helicopter assault tactics with members of the 7th Special Forces during Exercise GRANADERO I DF-ST-85-13156.jpg](https://commons.wikimedia.org/wiki/File:Salvadoran_troops_exit_from_a_US_Army_CH-47_Chinook_helicopter_while_practicing_helicopter_assault_tactics_with_members_of_the_7th_Special_Forces_during_Exercise_GRANADERO_I_DF-ST-85-13156.jpg) |
| iran_contra | 里根就伊朗门事件召开记者会 | `iran_contra.jpg` | President (1981-1989 : Reagan). White House Photographic Office. (1981 - 1989) | PD-USGov | [Photograph of President Reagan motioning to Ed Meese during a White House Press Briefing on Iran-Contra - NARA - 198579.jpg](https://commons.wikimedia.org/wiki/File:Photograph_of_President_Reagan_motioning_to_Ed_Meese_during_a_White_House_Press_Briefing_on_Iran-Contra_-_NARA_-_198579.jpg) |
| able_archer | 北约「优秀射手83」演习总结报告封面 | `able_archer.jpg` | US Air Force | PD-USGov-Military-Air Force | [Able Archer 83 After Action Report.jpg](https://commons.wikimedia.org/wiki/File:Able_Archer_83_After_Action_Report.jpg) |
| korean_olympics | 1988年汉城奥运会火炬点燃仪式 | `korean_olympics.jpg` | Ken Hackman, U.S. Air Force | PD-USGov-Military-Air Force | [Seoul Olympic torch.jpg](https://commons.wikimedia.org/wiki/File:Seoul_Olympic_torch.jpg) |
| malta_summit | 马耳他会晤期间美军直升机（1989年12月） | `malta_summit.jpg` | JO1 Kip Burke, USN | PD-USGov-Military | [HMX-1 crew with VH-3D on USS Belknap (CG-26) at Malta 1989.JPEG](https://commons.wikimedia.org/wiki/File:HMX-1_crew_with_VH-3D_on_USS_Belknap_(CG-26)_at_Malta_1989.JPEG) |
| eastern_revolution | 1989年布拉格天鹅绒革命学生集会 | `eastern_revolution.jpg` | anonymous (signed "universities students") | PD-scan + PD-1996 | [Call of Czechoslovak students for support during 1989 velvet revolution.jpg](https://commons.wikimedia.org/wiki/File:Call_of_Czechoslovak_students_for_support_during_1989_velvet_revolution.jpg) |
| glasnost | 公开性与新思维 | `glasnost.jpg` | Presidential Press and Information Office | CC BY 4.0 | [Vladimir Putin with Mikhail Gorbachev-1.jpg](https://commons.wikimedia.org/wiki/File:Vladimir_Putin_with_Mikhail_Gorbachev-1.jpg) |
| ss20_deployment | 苏联SS-20中程导弹发射车 | `ss20_deployment.jpg` | {{unknown | PD-USGov-Military | [SS-20 TEL.JPEG](https://commons.wikimedia.org/wiki/File:SS-20_TEL.JPEG) |
| vietnam_unification | 胡志明市统一宫（原南越总统府） | `vietnam_unification.jpg` | [https://www.flickr.com/people/101561334@N08 Gary Todd] from Xinzheng, China | Location dec + cc-zero | [Independence Palace (9982397535).jpg](https://commons.wikimedia.org/wiki/File:Independence_Palace_(9982397535).jpg) |
| angola_offensive | 在安哥拉作战的古巴装甲部队（与 `cuba_troops` 共用同一张图） | `cuba_troops.jpg` | Unknown author Unknown author | Public domain | [Cuban PT-76 Angola.JPG](https://commons.wikimedia.org/wiki/File:Cuban_PT-76_Angola.JPG) |
| sino_soviet_treaty | 1950年中苏友好同盟互助条约签订 | `sino_soviet_treaty.jpg` | 未标注（见来源页） | Public domain | [Ji8, 3-2, Sino-Soviet Friendship, 1950.jpg](https://commons.wikimedia.org/wiki/File%3AJi8%2C_3-2%2C_Sino-Soviet_Friendship%2C_1950.jpg) |
| chinese_korea | 1950年抗美援朝保家卫国 | `chinese_korea.jpg` | Unknown author | Public domain | [ChineseKoreanWarPoster.jpg](https://commons.wikimedia.org/wiki/File%3AChineseKoreanWarPoster.jpg) |
| taiwan_strait | 台海危机中被鱼雷击伤的登陆舰 | `taiwan_strait.jpg` | Anonymous Unknown author | Public domain | [Chung Hai (LST-201) damaged by torpedo during the Second Taiwan Strait Crisis.jpg](https://commons.wikimedia.org/wiki/File:Chung_Hai_(LST-201)_damaged_by_torpedo_during_the_Second_Taiwan_Strait_Crisis.jpg) |
| sino_soviet_split | 1969年中苏边境武装冲突 | `sino_soviet_split.jpg` | Marchrius | Public domain | [Captured T-62 tank.jpg](https://commons.wikimedia.org/wiki/File%3ACaptured_T-62_tank.jpg) |
| chinese_atomic | 1964年中国首次原子弹爆炸成功 | `chinese_atomic.jpg` | Unknown author | Public domain | [Zhou Enlai announced the success of China's atomic bomb test.jpg](https://commons.wikimedia.org/wiki/File%3AZhou_Enlai_announced_the_success_of_China's_atomic_bomb_test.jpg) |
| pingpong | 尼克松在北京观看体育表演 | `pingpong.jpg` | Unknown author Unknown author or not provided | Public domain | [Nixon at an athletic exhibition in Peking - NARA - 194757.jpg](https://commons.wikimedia.org/wiki/File:Nixon_at_an_athletic_exhibition_in_Peking_-_NARA_-_194757.jpg) |
| un_seat_prc | 1971年中国恢复联合国合法席位 | `un_seat_prc.jpg` | United Nations General Assembly (Q47423) | Public domain | [UN2758 zh.JPG](https://commons.wikimedia.org/wiki/File%3AUN2758_zh.JPG) |
| nixon_china | 1972年尼克松访华与周恩来会谈 | `nixon_china.jpg` | Ollie Atkins, White House Photographer | Public domain | [Nixons exit AFO in China 1972.jpg](https://commons.wikimedia.org/wiki/File%3ANixons_exit_AFO_in_China_1972.jpg) |
| china_recognition | 中美建交 | `china_recognition.jpg` | Unknown author Unknown author or not provided | Public domain | [Deng Xiaoping and Jimmy Carter at the arrival ceremony for the Vice Premier of China. - NARA - 183157-restored.jpg](https://commons.wikimedia.org/wiki/File:Deng_Xiaoping_and_Jimmy_Carter_at_the_arrival_ceremony_for_the_Vice_Premier_of_China._-_NARA_-_183157-restored.jpg) |
| soviet_aid_loans | 1950年中苏友好同盟互助条约签订（与 `sino_soviet_treaty` 共用同一张图） | `sino_soviet_treaty.jpg` | 未标注（见来源页） | Public domain | [Ji8, 3-2, Sino-Soviet Friendship, 1950.jpg](https://commons.wikimedia.org/wiki/File%3AJi8%2C_3-2%2C_Sino-Soviet_Friendship%2C_1950.jpg) |
| china_bloc_support | 社会主义阵营声援 | `china_bloc_support.jpg` | Korean People Journal | Public domain | [Demonstration in support of the Moscow Conference of Foreign Ministers.JPG](https://commons.wikimedia.org/wiki/File:Demonstration_in_support_of_the_Moscow_Conference_of_Foreign_Ministers.JPG) |
| sino_soviet_reconciliation | 中苏边界谈判 | `sino_soviet_reconciliation.jpg` | [United States. Central Intelligence Agency] | Public domain | [China-U.S.S.R. border, eastern sector. LOC 80691575.jpg](https://commons.wikimedia.org/wiki/File:China-U.S.S.R._border,_eastern_sector._LOC_80691575.jpg) |
| soviet_advisors | 苏联军事顾问团 | `soviet_advisors.jpg` | North Korean media | Public domain | [Soviet military advisers attending North Korean mass event.jpg](https://commons.wikimedia.org/wiki/File:Soviet_military_advisers_attending_North_Korean_mass_event.jpg) |
| socialist_camp_economy | 社会主义阵营经济互助 | `socialist_camp_economy.jpg` | fototeca.iiccr.ro | Attribution | [XXXII-a sedinte a sesiunii Consiliului de Ajutor Economic Reciproc.jpg](https://commons.wikimedia.org/wiki/File:XXXII-a_sedinte_a_sesiunii_Consiliului_de_Ajutor_Economic_Reciproc.jpg) |
| soviet_tech_transfer | 中苏科技协定 | `soviet_tech_transfer.jpg` | wanghongliu | CC BY-SA 3.0 | [毛主席亲笔题写 Mao Zedong's Handwriting-The First Automobile Manufactory - panoramio.jpg](https://commons.wikimedia.org/wiki/File:毛主席亲笔题写_Mao_Zedong's_Handwriting-The_First_Automobile_Manufactory_-_panoramio.jpg) |
| prc_founding | 1949年毛泽东在天安门宣告新中国成立 | `prc_founding.jpg` | {{unknown | PD-China | [Mao proclaiming establishment of PRC.jpg](https://commons.wikimedia.org/wiki/File:Mao_proclaiming_establishment_of_PRC.jpg) |
| five_principles | 和平共处五项原则 | `five_principles.jpg` | d/k | Public domain | [Zhou Enlai at Geneva Conference, 1954.jpg](https://commons.wikimedia.org/wiki/File:Zhou_Enlai_at_Geneva_Conference,_1954.jpg) |
| bandung | 万隆会议 | `bandung.jpg` | Unknown author Unknown author | Public domain | [Asian–African Conference at Bandung April 1955.jpg](https://commons.wikimedia.org/wiki/File:Asian–African_Conference_at_Bandung_April_1955.jpg) |
| korean_volunteers | 抗美援朝运动宣传画（与 `chinese_korea` 共用同一张图） | `chinese_korea.jpg` | Unknown author | Public domain | [ChineseKoreanWarPoster.jpg](https://commons.wikimedia.org/wiki/File%3AChineseKoreanWarPoster.jpg) |
| soviet_aid_156 | 苏联援华工程 | `soviet_aid_156.jpg` | Amarespeco | CC BY-SA 4.0 | [The Ministry of Machinery allocated verieties of machines to support the Campaign. On Display is a part produced by Changchun First Automobile Factory.jpg](https://commons.wikimedia.org/wiki/File:The_Ministry_of_Machinery_allocated_verieties_of_machines_to_support_the_Campaign._On_Display_is_a_part_produced_by_Changchun_First_Automobile_Factory.jpg) |
| agrarian_reform | 土地改革 | `agrarian_reform.jpg` | Unknown author Unknown author or not provided | Public domain | [Real Story of Red China Land Reform - NARA - 5730064.jpg](https://commons.wikimedia.org/wiki/File:Real_Story_of_Red_China_Land_Reform_-_NARA_-_5730064.jpg) |
| overseas_chinese | 海外华侨网络 | `overseas_chinese.jpg` | Daniel Schwen | CC BY-SA 4.0 | [SF Chinatown street sign Clay.jpg](https://commons.wikimedia.org/wiki/File:SF_Chinatown_street_sign_Clay.jpg) |
| sino_burmese_treaty | 中缅边界条约 | `sino_burmese_treaty.jpg` | China Government | Public domain | [1960年10月2日中缅边界条约签订大会周恩来与奈温.jpg](https://commons.wikimedia.org/wiki/File:1960年10月2日中缅边界条约签订大会周恩来与奈温.jpg) |
| geneva_1954 | 1954年讨论印度支那问题的日内瓦会议 | `geneva_1954.jpg` | US Army Photograph | PD-USGov | [1954 Geneva Conference.jpg](https://commons.wikimedia.org/wiki/File:1954_Geneva_Conference.jpg) |
| two_bombs | 周恩来宣布首次核试验成功（与 `chinese_atomic` 共用同一张图） | `chinese_atomic.jpg` | Unknown author | Public domain | [Zhou Enlai announced the success of China's atomic bomb test.jpg](https://commons.wikimedia.org/wiki/File%3AZhou_Enlai_announced_the_success_of_China's_atomic_bomb_test.jpg) |
| dongfanghong | 东方红一号 | `dongfanghong.jpg` | Morio | CC BY-SA 4.0 | [Dongfanghong (replica) front-right 2016 Beijing Auto Museum.jpg](https://commons.wikimedia.org/wiki/File:Dongfanghong_(replica)_front-right_2016_Beijing_Auto_Museum.jpg) |
| zhenbao_island | 珍宝岛冲突中缴获的苏制T-62坦克（与 `sino_soviet_split` 共用同一张图） | `sino_soviet_split.jpg` | Marchrius | Public domain | [Captured T-62 tank.jpg](https://commons.wikimedia.org/wiki/File%3ACaptured_T-62_tank.jpg) |
| three_worlds | 三个世界理论 | `three_worlds.jpg` | Gary Todd from Xinzheng, China | CC0 | [Forbidden City Chairman Mao Zedong Portrait (9854527836).jpg](https://commons.wikimedia.org/wiki/File:Forbidden_City_Chairman_Mao_Zedong_Portrait_(9854527836).jpg) |
| sino_us_detente | 1972年尼克松访华与周恩来会谈（与 `nixon_china` 共用同一张图） | `nixon_china.jpg` | Ollie Atkins, White House Photographer | Public domain | [Nixons exit AFO in China 1972.jpg](https://commons.wikimedia.org/wiki/File%3ANixons_exit_AFO_in_China_1972.jpg) |
| un_seat_cn | 1971年中国恢复联合国合法席位（与 `un_seat_prc` 共用同一张图） | `un_seat_prc.jpg` | United Nations General Assembly (Q47423) | Public domain | [UN2758 zh.JPG](https://commons.wikimedia.org/wiki/File%3AUN2758_zh.JPG) |
| tazara_railway | 援建坦赞铁路 | `tazara_railway.jpg` | J.W.H. van der Waal | CC BY 2.5 | [Tazara GE U30C Mlimba.JPG](https://commons.wikimedia.org/wiki/File:Tazara_GE_U30C_Mlimba.JPG) |
| sino_indian_war | 中印边境战争 | `sino_indian_war.jpg` | Unknown author Unknown author | Public domain | [Sino-indian-war-in-1962-surrender.jpg](https://commons.wikimedia.org/wiki/File:Sino-indian-war-in-1962-surrender.jpg) |
| vietnam_aid | 援越抗美 | `vietnam_aid.jpg` | Unknown author Unknown author | Public domain | [Ho Chi Minh at Lijang River (China) in 1961.jpg](https://commons.wikimedia.org/wiki/File:Ho_Chi_Minh_at_Lijang_River_(China)_in_1961.jpg) |
| afro_asian_solidarity | 亚非团结组织 | `afro_asian_solidarity.jpg` | Unknown author Unknown author | Public domain | [Jawaharlal Nehru, Nasser and Tito at the Conference of Non-Aligned Nations held in Belgrade.jpg](https://commons.wikimedia.org/wiki/File:Jawaharlal_Nehru,_Nasser_and_Tito_at_the_Conference_of_Non-Aligned_Nations_held_in_Belgrade.jpg) |
| china_space_tracking | 中国卫星测控网 | `china_space_tracking.jpg` | Gadfium | Public domain | [YuanWang2c.JPG](https://commons.wikimedia.org/wiki/File:YuanWang2c.JPG) |
| chinese_doctors | 援非医疗队 | `chinese_doctors.jpg` | Press Information Department | Public domain | [Chinese Medical Team Arriving Dhaka Plane Crash Victims Treatment 2025-07-25 (PID-0000756).jpg](https://commons.wikimedia.org/wiki/File:Chinese_Medical_Team_Arriving_Dhaka_Plane_Crash_Victims_Treatment_2025-07-25_(PID-0000756).jpg) |
| world_revolution | 世界革命输出 | `world_revolution.jpg` | 周道悟 [ 1 ] | Public domain | [Mao-era Propaganda Poster Featuring Chinese Typist.jpg](https://commons.wikimedia.org/wiki/File:Mao-era_Propaganda_Poster_Featuring_Chinese_Typist.jpg) |
| reform_opening | 改革开放 | `reform_opening.jpg` | Unknown or not provided | Public domain | [Deng Xiaoping (cropped).jpg](https://commons.wikimedia.org/wiki/File:Deng_Xiaoping_(cropped).jpg) |
| sino_us_established | 中美正式建交 | `sino_us_established.jpg` | Acroterion | CC BY-SA 4.0 | [SAM 26000 Deng Xiaoping visit to Atlanta 1979-1.jpg](https://commons.wikimedia.org/wiki/File:SAM_26000_Deng_Xiaoping_visit_to_Atlanta_1979-1.jpg) |
| sino_vietnam_war | 对越自卫反击战 | `sino_vietnam_war.jpg` | Adam Jones from Kelowna, BC, Canada | CC BY-SA 2.0 | [Facade with Damage from 1979 Sino-Vietnamese War - Lang Son - Vietnam (48142922346).jpg](https://commons.wikimedia.org/wiki/File:Facade_with_Damage_from_1979_Sino-Vietnamese_War_-_Lang_Son_-_Vietnam_(48142922346).jpg) |
| hk_joint_declaration | 中英联合声明 | `hk_joint_declaration.jpg` | Agência Senado Jan Bockaert NASA Bhopal Medical Appeal U.S. Air Force Nick Tomoaki INABA Marcin Wichary | CC BY-SA 4.0 | [1984 Events Collage.jpg](https://commons.wikimedia.org/wiki/File:1984_Events_Collage.jpg) |
| sino_soviet_normalization | 中苏关系正常化 | `sino_soviet_normalization.jpg` | Yuryi Abramochkin / Юрий Абрамочкин | CC BY-SA 3.0 | [RIAN archive 828797 Mikhail Gorbachev addressing UN General Assembly session.jpg](https://commons.wikimedia.org/wiki/File:RIAN_archive_828797_Mikhail_Gorbachev_addressing_UN_General_Assembly_session.jpg) |
| third_world_leader | 第三世界领袖 | `third_world_leader.jpg` | Chen Zhengqing (1917–1966) | Public domain | [Mao Zedong 1950 Portrait (3x4 cropped).jpg](https://commons.wikimedia.org/wiki/File:Mao_Zedong_1950_Portrait_(3x4_cropped).jpg) |
| special_economic_zones | 经济特区 | `special_economic_zones.jpg` | Charlie fong | CC BY-SA 4.0 | [Skyline of Shekou, Shenzhen.jpg](https://commons.wikimedia.org/wiki/File:Skyline_of_Shekou,_Shenzhen.jpg) |
| special_zone_boom | 特区经济腾飞 | `special_zone_boom.jpg` | Yida Xu | CC BY 2.0 | [Shenzhen Futian CBD (7) (14547302285).jpg](https://commons.wikimedia.org/wiki/File:Shenzhen_Futian_CBD_(7)_(14547302285).jpg) |
| one_country_two_systems | 一国两制构想 | `one_country_two_systems.jpg` | Ion Tichy | CC BY-SA 4.0 | [Tsim Sha Tsui 1980.JPG](https://commons.wikimedia.org/wiki/File:Tsim_Sha_Tsui_1980.JPG) |
| sino_japanese_treaty | 中日和平友好条约 | `sino_japanese_treaty.jpg` | 外務省 | CC BY 4.0 | [Treaty of Peace and Friendship between Japan and China.jpg](https://commons.wikimedia.org/wiki/File:Treaty_of_Peace_and_Friendship_between_Japan_and_China.jpg) |
| sino_indonesia_resume | 中国印尼复交 | `sino_indonesia_resume.jpg` | Set-Neg RI | Public domain | [President Suharto portrait 1988.jpg](https://commons.wikimedia.org/wiki/File:President_Suharto_portrait_1988.jpg) |
| cross_strait_exchange | 两岸探亲开放 | `cross_strait_exchange.jpg` | Tsungyenlee | CC BY-SA 3.0 | [Cross-strait daily charter route map.jpg](https://commons.wikimedia.org/wiki/File:Cross-strait_daily_charter_route_map.jpg) |
| multipolar_diplomacy | 多极化外交 | `multipolar_diplomacy.jpg` | White House photo by Eric Draper | Public domain | [Jiang Zemin Shanghai2001.jpg](https://commons.wikimedia.org/wiki/File:Jiang_Zemin_Shanghai2001.jpg) |

## 地区图片

| 地区 | 中文说明 | 文件 | 作者 | 许可证 | Commons 页面链接 |
| --- | --- | --- | --- | --- | --- |
| region_europe | 1945年德国分区占领地图 | `region_europe.jpg` | Fernando Martínez Ruedak eta Mikel Aizpuru Muruak egina, http://luisvia.org/?p=380 webgunetik abiatuz. | CC BY-SA 4.0 | [1945 Alemaniaren lehen banaketa II. Mundu Gerra amaitu ondoren.jpg](https://commons.wikimedia.org/wiki/File:1945_Alemaniaren_lehen_banaketa_II._Mundu_Gerra_amaitu_ondoren.jpg) |
| region_asia | 1950年亚洲边缘地带地图 | `region_asia.jpg` | Chapin, Robert M. | Public domain | [Asian rimland, 1950.jpg](https://commons.wikimedia.org/wiki/File:Asian_rimland,_1950.jpg) |
| region_mideast | 1958年美军在黎巴嫩登陆 | `region_mideast.jpg` | Department of Defense | Public domain | [LCVPs at Operation Blue Bat, July 1958.jpg](https://commons.wikimedia.org/wiki/File:LCVPs_at_Operation_Blue_Bat,_July_1958.jpg) |
| region_africa | 肯尼迪会见加纳总统恩克鲁玛 | `region_africa.jpg` | Abbie Rowe | Public domain | [President John F. Kennedy Meets with the President of the Republic of Ghana, Osagyefo Dr. Kwame Nkrumah (JFKWHP-AR6409-A).jpg](https://commons.wikimedia.org/wiki/File:President_John_F._Kennedy_Meets_with_the_President_of_the_Republic_of_Ghana,_Osagyefo_Dr._Kwame_Nkrumah_(JFKWHP-AR6409-A).jpg) |
| region_centam | 中美洲区域 | `region_centam.jpg` | Robert L. Lawson | Public domain | [A4D-2 Skyhawks of VA-34 in flight over USS Essex (CVS-9) during the Bay of Pigs Invasion in April 1961.jpg](https://commons.wikimedia.org/wiki/File:A4D-2_Skyhawks_of_VA-34_in_flight_over_USS_Essex_(CVS-9)_during_the_Bay_of_Pigs_Invasion_in_April_1961.jpg) |
| region_southam | 1973年智利军人执政委员会 | `region_southam.jpg` | Unknown author Unknown author | CC BY 3.0 cl | [BNC-Junta Militar Chile 1973.jpg](https://commons.wikimedia.org/wiki/File:BNC-Junta_Militar_Chile_1973.jpg) |

## 许可分布

- Public domain：79 张
- CC BY-SA 4.0：9 张
- CC BY-SA 3.0：9 张
- CC BY 4.0：4 张
- PD-USGov-Military-Army：4 张
- PD-USGov：4 张
- CC0：3 张
- CC BY-SA 2.0：2 张
- PD-USGov-Military-Air Force：2 张
- PD-USGov-Military：2 张
- GFDL：1 张
- CC BY-SA 3.0 pl：1 张
- LOC-map：1 张
- PD-HU-exempt：1 张
- PD-Slovenia：1 张
- PD-Japan-oldphoto：1 张
- PD-North Macedonia：1 张
- PD-UKGov：1 张
- PD-Democratic Republic of the Congo + PD-1996：1 张
- cc-by-2.0 + flickrreview：1 张
- PD-Ethiopia：1 张
- LOC-image + PD-USNWR：1 张
- PD-US：1 张
- PD-US-not renewed：1 张
- PD-scan + PD-1996：1 张
- Location dec + cc-zero：1 张
- PD-China：1 张
- CC BY-SA 3.0 de：1 张
- Attribution：1 张
- CC BY 2.5：1 张
- CC BY 2.0：1 张

## 这批图是怎么来的（可复现）

2026-09 之前只有 64 张卡有图，其余 75 张（其中大量是中国牌）是这一轮补齐的：

1. **先把磁盘上已有的、没登记的 28 张登记进清单**，并复用同主题的 9 张 ——
   这一步完全离线，用的是上一轮遗留的取证数据 `choices.json`（取图方案 + 中文说明）
   与 `audit.json`（许可模板、文件描述 wikitext）：
   ```
   node tools/photos/register_offline.mjs
   ```
2. **其余卡牌按关键词在 Commons 检索并下载**：
   ```
   node tools/photos/cw_fetch_photos.mjs            # 处理全部缺图卡牌
   node tools/photos/cw_fetch_photos.mjs --list="NATO headquarters"   # 只列候选，人工挑图
   node tools/photos/cw_fetch_photos.mjs --only=bandung --force       # 重抓某几张
   ```
   查询词在 `_map.json`（按卡牌主题人工写过一遍）与 `spec_*.json`（上一轮留下的关键词表）；
   人工复核后要改的写在 `_fix.json`，其 `exact` 字段可以直接指定 Commons 文件标题。
3. **配图跑题的人工复核过一轮**：把明显错配的换掉，例如
   `china_space_tracking` 原先匹配到澳大利亚的跟踪站（改为中国"远望"号测量船）、
   `sino_japanese_treaty` 原先匹配到中美照片（改为中日和平友好条约签署照）、
   `world_revolution` 原先落到一张 Che Guevara T 恤照（改为毛泽东时代宣传画）、
   `vietnam_aid` 改为 1961 年胡志明在中国、`afro_asian_solidarity` 改为
   贝尔格莱德不结盟会议上的尼赫鲁/纳赛尔/铁托、`sino_indonesia_resume` 改为苏哈托肖像、
   `sino_burmese_treaty` 改为 1960 年中缅边界条约签订大会、
   `sino_soviet_reconciliation` 改为中苏边界东段地图。
   ```
   node tools/photos/_review.mjs      # 列出「卡名 ↔ 图片标题」便于人工扫一遍
   ```

> 踩过的坑：`upload.wikimedia.org` 与 api 一样会限流（HTTP 429 + text/html 错误页）。
> 早期版本的下载步骤没有重试，于是"下载失败"被静默地退回次优检索结果，表现为配图跑题；
> 现在 `cw_fetch_photos.mjs` 对 429/5xx/非 JPEG 响应都有指数退避重试，并限速 1.4 s/请求。

## 校验

```
node test/photocheck.js
```

当前结果：**139 张卡牌全部有图，缺图 0，退出码 0**。
