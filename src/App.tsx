import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import type { TabRoute } from './components/Navigation';
import { HomeScreen } from './features/schedule/HomeScreen';
import { AlarmsScreen } from './features/alarms/AlarmsScreen';
import { StaffScreen } from './features/staff/StaffScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { updateFavicon, hexToHsl } from './utils/favicon';

export const App: React.FC = () => {
  // Load settings from localStorage
  const [activeTab, setActiveTab] = useState<TabRoute>('home');
  const [groupInput, setGroupInput] = useState('');
  const [subgroup, setSubgroup] = useState<number>(() => {
    return Number(localStorage.getItem('setting_subgroup') || '0');
  });
  const [showOtherSubgroup, setShowOtherSubgroup] = useState<boolean>(() => {
    return localStorage.getItem('setting_show_other_subgroup') === 'true';
  });
  const [theme, setTheme] = useState<'auto' | 'light' | 'dark'>(() => {
    return (localStorage.getItem('setting_theme') as 'auto' | 'light' | 'dark') || 'auto';
  });
  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem('setting_accent_color') || 'default';
  });
  const [proxyTemplate, setProxyTemplate] = useState<string>(() => {
    const saved = localStorage.getItem('setting_proxy_template');
    if (!saved || saved === 'https://corsproxy.io/?url={url}') {
      return 'https://timetable-proxy.a-besanets.workers.dev/?url={url}';
    }
    return saved;
  });

  // Persist settings
  useEffect(() => {
    localStorage.setItem('setting_subgroup', subgroup.toString());
  }, [subgroup]);

  useEffect(() => {
    localStorage.setItem('setting_show_other_subgroup', showOtherSubgroup.toString());
  }, [showOtherSubgroup]);

  useEffect(() => {
    localStorage.setItem('setting_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('setting_accent_color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('setting_proxy_template', proxyTemplate);
  }, [proxyTemplate]);

  // Handle dark/light theme switching
  useEffect(() => {
    const handleThemeChange = () => {
      let activeTheme: 'light' | 'dark' = 'light';
      if (theme === 'auto') {
        const isDarkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches;
        activeTheme = isDarkSystem ? 'dark' : 'light';
      } else {
        activeTheme = theme;
      }
      document.documentElement.setAttribute('data-theme', activeTheme);
    };

    handleThemeChange();

    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', handleThemeChange);
      return () => mediaQuery.removeEventListener('change', handleThemeChange);
    }
  }, [theme]);

  // Handle custom accent color generation
  useEffect(() => {
    const applyAccentColor = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

      if (accentColor === 'default') {
        // Reset custom styling variables
        document.documentElement.style.removeProperty('--primary-h');
        document.documentElement.style.removeProperty('--primary-s');
        document.documentElement.style.removeProperty('--primary-l');
        document.documentElement.style.removeProperty('--primary');
        document.documentElement.style.removeProperty('--on-primary');
        document.documentElement.style.removeProperty('--primary-container');
        document.documentElement.style.removeProperty('--on-primary-container');
        document.documentElement.style.removeProperty('--secondary-container');
        document.documentElement.style.removeProperty('--on-secondary-container');
      } else {
        const { h, s, l } = hexToHsl(accentColor);
        document.documentElement.style.setProperty('--primary-h', h.toString());
        document.documentElement.style.setProperty('--primary-s', `${s}%`);
        document.documentElement.style.setProperty('--primary-l', `${l}%`);

        if (isDark) {
          document.documentElement.style.setProperty('--primary', `hsl(${h}, ${s}%, 80%)`);
          document.documentElement.style.setProperty('--on-primary', `hsl(${h}, ${s}%, 15%)`);
          document.documentElement.style.setProperty('--primary-container', `hsl(${h}, ${s}%, 25%)`);
          document.documentElement.style.setProperty('--on-primary-container', `hsl(${h}, ${s}%, 90%)`);
          document.documentElement.style.setProperty('--secondary-container', `hsl(${h}, ${Math.max(10, s - 35)}%, 22%)`);
          document.documentElement.style.setProperty('--on-secondary-container', `hsl(${h}, ${s}%, 90%)`);
        } else {
          document.documentElement.style.setProperty('--primary', `hsl(${h}, ${s}%, 38%)`);
          document.documentElement.style.setProperty('--on-primary', `#ffffff`);
          document.documentElement.style.setProperty('--primary-container', `hsl(${h}, ${s}%, 90%)`);
          document.documentElement.style.setProperty('--on-primary-container', `hsl(${h}, ${s}%, 15%)`);
          document.documentElement.style.setProperty('--secondary-container', `hsl(${h}, ${Math.max(10, s - 30)}%, 93%)`);
          document.documentElement.style.setProperty('--on-secondary-container', `hsl(${h}, ${s}%, 15%)`);
        }
      }

      // Update favicon and theme color to match accent
      updateFavicon(accentColor);
    };

    // Apply color accent
    applyAccentColor();

    // Re-apply if system theme changes in auto mode
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', applyAccentColor);
      return () => mediaQuery.removeEventListener('change', applyAccentColor);
    }
  }, [accentColor, theme]);

  const handleViewScheduleFromStaff = (teacherShortName: string) => {
    setGroupInput(teacherShortName);
    setActiveTab('home');
    // We add a tiny delay to ensure the DOM is updated and search is triggered
    setTimeout(() => {
      const searchBtn = document.querySelector('.search-submit-btn') as HTMLButtonElement;
      if (searchBtn) searchBtn.click();
    }, 100);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            groupInput={groupInput}
            setGroupInput={setGroupInput}
            selectedSubgroup={subgroup}
            showOtherSubgroup={showOtherSubgroup}
            proxyTemplate={proxyTemplate}
          />
        );
      case 'alarms':
        return <AlarmsScreen />;
      case 'staff':
        return <StaffScreen onViewSchedule={handleViewScheduleFromStaff} />;
      case 'settings':
        return (
          <SettingsScreen
            subgroup={subgroup}
            setSubgroup={setSubgroup}
            showOtherSubgroup={showOtherSubgroup}
            setShowOtherSubgroup={setShowOtherSubgroup}
            theme={theme}
            setTheme={setTheme}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
            proxyTemplate={proxyTemplate}
            setProxyTemplate={setProxyTemplate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      {renderActiveTab()}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
