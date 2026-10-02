import ctSlice from '../assets/thesis/ct-axial.webp'
import kidneyMask from '../assets/thesis/mask-kidney.webp'
import kidneyEdge from '../assets/thesis/edge-kidney.webp'
import tumorMask from '../assets/thesis/mask-tumor.webp'
import tumorEdge from '../assets/thesis/edge-tumor.webp'
import { SLICE_CLASSES } from './thesisClasses'

/*
 * One axial slice from the thesis model's own output (case multi_016, the
 * deployed Gradio app). The scan is the raw CT; each class the model found is
 * its mask, painted here in the site's class colors, so the overlay can be
 * swept in, isolated, faded, or held back to compare with the plain scan.
 */
const LAYERS = {
  kidney: { mask: kidneyMask, edge: kidneyEdge },
  tumor: { mask: tumorMask, edge: tumorEdge },
}

/*
 * `state`: 'done' shows the finished overlay (the default, and what the
 * prerender and reduced motion get), 'armed' hides it until the sweep, 'run'
 * plays the sweep once. `focus` isolates one class; a class that isn't on this
 * slice dims them all. `show` and `opacity` mirror the Gradio app's controls.
 * `decoding` is 'sync' for copies that appear mid-animation, so the slice is
 * never missing from their first frame.
 */
export default function ThesisScan({
  ref,
  state = 'done',
  focus = null,
  show,
  opacity = 1,
  raw = false,
  decoding = 'async',
  className = '',
  onSwept,
  children,
}) {
  return (
    <div
      ref={ref}
      className={`th-scan ${className}`}
      data-state={state}
      data-focus={focus ?? undefined}
      data-raw={raw || undefined}
      style={{ '--ov': opacity }}
    >
      <img className="th-ct" src={ctSlice} alt="" draggable="false" decoding={decoding} />
      {SLICE_CLASSES.map((id) => (
        <span
          key={id}
          className="th-ov"
          data-cls={id}
          data-off={show && !show[id] ? '' : undefined}
          style={{ '--mask': `url(${LAYERS[id].mask})`, '--edge': `url(${LAYERS[id].edge})` }}
          aria-hidden="true"
        >
          <i className="th-ov-fill" />
          <i className="th-ov-edge" />
        </span>
      ))}
      {state !== 'done' && (
        <span
          className="th-sweep"
          aria-hidden="true"
          onAnimationEnd={(event) => {
            if (event.animationName === 'th-sweep') onSwept?.()
          }}
        />
      )}
      {children}
    </div>
  )
}
