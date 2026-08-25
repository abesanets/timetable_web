import React, { useState, useEffect } from 'react';
import type { BuildingId } from '../../data/models';
import { BUILDINGS, getCallSchedule, KAZINTSA_GROUPS, KNORINA_GROUPS } from '../../utils/buildingUtils';
import { Building2, Users } from 'lucide-react';
import './AlarmsScreen.css';

interface AlarmsScreenProps {
  initialBuilding?: BuildingId;
}

export const AlarmsScreen: React.FC<AlarmsScreenProps> = ({ initialBuilding }) => {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingId>(() => {
    const saved = localStorage.getItem('setting_building') as BuildingId;
    if (saved === 'kazintsa' || saved === 'knorina') return saved;
    return initialBuilding || 'kazintsa';
  });

  const [showGroups, setShowGroups] = useState(false);

  useEffect(() => {
    localStorage.setItem('setting_building', selectedBuilding);
  }, [selectedBuilding]);

  const schedule = getCallSchedule(selectedBuilding);

  const shift1Calls = schedule.filter(c => c.shift === 1);
  const shift2Calls = schedule.filter(c => c.shift === 2);

  const groupsList = selectedBuilding === 'kazintsa' ? [
    { year: '1 курс', groups: '104РТК, 105ТП, 106МНЭ' },
    { year: '2 курс', groups: '96РТК, 97РТК, 98ТП, 99ТП, 100МНЭ' },
    { year: '3 курс', groups: '86РТК, 87ТП, 88ТП, 89ТП, 90МНЭ, 91МНЭ, 92МНЭ' },
    { year: '4 курс', groups: '80РКТ, 81ТП, 82ТП, 83МНЭ, 84МНЭ' }
  ] : [
    { year: '1 курс', groups: '102М, 103М, 107ТЭ, 108ТЭ, 109ТП' },
    { year: '2 курс', groups: '95М, 101ТП' },
    { year: '3 курс', groups: '85М, 9СР, 93МНЭ, 94ТП, 169ТП' },
    { year: '4 курс', groups: '79ТЭ, 167ТП, 168МНЭ' }
  ];

  return (
    <div className="alarms-screen scrollable-content">
      <div className="screen-header">
        <h1>Звонки</h1>
        <p className="subtitle">{BUILDINGS[selectedBuilding].name}</p>
      </div>

      <div className="building-selector-pills">
        <button
          className={`pill-btn ${selectedBuilding === 'kazintsa' ? 'active' : ''}`}
          onClick={() => setSelectedBuilding('kazintsa')}
        >
          <Building2 size={16} />
          <span>Казинца, 91</span>
        </button>
        <button
          className={`pill-btn ${selectedBuilding === 'knorina' ? 'active' : ''}`}
          onClick={() => setSelectedBuilding('knorina')}
        >
          <Building2 size={16} />
          <span>Кнорина, 14</span>
        </button>
      </div>

      <div className="calls-list">
        {selectedBuilding === 'kazintsa' ? (
          <>
            <div className="shift-header">
              <span className="shift-badge">1 смена</span>
              <span className="shift-title">1 – 3 пары</span>
            </div>
            {shift1Calls.map((callTime) => (
              <div key={callTime.pairNumber} className="call-item-card">
                <div className="lesson-number-circle">{callTime.pairNumber}</div>
                <div className="time-slots">
                  <div className="time-capsule">
                    <span>1-я половина</span>
                    <strong>{callTime.firstStart} – {callTime.firstEnd}</strong>
                  </div>
                  <div className="time-capsule">
                    <span>2-я половина</span>
                    <strong>{callTime.secondStart} – {callTime.secondEnd}</strong>
                  </div>
                </div>
              </div>
            ))}

            <div className="shift-header shift-header--second">
              <span className="shift-badge">2 смена</span>
              <span className="shift-title">4 – 7 пары</span>
            </div>
            {shift2Calls.map((callTime) => (
              <div key={callTime.pairNumber} className="call-item-card">
                <div className="lesson-number-circle">{callTime.pairNumber}</div>
                <div className="time-slots">
                  {callTime.isSolid ? (
                    <div className="time-capsule time-capsule--solid">
                      <span>Время пары</span>
                      <strong>{callTime.firstStart} – {callTime.firstEnd}</strong>
                    </div>
                  ) : (
                    <>
                      <div className="time-capsule">
                        <span>1-я половина</span>
                        <strong>{callTime.firstStart} – {callTime.firstEnd}</strong>
                      </div>
                      <div className="time-capsule">
                        <span>2-я половина</span>
                        <strong>{callTime.secondStart} – {callTime.secondEnd}</strong>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </>
        ) : (
          schedule.map((callTime) => (
            <div key={callTime.pairNumber} className="call-item-card">
              <div className="lesson-number-circle">{callTime.pairNumber}</div>
              <div className="time-slots">
                <div className="time-capsule">
                  <span>1-я половина</span>
                  <strong>{callTime.firstStart} – {callTime.firstEnd}</strong>
                </div>
                <div className="time-capsule">
                  <span>2-я половина</span>
                  <strong>{callTime.secondStart} – {callTime.secondEnd}</strong>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Groups of this building info section */}
        <div className="building-groups-card">
          <button
            className="building-groups-toggle"
            onClick={() => setShowGroups(!showGroups)}
          >
            <div className="toggle-left">
              <Users size={18} />
              <span>Группы корпуса ({selectedBuilding === 'kazintsa' ? KAZINTSA_GROUPS.length : KNORINA_GROUPS.length})</span>
            </div>
            <span className="toggle-state">{showGroups ? 'Скрыть' : 'Показать'}</span>
          </button>

          {showGroups && (
            <div className="building-groups-content">
              {groupsList.map((item, idx) => (
                <div key={idx} className="group-course-row">
                  <span className="course-name">{item.year}:</span>
                  <span className="course-groups">{item.groups}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

