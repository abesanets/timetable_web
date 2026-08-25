import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import type { TabRoute } from './components/Navigation';
import { HomeScreen } from './features/schedule/HomeScreen';
import { AlarmsScreen } from './features/alarms/AlarmsScreen';
import { StaffScreen } from './features/staff/StaffScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';
import type { Schedule } from './data/models';
import { fetchScheduleHtml, fetchTeacherScheduleHtml } from './utils/fetcher';
import { ScheduleParser } from './utils/parser';
import { updateFavicon, hexToHsl } from './utils/favicon';
import { getBuildingForGroup } from './utils/buildingUtils';

export const App: React.FC = () => {
  // Load settings from localStorage
  const [activeTab, setActiveTab] = useState<TabRoute>('home');
  const [groupInput, setGroupInput] = useState<string>(() => {
    return localStorage.getItem('last_schedule_query') || '';
  });
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
  const [autoRefresh, setAutoRefresh] = useState<boolean>(() => {
    return localStorage.getItem('setting_auto_refresh') !== 'false';
  });
  const [proxyTemplate, setProxyTemplate] = useState<string>(() => {
    const saved = localStorage.getItem('setting_proxy_template');
    if (!saved || saved === 'https://corsproxy.io/?url={url}') {
      return 'https://timetable-proxy.a-besanets.workers.dev/?url={url}';
    }
    return saved;
  });

  // Schedule state lifted to root level
  const [fullSchedule, setFullSchedule] = useState<Schedule | null>(() => {
    const cachedData = localStorage.getItem('cached_schedule_data');
    if (cachedData) {
      try {
        return JSON.parse(cachedData) as Schedule;
      } catch (e) {
        console.error('Failed to parse cached schedule', e);
      }
    }
    return null;
  });
  const [loadedGroup, setLoadedGroup] = useState<string | null>(() => {
    return localStorage.getItem('last_schedule_query') || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const lastQuery = localStorage.getItem('last_schedule_query');
    const autoRefreshEnabled = localStorage.getItem('setting_auto_refresh') !== 'false';
    return Boolean(autoRefreshEnabled && lastQuery && lastQuery.trim());
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    localStorage.setItem('setting_auto_refresh', autoRefresh.toString());
  }, [autoRefresh]);

  useEffect(() => {
    localStorage.setItem('setting_proxy_template', proxyTemplate);
  }, [proxyTemplate]);

  // Load schedule function
  const loadSchedule = useCallback(async (targetQuery?: string) => {
    const query = (targetQuery || '').trim();
    if (!query) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    const startTime = Date.now();

    try {
      const parser = new ScheduleParser();
      let rawHtml = '';
      let parsedSchedule: Schedule;

      // Check if it's a teacher search or group (if query doesn't contain digits, treat as teacher)
      const isTeacher = !/\d/.test(query);

      if (isTeacher) {
        rawHtml = await fetchTeacherScheduleHtml(query, proxyTemplate);
        parsedSchedule = parser.parseTeacherSchedule(rawHtml, query);
      } else {
        rawHtml = await fetchScheduleHtml(query, proxyTemplate);
        parsedSchedule = parser.parse(rawHtml, query);
      }

      setFullSchedule(parsedSchedule);
      setLoadedGroup(query);
      setGroupInput(query);
      setErrorMessage(null);

      // Save to localStorage
      localStorage.setItem('last_schedule_query', query);
      localStorage.setItem('cached_schedule_data', JSON.stringify(parsedSchedule));
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Произошла непредвиденная ошибка';
      setErrorMessage(msg);
    } finally {
      const elapsed = Date.now() - startTime;
      if (elapsed < 350) {
        await new Promise(resolve => setTimeout(resolve, 350 - elapsed));
      }
      setIsLoading(false);
    }
  }, [proxyTemplate]);

  // Auto-refresh schedule once on app mount if last query exists
  useEffect(() => {
    let ignore = false;

    const fetchOnMount = async () => {
      await Promise.resolve();
      if (ignore) return;

      const lastQuery = localStorage.getItem('last_schedule_query');
      const autoRefreshEnabled = localStorage.getItem('setting_auto_refresh') !== 'false';
      if (autoRefreshEnabled && lastQuery && lastQuery.trim()) {
        await loadSchedule(lastQuery.trim());
      } else {
        setIsLoading(false);
      }
    };

    void fetchOnMount();

    return () => {
      ignore = true;
    };
  }, [loadSchedule]);

  // Handle dark/light theme switching
  useEffect(() => {
    const handleThemeChange = () => {
      const activeTheme: 'light' | 'dark' = theme === 'auto'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;
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
    loadSchedule(teacherShortName);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            groupInput={groupInput}
            setGroupInput={setGroupInput}
            fullSchedule={fullSchedule}
            setFullSchedule={setFullSchedule}
            loadedGroup={loadedGroup}
            isLoading={isLoading}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            loadSchedule={loadSchedule}
            selectedSubgroup={subgroup}
            showOtherSubgroup={showOtherSubgroup}
          />
        );
      case 'alarms':
        return <AlarmsScreen initialBuilding={getBuildingForGroup(groupInput)} />;
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
            autoRefresh={autoRefresh}
            setAutoRefresh={setAutoRefresh}
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
