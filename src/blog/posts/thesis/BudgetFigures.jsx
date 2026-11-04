import { budget } from './budget'

const fmt = (n) => n.toLocaleString('en-US')

// One card per Colab Pro+ subscription: the ones we paid for, then the
// outlined rest of what the first plan would have needed.
export function Subscriptions() {
  return (
    <figure className="lb-subs">
      <ol className="lb-subs-cards" aria-hidden="true">
        {Array.from({ length: budget.needed }, (_, index) => (
          <li key={index} className={index < budget.spent ? 'is-paid' : undefined} />
        ))}
      </ol>
      <div className="lb-subs-legend">
        <p>
          <b>{budget.spent}</b> subscriptions we paid for
        </p>
        <p>
          <b>{budget.needed}+</b> what batch 12 would have needed
        </p>
      </div>
      <figcaption>
        Each card is one {budget.plan} subscription. The filled ones trained all four models; the outlined ones
        are the rest of what our first settings would have cost.
      </figcaption>
    </figure>
  )
}

// The two batch sizes, side by side: an epoch, a fold, and every fold of
// every model.
export function Race() {
  const slow = budget.runs[0].epoch
  return (
    <figure className="lb-race">
      <table>
        <caption className="visually-hidden">Training time at batch 12 and batch 2</caption>
        <thead>
          <tr>
            <th scope="col">Batch size</th>
            <th scope="col">An epoch</th>
            <th scope="col">One fold</th>
            <th scope="col">All {budget.folds * budget.models} folds</th>
          </tr>
        </thead>
        <tbody>
          {budget.runs.map((run) => (
            <tr key={run.batch} data-batch={run.batch}>
              <th scope="row">
                {run.batch}
                <small>{run.note}</small>
              </th>
              <td>
                <span className="lb-race-bar" aria-hidden="true">
                  <i style={{ width: `${(run.epoch / slow) * 100}%` }} />
                </span>
                <b>~{run.epoch} s</b>
              </td>
              <td>
                <b>~{run.fold} h</b>
              </td>
              <td>
                <b>~{fmt(run.all)} h</b>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption>
        {fmt(budget.epochs)} epochs a fold, {budget.folds} folds a model, {budget.models} models, on one A100. Times
        from nnU-Net’s own training logs.
      </figcaption>
    </figure>
  )
}

// Why the smaller batch is faster: an nnU-Net epoch is a fixed number of
// batches, so each patch in a batch is more work in every epoch.
const COLUMNS = 25

export function Epochs() {
  return (
    <figure className="lb-epochs">
      <div className="lb-epochs-pair">
        {budget.runs.map((run) => (
          <div key={run.batch} className="lb-epoch" data-batch={run.batch}>
            <p className="lb-epoch-title">One epoch at batch {run.batch}</p>
            <p className="lb-epoch-sum">
              {budget.batchesPerEpoch} batches × {run.batch} patches = {fmt(budget.batchesPerEpoch * run.batch)} patches
            </p>
            <div className="lb-epoch-grid" aria-hidden="true">
              {Array.from({ length: COLUMNS }, (_, column) => (
                <span key={column}>
                  {Array.from({ length: run.batch }, (_, row) => (
                    <i key={row} />
                  ))}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <figcaption>
        Each column stands for {budget.batchesPerEpoch / COLUMNS} batches, each mark for one 128³ patch. Both epochs
        are {budget.batchesPerEpoch} batches long; only the work inside each one changes.
      </figcaption>
    </figure>
  )
}
