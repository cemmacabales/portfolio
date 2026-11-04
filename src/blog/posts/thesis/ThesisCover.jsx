import Film from './Film'
import coverBack from '../../../assets/blog/thesis/cover-back.webp'
import './thesis-tokens.css'
import './cover.css'

/*
 * The thesis post's cover on /blog: two sheets of film on a lit lightbox, the
 * model's outlines on the front one (the same slice as the post's hero).
 */
export default function ThesisCover() {
  return (
    <div className="lb-cover">
      <div className="lb-plate lb-cover-back" aria-hidden="true">
        <img src={coverBack} alt="" width="480" height="480" loading="lazy" decoding="async" />
      </div>
      <Film className="lb-cover-front" />
    </div>
  )
}
