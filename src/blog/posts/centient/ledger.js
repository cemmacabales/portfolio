/*
 * The sprint's numbers. Sources: the Instawards Sprint Deliverable Report and
 * Sprint Analytics Report (both prepared 3 Oct 2026), ADR-0007 in the repo,
 * and the payout account's USDC payments on Stellar testnet, re-read from
 * Horizon (GCP34R…4BUO, payments to Centient's own accounts left out). The
 * chain matches the reports: 225 payouts, 114.85 USDC, 61 wallets.
 */
export const sprint = {
  grant: 5000,
  days: 30,
  start: '7 Sep',
  end: '3 Oct',
  payouts: 225,
  usdc: 114.85,
  wallets: 61,
  onboarded: 105,
  newAtZero: 72,
  commits: 332,
  tests: 1730,
  ciRuns: 620,
}

// One line per deliverable: its week, and its QA gate on a frozen build and
// the day that gate passed.
export const gates = [
  { week: 1, dates: '7–13 Sep', name: 'Reward rail', passed: 28, cases: 28, on: '14 Sep' },
  { week: 2, dates: '14–20 Sep', name: 'Wallet sign-in', passed: 38, cases: 40, on: '21 Sep' },
  { week: 3, dates: '21–27 Sep', name: 'Pay per answer', passed: 65, cases: 68, on: '24 Sep' },
  { week: 4, dates: '28 Sep–3 Oct', name: 'Reconcile and release', passed: 35, cases: 36, on: '3 Oct' },
]

// USDC payouts per day (UTC), 7 Sep to 3 Oct.
export const perDay = [0, 2, 0, 1, 10, 0, 0, 0, 2, 15, 7, 8, 2, 0, 3, 1, 66, 14, 43, 0, 0, 0, 0, 2, 17, 28, 4]

export const weeks = [
  { week: 1, payouts: 13, usdc: 22.01, wallets: 3, how: 'Earn, then withdraw' },
  { week: 2, payouts: 34, usdc: 49.81, wallets: 14, how: 'Withdraw at 1 USDC' },
  { week: 3, payouts: 127, usdc: 37.7, wallets: 28, how: '0.25 for each answer' },
  { week: 4, payouts: 51, usdc: 5.33, wallets: 24, how: '0.01 for each answer' },
]

// ADR-0007, read from production on 21 Sep: the balances still waiting to be
// withdrawn when every answer started paying on its own.
export const balances = { holders: 10, under: 8, underUsdc: 1.6, minimum: 1 }

// One real instant payout, as Horizon records it.
export const payout = {
  when: '25 Sep 2026 · 06:03 UTC',
  amount: '0.25',
  to: 'GAGK…5ET3',
  hash: 'd4d6c69724c27eb11e82e28d14bd1c5e2a9a14c8ab394e964790abb96170a201',
}

// The four failures Week 4 caused on purpose, and what the rail did.
export const failures = [
  { what: 'Two payouts race for one sequence number', did: 'One lands, the other retries. Nobody is paid twice.' },
  { what: 'The co-signer goes down', did: 'Payouts wait, an alert goes out, and they resume when it’s back.' },
  { what: 'The daily cap is passed by one unit', did: 'Both signers refuse it.' },
  { what: 'Horizon times out mid-payment', did: 'Settled only from proof on the ledger, never by guessing.' },
]

export const links = {
  demo: 'https://beta.centient.work',
  code: 'https://github.com/cemmacabales/centient',
  explorer: 'https://stellar.expert/explorer/testnet/tx/',
}
