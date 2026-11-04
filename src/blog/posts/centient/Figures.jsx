import { ArrowUpRight, Check } from 'lucide-react'
import { Row, Stub } from './Stub'
import { balances, failures, gates, links, payout, perDay, sprint, weeks } from './ledger'

const usdc = (n) => n.toFixed(2)

// The statement of work as a receipt: four deliverables, a gate each.
export function SprintLedger() {
  return (
    <figure className="cn-fig">
      <Stub className="cn-fig-stub">
        <p className="cn-micro">Statement of work · four deliverables</p>
        <dl className="cn-rows cn-gates">
          {gates.map((gate) => (
            <Row
              key={gate.week}
              name={
                <span className="cn-gate-name">
                  <b>{gate.name}</b>
                  <span>
                    Week {gate.week} · gate passed {gate.on}
                  </span>
                </span>
              }
            >
              {gate.passed} of {gate.cases}
            </Row>
          ))}
        </dl>
        <hr className="cn-dash" />
        <dl className="cn-rows">
          <Row name="Grant" tone="money">
            ${sprint.grant.toLocaleString('en-US')}
          </Row>
          <Row name="Days">{sprint.days}</Row>
          <Row name="Status" tone="ok">
            All four passed by {sprint.end}
          </Row>
        </dl>
      </Stub>
      <figcaption>
        Each gate’s result is QA cases passed out of cases run, on one frozen build. The rest were settled in
        writing: by ruling, by sign-off, or accepted as known gaps.
      </figcaption>
    </figure>
  )
}

// A real screen from the app, in a quiet frame.
export function Screen({ src, srcSet, alt, caption }) {
  return (
    <figure className="cn-fig">
      <div className="cn-screen">
        <img
          src={src}
          srcSet={srcSet}
          sizes="(max-width: 760px) 100vw, 720px"
          alt={alt}
          width="1600"
          height="1073"
          loading="lazy"
          decoding="async"
        />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

// One payout, as the ledger keeps it.
export function PayoutStub() {
  return (
    <figure className="cn-fig">
      <Stub className="cn-fig-stub cn-payout">
        <p className="cn-micro">One payout · {payout.when}</p>
        <p className="cn-amount cn-payout-amount">
          {payout.amount}
          <small>USDC</small>
        </p>
        <dl className="cn-rows">
          <Row name="To">
            <span className="cn-mono">{payout.to}</span>
          </Row>
          <Row name="Signature 1">Centient’s payout key</Row>
          <Row name="Signature 2">The co-signer, after checking</Row>
          <Row name="Network fee">Paid by Centient</Row>
        </dl>
        <hr className="cn-dash" />
        <dl className="cn-rows">
          <Row name="Transaction">
            <a className="cn-tx" href={`${links.explorer}${payout.hash}`} target="_blank" rel="noopener noreferrer">
              <span className="cn-mono">
                {payout.hash.slice(0, 8)}…{payout.hash.slice(-4)}
              </span>
              <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
              <span className="visually-hidden"> (opens on stellar.expert in a new tab)</span>
            </a>
          </Row>
          <Row name="Status" tone="ok">
            Successful
          </Row>
        </dl>
      </Stub>
      <figcaption>A real payout from week three, an accepted answer at the 0.25 USDC rate, on Stellar testnet.</figcaption>
    </figure>
  )
}

// What a new labeler gives at first connect.
export function SignInStub() {
  return (
    <figure className="cn-fig">
      <Stub className="cn-fig-stub cn-narrow">
        <p className="cn-micro">First connect · what you give</p>
        <dl className="cn-rows">
          <Row name="Email">None</Row>
          <Row name="Password">None</Row>
          <Row name="XLM">0</Row>
          <Row name="Signatures">1</Row>
        </dl>
        <hr className="cn-dash" />
        <dl className="cn-rows">
          <Row name="Account reserve">Paid by Centient</Row>
          <Row name="USDC trustline">Paid by Centient</Row>
        </dl>
      </Stub>
    </figure>
  )
}

// The balances left when every answer started paying on its own: one ticket
// each, the ones under the minimum torn off.
export function Balances() {
  const tickets = Array.from({ length: balances.holders }, (_, index) => index >= balances.holders - balances.under)
  return (
    <figure className="cn-fig cn-panel cn-balances">
      <p className="cn-micro">Balances waiting to be withdrawn · 21 Sep</p>
      <ol className="cn-tickets" aria-hidden="true">
        {tickets.map((under, index) => (
          <li key={index} className={under ? 'is-under' : undefined} />
        ))}
      </ol>
      <ul className="cn-tickets-key">
        <li>
          <b>{balances.holders - balances.under}</b> over the {balances.minimum} USDC minimum
        </li>
        <li className="is-under">
          <b>{balances.under}</b> under it, {usdc(balances.underUsdc)} USDC between them
        </li>
      </ul>
      <figcaption>
        The ten balances left on 21 September, when every answer started paying on its own. One of the two over the
        minimum was the seeded demo account.
      </figcaption>
    </figure>
  )
}

// How the money moved, week by week. Amounts are the app's gold.
export function Weeks() {
  return (
    <figure className="cn-fig cn-panel">
      <table className="cn-table">
        <caption className="visually-hidden">USDC payouts each week of the sprint</caption>
        <thead>
          <tr>
            <th scope="col">Week</th>
            <th scope="col">Payouts</th>
            <th scope="col">USDC</th>
            <th scope="col">Wallets</th>
            <th scope="col">How it paid</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week.week}>
              <th scope="row">{week.week}</th>
              <td>{week.payouts}</td>
              <td className="cn-money">{usdc(week.usdc)}</td>
              <td>{week.wallets}</td>
              <td>{week.how}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">All</th>
            <td>{sprint.payouts}</td>
            <td className="cn-money">{usdc(sprint.usdc)}</td>
            <td>{sprint.wallets}</td>
            <td />
          </tr>
        </tfoot>
      </table>
      <figcaption>
        Wallets are counted within each week, so they add up to more than the 61 paid in all. Week four’s payouts are
        small because tasks moved to 0.01 USDC on 1 October, to match what the landing page promised.
      </figcaption>
    </figure>
  )
}

// Payouts per day, all of them. A day is labelled when it's a peak: ten or
// more, and more than the days beside it, so labels never crowd at phone width.
export function PerDay() {
  const peak = Math.max(...perDay)
  const labelled = (count, index) =>
    count >= 10 && count > (perDay[index - 1] ?? 0) && count > (perDay[index + 1] ?? 0)
  return (
    <figure className="cn-fig cn-panel">
      <p className="cn-micro">USDC payouts per day · Stellar testnet</p>
      <div
        className="cn-bars"
        role="img"
        aria-label="Payouts per day from 7 September to 3 October: a few a day in weeks one and two, 66 on 23 September, 43 on 25 September, and 17 and 28 on 1 and 2 October."
      >
        {perDay.map((count, index) => (
          <span key={index} style={{ '--h': count / peak }} data-empty={count === 0 || undefined}>
            {labelled(count, index) && <b>{count}</b>}
          </span>
        ))}
      </div>
      <ol className="cn-bars-weeks" aria-hidden="true">
        {gates.map((gate) => (
          <li key={gate.week}>Week {gate.week}</li>
        ))}
      </ol>
      <figcaption>
        The tall days are milestones: week three’s QA run (66 on 23 September), testers on instant payouts (25
        September), and the last gate and the booth (1 and 2 October).
      </figcaption>
    </figure>
  )
}

// The four failures caused on purpose.
export function Failures() {
  return (
    <figure className="cn-fig">
      <Stub className="cn-fig-stub">
        <p className="cn-micro">Failures, caused on purpose · 4 of 4 held</p>
        <ul className="cn-failures">
          {failures.map((failure) => (
            <li key={failure.what}>
              <span className="cn-failure-mark" aria-hidden="true">
                <Check size={12} strokeWidth={3} />
              </span>
              <span>
                <b>{failure.what}.</b> {failure.did}
              </span>
            </li>
          ))}
        </ul>
      </Stub>
    </figure>
  )
}

// Phones' share of page views, week by week.
export function Phones() {
  const share = [
    { week: 2, pct: 2 },
    { week: 3, pct: 46 },
    { week: 4, pct: 52 },
  ]
  return (
    <figure className="cn-fig cn-panel">
      <p className="cn-micro">Phones’ share of page views</p>
      <ul className="cn-phones">
        {share.map((row) => (
          <li key={row.week}>
            <span>Week {row.week}</span>
            <span className="cn-phones-bar" aria-hidden="true">
              <i style={{ '--w': row.pct / 100 }} />
            </span>
            <b>{row.pct}%</b>
          </li>
        ))}
      </ul>
      <figcaption>From the site’s analytics, which started on 15 September, so week one isn’t counted.</figcaption>
    </figure>
  )
}
