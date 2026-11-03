import Phone from '../../Phone'
import { deniShots } from '../../../data/deni'
import './deni-tokens.css'
import './cover.css'

// One label per sky; CSS shows the one for the reader's hour (data-sky on
// <html>, set by blog/index.html before first paint).
const HOURS = ['morning', 'afternoon', 'evening', 'night']

const SIZES = '(max-width: 760px) 160px, 220px'

/*
 * Deni's cover on /blog: its sky at the reader's time of day, the way the
 * app's own sky follows the clock. The sky and the front phone share their
 * transition names with the post's hero, so opening the post flies them in.
 */
export default function DeniCover() {
  return (
    <div className="deni-cover" style={{ viewTransitionName: 'deni-sky' }} data-vt>
      <p className="deni-cover-hour glass" aria-hidden="true">
        {HOURS.map((hour) => (
          <span key={hour} data-for={hour}>
            {hour[0].toUpperCase() + hour.slice(1)} sky, like Deni at this hour
          </span>
        ))}
      </p>
      <Phone
        className="deni-cover-back"
        {...deniShots.insights}
        sizes={SIZES}
        alt=""
      />
      <Phone
        className="deni-cover-front"
        vt="deni-phone"
        {...deniShots.today}
        sizes={SIZES}
        alt="Deni’s Today screen: the day’s doses on one pearl foil pack"
      />
    </div>
  )
}
