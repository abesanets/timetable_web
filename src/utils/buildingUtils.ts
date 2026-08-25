import type { BuildingId, CallTime } from '../data/models';
import { KAZINTSA_CALLS, KNORINA_CALLS } from '../data/models';

export const KAZINTSA_GROUPS = [
  '104', '105', '106',
  '96', '97', '98', '99', '100',
  '86', '87', '88', '89', '90', '91', '92',
  '80', '81', '82', '83', '84'
];

export const KNORINA_GROUPS = [
  '102', '103', '107', '108', '109',
  '95', '101',
  '85', '9', '93', '94', '169',
  '79', '167', '168'
];

export interface BuildingInfo {
  id: BuildingId;
  name: string;
  shortName: string;
  address: string;
}

export const BUILDINGS: Record<BuildingId, BuildingInfo> = {
  kazintsa: {
    id: 'kazintsa',
    name: 'Корпус по ул. Казинца',
    shortName: 'Казинца, 91',
    address: 'ул. Казинца, 91'
  },
  knorina: {
    id: 'knorina',
    name: 'Корпус по ул. Кнорина',
    shortName: 'Кнорина, 14',
    address: 'ул. Кнорина, 14'
  }
};

export function getBuildingForGroup(groupName: string): BuildingId {
  if (!groupName) return 'kazintsa';

  const match = groupName.match(/\d+/);
  if (!match) return 'kazintsa';

  const groupNum = match[0];
  if (KNORINA_GROUPS.includes(groupNum)) {
    return 'knorina';
  }
  return 'kazintsa';
}

export function getCallSchedule(building: BuildingId): CallTime[] {
  return building === 'knorina' ? KNORINA_CALLS : KAZINTSA_CALLS;
}

export function getCallTime(pairNumber: number | string, building: BuildingId): CallTime | undefined {
  const num = typeof pairNumber === 'number' ? pairNumber : parseInt(pairNumber, 10);
  const list = getCallSchedule(building);
  return list.find(c => c.pairNumber === num);
}

export function formatCallTimeInterval(call: CallTime): string {
  if (call.isSolid) {
    return `${call.firstStart} - ${call.firstEnd}`;
  }
  return `${call.firstStart} - ${call.secondEnd}`;
}
