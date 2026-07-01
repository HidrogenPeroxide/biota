/**
 * English string dictionary. Mirrors the keys in zh.ts.
 */

const en = {
  // ---- Brand ----
  'brand.name': 'Sanjiangyuan 2026',
  'brand.tagline': 'School of Life Sciences, Tsinghua University',
  'brand.cta': 'Begin exploring',

  // ---- Nav ----
  'nav.home': 'Home',
  'nav.lifeData': 'Life Data',
  'nav.about': 'About',
  // Legacy labels (still used inside Life Data surfaces)
  'nav.explore': 'Explore',
  'nav.atlas': 'Atlas',
  'nav.insights': 'Insights',
  'nav.toggle': 'Toggle language',
  'nav.menu': 'Menu',

  // ---- Footer ----
  'footer.desc':
    'A living atlas of biodiversity — a digital natural history museum built on the open observations of millions of naturalists around the world.',
  'footer.exploreTitle': 'Explore',
  'footer.taxonomy': 'Taxonomy',
  'footer.map': 'Living Atlas Map',
  'footer.insights': 'Insights',
  'footer.dataTitle': 'Data & Attribution',
  'footer.dataBody':
    'All biodiversity data is sourced from the {inat} public API, a joint initiative of the California Academy of Sciences and the National Geographic Society. Photography remains the property of the original observers.',
  'footer.inat': 'iNaturalist',
  'footer.copyright': '© {year} Biota — a non-commercial showcase.',
  'footer.tagline2': 'Crafted with curiosity. Powered by citizen science.',

  // ---- Landing / hero ----
  'home.hero.eyebrow': 'A Living Atlas of Biodiversity',
  'home.hero.title1': 'Every species,',
  'home.hero.titleAccent': 'a story',
  'home.hero.title2': 'worth discovering.',
  'home.hero.body':
    'Wander through a living natural history museum — millions of real wildlife observations, mapped and told like never before. Powered by the global community of iNaturalist.',
  'home.hero.cta1': 'Begin exploring',
  'home.hero.cta2': 'Open the atlas',
  'home.hero.scroll': 'Scroll',

  // ---- Landing / stats ----
  'home.stats.observations': 'Observations',
  'home.stats.observationsSub': 'citizen-science records',
  'home.stats.species': 'Species',
  'home.stats.speciesSub': 'and countless more',
  'home.stats.naturalists': 'Naturalists',
  'home.stats.naturalistsSub': 'people watching the wild',
  'home.stats.places': 'Places',
  'home.stats.placesSub': 'corners of the planet',
  'home.stats.fallbackNote':
    'Showing representative figures — live totals are momentarily unavailable.',

  // ---- Landing / narrative ----
  'home.vision.eyebrow': 'The vision',
  'home.vision.title1': 'Not a database.',
  'home.vision.title2': 'A living world.',
  'home.vision.body1':
    'Every observation here is a small act of wonder — someone, somewhere, pausing to notice a beetle, a birdcall, a fern uncurling. Together, those moments form the most detailed portrait of life on Earth ever assembled.',
  'home.vision.body2':
    'Biota turns that vast record into an experience. Browse the tree of life, drift across continents of wildlife, and let curiosity lead the way.',
  'home.vision.link': 'See the data come alive',

  // ---- Landing / branches ----
  'home.branches.eyebrow': 'Branches of life',
  'home.branches.title': 'Ten doorways into the wild',
  'home.branches.body':
    'Begin with a branch of the tree of life. Each opens onto a whole world of species to discover.',

  // ---- Landing / featured ----
  'home.featured.eyebrow': 'In the spotlight',
  'home.featured.title': 'Featured species',
  'home.featured.link': 'Explore all',

  // ---- Landing / closing CTA ----
  'home.closing.eyebrow': 'Your turn',
  'home.closing.title': 'The wild is waiting to be noticed.',
  'home.closing.body':
    "Step into the atlas and follow your curiosity. There's always another species, another habitat, another story just around the bend.",
  'home.closing.cta1': 'Start exploring',
  'home.closing.cta2': 'View the map',

  // ---- Home: story-driven hero ----
  'home.story.eyebrow': 'A Digital Field Journal',
  'home.story.title1': 'Every Journey',
  'home.story.titleAccent': 'Begins With Curiosity',
  'home.story.subtitle':
    '“To keep every cog and wheel is the first precaution of intelligent tinkering.”',
  'home.story.subtitleAttribution': '— Aldo Leopold',
  'home.story.cta1': 'Follow our journeys',
  'home.story.cta2': 'Explore the Life Data',
  'home.story.scroll': 'Scroll',

  // ---- Home: journey map ----
  'home.journey.eyebrow': 'Where we have been',
  'home.journey.title': 'The places we travelled',
  'home.journey.body':
    'Each marker is a chapter of the journey — a morning, a valley, an encounter with the wild. Hover to preview, click to step into that day.',
  'home.journey.hint': 'Hover a marker to preview · click to enter the day',
  'home.journey.readStory': 'Read the full story',

  // ---- Home: chapter cards ----
  'home.chapters.eyebrow': 'Chapters',
  'home.chapters.title': 'Seven days, seven horizons',
  'home.chapters.day': 'Day {n}',
  'home.chapters.species': '{count} species',
  'home.chapters.openJournal': 'Open this day',

  // ---- Home: bridge into Life Data ----
  'home.bridge.eyebrow': 'After the story, the data',
  'home.bridge.title': 'From footprints, into the Life Data',
  'home.bridge.body':
    'Behind every journey are hundreds of real species observations. Step into Life Data and measure the life we recorded — by place, by season, by group.',
  'home.bridge.cta1': 'Enter Life Data',
  'home.bridge.cta2': 'View the insights',

  // ---- Journey detail page ----
  'journey.back': 'Back to the journey map',
  'journey.day': 'Day {n}',
  'journey.diary': 'Diary',
  'journey.moments': 'Memorable moments',
  'journey.route': "Today's route",
  'journey.gallery': 'From the field',
  'journey.speciesTitle': 'The life recorded this day',
  'journey.speciesBody': 'Aggregated from iNaturalist community data near this location.',
  'journey.exploreFromHere': 'Explore the Life Data from here',
  'journey.weather': 'Weather',
  'journey.elevation': 'Elevation',
  'journey.notFound': 'This day was not found',
  'journey.notFoundBody':
    "This chapter seems to have drifted off our map. Return to the journey map to keep exploring.",
  'journey.notFound.cta': 'Back to the map',

  // ---- Life Data section labels ----
  'lifeData.eyebrow': 'Life Data',
  'lifeData.title': 'Measure this living world, firsthand',
  'lifeData.body':
    'Every species we recorded across our travels lives here — the taxonomy tree, the observation map, species profiles, and statistical insights.',
  'lifeData.overviewTag': 'Overview',
  'lifeData.explore': 'Taxonomy',
  'lifeData.map': 'Observation Atlas',
  'lifeData.stats': 'Insights',
  'lifeData.exploreDesc': 'Wander the tree of life',
  'lifeData.mapDesc': 'See observations on the map',
  'lifeData.statsDesc': 'Biodiversity, in data',
  'lifeData.filteredHere': 'Showing observations near {place}',

  // ---- About ----
  'about.eyebrow': 'About',
  'about.title': 'A journey driven by curiosity',
  'about.intro':
    'Biota is a growing digital field journal. We head into the wild with cameras and field guides and record every encounter with life — this site is where those encounters continue.',
  'about.motivationTitle': 'Why we set out',
  'about.motivationBody':
    'Biodiversity data usually arrives as tables and charts — cold and abstract. We wanted to tell it differently: first the places we travelled, then the life we met there. Data with warmth; science with a story.',
  'about.teamTitle': 'Team',
  'about.teamBody':
    'A small, interdisciplinary crew of field workers, designers, and developers.',
  'about.dataTitle': 'Data source',
  'about.dataBody':
    'All species data comes from the {inat} public API — a citizen-science platform run by the California Academy of Sciences and the National Geographic Society. Photography remains the property of the original observers.',
  'about.techTitle': 'Technology',
  'about.techBody':
    'React · TypeScript · Vite · Tailwind · Framer Motion · D3 · Leaflet.',
  'about.thanksTitle': 'Acknowledgements',
  'about.thanksBody':
    'Thanks to everyone who records nature on iNaturalist; to our guides and the communities that hosted us; and to everyone who made this journey possible.',

  // ---- Iconic taxa ----
  'taxa.Aves': 'Birds',
  'taxa.Mammalia': 'Mammals',
  'taxa.Reptilia': 'Reptiles',
  'taxa.Amphibia': 'Amphibians',
  'taxa.Actinopterygii': 'Ray-finned Fishes',
  'taxa.Insecta': 'Insects',
  'taxa.Arachnida': 'Arachnids',
  'taxa.Mollusca': 'Mollusks',
  'taxa.Plantae': 'Plants',
  'taxa.Fungi': 'Fungi',
  'taxa.Animalia': 'Animals',
  'taxa.Life': 'Life',

  // ---- Explore ----
  'explore.eyebrow': 'Explore',
  'explore.title': 'Wander the tree of life',
  'explore.body':
    "Choose a branch to see where its species live, what's been observed lately, and which ones are most common.",
  'explore.tagTaxonomy': 'Taxonomy',
  'explore.tagMap': 'Live map',
  'explore.tagDetails': 'Details',
  'explore.treeEyebrow': 'Tree of life',
  'explore.mapHintTitle': 'Select a branch to begin',
  'explore.mapHintBody':
    'Pick any group on the left and the map will come alive with its latest observations from around the world.',
  'explore.viewing': 'Viewing',
  'explore.speciesPanelEyebrow': 'Most observed in',
  'explore.speciesRecorded': '{count} species recorded',
  'explore.speciesEmpty': 'No species counts available for this group.',
  'explore.collapse': 'Collapse',
  'explore.expand': 'Expand',

  // ---- Species detail ----
  'species.back': 'Back to explore',
  'species.about': 'About',
  'species.aboutTitle': 'A closer look',
  'species.aboutFallback':
    'Little has been written here yet. {name} is one of countless species documented by naturalists on iNaturalist — each observation a small contribution to our understanding of life on Earth.',
  'species.readWiki': 'Read on Wikipedia',
  'species.shownHere': 'Shown here',
  'species.speciesInGroup': 'Species in group',
  'species.galleryTitle': 'From the field',
  'species.galleryBody': 'Recent community observations of this species.',
  'species.galleryEmpty': 'No recent photos available.',
  'species.classification': 'Classification',
  'species.classificationTitle': 'Where it belongs',
  'species.distribution': 'Distribution',
  'species.distributionBody': 'Where naturalists have recorded this species.',
  'species.gallery': 'Gallery',
  'species.notFound': 'Species not found',
  'species.notFoundBody':
    "We couldn't load this species. It may have been reclassified or the network is unavailable.",

  // ---- Statistics ----
  'stats.eyebrow': 'Insights',
  'stats.title': 'The state of the living world, in data',
  'stats.body':
    'A scientific view across every branch of life — diversity, seasonal rhythms, growth, and the people who document it.',
  'stats.observations': 'Observations',
  'stats.speciesRecorded': 'Species recorded',
  'stats.naturalists': 'Naturalists',
  'stats.majorGroups': 'Major groups',
  'stats.diversity.eyebrow': 'Diversity',
  'stats.diversity.title': 'Species across the branches',
  'stats.diversity.desc':
    "Each rectangle's area encodes observation volume. The radial view shows how a group divides into its most-recorded species.",
  'stats.chart.volumeTitle': 'Observation volume by group & species',
  'stats.chart.hoverHint': 'Hover a cell to inspect a species.',
  'stats.chart.hoverValue': '{name} — {value}',
  'stats.chart.sunburstTitle': 'Radial taxonomy',
  'stats.chart.sunburstCaption': 'Rings from center: kingdom → class → top species.',
  'stats.growth.eyebrow': 'Growth',
  'stats.growth.title': 'A movement, gaining momentum',
  'stats.growth.desc':
    'Relative growth in research-grade observations since iNaturalist began — a proxy for how citizen science has expanded our window onto nature.',
  'stats.chart.growthTitle': 'Observation growth (relative)',
  'stats.season.eyebrow': 'Seasons',
  'stats.season.title': 'When nature shows itself',
  'stats.season.desc':
    'Monthly observation activity per group reveals the seasonal pulse of life — spring awakenings, summer peaks, winter quiet.',
  'stats.chart.seasonTitle': 'Seasonal observation activity',
  'stats.standouts.eyebrow': 'Standouts',
  'stats.standouts.title': 'The most noticed',
  'stats.standouts.desc':
    'The species and naturalists at the heart of the record — the most-observed species, and the people behind the most observations.',
  'stats.chart.topSpeciesTitle': 'Most observed species',
  'stats.chart.topObserversTitle': 'Top contributors',
  'stats.loading': 'Data is loading or momentarily unavailable.',
  'stats.growthCaption': 'Relative index, 0–100 of current level.',

  // ---- Map ----
  'map.title': 'Living Atlas',
  'map.controls': 'Atlas controls',
  'map.controlsTitle': 'Explore the record',
  'map.collapse': 'Collapse panel',
  'map.open': 'Open controls',
  'map.layer': 'Layer',
  'map.layerMarkers': 'Observations',
  'map.layerHeat': 'Heatmap',
  'map.branch': 'Branch of life',
  'map.all': 'All',
  'map.time': 'Time · {year}',
  'map.inView': 'In current view',
  'map.viewNote':
    'Showing up to 250 of the most recent research-grade records.',
  'map.tryDifferent': 'Try a different species, group, or year.',
  'map.searchPlaceholder': 'Search any species…',
  'map.searching': 'Searching…',
  'map.noResults': 'No species found.',
  'map.shown': 'shown',
  'map.filters': 'Filters',

  // ---- Species search ----
  'search.placeholder': 'Search any species…',
  'search.searching': 'Searching…',
  'search.noResults': 'No species found.',
  'search.clear': 'Clear',

  // ---- States / misc ----
  'states.empty.title': 'Awaiting the field',
  'states.empty.message':
    'Observations could not be reached right now. Please try again in a moment.',
  'states.retry': 'Try again',
  'common.noData': 'No observations in this view.',
  'common.loading': 'Loading…',

  // ---- NotFound ----
  '404.eyebrow': 'Off the map',
  '404.title': 'This path leads nowhere',
  '404.body':
    "The page you're looking for has drifted out of view. Let's find your way back to the living atlas.",
  '404.cta': 'Return home',

  // ---- Misc labels ----
  'label.obs': 'obs',
  'label.observedBy': 'Observed by {name}',
  'label.wildlife': 'Wildlife',
} as const

export type Dict = typeof en
export default en
