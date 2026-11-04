/*
 * The thesis: its tile and story on the home, and its post on the blog
 * (src/blog/posts/thesis). Every figure comes from the final manuscript
 * (THESIS_AMM_vR18, June 2026) or the public repo, nnunetv2_3DKidney. Dice is
 * the mean over 5-fold cross-validation. Classes always run stone, cyst,
 * tumor: the order whose neighboring colors passed the palette check.
 */
export const thesis = {
  headline: 'One 3D model for kidney cysts, stones, and tumors',
  title:
    'A Clinical-Oriented AI Framework for Multi-Class Kidney Abnormality Detection and Segmentation',
  meta: 'BS Computer Science thesis · Mapúa University · 2026',
  summary:
    'We trained nnU-Net v2 on 290 CT scans to outline the kidney and all three abnormalities at once, then tested it against three models that each learn only one. Training them together raised the Dice score for every abnormality.',
  authors: ['Carl Emmanuel M. Macabales', 'Yñikko Arzee Neo D. Aguas', 'Robin Jairic T. Macatangay'],
  adviser: 'Dr. Lysa V. Comia',
  links: {
    code: 'https://github.com/cemmacabales/nnunetv2_3DKidney',
    demo: 'https://drive.google.com/file/d/1uWdfFnwQ7WdANk_sAqBJlz6SmNzQaGIk/view',
  },
  // The slice on the tile: the deployed app's output for case multi_016.
  scan: {
    slice: 29,
    of: 94,
    alt: 'Axial CT slice through the abdomen at the level of both kidneys. The model outlines both kidneys and a small tumor at the lower edge of one.',
  },
  kidney: 0.955,
  results: [
    {
      id: 'stone',
      name: 'Stone',
      alone: 0,
      together: 0.512,
      story: 'Alone, the model kept no stones at all. Together, 84% of the stones it flags are real.',
    },
    {
      id: 'cyst',
      name: 'Cyst',
      alone: 0.222,
      together: 0.501,
      story: 'Alone, it marked the bladder and gallbladder as kidney cysts. With the kidney beside it, cyst precision rose from 0.27 to 0.71.',
    },
    {
      id: 'tumor',
      name: 'Tumor',
      alone: 0.613,
      together: 0.763,
      story: 'It finds 89% of tumors, and 86% of what it marks as tumor is one.',
    },
  ],
  // Per-case paired Wilcoxon signed-rank tests, one-tailed, over scans where the class is present.
  significance: [
    { id: 'stone', p: ['5.6', '−12'], n: 75 },
    { id: 'cyst', p: ['6.9', '−22'], n: 170 },
    { id: 'tumor', p: ['6.2', '−15'], n: 165 },
  ],
  dataset: [
    { id: 'stone', label: 'Stones only', n: 74 },
    { id: 'cyst', label: 'Cysts only', n: 50 },
    { id: 'tumor', label: 'Tumors only', n: 45 },
    { id: 'multi', label: 'More than one', n: 121 },
  ],
  // Stone detection by fold (pseudo-Dice in nnU-Net's training log). Alone:
  // first seen, peak, and the epoch it fell back to zero for good. Together:
  // first seen, then held through epoch 1,000.
  stones: {
    alone: [
      { fold: 0, first: 1, peak: 19, best: 0.356, gone: 25 },
      { fold: 1, first: 8, peak: 30, best: 0.505, gone: 34 },
      { fold: 2, first: 10, peak: 26, best: 0.542, gone: 39 },
      { fold: 3, first: 11, peak: 33, best: 0.479, gone: 34 },
      { fold: 4, first: 7, peak: 28, best: 0.184, gone: 32 },
    ],
    together: [
      { fold: 0, first: 70 },
      { fold: 1, first: 51 },
      { fold: 2, first: 50 },
      { fold: 3, first: 350 },
      { fold: 4, first: 26 },
    ],
  },
  // Seconds per CT volume on the A100, CUDA-event timed (Table 19).
  latency: { alone: 12.61, perPass: 4.2, together: 4.81 },
  specs: [
    {
      label: 'Data',
      value: '290 CT volumes from KiTS23, MSWAL, and extra stone and cyst cases. DICOM converted with dcm2niix; labels drawn and checked in 3D Slicer, supervised by a radiologist.',
    },
    { label: 'Preprocessing', value: 'HU clipped to −135 to 215, resampled to 1 mm voxels, z-score normalized.' },
    { label: 'Model', value: 'nnU-Net v2, 3D full resolution: a six-stage U-Net (32 to 320 channels) with deep supervision.' },
    {
      label: 'Training',
      value: '128 × 128 × 128 patches, 1,000 epochs of 250 iterations, SGD with Nesterov momentum 0.99, Dice plus cross-entropy loss.',
    },
    { label: 'Validation', value: '5-fold cross-validation, so every scan is tested exactly once.' },
    { label: 'Hardware', value: 'One NVIDIA A100 (40 GB) on Google Colab Pro+.' },
    { label: 'Metrics', value: 'Dice, IoU, HD95, precision, recall, F1, and paired Wilcoxon signed-rank tests.' },
    { label: 'Deployment', value: 'A Gradio app with axial, coronal, and sagittal views and a 3D surface.' },
  ],
}
