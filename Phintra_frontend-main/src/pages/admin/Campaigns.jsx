import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useConfirm } from '../../hooks/useConfirm';
import { Search, Filter, Plus, Eye, Edit3, Trash2, Calendar, Users, Percent, Send, ChevronDown, MoreHorizontal, Target, Shield, CheckCircle2, Mail } from 'lucide-react';
import Button from '../../components/common/Button';
import api from '../../services/api';

const AdminCampaigns = () => {
  const { campaigns, deleteCampaign, emailTemplates, fetchData, departments } = useAppContext();
  const navigate = useNavigate();
  const confirm = useConfirm();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('active');
  const [typeFilter, setTypeFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [openMenuId, setOpenMenuId] = useState(null);

  // Modal States
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [editCampaign, setEditCampaign] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState('Active');

  const getTemplateName = (templateId) => {
    if (!templateId) return "No Template";
    const template = emailTemplates?.find(t => t.id === templateId);
    return template ? template.title : "Unknown Template";
  };

  const getIconColor = (id) => {
    let hash = 0;
    if (id) {
      for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
      }
    }
    const colors = [
      { bg: '#FFF7ED', color: '#EA580C' },
      { bg: '#ECFDF5', color: '#059669' },
      { bg: '#F0F9FF', color: '#0284C7' },
      { bg: '#FDF2F8', color: '#DB2777' },
      { bg: '#FAF5FF', color: '#7C3AED' },
      { bg: '#FEFCE8', color: '#CA8A04' }
    ];
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getBadgeDotColor = (status) => {
    switch (status) {
      case 'Active':
      case 'Launched':
        return 'var(--color-success)';
      case 'Completed':
        return 'var(--color-primary)';
      case 'Draft':
        return 'var(--color-warning)';
      default:
        return 'var(--text-light)';
    }
  };

  const getCardIcon = (type) => {
    const t = String(type).toLowerCase();
    if (t.includes('spear')) return Mail;
    if (t.includes('credential')) return Shield;
    if (t.includes('mfa')) return Users;
    return Target;
  };

  const handleToggleMenu = (id) => {
    setOpenMenuId(prev => prev === id ? null : id);
  };

  const handleLaunch = async (camp) => {
    const titleVal = camp.title || camp.name || 'Simulation Drill';
    const confirmed = await confirm({
      title: 'Launch Simulation Drill?',
      description: `This will immediately dispatch the simulated phishing emails to all assigned employees for "${titleVal}".`,
      confirmText: 'Yes, Send Now',
      cancelText: 'Cancel',
      variant: 'success'
    });
    if (confirmed) {
      try {
        await api.post(`/campaigns/${camp.id}/launch`);
        await fetchData();
      } catch (err) {
        alert("Failed to launch campaign: " + (err.response?.data?.detail || err.message));
      }
    }
  };

  // Safe fallback if campaigns is undefined
  const campaignsList = campaigns || [];

  // Counts for tabs
  const activeCount = campaignsList.filter(c => c.status !== 'Archived').length;
  const archivedCount = campaignsList.filter(c => c.status === 'Archived').length;

  // Filtered campaigns
  const filteredCampaigns = campaignsList.filter((camp) => {
    const titleVal = camp.title || camp.name || '';
    const matchesSearch = titleVal.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Tab filter
    const matchesTab = activeTab === 'active' ? camp.status !== 'Archived' : camp.status === 'Archived';
    
    // Dropdown filters
    const matchesStatus = statusFilter === 'All' || camp.status === statusFilter;
    const matchesType = typeFilter === 'All' || camp.type === typeFilter;
    const matchesDept = deptFilter === 'All' || camp.department === deptFilter;
    
    return matchesSearch && matchesTab && matchesStatus && matchesType && matchesDept;
  });

  // Sorted campaigns
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    if (sortBy === 'sent') {
      return (b.sent || 0) - (a.sent || 0);
    }
    if (sortBy === 'success') {
      return (b.success_rate || 0) - (a.success_rate || 0);
    }
    // Default: date (newest first)
    const dateA = new Date(a.created_at || a.launch_date || 0);
    const dateB = new Date(b.created_at || b.launch_date || 0);
    return dateB - dateA;
  });

  const totalReported = analyticsData?.total_reported ?? analyticsData?.reported_employees?.length ?? 0;
  const reportedRate = analyticsData?.reported_rate_percentage ?? 0;
  const reportedEmployees = analyticsData?.reported_employees ?? [];
  const clickedEmployees = analyticsData?.clicked_employees ?? [];

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Campaign?',
      description: 'This action cannot be undone. The campaign and its data will be permanently removed.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      try {
        await deleteCampaign(id);
      } catch (err) {
        alert("Failed to delete campaign: " + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleViewDetails = async (camp) => {
    setSelectedCampaign(camp);
    setAnalyticsData(null);
    setAnalyticsLoading(true);
    try {
      const res = await api.get(`/campaigns/analytics/${camp.id}`);
      setAnalyticsData(res.data);
    } catch (err) {
      console.error("Failed to load campaign analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleOpenEdit = (camp) => {
    setEditCampaign(camp);
    setEditName(camp.title || camp.name || '');
    setEditDesc(camp.description || '');
    setEditStatus(camp.status || 'Active');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName) return;

    try {
      await api.put(`/campaigns/${editCampaign.id}`, {
        title: editName,
        description: editDesc,
        status: editStatus
      });
      await fetchData();
      setEditCampaign(null);
    } catch (err) {
      alert("Failed to save changes: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Simulation Campaigns</h1>
          <p>Deploy and monitor active security testing simulations inside the organization.</p>
        </div>
        <Button 
          onClick={() => navigate('/admin/create-campaign')}
          variant="primary"
          icon={Plus}
        >
          Create Campaign
        </Button>
      </div>

      {/* Top Tabs and Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '24px' }}>
          <button 
            onClick={() => setActiveTab('active')}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 4px',
              fontSize: '15px',
              fontWeight: activeTab === 'active' ? '600' : '500',
              color: activeTab === 'active' ? 'var(--color-primary)' : 'var(--text-light)',
              borderBottom: activeTab === 'active' ? '2px solid var(--color-primary)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>Active</span>
            <span style={{ 
              fontSize: '11px', 
              backgroundColor: activeTab === 'active' ? 'var(--color-primary-light)' : 'var(--color-soft-bg)', 
              color: activeTab === 'active' ? 'var(--color-primary)' : 'var(--text-light)',
              padding: '2px 8px', 
              borderRadius: '12px',
              fontWeight: '600'
            }}>
              {activeCount}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('archived')}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 4px',
              fontSize: '15px',
              fontWeight: activeTab === 'archived' ? '600' : '500',
              color: activeTab === 'archived' ? 'var(--color-primary)' : 'var(--text-light)',
              borderBottom: activeTab === 'archived' ? '2px solid var(--color-primary)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>Archived</span>
            <span style={{ 
              fontSize: '11px', 
              backgroundColor: activeTab === 'archived' ? 'var(--color-primary-light)' : 'var(--color-soft-bg)', 
              color: activeTab === 'archived' ? 'var(--color-primary)' : 'var(--text-light)',
              padding: '2px 8px', 
              borderRadius: '12px',
              fontWeight: '600'
            }}>
              {archivedCount}
            </span>
          </button>
        </div>

        {/* Dropdown Filters on the Right */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', paddingBottom: '8px' }}>
          
          {/* Triggered By (Campaign Type) */}
          <div style={{ position: 'relative' }}>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                padding: '8px 32px 8px 12px',
                fontSize: '13px',
                fontWeight: '500',
                color: 'var(--text-main)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                minWidth: '130px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            >
              <option value="All">Triggered By: All</option>
              <option value="Link Phishing">Link Phishing</option>
              <option value="Spear Phishing">Spear Phishing</option>
              <option value="Credential Harvesting">Credential Harvesting</option>
              <option value="MFA Bypass">MFA Bypass</option>
            </select>
            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-light)', display: 'flex' }}>
              <ChevronDown size={14} />
            </div>
          </div>

          {/* Status */}
          <div style={{ position: 'relative' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                padding: '8px 32px 8px 12px',
                fontSize: '13px',
                fontWeight: '500',
                color: 'var(--text-main)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                minWidth: '120px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            >
              <option value="All">Status: All</option>
              <option value="Active">Active</option>
              <option value="Launched">Launched</option>
              <option value="Completed">Completed</option>
              <option value="Draft">Draft</option>
            </select>
            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-light)', display: 'flex' }}>
              <ChevronDown size={14} />
            </div>
          </div>

          {/* Tags (Departments) */}
          <div style={{ position: 'relative' }}>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                padding: '8px 32px 8px 12px',
                fontSize: '13px',
                fontWeight: '500',
                color: 'var(--text-main)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                minWidth: '120px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            >
              <option value="All">Tags: All</option>
              {departments?.map(dept => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-light)', display: 'flex' }}>
              <ChevronDown size={14} />
            </div>
          </div>

          {/* Sort By */}
          <div style={{ position: 'relative' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                padding: '8px 32px 8px 12px',
                fontSize: '13px',
                fontWeight: '500',
                color: 'var(--text-main)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                minWidth: '160px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            >
              <option value="date">Sort by: Created Date</option>
              <option value="sent">Sort by: Sent Email</option>
              <option value="success">Sort by: Success Rate</option>
            </select>
            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-light)', display: 'flex' }}>
              <ChevronDown size={14} />
            </div>
          </div>

        </div>
      </div>

      {/* Search Input and Filter Reset bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search campaigns by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px', height: '38px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
          />
          <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', display: 'flex' }}>
            <Search size={16} />
          </div>
        </div>
        {(typeFilter !== 'All' || statusFilter !== 'All' || deptFilter !== 'All' || searchQuery !== '') && (
          <button 
            onClick={() => { setTypeFilter('All'); setStatusFilter('All'); setDeptFilter('All'); setSearchQuery(''); }}
            style={{ fontSize: '13px', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Campaigns Listing Grid */}
      {sortedCampaigns.length === 0 ? (
        <div className="saas-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-light)' }}>
          <Percent size={48} style={{ color: 'var(--text-subtle)', marginBottom: '16px' }} />
          <h3>No campaigns found</h3>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Try modifying your search query or launch a new campaign.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sortedCampaigns.map((camp) => {
            const titleVal = camp.title || camp.name || 'Simulation Drill';
            const CardIcon = getCardIcon(camp.type);
            const iconColor = getIconColor(camp.id);
            
            return (
              <div key={camp.id} className="campaign-card animate-fade-in" style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'stretch',
                gap: '24px',
                position: 'relative'
              }}>
                {/* Left Side: Icon, Title, Description, Tags */}
                <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: '0' }}>
                  {/* Colored Icon box */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: iconColor.bg,
                    color: iconColor.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <CardIcon size={22} />
                  </div>
                  
                  {/* Title & Desc & Tags */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '0' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {titleVal}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.5' }}>
                      {camp.description}
                    </p>
                    
                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', backgroundColor: 'var(--color-soft-bg)', padding: '4px 10px', borderRadius: '20px' }}>
                        {camp.type || 'Phishing Drill'}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', backgroundColor: 'var(--color-soft-bg)', padding: '4px 10px', borderRadius: '20px' }}>
                        {camp.department || 'All Departments'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Micro-stats, Status, ... & Large funnel metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px', minWidth: '380px' }}>
                  {/* Top Right: Micro-stats, Status, actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
                    {/* Micro-metrics */}
                    <div style={{ display: 'flex', gap: '12px', color: 'var(--text-light)', fontSize: '13px', fontWeight: '600' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Opened Count">
                        <Mail size={14} style={{ color: 'var(--text-subtle)' }} />
                        <span>{String(camp.opened || 0).padStart(2, '0')}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Reported Count">
                        <CheckCircle2 size={14} style={{ color: 'var(--text-subtle)' }} />
                        <span>{String(camp.reported || 0).padStart(2, '0')}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`badge badge-${camp.status.toLowerCase()}`} style={{
                      textTransform: 'capitalize',
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      border: '1px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getBadgeDotColor(camp.status), display: 'inline-block' }} />
                      {camp.status === 'Launched' ? 'Running' : camp.status}
                    </span>

                    {/* Action Menu (Three dot Dropdown) */}
                    <div style={{ position: 'relative' }}>
                      <button 
                        onClick={() => handleToggleMenu(camp.id)}
                        style={{
                          background: 'none',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-light)',
                          cursor: 'pointer'
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {/* Dropdown Menu Popup */}
                      {openMenuId === camp.id && (
                        <>
                          {/* Overlay to close menu on click outside */}
                          <div 
                            onClick={() => setOpenMenuId(null)}
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                          />
                          <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '38px',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                            zIndex: 1000,
                            minWidth: '150px',
                            padding: '6px 0'
                          }}>
                            {camp.status === 'Draft' && (
                              <button 
                                onClick={() => { setOpenMenuId(null); handleLaunch(camp); }}
                                style={{ width: '100%', padding: '10px 16px', fontSize: '13px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontFamily: 'inherit' }}
                              >
                                <Send size={14} /> Launch Drill
                              </button>
                            )}
                            <button 
                              onClick={() => { setOpenMenuId(null); handleViewDetails(camp); }}
                              style={{ width: '100%', padding: '10px 16px', fontSize: '13px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontFamily: 'inherit' }}
                            >
                              <Eye size={14} /> View Details
                            </button>
                            <button 
                              onClick={() => { setOpenMenuId(null); handleOpenEdit(camp); }}
                              style={{ width: '100%', padding: '10px 16px', fontSize: '13px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontFamily: 'inherit' }}
                            >
                              <Edit3 size={14} /> Edit Campaign
                            </button>
                            <button 
                              onClick={() => { setOpenMenuId(null); handleDelete(camp.id); }}
                              style={{ width: '100%', padding: '10px 16px', fontSize: '13px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', fontFamily: 'inherit' }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Bottom Right: Aligned Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
                    {/* Delivered */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>{camp.sent || 0}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: '600', marginTop: '2px' }}>Delivered</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>Total Sent</span>
                    </div>
                    {/* Opened */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>{camp.opened || 0}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: '600', marginTop: '2px' }}>Opened</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>Total Opened</span>
                    </div>
                    {/* Clicked */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-danger)' }}>{camp.clicked || 0}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: '600', marginTop: '2px' }}>Clicked</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>Failed Test</span>
                    </div>
                    {/* Reported */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-teal)' }}>{camp.reported || 0}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: '600', marginTop: '2px' }}>Reported</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>Successful</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. Campaign Details Modal */}
      {selectedCampaign && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h2>Campaign Intelligence details</h2>
              <button onClick={() => setSelectedCampaign(null)} className="close-btn">&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span className={`badge badge-${selectedCampaign.status.toLowerCase()}`} style={{ float: 'right' }}>
                  {selectedCampaign.status}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{selectedCampaign.title || selectedCampaign.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '6px' }}>
                  Created on {selectedCampaign.created_at ? new Date(selectedCampaign.created_at).toLocaleDateString() : (selectedCampaign.createdDate || 'N/A')}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '6px' }}>Campaign Description</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{selectedCampaign.description}</p>
              </div>

              <div className="modal-grid-2col" style={{
                gap: '16px',
                backgroundColor: 'var(--bg-main)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Target Volume</span>
                  <div style={{ fontSize: '18px', fontWeight: '700', marginTop: '4px', color: 'var(--text-main)' }}>
                    {selectedCampaign.employee_count !== undefined ? selectedCampaign.employee_count : (selectedCampaign.targetUsers || 0)} Employees
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Template Design</span>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginTop: '4px', color: 'var(--color-primary)' }}>
                    {getTemplateName(selectedCampaign.template_id)}
                  </div>
                </div>
              </div>

              {selectedCampaign.status !== 'Draft' && (
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '12px' }}>Simulated Funnel Metrics</h4>
                  {analyticsLoading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)', fontSize: '13px' }}>
                      Loading real-time campaign analytics...
                    </div>
                  ) : analyticsData ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span>Emails Sent</span>
                          <strong style={{ color: 'var(--text-main)' }}>{analyticsData.total_sent}</strong>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px' }}>
                          <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-primary)' }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span>Emails Delivered</span>
                          <strong style={{ color: 'var(--text-main)' }}>{analyticsData.total_delivered}</strong>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px' }}>
                          <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-success)' }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span>Emails Clicked (Simulation Failure)</span>
                          <strong style={{ color: 'var(--color-danger)' }}>
                            {analyticsData.total_clicked} ({analyticsData.click_rate_percentage}%)
                          </strong>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px' }}>
                          <div style={{ width: `${analyticsData.click_rate_percentage}%`, height: '100%', backgroundColor: 'var(--color-danger)' }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span>Emails Reported (Simulation Success)</span>
                          <strong style={{ color: 'var(--color-teal)' }}>
                            {totalReported} ({reportedRate}%)
                          </strong>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px' }}>
                          <div style={{ width: `${reportedRate}%`, height: '100%', backgroundColor: 'var(--color-teal)' }} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)', fontSize: '13px' }}>
                      No analytics data available.
                    </div>
                  )}
                </div>
              )}

              {analyticsData && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '12px' }}>Click & Report Tracking Details</h4>
                  
                  {/* Clicked Employees */}
                  <div style={{ marginBottom: '16px' }}>
                    <h5 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-danger)', marginBottom: '8px' }}>
                      Employees Who Clicked Link ({clickedEmployees.length})
                    </h5>
                    {clickedEmployees.length === 0 ? (
                      <p style={{ fontSize: '12px', color: 'var(--text-light)', fontStyle: 'italic' }}>No employee clicked the simulation link.</p>
                    ) : (
                      <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px' }}>
                        {clickedEmployees.map((emp, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: i < clickedEmployees.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                            <span><strong>{emp.name}</strong> ({emp.email})</span>
                            <span style={{ color: 'var(--text-light)', fontSize: '11px' }}>{new Date(emp.clicked_at).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reported Employees */}
                  <div>
                    <h5 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-teal)', marginBottom: '8px' }}>
                      Employees Who Reported Email ({reportedEmployees.length})
                    </h5>
                    {reportedEmployees.length === 0 ? (
                      <p style={{ fontSize: '12px', color: 'var(--text-light)', fontStyle: 'italic' }}>No employee reported the simulation email.</p>
                    ) : (
                      <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px' }}>
                        {reportedEmployees.map((emp, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: i < reportedEmployees.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                            <span><strong>{emp.name}</strong> ({emp.email})</span>
                            <span style={{ color: 'var(--text-light)', fontSize: '11px' }}>{new Date(emp.reported_at).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <Button onClick={() => setSelectedCampaign(null)} variant="primary">Close Details</Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Campaign Modal */}
      {editCampaign && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>Edit Simulation</h2>
              <button onClick={() => setEditCampaign(null)} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Campaign Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Active Status</label>
                  <select
                    className="form-control"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Launched">Launched</option>
                    <option value="Completed">Completed</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setEditCampaign(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCampaigns;
