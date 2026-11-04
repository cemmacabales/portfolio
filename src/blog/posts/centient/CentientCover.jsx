import owl from '../../../assets/blog/centient/owl-wave.webp'
import { Row, Stub } from './Stub'
import './centient-tokens.css'
import './cover.css'

/*
 * The Centient post's cover on /blog: an accepted answer's stub and its
 * payout's, on the canvas, with the app's owl waving from the corner.
 */
export default function CentientCover() {
  return (
    <div className="cn-cover" aria-hidden="true">
      <Stub className="cn-cover-back">
        <p className="cn-micro">Answer accepted</p>
        <dl className="cn-rows">
          <Row name="Reward" tone="money">
            0.25 USDC
          </Row>
          <Row name="Payout" tone="ok">
            Confirmed
          </Row>
        </dl>
      </Stub>
      <Stub className="cn-cover-front">
        <p className="cn-micro">Payout · 2 of 3 signatures</p>
        <p className="cn-amount cn-cover-amount">
          +0.25<small>USDC</small>
        </p>
        <dl className="cn-rows">
          <Row name="Fee">Centient</Row>
          <Row name="Status" tone="ok">
            Successful
          </Row>
        </dl>
      </Stub>
      <img className="cn-cover-owl" src={owl} alt="" width="320" height="381" loading="lazy" decoding="async" />
    </div>
  )
}
