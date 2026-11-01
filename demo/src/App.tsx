import { useMemo, useState, type FormEvent } from "react";
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
type Section = "overview" | "team" | "settings";
type Member = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
};

const initialMembers: Member[] = [
  { id: 1, name: "Amina Hassan", email: "amina@example.com", role: "Designer", status: "Active" },
  { id: 2, name: "Omar Khalil", email: "omar@example.com", role: "Developer", status: "Active" },
  { id: 3, name: "Lina Faris", email: "lina@example.com", role: "Product manager", status: "Active" },
  { id: 4, name: "Youssef Nasser", email: "youssef@example.com", role: "Developer", status: "Invited" },
  { id: 5, name: "Sara Haddad", email: "sara@example.com", role: "Designer", status: "Active" },
];

const copy = {
  en: {
    brand: "Namaa",
    workspace: "YOUR WORKSPACE",
    overview: "Overview",
    team: "Team",
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
    active: "Active",
    invited: "Invited",
    designers: "Designers",
    projects: "Projects",
    completion: "Weekly focus",
    thisWeek: "THIS WEEK",
    completionCopy: "Your team is finding its rhythm.",
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
    statsActive: "Active this week",
    statsProjects: "Shared projects",
    statsTime: "Time saved",
    monthlyChange: "this month",
    weeklyChange: "vs last week",
    teamCount: "Across 3 teams",
    collaborationTime: "By working together",
    teamOverview: "Team overview",
    workingTogether: "Three teammates working together",
    helpCopy: "We’re here to help",
    footerCopy: "Made for people, by people.",
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
    active: "نشط",
    invited: "تمت الدعوة",
    designers: "المصممون",
    projects: "المشاريع",
    completion: "تركيز الأسبوع",
    thisWeek: "هذا الأسبوع",
    completionCopy: "فريقك ينسجم في العمل.",
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
    statsActive: "نشطون هذا الأسبوع",
    statsProjects: "المشاريع المشتركة",
    statsTime: "الوقت المُوفّر",
    monthlyChange: "هذا الشهر",
    weeklyChange: "مقارنة بالأسبوع الماضي",
    teamCount: "ضمن ٣ فرق",
    collaborationTime: "بفضل التعاون",
    teamOverview: "نظرة عامة على الفريق",
    workingTogether: "ثلاثة زملاء يعملون معًا",
    helpCopy: "نحن هنا للمساعدة",
    footerCopy: "صُنع لأجل الناس، وبأيدي الناس.",
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
  const [direction, setDirection] = useState<Direction>("ltr");
  const [theme, setTheme] = useState<Theme>("light");
  const [section, setSection] = useState<Section>("overview");
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [notice, setNotice] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [errors, setErrors] = useState({ name: "", email: "" });
  const t = direction === "rtl" ? copy.ar : copy.en;

  const filteredMembers = useMemo(
    () =>
      members.filter((member) =>
        `${member.name} ${member.email} ${member.role}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [members, search],
  );
  const pageCount = Math.max(1, Math.ceil(filteredMembers.length / 3));
  const visibleMembers = filteredMembers.slice((page - 1) * 3, page * 3);

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
  ];

  function showNotice(message: string) {
    setNotice(message);
  }

  function navigate(next: Section) {
    setSection(next);
    setMenuOpen(false);
  }

  function submitInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = {
      name: name.trim() ? "" : t.nameRequired,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : t.emailRequired,
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email) return;

    setMembers((current) => [
      ...current,
      { id: Date.now(), name: name.trim(), email: email.trim(), role, status: "Invited" },
    ]);
    setSearch("");
    setPage(Math.ceil((members.length + 1) / 3));
    setInviteOpen(false);
    setName("");
    setEmail("");
    setRole("");
    showNotice(t.memberAdded);
  }

  function content() {
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
              <Button onClick={() => setInviteOpen(true)}>{t.invite}</Button>
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
            <Button onClick={() => setInviteOpen(true)}>
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
            <small><span className="demo-up">↗ 2</span> {t.monthlyChange}</small>
          </article>
          <article className="demo-stat-card">
            <span className="demo-stat-icon demo-stat-icon--green" aria-hidden="true">✓</span>
            <span className="demo-stat-label">{t.statsActive}</span>
            <strong>86%</strong>
            <small><span className="demo-up">↗ 8%</span> {t.weeklyChange}</small>
          </article>
          <article className="demo-stat-card">
            <span className="demo-stat-icon demo-stat-icon--orange" aria-hidden="true">◇</span>
            <span className="demo-stat-label">{t.statsProjects}</span>
            <strong>12</strong>
            <small>{t.teamCount}</small>
          </article>
          <article className="demo-stat-card">
            <span className="demo-stat-icon demo-stat-icon--blue" aria-hidden="true">◷</span>
            <span className="demo-stat-label">{t.statsTime}</span>
            <strong>4.5h</strong>
            <small>{t.collaborationTime}</small>
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
              <Button onClick={() => setInviteOpen(true)}>{t.invite}</Button>
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
                <div className="demo-progress" role="progressbar" aria-label={t.completion} aria-valuenow={72} aria-valuemin={0} aria-valuemax={100}>
                  <span />
                </div>
                <strong>72%</strong>
              </div>
              <p className="demo-muted">{t.completionCopy}</p>
              <div className="demo-avatar-stack" aria-label={t.workingTogether}>
                <Avatar name="Amina Hassan" />
                <Avatar name="Omar Khalil" />
                <Avatar name="Lina Faris" />
                <span>+2</span>
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
                onSelect: () => showNotice(t.exportDone),
              },
            ]}
          />
        </div>
        <DataTable
          caption={t.membersDescription}
          columns={columns}
          rows={visibleMembers}
        />
        {filteredMembers.length === 0 ? (
          <p className="demo-empty">{t.searchEmpty}</p>
        ) : (
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
        <a className="demo-skip-link" href="#main-content">Skip to content</a>
        <aside className="demo-sidebar" aria-label="Main navigation">
          <a className="demo-brand" href="#main-content" onClick={() => navigate("overview")}>
            <span className="demo-brand-mark" aria-hidden="true">n</span>
            <span>{t.brand}<small>team workspace</small></span>
          </a>
          <nav className="demo-nav" aria-label="Workspace">{navigation}</nav>
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
              <span>{t.footerCopy}</span>
              <a href="https://github.com/hamzehabbass/accessible-component-library">{t.aboutDemo}</a>
            </footer>
          </main>
        </div>

        <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title={t.brand} placement="start">
          <nav className="demo-nav demo-drawer-nav" aria-label="Workspace">{navigation}</nav>
        </Drawer>

        <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title={t.inviteTitle}>
          <p className="demo-modal-description">{t.inviteCopy}</p>
          <form className="demo-invite-form" noValidate onSubmit={submitInvite}>
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
            <Checkbox defaultChecked>{t.notifications}</Checkbox>
            <div className="demo-modal-actions">
              <Button type="button" variant="secondary" onClick={() => setInviteOpen(false)}>
                {direction === "rtl" ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit">{t.sendInvite}</Button>
            </div>
          </form>
        </Modal>

        {notice && <Toast onDismiss={() => setNotice("")}>{notice}</Toast>}
      </div>
    </ThemeProvider>
  );
}

export default App;
