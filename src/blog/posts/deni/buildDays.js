// Commits a day in ~/meditrack from the first one to 1.1 being ready
// (`git log --format=%ad --date=short | sort | uniq -c`, Nov 2, 2026).
// Days with none are left out.
export const commitsByDay = {
  '2026-10-03': 1,
  '2026-10-04': 13,
  '2026-10-05': 6,
  '2026-10-06': 6,
  '2026-10-09': 8,
  '2026-10-10': 1,
  '2026-10-11': 5,
  '2026-10-28': 1,
  '2026-10-29': 4,
  '2026-11-02': 2,
}

export const FIRST_DAY = '2026-10-03'
export const LAST_DAY = '2026-11-02'

export const milestones = {
  '2026-10-03': 'Prototype',
  '2026-10-11': 'TestFlight',
  '2026-10-28': 'App Store',
}
