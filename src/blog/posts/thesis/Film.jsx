import ctSlice from '../../../assets/thesis/ct-axial.webp'
import kidneyMask from '../../../assets/thesis/mask-kidney.webp'
import kidneyEdge from '../../../assets/thesis/edge-kidney.webp'
import tumorMask from '../../../assets/thesis/mask-tumor.webp'
import tumorEdge from '../../../assets/thesis/edge-tumor.webp'
import { thesis } from '../../../data/thesis'

const LAYERS = [
  { id: 'kidney', mask: kidneyMask, edge: kidneyEdge },
  { id: 'tumor', mask: tumorMask, edge: tumorEdge },
]

/*
 * The model's output for one slice (case multi_016, from the deployed app),
 * hung on the lightbox as a sheet of film. The kidney is drawn as a white
 * outline, the tumor in coral (thesis-tokens.css). `annotate` adds the
 * viewer's corner labels; `priority` marks the hero's copy, the page's
 * largest paint.
 */
export default function Film({ annotate = false, priority = false, className = '' }) {
  return (
    <div className={`lb-plate ${className}`.trim()}>
      <div className="lb-scan">
        <img
          src={ctSlice}
          alt={thesis.scan.alt}
          width="880"
          height="880"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
        />
        {LAYERS.map((layer) => (
          <span
            key={layer.id}
            className="lb-ov"
            data-cls={layer.id}
            style={{ '--mask': `url(${layer.mask})`, '--edge': `url(${layer.edge})` }}
            aria-hidden="true"
          >
            <i className="lb-ov-fill" />
            <i className="lb-ov-edge" />
          </span>
        ))}
        {annotate && (
          <>
            <span className="lb-anno lb-anno-tl" aria-hidden="true">
              <b>Axial</b>
              <br />
              Slice {thesis.scan.slice} / {thesis.scan.of}
            </span>
            <span className="lb-anno lb-anno-br" aria-hidden="true">
              Kidney · Tumor
              <br />
              <b>multi_016</b>
            </span>
          </>
        )}
      </div>
    </div>
  )
}
