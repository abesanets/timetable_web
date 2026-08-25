import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, RefreshCw, X, AlertTriangle, Info, MapPin, User, ChevronLeft, Clock } from 'lucide-react';
import type { Schedule, Lesson } from '../../data/models';
import { StaffData } from '../../data/staffData';
import type { StaffMember } from '../../data/staffData';
import { findStaffByShortName, getRoomDescription, toShortName } from '../../utils/staffUtils';
import { filterScheduleBySubgroup, shouldShowAllSubgroupsInDetails, findTodayIndex, isShowingNextDay, extractDate, parseDate } from '../../utils/scheduleUtils';
import { getBuildingForGroup, getCallTime, formatCallTimeInterval } from '../../utils/buildingUtils';
import { useClosingModal } from '../../hooks/useClosingModal';
import './HomeScreen.css';

interface HomeScreenProps {
  groupInput: string;
  setGroupInput: (val: string) => void;
  fullSchedule: Schedule | null;
  setFullSchedule: React.Dispatch<React.SetStateAction<Schedule | null>>;
  loadedGroup: string | null;
  isLoading: boolean;
  errorMessage: string | null;
  setErrorMessage: (msg: string | null) => void;
  loadSchedule: (forcedQuery?: string) => Promise<void>;
  selectedSubgroup: number;
  showOtherSubgroup: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  groupInput,
  setGroupInput,
  fullSchedule,
  loadedGroup,
  isLoading,
  errorMessage,
  setErrorMessage,
  loadSchedule,
  selectedSubgroup,
  showOtherSubgroup
}) => {
  const schedule = useMemo(() => {
    return fullSchedule ? filterScheduleBySubgroup(fullSchedule, selectedSubgroup) : null;
  }, [fullSchedule, selectedSubgroup]);

  // Suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Details sheet states
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedStaffMember, setSelectedStaffMember] = useState<StaffMember | null>(null);
  const [sheetMode, setSheetMode] = useState<'lesson' | 'staff'>('lesson');
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const { shouldRender: renderBottomSheet, isClosing: closingBottomSheet } = useClosingModal(showBottomSheet, 300);

  // Refs for scrolling to today/next day card
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // All teacher names for autocomplete
  const allStaffNames = useRef<string[]>([]);

  // Auto scroll to active day when schedule is loaded or updated
  useEffect(() => {
    if (schedule && schedule.days.length > 0) {
      const todayIdx = findTodayIndex(schedule.days);
      if (todayIdx >= 0 && cardRefs.current[todayIdx]) {
        setTimeout(() => {
          cardRefs.current[todayIdx]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 300);
      }
    }
  }, [schedule]);

  useEffect(() => {
    const list = [
      ...StaffData.administration,
      ...StaffData.teachers,
      ...StaffData.employees
    ].map(m => m.fullName);
    allStaffNames.current = Array.from(new Set(list)).sort();
  }, []);

  // Handle auto-suggestions on input change
  useEffect(() => {
    const query = groupInput.trim();
    if (query.length >= 2 && !/\d/.test(query)) {
      const filtered = allStaffNames.current
        .filter(name => name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [groupInput]);

  const handleLessonCLick = (dayDate: string, lesson: Lesson) => {
    const originalDay = fullSchedule?.days.find(d => d.dayDate === dayDate);
    const originalLesson = originalDay?.lessons.find(l => l.lessonNumber === lesson.lessonNumber);

    if (
      originalLesson &&
      shouldShowAllSubgroupsInDetails(originalLesson, selectedSubgroup, showOtherSubgroup)
    ) {
      setSelectedLesson(originalLesson);
    } else {
      setSelectedLesson(lesson);
    }
    setSheetMode('lesson');
    setSelectedStaffMember(null);
    setShowBottomSheet(true);
  };

  // Helper to extract teacher from subject text
  const getTeacherFromSubject = (subject: string) => {
    const teacherRegex = /([А-ЯЁ][а-яё]+)\s+([А-ЯЁ]\.\s*[А-ЯЁ]\.)/;
    const match = teacherRegex.exec(subject);
    if (match) {
      const shortName = match[0];
      const member = findStaffByShortName(shortName);
      const cleanSubject = subject.replace(shortName, '').replace('()', '').trim();
      return { shortName, member, cleanSubject };
    }
    return null;
  };

  // Building of the currently searched group
  const activeBuilding = getBuildingForGroup(groupInput || loadedGroup || '');

  // Find today/next index
  const todayIndex = schedule ? findTodayIndex(schedule.days, activeBuilding) : -1;
  const showingNext = schedule ? isShowingNextDay(schedule.days, todayIndex) : false;
  const activeCallTime = selectedLesson ? getCallTime(selectedLesson.lessonNumber, activeBuilding) : undefined;

  return (
    <div className="home-screen scrollable-content">
      <div className="vignette-overlay"></div>

      {/* Search Input bar */}
      <div className="search-bar">
        <div className="search-input-box">
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Группа или фамилия"
              value={groupInput}
              onChange={(e) => setGroupInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadSchedule(groupInput)}
              disabled={isLoading}
            />
            {groupInput && (
              <button className="clear-btn" onClick={() => setGroupInput('')}>
                <X size={18} />
              </button>
            )}
          </div>

          {/* Autocomplete dropdown */}
          {showSuggestions && (
            <div className="suggestions-menu">
              {suggestions.map((name) => (
                <div
                  key={name}
                  className="suggestion-item"
                  onClick={() => {
                    const shortName = toShortName(name);
                    setGroupInput(shortName);
                    setShowSuggestions(false);
                    loadSchedule(shortName);
                  }}
                >
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className={`search-submit-btn ${isLoading ? 'is-loading' : ''}`}
          onClick={() => loadSchedule(groupInput)}
          disabled={isLoading || !groupInput.trim()}
          title={isLoading ? 'Обновление расписания...' : groupInput === loadedGroup ? 'Обновить расписание' : 'Найти'}
        >
          {isLoading ? (
            <div className="spinner" />
          ) : groupInput === loadedGroup ? (
            <RefreshCw size={20} />
          ) : (
            <Search size={20} />
          )}
        </button>
      </div>

      {/* Error alert banner */}
      {errorMessage && (
        <div className="error-banner" onClick={() => setErrorMessage(null)}>
          <AlertTriangle className="error-icon" size={24} />
          <div className="error-text">
            <h4>Не удалось загрузить</h4>
            <p>{errorMessage}</p>
          </div>
          <X className="close-alert" size={16} />
        </div>
      )}

      {/* Timetable List Display */}
      <div className="timetable-view">
        {schedule ? (
          <div className="mosaic-layout">
            {(() => {
              // Distribute days into 3 columns, with active day always in center column
              const numCols = 3;
              // Calculate offset so active day always lands in center column (index 1)
              const colOffset = todayIndex >= 0
                ? ((1 - (todayIndex % numCols)) + numCols) % numCols
                : 0;
              const columns: { day: typeof schedule.days[0]; globalIndex: number }[][] =
                Array.from({ length: numCols }, () => []);
              schedule.days.forEach((day, i) => {
                const colIdx = (i + colOffset) % numCols;
                columns[colIdx].push({ day, globalIndex: i });
              });

              // Spine row index (which row within columns has the active day)
              const spineRow = todayIndex >= 0 ? Math.floor(todayIndex / numCols) : -1;

              return columns.map((col, colIdx) => (
                <div key={`col-${colIdx}`} className="mosaic-column">
                  {col.map(({ day, globalIndex }, posInCol) => {
                    const isToday = globalIndex === todayIndex && !showingNext;
                    const isNext = globalIndex === todayIndex && showingNext;

                    let statusLabel = null;
                    if (isToday) {
                      statusLabel = 'Сегодня';
                    } else if (isNext) {
                      try {
                        const dateStr = extractDate(day.dayDate);
                        const dayDate = parseDate(dateStr);
                        if (dayDate) {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const target = new Date(dayDate.getTime());
                          target.setHours(0, 0, 0, 0);
                          const diffInDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                          if (diffInDays === 1) statusLabel = 'Завтра';
                          else if (diffInDays === 2) statusLabel = 'Послезавтра';
                          else statusLabel = 'Следующий';
                        } else {
                          statusLabel = 'Следующий';
                        }
                      } catch {
                        statusLabel = 'Следующий';
                      }
                    }

                    const isHighlighted = isToday || isNext;

                    // Determine card position relative to spine
                    let cardPosition = '';
                    if (spineRow >= 0) {
                      if (posInCol < spineRow) cardPosition = 'past';
                      else if (posInCol === spineRow) cardPosition = 'spine';
                      else cardPosition = 'future';
                    }

                    return (
                      <div
                        key={day.dayDate}
                        ref={(el) => { cardRefs.current[globalIndex] = el; }}
                        className={`day-card ${isHighlighted ? 'today' : ''} ${cardPosition ? `day-card--${cardPosition}` : ''}`}
                        style={{ order: globalIndex }}
                      >
                        <div className="day-card-header">
                          <h3>{day.dayDate}</h3>
                          {statusLabel && <span className="status-badge">{statusLabel}</span>}
                        </div>

                        <div className="lesson-list">
                          {day.lessons.length > 0 ? (
                            day.lessons.map((lesson) => {
                              return (
                                <div
                                  key={lesson.lessonNumber}
                                  className="lesson-card-item ripple"
                                  onClick={() => handleLessonCLick(day.dayDate, lesson)}
                                >
                                  <div className="lesson-num-badge">
                                    {lesson.lessonNumber}
                                  </div>
                                  <div className="lesson-info">
                                    {lesson.subgroups.length === 1 ? (
                                      <>
                                        <h4 className="lesson-title">
                                          {lesson.subgroups[0].subject || '—'}
                                        </h4>
                                        {lesson.subgroups[0].room && (
                                          <span className="room-pill">
                                            {lesson.subgroups[0].room}
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <div className="split-subgroups">
                                        {lesson.subgroups.map((sg, sgIdx) => (
                                          <React.Fragment key={sgIdx}>
                                            <div className="subgroup-row">
                                              <span className="sub-num">{sg.number}.</span>
                                              <span className="sub-title">{sg.subject || '—'}</span>
                                              {sg.room && <span className="room-pill mini">{sg.room}</span>}
                                            </div>
                                            {sgIdx < lesson.subgroups.length - 1 && <hr className="divider" />}
                                          </React.Fragment>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="no-lessons">Нет занятий</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ));
            })()}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={48} className="empty-icon" />
            <p>Введите номер группы или фамилию для просмотра расписания</p>
          </div>
        )}
      </div>

      {/* Bottom Sheet Drawer for Lesson & Staff details */}
      {renderBottomSheet && (
        <div className={`modal-backdrop ${closingBottomSheet ? 'closing' : ''}`} onClick={() => setShowBottomSheet(false)}>
          <div className={`modal-content ${closingBottomSheet ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            {sheetMode === 'lesson' && selectedLesson && (
              <div className="lesson-details-sheet">
                <div className="lesson-sheet-header">
                  <h3>Детали занятия</h3>
                  {activeCallTime && (
                    <div className="lesson-call-pill">
                      <Clock size={14} />
                      <span>{activeCallTime.pairNumber}-я пара: {formatCallTimeInterval(activeCallTime)}</span>
                    </div>
                  )}
                </div>
                <div className="details-scroll-content">
                  {selectedLesson.subgroups.map((subgroup, idx) => {
                    const parsedTeacher = getTeacherFromSubject(subgroup.subject);
                    const isNoLesson = !subgroup.subject || subgroup.subject === '-' || subgroup.subject === '—';

                    if (isNoLesson) return null;

                    return (
                      <div key={idx} className="subgroup-detail-box">
                        {subgroup.number && (
                          <div className="subgroup-header">Подгруппа {subgroup.number}</div>
                        )}
                        <div className="detail-row-item">
                          <Info className="detail-icon" size={20} />
                          <div>
                            <span className="label">Предмет</span>
                            <span className="value">
                              {parsedTeacher ? parsedTeacher.cleanSubject : subgroup.subject}
                            </span>
                          </div>
                        </div>

                        {subgroup.room && (
                          <div className="detail-row-item">
                            <MapPin className="detail-icon" size={20} />
                            <div>
                              <span className="label">Аудитория: {subgroup.room}</span>
                              <span className="value">{getRoomDescription(subgroup.room)}</span>
                            </div>
                          </div>
                        )}

                        {parsedTeacher && (
                          <div
                            className={`detail-row-item ${parsedTeacher.member ? 'clickable' : ''}`}
                            onClick={() => {
                              if (parsedTeacher.member) {
                                setSelectedStaffMember(parsedTeacher.member);
                                setSheetMode('staff');
                              }
                            }}
                          >
                            <User className="detail-icon" size={20} />
                            <div>
                              <span className="label">Преподаватель</span>
                              <span className="value">
                                {parsedTeacher.member ? parsedTeacher.member.fullName : parsedTeacher.shortName}
                              </span>
                              {parsedTeacher.member && (
                                <span className="action-hint">Нажмите для информации о преподавателе</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button className="modal-close" onClick={() => setShowBottomSheet(false)}>Закрыть</button>
              </div>
            )}

            {sheetMode === 'staff' && selectedStaffMember && (
              <div className="staff-details-sheet">
                <button className="back-btn" onClick={() => setSheetMode('lesson')}>
                  <ChevronLeft size={16} />
                  <span>Назад к занятию</span>
                </button>
                <div className="member-sheet-header">
                  <div className="member-sheet-avatar">
                    {selectedStaffMember.fullName.charAt(0)}
                  </div>
                  <div className="member-sheet-title">
                    <h2>{selectedStaffMember.fullName}</h2>
                    <p className="position">{selectedStaffMember.position}</p>
                  </div>
                </div>

                <div className="member-details-body">
                  {selectedStaffMember.qualification && (
                    <div className="detail-item">
                      <span className="label">Категория</span>
                      <p>{selectedStaffMember.qualification}</p>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="label">Образование</span>
                    <p>{selectedStaffMember.education}</p>
                  </div>
                </div>

                <div className="member-sheet-actions">
                  <button
                    className="view-schedule-btn"
                    onClick={() => {
                      const shortName = toShortName(selectedStaffMember.fullName);
                      setGroupInput(shortName);
                      setShowBottomSheet(false);
                      loadSchedule(shortName);
                    }}
                  >
                    Посмотреть расписание
                  </button>
                  <button className="close-sheet-btn" onClick={() => setShowBottomSheet(false)}>
                    Закрыть
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
