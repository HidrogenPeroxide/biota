import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { useT } from '@/i18n'
import { fieldNoteStore } from '@/lib/fieldNoteStore'

export function Footer() {
  const t = useT()
  const hiddenRef = useRef<HTMLSpanElement>(null)

  // #006 Hidden Words — discover when the user selects any text within the
  // invisible footer sentence.
  useEffect(() => {
    const check = () => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || sel.toString().length === 0) return
      const span = hiddenRef.current
      if (!span) return
      const range = sel.getRangeAt(0)
      if (range.intersectsNode(span)) {
        fieldNoteStore.discover('006')
      }
    }
    document.addEventListener('mouseup', check)
    document.addEventListener('touchend', check)
    return () => {
      document.removeEventListener('mouseup', check)
      document.removeEventListener('touchend', check)
    }
  }, [])

  return (
    <footer className="border-t border-stone-light/60 bg-forest-deep text-ivory-50/80">
      <div className="container-wide grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ivory-50/10 text-ivory-50">
              <Leaf className="h-5 w-5" strokeWidth={1.6} />
            </span>
            <span className="font-display text-lg font-medium text-ivory-50">
              {t('brand.name')}
            </span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-cn text-ivory-50/60">
            {t('footer.desc')}
          </p>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-xs uppercase tracking-widest-2 text-forest-mist">
            {t('footer.exploreTitle')}
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/explore" className="link-underline">
                {t('footer.taxonomy')}
              </Link>
            </li>
            <li>
              <Link to="/map" className="link-underline">
                {t('footer.map')}
              </Link>
            </li>
            <li>
              <Link to="/statistics" className="link-underline">
                {t('footer.insights')}
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <h4 className="text-xs uppercase tracking-widest-2 text-forest-mist">
            {t('footer.dataTitle')}
          </h4>
          <p className="mt-4 text-sm leading-cn text-ivory-50/60">
            {t('footer.dataBody', { inat: t('footer.inat') })}
            <span ref={hiddenRef} className="hidden-message">
              {t('footer.hidden')}
            </span>
          </p>
        </div>
      </div>

      <div className="border-t border-ivory-50/10">
        <div className="container-wide flex flex-col items-center justify-between gap-3 py-6 text-xs text-ivory-50/50 sm:flex-row">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  )
}
