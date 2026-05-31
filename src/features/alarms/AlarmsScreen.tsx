import React, { useState } from 'react';
import { WEEKDAY_SCHEDULE, SATURDAY_SCHEDULE } from '../../data/models';
import './AlarmsScreen.css';

export const AlarmsScreen: React.FC = () => {
  const currentDay = new Date().getDay();
  const isSaturdayToday = currentDay === 6; // 6 is Saturday

  const [isSaturday, setIsSaturday] = useState(isSaturdayToday);
  const schedule = isSaturday ? SATURDAY_SCHEDULE : WEEKDAY_SCHEDULE;

  return (
    <div className="alarms-screen scrollable-content">
      <div className="screen-header">
        <h1>Звонки</h1>
        <p className="subtitle">{isSaturday ? 'Суббота' : 'Будни (Понедельник - Пятница)'}</p>
      </div>

      <div className="day-selector-pills">
        <button
          className={`pill-btn ${!isSaturday ? 'active' : ''}`}
          onClick={() => setIsSaturday(false)}
        >
          Будни
        </button>
        <button
          className={`pill-btn ${isSaturday ? 'active' : ''}`}
          onClick={() => setIsSaturday(true)}
        >
          Суббота
        </button>
      </div>

      <div className="calls-list">
        {schedule.map((callTime, index) => (
          <div key={index} className="call-item-card">
            <div className="lesson-number-circle">
              {index + 1}
            </div>
            <div className="time-slots">
              <div className="time-capsule">
                <span>1-я половина:</span>
                <strong>{callTime.firstStart} - {callTime.firstEnd}</strong>
              </div>
              <div className="time-capsule">
                <span>2-я половина:</span>
                <strong>{callTime.secondStart} - {callTime.secondEnd}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
