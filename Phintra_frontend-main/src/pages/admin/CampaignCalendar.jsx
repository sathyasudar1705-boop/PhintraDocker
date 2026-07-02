import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import { 
  Calendar, Plus, Mail, Users, CheckCircle2, AlertCircle, 
  ChevronLeft, ChevronRight, X, Clock, Eye, Filter, Info, 
  TrendingUp, CalendarRange, ShieldAlert, Sparkles, Check, Trash2
} from 'lucide-react';
import Button from '../../components/common/Button';

const CampaignCalendar = () => {
  const { campaignEvents, addCampaignEvent, deleteCampaignEvent, emailTemplates } = useAppContext();
  const toast = useToast();
  const confirm = useConfirm();

  const handleDeleteEvent = async (eventId) => {
    const confirmed = await confirm({
      title: 'Delete Scheduled Event?',
      description: 'Are you sure you want to delete this scheduled campaign event? This action will remove it from the calendar.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteCampaignEvent(eventId);
      setSelectedEvent(null);
      if (toast) toast.success("Campaign event deleted successfully");
    }
  };

  // Dynamic Date States (starts at May 2026 to showcase dummy events)
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 4, 1));
  const [activeFilters, setActiveFilters] = useState(['Active', 'Completed', 'Scheduled']);
  
  // Modals
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form State
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTargetUsers, setNewTargetUsers] = useState(100);

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthName = `${monthNames[month]} ${year}`;

  // Date Navigation handlers
  const handlePrevMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date(2026, 4, 1));
    if (toast) toast.info("Returned to May 2026 Campaign Schedule");
  };

  const toggleFilter = (status) => {
    if (activeFilters.includes(status)) {
      if (activeFilters.length > 1) {
        setActiveFilters(prev => prev.filter(s => s !== status));
      } else {
        if (toast) toast.error("Please keep at least one status active");
      }
    } else {
      setActiveFilters(prev => [...prev, status]);
    }
  };

  // Generate dynamic days array
  const firstDayOfMonth = new Date(year, month, 1);
  const startOffsetDays = firstDayOfMonth.getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < startOffsetDays; i++) {
    daysArray.push({ type: 'empty', key: `empty-${i}` });
  }
  for (let i = 1; i <= totalDaysInMonth; i++) {
    daysArray.push({ type: 'day', day: i, key: `day-${i}` });
  }

  // Row segments (groups of 7 days)
  const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };
  const calendarRows = chunkArray(daysArray, 7);

  // Filter events matched
  const getEventsForDate = (dayNumber) => {
    const formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNumber.toString().padStart(2, '0')}`;
    return (campaignEvents || []).filter(e => e.date === formattedDate && activeFilters.includes(e.status));
  };

  // Check if day is "today" (May 29, 2026 or real-world today)
  const isToday = (dayNumber) => {
    const isTargetToday = year === 2026 && month === 4 && dayNumber === 29;
    const realToday = new Date();
    const isRealToday = year === realToday.getFullYear() && month === realToday.getMonth() && dayNumber === realToday.getDate();
    return isTargetToday || isRealToday;
  };

  // Get status color styling
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return {
          bg: 'rgba(59, 130, 246, 0.08)',
          text: 'var(--color-primary, #3b82f6)',
          border: 'rgba(59, 130, 246, 0.2)',
          dotBg: 'var(--color-primary, #3b82f6)'
        };
      case 'Completed':
        return {
          bg: 'rgba(16, 185, 129, 0.08)',
          text: 'var(--color-success, #10b981)',
          border: 'rgba(16, 185, 129, 0.2)',
          dotBg: 'var(--color-success, #10b981)'
        };
      case 'Scheduled':
        return {
          bg: 'rgba(245, 158, 11, 0.08)',
          text: 'var(--color-warning, #f59e0b)',
          border: 'rgba(245, 158, 11, 0.2)',
          dotBg: 'var(--color-warning, #f59e0b)'
        };
      default:
        return {
          bg: 'var(--bg-sidebar)',
          text: 'var(--text-muted)',
          border: 'var(--border-color)',
          dotBg: 'var(--text-light)'
        };
    }
  };

  // Quick Schedule handler from cell click
  const handleQuickSchedule = (dayNumber) => {
    const formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNumber.toString().padStart(2, '0')}`;
    setNewEventDate(formattedDate);
    if (emailTemplates && emailTemplates.length > 0) {
      setNewTemplateName(emailTemplates[0].name);
    } else {
      setNewTemplateName('CEO Gift Card Request');
    }
    setShowScheduleModal(true);
  };

  const handleOpenGeneralSchedule = () => {
    setNewEventDate('');
    if (emailTemplates && emailTemplates.length > 0) {
      setNewTemplateName(emailTemplates[0].name);
    } else {
      setNewTemplateName('CEO Gift Card Request');
    }
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!newEventName.trim() || !newEventDate || !newTemplateName) {
      if (toast) toast.error("Please fill in all required fields");
      return;
    }

    addCampaignEvent({
      name: newEventName.trim(),
      date: newEventDate,
      templateName: newTemplateName,
      targetUsers: Number(newTargetUsers)
    });

    if (toast) {
      toast.success(`Simulation drill "${newEventName}" successfully scheduled!`);
    }
    
    // Reset
    setShowScheduleModal(false);
    setNewEventName('');
    setNewEventDate('');
    setNewTargetUsers(100);
  };

  // Filtered upcoming events list
  const upcomingEvents = (campaignEvents || [])
    .filter(e => (e.status === 'Scheduled' || e.status === 'Active') && activeFilters.includes(e.status))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calendar stats calculations
  const totalCampaigns = (campaignEvents || []).length;
  const activeCount = (campaignEvents || []).filter(e => e.status === 'Active').length;
  const completedCount = (campaignEvents || []).filter(e => e.status === 'Completed').length;
  const scheduledCount = (campaignEvents || []).filter(e => e.status === 'Scheduled').length;

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Simulation Calendar</h1>
          <p>Schedule, manage, and coordinate threat simulation runs over the monthly roadmap schedule.</p>
        </div>
        <Button 
          onClick={handleOpenGeneralSchedule}
          variant="primary"
          icon={Plus}
        >
          Schedule New Campaign
        </Button>
      </div>

      {/* Two-Column Grid Workspace */}
      <div className="calendar-workspace">
        
        {/* Left Column: Sidebar Controls & KPI Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* KPI Statistics */}
          <div className="sidebar-card">
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '14px', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={16} style={{ color: 'var(--color-primary)' }} />
              Schedule Summary
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Total Campaigns', value: totalCampaigns, color: 'var(--text-main)', icon: CalendarRange },
                { label: 'Active', value: activeCount, color: 'var(--color-primary, #3b82f6)', icon: Clock },
                { label: 'Completed', value: completedCount, color: 'var(--color-success, #10b981)', icon: CheckCircle2 },
                { label: 'Scheduled', value: scheduledCount, color: 'var(--color-warning, #f59e0b)', icon: AlertCircle }
              ].map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-main)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <item.icon size={14} style={{ color: item.color }} />
                    <span>{item.label}</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Status Filter Toggles */}
          <div className="sidebar-card">
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '14px', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={15} style={{ color: 'var(--color-primary)' }} />
              Filter By Status
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { status: 'Active', color: 'var(--color-primary, #3b82f6)', activeBg: 'rgba(59, 130, 246, 0.1)' },
                { status: 'Completed', color: 'var(--color-success, #10b981)', activeBg: 'rgba(16, 185, 129, 0.1)' },
                { status: 'Scheduled', color: 'var(--color-warning, #f59e0b)', activeBg: 'rgba(245, 158, 11, 0.1)' }
              ].map((item) => {
                const isActive = activeFilters.includes(item.status);
                return (
                  <button
                    key={item.status}
                    onClick={() => toggleFilter(item.status)}
                    className="filter-pill"
                    style={{
                      borderColor: isActive ? item.color : 'var(--border-color)',
                      backgroundColor: isActive ? item.activeBg : 'transparent',
                      color: isActive ? item.color : 'var(--text-muted)'
                    }}
                  >
                    <span>{item.status} Drills</span>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      border: `1px solid ${isActive ? item.color : 'var(--border-color)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isActive ? item.color : 'transparent',
                      color: '#ffffff',
                      transition: 'all 0.15s'
                    }}>
                      {isActive && <Check size={10} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming Drills List */}
          <div className="sidebar-card">
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '14px', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} style={{ color: 'var(--color-primary)' }} />
              Upcoming Drills
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
              {upcomingEvents.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-light)', fontSize: '12px' }}>
                  No upcoming events in calendar.
                </div>
              ) : (
                upcomingEvents.map(evt => {
                  const colors = getStatusColor(evt.status);
                  const dateObj = new Date(evt.date);
                  const formattedDateText = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  return (
                    <div 
                      key={evt.id} 
                      onClick={() => setSelectedEvent(evt)}
                      className="upcoming-item"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: colors.text }}>
                          {evt.status}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{formattedDateText}</span>
                      </div>
                      <strong style={{ fontSize: '12px', color: 'var(--text-main)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{evt.name}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lure: {evt.templateName}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Calendar Grid Board */}
        <div className="saas-card" style={{ padding: '24px', margin: 0 }}>
          
          {/* Calendar Month Header Banner */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} style={{ color: 'var(--color-primary)' }} />
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>{monthName}</h2>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={handlePrevMonth}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.15s ease'
                }}
                className="sidebar-nav-hover"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleToday}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '12px',
                  transition: 'all 0.15s ease'
                }}
                className="sidebar-nav-hover"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.15s ease'
                }}
                className="sidebar-nav-hover"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Week Days Header Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            textAlign: 'center',
            fontWeight: '700',
            fontSize: '11px',
            color: 'var(--text-light)',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '8px',
            marginBottom: '8px',
            letterSpacing: '0.5px'
          }}>
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>

          {/* Monthly Day Cell Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {calendarRows.map((row, rIdx) => (
              <div 
                key={`row-${rIdx}`} 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                  gap: '8px'
                }}
              >
                {row.map((cell) => {
                  if (cell.type === 'empty') {
                    return (
                      <div 
                        key={cell.key} 
                        style={{
                          backgroundColor: 'var(--bg-main)',
                          border: '1px dashed var(--border-color)',
                          borderRadius: '12px',
                          minHeight: '120px'
                        }}
                      />
                    );
                  }

                  const dayEvents = getEventsForDate(cell.day);
                  const isCurrentDay = isToday(cell.day);
                  return (
                    <div 
                      key={cell.key} 
                      className="calendar-day-cell"
                    >
                      {/* Cell Header: Number + hover quick schedule icon */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span style={{ 
                          fontSize: '13px', 
                          fontWeight: '700', 
                          color: isCurrentDay ? '#ffffff' : 'var(--text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: isCurrentDay ? 'var(--color-primary, #3b82f6)' : 'transparent',
                          boxShadow: isCurrentDay ? '0 0 10px rgba(59, 130, 246, 0.4)' : 'none'
                        }}>
                          {cell.day}
                        </span>
                        
                        <button
                          onClick={() => handleQuickSchedule(cell.day)}
                          className="quick-add-btn"
                          style={{
                            background: 'var(--color-primary-light, #eff6ff)',
                            border: 'none',
                            color: 'var(--color-primary, #3b82f6)',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                          title={`Schedule simulation on day ${cell.day}`}
                        >
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      </div>

                      {/* Event Listing inside Cell */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto', marginTop: '4px' }}>
                        {dayEvents.map(evt => {
                          const colors = getStatusColor(evt.status);
                          return (
                            <div 
                              key={evt.id} 
                              onClick={() => setSelectedEvent(evt)}
                              className="event-pill"
                              style={{
                                backgroundColor: colors.bg,
                                color: colors.text,
                                border: `1px solid ${colors.border}`,
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title={`${evt.name} (${evt.status})`}
                            >
                              <span style={{
                                width: '5px',
                                height: '5px',
                                borderRadius: '50%',
                                backgroundColor: colors.dotBg,
                                flexShrink: 0
                              }}></span>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{evt.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* 1. View Event Details Modal */}
      {selectedEvent && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }}>
          <div className="modal-card" style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '460px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarRange size={18} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Drill Details</h3>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', display: 'flex' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Simulation Title</span>
                <strong style={{ color: 'var(--text-main)', fontSize: '14px' }}>{selectedEvent.name}</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '14px 0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ color: 'var(--text-light)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Launch Date</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{selectedEvent.date}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ color: 'var(--text-light)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Target Count</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{selectedEvent.targetUsers} Employees</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Selected Email Lure</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <Mail size={14} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{selectedEvent.templateName}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Deployment Status</span>
                <span className={`badge badge-${selectedEvent.status.toLowerCase()}`} style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>
                  {selectedEvent.status}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <Button
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                variant="danger"
                icon={Trash2}
              >
                Delete Event
              </Button>
              <Button
                onClick={() => setSelectedEvent(null)}
                variant="secondary"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Schedule Event Modal Form */}
      {showScheduleModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }}>
          <div className="modal-card" style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '460px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Schedule Simulation Drill</h3>
              </div>
              <button 
                onClick={() => setShowScheduleModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', display: 'flex' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Campaign Title</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Security Awareness Drive"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-hover)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '13px'
                  }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Execution Date</label>
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-hover)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '13px'
                  }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Select Email Blueprint Lure</label>
                <select
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-hover)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '13px'
                  }}
                >
                  {emailTemplates && emailTemplates.length > 0 ? (
                    emailTemplates.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="CEO Gift Card Request">CEO Gift Card Request</option>
                      <option value="Mandatory Password Reset">Mandatory Password Reset</option>
                      <option value="Annual Benefits Update">Annual Benefits Update</option>
                      <option value="Slack Account Deactivation Warning">Slack Account Deactivation Warning</option>
                      <option value="Failed Shipping Delivery">Failed Shipping Delivery</option>
                    </>
                  )}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Target Employee Count</label>
                <input
                  type="number"
                  min="1"
                  value={newTargetUsers}
                  onChange={(e) => setNewTargetUsers(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-hover)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '13px'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <Button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  Schedule Drill
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded High Fidelity Styles */}
      <style>{`
        .calendar-workspace {
          display: grid;
          grid-template-columns: 290px 1fr;
          gap: 24px;
          margin-top: 8px;
        }
        
        .sidebar-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          box-shadow: var(--shadow-sm);
        }
        
        .filter-pill {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: transparent;
          width: 100%;
        }
        
        .filter-pill:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }
        
        .upcoming-item {
          padding: 12px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background-color: var(--bg-main);
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .upcoming-item:hover {
          border-color: var(--color-primary);
          background-color: var(--bg-card);
          transform: translateX(4px);
          box-shadow: var(--shadow-sm);
        }
        
        .calendar-day-cell {
          position: relative;
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 8px;
          min-height: 110px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .calendar-day-cell:hover {
          border-color: var(--color-primary);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03), var(--shadow-sm);
        }
        
        .calendar-day-cell .quick-add-btn {
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.15s ease;
        }
        
        .calendar-day-cell:hover .quick-add-btn {
          opacity: 1;
          transform: scale(1);
        }
        
        .event-pill {
          transition: all 0.15s ease;
        }
        
        .event-pill:hover {
          transform: translateX(1px);
          filter: brightness(0.96);
        }
        
        .modal-overlay {
          aria-hidden: true;
          animation: calendarFadeIn 0.2s ease-out forwards;
        }
        
        .modal-card {
          animation: calendarSlideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        @keyframes calendarFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes calendarSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 1024px) {
          .calendar-workspace {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CampaignCalendar;
