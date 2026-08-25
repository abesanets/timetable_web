export interface Subgroup {
  subject: string;
  room: string;
  number?: number | null;
}

export interface Lesson {
  lessonNumber: string;
  subgroups: Subgroup[];
}

export interface DaySchedule {
  dayDate: string;
  lessons: Lesson[];
}

export interface Schedule {
  group: string;
  days: DaySchedule[];
}

export type BuildingId = 'kazintsa' | 'knorina';

export interface CallTime {
  pairNumber: number;
  shift?: 1 | 2;
  firstStart: string;
  firstEnd: string;
  secondStart: string;
  secondEnd: string;
  isSolid?: boolean;
}

export const KAZINTSA_CALLS: CallTime[] = [
  { pairNumber: 1, shift: 1, firstStart: '08:00', firstEnd: '08:45', secondStart: '08:55', secondEnd: '09:40' },
  { pairNumber: 2, shift: 1, firstStart: '09:50', firstEnd: '10:35', secondStart: '10:45', secondEnd: '11:30' },
  { pairNumber: 3, shift: 1, firstStart: '11:50', firstEnd: '12:35', secondStart: '12:45', secondEnd: '13:30' },
  { pairNumber: 4, shift: 2, firstStart: '13:40', firstEnd: '14:25', secondStart: '14:35', secondEnd: '15:20' },
  { pairNumber: 5, shift: 2, firstStart: '15:40', firstEnd: '17:10', secondStart: '15:40', secondEnd: '17:10', isSolid: true },
  { pairNumber: 6, shift: 2, firstStart: '17:20', firstEnd: '18:50', secondStart: '17:20', secondEnd: '18:50', isSolid: true },
  { pairNumber: 7, shift: 2, firstStart: '19:00', firstEnd: '20:30', secondStart: '19:00', secondEnd: '20:30', isSolid: true }
];

export const KNORINA_CALLS: CallTime[] = [
  { pairNumber: 1, firstStart: '09:00', firstEnd: '09:45', secondStart: '09:55', secondEnd: '10:40' },
  { pairNumber: 2, firstStart: '10:50', firstEnd: '11:35', secondStart: '11:55', secondEnd: '12:40' },
  { pairNumber: 3, firstStart: '13:00', firstEnd: '13:45', secondStart: '13:55', secondEnd: '14:40' },
  { pairNumber: 4, firstStart: '14:50', firstEnd: '15:35', secondStart: '15:45', secondEnd: '16:30' },
  { pairNumber: 5, firstStart: '16:40', firstEnd: '17:25', secondStart: '17:35', secondEnd: '18:20' },
  { pairNumber: 6, firstStart: '18:30', firstEnd: '19:15', secondStart: '19:25', secondEnd: '20:10' }
];

export const WEEKDAY_SCHEDULE = KNORINA_CALLS;
export const SATURDAY_SCHEDULE = KNORINA_CALLS;
