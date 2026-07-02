import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  initialCurrentUser, 
  initialEmployees, 
  initialCampaigns, 
  initialEmailTemplates, 
  initialTrainingModules, 
  initialQuizzes, 
  initialLeaderboard, 
  initialSimulations,
  certificates as initialCertificates,
  initialAuditLogs,
  initialRolePermissions,
  initialScheduledCampaignEvents
} from '../data/dummyData';
import { useAuth } from './AuthContext';
import api from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { 
    isAuthenticated, 
    userRole, 
    currentUser, 
    login, 
    employeeLogin,
    register, 
    selectRole, 
    logout,
    setCurrentUser
  } = useAuth();


  // Database-backed States
  const [employees, setEmployees] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [reportedEmails, setReportedEmails] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [currentEnterprise, setCurrentEnterprise] = useState(null);
  const [supportMessages, setSupportMessages] = useState([]);
  const [adminThreads, setAdminThreads] = useState([]);
  const [awarenessPages, setAwarenessPages] = useState([]);

  // Local-only / Fallback States
  const [trainingModules, setTrainingModules] = useState(() => {
    const saved = localStorage.getItem('pg_modules');
    return saved ? JSON.parse(saved) : [...initialTrainingModules];
  });

  const [quizzes, setQuizzes] = useState(() => {
    const saved = localStorage.getItem('pg_quizzes');
    return saved ? JSON.parse(saved) : [...initialQuizzes];
  });

  const [leaderboard, setLeaderboard] = useState(() => {
    const saved = localStorage.getItem('pg_leaderboard');
    return saved ? JSON.parse(saved) : [...initialLeaderboard];
  });

  const [simulations, setSimulations] = useState(() => {
    const saved = localStorage.getItem('pg_simulations');
    return saved ? JSON.parse(saved) : [...initialSimulations];
  });

  const [certificates, setCertificates] = useState(() => {
    const saved = localStorage.getItem('pg_certificates');
    return saved ? JSON.parse(saved) : [...initialCertificates];
  });

  const [rolePermissions, setRolePermissions] = useState(() => {
    const saved = localStorage.getItem('pg_role_permissions');
    return saved ? JSON.parse(saved) : [...initialRolePermissions];
  });

  const [campaignEvents, setCampaignEvents] = useState(() => {
    const saved = localStorage.getItem('pg_campaign_events');
    return saved ? JSON.parse(saved) : [...initialScheduledCampaignEvents];
  });

  // Global API Fetch Function
  const fetchData = async () => {
    if (!isAuthenticated) return;
    try {
      const promises = [
        api.get('/notifications')
          .then(res => setNotifications(res.data))
          .catch(e => console.warn("Could not fetch notifications:", e))
      ];

      if (userRole === 'Security Administrator' || userRole === 'Security Manager') {
        promises.push(
          api.get('/employees')
            .then(res => setEmployees(res.data))
            .catch(e => console.warn("Could not fetch employees:", e))
        );
        promises.push(
          api.get('/campaigns')
            .then(res => setCampaigns(res.data))
            .catch(e => console.warn("Could not fetch campaigns:", e))
        );
        promises.push(
          api.get('/email-templates').then(res => {
            const mappedTemplates = res.data.map(t => ({
              id: t.id,
              name: t.template_name || t.title || "",
              subject: t.subject || "",
              body: t.body_html || "",
              body_html: t.body_html || "",
              body_text: t.body_text || "",
              category: t.category || "Credential Theft",
              difficulty: t.difficulty || "Medium",
              sender_name: t.sender_display_name || t.sender_name || "System Notification",
              sender_email: t.sender_email || "",
              is_system_template: t.is_system_template,
              created_by_admin_id: t.created_by_admin_id
            }));
            setEmailTemplates(mappedTemplates);
          }).catch(e => console.warn("Could not fetch email templates:", e))
        );
        promises.push(
          api.get('/reported-emails').then(res => {
            const mappedReports = res.data.map(r => ({
              id: r.id,
              employeeName: r.employee_name || "Unknown Employee",
              senderEmail: r.email_sender || "unknown@sender.com",
              subject: r.email_subject || "No Subject",
              campaignName: r.campaign_name || "External Outlook Report",
              riskScore: r.risk_score || 0,
              riskLevel: r.risk_level || ((r.risk_score || 0) > 70 ? "High" : (r.risk_score || 0) > 30 ? "Medium" : "Low"),
              status: r.report_status || "Pending",
              createdAt: r.created_at || r.reported_at,
              reportedDate: r.reported_at ? (typeof r.reported_at === 'string' ? r.reported_at.split('T')[0] : new Date(r.reported_at).toISOString().split('T')[0]) : (r.created_at ? (typeof r.created_at === 'string' ? r.created_at.split('T')[0] : new Date(r.created_at).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]),
              body: r.email_body || "",
              departmentId: r.department_id || null,
              messages: r.messages || []
            }));
            mappedReports.sort((a, b) => {
              const dateA = new Date(a.createdAt || a.reportedDate || 0);
              const dateB = new Date(b.createdAt || b.reportedDate || 0);
              return dateB - dateA;
            });
            setReportedEmails(mappedReports);
          }).catch(e => console.warn("Could not fetch reported emails:", e))
        );
        promises.push(
          api.get('/departments')
            .then(res => setDepartments(res.data))
            .catch(e => console.warn("Could not fetch departments:", e))
        );
        promises.push(
          api.get('/companies')
            .then(res => {
              setCompanies(res.data);
              if (res.data && res.data.length > 0) {
                // If only one enterprise, set it as current; otherwise keep existing selection
                setCurrentEnterprise(res.data[0]);
              }
            })
            .catch(e => console.warn("Could not fetch companies:", e))
        );
        promises.push(
          api.get('/messages/admin/threads')
            .then(res => setAdminThreads(res.data))
            .catch(e => console.warn("Could not fetch admin support message threads:", e))
        );
        promises.push(
          api.get('/awareness-pages')
            .then(res => setAwarenessPages(res.data))
            .catch(e => console.warn("Could not fetch awareness pages:", e))
        );
        
        if (userRole === 'Security Administrator') {
          promises.push(
            api.get('/audit-logs')
              .then(res => setAuditLogs(res.data))
              .catch(e => console.warn("Could not fetch audit logs:", e))
          );
        }
      } else if (userRole === 'Employee') {
        promises.push(
          api.get('/auth/employee/dashboard').then(res => {
            setCurrentUser(prev => ({
              ...prev,
              ...res.data,
              securityScore: res.data.security_score,
              trainingCompletion: res.data.training_completion,
              unreadMessageCount: res.data.unread_message_count,
              companyName: res.data.company_name,
              companyAddress: res.data.company_address
            }));

            if (res.data.certificates) {
              const mappedCerts = res.data.certificates.map(c => ({
                id: c.id,
                name: `${c.module_title} Completion Certificate`,
                courseName: c.module_title,
                dateEarned: c.issued_at.split('T')[0],
                verification_code: c.verification_code
              }));
              setCertificates(mappedCerts);
            }
          }).catch(e => console.warn("Could not fetch employee dashboard data:", e))
        );
        promises.push(
          api.get('/employee/training-modules').then(res => {
            const mappedModules = (res.data || []).map(m => ({
              id: m.id,
              name: m.title || m.name,
              description: m.description,
              difficulty: m.difficulty || "Medium",
              duration: typeof m.duration === 'number' ? `${m.duration} mins` : (m.duration || "15 mins"),
              isCompleted: m.status === 'completed',
              progress: m.status === 'completed' ? 100 : (m.status === 'in_progress' ? 50 : 0),
              locked: false
            }));
            setTrainingModules(mappedModules);
          }).catch(e => console.warn("Could not fetch employee training modules:", e))
        );
        promises.push(
          api.get('/campaigns/employee/campaign-feed').then(res => {
            const mappedSims = res.data.map(c => ({
              id: c.campaign_id,
              name: c.campaign_name,
              date: c.send_date.split('T')[0],
              result: c.interaction_status === "Reported" ? "Reported" : (c.interaction_status === "Clicked" ? "Failed" : "Passed"),
              duration: "N/A",
              difficulty: c.difficulty,
              templateCategory: c.category,
              subject: c.subject,
              sender_name: c.sender_name,
              description: c.description,
              interaction_status: c.interaction_status
            }));
            setSimulations(mappedSims);
          }).catch(e => console.warn("Could not fetch employee campaign feed:", e))
        );
        promises.push(
          api.get('/leaderboard/employee').then(res => {
            const raw = res.data || [];
            const mappedLb = raw.map(item => ({
              rank: item.rank,
              name: item.employee_name,
              department: item.department,
              securityScore: item.security_score,
              badges: item.badge ? [item.badge] : [],
              percentile: Math.round(((raw.length - item.rank + 1) / raw.length) * 100),
              total_xp: item.total_points,
              reports_count: item.report_count,
              completion_percentage: item.training_completed_count * 20
            }));
            setLeaderboard(mappedLb);
          }).catch(e => console.warn("Could not fetch employee company leaderboard:", e))
        );
        promises.push(
          api.get('/messages/thread')
            .then(res => setSupportMessages(res.data))
            .catch(e => console.warn("Could not fetch employee support messages:", e))
        );
      }

      await Promise.all(promises);
    } catch (error) {
      console.error("Error fetching data from API:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated, userRole]);

  // Sync remaining local states to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem('pg_modules', JSON.stringify(trainingModules));
    localStorage.setItem('pg_quizzes', JSON.stringify(quizzes));
    localStorage.setItem('pg_leaderboard', JSON.stringify(leaderboard));
    localStorage.setItem('pg_simulations', JSON.stringify(simulations));
    localStorage.setItem('pg_certificates', JSON.stringify(certificates));
    localStorage.setItem('pg_role_permissions', JSON.stringify(rolePermissions));
    localStorage.setItem('pg_campaign_events', JSON.stringify(campaignEvents));
  }, [
    trainingModules, quizzes, leaderboard, simulations, certificates, 
    rolePermissions, campaignEvents
  ]);



  // State Action Helpers (Backend Routed)

  // Audit Logs Actions
  const addAuditLog = (action, details) => {
    api.post('/audit-logs', { action, details }).then(() => {
      if (userRole === 'Security Administrator') {
        api.get('/audit-logs').then(res => setAuditLogs(res.data)).catch(console.error);
      }
    }).catch(console.error);
  };

  const addEmployee = async (employee) => {
    try {
      const response = await api.post('/employees', {
        name: employee.name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
        password: employee.password,
        first_name: employee.first_name || employee.name?.split(' ')[0] || 'Unknown',
        last_name: employee.last_name || employee.name?.split(' ').slice(1).join(' ') || 'Employee',
        email: employee.email,
        company_id: employee.company_id || null,
        department_id: employee.department_id || employee.department,
        job_title: employee.job_title || 'Specialist',
        status: employee.status || 'Active',
        risk_score: employee.risk_score || 30.0
      });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to add employee:", error);
      throw error;
    }
  };

  const editEmployee = async (id, updatedData) => {
    try {
      const response = await api.put(`/employees/${id}`, {
        first_name: updatedData.first_name || updatedData.name?.split(' ')[0] || 'Unknown',
        last_name: updatedData.last_name || updatedData.name?.split(' ').slice(1).join(' ') || 'Employee',
        company_id: updatedData.company_id || null,
        department_id: updatedData.department_id || updatedData.department,
        job_title: updatedData.job_title || 'Specialist',
        status: updatedData.status || 'Active',
        risk_score: updatedData.risk_score || 30.0
      });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to edit employee:", error);
      throw error;
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await api.delete(`/employees/${id}`);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete employee:", error);
      throw error;
    }
  };

  // Department Actions
  const addDepartment = async (deptName, details = {}) => {
    try {
      const response = await api.post('/departments', {
        name: deptName,
        description: details.description || '',
        manager_id: details.manager_id || null,
        risk_score: details.riskScore || details.risk_score || 30,
        training_completion: details.completionPercentage || details.training_completion || 0
      });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to add department:", error);
      throw error;
    }
  };

  const editDepartment = async (id, updatedData) => {
    try {
      const response = await api.put(`/departments/${id}`, {
        name: updatedData.name,
        description: updatedData.description || '',
        manager_id: updatedData.manager_id || null,
        risk_score: updatedData.riskScore || updatedData.risk_score || 30,
        training_completion: updatedData.completionPercentage || updatedData.training_completion || 0
      });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to edit department:", error);
      throw error;
    }
  };

  const deleteDepartment = async (id) => {
    try {
      await api.delete(`/departments/${id}`);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete department:", error);
      throw error;
    }
  };

  const addCompany = async (company) => {
    try {
      const response = await api.post('/companies', company);
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to add company:", error);
      throw error;
    }
  };

  const editCompany = async (id, company) => {
    try {
      const response = await api.put(`/companies/${id}`, company);
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to edit company:", error);
      throw error;
    }
  };

  const deleteCompany = async (id) => {
    try {
      await api.delete(`/companies/${id}`);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete company:", error);
      throw error;
    }
  };

  // Campaigns Actions
  const addCampaign = async (campaign) => {
    try {
      const response = await api.post('/campaigns', {
        title: campaign.name || campaign.title,
        description: campaign.description || '',
        campaign_type: campaign.campaign_type || 'Awareness Email',
        status: campaign.status || 'Draft',
        target_department_id: campaign.target_department_id || null,
        template_id: campaign.template_id || null,
        scheduled_at: campaign.scheduled_at || null,
        employee_ids: campaign.employee_ids || []
      });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to add campaign:", error);
      throw error;
    }
  };

  const deleteCampaign = async (id) => {
    try {
      await api.delete(`/campaigns/${id}`);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      throw error;
    }
  };

  const updateCampaignStatus = async (id, status) => {
    try {
      const response = await api.put(`/campaigns/${id}`, { status });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to update campaign status:", error);
      throw error;
    }
  };

  // Templates Actions
  const addTemplate = async (template) => {
    try {
      const response = await api.post('/email-templates', {
        template_name: template.name,
        subject: template.subject,
        sender_display_name: template.sender_name || 'System Notification',
        sender_email: template.sender_email || '',
        body_html: template.body_html || template.body || '',
        body_text: template.body_text || '',
        category: template.category,
        difficulty: template.difficulty
      });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to add template:", error);
      throw error;
    }
  };

  const editTemplate = async (id, template) => {
    try {
      const response = await api.put(`/email-templates/${id}`, {
        template_name: template.name,
        subject: template.subject,
        sender_display_name: template.sender_name || 'System Notification',
        sender_email: template.sender_email || '',
        body_html: template.body_html || template.body || '',
        body_text: template.body_text || '',
        category: template.category,
        difficulty: template.difficulty
      });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to edit template:", error);
      throw error;
    }
  };

  const cloneTemplate = async (id) => {
    try {
      const response = await api.post(`/email-templates/${id}/clone`);
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to clone template:", error);
      throw error;
    }
  };

  const deleteTemplate = async (id) => {
    try {
      await api.delete(`/email-templates/${id}`);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete template:", error);
      throw error;
    }
  };

  const addAwarenessPage = async (page) => {
    try {
      const response = await api.post('/awareness-pages', {
        title: page.title,
        html_content: page.html_content
      });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to add awareness page:", error);
      throw error;
    }
  };

  const editAwarenessPage = async (id, page) => {
    try {
      const response = await api.put(`/awareness-pages/${id}`, {
        title: page.title,
        html_content: page.html_content
      });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to edit awareness page:", error);
      throw error;
    }
  };

  const deleteAwarenessPage = async (id) => {
    try {
      await api.delete(`/awareness-pages/${id}`);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete awareness page:", error);
      throw error;
    }
  };

  // Report Email Actions
  const reportEmail = async (emailReport) => {
    try {
      const response = await api.post('/reported-emails', {
        employee_id: currentUser.employee_id,
        subject: emailReport.subject,
        sender: emailReport.sender || 'unknown@sender.com',
        status: 'Pending'
      });

      // Also update simulations list locally for current user
      const matchedSim = simulations.find(s => s.name.toLowerCase().includes(emailReport.subject.toLowerCase()) || emailReport.subject.toLowerCase().includes(s.name.toLowerCase()));
      if (matchedSim) {
        setSimulations(prev => prev.map(s => s.id === matchedSim.id ? { ...s, result: 'Reported' } : s));
      } else {
        const newSim = {
          id: Date.now(),
          name: emailReport.subject || "Reported suspicious email",
          date: new Date().toISOString().split('T')[0],
          result: "Reported",
          duration: "N/A",
          difficulty: "Medium",
          templateCategory: emailReport.reason || "Suspicious Link"
        };
        setSimulations(prev => [newSim, ...prev]);
      }

      // Boost user's security score
      setCurrentUser(prev => {
        const newScore = Math.min((prev.securityScore || 70) + 3, 100);
        return { ...prev, securityScore: newScore };
      });

      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to report email:", error);
      throw error;
    }
  };

  const resolveReportedEmail = async (id, status) => {
    try {
      const response = await api.put(`/reported-emails/${id}`, { status });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to resolve reported email:", error);
      throw error;
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      await fetchData();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => api.put(`/notifications/${n.id}/read`)));
      await fetchData();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };
  // Modules & Quizzes
  const addQuiz = (newQuiz) => {
    const formattedQuiz = {
      id: Date.now(),
      createdDate: new Date().toISOString().split('T')[0],
      ...newQuiz
    };
    setQuizzes(prev => [...prev, formattedQuiz]);
    addAuditLog("Create Quiz", `Published '${newQuiz.quizName}' quiz`);
  };

  const deleteQuiz = (id) => {
    setQuizzes(prev => prev.filter(q => q.id !== id));
  };

  const addModule = (newModule) => {
    const formattedMod = {
      id: Date.now(),
      enrollmentCount: 0,
      completionStats: 0,
      isCompleted: false,
      progress: 0,
      locked: false,
      lessons: ["Introduction", "Key Indicators", "Case Study", "Knowledge Review"],
      ...newModule
    };
    setTrainingModules(prev => [...prev, formattedMod]);
    addAuditLog("Create Module", `Published '${newModule.name}' module`);
  };

  const deleteModule = (id) => {
    setTrainingModules(prev => prev.filter(m => m.id !== id));
  };

  const updateModuleProgress = (id, progress) => {
    setTrainingModules(prev => prev.map(m => {
      if (m.id === id) {
        const isCompleted = progress >= 100;
        return { ...m, progress, isCompleted };
      }
      return m;
    }));

    if (progress >= 100) {
      // Award certificate if not already earned
      const targetModule = trainingModules.find(m => m.id === id);
      if (targetModule && !certificates.some(c => c.courseName === targetModule.name)) {
        const newCert = {
          id: Date.now(),
          name: `${targetModule.name} Completion Certificate`,
          courseName: targetModule.name,
          dateEarned: new Date().toISOString().split('T')[0]
        };
        setCertificates(prev => [newCert, ...prev]);

        // Boost training progress rate
        setCurrentUser(prev => {
          const newScore = Math.min(prev.securityScore + 5, 100);
          return { ...prev, securityScore: newScore, trainingCompletion: Math.min(prev.trainingCompletion + 15, 100) };
        });
      }
    }
  };

  const updateProfile = (data) => {
    setCurrentUser(prev => ({ ...prev, ...data }));
    addAuditLog("Update Profile", "Modified personal biography details");
  };

  // Roles & Permissions matrix state save
  const savePermissions = (updatedPermissions) => {
    setRolePermissions(updatedPermissions);
    addAuditLog("Modify Permissions", "Updated system role permission matrices");
  };

  // Campaign calendar schedule add
  const addCampaignEvent = (event) => {
    const newEvent = {
      id: Date.now(),
      status: "Scheduled",
      ...event
    };
    setCampaignEvents(prev => [...prev, newEvent]);
    addAuditLog("Schedule Campaign", `Scheduled campaign '${event.name}' for ${event.date}`);
  };

  const deleteCampaignEvent = (eventId) => {
    setCampaignEvents(prev => prev.filter(e => e.id !== eventId));
    addAuditLog("Delete Scheduled Campaign", `Removed scheduled campaign event from calendar`);
  };

  const reportCampaignEmail = async (campaignId) => {
    try {
      await api.post(`/campaigns/employee/report-campaign/${campaignId}`);
      await fetchData();
    } catch (error) {
      console.error("Failed to report campaign email:", error);
      throw error;
    }
  };

  const sendSupportMessage = async (messageText) => {
    try {
      const response = await api.post('/messages/send', { message_text: messageText });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to send support message:", error);
      throw error;
    }
  };

  const sendAdminReply = async (employeeId, messageText) => {
    try {
      const response = await api.post('/messages/admin/reply', { employee_id: employeeId, message_text: messageText });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to send admin reply:", error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      userRole,
      currentUser,
      employees,
      campaigns,
      emailTemplates,
      reportedEmails,
      notifications,
      trainingModules,
      quizzes,
      leaderboard,
      simulations,
      certificates,
      auditLogs,
      rolePermissions,
      campaignEvents,
      departments,
      companies,
      supportMessages,
      adminThreads,
      login,
      employeeLogin,
      register,
      selectRole,
      logout,
      addEmployee,
      editEmployee,
      deleteEmployee,
      addDepartment,
      editDepartment,
      deleteDepartment,
      addCompany,
      editCompany,
      deleteCompany,
      addCampaign,
      deleteCampaign,
      updateCampaignStatus,
      addTemplate,
      editTemplate,
      cloneTemplate,
      deleteTemplate,
      awarenessPages,
      addAwarenessPage,
      editAwarenessPage,
      deleteAwarenessPage,
      reportEmail,
      resolveReportedEmail,
      addQuiz,
      deleteQuiz,
      addModule,
      deleteModule,
      updateModuleProgress,
      updateProfile,
      savePermissions,
      addCampaignEvent,
      deleteCampaignEvent,
      addAuditLog,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      reportCampaignEmail,
      sendSupportMessage,
      sendAdminReply,
      fetchData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
