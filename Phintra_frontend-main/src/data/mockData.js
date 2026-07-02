// Mock data for Phintra AI

export const currentUser = {
  name: "Alex Chen",
  role: "Security Administrator",
  avatar: null,
  department: "IT Security",
  riskScore: 23,
  humanFirewallScore: 87,
  streak: 14,
};

export const metrics = [
  { id: 1, label: "Active Campaigns", value: 6, trend: "+2", trendUp: true, icon: "campaign" },
  { id: 2, label: "Employees at Risk", value: 18, trend: "-4", trendUp: false, icon: "risk" },
  { id: 3, label: "Reports Filed", value: 142, trend: "+31", trendUp: true, icon: "report" },
  { id: 4, label: "Threats Blocked", value: 2847, trend: "+18%", trendUp: true, icon: "shield" },
];

export const employees = [
  { id: 1, name: "Sarah Mitchell", email: "s.mitchell@acme.com", department: "Finance", riskScore: 12, streak: 28, badges: ["Zero Click", "Top Reporter", "Perfect Month"], avatar: "SM", threatLevel: "low" },
  { id: 2, name: "James Park", email: "j.park@acme.com", department: "Engineering", riskScore: 8, streak: 45, badges: ["Security Champion", "Zero Click"], avatar: "JP", threatLevel: "low" },
  { id: 3, name: "Maria Rodriguez", email: "m.rodriguez@acme.com", department: "Marketing", riskScore: 67, streak: 3, badges: [], avatar: "MR", threatLevel: "high" },
  { id: 4, name: "David Kim", email: "d.kim@acme.com", department: "HR", riskScore: 45, streak: 7, badges: ["Quick Learner"], avatar: "DK", threatLevel: "medium" },
  { id: 5, name: "Emma Wilson", email: "e.wilson@acme.com", department: "Finance", riskScore: 19, streak: 21, badges: ["Top Reporter", "Zero Click"], avatar: "EW", threatLevel: "low" },
  { id: 6, name: "Tom Bradley", email: "t.bradley@acme.com", department: "Operations", riskScore: 55, streak: 0, badges: [], avatar: "TB", threatLevel: "high" },
  { id: 7, name: "Lisa Chen", email: "l.chen@acme.com", department: "Engineering", riskScore: 14, streak: 33, badges: ["Security Champion", "Perfect Month"], avatar: "LC", threatLevel: "low" },
  { id: 8, name: "Mark Davis", email: "m.davis@acme.com", department: "Sales", riskScore: 38, streak: 12, badges: ["Quick Learner"], avatar: "MD", threatLevel: "medium" },
  { id: 9, name: "Amy Johnson", email: "a.johnson@acme.com", department: "Marketing", riskScore: 72, streak: 1, badges: [], avatar: "AJ", threatLevel: "critical" },
  { id: 10, name: "Chris Taylor", email: "c.taylor@acme.com", department: "Sales", riskScore: 29, streak: 18, badges: ["Top Reporter"], avatar: "CT", threatLevel: "low" },
  { id: 11, name: "Nina Patel", email: "n.patel@acme.com", department: "HR", riskScore: 41, streak: 9, badges: ["Quick Learner"], avatar: "NP", threatLevel: "medium" },
  { id: 12, name: "Ryan Foster", email: "r.foster@acme.com", department: "Operations", riskScore: 16, streak: 24, badges: ["Zero Click", "Security Champion"], avatar: "RF", threatLevel: "low" },
];

export const departments = ["All", "Finance", "Engineering", "Marketing", "HR", "Operations", "Sales"];

export const campaigns = [
  {
    id: 1,
    name: "Q2 Executive Impersonation",
    type: "Spear Phishing",
    difficulty: "Advanced",
    status: "active",
    progress: 68,
    sent: 245,
    opened: 167,
    clicked: 42,
    reported: 89,
    startDate: "2025-05-01",
    endDate: "2025-05-31",
    targetDept: "Finance",
    description: "CEO impersonation targeting finance team during end-of-quarter period.",
  },
  {
    id: 2,
    name: "IT Help Desk Credential Harvest",
    type: "Credential Phishing",
    difficulty: "Intermediate",
    status: "active",
    progress: 45,
    sent: 180,
    opened: 120,
    clicked: 28,
    reported: 65,
    startDate: "2025-05-10",
    endDate: "2025-06-10",
    targetDept: "All",
    description: "Fake IT password reset portal to test credential hygiene.",
  },
  {
    id: 3,
    name: "HR Benefits Enrollment Lure",
    type: "Whaling",
    difficulty: "Basic",
    status: "completed",
    progress: 100,
    sent: 320,
    opened: 289,
    clicked: 61,
    reported: 145,
    startDate: "2025-04-01",
    endDate: "2025-04-30",
    targetDept: "HR",
    description: "Simulated open-enrollment email with malicious link.",
  },
  {
    id: 4,
    name: "SaaS Tool Decommission Notice",
    type: "Business Email Compromise",
    difficulty: "Intermediate",
    status: "scheduled",
    progress: 0,
    sent: 0,
    opened: 0,
    clicked: 0,
    reported: 0,
    startDate: "2025-06-01",
    endDate: "2025-06-30",
    targetDept: "Engineering",
    description: "Fake platform shutdown notice requiring immediate action.",
  },
];

export const activityFeed = [
  { id: 1, type: "reported", user: "Sarah M.", action: "reported a phishing email", time: "2m ago", icon: "report" },
  { id: 2, type: "clicked", user: "Tom B.", action: "clicked a simulation link", time: "7m ago", icon: "warning" },
  { id: 3, type: "completed", user: "James P.", action: "completed security training", time: "15m ago", icon: "check" },
  { id: 4, type: "badge", user: "Emma W.", action: "earned Zero Click badge", time: "28m ago", icon: "badge" },
  { id: 5, type: "reported", user: "Lisa C.", action: "reported a suspicious attachment", time: "41m ago", icon: "report" },
  { id: 6, type: "campaign", user: "System", action: "Q2 Campaign reached 68% completion", time: "1h ago", icon: "campaign" },
  { id: 7, type: "clicked", user: "Maria R.", action: "clicked a simulation link", time: "1h ago", icon: "warning" },
  { id: 8, type: "completed", user: "Chris T.", action: "completed security training", time: "2h ago", icon: "check" },
];

export const clickRateTrend = [
  { month: "Nov", rate: 24, reports: 12 },
  { month: "Dec", rate: 21, reports: 18 },
  { month: "Jan", rate: 18, reports: 22 },
  { month: "Feb", rate: 15, reports: 28 },
  { month: "Mar", rate: 17, reports: 31 },
  { month: "Apr", rate: 12, reports: 38 },
  { month: "May", rate: 9, reports: 44 },
];

export const departmentRisk = [
  { dept: "Marketing", risk: 68, employees: 24 },
  { dept: "HR", risk: 52, employees: 18 },
  { dept: "Sales", risk: 44, employees: 32 },
  { dept: "Operations", risk: 38, employees: 41 },
  { dept: "Finance", risk: 22, employees: 28 },
  { dept: "Engineering", risk: 14, employees: 56 },
];

export const aiMessages = [
  {
    id: 1,
    role: "ai",
    content: "👋 Hi Alex! I'm your Phintra AI assistant. I'm monitoring your organization's security posture in real-time. How can I help today?",
    time: "2:30 PM",
  },
  {
    id: 2,
    role: "user",
    content: "What's the current threat level for our Finance team?",
    time: "2:31 PM",
  },
  {
    id: 3,
    role: "ai",
    content: "The Finance team's risk score is **moderate** at 22/100. They're performing well! 🟢\n\nKey insights:\n• Click rate dropped from 24% → 9% over 6 months\n• 3 employees recently completed advanced training\n• Sarah Mitchell has a perfect 28-day streak\n\nRecommendation: Schedule a targeted executive impersonation simulation next month to maintain vigilance.",
    time: "2:31 PM",
  },
  {
    id: 4,
    role: "user",
    content: "Can you analyze this email? Subject: URGENT - Account Verification Required",
    time: "2:33 PM",
  },
];

export const quickActions = [
  { id: 1, label: "New Campaign", icon: "launch", color: "blue" },
  { id: 2, label: "Send Training", icon: "education", color: "purple" },
  { id: 3, label: "Risk Report", icon: "report", color: "emerald" },
  { id: 4, label: "Add Employee", icon: "person", color: "amber" },
  { id: 5, label: "Threat Alert", icon: "alert", color: "rose" },
  { id: 6, label: "AI Analyze", icon: "ai", color: "cyan" },
];

export const emailAnalysis = {
  subject: "URGENT - Account Verification Required",
  sender: "security@acc0unt-verify.net",
  threatScore: 91,
  indicators: [
    { type: "Domain Spoofing", severity: "critical", detail: "acc0unt-verify.net uses '0' instead of 'o'" },
    { type: "Urgency Manipulation", severity: "high", detail: "URGENT keyword triggers emotional response" },
    { type: "Suspicious Link", severity: "critical", detail: "Link redirects to known phishing infrastructure" },
    { type: "Grammar Issues", severity: "medium", detail: "2 grammatical inconsistencies detected" },
  ],
  verdict: "PHISHING",
};
