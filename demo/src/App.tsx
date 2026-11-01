import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Accordion,
  Button,
  Checkbox,
  DataTable,
  DatePicker,
  Drawer,
  DropdownMenu,
  FormField,
  Input,
  Modal,
  Pagination,
  Select,
  Switch,
  Tabs,
  ThemeProvider,
  Toast,
  Tooltip,
  type DataTableColumn,
} from "../../src/components";

type Direction = "ltr" | "rtl";
type Theme = "light" | "dark";
type Section = "overview" | "team" | "projects" | "settings";
type Member = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
};
type ProjectTask = {
  id: number;
  title: string;
  completed: boolean;
};
type Project = {
  id: number;
  name: string;
  description: string;
  deadline: string;
  color: "violet" | "mint" | "amber";
  tasks: ProjectTask[];
};

type WorkspaceSnapshot = {
  members: Member[];
  projects: Project[];
  selectedProjectId: number | null;
  direction: Direction;
  theme: Theme;
  notifications: boolean;
  checkIn: string | null;
};

const STORAGE_KEY = "namaa-demo-workspace-v1";

const initialMembers: Member[] = [
  { id: 1, name: "Amina Hassan", email: "amina@example.com", role: "Designer", status: "Active" },
  { id: 2, name: "Omar Khalil", email: "omar@example.com", role: "Developer", status: "Active" },
  { id: 3, name: "Lina Faris", email: "lina@example.com", role: "Product manager", status: "Active" },
  { id: 4, name: "Youssef Nasser", email: "youssef@example.com", role: "Developer", status: "Invited" },
  { id: 5, name: "Sara Haddad", email: "sara@example.com", role: "Designer", status: "Active" },
];

const initialProjects: Project[] = [
  {
    id: 101,
    name: "Website redesign",
    description: "A clearer, more welcoming home for the product.",
    deadline: "2026-11-18",
    color: "violet",
    tasks: [
      { id: 1001, title: "Gather customer feedback", completed: true },
      { id: 1002, title: "Approve homepage direction", completed: false },
      { id: 1003, title: "Prepare mobile layouts", completed: false },
    ],
  },
  {
    id: 102,
    name: "Mobile app",
    description: "Make the everyday experience feel effortless.",
    deadline: "2026-12-04",
    color: "mint",
    tasks: [
      { id: 2001, title: "Map the first-run experience", completed: true },
      { id: 2002, title: "Build the navigation prototype", completed: true },
      { id: 2003, title: "Review accessibility states", completed: false },
      { id: 2004, title: "Test with the team", completed: false },
    ],
  },
  {
    id: 103,
    name: "Launch campaign",
    description: "Bring the next chapter to the people who need it.",
    deadline: "2026-12-15",
    color: "amber",
    tasks: [
      { id: 3001, title: "Write the launch story", completed: true },
      { id: 3002, title: "Create campaign assets", completed: false },
    ],
  },
];

const defaultWorkspace: WorkspaceSnapshot = {
  members: initialMembers,
  projects: initialProjects,
  selectedProjectId: initialProjects[0].id,
  direction: "ltr",
  theme: "light",
  notifications: true,
  checkIn: null,
};

function isMember(value: unknown): value is Member {
  if (typeof value !== "object" || value === null) return false;
  const member = value as Record<string, unknown>;
  return (
    typeof member.id === "number" &&
    typeof member.name === "string" &&
    typeof member.email === "string" &&
    typeof member.role === "string" &&
    typeof member.status === "string" &&
    ["Designer", "Developer", "Product manager"].includes(member.role) &&
    ["Active", "Invited"].includes(member.status)
  );
}

function isProjectTask(value: unknown): value is ProjectTask {
  if (typeof value !== "object" || value === null) return false;
  const task = value as Record<string, unknown>;
  return (
    typeof task.id === "number" &&
    typeof task.title === "string" &&
    typeof task.completed === "boolean"
  );
}

function isProject(value: unknown): value is Project {
  if (typeof value !== "object" || value === null) return false;
  const project = value as Record<string, unknown>;
  return (
    typeof project.id === "number" &&
    typeof project.name === "string" &&
    typeof project.description === "string" &&
    typeof project.deadline === "string" &&
    ["violet", "mint", "amber"].includes(project.color as string) &&
    Array.isArray(project.tasks) &&
    project.tasks.every(isProjectTask)
  );
}

function readWorkspace(): { value: WorkspaceSnapshot; failed: boolean } {
  try {
    const serialized = window.localStorage.getItem(STORAGE_KEY);
    if (!serialized) return { value: defaultWorkspace, failed: false };

    const parsed: unknown = JSON.parse(serialized);
    if (typeof parsed !== "object" || parsed === null) throw new Error("Saved workspace is invalid.");
    const saved = parsed as Record<string, unknown>;
    if (
      !Array.isArray(saved.members) ||
      !saved.members.every(isMember) ||
      (saved.projects !== undefined &&
        (!Array.isArray(saved.projects) || !saved.projects.every(isProject))) ||
      (saved.selectedProjectId !== undefined &&
        saved.selectedProjectId !== null &&
        typeof saved.selectedProjectId !== "number") ||
      (saved.direction !== "ltr" && saved.direction !== "rtl") ||
      (saved.theme !== "light" && saved.theme !== "dark") ||
      typeof saved.notifications !== "boolean" ||
      (saved.checkIn !== null &&
        (typeof saved.checkIn !== "string" || Number.isNaN(Date.parse(saved.checkIn))))
    ) {
      throw new Error("Saved workspace is invalid.");
    }

    return {
      value: {
        members: saved.members,
        projects: saved.projects ?? initialProjects,
        selectedProjectId:
          typeof saved.selectedProjectId === "number" &&
          (saved.projects ?? initialProjects).some(
            (project) => project.id === saved.selectedProjectId,
          )
            ? saved.selectedProjectId
            : (saved.projects ?? initialProjects)[0]?.id ?? null,
        direction: saved.direction,
        theme: saved.theme,
        notifications: saved.notifications,
        checkIn: saved.checkIn,
      },
      failed: false,
    };
  } catch (error) {
    console.error("Could not load the saved Namaa workspace.", error);
    return { value: defaultWorkspace, failed: true };
  }
}

const copy = {
  en: {
    brand: "Namaa",
    workspace: "YOUR WORKSPACE",
    overview: "Overview",
    team: "Team",
    projects: "Projects",
    settings: "Settings",
    help: "Help center",
    title: "Good morning, Hamzeh",
    subtitle: "Here’s what’s happening with your team today.",
    invite: "Invite a teammate",
    members: "Team members",
    membersDescription: "A little space to do great work together.",
    memberCount: "{count} members",
    search: "Search people",
    name: "Name",
    role: "Role",
    status: "Status",
    actions: "Actions",
    active: "Active",
    invited: "Invited",
    allRoles: "All roles",
    edit: "Edit",
    remove: "Remove",
    updateMember: "Save changes",
    cancel: "Cancel",
    deleteTitle: "Remove teammate?",
    deleteCopy: "This will remove {name} from this sample workspace on this device.",
    deleteConfirm: "Remove teammate",
    memberUpdated: "Teammate details updated.",
    memberRemoved: "Teammate removed.",
    duplicateEmail: "This email is already in your team.",
    projectOverview: "A little progress, one step at a time.",
    projectCount: "{count} projects",
    tasksDone: "{done} of {total} tasks complete",
    projectProgress: "Project progress",
    due: "Due",
    taskList: "Project tasks",
    addTask: "Add task",
    taskPlaceholder: "What needs to get done?",
    taskRequired: "Add a task name first.",
    noTasks: "No tasks yet. Add the first small step.",
    newProject: "New project",
    createProject: "Create project",
    projectName: "Project name",
    projectDescription: "A short description",
    projectDeadline: "Target date",
    projectRequired: "Give your project a name.",
    projectAdded: "Your project is ready.",
    taskAdded: "Task added.",
    taskRemoved: "Task removed.",
    noProjects: "A new idea starts with one project.",
    markComplete: "Mark complete",
    markIncomplete: "Mark incomplete",
    removeTask: "Remove task",
    projectWebsite: "Website redesign",
    projectMobile: "Mobile app",
    projectCampaign: "Launch campaign",
    projectWebsiteDescription: "A clearer, more welcoming home for the product.",
    projectMobileDescription: "Make the everyday experience feel effortless.",
    projectCampaignDescription: "Bring the next chapter to the people who need it.",
    taskFeedback: "Gather customer feedback",
    taskHomepage: "Approve homepage direction",
    taskLayouts: "Prepare mobile layouts",
    taskFirstRun: "Map the first-run experience",
    taskPrototype: "Build the navigation prototype",
    taskAccessibility: "Review accessibility states",
    taskTeamTest: "Test with the team",
    taskStory: "Write the launch story",
    taskAssets: "Create campaign assets",
    deleteProject: "Remove project",
    completion: "Team availability",
    thisWeek: "YOUR TEAM",
    completionCopy: "Based on each teammate’s current status.",
    quickTitle: "A calmer way to work",
    quickCopy: "This sample workspace is made from accessible building blocks. Try the controls and make it your own.",
    explore: "Explore the components",
    preferences: "Preferences",
    profile: "Profile",
    notifications: "Email notifications",
    notificationsHelp: "A weekly summary of team activity.",
    reminder: "Next team check-in",
    save: "Save preferences",
    saved: "Your preferences have been saved.",
    inviteTitle: "Invite someone new",
    inviteCopy: "They’ll receive an invitation to join your workspace.",
    fullName: "Full name",
    email: "Work email",
    chooseRole: "Choose a role",
    designer: "Designer",
    developer: "Developer",
    manager: "Product manager",
    sendInvite: "Send invitation",
    nameRequired: "Please enter their name.",
    emailRequired: "Please enter a valid email address.",
    memberAdded: "Invitation sent. Your teammate was added to the list.",
    searchEmpty: "No teammates match your search.",
    pageLabel: "Team member pages",
    more: "More actions",
    export: "Download team list",
    exportDone: "Your sample team list is ready.",
    appearance: "Appearance",
    light: "Light",
    dark: "Dark",
    language: "Language",
    english: "English",
    arabic: "العربية",
    tipsTitle: "Getting around",
    tipOne: "Invite a teammate using the button above.",
    tipTwo: "Search or sort the table by selecting a column heading.",
    tipThree: "Switch language or theme in the top-right corner.",
    mobileMenu: "Open navigation",
    statsPeople: "People",
    statsActive: "Active members",
    statsInvited: "Invitations pending",
    statsDesigners: "Designers",
    statsDevelopers: "Developers",
    activeOfTeam: "of your team",
    waitingToJoin: "Waiting to join",
    peopleInRole: "On your team",
    teamOverview: "Team overview",
    teamCount: "People in your workspace",
    workingTogether: "{count} teammates collaborating",
    helpCopy: "We’re here to help",
    footerCopy: "Made for people, by people.",
    localData: "Your changes stay on this device",
    storageError: "Your browser could not save this workspace. Changes may not survive a refresh.",
    navigation: "Main navigation",
    skipToContent: "Skip to content",
    aboutDemo: "About this demo",
    roleDesigner: "Designer",
    roleDeveloper: "Developer",
    roleManager: "Product manager",
  },
  ar: {
    brand: "نماء",
    workspace: "مساحة العمل",
    overview: "نظرة عامة",
    team: "الفريق",
    projects: "المشاريع",
    settings: "الإعدادات",
    help: "مركز المساعدة",
    title: "صباح الخير، حمزة",
    subtitle: "إليك آخر مستجدات فريقك اليوم.",
    invite: "دعوة عضو للفريق",
    members: "أعضاء الفريق",
    membersDescription: "مساحة صغيرة لإنجاز أعمال رائعة معًا.",
    memberCount: "{count} أعضاء",
    search: "ابحث عن شخص",
    name: "الاسم",
    role: "الدور",
    status: "الحالة",
    actions: "الإجراءات",
    active: "نشط",
    invited: "تمت الدعوة",
    allRoles: "كل الأدوار",
    edit: "تعديل",
    remove: "إزالة",
    updateMember: "حفظ التعديلات",
    cancel: "إلغاء",
    deleteTitle: "إزالة عضو الفريق؟",
    deleteCopy: "سيتم حذف {name} من مساحة العمل التجريبية على هذا الجهاز.",
    deleteConfirm: "إزالة العضو",
    memberUpdated: "تم تحديث بيانات عضو الفريق.",
    memberRemoved: "تمت إزالة عضو الفريق.",
    duplicateEmail: "هذا البريد الإلكتروني موجود بالفعل في الفريق.",
    projectOverview: "إنجازات صغيرة، خطوة بخطوة.",
    projectCount: "{count} مشاريع",
    tasksDone: "أُنجزت {done} من أصل {total} مهام",
    projectProgress: "تقدّم المشروع",
    due: "الموعد",
    taskList: "مهام المشروع",
    addTask: "إضافة مهمة",
    taskPlaceholder: "ما الخطوة التالية؟",
    taskRequired: "أدخل اسم المهمة أولًا.",
    noTasks: "لا توجد مهام بعد. أضف أول خطوة.",
    newProject: "مشروع جديد",
    createProject: "إنشاء المشروع",
    projectName: "اسم المشروع",
    projectDescription: "وصف قصير",
    projectDeadline: "الموعد المستهدف",
    projectRequired: "يرجى إدخال اسم للمشروع.",
    projectAdded: "مشروعك جاهز.",
    taskAdded: "تمت إضافة المهمة.",
    taskRemoved: "تم حذف المهمة.",
    noProjects: "كل فكرة جديدة تبدأ بمشروع.",
    markComplete: "تحديد كمكتملة",
    markIncomplete: "تحديد كغير مكتملة",
    removeTask: "حذف المهمة",
    projectWebsite: "إعادة تصميم الموقع",
    projectMobile: "تطبيق الهاتف",
    projectCampaign: "حملة الإطلاق",
    projectWebsiteDescription: "واجهة أوضح وأكثر ترحيبًا للمنتج.",
    projectMobileDescription: "تجربة يومية سهلة وسلسة.",
    projectCampaignDescription: "إيصال الفصل الجديد إلى من يحتاجه.",
    taskFeedback: "جمع آراء العملاء",
    taskHomepage: "اعتماد اتجاه الصفحة الرئيسية",
    taskLayouts: "تجهيز تصاميم الهاتف",
    taskFirstRun: "تخطيط تجربة الاستخدام الأولى",
    taskPrototype: "بناء نموذج التنقل",
    taskAccessibility: "مراجعة حالات سهولة الوصول",
    taskTeamTest: "اختبار التجربة مع الفريق",
    taskStory: "كتابة قصة الإطلاق",
    taskAssets: "إنشاء مواد الحملة",
    deleteProject: "إزالة المشروع",
    completion: "حالة الفريق",
    thisWeek: "فريقك",
    completionCopy: "استنادًا إلى الحالة الحالية لكل عضو.",
    quickTitle: "طريقة أهدأ للعمل",
    quickCopy: "مساحة العمل التجريبية هذه مبنية من مكونات سهلة الوصول. جرّب الخيارات وخصصها كما تحب.",
    explore: "استكشف المكونات",
    preferences: "التفضيلات",
    profile: "الملف الشخصي",
    notifications: "إشعارات البريد الإلكتروني",
    notificationsHelp: "ملخص أسبوعي لنشاط الفريق.",
    reminder: "موعد اجتماع الفريق",
    save: "حفظ التفضيلات",
    saved: "تم حفظ تفضيلاتك.",
    inviteTitle: "دعوة شخص جديد",
    inviteCopy: "سيصله رابط للانضمام إلى مساحة العمل.",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني للعمل",
    chooseRole: "اختر الدور",
    designer: "مصمم",
    developer: "مطور",
    manager: "مدير منتج",
    sendInvite: "إرسال الدعوة",
    nameRequired: "يرجى إدخال الاسم.",
    emailRequired: "يرجى إدخال بريد إلكتروني صحيح.",
    memberAdded: "تم إرسال الدعوة وإضافة زميلك إلى القائمة.",
    searchEmpty: "لا يوجد زملاء يطابقون بحثك.",
    pageLabel: "صفحات أعضاء الفريق",
    more: "خيارات إضافية",
    export: "تنزيل قائمة الفريق",
    exportDone: "قائمة الفريق التجريبية جاهزة.",
    appearance: "المظهر",
    light: "فاتح",
    dark: "داكن",
    language: "اللغة",
    english: "English",
    arabic: "العربية",
    tipsTitle: "طريقة الاستخدام",
    tipOne: "ادعُ زميلًا باستخدام الزر أعلاه.",
    tipTwo: "ابحث أو رتّب الجدول باختيار عنوان العمود.",
    tipThree: "غيّر اللغة أو المظهر من أعلى الصفحة.",
    mobileMenu: "فتح القائمة",
    statsPeople: "الأشخاص",
    statsActive: "أعضاء نشطون",
    statsInvited: "دعوات قيد الانتظار",
    statsDesigners: "المصممون",
    statsDevelopers: "المطورون",
    activeOfTeam: "من أعضاء الفريق",
    waitingToJoin: "بانتظار الانضمام",
    peopleInRole: "في فريقك",
    teamOverview: "نظرة عامة على الفريق",
    teamCount: "أشخاص في مساحة العمل",
    workingTogether: "{count} زملاء يعملون معًا",
    helpCopy: "نحن هنا للمساعدة",
    footerCopy: "صُنع لأجل الناس، وبأيدي الناس.",
    localData: "تغييراتك محفوظة على هذا الجهاز",
    storageError: "تعذّر على المتصفح حفظ مساحة العمل. قد لا تبقى التغييرات بعد تحديث الصفحة.",
    navigation: "التنقل الرئيسي",
    skipToContent: "انتقل إلى المحتوى",
    aboutDemo: "حول هذا العرض",
    roleDesigner: "مصمم",
    roleDeveloper: "مطور",
    roleManager: "مدير منتج",
  },
} as const;

function Avatar({ name, className = "" }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <span className={`demo-avatar ${className}`} aria-hidden="true">
      {initials}
    </span>
  );
}

function App() {
  const [loadedWorkspace] = useState(readWorkspace);
  const [direction, setDirection] = useState<Direction>(loadedWorkspace.value.direction);
  const [theme, setTheme] = useState<Theme>(loadedWorkspace.value.theme);
  const [section, setSection] = useState<Section>("overview");
  const [members, setMembers] = useState(loadedWorkspace.value.members);
  const [projects, setProjects] = useState(loadedWorkspace.value.projects);
  const [selectedProjectId, setSelectedProjectId] = useState(
    loadedWorkspace.value.selectedProjectId,
  );
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectDeadline, setProjectDeadline] = useState("");
  const [projectError, setProjectError] = useState("");
  const [taskDraft, setTaskDraft] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [removingMember, setRemovingMember] = useState<Member | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(loadedWorkspace.value.notifications);
  const [checkIn, setCheckIn] = useState<Date | null>(
    loadedWorkspace.value.checkIn ? new Date(loadedWorkspace.value.checkIn) : null,
  );
  const [storageFailed, setStorageFailed] = useState(loadedWorkspace.failed);
  const [notice, setNotice] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [memberStatus, setMemberStatus] = useState("Active");
  const [errors, setErrors] = useState({ name: "", email: "" });
  const t = direction === "rtl" ? copy.ar : copy.en;

  useEffect(() => {
    try {
      const workspace: WorkspaceSnapshot = {
        members,
        projects,
        selectedProjectId,
        direction,
        theme,
        notifications,
        checkIn: checkIn?.toISOString() ?? null,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
      setStorageFailed(false);
    } catch (error) {
      console.error("Could not save the Namaa workspace.", error);
      setStorageFailed(true);
    }
  }, [checkIn, direction, members, notifications, projects, selectedProjectId, theme]);

  const filteredMembers = useMemo(
    () =>
      members.filter((member) =>
        `${member.name} ${member.email} ${member.role}`.toLowerCase().includes(search.toLowerCase()) &&
        (!roleFilter || member.role === roleFilter),
      ),
    [members, roleFilter, search],
  );
  const pageCount = Math.max(1, Math.ceil(filteredMembers.length / 3));
  const visibleMembers = filteredMembers.slice((page - 1) * 3, page * 3);
  const activeCount = members.filter((member) => member.status === "Active").length;
  const invitedCount = members.filter((member) => member.status === "Invited").length;
  const designerCount = members.filter((member) => member.role === "Designer").length;
  const developerCount = members.filter((member) => member.role === "Developer").length;
  const activePercentage = members.length ? Math.round((activeCount / members.length) * 100) : 0;
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? projects[0] ?? null;
  const completedProjectTasks = projects.flatMap((project) => project.tasks).filter((task) => task.completed).length;
  const totalProjectTasks = projects.reduce((total, project) => total + project.tasks.length, 0);

  function displayProjectName(project: Project) {
    if (project.name === "Website redesign") return t.projectWebsite;
    if (project.name === "Mobile app") return t.projectMobile;
    if (project.name === "Launch campaign") return t.projectCampaign;
    return project.name;
  }

  function displayTaskTitle(task: ProjectTask) {
    const translatedTasks: Record<string, string> = {
      "Gather customer feedback": t.taskFeedback,
      "Approve homepage direction": t.taskHomepage,
      "Prepare mobile layouts": t.taskLayouts,
      "Map the first-run experience": t.taskFirstRun,
      "Build the navigation prototype": t.taskPrototype,
      "Review accessibility states": t.taskAccessibility,
      "Test with the team": t.taskTeamTest,
      "Write the launch story": t.taskStory,
      "Create campaign assets": t.taskAssets,
    };
    return translatedTasks[task.title] ?? task.title;
  }

  function displayProjectDescription(project: Project) {
    if (project.name === "Website redesign") return t.projectWebsiteDescription;
    if (project.name === "Mobile app") return t.projectMobileDescription;
    if (project.name === "Launch campaign") return t.projectCampaignDescription;
    return project.description;
  }

  function projectProgress(project: Project) {
    return project.tasks.length
      ? Math.round((project.tasks.filter((task) => task.completed).length / project.tasks.length) * 100)
      : 0;
  }

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const columns: DataTableColumn<Member>[] = [
    {
      key: "name",
      header: t.name,
      sortable: true,
      render: (_, member) => (
        <span className="demo-member">
          <Avatar name={member.name} />
          <span>
            <strong>{member.name}</strong>
            <small>{member.email}</small>
          </span>
        </span>
      ),
    },
    {
      key: "role",
      header: t.role,
      sortable: true,
      render: (_, member) => {
        const roleText =
          member.role === "Designer"
            ? t.roleDesigner
            : member.role === "Developer"
              ? t.roleDeveloper
              : t.roleManager;
        return roleText;
      },
    },
    {
      key: "status",
      header: t.status,
      render: (_, member) => (
        <span className={`demo-status ${member.status === "Active" ? "is-active" : "is-invited"}`}>
          <span aria-hidden="true" />
          {member.status === "Active" ? t.active : t.invited}
        </span>
      ),
    },
    {
      key: "id",
      header: t.actions,
      render: (_, member) => (
        <DropdownMenu
          label={`${t.more}: ${member.name}`}
          items={[
            { label: t.edit, onSelect: () => openEditMember(member) },
            { label: t.remove, onSelect: () => setRemovingMember(member) },
          ]}
        />
      ),
    },
  ];

  function resetMemberForm() {
    setName("");
    setEmail("");
    setRole("");
    setMemberStatus("Active");
    setErrors({ name: "", email: "" });
  }

  function openInvite() {
    resetMemberForm();
    setInviteOpen(true);
  }

  function openEditMember(member: Member) {
    setName(member.name);
    setEmail(member.email);
    setRole(member.role);
    setMemberStatus(member.status);
    setErrors({ name: "", email: "" });
    setEditingMember(member);
  }

  function openProjectDialog() {
    setProjectName("");
    setProjectDescription("");
    setProjectDeadline("");
    setProjectError("");
    setProjectDialogOpen(true);
  }

  function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = projectName.trim();
    if (!cleanName) {
      setProjectError(t.projectRequired);
      return;
    }

    const project: Project = {
      id: Date.now(),
      name: cleanName,
      description: projectDescription.trim(),
      deadline: projectDeadline,
      color: (["violet", "mint", "amber"] as const)[projects.length % 3],
      tasks: [],
    };
    setProjects((current) => [...current, project]);
    setSelectedProjectId(project.id);
    setProjectDialogOpen(false);
    setSection("projects");
    showNotice(t.projectAdded);
  }

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = taskDraft.trim();
    if (!cleanTitle || !selectedProject) return;
    setProjects((current) =>
      current.map((project) =>
        project.id === selectedProject.id
          ? {
              ...project,
              tasks: [...project.tasks, { id: Date.now(), title: cleanTitle, completed: false }],
            }
          : project,
      ),
    );
    setTaskDraft("");
    showNotice(t.taskAdded);
  }

  function toggleTask(taskId: number) {
    if (!selectedProject) return;
    setProjects((current) =>
      current.map((project) =>
        project.id === selectedProject.id
          ? {
              ...project,
              tasks: project.tasks.map((task) =>
                task.id === taskId ? { ...task, completed: !task.completed } : task,
              ),
            }
          : project,
      ),
    );
  }

  function removeTask(taskId: number) {
    if (!selectedProject) return;
    setProjects((current) =>
      current.map((project) =>
        project.id === selectedProject.id
          ? { ...project, tasks: project.tasks.filter((task) => task.id !== taskId) }
          : project,
      ),
    );
    showNotice(t.taskRemoved);
  }

  function formatProjectDate(value: string) {
    if (!value) return "";
    return new Date(`${value}T12:00:00`).toLocaleDateString(direction === "rtl" ? "ar" : "en", {
      month: "short",
      day: "numeric",
    });
  }

  function showNotice(message: string) {
    setNotice(message);
  }

  function navigate(next: Section) {
    setSection(next);
    setMenuOpen(false);
  }

  function submitMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const duplicateEmail = members.some(
      (member) => member.email.toLowerCase() === normalizedEmail && member.id !== editingMember?.id,
    );
    const nextErrors = {
      name: name.trim() ? "" : t.nameRequired,
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
        ? t.emailRequired
        : duplicateEmail
          ? t.duplicateEmail
          : "",
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email) return;

    if (editingMember) {
      setMembers((current) =>
        current.map((member) =>
          member.id === editingMember.id
            ? { ...member, name: name.trim(), email: normalizedEmail, role, status: memberStatus }
            : member,
        ),
      );
      setEditingMember(null);
      showNotice(t.memberUpdated);
    } else {
      setMembers((current) => [
        ...current,
        { id: Date.now(), name: name.trim(), email: normalizedEmail, role, status: "Invited" },
      ]);
      setSearch("");
      setRoleFilter("");
      setPage(Math.ceil((members.length + 1) / 3));
      showNotice(t.memberAdded);
    }
    setInviteOpen(false);
    resetMemberForm();
  }

  function confirmRemoveMember() {
    if (!removingMember) return;
    setMembers((current) => current.filter((member) => member.id !== removingMember.id));
    setRemovingMember(null);
    setPage(1);
    showNotice(t.memberRemoved);
  }

  function exportTeam() {
    const csvValue = (value: string) => {
      const safeValue = /^[=+\-@]/.test(value) ? `'${value}` : value;
      return `"${safeValue.replaceAll('"', '""')}"`;
    };
    const rows = [
      [t.name, t.email, t.role, t.status],
      ...members.map((member) => [
        member.name,
        member.email,
        member.role === "Designer"
          ? t.roleDesigner
          : member.role === "Developer"
            ? t.roleDeveloper
            : t.roleManager,
        member.status === "Active" ? t.active : t.invited,
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(csvValue).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "namaa-team.csv";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function content() {
    if (section === "projects") {
      return (
        <section className="demo-projects-page">
          <div className="demo-page-heading">
            <div>
              <p className="demo-eyebrow">{t.projects}</p>
              <h2>{t.projects}</h2>
              <p className="demo-muted">{t.projectOverview}</p>
            </div>
            <Button onClick={openProjectDialog}>
              <span aria-hidden="true">＋</span> {t.newProject}
            </Button>
          </div>

          <div className="demo-project-summary" aria-label={t.projectOverview}>
            <article className="demo-project-summary-card">
              <span className="demo-stat-icon demo-stat-icon--purple" aria-hidden="true">◇</span>
              <span><small>{t.projects}</small><strong>{projects.length}</strong></span>
            </article>
            <article className="demo-project-summary-card">
              <span className="demo-stat-icon demo-stat-icon--green" aria-hidden="true">✓</span>
              <span>
                <small>{t.tasksDone.replace("{done}", String(completedProjectTasks)).replace("{total}", String(totalProjectTasks))}</small>
                <strong>{totalProjectTasks ? Math.round((completedProjectTasks / totalProjectTasks) * 100) : 0}%</strong>
              </span>
            </article>
            <article className="demo-project-summary-card">
              <span className="demo-stat-icon demo-stat-icon--orange" aria-hidden="true">◎</span>
              <span><small>{t.team}</small><strong>{members.length}</strong></span>
            </article>
          </div>

          {projects.length === 0 ? (
            <div className="demo-project-empty">
              <span aria-hidden="true">✦</span>
              <h3>{t.noProjects}</h3>
              <p className="demo-muted">{t.projectOverview}</p>
              <Button onClick={openProjectDialog}>{t.newProject}</Button>
            </div>
          ) : (
            <>
              <div className="demo-project-grid" aria-label={t.projects}>
                {projects.map((project) => {
                  const progress = projectProgress(project);
                  const completed = project.tasks.filter((task) => task.completed).length;
                  return (
                    <article
                      key={project.id}
                      className={`demo-project-card demo-project-card--${project.color} ${selectedProject?.id === project.id ? "is-selected" : ""}`}
                    >
                      <div className="demo-project-card-top">
                        <span className="demo-project-mark" aria-hidden="true">
                          {project.color === "violet" ? "✳" : project.color === "mint" ? "◌" : "✦"}
                        </span>
                        {project.deadline && (
                          <span className="demo-project-deadline">{t.due} · {formatProjectDate(project.deadline)}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="demo-project-select"
                        aria-pressed={selectedProject?.id === project.id}
                        onClick={() => setSelectedProjectId(project.id)}
                      >
                        <strong>{displayProjectName(project)}</strong>
                        <span>{displayProjectDescription(project)}</span>
                      </button>
                      <div className="demo-project-progress">
                        <div
                          className="demo-progress"
                          role="progressbar"
                          aria-label={`${t.projectProgress}: ${displayProjectName(project)}`}
                          aria-valuenow={progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <span style={{ inlineSize: `${progress}%` }} />
                        </div>
                        <strong>{progress}%</strong>
                      </div>
                      <div className="demo-project-card-footer">
                        <span>{t.tasksDone.replace("{done}", String(completed)).replace("{total}", String(project.tasks.length))}</span>
                        <div className="demo-avatar-pile" aria-label={t.team}>
                          {members.slice(0, 3).map((member) => (
                            <Avatar key={member.id} name={member.name} />
                          ))}
                          {members.length > 3 && <span>+{members.length - 3}</span>}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {selectedProject && (
                <section className="demo-card demo-task-panel" aria-labelledby="project-task-heading">
                  <div className="demo-card-heading">
                    <div>
                      <p className="demo-eyebrow">{t.taskList}</p>
                      <h3 id="project-task-heading">{displayProjectName(selectedProject)}</h3>
                    </div>
                    <span className={`demo-project-mark demo-project-mark--${selectedProject.color}`} aria-hidden="true">✦</span>
                  </div>

                  {selectedProject.tasks.length === 0 ? (
                    <p className="demo-empty">{t.noTasks}</p>
                  ) : (
                    <ul className="demo-task-list">
                      {selectedProject.tasks.map((task) => (
                        <li key={task.id} className={task.completed ? "is-completed" : ""}>
                          <button
                            type="button"
                            className="demo-task-toggle"
                            aria-label={`${task.completed ? t.markIncomplete : t.markComplete}: ${displayTaskTitle(task)}`}
                            aria-pressed={task.completed}
                            onClick={() => toggleTask(task.id)}
                          >
                            <span aria-hidden="true">{task.completed ? "✓" : ""}</span>
                          </button>
                          <span className="demo-task-title">{displayTaskTitle(task)}</span>
                          <button
                            type="button"
                            className="demo-task-remove"
                            aria-label={`${t.removeTask}: ${displayTaskTitle(task)}`}
                            onClick={() => removeTask(task.id)}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <form className="demo-add-task-form" onSubmit={addTask}>
                    <Input
                      aria-label={t.taskPlaceholder}
                      value={taskDraft}
                      onChange={(event) => setTaskDraft(event.target.value)}
                      placeholder={t.taskPlaceholder}
                    />
                    <Button type="submit" disabled={!taskDraft.trim()}>{t.addTask}</Button>
                  </form>
                </section>
              )}
            </>
          )}
        </section>
      );
    }

    if (section === "settings") {
      return (
        <section className="demo-card demo-settings">
          <div className="demo-card-heading">
            <div>
              <p className="demo-eyebrow">{t.settings}</p>
              <h2>{t.preferences}</h2>
            </div>
            <span className="demo-heading-icon" aria-hidden="true">✦</span>
          </div>
          <Tabs
            label={t.settings}
            items={[
              {
                id: "profile",
                label: t.profile,
                content: (
                  <div className="demo-settings-content">
                    <div className="demo-profile-row">
                      <Avatar name="Hamzeh A." className="demo-avatar--large" />
                      <div><strong>Hamzeh A.</strong><span>hamzeh@example.com</span></div>
                      <span className="demo-status is-active"><span aria-hidden="true" />{t.active}</span>
                    </div>
                    <p className="demo-muted">{t.quickCopy}</p>
                  </div>
                ),
              },
              {
                id: "preferences",
                label: t.preferences,
                content: (
                  <div className="demo-settings-content">
                    <div className="demo-setting-row">
                      <span><strong>{t.notifications}</strong><small>{t.notificationsHelp}</small></span>
                      <Switch
                        label={t.notifications}
                        checked={notifications}
                        onCheckedChange={setNotifications}
                      />
                    </div>
                    <div className="demo-setting-row demo-date-row">
                      <span><strong>{t.reminder}</strong><small>{t.notificationsHelp}</small></span>
                      <DatePicker
                        label={t.reminder}
                        value={checkIn}
                        onChange={setCheckIn}
                      />
                    </div>
                    <Button onClick={() => showNotice(t.saved)}>{t.save}</Button>
                  </div>
                ),
              },
            ]}
          />
        </section>
      );
    }

    if (section === "team") {
      return (
        <>
          <section className="demo-card demo-team-card">
            <div className="demo-card-heading demo-team-heading">
              <div>
                <p className="demo-eyebrow">{t.team}</p>
                <h2>{t.members}</h2>
                <p className="demo-muted">{t.membersDescription}</p>
              </div>
              <Button onClick={openInvite}>{t.invite}</Button>
            </div>
            {teamTable()}
          </section>
          {tips()}
        </>
      );
    }

    return (
      <>
        <section className="demo-welcome">
          <div className="demo-welcome-copy">
            <span className="demo-welcome-sparkle" aria-hidden="true">✦</span>
            <p className="demo-eyebrow">
              {t.overview} · {new Date().toLocaleDateString(direction === "rtl" ? "ar" : "en", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h2>{t.title}</h2>
            <p>{t.subtitle}</p>
            <Button onClick={openInvite}>
              <span aria-hidden="true">＋</span> {t.invite}
            </Button>
          </div>
          <div className="demo-welcome-art" aria-hidden="true">
            <span className="demo-orbit demo-orbit--one" />
            <span className="demo-orbit demo-orbit--two" />
            <span className="demo-art-star">✦</span>
            <Avatar name="Amina Hassan" className="demo-art-avatar demo-art-avatar--one" />
            <Avatar name="Omar Khalil" className="demo-art-avatar demo-art-avatar--two" />
            <Avatar name="Lina Faris" className="demo-art-avatar demo-art-avatar--three" />
          </div>
        </section>

        <section className="demo-stats" aria-label={t.teamOverview}>
          <article className="demo-stat-card">
            <span className="demo-stat-icon demo-stat-icon--purple" aria-hidden="true">◎</span>
            <span className="demo-stat-label">{t.statsPeople}</span>
            <strong>{members.length.toString().padStart(2, "0")}</strong>
            <small>{t.teamCount}</small>
          </article>
          <article className="demo-stat-card">
            <span className="demo-stat-icon demo-stat-icon--green" aria-hidden="true">✓</span>
            <span className="demo-stat-label">{t.statsActive}</span>
            <strong>{activeCount}</strong>
            <small>{activePercentage}% {t.activeOfTeam}</small>
          </article>
          <article className="demo-stat-card">
            <span className="demo-stat-icon demo-stat-icon--orange" aria-hidden="true">◇</span>
            <span className="demo-stat-label">{t.statsInvited}</span>
            <strong>{invitedCount}</strong>
            <small>{t.waitingToJoin}</small>
          </article>
          <article className="demo-stat-card">
            <span className="demo-stat-icon demo-stat-icon--blue" aria-hidden="true">◷</span>
            <span className="demo-stat-label">{t.statsDesigners} · {t.statsDevelopers}</span>
            <strong>{designerCount} · {developerCount}</strong>
            <small>{t.peopleInRole}</small>
          </article>
        </section>

        <div className="demo-content-grid">
          <section className="demo-card demo-team-card">
            <div className="demo-card-heading demo-team-heading">
              <div>
                <p className="demo-eyebrow">{t.team}</p>
                <h2>{t.members}</h2>
                <p className="demo-muted">{t.membersDescription}</p>
              </div>
              <Button onClick={openInvite}>{t.invite}</Button>
            </div>
            {teamTable()}
          </section>

          <aside className="demo-side-column">
            <section className="demo-card demo-focus-card">
              <div className="demo-card-heading">
                <div><p className="demo-eyebrow">{t.thisWeek}</p><h2>{t.completion}</h2></div>
                <span className="demo-heading-icon" aria-hidden="true">⌁</span>
              </div>
              <div className="demo-progress-wrap">
                <div className="demo-progress" role="progressbar" aria-label={t.completion} aria-valuenow={activePercentage} aria-valuemin={0} aria-valuemax={100}>
                  <span style={{ inlineSize: `${activePercentage}%` }} />
                </div>
                <strong>{activePercentage}%</strong>
              </div>
              <p className="demo-muted">{t.completionCopy}</p>
              <div className="demo-avatar-stack" aria-label={t.workingTogether.replace("{count}", String(members.length))}>
                {members.slice(0, 3).map((member) => <Avatar key={member.id} name={member.name} />)}
                {members.length > 3 && <span>+{members.length - 3}</span>}
              </div>
            </section>
            <section className="demo-card demo-tip-card">
              <div className="demo-tip-symbol" aria-hidden="true">✧</div>
              <p className="demo-eyebrow">{t.quickTitle}</p>
              <p>{t.quickCopy}</p>
              <a className="demo-text-link" href="https://hamzehabbass.github.io/accessible-component-library/">
                {t.explore}<span aria-hidden="true"> ↗</span>
              </a>
            </section>
          </aside>
        </div>
        {tips()}
      </>
    );
  }

  function teamTable() {
    return (
      <>
        <div className="demo-table-toolbar">
          <div className="demo-search">
            <span aria-hidden="true">⌕</span>
            <Input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={t.search}
              aria-label={t.search}
            />
          </div>
          <DropdownMenu
            label={t.more}
            items={[
              {
                label: t.export,
                onSelect: exportTeam,
              },
            ]}
          />
          <Select
            aria-label={t.role}
            className="demo-role-filter"
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">{t.allRoles}</option>
            <option value="Designer">{t.roleDesigner}</option>
            <option value="Developer">{t.roleDeveloper}</option>
            <option value="Product manager">{t.roleManager}</option>
          </Select>
        </div>
        {filteredMembers.length === 0 ? (
          <p className="demo-empty">{t.searchEmpty}</p>
        ) : (
          <>
            <DataTable
              caption={t.membersDescription}
              columns={columns}
              rows={visibleMembers}
            />
            <div className="demo-table-footer">
              <span>
                {t.memberCount.replace(
                  "{count}",
                  members.length.toLocaleString(direction === "rtl" ? "ar" : "en"),
                )}
              </span>
              <Pagination
                page={page}
                pageCount={pageCount}
                onPageChange={setPage}
                label={t.pageLabel}
              />
            </div>
          </>
        )}
      </>
    );
  }

  function tips() {
    return (
      <Accordion
        items={[
          {
            id: "demo-tips",
            title: t.tipsTitle,
            content: (
              <ul className="demo-tips-list">
                <li>{t.tipOne}</li>
                <li>{t.tipTwo}</li>
                <li>{t.tipThree}</li>
              </ul>
            ),
          },
        ]}
      />
    );
  }

  const navigation = (
    <>
      <p className="demo-nav-label">{t.workspace}</p>
      {([
        ["overview", "◫", t.overview],
        ["team", "◎", t.team],
        ["projects", "✳", t.projects],
        ["settings", "⚙", t.settings],
      ] as const).map(([id, icon, label]) => (
        <button
          key={id}
          type="button"
          className={`demo-nav-item ${section === id ? "is-current" : ""}`}
          aria-current={section === id ? "page" : undefined}
          onClick={() => navigate(id)}
        >
          <span className="demo-nav-icon" aria-hidden="true">{icon}</span>
          {label}
          {id === "team" && <span className="demo-nav-count">{members.length}</span>}
          {id === "projects" && <span className="demo-nav-count">{projects.length}</span>}
        </button>
      ))}
      <div className="demo-sidebar-spacer" />
      <div className="demo-sidebar-help">
        <span className="demo-help-icon" aria-hidden="true">?</span>
        <span><strong>{t.help}</strong><small>{t.helpCopy}</small></span>
        <span aria-hidden="true">↗</span>
      </div>
      <div className="demo-account">
        <Avatar name="Hamzeh A." />
        <span><strong>Hamzeh A.</strong><small>Personal workspace</small></span>
        <span className="demo-account-dots" aria-hidden="true">···</span>
      </div>
    </>
  );

  return (
    <ThemeProvider dir={direction} theme={theme}>
      <div className="demo-app" lang={direction === "rtl" ? "ar" : "en"}>
        <a className="demo-skip-link" href="#main-content">{t.skipToContent}</a>
        <aside className="demo-sidebar" aria-label={t.navigation}>
          <a className="demo-brand" href="#main-content" onClick={() => navigate("overview")}>
            <span className="demo-brand-mark" aria-hidden="true">n</span>
            <span>{t.brand}<small>team workspace</small></span>
          </a>
          <nav className="demo-nav" aria-label={t.workspace}>{navigation}</nav>
        </aside>

        <div className="demo-main-column">
          <header className="demo-topbar">
            <div className="demo-topbar-start">
              <Button
                className="demo-mobile-menu"
                variant="ghost"
                aria-label={t.mobileMenu}
                onClick={() => setMenuOpen(true)}
              >
                ☰
              </Button>
              <span className="demo-breadcrumb">{t.brand}<span aria-hidden="true"> / </span>{t[section]}</span>
            </div>
            <div className="demo-topbar-actions">
              <Tooltip content={t.language}>
                <Button
                  variant="ghost"
                  className="demo-icon-button"
                  aria-label={direction === "ltr" ? t.arabic : t.english}
                  aria-pressed={direction === "rtl"}
                  onClick={() => setDirection((value) => value === "ltr" ? "rtl" : "ltr")}
                >
                  <span aria-hidden="true">文</span>
                </Button>
              </Tooltip>
              <Tooltip content={t.appearance}>
                <Button
                  variant="ghost"
                  className="demo-icon-button"
                  aria-label={theme === "light" ? t.dark : t.light}
                  aria-pressed={theme === "dark"}
                  onClick={() => setTheme((value) => value === "light" ? "dark" : "light")}
                >
                  <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
                </Button>
              </Tooltip>
              <span className="demo-topbar-divider" aria-hidden="true" />
              <Avatar name="Hamzeh A." />
            </div>
          </header>

          <main className="demo-page" id="main-content">
            {content()}
            <footer className="demo-footer">
              <span>{storageFailed ? t.storageError : t.localData}</span>
              <a href="https://github.com/hamzehabbass/accessible-component-library">{t.aboutDemo}</a>
            </footer>
          </main>
        </div>

        <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title={t.brand} placement="start">
          <nav className="demo-nav demo-drawer-nav" aria-label={t.workspace}>{navigation}</nav>
        </Drawer>

        <Modal
          open={inviteOpen || editingMember !== null}
          onClose={() => {
            setInviteOpen(false);
            setEditingMember(null);
            resetMemberForm();
          }}
          title={editingMember ? t.edit : t.inviteTitle}
        >
          <p className="demo-modal-description">{editingMember ? t.membersDescription : t.inviteCopy}</p>
          <form className="demo-invite-form" noValidate onSubmit={submitMember}>
            <FormField label={t.fullName} error={errors.name} required>
              <Input
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Amina Hassan"
              />
            </FormField>
            <FormField label={t.email} error={errors.email} required>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="amina@example.com"
              />
            </FormField>
            <FormField label={t.role} required>
              <Select value={role} onChange={(event) => setRole(event.target.value)} required>
                <option value="" disabled>{t.chooseRole}</option>
                <option value="Designer">{t.designer}</option>
                <option value="Developer">{t.developer}</option>
                <option value="Product manager">{t.manager}</option>
              </Select>
            </FormField>
            {editingMember && (
              <FormField label={t.status} required>
                <Select value={memberStatus} onChange={(event) => setMemberStatus(event.target.value)} required>
                  <option value="Active">{t.active}</option>
                  <option value="Invited">{t.invited}</option>
                </Select>
              </FormField>
            )}
            {!editingMember && <Checkbox defaultChecked>{t.notifications}</Checkbox>}
            <div className="demo-modal-actions">
              <Button type="button" variant="secondary" onClick={() => {
                setInviteOpen(false);
                setEditingMember(null);
                resetMemberForm();
              }}>
                {t.cancel}
              </Button>
              <Button type="submit">{editingMember ? t.updateMember : t.sendInvite}</Button>
            </div>
          </form>
        </Modal>

        <Modal
          open={removingMember !== null}
          onClose={() => setRemovingMember(null)}
          title={t.deleteTitle}
        >
          <p className="demo-modal-description">
            {t.deleteCopy.replace("{name}", removingMember?.name ?? "")}
          </p>
          <div className="demo-modal-actions">
            <Button type="button" variant="secondary" onClick={() => setRemovingMember(null)}>
              {t.cancel}
            </Button>
            <Button type="button" variant="danger" onClick={confirmRemoveMember}>
              {t.deleteConfirm}
            </Button>
          </div>
        </Modal>

        <Modal
          open={projectDialogOpen}
          onClose={() => setProjectDialogOpen(false)}
          title={t.newProject}
        >
          <form className="demo-invite-form" noValidate onSubmit={submitProject}>
            <FormField label={t.projectName} error={projectError} required>
              <Input
                value={projectName}
                onChange={(event) => {
                  setProjectName(event.target.value);
                  if (event.target.value.trim()) setProjectError("");
                }}
                placeholder={t.projectWebsite}
              />
            </FormField>
            <FormField label={t.projectDescription}>
              <Input
                value={projectDescription}
                onChange={(event) => setProjectDescription(event.target.value)}
                placeholder={t.projectOverview}
              />
            </FormField>
            <FormField label={t.projectDeadline}>
              <Input
                type="date"
                value={projectDeadline}
                onChange={(event) => setProjectDeadline(event.target.value)}
              />
            </FormField>
            <div className="demo-modal-actions">
              <Button type="button" variant="secondary" onClick={() => setProjectDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button type="submit">{t.createProject}</Button>
            </div>
          </form>
        </Modal>

        {storageFailed && (
          <p className="demo-storage-warning" role="alert">{t.storageError}</p>
        )}
        {notice && <Toast onDismiss={() => setNotice("")}>{notice}</Toast>}
      </div>
    </ThemeProvider>
  );
}

export default App;
