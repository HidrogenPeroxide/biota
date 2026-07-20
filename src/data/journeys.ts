/**
 * The 2026 Sanjiangyuan field expedition — real itinerary.
 * Xining → Yushu → Zaduo → Yangtze Source → Angsai → Zhaqing.
 *
 * Diary text is bilingual placeholder; replace with real field notes.
 * Cover photos and species are fetched live from iNaturalist by location.
 */

export interface Bilingual {
  zh: string
  en: string
}

export interface Journey {
  slug: string
  day: number
  location: Bilingual
  region: Bilingual
  coords: [number, number]
  date: Bilingual
  intro: Bilingual
  diary: Bilingual[]
  moments: Bilingual[]
  weather: { tempC: number; condition: Bilingual }
  elevation?: number
  spotlight?: boolean
}

export const JOURNEYS: Journey[] = [
  {
    slug: 'day-1-xining',
    day: 1,
    location: { zh: '西宁', en: 'Xining' },
    region: { zh: '青海 · 集结', en: 'Qinghai · Assembly' },
    coords: [36.617, 101.778],
    date: { zh: '7.31 – 8.1', en: 'Jul 31 – Aug 1' },
    intro: {
      zh: '在海拔两千余米的高原门户集结。装备、路线、向导，最后一次确认。',
      en: 'Gathering at the plateau gateway, 2,200 m up. Kit, route, guides — one last check.',
    },
    diary: [
      {
        zh: '西宁的清晨带着高原特有的干爽。我们在旅馆大厅摊开地图，从西宁到玉树，再到杂多、昂赛，每一段路都用红笔标注。窗外是湟水河谷，远处山脊在薄雾中若隐若现。',
        en: 'Xining mornings carry the dry crispness of the plateau. We spread the map across the hotel lobby — Xining to Yushu, then Zaduo, Angsai, every leg marked in red. Outside, the Huangshui River valley, distant ridges half-hidden in mist.',
      },
      {
        zh: '向导老扎西来了，带着一壶酥油茶。他说今年的草比去年好，但雨水也来得更早。我们聊到深夜，关于三江源的冰川、雪豹、和那些只有当地人才知道的小路。',
        en: 'Guide Tashi arrived with a thermos of butter tea. The grass is better this year, he said, but the rains came early too. We talked late into the night — about Sanjiangyuan\'s glaciers, snow leopards, and the trails only locals know.',
      },
    ],
    moments: [
      { zh: '最后一碗牦牛肉面', en: 'One last bowl of yak noodle soup' },
      { zh: '向导指着地图上的一条虚线说"这里没有路"', en: 'Guide pointing at a dashed line on the map: "No road here"' },
    ],
    weather: { tempC: 22, condition: { zh: '晴', en: 'Clear' } },
    elevation: 2261,
  },
  {
    slug: 'day-2-yushu',
    day: 2,
    location: { zh: '玉树', en: 'Yushu' },
    region: { zh: '青南高原 · 结古', en: 'Southern Qinghai · Jiegu' },
    coords: [33.004, 97.007],
    date: { zh: '8.2', en: 'Aug 2' },
    intro: {
      zh: '翻越巴颜喀拉山口，抵达玉树。三江源的大门在此打开。',
      en: 'Crossing Bayan Har Pass, we reach Yushu. The gateway to Sanjiangyuan opens here.',
    },
    diary: [
      {
        zh: '巴颜喀拉山口海拔四千八百米，是黄河与长江的分水岭。车停在垭口，所有人都下来了。风很大，经幡猎猎作响。脚下的一侧水流向黄河，另一侧汇入长江。',
        en: 'Bayan Har Pass, 4,800 m — the watershed between the Yellow and the Yangtze. We pulled over. The wind was fierce, prayer flags snapping. Water on one side flows to the Yellow River; on the other, to the Yangtze.',
      },
      {
        zh: '玉树结古镇比想象中热闹。2010 年的地震早已过去，新城拔地而起。但通天河畔的老经筒还在转，虔诚的人们绕着它走了一圈又一圈。',
        en: 'Yushu\'s Jiegu town was busier than expected. The 2010 earthquake long past, a new city has risen. But the old prayer wheels by the Tongtian River still turn — the faithful circling, again and again.',
      },
    ],
    moments: [
      { zh: '巴颜喀拉垭口的风', en: 'The wind at Bayan Har Pass' },
      { zh: '通天河畔转动经筒的老人', en: 'An elder turning prayer wheels by the Tongtian River' },
    ],
    weather: { tempC: 14, condition: { zh: '多云·风大', en: 'Cloudy · strong wind' } },
    elevation: 3700,
  },
  {
    slug: 'day-3-zaduo',
    day: 3,
    location: { zh: '杂多', en: 'Zaduo' },
    region: { zh: '澜沧江源 · 扎那', en: 'Mekong Source · Zana' },
    coords: [32.896, 95.301],
    date: { zh: '8.3', en: 'Aug 3' },
    intro: {
      zh: '抵达杂多——澜沧江的源头。这里是我们接下来几天的大本营。',
      en: 'Reaching Zaduo — the source of the Mekong. Our base camp for the days ahead.',
    },
    diary: [
      {
        zh: '杂多县城不大，嵌在澜沧江上游的峡谷里。这条江从这里出发，穿越高山与雨林，最终在越南入海。而我们站在这里，在它的起点。',
        en: 'Zaduo is a small county seat, wedged in the upper gorge of the Mekong. From here the river sets out — through mountains and rainforests, to reach the sea in Vietnam. And we stand here, at its beginning.',
      },
      {
        zh: '县里的生态保护站给了我们一份最近的雪豹监测数据。红外相机拍到的画面让人兴奋：一只母豹带着两只幼崽，在月光下走过山脊。',
        en: 'The local conservation station shared recent snow leopard monitoring data. The infrared camera footage was thrilling: a mother leopard with two cubs, walking a ridgeline under moonlight.',
      },
    ],
    moments: [
      { zh: '第一次看到红外相机里的雪豹', en: 'First glimpse of a snow leopard on the infrared camera' },
      { zh: '杂多夜空——银河横跨天顶', en: 'Zaduo night sky — the Milky Way overhead' },
    ],
    weather: { tempC: 11, condition: { zh: '晴·夜间低温', en: 'Clear · cold night' } },
    elevation: 4100,
  },
  {
    slug: 'day-4-yangtze-source',
    day: 4,
    location: { zh: '长江源', en: 'Source of the Yangtze' },
    region: { zh: '各拉丹冬 · 沱沱河', en: 'Geladandong · Tuotuo River' },
    coords: [33.4, 91.9],
    date: { zh: '8.4', en: 'Aug 4' },
    intro: {
      zh: '一路向西，穿越无人区，抵达长江的正源——各拉丹冬冰川。',
      en: 'Driving west through uninhabited land to the true source of the Yangtze — the Geladandong glaciers.',
    },
    diary: [
      {
        zh: '从杂多到长江源，车开了整整一天。路况越来越差，最后几十公里全是碎石和冻土。但当各拉丹冬的冰川出现在地平线上时，车里安静了下来。',
        en: 'From Zaduo to the Yangtze source took a full day\'s drive. The road worsened, the last stretch all scree and permafrost. But when the Geladandong glaciers appeared on the horizon, the car fell silent.',
      },
      {
        zh: '沱沱河从冰川下涌出，水清澈见底，冰凉刺骨。这就是长江的源头——中国最长的河流，从这里的一滴水开始。我们蹲下身，捧起一把水，喝了下去。',
        en: 'The Tuotuo River surges from beneath the glacier, crystal-clear and bone-cold. This is the source of the Yangtze — China\'s longest river, beginning as a single drop. We crouched, cupped the water, and drank.',
      },
    ],
    moments: [
      { zh: '各拉丹冬冰川的第一眼', en: 'The first sight of the Geladandong glacier' },
      { zh: '饮下长江源头的水', en: 'Drinking from the source of the Yangtze' },
    ],
    weather: { tempC: 6, condition: { zh: '晴·高海拔', en: 'Clear · high altitude' } },
    elevation: 5300,
    spotlight: true,
  },
  {
    slug: 'day-5-angsai',
    day: 5,
    location: { zh: '昂赛乡', en: 'Angsai Township' },
    region: { zh: '澜沧江源 · 大峡谷', en: 'Mekong Source · Grand Canyon' },
    coords: [32.7, 95.2],
    date: { zh: '8.5 – 8.6', en: 'Aug 5 – Aug 6' },
    intro: {
      zh: '回到杂多以南的昂赛乡。这里有澜沧江源最壮观的大峡谷，也是雪豹的核心栖息地。',
      en: 'South of Zaduo lies Angsai — the Mekong\'s most spectacular canyon, and the heart of snow leopard habitat.',
    },
    diary: [
      {
        zh: '昂赛大峡谷的红色岩壁在午后阳光下像在燃烧。澜沧江从谷底奔涌而过，两侧的山坡上是密集的柏树林。向导说，雪豹常在这些岩壁间出没。',
        en: 'The red cliffs of the Angsai Grand Canyon seemed to burn in the afternoon sun. The Mekong surged through the valley floor; cypress forests clung to both slopes. The leopards, our guide said, move along these very cliffs.',
      },
      {
        zh: '第二天清晨，我们在峡谷里架好了红外相机。运气好的话，也许能拍到它们。下午，沿着山路徒步，海拔从四千米降到谷底的三千七——植被的变化肉眼可见。',
        en: 'The next morning we set infrared cameras in the canyon. With luck, we might catch them. In the afternoon, a hike down from 4,000 m to the valley floor at 3,700 — the change in vegetation visible to the naked eye.',
      },
    ],
    moments: [
      { zh: '昂赛峡谷红色岩壁下的午餐', en: 'Lunch beneath the red cliffs of Angsai' },
      { zh: '在岩壁上发现雪豹的爪印', en: 'Finding snow leopard tracks on a cliff' },
    ],
    weather: { tempC: 13, condition: { zh: '晴·午后有云', en: 'Clear · afternoon clouds' } },
    elevation: 4000,
  },
  {
    slug: 'day-6-zhaqing',
    day: 6,
    location: { zh: '扎青', en: 'Zhaqing' },
    region: { zh: '昂赛以北 · 归途', en: 'North of Angsai · Homeward' },
    coords: [32.9, 94.6],
    date: { zh: '8.7', en: 'Aug 7' },
    intro: {
      zh: '最后一站。在扎青整理记录，清点物种，准备返程。',
      en: 'The final stop. Tallying records and species in Zhaqing before heading home.',
    },
    diary: [
      {
        zh: '扎青乡很小，几排平房围着一个小广场。我们在保护站里整理这几天的记录：物种清单、GPS 坐标、照片编号。每一个名字背后都是一次真实的相遇。',
        en: 'Zhaqing is tiny — a few rows of single-story houses around a small square. At the conservation station we tallied our records: species lists, GPS coordinates, photo numbers. Behind each name, a real encounter.',
      },
      {
        zh: '返程的车上，有人翻看着 iNaturalist 里的上传记录。几百条观察、几十个物种、六个地点——它们安静地排列在地图上，像一条由好奇心丈量出的轨迹。旅程结束了，但这些记录将继续生长。',
        en: 'On the drive back, someone scrolled through our iNaturalist uploads. Hundreds of observations, dozens of species, six locations — lying quietly across the map like a trail measured out in curiosity. The journey ends, but the records keep growing.',
      },
    ],
    moments: [
      { zh: '在保护站清点全部物种记录', en: 'Tallying every species record at the station' },
      { zh: '返程路上最后一抹夕阳', en: 'The last sunset on the road home' },
    ],
    weather: { tempC: 12, condition: { zh: '多云', en: 'Partly cloudy' } },
    elevation: 4200,
  },
]

/** Localized accessor helpers. */
export function journeyField<T>(j: Journey, field: keyof Journey, lang: 'zh' | 'en'): T {
  const value = j[field] as unknown as Bilingual | Bilingual[]
  if (Array.isArray(value)) return value.map((b) => b[lang]) as unknown as T
  return (value as Bilingual)[lang] as unknown as T
}

export function getJourney(slug: string): Journey | undefined {
  return JOURNEYS.find((j) => j.slug === slug)
}

/** Ordered [lat,lng] route for the connecting polyline. */
export const ROUTE_LINE: [number, number][] = JOURNEYS.map((j) => j.coords)
