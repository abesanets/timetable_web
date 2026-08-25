import type { Schedule, Lesson, Subgroup, DaySchedule, BuildingId } from '../data/models';
import { getCallSchedule } from './buildingUtils';

export function isPhysicalEducation(subject: string): boolean {
  const s = subject.toLowerCase();
  return (s.includes('физ') && (s.includes('культ') || s.includes('к-ра'))) ||
         s === 'фзк' ||
         s.includes('фзкиз');
}

export function filterScheduleBySubgroup(schedule: Schedule, subgroupNumber: number): Schedule {
  if (subgroupNumber === 0) return schedule;

  return {
    ...schedule,
    days: schedule.days.map(day => {
      const filteredLessons = day.lessons.map(lesson => {
        const filteredSubgroups = lesson.subgroups.filter(subgroup => {
          return isPhysicalEducation(subgroup.subject) || subgroup.number == null || subgroup.number === subgroupNumber;
        });

        const hasActualContent = filteredSubgroups.some(subgroup => {
          return subgroup.subject !== '-' && subgroup.subject !== '—' && subgroup.subject.trim().length > 0;
        });

        if (!hasActualContent) return null;
        return {
          ...lesson,
          subgroups: filteredSubgroups
        };
      }).filter((l): l is Lesson => l !== null);

      return {
        ...day,
        lessons: filteredLessons
      };
    })
  };
}

export function shouldShowAllSubgroupsInDetails(
  lesson: Lesson,
  selectedSubgroup: number,
  showOtherSubgroupInDetails: boolean
): boolean {
  if (!showOtherSubgroupInDetails || selectedSubgroup === 0) return false;

  const numberedSubgroups = lesson.subgroups.filter(sg => sg.number != null);
  if (numberedSubgroups.length < 2) return false;
  if (numberedSubgroups.some(sg => isPhysicalEducation(sg.subject))) return false;

  const hasActualContent = (sg: Subgroup) => {
    return sg.subject !== '-' && sg.subject !== '—' && sg.subject.trim().length > 0;
  };

  const hasSelectedSubgroup = numberedSubgroups.some(sg => sg.number === selectedSubgroup && hasActualContent(sg));
  const hasOtherSubgroup = numberedSubgroups.some(sg => sg.number !== selectedSubgroup && hasActualContent(sg));

  return hasSelectedSubgroup && hasOtherSubgroup;
}

export function extractDate(dayDate: string): string {
  const dateRegex = /\d{2}\.\d{2}\.\d{4}/;
  const match = dateRegex.exec(dayDate);
  if (match) return match[0];
  const commaIdx = dayDate.indexOf(',');
  return commaIdx !== -1 ? dayDate.substring(commaIdx + 1).trim() : dayDate.trim();
}

export function parseDate(dateStr: string): Date | null {
  const parts = dateStr.split('.');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed month
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  return new Date(year, month, day);
}

export function areClassesFinishedForToday(day: DaySchedule, building: BuildingId = 'kazintsa'): boolean {
  if (day.lessons.length === 0) return true;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const schedule = getCallSchedule(building);

  // Find last lesson number
  let maxLessonNum = 0;
  for (const lesson of day.lessons) {
    const num = parseInt(lesson.lessonNumber, 10);
    if (!isNaN(num) && num > maxLessonNum) {
      maxLessonNum = num;
    }
  }

  const lastCall = schedule.find(c => c.pairNumber === maxLessonNum);
  if (!lastCall) return true;

  const endTime = lastCall.secondEnd || lastCall.firstEnd;
  const endParts = endTime.split(':');
  const endMinutes = parseInt(endParts[0], 10) * 60 + parseInt(endParts[1], 10);

  return currentMinutes >= (endMinutes + 5);
}

export function findTodayIndex(days: DaySchedule[], building: BuildingId = 'kazintsa'): number {
  if (days.length === 0) return -1;

  const now = new Date();
  const todayString = now.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const todayIndex = days.findIndex(day => extractDate(day.dayDate) === todayString);

  if (todayIndex >= 0) {
    const todaySchedule = days[todayIndex];
    if (areClassesFinishedForToday(todaySchedule, building)) {
      // Find next day in the list that has lessons
      for (let i = todayIndex + 1; i < days.length; i++) {
        if (days[i].lessons.length > 0) {
          return i;
        }
      }
      return todayIndex;
    }
    return todayIndex;
  }

  // Find nearest future day
  const currentDateMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  let nearestFutureIndex = -1;
  let nearestFutureTime = Infinity;

  for (let i = 0; i < days.length; i++) {
    const dateStr = extractDate(days[i].dayDate);
    const dayDate = parseDate(dateStr);
    if (dayDate) {
      const dayTime = dayDate.getTime();
      if (dayTime > currentDateMs && days[i].lessons.length > 0) {
        if (dayTime < nearestFutureTime) {
          nearestFutureTime = dayTime;
          nearestFutureIndex = i;
        }
      }
    }
  }

  if (nearestFutureIndex >= 0) {
    return nearestFutureIndex;
  }

  const firstWithLessons = days.findIndex(d => d.lessons.length > 0);
  return firstWithLessons >= 0 ? firstWithLessons : 0;
}

export function isShowingNextDay(days: DaySchedule[], displayIndex: number): boolean {
  if (displayIndex < 0 || displayIndex >= days.length) return false;

  const now = new Date();
  const todayString = now.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const todayIndex = days.findIndex(day => extractDate(day.dayDate) === todayString);

  if (todayIndex >= 0 && displayIndex > todayIndex) {
    return true;
  }

  if (todayIndex < 0 && days[displayIndex]) {
    const displayDateStr = extractDate(days[displayIndex].dayDate);
    const displayDate = parseDate(displayDateStr);
    const currentDateMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    if (displayDate && displayDate.getTime() > currentDateMs) {
      return true;
    }
  }

  return false;
}
