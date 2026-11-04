import cyst048 from '../../../assets/blog/thesis/case-cyst-048.webp'
import cyst048Small from '../../../assets/blog/thesis/case-cyst-048-720.webp'
import multi106 from '../../../assets/blog/thesis/case-multi-106.webp'
import multi106Small from '../../../assets/blog/thesis/case-multi-106-720.webp'
import multi118 from '../../../assets/blog/thesis/case-multi-118.webp'
import multi118Small from '../../../assets/blog/thesis/case-multi-118-720.webp'

/*
 * Three of the cases the radiologists reviewed in May 2026, as they saw them:
 * the thesis's own renders (raw slice left, prediction right; kidney blue,
 * cyst green, tumor red), from figures/10-CASES in the public repo. Scores
 * are the model's own Dice, printed on each figure. The reads are quoted from
 * the signed evaluation forms: Dr. Paragas's (Mapúa School of Medicine) and
 * Dr. Meriño's, supervised by Dr. Bringas (Veterans Memorial Medical Center).
 */
export const CASES = [
  {
    id: 'cyst_048',
    label: 'Cyst',
    src: cyst048,
    srcSet: `${cyst048Small} 720w, ${cyst048} 1175w`,
    alt: 'Two copies of an axial CT slice. On the right, the model colors both kidneys blue and a small cyst on the left kidney green.',
    slice: 'Axial · slice 86 of 177',
    scores: [
      ['Kidney', '0.973'],
      ['Cyst', '0.901'],
    ],
    reads: [
      { who: 'Dr. Paragas', said: 'The AI has outlined the cyst perfectly. Agree with the score.' },
      { who: 'VMMC', said: 'Good and appropriate detection of AI.' },
    ],
    verdict: 'Both agree',
  },
  {
    id: 'multi_106',
    label: 'Cysts and a tumor',
    src: multi106,
    srcSet: `${multi106Small} 720w, ${multi106} 1175w`,
    alt: 'Two copies of an axial CT slice. On the right, the model colors both kidneys blue, with green and red marks for cysts and tumor around them.',
    slice: 'Axial · slice 85 of 325',
    scores: [
      ['Kidney', '0.896'],
      ['Cyst', '0.358'],
      ['Tumor', '0.015'],
    ],
    reads: [
      {
        who: 'Dr. Paragas',
        said: 'All the highlighted areas in both kidneys are cysts and not tumors. Agree with the poor scores.',
      },
      {
        who: 'VMMC',
        said: 'Good detection of lesions but bad identification which is reflected by the confidence of AI.',
      },
    ],
    verdict: 'A low score that was honest',
  },
  {
    id: 'multi_118',
    label: 'A cyst and a tumor',
    src: multi118,
    srcSet: `${multi118Small} 720w, ${multi118} 1175w`,
    alt: 'Two copies of an axial CT slice. On the right, the model colors both kidneys blue and a large mass on the left kidney red, as tumor.',
    slice: 'Axial · slice 137 of 253',
    scores: [
      ['Kidney', '0.984'],
      ['Cyst', '0.872'],
      ['Tumor', '0.946'],
    ],
    reads: [
      { who: 'Dr. Paragas', said: 'The AI has outlined the cyst and tumor perfectly. Agree with the score.' },
      {
        who: 'VMMC',
        said: 'Was good in detection but confidence for identifying as tumor is high; should be ‘failed.’',
      },
    ],
    verdict: 'The reviewers split',
  },
]
