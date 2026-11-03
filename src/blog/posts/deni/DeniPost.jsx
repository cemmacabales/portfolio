import { useCallback, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Play } from 'lucide-react'
import BlogPage from '../../BlogPage'
import Phone from '../../Phone'
import FilmPlayer from '../../../components/FilmPlayer'
import posthog from '../../../posthog'
import { deniAppStore, deniFilm, deniShots } from '../../../data/deni'
import { formatDate } from '../../posts'
import { deniPost } from './meta'
import { CHAPTERS } from './chapters'
import { useChapterProgress } from './useChapterProgress'
import Pack from './Pack'
import BuildLog from './BuildLog'
import FoilAndSky from '../../../assets/blog/deni/foil-and-sky.webp'
import FoilAndSky800 from '../../../assets/blog/deni/foil-and-sky-800.webp'
import FilmSkies from '../../../assets/blog/deni/film-skies.webp'
import FilmSkies720 from '../../../assets/blog/deni/film-skies-720.webp'
import './deni-tokens.css'
import './deni.css'

const IDS = CHAPTERS.map((chapter) => chapter.id)
const PAIR_SIZES = '(max-width: 760px) 150px, 230px'

// A chapter opens on a band of its hour's sky.
function Chapter({ chapter, children }) {
  return (
    <section id={chapter.id} className="deni-chapter" aria-labelledby={`${chapter.id}-title`}>
      <div className={`deni-opener sky-${chapter.sky}`}>
        <h2 id={`${chapter.id}-title`} className="deni-opener-title">
          {chapter.title}
        </h2>
        <p className="deni-opener-time">{chapter.time}</p>
      </div>
      <div className="deni-prose">{children}</div>
    </section>
  )
}

function PhonePair({ left, right }) {
  return (
    <figure className="deni-pair">
      {[left, right].map((shot) => (
        <div key={shot.caption} className="deni-pair-item">
          <Phone src={shot.src} srcSet={shot.srcSet} sizes={PAIR_SIZES} alt={shot.alt} />
          <figcaption>{shot.caption}</figcaption>
        </div>
      ))}
    </figure>
  )
}

export default function DeniPost() {
  const progress = useChapterProgress(IDS)
  const [filmOpen, setFilmOpen] = useState(false)
  const closeFilm = useCallback(() => setFilmOpen(false), [])
  const [why, design, build, ship] = CHAPTERS

  const openStore = (source) => () =>
    posthog.capture('project_app_store_opened', { project_slug: 'deni', source })

  return (
    <BlogPage>
      <article className="deni-post">
        <header className="deni-hero" style={{ viewTransitionName: 'deni-sky' }} data-vt>
          <div className="deni-hero-inner">
            <div className="deni-hero-copy">
              <a href="/blog/" className="deni-back">
                <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
                All posts
              </a>
              <h1 className="deni-title">{deniPost.title}</h1>
              <p className="deni-dek">{deniPost.dek}</p>
              <p className="deni-byline">
                <img src={deniPost.icon} alt="" width="36" height="36" />
                <span>
                  Carl Macabales ·{' '}
                  <span className="deni-nowrap">
                    <time dateTime={deniPost.date}>{formatDate(deniPost.date)}</time> · {deniPost.readMinutes} min read
                  </span>
                </span>
              </p>
            </div>
            <Phone
              className="deni-hero-phone"
              vt="deni-phone"
              priority
              {...deniShots.today}
              sizes="(max-width: 760px) 220px, 300px"
              alt="Deni’s Today screen: the day’s doses on one pearl foil pack under an afternoon sky"
            />
          </div>
        </header>

        <div className="deni-body">
          <Pack chapters={CHAPTERS} progress={progress} variant="rail" />
          <Pack chapters={CHAPTERS} progress={progress} variant="strip" />

          <div className="deni-column">
            <Chapter chapter={why}>
              <p>
                My dad started taking maintenance meds at an early age, and my mom is the one who keeps him on
                track. Deni was supposed to be just for him, something I’d never share.
              </p>
              <p>
                Then I realized a lot of people have the same problem, not just my dad, and not everyone has
                someone like my mom. So I decided to put it out there, and let Deni be that reminder for anyone who
                needs it.
              </p>
              <blockquote className="deni-quote">
                <span className="deni-capsule" aria-hidden="true" />
                <p>Not everyone has someone like my mom.</p>
              </blockquote>
              <p>
                It works for maintenance meds, and for daily vitamins and supplements too: anything you take on a
                schedule.
              </p>
              <p>
                Healthcare here in the Philippines is hard enough already, so Deni is free. No subscriptions and no
                paywalls. You download it and start: no sign-up, no ads, no tracking.
              </p>
            </Chapter>

            <Chapter chapter={design}>
              <p>
                Before drawing anything, I read Apple’s design guidelines for health apps and looked at the
                medication apps already out there. I wanted Deni calm, professional and Apple-feeling, and not
                mistakable for any of them.
              </p>
              <p>
                A few of Apple’s rules shaped everything after. Liquid Glass is for controls, not content. Rings
                belong to the Activity app, so Deni has none. And nothing should look like the Health app.
              </p>
              <p>
                What came out of that is a design system I called Foil and sky: one solid object, a pearl foil
                pack, under a sky that follows the time of day.
              </p>
              <figure className="deni-figure">
                <img
                  src={FoilAndSky}
                  srcSet={`${FoilAndSky800} 800w, ${FoilAndSky} 1600w`}
                  sizes="(max-width: 760px) 92vw, 700px"
                  width="1600"
                  height="1200"
                  loading="lazy"
                  decoding="async"
                  alt="Foil and sky, Deni’s design system: four skies for morning, afternoon, evening and night; five colors with one meaning each; pearl foil and sky glass; type in SF Pro; calm motion; and the capsule guide"
                />
                <figcaption>
                  The whole system on one sheet. Every color means one thing: Deni blue is an action or a taken
                  dose, rose is the brand and mood, amber is late or missed.
                </figcaption>
              </figure>
              <p>
                The pack holds every dose for the day, grouped by morning, afternoon and evening. You press the pill
                when you take it: the blister presses in and the pill drops out, with a light haptic.
              </p>
              <p>
                Behind it, the sky changes with the hour, so a glance tells you where you are in the day. When the
                day is done, one slow sweep of light crosses the foil. No confetti.
              </p>
              <p>
                Adding a med works the same way. You pick its shape and colors, so the pill on the screen matches
                the one in your hand.
              </p>
              <PhonePair
                left={{
                  ...deniShots.add,
                  alt: 'Adding a med in Deni: an oval tan Ibuprofen tablet, with shape and color pickers below',
                  caption: 'Add a med as it looks',
                }}
                right={{
                  ...deniShots.today,
                  alt: 'Deni’s Today screen: 1 of 4 doses taken, with the evening doses waiting on the pack',
                  caption: 'Today, on one pack',
                }}
              />
              <p>
                This page borrows the same materials. The contents beside the story is a pack, and each chapter you
                finish presses its blister in.
              </p>
            </Chapter>

            <Chapter chapter={build}>
              <p>
                I built a prototype first, in Expo, to get the screens into my hands. Today, adding a med, the
                journal, Insights and the doctor’s report took the first two days.
              </p>
              <p>
                Then I rebuilt it for real, starting from the data. Deni keeps everything on your iPhone, in a
                SQLite database. There’s no account and no server, and the data layer makes no network calls.
              </p>
              <p>
                The database stores only facts, like when a dose was taken. Everything else is worked out from
                those facts by small pure functions: whether a dose is due, late or missed, how many pills are
                left, what goes in the week’s report. Each of those functions has tests, and the database code is
                tested against a real SQLite database.
              </p>
              <figure className="deni-rules">
                <div className="deni-rules-glass">
                  <h3>Rules I settled before building a screen</h3>
                  <ul>
                    <li>
                      A dose is <strong>Late</strong> until midnight. After that, it’s <strong>Missed</strong>.
                    </li>
                    <li>Skipping isn’t missing, and it uses no supply.</li>
                    <li>Deleting a med stops it. Its past doses stay in History.</li>
                    <li>Change a time of day, and past days keep the time they had.</li>
                  </ul>
                </div>
              </figure>
              <p>
                Reminders follow the same idea. There’s one for each time of day, it skips anything you’ve already
                taken, and a follow-up comes 30 minutes later if a dose is still open. From the lock screen you can
                take it, or snooze it for 10 minutes, without opening the app.
              </p>
              <p>
                The week’s report is built from the same facts: a one-page PDF to share through Mail, Messages,
                AirDrop or Files, or to print for your doctor.
              </p>
              <PhonePair
                left={{
                  ...deniShots.reminder,
                  alt: 'A Deni reminder on the lock screen for Metformin, held open to show Take and Snooze 10 minutes',
                  caption: 'A reminder when a dose is due',
                }}
                right={{
                  ...deniShots.report,
                  alt: 'Deni’s report for a doctor: each med’s doses for the week, missed ones noted, then mood, symptoms and notes',
                  caption: 'A one-page report for your doctor',
                }}
              />
              <p>
                Every feature went the same way: a short design doc, a plan, boards to look at, then the build.
              </p>
              <BuildLog />
            </Chapter>

            <Chapter chapter={ship}>
              <p>
                On October 11, Deni went to TestFlight, built on Expo’s servers and installed on my own iPhone.
              </p>
              <p>
                Getting ready for App Store review was its own project: privacy answers, accessibility, an age
                rating, screenshots, a support page and a privacy policy.
              </p>
              <p>
                I also made a film for the launch: a day with Deni, from the morning pack to the report for your
                doctor, cut from recordings of the real app.
              </p>
              <figure className="deni-film">
                <button
                  type="button"
                  className="deni-film-poster"
                  onClick={() => {
                    setFilmOpen(true)
                    posthog.capture('project_film_played', { project_slug: 'deni', source: 'blog' })
                  }}
                >
                  <img
                    src={FilmSkies}
                    srcSet={`${FilmSkies720} 720w, ${FilmSkies} 1280w`}
                    sizes="(max-width: 760px) 92vw, 700px"
                    width="1280"
                    height="720"
                    loading="lazy"
                    decoding="async"
                    alt=""
                  />
                  <span className="deni-film-cue glass">
                    <Play size={15} strokeWidth={0} fill="currentColor" aria-hidden="true" />
                    Watch the film
                    <span className="deni-film-length">{deniFilm.length}</span>
                  </span>
                </button>
                <figcaption>From the film: the same day under four skies.</figcaption>
              </figure>
              <p>
                Deni came out on the App Store on October 28. Version 1.1 is ready: widgets with Take right on your
                Home Screen, a daily water goal, and 30 languages, Arabic included.
              </p>
              <p>What’s next:</p>
              <ul className="deni-next">
                <li>Android support.</li>
                <li>Optional accounts, so your meds and journal sync across your devices and stay backed up.</li>
                <li>
                  Family sharing, so someone like my mom can check in and get a heads-up when a dose is missed.
                </li>
                <li>Sending your weekly report straight to your doctor.</li>
              </ul>
              <p>If Deni helps even a few people stay on top of their meds, that’s worth it.</p>
            </Chapter>

            <aside className={`deni-end${progress.complete ? ' is-complete' : ''}`} aria-labelledby="deni-end-title">
              <div className="deni-end-foil">
                <p className="deni-end-count" aria-hidden="true">
                  <span className="deni-end-num">{progress.count}</span> of {CHAPTERS.length}
                </p>
                <h2 id="deni-end-title" className="deni-end-title">
                  {progress.complete ? 'All set. Thanks for reading.' : 'Thanks for reading.'}
                </h2>
                <div className="deni-end-blisters" aria-hidden="true">
                  {progress.read.map((done, index) => (
                    <span key={CHAPTERS[index].id} className={`blister${done ? ' is-read' : ''}`}>
                      <span className="deni-capsule" />
                    </span>
                  ))}
                </div>
                <a
                  href={deniAppStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn deni-store"
                  onClick={openStore('blog')}
                >
                  Get Deni on the App Store
                  <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
                <p className="deni-end-note">
                  Free on iPhone. Deni helps you keep track; it doesn’t give medical advice.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </article>

      <FilmPlayer film={deniFilm} open={filmOpen} onClose={closeFilm} />
    </BlogPage>
  )
}
