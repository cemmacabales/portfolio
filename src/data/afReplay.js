/*
 * One real run of the AF Guideline Assistant (the Llama 3 Space,
 * huggingface.co/spaces/johnnydang88/Llama3), replayed step by step in its
 * work row. Every setting below is read from the Space's app.py; the source
 * pages and the answer are what it returned for this question. Nothing here
 * runs a model.
 */
export const afReplay = {
  question: 'What are the four essential treatment pillars of the AF-CARE framework?',
  // The Space's multi-query expansion for anything mentioning AF-CARE.
  expansions: [
    'AF-CARE framework atrial fibrillation treatment pillars',
    'AF-CARE acronym components',
    'comorbidity risk factor stroke rhythm rate AF management',
  ],
  perSearch: 10,
  chunkChars: 1024,
  kept: 8,
  // Pages of the 8 reranked chunks, in rank order (the Space's "Source Pages").
  pages: [19, 69, 3, 21, 20, 9],
  cited: 20,
  answerIntro: 'According to the provided context, the four essential treatment pillars of the AF-CARE framework are:',
  pillars: [
    ['C', 'Comorbidity and risk factor management'],
    ['A', 'Avoid stroke and thromboembolism'],
    ['R', 'Reduce symptoms by rate and rhythm control'],
    ['E', 'Evaluation and dynamic reassessment'],
  ],
  answerOutro: 'These pillars are mentioned in the central illustration (Figure 3) on page 20.',
}
