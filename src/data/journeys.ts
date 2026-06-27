/**
 * The field expeditions that sit behind every observation.
 *
 * This is the storytelling spine of the homepage: each entry is one day /
 * one chapter of a journey. Content here is bilingual placeholder prose for
 * now — replace with real diary text and dates. Cover photos and the
 * "species observed that day" are fetched live from iNaturalist by location,
 * so imagery and species lists are always real.
 *
 * The example route traces an expedition toward Sanjiangyuan — the source
 * region of the Yangtze, Yellow and Mekong rivers.
 */

export interface Bilingual {
  zh: string
  en: string
}

export interface Journey {
  /** URL-safe id, e.g. "day-3-sanjiangyuan". */
  slug: string
  /** Sequential chapter number, shown on the marker + card. */
  day: number
  location: Bilingual
  /** Short qualifier under the location name. */
  region: Bilingual
  coords: [number, number]
  /** ISO date (placeholder field-season dates — replace with real ones). */
  date: string
  /** One-line teaser for the preview card + chapter grid. */
  intro: Bilingual
  /** Long-form diary paragraphs. */
  diary: Bilingual[]
  /** Memorable moments, shown as a short list. */
  moments: Bilingual[]
  /** Approximate weather (optional, editorial flavor). */
  weather: { tempC: number; condition: Bilingual }
  /** Elevation in metres where notable (plateau chapters). */
  elevation?: number
  /** Mark the flagship chapter that gets the homepage spotlight. */
  spotlight?: boolean
}

export const JOURNEYS: Journey[] = [
  {
    slug: 'day-1-beijing',
    day: 1,
    location: { zh: '北京', en: 'Beijing' },
    region: { zh: '华北平原 · 起点', en: 'North China Plain · Departure' },
    coords: [39.9042, 116.4074],
    date: '2025-07-10',
    intro: {
      zh: '在城市苏醒之前出发。一切尚未开始，但旅程的形状已经浮现。',
      en: 'We left before the city woke. Nothing had begun, but the shape of the journey was already there.',
    },
    diary: [
      {
        zh: '清晨五点的首都机场还浸在蓝灰色的薄雾里。背包塞满了相机、录音机和一沓来不及读完的图鉴。我们要去的地方很远——远到需要在心里反复描摹它的轮廓，才能确认它真的存在。',
        en: 'At five in the morning the capital\'s airport sat wrapped in blue-grey haze. Packs crammed with cameras, recorders, and a stack of field guides we never finished. The place we were headed was far enough that we had to sketch its outline again and again in our minds before we could believe it existed.',
      },
      {
        zh: '候机厅里，有人翻开三江源的卫星图，手指沿着长江、黄河、澜沧江的源头慢慢游走。三条大江从同一片高原出发，却流向了截然不同的远方。这成了整趟旅程最常被提起的隐喻。',
        en: 'In the departure lounge someone opened a satellite view of Sanjiangyuan and traced a finger along the headwaters of the Yangtze, the Yellow, and the Mekong. Three great rivers leaving the same plateau for utterly different futures. It became the journey\'s most-repeated metaphor.',
      },
    ],
    moments: [
      { zh: '起飞前最后一杯热咖啡', en: 'One last hot coffee before takeoff' },
      { zh: '舷窗外云海之上第一次看见西部山脊', en: 'First glimpse of western ridges above the sea of clouds' },
    ],
    weather: { tempC: 26, condition: { zh: '晴', en: 'Clear' } },
  },
  {
    slug: 'day-2-wuhan',
    day: 2,
    location: { zh: '武汉', en: 'Wuhan' },
    region: { zh: '江汉平原 · 中转', en: 'Jianghan Plain · Layover' },
    coords: [30.5928, 114.3052],
    date: '2025-07-11',
    intro: {
      zh: '长江穿城而过。我们在江边短暂停留，记录第一份真正属于"南方"的物种。',
      en: 'The Yangtze cuts the city in two. We paused along its banks to log our first truly "southern" species.',
    },
    diary: [
      {
        zh: '武汉的热是潮湿而稠密的，像一块拧不干的毛巾。傍晚沿着东湖走，芦苇丛里传出秩田鸟细碎的叫声，水面上是成群的鹭。',
        en: 'Wuhan\'s heat is dense and wet, a towel that never fully wrings dry. At dusk along East Lake, warblers chattered in the reeds and egrets gathered over the water in loose flocks.',
      },
      {
        zh: '这是旅程第一次"取样"。一只停在荷叶上的蜻蜓，一只掠过栈道的燕子，都被郑重地记进本子里。数据于是有了温度。',
        en: 'This was the journey\'s first real "sampling." A dragonfly resting on a lotus leaf, a swallow cutting across the boardwalk — each solemnly entered into the notebook. The data, suddenly, had a temperature.',
      },
    ],
    moments: [
      { zh: '东湖日落时鹭群归巢', en: 'Egrets coming home to roost at East Lake sunset' },
      { zh: '第一次在野外使用 iNaturalist 记录', en: 'First field record logged in iNaturalist' },
    ],
    weather: { tempC: 33, condition: { zh: '闷热·午后雷阵雨', en: 'Humid · afternoon thunderstorm' } },
  },
  {
    slug: 'day-3-chengdu',
    day: 3,
    location: { zh: '成都', en: 'Chengdu' },
    region: { zh: '川西门户 · 进山', en: 'Gateway to the West · Into the Mountains' },
    coords: [30.5728, 104.0668],
    date: '2025-07-12',
    intro: {
      zh: '从盆地抬升向高原前的最后一座大城市。从这里开始，空气变薄，节奏变慢。',
      en: 'The last great city before the basin lifts toward the plateau. From here the air thins and the pace slows.',
    },
    diary: [
      {
        zh: '成都的清晨有花椒与雨水的气味。补给、检查装备、和当地向导敲定进山路线。地图上的虚线将在明天变成真实的土路与垭口。',
        en: 'A Chengdu morning smells of Sichuan peppercorn and rain. Resupply, check the kit, fix the route with our local guide. Tomorrow the dashed lines on the map become real dirt roads and mountain passes.',
      },
    ],
    moments: [
      { zh: '在茶馆里摊开整张高原地图', en: 'Unrolling the full plateau map in a teahouse' },
      { zh: '向导讲起他见过雪豹的那个山谷', en: 'The guide\'s story of the valley where he once saw a snow leopard' },
    ],
    weather: { tempC: 28, condition: { zh: '阴·小雨', en: 'Overcast · light rain' } },
  },
  {
    slug: 'day-4-yushu',
    day: 4,
    location: { zh: '玉树', en: 'Yushu' },
    region: { zh: '青南高原 · 登高', en: 'Southern Qinghai · Climbing' },
    coords: [33.0042, 97.0069],
    date: '2025-07-13',
    elevation: 3700,
    intro: {
      zh: '海拔骤升至三千七百米。第一眼的高原辽阔得让人失语。',
      en: 'Elevation leaps to 3,700 metres. The first sight of the plateau is vast enough to take away speech.',
    },
    diary: [
      {
        zh: '翻过垭口的那一刻，所有人都沉默了。眼前的草甸一直铺到天际，牦牛黑点般散落其间，远处雪峰在云影里明灭。空气稀薄，每一次呼吸都变得清晰可辨。',
        en: 'At the pass everyone went quiet. Meadow unrolled to the horizon, yak scattered across it like dark seeds, distant snow peaks flickering in and out of cloud. The air was thin; every breath became something you could hear.',
      },
      {
        zh: '我们在经幡旁扎营。第一只高原物种是一只鼠兔，它从洞口探出头，盯着我们看了很久，又倏地缩回。',
        en: 'We pitched camp beside prayer flags. The first plateau species was a pika — it poked its head from a burrow, studied us for a long moment, then vanished back inside.',
      },
    ],
    moments: [
      { zh: '垭口处经幡在风中猎猎作响', en: 'Prayer flags snapping at the pass' },
      { zh: '第一只鼠兔的好奇对视', en: 'A long, curious stare from the first pika' },
    ],
    weather: { tempC: 12, condition: { zh: '多云·强紫外线', en: 'Partly cloudy · intense UV' } },
  },
  {
    slug: 'day-5-sanjiangyuan',
    day: 5,
    location: { zh: '三江源', en: 'Sanjiangyuan' },
    region: { zh: '江河之源 · 核心', en: 'Source of the Rivers · Heart' },
    coords: [34.201, 97.342],
    date: '2025-07-14',
    elevation: 4350,
    spotlight: true,
    intro: {
      zh: '三条大江的源头。我们站在分水岭上，看水流各自奔赴远方。',
      en: 'The headwaters of three great rivers. We stood on the divide and watched the water set off for different seas.',
    },
    diary: [
      {
        zh: '三江源不是某一条河的开始，而是无数细小水脉的总和。冰川融水在冻土上蜿蜒，汇成溪，汇成河，最终分道扬镳——向东、向东、再向南。',
        en: 'Sanjiangyuan is not the start of a single river but the sum of countless threads. Meltwater meanders over permafrost, gathering into brooks, into rivers, then parting ways — east, east, and south.',
      },
      {
        zh: '在这里，每一种生命都懂得珍惜水。旱獭在溪边饮水，黑颈鹤在湿地里踱步，雪豹的脚印据说就印在昨夜的泥地上。我们放低声音，怕惊扰了这片刚刚诞生的江河。',
        en: 'Here every living thing knows the worth of water. Marmots drink at the stream, black-necked cranes pace the wetlands, and a snow leopard\'s prints, they say, were left in last night\'s mud. We lowered our voices, afraid to disturb rivers so newly born.',
      },
    ],
    moments: [
      { zh: '清晨湿地里三只黑颈鹤低飞', en: 'Three black-necked cranes gliding low over the wetlands at dawn' },
      { zh: '俯身喝了一口源头冰凉的溪水', en: 'Bending to drink from the ice-cold source' },
      { zh: '向导指认雪豹留下的爪印', en: 'The guide pointing out a snow leopard\'s track' },
    ],
    weather: { tempC: 8, condition: { zh: '晴·夜间结霜', en: 'Clear · frost overnight' } },
  },
  {
    slug: 'day-6-maduo',
    day: 6,
    location: { zh: '玛多', en: 'Madoi' },
    region: { zh: '黄河源头 · 星宿海', en: 'Yellow River Source · Lakes' },
    coords: [34.821, 98.194],
    date: '2025-07-15',
    elevation: 4250,
    intro: {
      zh: '星星般密布的湖泊。黄河在这里还只是清浅的水洼。',
      en: 'Lakes scattered like stars. Here the Yellow River is still a clear, shallow pool.',
    },
    diary: [
      {
        zh: '玛多的湖多到数不清，藏人称之"星宿海"。水鸟在湖面起落，远处是连绵的鼠兔群落——它们是高原生态里不起眼却至关重要的一环。',
        en: 'Madoi has more lakes than anyone can count; Tibetans call it the "Sea of Stars." Waterbirds rose and settled on the surface, and beyond them stretched endless pika colonies — an unremarkable creature that holds the whole plateau ecosystem together.',
      },
    ],
    moments: [
      { zh: '夕阳下湖面碎成万千金箔', en: 'Sunset breaking the lakes into a thousand gold leaves' },
      { zh: '记录到当季第一群迁徙水鸟', en: 'Logging the season\'s first flock of migrating waterbirds' },
    ],
    weather: { tempC: 10, condition: { zh: '晴·风大', en: 'Clear · strong wind' } },
  },
  {
    slug: 'day-7-zaduo',
    day: 7,
    location: { zh: '杂多', en: 'Zaduo' },
    region: { zh: '澜沧江源 · 告别', en: 'Mekong Source · Farewell' },
    coords: [32.896, 95.301],
    date: '2025-07-16',
    elevation: 4100,
    intro: {
      zh: '第三条江的源头，也是旅程的终点。带回去的，是满本子的名字。',
      en: 'The source of the third river, and the journey\'s end. What we carried home was a notebook full of names.',
    },
    diary: [
      {
        zh: '杂多的峡谷比想象中更深。澜沧江从冰川下涌出，奔腾着向南，最终将抵达另一片国土的海。我们坐在江边，把这一路记下的物种一一清点——它们不再只是名字，而是一段我们共同走过的路。',
        en: 'Zaduo\'s gorges ran deeper than we imagined. The Mekong surged out from beneath the glacier and hurtled south, bound at last for another country\'s sea. We sat by the river and counted the species we had gathered — no longer just names now, but a road we had walked together.',
      },
      {
        zh: '返程的飞机上，有人翻看 iNaturalist 里这七天的记录：几百条观察、上百个物种、七个地点。它们安静地排列在地图上，像一条由好奇心丈量出的轨迹。',
        en: 'On the flight home someone scrolled through seven days of iNaturalist records: hundreds of observations, over a hundred species, seven places. They lay quietly across the map like a trail measured out in curiosity.',
      },
    ],
    moments: [
      { zh: '澜沧江边最后一次合影', en: 'A last group photo beside the Mekong' },
      { zh: '在地图上回看完整的七日轨迹', en: 'Looking back at the full seven-day track on the map' },
    ],
    weather: { tempC: 11, condition: { zh: '多云', en: 'Partly cloudy' } },
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
