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

export interface CallTime {
  firstStart: string;
  firstEnd: string;
  secondStart: string;
  secondEnd: string;
}

export const WEEKDAY_SCHEDULE: CallTime[] = [
  { firstStart: "09:00", firstEnd: "09:45", secondStart: "09:55", secondEnd: "10:40" },
  { firstStart: "10:50", firstEnd: "11:35", secondStart: "11:55", secondEnd: "12:40" },
  { firstStart: "13:00", firstEnd: "13:45", secondStart: "13:55", secondEnd: "14:40" },
  { firstStart: "14:50", firstEnd: "15:35", secondStart: "15:45", secondEnd: "16:30" },
  { firstStart: "16:40", firstEnd: "17:25", secondStart: "17:35", secondEnd: "18:20" },
  { firstStart: "18:30", firstEnd: "19:15", secondStart: "19:25", secondEnd: "20:10" }
];

export const SATURDAY_SCHEDULE: CallTime[] = [
  { firstStart: "09:00", firstEnd: "09:45", secondStart: "09:55", secondEnd: "10:40" },
  { firstStart: "10:50", firstEnd: "11:35", secondStart: "11:55", secondEnd: "12:40" },
  { firstStart: "12:50", firstEnd: "13:35", secondStart: "13:45", secondEnd: "14:30" },
  { firstStart: "14:40", firstEnd: "15:25", secondStart: "15:35", secondEnd: "16:20" },
  { firstStart: "16:30", firstEnd: "17:15", secondStart: "17:25", secondEnd: "18:10" },
  { firstStart: "18:20", firstEnd: "19:05", secondStart: "19:15", secondEnd: "20:00" }
];
