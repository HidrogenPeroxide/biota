import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass } from 'lucide-react'

export function NotFound() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center"
    >
      <Compass className="h-12 w-12 text-forest-mist" strokeWidth={1.2} />
      <p className="eyebrow mt-6">Off the map</p>
      <h1 className="headline mt-3 text-4xl md:text-6xl">
        This path leads nowhere
      </h1>
      <p className="mt-4 max-w-md text-charcoal-soft">
        The page you're looking for has drifted out of view. Let's find your way
        back to the living atlas.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center rounded-full bg-forest px-7 py-3 text-sm font-medium text-ivory-50 transition-colors duration-500 hover:bg-forest-light"
      >
        Return home
      </Link>
    </motion.section>
  )
}
