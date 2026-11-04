import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import BlogPage from '../../BlogPage'
import posthog from '../../../posthog'
import { formatDate } from '../../posts'
import { useChapterProgress } from '../../useChapterProgress'
import rank from '../../../assets/centient/rank.webp'
import rank800 from '../../../assets/centient/rank-800.webp'
import paid from '../../../assets/centient/paid.webp'
import paid800 from '../../../assets/centient/paid-800.webp'
import account from '../../../assets/centient/account.webp'
import account800 from '../../../assets/centient/account-800.webp'
import { centientPost } from './meta'
import { CHAPTERS } from './chapters'
import { links, sprint } from './ledger'
import { Row, Stub } from './Stub'
import LineItems from './LineItems'
import {
  Balances,
  Failures,
  PayoutStub,
  PerDay,
  Phones,
  Screen,
  SignInStub,
  SprintLedger,
  Weeks,
} from './Figures'
import './centient-tokens.css'
import './centient.css'

const IDS = CHAPTERS.map((chapter) => chapter.id)

// A chapter opens on its line number and, for a deliverable, its week.
function Chapter({ chapter, meta, children }) {
  const index = CHAPTERS.indexOf(chapter)
  return (
    <section id={chapter.id} className="cn-chapter" aria-labelledby={`${chapter.id}-title`}>
      <p className="cn-chapter-n" aria-hidden="true">
        Line {String(index + 1).padStart(2, '0')}
        {meta && <span> · {meta}</span>}
      </p>
      <h2 id={`${chapter.id}-title`} className="cn-chapter-title">
        {chapter.title}
      </h2>
      <div className="cn-prose">{children}</div>
    </section>
  )
}

// The sprint's receipt, printed once as the page opens.
function SprintReceipt() {
  return (
    <Stub className="cn-receipt">
      <p className="cn-micro">Sprint receipt · 7 Sep – 3 Oct 2026</p>
      <p className="cn-amount cn-receipt-amount">
        {sprint.usdc}
        <small>USDC</small>
      </p>
      <p className="cn-micro">Paid on testnet to {sprint.wallets} wallets</p>
      <hr className="cn-dash" />
      <dl className="cn-rows">
        <Row name="Deliverables">4 of 4</Row>
        <Row name="Payouts">{sprint.payouts}</Row>
        <Row name="Signatures on each">2 of 3</Row>
        <Row name="XLM a labeler needs">0</Row>
        <Row name="Unreconciled">0</Row>
      </dl>
      <hr className="cn-dash" />
      <dl className="cn-rows">
        <Row name="Status" tone="ok">
          QA passed
        </Row>
      </dl>
    </Stub>
  )
}

export default function CentientPost() {
  const progress = useChapterProgress(IDS)
  const [grant, keys, noXlm, noWithdraw, inPublic, phones, tryIt] = CHAPTERS

  const open = (event, source) => () =>
    posthog.capture(event, { project_slug: 'centient', source })

  return (
    <BlogPage>
      <article className="cn-post">
        <header className="cn-hero">
          <div className="cn-hero-inner">
            <div className="cn-hero-copy">
              <a href="/blog/" className="cn-back">
                <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
                All posts
              </a>
              <h1 className="cn-title">{centientPost.title}</h1>
              <p className="cn-dek">{centientPost.dek}</p>
              <p className="cn-byline">
                <b>Carl Macabales</b>
                <span className="cn-nowrap">
                  <time dateTime={centientPost.date}>{formatDate(centientPost.date)}</time> ·{' '}
                  {centientPost.readMinutes} min read
                </span>
              </p>
            </div>
            <SprintReceipt />
          </div>
        </header>

        <div className="cn-body">
          <LineItems chapters={CHAPTERS} progress={progress} variant="rail" />
          <LineItems chapters={CHAPTERS} progress={progress} variant="strip" />

          <div className="cn-column">
            <Chapter chapter={grant}>
              <p>
                Centient pays people to teach AI what “better” looks like. A task shows a question someone asked an
                AI and two answers to it. You pick the better one and say why in a sentence. Teams training models
                need thousands of those choices, and the people making them are often somewhere a bank transfer for
                a few cents makes no sense. So Centient pays in USDC on Stellar: dollars that settle in seconds, for
                a fraction of a cent.
              </p>
              <Screen
                src={rank}
                srcSet={`${rank800} 800w, ${rank} 1600w`}
                alt="A Centient task: the prompt “Who wrote the play ‘Romeo and Juliet’?”, two responses with A selected, a reason typed underneath, and a Submit & Get Paid button"
                caption="The task: one prompt, two answers, one reason."
              />
              <p>
                By September the labeling app worked, and its quality checks and reconciler were already live on
                Stellar testnet. What it didn’t have was a payout rail I’d trust with money. The Stellar Instawards
                program’s Philippines chapter, led by Nelson Lumbres, funded that part with a $5,000 grant: thirty
                days of full-time solo work, and four deliverables written into a statement of work before I started.
              </p>
              <p>
                Every week ran the same way. Build Monday to Wednesday, one issue at a time. Freeze a build. Hand it
                to QA for a manual gate, and only then promote it. A gate never passes on code I’m still changing: it
                passes on one commit, and the approval is a comment with that commit’s hash.
              </p>
              <SprintLedger />
            </Chapter>

            <Chapter chapter={keys} meta="Week 1">
              <p>
                The first week built the part a labeler never sees: the rail that sends the money. A payout system
                has one job it must never get wrong, which is to pay the right person the right amount, once. The
                easiest way to break that is one key that can pay anyone.
              </p>
              <p>
                So no single key can. Centient’s payout account needs two signatures from three keys, and Stellar
                itself enforces that, not my code. The payout worker adds the first signature. The second comes from
                a co-signer: a separate service, deployed on its own, that can read the task ledger but not change
                it. Before it signs, it works the payout out again from scratch (the task, the amount, the wallet,
                the day’s cap) and refuses if anything doesn’t match.
              </p>
              <PayoutStub />
              <p>
                Centient also pays the network fee on every payout, by wrapping it in a fee-bump, so the labeler gets
                the full amount. A cold reserve, which needs two of its own three keys, tops up the payout account
                only through transfers signed by two of those keys.
              </p>
              <p>
                QA found one real problem that week, and it wasn’t in the code: the deployment kept two signing keys
                on one service, which is one point of failure with extra steps. The fix makes the payout service
                refuse any deployment that holds enough keys to pay alone, and CI fails the build if any code path
                could send a payout with fewer than two signatures. The gate re-ran and passed 28 of 28.
              </p>
            </Chapter>

            <Chapter chapter={noXlm} meta="Week 2">
              <p>
                Most people who’d do these tasks have never held crypto. Two things usually stop them before the
                first one: an account to sign up for, and the rule that a new Stellar account must hold some XLM,
                Stellar’s own currency, before it can receive anything.
              </p>
              <p>
                The second week removed both. There’s no email and no password. You connect Freighter, a Stellar
                wallet, and sign a one-time challenge that proves the wallet is yours. It expires, works once and is
                tied to that address, so it can’t be replayed. The wallet is the account, and the only place Centient
                will ever pay.
              </p>
              <SignInStub />
              <p>
                On first connect, Centient covers the reserves itself. It sponsors the new account and its USDC
                trustline, the opt-in a Stellar wallet needs before it can hold USDC, so the labeler signs once and
                spends nothing. Over the sprint, {sprint.onboarded} wallets were set up this way, and{' '}
                {sprint.newAtZero} of them were brand-new accounts that started with 0 XLM. Centient keeps a record of
                every reserve it sponsors, with an audited way to reclaim them.
              </p>
            </Chapter>

            <Chapter chapter={noWithdraw} meta="Week 3">
              <p>
                Until week three, Centient paid the way most apps do. Each accepted answer added to a balance, and
                once the balance passed 1 USDC you could withdraw it in one payment. In week two, the task reward went
                up to 0.25 USDC just so testers could reach that minimum.
              </p>
              <p>
                Testers also told us it felt too good to be true. Five of the seven that week doubted they’d be paid
                at all, until they saw the money arrive. A balance is a promise. A payment is proof.
              </p>
              <p>
                So week three made every accepted answer its own payment. When an answer passes the checks, its
                payout goes straight to the wallet, co-signed and fee-bumped like any other. There’s no balance to
                watch and no withdrawal step. Each payout is written to a journal under its own key before it’s sent,
                so a retry finds the first attempt instead of paying twice.
              </p>
              <Screen
                src={paid}
                srcSet={`${paid800} 800w, ${paid} 1600w`}
                alt="Centient’s success screen after an answer: a green check and “+0.25 USDC on its way”, with a Next Task button"
                caption="After an accepted answer, the payout is already on its way to the wallet."
              />
              <p>That left the old balances. On 21 September there were ten.</p>
              <Balances />
              <p>
                Nothing would add to them again, so keeping the minimum would have stranded eight of the ten. The
                minimum went too. The old withdraw card now appears only for someone who still has a balance, and it
                pays out all of it. For everyone else, the Withdraw button is gone.
              </p>
              <Screen
                src={account}
                srcSet={`${account800} 800w, ${account} 1600w`}
                alt="Centient’s account sheet: total earned 0.5 USDC over 2 submissions, a View on explorer button, and two recent submissions marked Confirmed at +0.25 USDC each, with no withdraw button"
                caption="The account sheet: what you’ve earned and each payout’s status, with nothing left to withdraw."
              />
              <p>
                The gate passed a day early, on 24 September, and a reconcile run over the QA window matched all 70
                payouts to the ledger. One tester that week: “Instant payouts straight to the wallet are a big
                improvement.”
              </p>
              <Weeks />
            </Chapter>

            <Chapter chapter={inPublic} meta="Week 4">
              <p>
                The last week was about showing the rail holds up when things go wrong, to people who can check.
                First, four failures, caused on purpose.
              </p>
              <Failures />
              <p>
                The suite earned its keep: it caught a real bug, a fee-bump built on a stale sequence number, fixed
                before the gate.
              </p>
              <p>
                Then volume. The statement of work asked for at least 100 reconciled payouts to at least 25 wallets.
                The proof run reconciled 122 payouts to 25 wallets, with none missing and none paid twice. Over the
                whole sprint, the payout account sent {sprint.payouts} payouts to {sprint.wallets} wallets, every one
                signed by two keys, fee-bumped and successful on the ledger.
              </p>
              <PerDay />
              <p>
                Anyone can check, because every payout is a public transaction on Stellar testnet. The build went
                public too, with its runbooks, the payout API docs and a docs site, and the live app shows which
                commit it’s running. The last gate passed on 3 October, day 27 of 30.
              </p>
            </Chapter>

            <Chapter chapter={phones}>
              <p>
                Week two’s testers were all on laptops, because Freighter couldn’t sign in from a phone yet. Week
                three connected Freighter Mobile over WalletConnect, and phones went from 2% of page views to over
                half by week four.
              </p>
              <Phones />
              <p>
                In week four, a walk-up booth put it to the test. Twelve people who’d never used Centient connected a
                wallet on their own phones, ranked answers and were paid. All twelve finished, and seven said there
                was no step where they’d have given up.
              </p>
              <p>
                What changed most over the month was trust, and it wasn’t anything we said that changed it. It was
                the payment arriving. As a week three tester put it: “I could see the payments arriving in the wallet
                in real time.” Of the 28 testers who left full evidence over three weeks, none reported a missing
                payment, and every payout a tester claimed is on the ledger.
              </p>
            </Chapter>

            <Chapter chapter={tryIt}>
              <p>
                Centient is live on Stellar testnet. Connect Freighter set to Test Net, rank a few answers, and each
                accepted one pays your wallet. Mainnet was left out of this sprint on purpose, and the payout service
                still refuses to sign there.
              </p>
            </Chapter>

            <aside className="cn-end" aria-labelledby="cn-end-title">
              <Stub>
                <p className="cn-micro">Centient · Train AI, cent by cent.</p>
                <h2 id="cn-end-title" className="cn-end-title">
                  Built in {sprint.days} days for a ${sprint.grant.toLocaleString('en-US')} Stellar Instawards grant.
                </h2>
                <dl className="cn-rows">
                  <Row name="Commits">{sprint.commits}</Row>
                  <Row name="Automated tests">about {sprint.tests.toLocaleString('en-US')}</Row>
                  <Row name="Green CI runs">{sprint.ciRuns}</Row>
                </dl>
                <div className="cn-end-links">
                  <a
                    href={links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn cn-btn"
                    onClick={open('project_demo_opened', 'blog')}
                  >
                    Try the beta
                    <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                  <a
                    href={links.code}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn cn-btn cn-btn-quiet"
                    onClick={open('project_code_opened', 'blog')}
                  >
                    Code on GitHub
                    <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                </div>
                <p className="cn-end-note">Everything here ran on Stellar testnet. Test USDC has no cash value.</p>
              </Stub>
            </aside>
          </div>
        </div>
      </article>
    </BlogPage>
  )
}
