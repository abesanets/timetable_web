import React, { useState } from 'react';
import { StaffData } from '../../data/staffData';
import type { StaffMember } from '../../data/staffData';
import { Search, ChevronRight, BookOpen, GraduationCap, Briefcase } from 'lucide-react';
import { toShortName } from '../../utils/staffUtils';
import { useClosingModal } from '../../hooks/useClosingModal';
import './StaffScreen.css';

interface StaffScreenProps {
  onViewSchedule: (teacherShortName: string) => void;
}

export const StaffScreen: React.FC<StaffScreenProps> = ({ onViewSchedule }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'admin' | 'teachers' | 'employees'>('teachers');
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [showMemberSheet, setShowMemberSheet] = useState(false);
  const { shouldRender: renderMemberSheet, isClosing: closingMemberSheet } = useClosingModal(showMemberSheet, 300);

  // Group members into their category lists
  const members = 
    activeCategory === 'admin' ? StaffData.administration :
    activeCategory === 'teachers' ? StaffData.teachers :
    StaffData.employees;

  // Filter based on search query (case-insensitive)
  const filteredMembers = members.filter(m =>
    m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryTitle = (cat: string) => {
    if (cat === 'admin') return 'Администрация';
    if (cat === 'teachers') return 'Преподаватели';
    return 'Сотрудники';
  };

  return (
    <div className="staff-screen scrollable-content">
      <div className="screen-header">
        <h1>Сотрудники</h1>
      </div>

      {/* Search Input */}
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Поиск по имени или должности"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Selection Pills */}
      <div className="category-pills">
        {(['admin', 'teachers', 'employees'] as const).map((cat) => (
          <button
            key={cat}
            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => { setActiveCategory(cat); setShowMemberSheet(false); }}
          >
            {getCategoryTitle(cat)}
          </button>
        ))}
      </div>

      {/* Members List */}
      <div className="members-list">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member, index) => (
            <div
              key={index}
              className="member-item-card"
              onClick={() => { setSelectedMember(member); setShowMemberSheet(true); }}
            >
              <div className="member-avatar">
                {member.fullName.charAt(0)}
              </div>
              <div className="member-summary">
                <h3>{member.fullName}</h3>
                <p>{member.position}</p>
              </div>
              <ChevronRight className="chevron-icon" size={20} />
            </div>
          ))
        ) : (
          <div className="empty-results">
            <p>Ничего не найдено</p>
          </div>
        )}
      </div>

      {/* Detailed Sheet Modal */}
      {renderMemberSheet && selectedMember && (
        <div className={`modal-backdrop ${closingMemberSheet ? 'closing' : ''}`} onClick={() => setShowMemberSheet(false)}>
          <div className={`modal-content ${closingMemberSheet ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="member-sheet-header">
              <div className="member-sheet-avatar">
                {selectedMember.fullName.charAt(0)}
              </div>
              <div className="member-sheet-title">
                <h2>{selectedMember.fullName}</h2>
                <p className="position">{selectedMember.position}</p>
              </div>
            </div>

            <div className="member-details-body">
              {selectedMember.qualification && (
                <div className="detail-item">
                  <GraduationCap className="detail-icon" size={20} />
                  <div>
                    <h4>Квалификационная категория</h4>
                    <p>{selectedMember.qualification}</p>
                  </div>
                </div>
              )}

              <div className="detail-item">
                <Briefcase className="detail-icon" size={20} />
                <div>
                  <h4>Образование</h4>
                  <p>{selectedMember.education}</p>
                </div>
              </div>
            </div>

            <div className="member-sheet-actions">
              {activeCategory === 'teachers' && (
                <button
                  className="view-schedule-btn"
                  onClick={() => {
                    const shortName = toShortName(selectedMember.fullName);
                    onViewSchedule(shortName);
                    setShowMemberSheet(false);
                  }}
                >
                  <BookOpen size={18} />
                  <span>Посмотреть расписание</span>
                </button>
              )}
              <button className="close-sheet-btn" onClick={() => setShowMemberSheet(false)}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
