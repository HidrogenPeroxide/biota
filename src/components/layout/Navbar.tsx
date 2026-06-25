import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Menu, X, Languages } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n, useT } from '@/i18n'

const LINKS = [
  { to: '/', key: 'nav.home' },
  { to: '/explore', key: 'nav.explore' },
  { to: '/map', key: 'nav.atlas' },
  { to: '/statistics', key: 'nav.insights' },
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on navigation.
  useEffect(() => setOpen(false), [location.pathname])

  const heroPage = isHeroPage(location.pathname)
  const solid = scrolled || !heroPage

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
          className="group flex items-center gap-2.5"
          aria-label="Biota home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-ivory-50 transition-transform duration-700 ease-organic group-hover:rotate-[18deg]">
            <Leaf className="h-4.5 w-4.5" strokeWidth={1.6} />
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

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
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
                  {t(link.key)}
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
          ))}
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

          <div className="hidden md:block">
            <Link
              to="/explore"
              className={cn(
                'inline-flex items-center rounded-full border px-5 py-2 text-sm font-medium tracking-wide transition-all duration-500 ease-organic',
                solid
                  ? 'border-forest/40 text-forest hover:bg-forest hover:text-ivory-50 hover:border-forest'
                  : 'border-ivory-50/40 text-ivory-50 hover:bg-ivory-50 hover:text-forest-deep hover:border-ivory-50',
              )}
            >
              {t('brand.cta')}
            </Link>
          </div>

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

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-stone-light/60 bg-ivory-50 md:hidden"
          >
            <div className="container-wide flex flex-col gap-1 py-4">
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-4 py-3 text-base font-medium transition-colors',
                      isActive
                        ? 'bg-forest/8 text-forest'
                        : 'text-charcoal-soft hover:bg-ivory-200',
                    )
                  }
                >
                  {t(link.key)}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
