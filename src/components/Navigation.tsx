import React from 'react';
import { Calendar, Bell, Users, Settings } from 'lucide-react';
import './Navigation.css';

export type TabRoute = 'home' | 'alarms' | 'staff' | 'settings';

interface NavigationProps {
  activeTab: TabRoute;
  setActiveTab: (tab: TabRoute) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home' as const, label: 'Расписание', Icon: Calendar },
    { id: 'alarms' as const, label: 'Звонки', Icon: Bell },
    { id: 'staff' as const, label: 'Сотрудники', Icon: Users },
    { id: 'settings' as const, label: 'Настройки', Icon: Settings }
  ];

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
              aria-label={label}
            >
              <div className="icon-wrapper">
                <div className="pill-background" />
                <Icon className="nav-icon" size={24} />
              </div>
              <span className="nav-label">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
