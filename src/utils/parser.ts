import type { Schedule, DaySchedule, Subgroup } from '../data/models';

export class GroupNotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GroupNotFoundException';
  }
}

export class TeacherNotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TeacherNotFoundException';
  }
}

// Utility to find elements containing own text (direct text nodes check)
function getElementsContainingOwnText(doc: Document, searchStr: string): Element[] {
  const elements: Element[] = [];
  const allElements = doc.getElementsByTagName('*');
  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i];
    let hasText = false;
    for (let j = 0; j < el.childNodes.length; j++) {
      const child = el.childNodes[j];
      if (child.nodeType === 3) { // Text Node
        const textVal = child.textContent || '';
        if (textVal.includes(searchStr)) {
          hasText = true;
          break;
        }
      }
    }
    if (hasText) {
      elements.push(el);
    }
  }
  return elements;
}

// Utility to match elements with regex on own text
function getElementsMatchingOwnText(doc: Document, regex: RegExp): Element[] {
  const elements: Element[] = [];
  const allElements = doc.getElementsByTagName('*');
  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i];
    let hasMatch = false;
    for (let j = 0; j < el.childNodes.length; j++) {
      const child = el.childNodes[j];
      if (child.nodeType === 3) { // Text Node
        const textVal = child.textContent || '';
        if (regex.test(textVal)) {
          hasMatch = true;
          break;
        }
      }
    }
    if (hasMatch) {
      elements.push(el);
    }
  }
  return elements;
}

function findTableForGroup(groupText: Element): Element | null {
  let nextElement = groupText.nextElementSibling;
  while (nextElement !== null) {
    if (nextElement.tagName.toLowerCase() === 'table') {
      return nextElement;
    }
    nextElement = nextElement.nextElementSibling;
  }

  const parent = groupText.parentElement;
  if (parent) {
    const table = parent.querySelector('table');
    if (table) return table;
  }

  let parentSibling = parent ? parent.nextElementSibling : null;
  while (parentSibling !== null) {
    const table = parentSibling.querySelector('table');
    if (table) return table;
    parentSibling = parentSibling.nextElementSibling;
  }

  return null;
}

function parseDayHeaders(headerRow: Element): string[] {
  const cells = headerRow.querySelectorAll('td, th');
  if (cells.length === 0) return [];

  const dayNames: string[] = [];
  for (let i = 1; i < cells.length; i++) {
    const text = (cells[i].textContent || '').trim();
    if (text.length > 0) {
      dayNames.push(text);
    }
  }
  return dayNames;
}

function expandRow(cells: Element[]): string[] {
  const expanded: string[] = [];
  for (const cell of cells) {
    const text = (cell.textContent || '').trim();
    const colspanAttr = cell.getAttribute('colspan');
    const colspan = colspanAttr ? parseInt(colspanAttr, 10) : 1;
    for (let i = 0; i < colspan; i++) {
      expanded.push(text);
    }
  }
  return expanded;
}

function isValidLesson(text: string): boolean {
  return text.length > 0 && text !== '-' && text !== '—';
}

function splitBySubgroupMarkers(text: string, matches: RegExpExecArray[]): string[] {
  if (matches.length === 0) return [text];
  const parts: string[] = [];
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const start = match.index + match[0].length;
    const end = matches[i + 1] ? matches[i + 1].index : text.length;
    parts.push(text.substring(start, end).trim());
  }
  return parts;
}

function splitRoomsByDelimiters(rooms: string, expectedCount: number): string[] {
  const cleanedRooms = rooms.trim();
  if (cleanedRooms === '-' || cleanedRooms === '—' || cleanedRooms.length === 0) {
    return Array(expectedCount).fill('');
  }

  // Regex matches things like room numbers (e.g. "101", "202a", optionally with parenthesis (каб. 2))
  const roomPattern = /([^\s(,]*\d+[^\s(,]*(\s*\([^)]+\))?|[-—])/g;
  const matches: string[] = [];
  let m;
  while ((m = roomPattern.exec(rooms)) !== null) {
    let cleaned = m[0].trim().replace(/\s*\([^)]+\)/g, '').trim();
    if (cleaned === '-' || cleaned === '—') cleaned = '';
    matches.push(cleaned);
  }

  if (matches.length > 0) {
    if (matches.length === expectedCount) return matches;
    if (matches.length < expectedCount) {
      const parts = [...matches];
      while (parts.length < expectedCount) {
        parts.push('');
      }
      return parts;
    }
    return matches.slice(0, expectedCount);
  }

  const commaParts = rooms.split(',').map(r => r.trim().replace(/\s*\([^)]+\)/g, '')).filter(r => r.length > 0);
  if (commaParts.length >= expectedCount) return commaParts.slice(0, expectedCount);

  if (!rooms.includes('(')) {
    const spaceParts = rooms.split(/\s+/).map(r => r.trim()).filter(r => r.length > 0);
    if (spaceParts.length === expectedCount) return spaceParts;
  }

  const singleResult = rooms.replace(/\s*\([^)]+\)/g, '').trim();
  const list = [singleResult];
  while (list.length < expectedCount) {
    list.push('');
  }
  return list;
}

function parseSubgroups(subject: string, room: string): Subgroup[] {
  // Pattern matching subgroup numbers (e.g., "1. Математика", "2. Физика")
  const subgroupRegex = /(\d+)\.\s*/g;
  
  const subjectMatches: RegExpExecArray[] = [];
  let m;
  while ((m = subgroupRegex.exec(subject)) !== null) {
    subjectMatches.push(m);
  }
  
  // Reset regex lastIndex
  subgroupRegex.lastIndex = 0;
  const roomMatches: RegExpExecArray[] = [];
  while ((m = subgroupRegex.exec(room)) !== null) {
    roomMatches.push(m);
  }

  if (subjectMatches.length === 0 && roomMatches.length === 0) {
    const roomsList = splitRoomsByDelimiters(room, 2);
    const activeRooms = roomsList.filter(r => r.trim().length > 0);
    if (activeRooms.length > 1) {
      return [
        { subject, room: activeRooms[0], number: 1 },
        { subject, room: activeRooms[1], number: 2 }
      ];
    }
    const cleanedRoom = room.replace(/\s*\([^)]+\)/g, '').trim();
    const finalRoom = (cleanedRoom === '-' || cleanedRoom === '—') ? '' : cleanedRoom;
    return [{ subject, room: finalRoom, number: null }];
  }

  const subgroups: Subgroup[] = [];

  if (subjectMatches.length > 0) {
    const subjectParts = splitBySubgroupMarkers(subject, subjectMatches);
    let roomParts: string[] = [];

    if (roomMatches.length > 0) {
      roomParts = splitBySubgroupMarkers(room, roomMatches);
    } else {
      const foundRooms = splitRoomsByDelimiters(room, Math.max(subjectParts.length, 2));
      roomParts = foundRooms;
    }

    const totalSubgroups = Math.max(subjectParts.length, roomParts.length, 2);

    for (let i = 0; i < totalSubgroups; i++) {
      const sPart = (subjectParts[i] || '').trim();
      const rPart = (roomParts[i] || '').trim();
      
      let num = null;
      if (subjectMatches[i]) {
        num = parseInt(subjectMatches[i][1], 10);
      } else if (roomMatches[i]) {
        num = parseInt(roomMatches[i][1], 10);
      } else {
        num = i + 1;
      }
      
      const finalRoom = (rPart === '-' || rPart === '—') ? '' : rPart;
      
      if (sPart.length > 0 || finalRoom.length > 0) {
        subgroups.push({
          subject: sPart || subjectParts[0] || subject,
          room: finalRoom,
          number: isNaN(num) ? null : num
        });
      }
    }
  } else if (roomMatches.length > 0) {
    const roomParts = splitBySubgroupMarkers(room, roomMatches);
    for (let i = 0; i < roomParts.length; i++) {
      const rPart = roomParts[i] || '';
      const num = parseInt(roomMatches[i][1], 10);
      const finalRoom = (rPart === '-' || rPart === '—') ? '' : rPart;
      if (rPart.length > 0) {
        subgroups.push({ subject, room: finalRoom, number: isNaN(num) ? null : num });
      }
    }
  }

  if (subgroups.length === 0) {
    const cleanedRoom = room.replace(/\s*\([^)]+\)/g, '').trim();
    const finalRoom = (cleanedRoom === '-' || cleanedRoom === '—') ? '' : cleanedRoom;
    return [{ subject, room: finalRoom, number: null }];
  } else {
    const hasNumberedSubgroups = subgroups.some(sg => sg.number !== null);
    if (hasNumberedSubgroups) {
      if (!subgroups.some(sg => sg.number === 1)) {
        subgroups.unshift({ subject: '', room: '', number: 1 });
      }
      if (!subgroups.some(sg => sg.number === 2)) {
        subgroups.push({ subject: '', room: '', number: 2 });
      }
      subgroups.sort((a, b) => (a.number || 0) - (b.number || 0));
    }
    return subgroups;
  }
}

function parseLessonRow(row: Element, daysSchedule: DaySchedule[], lessonNumber: string) {
  const cells = Array.from(row.querySelectorAll('td'));
  if (cells.length === 0) return;

  const expandedCells = expandRow(cells);
  let dayIndex = 0;
  let cellIndex = 0;

  while (cellIndex < expandedCells.length - 1 && dayIndex < daysSchedule.length) {
    const subject = expandedCells[cellIndex] || '';
    const room = expandedCells[cellIndex + 1] || '';

    if (isValidLesson(subject) || isValidLesson(room)) {
      const subgroups = parseSubgroups(subject, room);
      const dayLessons = daysSchedule[dayIndex].lessons;
      const existingLesson = dayLessons.find(l => l.lessonNumber === lessonNumber);

      if (existingLesson) {
        const updatedSubgroups = [...existingLesson.subgroups, ...subgroups];
        existingLesson.subgroups = updatedSubgroups;
      } else {
        dayLessons.push({ lessonNumber, subgroups });
      }
    }

    cellIndex += 2;
    dayIndex++;
  }
}

export class ScheduleParser {
  parse(html: string, group: string): Schedule {
    const cleanHtml = html.replace(/<br\s*\/?>/gi, ' ');
    const doc = new DOMParser().parseFromString(cleanHtml, 'text/html');

    let groupTexts: Element[] = [];
    groupTexts = groupTexts.concat(getElementsContainingOwnText(doc, `Группа - ${group}`));
    if (groupTexts.length === 0) {
      groupTexts = groupTexts.concat(getElementsContainingOwnText(doc, `Группа-${group}`));
    }
    if (groupTexts.length === 0) {
      groupTexts = groupTexts.concat(getElementsContainingOwnText(doc, `Группа ${group}`));
    }

    if (groupTexts.length === 0) {
      throw new GroupNotFoundException(`Группа ${group} не найдена`);
    }

    const allDaysSchedule: DaySchedule[] = [];

    groupTexts.forEach(groupText => {
      const table = findTableForGroup(groupText);
      if (!table) return;

      const rows = Array.from(table.querySelectorAll('tr'));
      if (rows.length < 2) return;

      const headerRow = rows[0];
      const dayHeaders = parseDayHeaders(headerRow);

      const daysSchedule: DaySchedule[] = dayHeaders.map(day => ({
        dayDate: day,
        lessons: []
      }));

      const dataStartIndex = 2;
      for (let i = dataStartIndex; i < rows.length; i++) {
        parseLessonRow(rows[i], daysSchedule, (i - dataStartIndex + 1).toString());
      }

      allDaysSchedule.push(...daysSchedule);
    });

    if (allDaysSchedule.length === 0) {
      throw new GroupNotFoundException(`Расписание для группы ${group} не найдено`);
    }

    return { group, days: allDaysSchedule };
  }

  parseTeacherSchedule(html: string, teacherName: string): Schedule {
    const cleanHtml = html.replace(/<br\s*\/?>/gi, ' ');
    const doc = new DOMParser().parseFromString(cleanHtml, 'text/html');
    
    // Escape regex function
    const escaped = teacherName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const headerRegex = new RegExp(`Преподаватель\\s*-\\s*${escaped}`, 'i');
    
    let teacherHeader = getElementsMatchingOwnText(doc, headerRegex)[0] || null;
    if (!teacherHeader) {
      teacherHeader = getElementsContainingOwnText(doc, teacherName)[0] || null;
    }

    if (!teacherHeader) {
      throw new TeacherNotFoundException(`Преподаватель ${teacherName} не найден`);
    }

    const table = findTableForGroup(teacherHeader);
    if (!table) {
      throw new TeacherNotFoundException(`Таблица расписания для ${teacherName} не найдена`);
    }

    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length < 2) {
      throw new TeacherNotFoundException(`Расписание для ${teacherName} пустое`);
    }

    const dayHeaders = parseDayHeaders(rows[0]);
    const daysSchedule: DaySchedule[] = dayHeaders.map(day => ({
      dayDate: day,
      lessons: []
    }));

    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      const firstCell = row.querySelector('th, td:first-child');
      const lessonNumber = firstCell ? (firstCell.textContent || '').trim() : (i - 1).toString();
      
      const cells = Array.from(row.querySelectorAll('td'));
      const expandedCells = expandRow(cells);

      let dayIndex = 0;
      let cellIndex = 0;

      while (cellIndex < expandedCells.length - 1 && dayIndex < daysSchedule.length) {
        const subject = (expandedCells[cellIndex] || '').replace(/\u00a0/g, ' ').trim();
        const room = (expandedCells[cellIndex + 1] || '').replace(/\u00a0/g, ' ').trim();

        if (isValidLesson(subject)) {
          daysSchedule[dayIndex].lessons.push({
            lessonNumber,
            subgroups: [{ subject, room }]
          });
        }

        cellIndex += 2;
        dayIndex++;
      }
    }

    return { group: teacherName, days: daysSchedule };
  }
}
