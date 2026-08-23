import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { LocalizedLink as Link } from '../hooks/useLocalizedNavigation'
// vite-imagetools generates AVIF/WebP + multiple widths at build time from
// these three source files (the heaviest assets in the repo: up to 2MB each
// as plain PNG/JPG) and returns { sources: { avif, webp, ... }, img: { src,
// w, h } } for a <picture> element — no runtime cost, everything happens
// during `vite build`.
import hero_img from '../assets/hero/hero_img.png?w=800;1280;1920&format=avif;webp;png&quality=75&as=picture'
import hero_img1 from '../assets/hero/p_img38(1).jpg?w=800;1280;1920&format=avif;webp;jpeg&quality=75&as=picture'
import hero_img2 from '../assets/hero/p_img4.png?w=800;1280;1920&format=avif;webp;png&quality=75&as=picture'

// Images and hrefs are the only things fixed here — copy comes from
// home.json's hero.slides array (same order: new arrivals, winter, best
// sellers) so it can be translated.
const SLIDE_MEDIA = [
  { image: hero_img, href: '/collection', position: 'center' },
  { image: hero_img1, href: '/collection', position: 'center' },
  { image: hero_img2, href: '/collection', position: 'center' },
]

const AUTOPLAY_MS = 5000
const TRANSITION_MS = 700
const SWIPE_THRESHOLD = 50

const Chevron = ({ direction }) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1'
    strokeLinecap='square'
    className='w-6 h-6'
    aria-hidden='true'
  >
    <path d={direction === 'prev' ? 'M15 4 L7 12 L15 20' : 'M9 4 L17 12 L9 20'} />
  </svg>
)

const Hero = () => {
  const { t } = useTranslation('home')
  const slideCopy = t('hero.slides', { returnObjects: true })
  const slides = SLIDE_MEDIA.map((media, i) => ({ ...media, ...slideCopy[i] }))

  // [lastClone, ...slides, firstClone] gives a seamless infinite slide.
  const track = [slides[slides.length - 1], ...slides, slides[0]]
  const lastIndex = track.length - 1

  const [pos, setPos] = useState(1)
  const [animate, setAnimate] = useState(true)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const touchStartX = useRef(null)
  // True from the moment a slide starts moving until the track has settled on
  // a real slide again. Every navigation path checks it, so `pos` can never be
  // pushed past a clone and off the end of the track — which used to strand
  // the slider on the empty background with no way back.
  const moving = useRef(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  const moveMs = reducedMotion ? 0 : TRANSITION_MS
  const activeIndex = (pos - 1 + slides.length) % slides.length

  const slideBy = useCallback((delta) => {
    if (moving.current) return
    moving.current = true
    setAnimate(true)
    setPos((p) => p + delta)
  }, [])

  const next = useCallback(() => slideBy(1), [slideBy])
  const prev = useCallback(() => slideBy(-1), [slideBy])

  const goTo = useCallback(
    (index) => {
      // A no-op jump would leave the lock set with no state change to release
      // it, so bail before locking.
      if (moving.current || index + 1 === pos) return
      moving.current = true
      setAnimate(true)
      setPos(index + 1)
    },
    [pos]
  )

  // Auto-advance, suspended while hovered/focused or under reduced motion.
  // Keyed on `pos` as well so a manual move restarts the countdown instead of
  // being followed moments later by an automatic one.
  useEffect(() => {
    if (paused || reducedMotion) return
    const timer = setInterval(next, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [paused, reducedMotion, next, pos])

  // Once a move has played out, hop off a clone onto its real twin with the
  // transition switched off. This is driven by a timer rather than
  // `transitionend`, because the browser skips that event whenever it drops
  // the transition (a backgrounded tab, an interrupted animation) and a single
  // missed event left the track parked on a clone for good.
  useEffect(() => {
    if (!animate || !moving.current) return
    const timer = setTimeout(() => {
      if (pos >= lastIndex) {
        setAnimate(false)
        setPos(1)
      } else if (pos <= 0) {
        setAnimate(false)
        setPos(slides.length)
      } else {
        moving.current = false
      }
    }, moveMs)
    return () => clearTimeout(timer)
  }, [pos, animate, moveMs, lastIndex])

  // After the un-animated jump between clone and real slide has been committed,
  // re-enable the transition and accept input again. Double rAF guarantees the
  // jump has painted first.
  useEffect(() => {
    if (animate) return
    let raf2
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        moving.current = false
        setAnimate(true)
      })
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [animate])

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      next()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      prev()
    }
  }

  const handleTouchStart = (event) => {
    touchStartX.current = event.changedTouches[0].clientX
  }

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return
    const delta = event.changedTouches[0].clientX - touchStartX.current
    if (delta <= -SWIPE_THRESHOLD) next()
    else if (delta >= SWIPE_THRESHOLD) prev()
    touchStartX.current = null
  }

  const activeSlide = slides[activeIndex]

  return (
    <section
      role='region'
      aria-roledescription='carousel'
      aria-label='Featured collections'
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className='full-bleed relative overflow-hidden bg-ink h-[78vh] sm:h-[70vh] min-h-[440px] max-h-[760px] outline-none'
    >
      {/* Slide track */}
      <div
        className='flex h-full'
        style={{
          transform: `translateX(-${pos * 100}%)`,
          transitionProperty: 'transform',
          // Duration lives here rather than in a utility class so it cannot
          // drift away from the settle timer above.
          transitionDuration: `${animate ? moveMs : 0}ms`,
          transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)',
        }}
      >
        {track.map((slide, index) => (
          <div
            key={index}
            className='relative w-full min-w-full h-full overflow-hidden'
            aria-hidden={index !== pos}
          >
            <picture>
              {slide.image.sources.avif && (
                <source type='image/avif' srcSet={slide.image.sources.avif} sizes='100vw' />
              )}
              {slide.image.sources.webp && (
                <source type='image/webp' srcSet={slide.image.sources.webp} sizes='100vw' />
              )}
              <img
                src={slide.image.img.src}
                alt={index === pos ? slide.alt : ''}
                loading={index <= 1 ? 'eager' : 'lazy'}
                fetchpriority={index === 1 ? 'high' : 'auto'}
                style={{ objectPosition: slide.position }}
                // Inactive slides hold the animation's end state so a slide
                // leaving view doesn't visibly snap back to scale 1.
                className={`w-full h-full object-cover ${
                  index === pos ? 'animate-ken-burns' : 'scale-[1.06]'
                }`}
              />
            </picture>
          </div>
        ))}
      </div>

      {/* Legibility scrim — light hero images need both a horizontal and a
          bottom-up pass to keep the overlaid copy readable. */}
      <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent pointer-events-none' />
      <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none' />
      <div className='absolute inset-0 bg-black/20 sm:hidden pointer-events-none' />

      {/* Overlaid copy — re-aligned with the site gutter */}
      <div className='absolute inset-0 flex items-end pb-16 sm:pb-20'>
        <div className='w-full px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
          <div key={activeIndex} className='animate-fade-up max-w-xl'>
            <p className='text-[11px] uppercase tracking-label text-white/80'>
              {activeSlide.eyebrow}
            </p>
            {/* h2, not h1. This text changes every few seconds, so as an h1 it
                made the homepage's main heading whatever slide happened to be
                showing when the prerenderer took its snapshot — "Woven in the
                Himalayas" on one build, "Made for the cold" on the next. The
                stable h1 lives in Home.jsx. */}
            <h2 className='mt-4 font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-white'>
              {activeSlide.title}
            </h2>
            <Link
              to={activeSlide.href}
              onClick={() => scrollTo(0, 0)}
              className='inline-block mt-8 bg-paper text-ink px-8 py-3.5 text-[11px] uppercase tracking-label hover:bg-ink hover:text-paper transition-colors duration-300'
            >
              {activeSlide.cta}
            </Link>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button
        type='button'
        onClick={prev}
        aria-label='Previous slide'
        className='hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 items-center justify-center w-11 h-11 text-white/70 hover:text-white transition-colors duration-300'
      >
        <Chevron direction='prev' />
      </button>
      <button
        type='button'
        onClick={next}
        aria-label='Next slide'
        className='hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 items-center justify-center w-11 h-11 text-white/70 hover:text-white transition-colors duration-300'
      >
        <Chevron direction='next' />
      </button>

      {/* Indicators */}
      <div className='absolute bottom-8 left-0 right-0 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
        <div className='flex gap-2'>
          {slides.map((slide, index) => (
            <button
              key={index}
              type='button'
              onClick={() => goTo(index)}
              aria-label={`Go to slide ${index + 1}: ${slide.title}`}
              aria-current={activeIndex === index}
              className='py-2 group'
            >
              <span
                className={`block h-px w-8 transition-colors duration-300 ${
                  activeIndex === index
                    ? 'bg-white'
                    : 'bg-white/40 group-hover:bg-white/70'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
