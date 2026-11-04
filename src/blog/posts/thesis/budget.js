/*
 * What training cost. Epoch times are means from nnU-Net's training logs in
 * the team's Colab notebooks: batch 12 from the multi-class run (epochs 157
 * to 164, Apr 27, 2026), batch 2 from full 1,000-epoch folds of the stone
 * (26.7 s) and cyst (28.3 s) models. Hours multiply those out over 1,000
 * epochs a fold, 5 folds a model and 4 models (the multi-class one and the
 * three single-class ones it was compared with). "At least 15" is the team's
 * own estimate of what batch 12 would have needed.
 */
export const budget = {
  plan: 'Colab Pro+',
  spent: 5,
  needed: 15,
  epochs: 1000,
  folds: 5,
  models: 4,
  batchesPerEpoch: 250,
  runs: [
    { batch: 12, note: 'Our first runs', epoch: 185, fold: 51, all: 1030 },
    { batch: 2, note: 'What we trained with', epoch: 27, fold: 7.6, all: 150 },
  ],
}
