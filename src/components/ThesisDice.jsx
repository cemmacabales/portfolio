import { thesis } from '../data/portfolio'
import { fmtDice } from './thesisClasses'

/*
 * Dice for each abnormality, trained alone (gray) against trained together
 * (the class color). Every bar carries its value, so no color stands alone.
 * Hovering a row isolates that class on the scan beside it.
 */
export default function DiceBars({ state = 'done', onFocus, className = '' }) {
  return (
    <figure className={`th-dice ${className}`} data-state={state}>
      <figcaption className="th-dice-head">
        <span className="th-dice-title">Dice score</span>
        <span className="th-keys" aria-hidden="true">
          <span className="th-key">
            <i className="th-key-alone" />
            Alone
          </span>
          <span className="th-key">
            <i className="th-key-together" />
            Together
          </span>
        </span>
      </figcaption>
      <ul className="th-dice-rows">
        {thesis.results.map((row, i) => (
          <li
            key={row.id}
            className="th-dice-row"
            data-cls={row.id}
            style={{ '--i': i }}
            onPointerEnter={(event) => event.pointerType === 'mouse' && onFocus?.(row.id)}
            onPointerLeave={(event) => event.pointerType === 'mouse' && onFocus?.(null)}
          >
            <span className="th-dice-name">{row.name}</span>
            <span className="th-dice-track" aria-hidden="true">
              <span className="th-bar th-bar-alone" data-zero={row.alone === 0 || undefined} style={{ '--v': row.alone }}>
                <span className="th-bar-fill" />
                <b className="th-bar-val">{fmtDice(row.alone)}</b>
              </span>
              <span className="th-bar th-bar-together" style={{ '--v': row.together }}>
                <span className="th-bar-fill" />
                <b className="th-bar-val">{fmtDice(row.together)}</b>
              </span>
            </span>
            <span className="visually-hidden">
              : {fmtDice(row.alone)} trained alone, {fmtDice(row.together)} trained together
            </span>
          </li>
        ))}
      </ul>
    </figure>
  )
}

