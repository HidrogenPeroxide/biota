/**
 * Chinese (Simplified) string dictionary.
 *
 * Keys are grouped by namespace using dot notation. Scientific names and
 * numeric tokens are injected via {placeholders}. Latin scientific names stay
 * Latin (and italic) by convention; UI copy is fully translated.
 */

const zh = {
  // ---- Brand ----
  'brand.name': 'Biota',
  'brand.tagline': '生命图集',
  'brand.cta': '开始探索',

  // ---- Nav ----
  'nav.home': '首页',
  'nav.explore': '探索',
  'nav.atlas': '图集',
  'nav.insights': '数据',
  'nav.toggle': '切换语言',
  'nav.menu': '菜单',

  // ---- Footer ----
  'footer.desc':
    '一座活的生物多样性图集——一座由全球数百万博物爱好者共同构建的数字自然博物馆。',
  'footer.exploreTitle': '探索',
  'footer.taxonomy': '生命之树',
  'footer.map': '生命图集地图',
  'footer.insights': '数据洞察',
  'footer.dataTitle': '数据与致谢',
  'footer.dataBody':
    '所有生物多样性数据均来自 {inat} 公开 API，这是加州科学院与国家地理学会共同发起的项目。照片版权归原始观察者所有。',
  'footer.inat': 'iNaturalist',
  'footer.copyright': '© {year} Biota —— 非商业展示项目。',
  'footer.tagline2': '怀揣好奇心打造，由公民科学驱动。',

  // ---- Landing / hero ----
  'home.hero.eyebrow': '一座活的生物多样性图集',
  'home.hero.title1': '每一个物种，',
  'home.hero.titleAccent': '都藏着一个',
  'home.hero.title2': '值得被发现的故事。',
  'home.hero.body':
    '走进一座活着的自然博物馆——数百万真实的野生动物观察，以前所未有的方式被绘制与讲述。数据来自全球 iNaturalist 社区。',
  'home.hero.cta1': '开始探索',
  'home.hero.cta2': '打开图集',
  'home.hero.scroll': '向下滚动',

  // ---- Landing / stats ----
  'home.stats.observations': '观察记录',
  'home.stats.observationsSub': '公民科学数据条目',
  'home.stats.species': '物种',
  'home.stats.speciesSub': '仍有无数未知',
  'home.stats.naturalists': '博物者',
  'home.stats.naturalistsSub': '正在凝视荒野的人',
  'home.stats.places': '地点',
  'home.stats.placesSub': '遍布星球各处',
  'home.stats.fallbackNote': '展示代表性数据——实时总量暂时不可用。',

  // ---- Landing / narrative ----
  'home.vision.eyebrow': '我们的愿景',
  'home.vision.title1': '不是数据库。',
  'home.vision.title2': '是一个活生生的世界。',
  'home.vision.body1':
    '这里的每一条观察，都是一次小小的惊叹——某个人，在某处，停下来留意一只甲虫、一声鸟鸣、一株正在舒展的蕨叶。这些瞬间汇聚在一起，构成了人类有史以来对地球生命最细腻的描绘。',
  'home.vision.body2':
    'Biota 把这份浩瀚的记录化作一种体验。浏览生命之树，掠过大陆间的野生动物，让好奇心引领方向。',
  'home.vision.link': '看数据如何鲜活起来',

  // ---- Landing / branches ----
  'home.branches.eyebrow': '生命的分支',
  'home.branches.title': '通往荒野的十扇门',
  'home.branches.body':
    '从生命之树的某个分支开始。每一扇门后，都通向一整个等待被发现的物种世界。',

  // ---- Landing / featured ----
  'home.featured.eyebrow': '聚光灯下',
  'home.featured.title': '精选物种',
  'home.featured.link': '浏览全部',

  // ---- Landing / closing CTA ----
  'home.closing.eyebrow': '轮到你了',
  'home.closing.title': '荒野，正等着被看见。',
  'home.closing.body':
    '走进图集，追随你的好奇心。总有另一个物种、另一片栖息地、另一个故事，就在下一个转角。',
  'home.closing.cta1': '开始探索',
  'home.closing.cta2': '查看地图',

  // ---- Iconic taxa (group labels) ----
  'taxa.Aves': '鸟类',
  'taxa.Mammalia': '哺乳动物',
  'taxa.Reptilia': '爬行动物',
  'taxa.Amphibia': '两栖动物',
  'taxa.Actinopterygii': '辐鳍鱼类',
  'taxa.Insecta': '昆虫',
  'taxa.Arachnida': '蛛形纲',
  'taxa.Mollusca': '软体动物',
  'taxa.Plantae': '植物',
  'taxa.Fungi': '真菌',
  'taxa.Animalia': '动物',
  'taxa.Life': '生命',

  // ---- Explore ----
  'explore.eyebrow': '探索',
  'explore.title': '漫游生命之树',
  'explore.body':
    '选择一个分支，看看它的物种栖息何处、最近有哪些观察、哪些最为常见。',
  'explore.tagTaxonomy': '分类',
  'explore.tagMap': '实时地图',
  'explore.tagDetails': '详情',
  'explore.treeEyebrow': '生命之树',
  'explore.mapHintTitle': '选择一个分支以开始',
  'explore.mapHintBody':
    '在左侧任选一个生物类群，地图就会随之鲜活起来，显示来自世界各地的最新观察。',
  'explore.viewing': '正在查看',
  'explore.speciesPanelEyebrow': '在此类群中最多观察',
  'explore.speciesRecorded': '已记录 {count} 个物种',
  'explore.speciesEmpty': '该类群暂无可用的物种统计数据。',
  'explore.collapse': '收起',
  'explore.expand': '展开',

  // ---- Species detail ----
  'species.back': '返回探索',
  'species.about': '关于',
  'species.aboutTitle': '近距离观察',
  'species.aboutFallback':
    '关于它的文字还很少。{name} 是 iNaturalist 上被博物者记录的无数物种之一——每一条观察，都是我们理解地球生命的一小块拼图。',
  'species.readWiki': '在维基百科阅读',
  'species.shownHere': '本页展示',
  'species.speciesInGroup': '所在类群物种数',
  'species.galleryTitle': '来自野外',
  'species.galleryBody': '该物种近期的社区观察。',
  'species.galleryEmpty': '暂无近期照片。',
  'species.classification': '分类地位',
  'species.classificationTitle': '它的归属',
  'species.distribution': '分布',
  'species.distributionBody': '博物者记录到该物种的地点。',
  'species.gallery': '图集',
  'species.notFound': '未找到该物种',
  'species.notFoundBody':
    '我们无法加载这个物种，它可能已被重新分类，或网络暂时不可用。',

  // ---- Statistics ----
  'stats.eyebrow': '数据洞察',
  'stats.title': '以数据呈现的生命世界现状',
  'stats.body':
    '跨越每一个生命分支的科学视角——多样性、季节律动、增长，以及记录它们的人。',
  'stats.observations': '观察记录',
  'stats.speciesRecorded': '已记录物种',
  'stats.naturalists': '博物者',
  'stats.majorGroups': '主要类群',
  'stats.diversity.eyebrow': '多样性',
  'stats.diversity.title': '各分支中的物种',
  'stats.diversity.desc':
    '每个矩形面积代表观察量。径向视图则展示一个类群如何细分为被记录最多的物种。',
  'stats.chart.volumeTitle': '按类群与物种的观察量',
  'stats.chart.hoverHint': '悬停某个色块以查看物种详情。',
  'stats.chart.hoverValue': '{name} —— {value}',
  'stats.chart.sunburstTitle': '径向分类',
  'stats.chart.sunburstCaption': '从中心向外：界 → 纲 → 代表物种。',
  'stats.growth.eyebrow': '增长',
  'stats.growth.title': '一场日益壮大的运动',
  'stats.growth.desc':
    '自 iNaturalist 创立以来研究级观察的相对增长——公民科学如何拓宽了我们观察自然的窗口。',
  'stats.chart.growthTitle': '观察增长（相对值）',
  'stats.season.eyebrow': '季节',
  'stats.season.title': '自然何时现身',
  'stats.season.desc':
    '每个类群每月的观察活跃度，揭示了生命的季节脉动——春日苏醒、夏日高峰、冬日沉寂。',
  'stats.chart.seasonTitle': '季节性观察活跃度',
  'stats.standouts.eyebrow': '瞩目之最',
  'stats.standouts.title': '最受关注的',
  'stats.standouts.desc':
    '记录核心的物种与博物者——被观察最多的物种，以及贡献最多观察的人。',
  'stats.chart.topSpeciesTitle': '被观察最多的物种',
  'stats.chart.topObserversTitle': '顶级贡献者',
  'stats.loading': '数据加载中，或暂时不可用。',
  'stats.growthCaption': '相对指数，以当前水平为 100。',

  // ---- Map ----
  'map.title': '生命图集',
  'map.controls': '图集控制',
  'map.controlsTitle': '探索这些记录',
  'map.collapse': '收起面板',
  'map.open': '打开控制面板',
  'map.layer': '图层',
  'map.layerMarkers': '观察点',
  'map.layerHeat': '热力图',
  'map.branch': '生命分支',
  'map.all': '全部',
  'map.time': '时间 · {year}',
  'map.inView': '当前视图中',
  'map.viewNote': '展示最多 250 条最近的「研究级」记录。',
  'map.tryDifferent': '试试其他物种、类群或年份。',
  'map.searchPlaceholder': '搜索任意物种……',
  'map.searching': '搜索中……',
  'map.noResults': '未找到物种。',
  'map.shown': '已显示',
  'map.filters': '筛选',

  // ---- Species search ----
  'search.placeholder': '搜索任意物种……',
  'search.searching': '搜索中……',
  'search.noResults': '未找到物种。',
  'search.clear': '清除',

  // ---- States / misc ----
  'states.empty.title': '等待数据归位',
  'states.empty.message': '暂时无法获取观察数据，请稍后再试。',
  'states.retry': '重试',
  'common.noData': '该视图暂无观察数据。',
  'common.loading': '加载中……',

  // ---- NotFound ----
  '404.eyebrow': '偏离了地图',
  '404.title': '这条路通向虚无',
  '404.body': '你要找的页面已淡出视野。让我们带你回到这片生命图集。',
  '404.cta': '返回首页',

  // ---- Misc labels ----
  'label.obs': '次观察',
  'label.observedBy': '由 {name} 观察到',
  'label.wildlife': '野生动物',
} as const

export type Dict = typeof zh
export default zh
