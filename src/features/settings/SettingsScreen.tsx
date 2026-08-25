import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Palette, Check } from 'lucide-react';
import { useClosingModal } from '../../hooks/useClosingModal';
import './SettingsScreen.css';

interface SettingsScreenProps {
  subgroup: number;
  setSubgroup: (val: number) => void;
  showOtherSubgroup: boolean;
  setShowOtherSubgroup: (val: boolean) => void;
  theme: 'auto' | 'light' | 'dark';
  setTheme: (val: 'auto' | 'light' | 'dark') => void;
  accentColor: string; // 'default' | hex code
  setAccentColor: (val: string) => void;
  autoRefresh: boolean;
  setAutoRefresh: (val: boolean) => void;
  proxyTemplate: string;
  setProxyTemplate: (val: string) => void;
}

const PRESET_ACCENTS = [
  { name: 'Синий (дефолт)', value: 'default', color: '#0061a4' },
  { name: 'Зеленый', value: '#2e7d32', color: '#2e7d32' },
  { name: 'Фиолетовый', value: '#6a1b9a', color: '#6a1b9a' },
  { name: 'Оранжевый', value: '#e65100', color: '#e65100' },
  { name: 'Розовый', value: '#c2185b', color: '#c2185b' }
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  subgroup,
  setSubgroup,
  showOtherSubgroup,
  setShowOtherSubgroup,
  theme,
  setTheme,
  accentColor,
  setAccentColor,
  autoRefresh,
  setAutoRefresh,
  proxyTemplate,
  setProxyTemplate
}) => {
  const [showSubgroupModal, setShowSubgroupModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showProxyModal, setShowProxyModal] = useState(false);
  
  const { shouldRender: renderSubgroup, isClosing: closingSubgroup } = useClosingModal(showSubgroupModal, 300);
  const { shouldRender: renderTheme, isClosing: closingTheme } = useClosingModal(showThemeModal, 300);
  const { shouldRender: renderProxy, isClosing: closingProxy } = useClosingModal(showProxyModal, 300);

  const [customProxyInput, setCustomProxyInput] = useState(() => {
    const isPreset = 
      proxyTemplate === 'https://timetable-proxy.a-besanets.workers.dev/?url={url}' ||
      proxyTemplate === 'https://corsproxy.io/?url={url}' ||
      proxyTemplate === 'https://api.allorigins.win/raw?url={url}' ||
      proxyTemplate === '{url}';
    if (isPreset) return '';
    
    let host = proxyTemplate.trim();
    if (host.startsWith('https://')) host = host.slice(8);
    else if (host.startsWith('http://')) host = host.slice(7);
    if (host.includes('/?url=')) host = host.split('/?url=')[0];
    else if (host.includes('?url=')) host = host.split('?url=')[0];
    else if (host.endsWith('/')) host = host.slice(0, -1);
    return host;
  });

  const getSubgroupLabel = (val: number) => {
    if (val === 0) return 'Все подгруппы';
    return `${val} подгруппа`;
  };

  const getThemeLabel = (val: string) => {
    if (val === 'auto') return 'Системная';
    if (val === 'light') return 'Светлая';
    return 'Темная';
  };

  const getProxyLabel = (val: string) => {
    if (val.includes('timetable-proxy.a-besanets.workers.dev')) return 'Cloudflare Worker (По умолчанию)';
    if (val.includes('corsproxy.io')) return 'CORSProxy.io (Резервный)';
    if (val.includes('allorigins')) return 'AllOrigins (Резервный)';
    if (val === '{url}') return 'Прямое подключение (Без прокси)';
    
    let host = val.trim();
    if (host.startsWith('https://')) host = host.slice(8);
    else if (host.startsWith('http://')) host = host.slice(7);
    if (host.includes('/?url=')) host = host.split('/?url=')[0];
    else if (host.includes('?url=')) host = host.split('?url=')[0];
    else if (host.endsWith('/')) host = host.slice(0, -1);
    
    return `Свой прокси (${host})`;
  };

  const handleSubgroupChange = (val: number) => {
    setSubgroup(val);
    if (val === 0) {
      setShowOtherSubgroup(false);
    }
  };

  return (
    <div className="settings-screen scrollable-content">
      <div className="screen-header">
        <h1>Настройки</h1>
      </div>

      <div className="settings-list">
        {/* Subgroup */}
        <section className="settings-section">
          <h2>Профиль</h2>
          <div className="settings-card" onClick={() => setShowSubgroupModal(true)}>
            <div className="card-info">
              <h3>Моя подгруппа</h3>
              <p>{getSubgroupLabel(subgroup)}</p>
            </div>
          </div>

          <div
            className={`settings-card ${subgroup === 0 ? 'disabled' : ''}`}
            onClick={() => subgroup !== 0 && setShowOtherSubgroup(!showOtherSubgroup)}
          >
            <div className="card-info">
              <h3>Вторая подгруппа в деталях</h3>
              <p>Показывать разделенные занятия другой подгруппы</p>
            </div>
            <div className="card-action">
              {showOtherSubgroup && subgroup !== 0 ? (
                <ToggleRight className="toggle-icon active" size={40} />
              ) : (
                <ToggleLeft className="toggle-icon" size={40} />
              )}
            </div>
          </div>
        </section>

        {/* Theme Settings */}
        <section className="settings-section">
          <h2>Внешний вид</h2>
          <div className="settings-card" onClick={() => setShowThemeModal(true)}>
            <div className="card-info">
              <h3>Тема оформления</h3>
              <p>{getThemeLabel(theme)}</p>
            </div>
          </div>

          {/* Accent Color picker */}
          <div className="settings-card no-click">
            <div className="card-info">
              <h3>Акцентный цвет</h3>
              <p>Настройка оттенков интерфейса (Material You)</p>
              <div className="color-palette-picker">
                {PRESET_ACCENTS.map((preset) => {
                  const isSelected = accentColor === preset.value;
                  return (
                    <button
                      key={preset.value}
                      className={`color-bubble ${isSelected ? 'selected' : ''}`}
                      style={{ backgroundColor: preset.color }}
                      onClick={() => setAccentColor(preset.value)}
                      title={preset.name}
                    >
                      {isSelected && <Check size={16} color="#fff" />}
                    </button>
                  );
                })}
                <div className={`color-bubble custom-picker-wrapper ${!PRESET_ACCENTS.some(p => p.value === accentColor) && accentColor !== 'default' ? 'selected' : ''}`}>
                  <input
                    type="color"
                    className="custom-color-picker"
                    value={accentColor.startsWith('#') ? accentColor : '#0061a4'}
                    onChange={(e) => setAccentColor(e.target.value)}
                    title="Выбрать свой цвет"
                  />
                  <Palette className="custom-color-icon" size={16} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Network / Proxy */}
        <section className="settings-section">
          <h2>Сеть и соединение</h2>
          <div
            className="settings-card"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <div className="card-info">
              <h3>Автообновление при входе</h3>
              <p>Автоматически загружать свежее расписание при открытии сайта</p>
            </div>
            <div className="card-action">
              {autoRefresh ? (
                <ToggleRight className="toggle-icon active" size={40} />
              ) : (
                <ToggleLeft className="toggle-icon" size={40} />
              )}
            </div>
          </div>

          <div className="settings-card" onClick={() => setShowProxyModal(true)}>
            <div className="card-info">
              <h3>CORS прокси-сервер</h3>
              <p>{getProxyLabel(proxyTemplate)}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Subgroup Dialog */}
      {renderSubgroup && (
        <div className={`modal-backdrop ${closingSubgroup ? 'closing' : ''}`} onClick={() => setShowSubgroupModal(false)}>
          <div className={`modal-content ${closingSubgroup ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <h3>Выберите подгруппу</h3>
            <div className="option-list">
              {[0, 1, 2].map((val) => (
                <label key={val} className="option-item" onClick={() => { handleSubgroupChange(val); setShowSubgroupModal(false); }}>
                  <input type="radio" checked={subgroup === val} readOnly />
                  <span>{getSubgroupLabel(val)}</span>
                </label>
              ))}
            </div>
            <button className="modal-close" onClick={() => setShowSubgroupModal(false)}>Отмена</button>
          </div>
        </div>
      )}

      {/* Theme Dialog */}
      {renderTheme && (
        <div className={`modal-backdrop ${closingTheme ? 'closing' : ''}`} onClick={() => setShowThemeModal(false)}>
          <div className={`modal-content ${closingTheme ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <h3>Тема оформления</h3>
            <div className="option-list">
              {(['auto', 'light', 'dark'] as const).map((val) => (
                <label key={val} className="option-item" onClick={() => { setTheme(val); setShowThemeModal(false); }}>
                  <input type="radio" checked={theme === val} readOnly />
                  <span>{getThemeLabel(val)}</span>
                </label>
              ))}
            </div>
            <button className="modal-close" onClick={() => setShowThemeModal(false)}>Отмена</button>
          </div>
        </div>
      )}

      {/* Proxy Dialog */}
      {renderProxy && (
        <div className={`modal-backdrop ${closingProxy ? 'closing' : ''}`} onClick={() => setShowProxyModal(false)}>
          <div className={`modal-content ${closingProxy ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <h3>CORS-прокси сервер</h3>
            <p className="modal-description">Помогает обойти ограничения браузера при загрузке расписания.</p>
            <div className="option-list">
              {[
                { label: 'Cloudflare Worker (Основной)', value: 'https://timetable-proxy.a-besanets.workers.dev/?url={url}' },
                { label: 'CORSProxy.io (Резервный)', value: 'https://corsproxy.io/?url={url}' },
                { label: 'AllOrigins (Резервный)', value: 'https://api.allorigins.win/raw?url={url}' },
                { label: 'Прямой запрос (Без прокси)', value: '{url}' }
              ].map((item) => (
                <label
                  key={item.value}
                  className="option-item"
                  onClick={() => {
                    setProxyTemplate(item.value);
                    setCustomProxyInput('');
                    setShowProxyModal(false);
                  }}
                >
                  <input type="radio" checked={proxyTemplate === item.value} readOnly />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
            <div className="custom-proxy-input-wrapper">
              <label>Свой прокси (домен или адрес):</label>
              <input
                type="text"
                placeholder="my-worker.username.workers.dev"
                value={customProxyInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomProxyInput(val);
                  setProxyTemplate(val);
                }}
              />
              <span className="proxy-hint">Введите только адрес домена. Префикс https:// и параметр ?url= добавятся автоматически.</span>
            </div>
            <button className="modal-close" onClick={() => setShowProxyModal(false)}>Готово</button>
          </div>
        </div>
      )}
    </div>
  );
};
