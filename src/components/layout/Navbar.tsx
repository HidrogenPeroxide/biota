import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Menu, X, Languages, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getNavTheme, subscribeNavTheme } from '@/lib/navTheme'
import { fieldNoteStore } from '@/lib/fieldNoteStore'
import { useI18n, useT } from '@/i18n'

const LIFE_DATA_ITEMS = [
  { to: '/life-data', key: 'lifeData.eyebrow', labelKey: 'nav.lifeData', descKey: 'lifeData.body', overview: true },
  { to: '/life-data/explore', labelKey: 'lifeData.explore', descKey: 'lifeData.exploreDesc' },
  { to: '/life-data/map', labelKey: 'lifeData.map', descKey: 'lifeData.mapDesc' },
  { to: '/life-data/stats', labelKey: 'lifeData.stats', descKey: 'lifeData.statsDesc' },
]

/**
 * Routes whose very top is a dark, full-bleed image. On these the navbar
 * starts transparent with light text (over the photo) and turns solid once
 * the user scrolls. Every other route sits on a light background, so the
 * navbar is solid with dark text from the top — regardless of scroll.
 */
function isHeroPage(pathname: string): boolean {
  return pathname === '/' || pathname.startsWith('/species/')
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const t = useT()
  const { lang, toggleLang } = useI18n()

  // Hidden easter egg: double-click the logo (within ~350ms) to reveal a
  // secret field note. Single clicks still navigate home normally. A 2s
  // cooldown prevents accidental re-triggers.
  const lastClickRef = useRef(0)
  const lastEggRef = useRef(0)
  const onLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const now = Date.now()
    if (now - lastClickRef.current < 350) {
      lastClickRef.current = 0
      if (now - lastEggRef.current > 2000) {
        lastEggRef.current = now
        const r = e.currentTarget.getBoundingClientRect()
        fieldNoteStore.open(r.left + r.width / 2, r.top + r.height / 2)
      }
    } else {
      lastClickRef.current = now
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on navigation.
  useEffect(() => setOpen(false), [location.pathname])

  const heroPage = isHeroPage(location.pathname)
  const navLight = useSyncExternalStore(subscribeNavTheme, getNavTheme) === 'light'
  const solid = scrolled || !heroPage || navLight
  // Golden ripple from the logo when a new field note is discovered.
  const fnSnap = useSyncExternalStore(fieldNoteStore.subscribe, fieldNoteStore.getSnapshot)

  /** A plain nav link with the shared active-underline animation. */
  const renderPill = (to: string, key: string, end: boolean) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'relative rounded-full px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-500',
          solid
            ? isActive
              ? 'text-forest'
              : 'text-charcoal-soft hover:text-charcoal'
            : isActive
              ? 'text-ivory-50'
              : 'text-ivory-50/75 hover:text-ivory-50',
        )
      }
    >
      {({ isActive }) => (
        <>
          {t(key)}
          {isActive && (
            <motion.span
              layoutId="nav-active"
              className="absolute inset-x-3 -bottom-0.5 h-px bg-current opacity-60"
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </>
      )}
    </NavLink>
  )

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-[1200] transition-all duration-700 ease-organic',
        solid
          ? 'bg-ivory-50/90 backdrop-blur-xl border-b border-stone-light/60'
          : 'bg-transparent',
      )}
    >
      <nav className="container-wide flex h-[72px] items-center justify-between">
        <Link
          to="/"
          onClick={onLogoClick}
          className="group relative flex items-center gap-2.5"
          aria-label="Biota home"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-forest text-ivory-50 transition-transform duration-700 ease-organic group-hover:rotate-[18deg]">
            {/* Golden ripple when a new field note is discovered */}
            <AnimatePresence>
              {fnSnap.rippleRev > 0 && (
                <motion.span
                  key={`ripple-${fnSnap.rippleRev}`}
                  className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-ochre/60"
                  style={{ translateX: '-50%', translateY: '-50%' }}
                  initial={{ width: 36, height: 36, opacity: 0.6 }}
                  animate={{ width: 100, height: 100, opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </AnimatePresence>
            <Leaf className="h-5 w-5" strokeWidth={1.6} />
          </span>
          <span className="flex flex-col leading-none">
            <span
              className={cn(
                'font-display text-lg font-medium tracking-tight transition-colors duration-500',
                solid ? 'text-charcoal' : 'text-ivory-50',
              )}
            >
              {t('brand.name')}
            </span>
            <span
              className={cn(
                'text-[10px] uppercase tracking-widest-2 transition-colors duration-500',
                solid ? 'text-forest-mist' : 'text-ivory-50/70',
              )}
            >
              {t('brand.tagline')}
            </span>
          </span>
        </Link>

        {/* Desktop links — 首页 · 生命数据(下拉) · 关于 */}
        <div className="hidden items-center gap-1 md:flex">
          {renderPill('/', 'nav.home', true)}
          <LifeDataDropdown solid={solid} />
          {renderPill('/about', 'nav.about', false)}
        </div>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={toggleLang}
            aria-label={t('nav.toggle')}
            className={cn(
              'flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium tracking-wide transition-all duration-500 ease-organic',
              solid
                ? 'border-stone-light text-charcoal-soft hover:border-stone hover:text-charcoal'
                : 'border-ivory-50/40 text-ivory-50/90 hover:bg-ivory-50/10',
            )}
          >
            <Languages className="h-3.5 w-3.5" />
            {lang === 'zh' ? 'EN' : '中'}
          </button>

          {/* Mobile toggle */}
          <button
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={t('nav.menu')}
          >
            {solid ? (
              open ? (
                <X className="h-6 w-6 text-charcoal" />
              ) : (
                <Menu className="h-6 w-6 text-charcoal" />
              )
            ) : open ? (
              <X className="h-6 w-6 text-ivory-50" />
            ) : (
              <Menu className="h-6 w-6 text-ivory-50" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* blurred backdrop — tap to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[1300] bg-charcoal/40 backdrop-blur-sm md:hidden"
            />
            {/* slide-out panel */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 z-[1400] flex h-full w-[82vw] max-w-sm flex-col border-l border-stone-light/60 bg-ivory-50 shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between border-b border-stone-light/60 px-5 py-4">
                <span className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-ivory-50">
                    <Leaf className="h-4 w-4" strokeWidth={1.6} />
                  </span>
                  <span className="font-display text-base font-medium text-charcoal">
                    {t('brand.name')}
                  </span>
                </span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label={t('nav.menu')}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal-soft hover:bg-ivory-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <NavLink
                  to="/"
                  end
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-xl px-4 py-3 text-base font-medium transition-colors',
                      isActive
                        ? 'bg-forest/8 text-forest'
                        : 'text-charcoal-soft hover:bg-ivory-200',
                    )
                  }
                >
                  {t('nav.home')}
                </NavLink>

                <p className="mt-4 px-4 pb-1 text-[10px] uppercase tracking-widest-2 text-forest-mist">
                  {t('nav.lifeData')}
                </p>
                {LIFE_DATA_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/life-data'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'block rounded-xl px-4 py-3 pl-6 text-base font-medium transition-colors',
                        isActive
                          ? 'bg-forest/8 text-forest'
                          : 'text-charcoal-soft hover:bg-ivory-200',
                      )
                    }
                  >
                    {t(item.labelKey)}
                  </NavLink>
                ))}

                <NavLink
                  to="/about"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'mt-4 block rounded-xl px-4 py-3 text-base font-medium transition-colors',
                      isActive
                        ? 'bg-forest/8 text-forest'
                        : 'text-charcoal-soft hover:bg-ivory-200',
                    )
                  }
                >
                  {t('nav.about')}
                </NavLink>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

/**
 * "Life Data" navigation item with a hover-revealed dropdown of its sections.
 * Opens on hover/focus with a small close-delay so the menu doesn't flicker,
 * and on touch it toggles on tap.
 */
function LifeDataDropdown({ solid }: { solid: boolean }) {
  const t = useT()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Any /life-data route counts as active for the trigger.
  const isActive = location.pathname.startsWith('/life-data')

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        cancelClose()
        setOpen(true)
      }}
      onMouseLeave={scheduleClose}
    >
      <Link
        to="/life-data"
        onFocus={() => {
          cancelClose()
          setOpen(true)
        }}
        onBlur={scheduleClose}
        aria-haspopup="true"
        aria-expanded={open}
        className={cn(
          'relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-500',
          solid
            ? isActive
              ? 'text-forest'
              : 'text-charcoal-soft hover:text-charcoal'
            : isActive
              ? 'text-ivory-50'
              : 'text-ivory-50/75 hover:text-ivory-50',
        )}
      >
        {t('nav.lifeData')}
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-500',
            open && 'rotate-180',
          )}
        />
        {isActive && (
          <motion.span
            layoutId="nav-active"
            className="absolute inset-x-3 -bottom-0.5 h-px bg-current opacity-60"
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="absolute right-0 top-full z-[1300] mt-2 w-72 overflow-hidden rounded-2xl border border-stone-light/70 bg-ivory-50/95 p-2 shadow-[0_24px_60px_-24px_rgba(38,36,31,0.45)] backdrop-blur-xl"
          >
            {LIFE_DATA_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  'group block rounded-xl px-4 py-3 transition-colors',
                  location.pathname === item.to
                    ? 'bg-forest/8'
                    : 'hover:bg-ivory-200',
                )}
              >
                <p
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium',
                    location.pathname === item.to
                      ? 'text-forest'
                      : 'text-charcoal',
                  )}
                >
                  {t(item.labelKey)}
                  {item.overview && (
                    <span className="rounded-full bg-stone-light/60 px-2 py-0.5 text-[9px] uppercase tracking-wider text-charcoal-soft">
                      {t('lifeData.overviewTag')}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-cn text-charcoal-soft">
                  {t(item.descKey)}
                </p>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
