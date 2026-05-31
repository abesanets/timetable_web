import { StaffData } from '../data/staffData';
import type { StaffMember } from '../data/staffData';

export function getRoomDescription(room: string): string {
  const trimmedRoom = room.trim();

  if (!trimmedRoom || trimmedRoom === '-') return 'Кабинет не указан';

  if (trimmedRoom.toLowerCase().includes('сп.з') || trimmedRoom.toLowerCase().includes('спорт')) {
    return 'Спортивный зал';
  }
  if (trimmedRoom.toLowerCase().includes('акт')) {
    return 'Актовый зал';
  }

  // Regex for "Corpus-Room" format (e.g. 2-304)
  const corpusRegex = /^(\d+)[-](\d+)$/;
  const corpusMatch = corpusRegex.exec(trimmedRoom);

  if (corpusMatch) {
    const corpus = corpusMatch[1];
    const roomNum = corpusMatch[2];
    const floor = roomNum.charAt(0) || '?';
    return `Корпус ${corpus}, этаж ${floor}, кабинет ${roomNum}`;
  }

  // Regex for "Room" only format (assumed Corpus 1) (e.g. 304, 703)
  const simpleRoomRegex = /^(\d{3,})$/;
  if (simpleRoomRegex.test(trimmedRoom)) {
    const floor = trimmedRoom.charAt(0);
    return `Корпус 1, этаж ${floor}, кабинет ${trimmedRoom}`;
  }

  return `Кабинет ${trimmedRoom}`;
}

export function findStaffByShortName(shortName: string): StaffMember | null {
  const cleanShortName = shortName.replace(/\./g, '').trim();
  // e.g. "Козел ГВ" or "Козел Г В"
  const parts = cleanShortName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;

  const surname = parts[0];

  const normalize = (s: string) => s.toLowerCase().replace(/ё/g, 'е');

  const allStaff: StaffMember[] = [
    ...StaffData.administration,
    ...StaffData.teachers,
    ...StaffData.employees
  ];

  const match = allStaff.find(member => {
    const memberParts = member.fullName.split(/\s+/);
    const memberSurname = memberParts[0] || '';

    if (normalize(memberSurname) === normalize(surname)) {
      if (parts.length > 1) {
        const initials = parts.slice(1).join('');
        const memberInitials = memberParts.slice(1).map(p => p.charAt(0)).join('');
        return memberInitials.toLowerCase().startsWith(initials.toLowerCase());
      }
      return true;
    }
    return false;
  });

  return match || null;
}
