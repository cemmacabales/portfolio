import Grad from '../assets/me.webp'
import Grad720 from '../assets/me-720.webp'
import Grad480 from '../assets/me-480.webp'
import Barong from '../assets/me-barong.webp'
import Barong720 from '../assets/me-barong-720.webp'
import Barong480 from '../assets/me-barong-480.webp'

/*
 * Carl's two portraits, each in three widths. The hero, the Education tile and
 * the boot loader all ask through these srcsets, so a phone downloads the
 * 480 or 720 copy instead of the full 1080.
 */
export const gradPhoto = { src: Grad, srcSet: `${Grad480} 480w, ${Grad720} 720w, ${Grad} 1080w` }
export const barongPhoto = {
  src: Barong,
  srcSet: `${Barong480} 480w, ${Barong720} 720w, ${Barong} 1080w`,
}

// How wide the hero draws these (measured from HeroBento.css): the portrait
// spans the column on phones and stays under 380px beside the copy; a Centient
// screen spans the column up to 960px and stays under 680px after that.
// boot.js decodes with the same sizes, so it warms the copy the page will use.
export const PORTRAIT_SIZES = '(max-width: 760px) calc(100vw - 54px), 380px'
export const REEL_SIZES = '(max-width: 960px) 100vw, 680px'
