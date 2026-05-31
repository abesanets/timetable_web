import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Palette, Check } from 'lucide-react';
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
  proxyTemplate: string;
  setProxyTemplate: (val: string) => void;
}

export const PRESET_ACCENTS = [
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
  proxyTemplate,
  setProxyTemplate
}) => {
  const [showSubgroupModal, setShowSubgroupModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showProxyModal, setShowProxyModal] = useState(false);

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
    if (val.includes('corsproxy.io')) return 'CORSProxy.io (По умолчанию)';
    if (val.includes('allorigins')) return 'AllOrigins (Резервный)';
    if (val === '{url}') return 'Прямое подключение (Без прокси)';
    return 'Свой прокси (Cloudflare)';
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
          <div className="settings-card" onClick={() => setShowProxyModal(true)}>
            <div className="card-info">
              <h3>CORS прокси-сервер</h3>
              <p>{getProxyLabel(proxyTemplate)}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Subgroup Dialog */}
      {showSubgroupModal && (
        <div className="modal-backdrop" onClick={() => setShowSubgroupModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
      {showThemeModal && (
        <div className="modal-backdrop" onClick={() => setShowThemeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
      {showProxyModal && (
        <div className="modal-backdrop" onClick={() => setShowProxyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>CORS-прокси сервер</h3>
            <p className="modal-description">Помогает обойти ограничения браузера при загрузке расписания.</p>
            <div className="option-list">
              {[
                { label: 'CORSProxy.io (Рекомендуется)', value: 'https://corsproxy.io/?url={url}' },
                { label: 'AllOrigins (Альтернативный)', value: 'https://api.allorigins.win/raw?url={url}' },
                { label: 'Прямой запрос (Без прокси)', value: '{url}' }
              ].map((item) => (
                <label key={item.value} className="option-item" onClick={() => { setProxyTemplate(item.value); setShowProxyModal(false); }}>
                  <input type="radio" checked={proxyTemplate === item.value} readOnly />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
            <div className="custom-proxy-input-wrapper">
              <label>Свой прокси (Cloudflare Workers, etc.):</label>
              <input
                type="text"
                placeholder="https://my-worker.username.workers.dev/?url={url}"
                value={proxyTemplate.startsWith('http') && !proxyTemplate.includes('corsproxy.io') && !proxyTemplate.includes('allorigins') ? proxyTemplate : ''}
                onChange={(e) => setProxyTemplate(e.target.value)}
              />
              <span className="proxy-hint">Обязательно добавьте {'{url}'} в конец шаблона.</span>
            </div>
            <button className="modal-close" onClick={() => setShowProxyModal(false)}>Готово</button>
          </div>
        </div>
      )}
    </div>
  );
};
