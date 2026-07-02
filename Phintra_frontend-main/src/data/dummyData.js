// Phintra SaaS Mock Database

export const initialCurrentUser = {
  name: "Alex Chen",
  email: "alex.chen@phintra-enterprise.com",
  role: "Employee", // Default role, can be toggled to "Security Administrator"
  department: "Engineering",
  avatarUrl: null,
  joinDate: "2025-01-15",
  securityScore: 88,
  trainingCompletion: 67, // %
  lastSimulationResult: "Passed", // Passed, Failed, Reported
  streakDays: 14,
  bio: "Cybersecurity enthusiast and senior full stack software engineer.",
  preferences: {
    emailAlerts: true,
    weeklyDigest: true,
    simulationNotifications: true,
    marketingEmails: false
  }
};

export const initialEmployees = [
  { id: 1, name: "Sarah Mitchell", email: "s.mitchell@phintra-enterprise.com", department: "Finance", riskScore: "Low", securityScore: 94, trainingStatus: "Completed", lastTrainingDate: "2026-05-12" },
  { id: 2, name: "James Park", email: "j.park@phintra-enterprise.com", department: "Engineering", riskScore: "Low", securityScore: 96, trainingStatus: "Completed", lastTrainingDate: "2026-05-18" },
  { id: 3, name: "Maria Rodriguez", email: "m.rodriguez@phintra-enterprise.com", department: "Marketing", riskScore: "High", securityScore: 42, trainingStatus: "In Progress", lastTrainingDate: "2026-04-20" },
  { id: 4, name: "David Kim", email: "d.kim@phintra-enterprise.com", department: "HR", riskScore: "Medium", securityScore: 68, trainingStatus: "Not Started", lastTrainingDate: "2026-02-11" },
  { id: 5, name: "Emma Wilson", email: "e.wilson@phintra-enterprise.com", department: "Finance", riskScore: "Low", securityScore: 91, trainingStatus: "Completed", lastTrainingDate: "2026-05-01" },
  { id: 6, name: "Tom Bradley", email: "t.bradley@phintra-enterprise.com", department: "Operations", riskScore: "High", securityScore: 38, trainingStatus: "In Progress", lastTrainingDate: "2026-03-24" },
  { id: 7, name: "Lisa Chen", email: "l.chen@phintra-enterprise.com", department: "Engineering", riskScore: "Low", securityScore: 93, trainingStatus: "Completed", lastTrainingDate: "2026-05-14" },
  { id: 8, name: "Mark Davis", email: "m.davis@phintra-enterprise.com", department: "Sales", riskScore: "Medium", securityScore: 71, trainingStatus: "In Progress", lastTrainingDate: "2026-05-05" },
  { id: 9, name: "Amy Johnson", email: "a.johnson@phintra-enterprise.com", department: "Marketing", riskScore: "High", securityScore: 29, trainingStatus: "Not Started", lastTrainingDate: "2026-01-18" },
  { id: 10, name: "Chris Taylor", email: "c.taylor@phintra-enterprise.com", department: "Sales", riskScore: "Medium", securityScore: 75, trainingStatus: "Completed", lastTrainingDate: "2026-04-29" },
  { id: 11, name: "Nina Patel", email: "n.patel@phintra-enterprise.com", department: "HR", riskScore: "Medium", securityScore: 63, trainingStatus: "In Progress", lastTrainingDate: "2026-05-10" },
  { id: 12, name: "Ryan Foster", email: "r.foster@phintra-enterprise.com", department: "Operations", riskScore: "Low", securityScore: 89, trainingStatus: "Completed", lastTrainingDate: "2026-05-15" }
];

export const initialDepartments = [
  { id: 1, name: "Finance", employeeCount: 15, riskScore: 18, completionPercentage: 88 },
  { id: 2, name: "Engineering", employeeCount: 38, riskScore: 12, completionPercentage: 92 },
  { id: 3, name: "Marketing", employeeCount: 22, riskScore: 64, completionPercentage: 45 },
  { id: 4, name: "HR", employeeCount: 12, riskScore: 48, completionPercentage: 58 },
  { id: 5, name: "Operations", employeeCount: 28, riskScore: 39, completionPercentage: 62 },
  { id: 6, name: "Sales", employeeCount: 35, riskScore: 45, completionPercentage: 70 }
];

export const initialCampaigns = [
  { id: 1, name: "Q2 Executive Impersonation", status: "Active", targetUsers: 145, successRate: 74, createdDate: "2026-05-01", description: "CEO asking finance managers to execute urgent payment via fake link.", templateName: "CEO Gift Card Request" },
  { id: 2, name: "IT Helpdesk Credential Harvest", status: "Active", targetUsers: 180, successRate: 85, createdDate: "2026-05-10", description: "Simulated password reset alert to check credential logging susceptibility.", templateName: "Mandatory Password Reset" },
  { id: 3, name: "HR Benefits enrollment lure", status: "Completed", targetUsers: 120, successRate: 92, createdDate: "2026-04-15", description: "Company wide benefits checkup link offering a gift card.", templateName: "Annual Benefits Update" },
  { id: 4, name: "SaaS Tool Shut Down Notice", status: "Draft", targetUsers: 55, successRate: 0, createdDate: "2026-05-24", description: "Notification of a decommissioning platform to test link verification.", templateName: "Slack Account Deactivation Warning" }
];

export const initialEmailTemplates = [
  {
    id: 1,
    name: "CEO Gift Card Request",
    category: "Urgent Action",
    difficulty: "High",
    subject: "Urgent request - Are you at your desk?",
    preview: "Hi, I'm currently in a meeting and need some quick assistance with purchasing gift cards for...",
    body: "Hi, \n\nI hope you're having a productive day. I'm currently in an important meeting and can't take calls. I need you to purchase 5 Apple Gift Cards ($100 each) for an client incentive we are announcing today. Please email me back with the codes as soon as you have them. \n\nThanks,\nCEO, Acme Corp"
  },
  {
    id: 2,
    name: "Mandatory Password Reset",
    category: "Credential Theft",
    difficulty: "Medium",
    subject: "[ACTION REQUIRED] Security Alert: Reset your Corporate password",
    preview: "We detected suspicious login activity on your workspace. Please reset your password to prevent account...",
    body: "Dear Employee,\n\nOur system detected multiple failed login attempts on your workstation today. For security compliance, you must verify your identity and change your password in the next 24 hours.\n\nClick the link below to verify your login credentials:\nhttps://acme-auth-portal.net/reset-password\n\nFailure to comply will lead to account suspension.\n\nBest regards,\nCorporate IT Security Team"
  },
  {
    id: 3,
    name: "Annual Benefits Update",
    category: "Suspicious Link",
    difficulty: "Easy",
    subject: "REVISED: Acme Corp 2026 Benefits Plan and Rewards",
    preview: "The new benefits packages have been finalized. Click the link to review your upgraded health coverage...",
    body: "Hello Team,\n\nWe are excited to share the revised 2026 benefits plans. These include expanded dental, wellness allowances, and professional training stipends.\n\nTo enroll or review your customized tier, please visit the portal:\nhttp://acme-benefits-rewards.org/enroll\n\nYour prompt response is appreciated so we can finalize enrollment with our insurers.\n\nSincerely,\nHR Department"
  },
  {
    id: 4,
    name: "Slack Account Deactivation Warning",
    category: "Credential Theft",
    difficulty: "High",
    subject: "Notification: Slack account flagged for immediate deactivation",
    preview: "Your corporate Slack account has violated security guidelines and is scheduled to be deactivated...",
    body: "Hi there,\n\nYour account has sent anomalous API requests today. As a result, your Slack profile is scheduled for deactivation at 6:00 PM tonight.\n\nTo avoid disruption, please log in immediately to confirm you are an authorized developer:\nhttps://slack-security-support.org/login\n\nThanks,\nCorporate Compliance Dept"
  },
  {
    id: 5,
    name: "Failed Shipping Delivery",
    category: "Suspicious Link",
    difficulty: "Easy",
    subject: "Package Delivery Alert: Redelivery fee required",
    preview: "Your package from UPS/FedEx could not be delivered due to an incorrect home address. Pay...",
    body: "Dear Customer,\n\nWe attempted delivery of package #UPS-9218-A83, but the street address was incorrect. A minor redelivery fee of $1.50 is required to dispatch the driver again.\n\nPlease update your shipping profile here:\nhttps://ups-courier-post.info/delivery-schedule\n\nIf not updated in 3 days, the package will be returned to the sender.\n\nSincerely,\nPostal Operations"
  }
];


export const initialTrainingModules = [
  { id: 1, name: "Phishing Fundamentals", difficulty: "Easy", duration: "15 mins", enrollmentCount: 145, completionStats: 92, lessons: ["What is Phishing?", "Common Indicators of Email Scams", "Domain Names Demystified", "Hover Before You Click"], isCompleted: true, progress: 100, locked: false },
  { id: 2, name: "Social Engineering 101", difficulty: "Medium", duration: "20 mins", enrollmentCount: 98, completionStats: 68, lessons: ["The Psychology of Deception", "Pretexting and impersonation", "Authority & Scarcity Traps", "MFA Fatigue Attacks"], isCompleted: false, progress: 40, locked: false },
  { id: 3, name: "Advanced BEC & Spear Phishing", difficulty: "High", duration: "30 mins", enrollmentCount: 52, completionStats: 35, lessons: ["What is Business Email Compromise?", "Identifying Deepfake Audio Requests", "Reviewing Invoices & Bank Modifying", "Whaling Targets"], isCompleted: false, progress: 0, locked: false }
];

export const initialQuizzes = [
  {
    id: 1,
    quizName: "Phishing Fundamentals Quiz",
    questionsCount: 5,
    passingScore: 80,
    createdDate: "2025-11-10",
    questions: [
      {
        questionText: "What is the primary objective of a credential harvesting phishing email?",
        options: ["To install ransomware on your computer", "To steal username and password credentials", "To send bulk marketing newsletters", "To boost the website's search engine rank"],
        correctIndex: 1
      },
      {
        questionText: "Which of the following is the safest way to verify if an email is genuinely from your bank?",
        options: ["Click the link in the email and see if it looks professional", "Reply to the email asking if it's real", "Navigate directly to the bank's official website in a new tab or call their official number", "Download the PDF attachment which has safety certificates"],
        correctIndex: 2
      },
      {
        questionText: "What does an email sender address like 'security@g00gle.com' represent?",
        options: ["An official Google security team account", "A sub-domain of Google", "A lookalike typo-squatted domain trying to deceive you", "A highly secure email server"],
        correctIndex: 2
      },
      {
        questionText: "If you receive a suspicious email, what is the best immediate action?",
        options: ["Ignore it entirely", "Forward it to all your coworkers to warn them", "Use the company's designated 'Report Phishing' tool or alert IT", "Click 'Unsubscribe' at the bottom"],
        correctIndex: 2
      },
      {
        questionText: "True or False: Phishing attacks can only occur via standard email.",
        options: ["True, phishing is exclusively email-based", "False, phishing can happen via SMS (Smishing), phone calls (Vishing), and social media"],
        correctIndex: 1
      }
    ]
  },
  {
    id: 2,
    quizName: "Social Engineering 101 Quiz",
    questionsCount: 5,
    passingScore: 80,
    createdDate: "2025-12-05",
    questions: [
      {
        questionText: "Which psychological trigger is exploited when an email claims 'Your account will be terminated in 2 hours'?",
        options: ["Greed", "Scarcity/Urgency", "Reciprocity", "Authority"],
        correctIndex: 1
      },
      {
        questionText: "What is 'pretexting' in social engineering?",
        options: ["Sending text messages in advance", "Creating a fabricated scenario (the pretext) to gain trust and extract information", "Writing code to intercept emails", "Double-checking facts"],
        correctIndex: 1
      },
      {
        questionText: "If an email claims to be from the CEO asking for urgent, confidential help with gift cards, what is this an example of?",
        options: ["Authority and Spear Phishing", "Ransomware download", "Routine administrative request", "MFA fatigue"],
        correctIndex: 0
      },
      {
        questionText: "What is a 'watering hole' attack?",
        options: ["A phishing call placed during lunch breaks", "Compromising a specific, trusted website frequently visited by a target group", "Flooding a network with spam", "Stealing passwords near office water coolers"],
        correctIndex: 1
      },
      {
        questionText: "How should you respond to an unexpected multi-factor authentication (MFA) prompt on your phone?",
        options: ["Approve it immediately to make the notification go away", "Ignore it and approve it later", "Deny the request and report it to IT security immediately, as someone may have your password", "Change your phone number"],
        correctIndex: 2
      }
    ]
  }
];

export const initialLeaderboard = [
  { rank: 1, name: "James Park", department: "Engineering", securityScore: 96, badges: ["Security Champion", "Zero Click", "Perfect Month"] },
  { rank: 2, name: "Sarah Mitchell", department: "Finance", securityScore: 94, badges: ["Zero Click", "Top Reporter", "Perfect Month"] },
  { rank: 3, name: "Lisa Chen", department: "Engineering", securityScore: 93, badges: ["Security Champion", "Perfect Month"] },
  { rank: 4, name: "Emma Wilson", department: "Finance", securityScore: 91, badges: ["Top Reporter", "Zero Click"] },
  { rank: 5, name: "Ryan Foster", department: "Operations", securityScore: 89, badges: ["Zero Click", "Security Champion"] },
  { rank: 6, name: "Alex Chen", department: "Engineering", securityScore: 88, badges: ["Quick Learner", "Top Reporter"] },
  { rank: 7, name: "Chris Taylor", department: "Sales", securityScore: 75, badges: ["Top Reporter"] },
  { rank: 8, name: "Mark Davis", department: "Sales", securityScore: 71, badges: ["Quick Learner"] },
  { rank: 9, name: "David Kim", department: "HR", securityScore: 68, badges: ["Quick Learner"] },
  { rank: 10, name: "Nina Patel", department: "HR", securityScore: 63, badges: [] }
];

export const initialSimulations = [
  { id: 1, name: "CEO Gift Card Request", date: "2026-05-18", result: "Reported", duration: "12s", difficulty: "High", templateCategory: "Urgent Action" },
  { id: 2, name: "Mandatory Password Reset", date: "2026-05-10", result: "Passed", duration: "35s", difficulty: "Medium", templateCategory: "Credential Theft" },
  { id: 3, name: "Annual Benefits Update", date: "2026-04-20", result: "Failed", duration: "6s", difficulty: "Easy", templateCategory: "Suspicious Link" }
];

export const securityTips = [
  "Double check the sender's actual email address. Phishers use display name spoofing like 'IT Helpdesk' but the email is 'service-alert@gmail.com'.",
  "Urgency is a red flag. If an email says 'Must act in 30 minutes to prevent suspension', pause and verify via a known official channel.",
  "Hover over all links before you click. The text may say 'paypal.com' but the actual redirect link is 'paypal-verification-alert.net/login'.",
  "Never input passwords on login pages reached via external email links. Always browse directly to the official platform homepage.",
  "Phishing occurs outside emails too! Be suspicious of text messages (Smishing) or phone calls (Vishing) asking for codes or passwords.",
  "Multi-factor authentication (MFA) fatigue attacks are rising. Never tap 'Approve' on your authenticator app unless you explicitly triggered the login."
];

export const faqs = [
  {
    question: "What is phishing, and how do I spot it?",
    answer: "Phishing is a cyber attack that uses deceptive emails, websites, or messages to trick you into revealing sensitive information like login credentials, credit card details, or downloading malware. Common signs include urgent demands, suspicious lookalike sender addresses, spelling errors, and hyperlinks that don't match the destination when hovered."
  },
  {
    question: "What should I do if I suspect an email is a phishing attack?",
    answer: "Do not click on any links, open any attachments, or reply to the sender. Instead, use the 'Report Email' form on this platform or click the Phintra reporting button in your email application. This will safely forward the email to our security team for investigation."
  },
  {
    question: "What happens if I accidentally click a link in a phishing simulation?",
    answer: "Don't panic! Phintra simulations are learning experiences. If you click a simulation link, you will see a educational landing page explaining the red flags you missed. You will not face any penalties, but you are highly encouraged to complete the recommended micro-training modules."
  },
  {
    question: "How is my security score calculated?",
    answer: "Your security score (0-100) is calculated based on: (1) Training completion rate, (2) Quiz scores, (3) Phishing simulation performance (reporting a simulation boosts your score; clicking a simulation link lowers it), and (4) Timely completion of assigned modules."
  },
  {
    question: "How can I earn training badges?",
    answer: "You earn badges automatically by showing positive security behaviors! For example, 'Zero Click' is earned by passing 3 simulations in a row without a click. 'Top Reporter' is awarded for reporting 3 suspicious emails. 'Security Champion' is awarded upon scoring 90% or higher on all core quizzes."
  }
];

export const certificates = [
  { id: 1, name: "Phishing Defender Certification", courseName: "Phishing Fundamentals", dateEarned: "2026-05-12" }
];

export const initialLandingPageTemplates = [
  { id: 1, name: "Microsoft 365 Login Lure", category: "Credential Theft", brand: "Microsoft", defaultTitle: "Sign in to your account", defaultContent: "Because you're accessing sensitive corporate sharing documents, you must re-verify your workspace credentials.", buttonText: "Sign In" },
  { id: 2, name: "Google Drive Sharing Access", category: "Suspicious Link", brand: "Google", defaultTitle: "Google Drive: Request Access", defaultContent: "A document has been shared with you via Phintra corporate channels. To inspect this statement, authenticate with drive credentials.", buttonText: "Request Access" },
  { id: 3, name: "Phintra Payroll & Compensation Lure", category: "Urgent Action", brand: "Phintra", defaultTitle: "Phintra Hub - Q2 Salary Revision", defaultContent: "The compensation adjustment parameters for Q2 have been finalized. Review your payroll updates and verify details immediately.", buttonText: "Verify Statement" }
];

export const initialScheduledCampaignEvents = [
  { id: 101, name: "Q2 Executive Impersonation", date: "2026-05-01", status: "Completed", templateName: "CEO Gift Card Request", targetUsers: 145 },
  { id: 102, name: "IT Helpdesk Credential Harvest", date: "2026-05-10", status: "Active", templateName: "Mandatory Password Reset", targetUsers: 180 },
  { id: 103, name: "HR Benefits enrollment lure", date: "2026-05-15", status: "Completed", templateName: "Annual Benefits Update", targetUsers: 120 },
  { id: 104, name: "Q3 Billing Invoice Spoof", date: "2026-05-24", status: "Scheduled", templateName: "Slack Account Deactivation Warning", targetUsers: 55 },
  { id: 105, name: "Social Engineering Drills", date: "2026-05-28", status: "Scheduled", templateName: "Failed Shipping Delivery", targetUsers: 200 }
];

export const initialAuditLogs = [
  { id: 1, timestamp: "2026-05-29 15:30:22", user: "Alex Chen", action: "Launch Campaign", details: "Dispatched 'Q2 Executive Impersonation' to 145 employees", status: "Success" },
  { id: 2, timestamp: "2026-05-29 12:15:10", user: "Sarah Mitchell", action: "Modify Security Policies", details: "Enabled Enforced Administrator Two-Factor Authentication (2FA)", status: "Success" },
  { id: 3, timestamp: "2026-05-29 09:44:05", user: "Alex Chen", action: "Create Email Template", details: "Created custom template 'Urgent Security Patch Update'", status: "Success" },
  { id: 4, timestamp: "2026-05-28 16:20:00", user: "Sarah Mitchell", action: "Resolve Threat Report", details: "Marked reported email #2841 as Investigating", status: "Success" },
  { id: 5, timestamp: "2026-05-28 11:05:32", user: "Alex Chen", action: "Add Employee", details: "Registered James Park in Engineering team list", status: "Success" },
  { id: 6, timestamp: "2026-05-27 14:50:18", user: "Sarah Mitchell", action: "Delete Campaign", details: "Purged old simulation record #9021 from database", status: "Success" },
  { id: 7, timestamp: "2026-05-27 09:12:11", user: "Alex Chen", action: "Update Profile", details: "Modified personal biography details", status: "Success" },
  { id: 8, timestamp: "2026-05-26 13:40:55", user: "Sarah Mitchell", action: "Modify Permissions", details: "Toggled Manage Users permission for Managers role", status: "Success" },
  { id: 9, timestamp: "2026-05-25 10:22:30", user: "Alex Chen", action: "Create Quiz", details: "Published 'Recognizing BEC Attack vectors' quiz", status: "Success" },
  { id: 10, timestamp: "2026-05-24 15:10:04", user: "Sarah Mitchell", action: "Launch Campaign", details: "Scheduled campaign 'Q3 Billing Invoice Spoof'", status: "Success" }
];

export const initialRolePermissions = [
  { role: "Admin", createCampaign: true, viewReports: true, manageUsers: true, exportData: true },
  { role: "Manager", createCampaign: false, viewReports: true, manageUsers: true, exportData: false },
  { role: "Analyst", createCampaign: false, viewReports: true, manageUsers: false, exportData: true },
  { role: "Employee", createCampaign: false, viewReports: false, manageUsers: false, exportData: false }
];

export const awarenessArticles = [
  { id: 1, title: "The Anatomy of a CEO Gift Card Scam", category: "Phishing", readTime: "4 mins", date: "2026-05-20", summary: "Learn how attackers impersonate executives to steal company funds through gift card requests.", content: "Business Email Compromise (BEC) is one of the most financially damaging online crimes. In a typical scenario, an attacker spoofing a CEO or executive sends an urgent email to an employee, claiming they are in a meeting and need gift cards purchased for clients immediately. \n\nKey takeaways to identify this attack: \n1. Extreme urgency: Requests must be done 'right now'.\n2. Channel shifting: The sender asks you to communicate only via email or text, not phone.\n3. Request for codes: They ask for pictures of the back of the gift cards, making them instantly redeemable and untraceable. \n\nAlways call the executive on a verified phone number to verify before acting on such requests." },
  { id: 2, title: "Password Security: Beyond 123456", category: "Passwords", readTime: "5 mins", date: "2026-05-18", summary: "Why password length beats complexity and how to construct secure, memorable passphrases.", content: "Many users hate password complexity rules because they lead to hard-to-remember passwords like 'P@ssw0rd1!'. Instead of complex, short passwords, security experts now recommend passphrases. \n\nWhat is a passphrase? It's a sequence of random words joined together, such as 'correct-horse-battery-staple'. \n\nWhy passphrases are better: \n1. Length is key: A 16-character passphrase is exponentially harder to crack via brute force than an 8-character complex password.\n2. Easier to remember: You can visualize the words, making typing easier.\n3. MFA is still mandatory: No matter how strong your password is, always enable Multi-Factor Authentication (MFA) to act as a second lock." },
  { id: 3, title: "Spotting Spoofed Domains in Your Inbox", category: "Email Safety", readTime: "3 mins", date: "2026-05-15", summary: "How to examine email headers and link destinations to detect typo-squatted sender addresses.", content: "Typo-squatting is a technique where attackers register domains that look almost identical to legitimate ones. For example, registering 'micros0ft.com' instead of 'microsoft.com', or 'acme-support-portal.net' instead of 'acme.com'. \n\nHow to stay safe: \n1. Hover over links: Never click directly. Hover your mouse to see the actual URL. If the text says 'paypal.com' but the hover URL points to 'pay-pal-alert-info.net', it's a scam. \n2. Inspect the sender domain: Look closely at the domain name after the '@' sign. Look for substituted letters (like zero '0' instead of 'O') or added prefixes/suffixes. \n3. Look for external email banners: Most organizations add a banner saying '[EXTERNAL EMAIL]' to alert you that it originated outside the company network." },
  { id: 4, title: "MFA Fatigue Attacks: Don't Tap Approve", category: "Passwords", readTime: "4 mins", date: "2026-05-12", summary: "Understand how hackers bomb your phone with authentication requests to force a lazy click.", content: "Multi-Factor Authentication (MFA) is highly effective, but attackers have found a psychological workaround called 'MFA Fatigue' or 'MFA Bombing'. \n\nHere is how it works: \n1. The hacker steals your password (via phishing or a data breach).\n2. They try logging in, which triggers an MFA prompt on your phone.\n3. They repeat this logging attempt dozens of times, often in the middle of the night.\n4. Out of annoyance, exhaustion, or a lazy mistake, the user finally taps 'Approve' to stop the notification storm. \n\nNever approve an unexpected MFA prompt. If you receive prompts you did not initiate, change your password immediately and notify IT security." },
  { id: 5, title: "Social Engineering: The Pretexting Lure", category: "Social Engineering", readTime: "6 mins", date: "2026-05-08", summary: "How scammers construct fake scenarios to gain your trust and download spyware.", content: "Social engineering is the art of manipulating people so they give up confidential information. Pretexting is a form of social engineering where the attacker invents a scenario (a pretext) to place the victim in a vulnerable state. \n\nCommon pretexts: \n1. The IT Helpdesk call: 'We detected a virus on your machine. Please install this support tool so we can clean it.' \n2. The auditor inspection: 'I am conducting a compliance review. Please verify your employee ID and password.' \n3. The delivery courier: 'We have a package for you, but we need your personal details to verify the delivery address.' \n\nAlways verify the identity of anyone asking for credentials or system access. Legitimate IT departments will never ask for your password." }
];

export const learningScenarios = [
  {
    id: 1,
    title: "Scenario 1: The Urgent Text from the CEO",
    situation: "It's Friday afternoon at 4:30 PM. You receive a text message on your personal phone from a number claiming to be your CEO: 'Hi, this is Alex, I'm stuck in an executive board meeting. I need to send 5 gift cards to a client as an incentive right now. Can you purchase them and send me the codes? I'll have Finance reimburse you first thing Monday. Please don't call, I can't talk right now.' \n\nWhat is your course of action?",
    decisions: [
      { text: "Purchase the gift cards immediately using your personal card, take photos of the codes, and text them to the number to help your CEO.", isCorrect: false, explanation: "Incorrect! This is a textbook Business Email Compromise (BEC) scenario. Attacking display spoofing is extremely common on messaging channels, and sending card codes makes the funds untraceable and non-refundable." },
      { text: "Text back asking for the company credit card details or billing authorization to execute the purchase securely.", isCorrect: false, explanation: "Incorrect! Engaging with the scammer validates that your number is active and responsive. Legitimate CEOs do not ask employees to buy client gifts using personal accounts via text." },
      { text: "Ignore the text and call the CEO on their known internal directory extension or double check with your direct manager.", isCorrect: true, explanation: "Correct! The safest action is out-of-band verification. Contacting the CEO via a trusted company channel immediately exposes the message as a spoofed attempt." }
    ]
  },
  {
    id: 2,
    title: "Scenario 2: The MFA Notification Storm",
    situation: "You are watching a movie at home on a Saturday evening. Suddenly, your phone starts buzzing with Microsoft Authenticator MFA push notifications asking you to approve a login request. You are not currently logging into any corporate account. The notifications keep coming, one every 10 seconds. \n\nWhat do you do?",
    decisions: [
      { text: "Tap 'Approve' to stop the notification noise so you can get back to your movie.", isCorrect: false, explanation: "Incorrect! Tapping 'Approve' will authorize the attacker's login, granting them full access to your corporate accounts. This is an MFA Fatigue attack." },
      { text: "Tap 'Deny', ignore the subsequent prompts, and check if the notifications stop on their own.", isCorrect: false, explanation: "Incorrect! While denying the prompt blocks access, the fact that you received prompts means the attacker already possesses your password. Leaving it unchanged leaves your account compromised." },
      { text: "Tap 'Deny', immediately change your corporate password from a clean browser tab, and alert the IT Security team.", isCorrect: true, explanation: "Correct! Denying the request blocks immediate access, changing your password invalidates the attacker's credentials, and reporting it alerts IT to investigate a potential credential breach." }
    ]
  },
  {
    id: 3,
    title: "Scenario 3: The Suspicious Teams Excel Link",
    situation: "You receive a direct message on Microsoft Teams from a colleague in Marketing whom you rarely speak to: 'Hey, can you double check the Q2 salary increments list inside this file? Make sure your row is correct.' The message contains a link pointing to a shared document on 'acme-teams-rewards.net/Appraisal_Spreadsheet'. \n\nWhat do you do?",
    decisions: [
      { text: "Click the link immediately to see if your salary was actually adjusted, and verify your row details.", isCorrect: false, explanation: "Incorrect! Clicking links to lookalike domains (like 'acme-teams-rewards.net') is the primary vector for credential theft and malware installation." },
      { text: "Contact the colleague via a different channel (like Slack or a phone call) to confirm if they genuinely sent the link, and hover to examine the domain structure.", isCorrect: true, explanation: "Correct! The link is hosted on a typosquatted domain. Verifying directly with the colleague confirms if their account was compromised and prevents you from entering credentials." },
      { text: "Reply on the Teams thread asking: 'Is this safe? The domain looks a bit strange.'", isCorrect: false, explanation: "Incorrect! If the colleague's account is compromised, the attacker operating their account will reply that the link is safe, leading you into a trap." }
    ]
  }
];

export const securityMaturityData = {
  maturityScore: 74,
  maturityLevel: "Mature",
  departmentScores: [
    { name: "Finance", score: 86, benchmark: 75 },
    { name: "Engineering", score: 91, benchmark: 75 },
    { name: "Marketing", score: 42, benchmark: 75 },
    { name: "HR", score: 55, benchmark: 75 },
    { name: "Operations", score: 72, benchmark: 75 },
    { name: "Sales", score: 68, benchmark: 75 }
  ],
  roadmap: [
    { id: 1, title: "Targeted Phishing training for Marketing & HR", details: "Marketing and HR show low maturity scores of 42 and 55. Mandatory spear-phishing modules must be completed.", effort: "High", priority: "Critical" },
    { id: 2, title: "Enable Role-Based Access controls (RBAC)", details: "Restrict campaign launching and threat database downloads to Admins. Transition Analyst roles to read-only.", effort: "Medium", priority: "High" },
    { id: 3, title: "Implement MFA enrollment audit checks", details: "Verify that 100% of employee nodes have registered authenticator app MFA protocols to protect passwords.", effort: "Low", priority: "High" },
    { id: 4, title: "Deploy monthly simulated drills", details: "Automate delivery of lookalike credential harvesting landing page templates on a weekly cycle.", effort: "Low", priority: "Medium" }
  ]
};
