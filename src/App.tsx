import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import {
  AuditCategory,
  AuditQuestion,
  AuditSession,
  EvidenceFile,
  QuestionAnswer,
  SKPDUnit,
  UserAccount,
  PermissionMatrix,
  UserRole,
} from './types';
import {
  getStoredCategories,
  getStoredQuestions,
  getStoredSessions,
  getStoredSKPDs,
  getStoredUsers,
  getStoredPermissions,
  getStoredActiveUserId,
  saveStoredCategories,
  saveStoredQuestions,
  saveStoredSession,
  saveStoredSessions,
  saveStoredSKPDs,
  saveStoredUsers,
  saveStoredPermissions,
  saveStoredActiveUserId,
  resetAllDataToDefault,
} from './services/storageService';
import { DEFAULT_USER_ACCOUNTS, DEFAULT_ROLE_PERMISSIONS, DEFAULT_SKPD_LIST } from './data/defaultRBAC';
import { evaluateAuditLogic } from './services/logicEngine';
import { exportSingleAuditToExcel } from './services/exportService';
import { Navbar, ActiveTab } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { AuditSidebar } from './components/AuditSidebar';
import { AuditFormPage } from './components/AuditFormPage';

// Lazy-loaded secondary tab modules for peak initial bundle performance
const KecamatanDataTable = lazy(() =>
  import('./components/KecamatanDataTable').then((m) => ({ default: m.KecamatanDataTable }))
);
const AdminInstrumentBuilder = lazy(() =>
  import('./components/AdminInstrumentBuilder').then((m) => ({ default: m.AdminInstrumentBuilder }))
);
const SuperAdminPanel = lazy(() =>
  import('./components/SuperAdminPanel').then((m) => ({ default: m.SuperAdminPanel }))
);
const PanduanSection = lazy(() =>
  import('./components/PanduanSection').then((m) => ({ default: m.PanduanSection }))
);
const ProfileSettingsModal = lazy(() =>
  import('./components/ProfileSettingsModal').then((m) => ({ default: m.ProfileSettingsModal }))
);
import { getActiveAppwriteSession, logoutAppwriteSession } from './services/appwriteAuthService';
import {
  fetchSKPDsFromAppwrite,
  fetchUsersFromAppwrite,
  fetchPermissionsFromAppwrite,
  fetchQuestionsFromAppwrite,
  fetchCategoriesFromAppwrite,
  fetchSessionsFromAppwrite,
  saveSessionToAppwrite,
  savePermissionsToAppwrite,
  saveSKPDToAppwrite,
  saveUserToAppwrite,
  saveQuestionToAppwrite,
  saveCategoryToAppwrite,
  debouncedSaveSessionToAppwrite,
  flushPendingSessionSave,
} from './services/appwriteDbService';
import { CheckCircle, Clock, Filter, Lock } from 'lucide-react';

export const App: React.FC = () => {
  // Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('aski_is_logged_in') === 'true';
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);


  // Navigation & selection state
  const [activeTab, setActiveTab] = useState<ActiveTab>('audit-form');
  const [selectedKecamatanId, setSelectedKecamatanId] = useState<string>('kec-21'); // Default: Pulau Laut Sigam
  const [selectedUnit, setSelectedUnit] = useState<'UP' | 'UK'>('UP');
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [activeCategoryPageId, setActiveCategoryPageId] = useState<string>('');

  // RBAC & Master State
  const [skpds, setSKPDs] = useState<SKPDUnit[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [permissions, setPermissions] = useState<PermissionMatrix>(DEFAULT_ROLE_PERMISSIONS);
  const [activeUserId, setActiveUserId] = useState<string>('user-superadmin');

  // Master Instruments & Sessions
  const [questions, setQuestions] = useState<AuditQuestion[]>([]);
  const [categories, setCategories] = useState<AuditCategory[]>([]);
  const [sessions, setSessions] = useState<Record<string, AuditSession>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Tersimpan Lokal');

  // Light / Dark Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('aski-theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('aski-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Initialize storage & check live Appwrite backend
  useEffect(() => {
    setSKPDs(getStoredSKPDs());
    setUsers(getStoredUsers());
    setPermissions(getStoredPermissions());
    setActiveUserId(getStoredActiveUserId());
    setQuestions(getStoredQuestions());
    setCategories(getStoredCategories());
    setSessions(getStoredSessions());

    // Check live Appwrite session
    getActiveAppwriteSession().then((appwriteUser) => {
      if (appwriteUser) {
        setIsAuthenticated(true);
        setActiveUserId(appwriteUser.id);
        localStorage.setItem('aski_is_logged_in', 'true');
      }
    });

    // Defer background cloud database sync to idle callback to eliminate main-thread and network contention during initial paint
    const syncCloudData = () => {
      fetchSKPDsFromAppwrite().then((cloudSKPDs) => {
        if (cloudSKPDs && cloudSKPDs.length > 0) {
          setSKPDs(cloudSKPDs);
          saveStoredSKPDs(cloudSKPDs);
        }
      }).catch(() => {});

      fetchUsersFromAppwrite().then((cloudUsers) => {
        if (cloudUsers && cloudUsers.length > 0) {
          setUsers(cloudUsers);
          saveStoredUsers(cloudUsers);
        }
      }).catch(() => {});

      fetchPermissionsFromAppwrite().then((cloudPerms) => {
        if (cloudPerms) {
          setPermissions(cloudPerms);
          saveStoredPermissions(cloudPerms);
        }
      }).catch(() => {});

      fetchQuestionsFromAppwrite().then((cloudQuestions) => {
        if (cloudQuestions && cloudQuestions.length > 0) {
          setQuestions(cloudQuestions);
          saveStoredQuestions(cloudQuestions);
        }
      }).catch(() => {});

      fetchCategoriesFromAppwrite().then((cloudCategories) => {
        if (cloudCategories && cloudCategories.length > 0) {
          setCategories(cloudCategories);
          saveStoredCategories(cloudCategories);
        }
      }).catch(() => {});

      fetchSessionsFromAppwrite().then((cloudSessions) => {
        if (cloudSessions && Object.keys(cloudSessions).length > 0) {
          setSessions(cloudSessions);
          saveStoredSessions(cloudSessions);
        }
      }).catch(() => {});
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(syncCloudData, { timeout: 2000 });
    } else {
      setTimeout(syncCloudData, 400);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Login handler
  const handleLoginSuccess = (user: UserAccount) => {
    setUsers((prev) => {
      if (!prev.find((u) => u.id === user.id)) {
        const updated = [user, ...prev];
        saveStoredUsers(updated);
        return updated;
      }
      return prev;
    });

    setActiveUserId(user.id);
    saveStoredActiveUserId(user.id);
    setIsAuthenticated(true);
    localStorage.setItem('aski_is_logged_in', 'true');

    // Route dynamically based on user role
    if (user.role === 'OPERATOR') {
      if (user.unitKerjaId && user.unitKerjaId !== 'ALL') {
        setSelectedKecamatanId(user.unitKerjaId);
      }
      setActiveTab('audit-form');
    } else if (user.role === 'AUDITOR') {
      setActiveTab('rekap-kecamatan');
    } else if (user.role === 'SUPERADMIN') {
      setActiveTab('superadmin');
    }

    showToast(`Selamat bertugas, ${user.namaLengkap}! (${user.role})`);
  };

  // Logout handler
  const handleLogout = async () => {
    await logoutAppwriteSession();
    setIsAuthenticated(false);
    localStorage.removeItem('aski_is_logged_in');
    showToast('Sesi Anda telah berakhir. Anda telah keluar dari sistem ASKI.');
  };

  // Profile update handler
  const handleSaveProfile = (updatedUser: UserAccount) => {
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      saveStoredUsers(next);
      return next;
    });
    showToast(`Profil akun ${updatedUser.namaLengkap} berhasil diperbarui.`);
  };



  // Active User Profile & Permissions
  const currentUser = useMemo<UserAccount>(() => {
    return users.find((u) => u.id === activeUserId) || users[0] || DEFAULT_USER_ACCOUNTS[0];
  }, [users, activeUserId]);

  const currentPermissions = useMemo(() => {
    return permissions[currentUser.role] || permissions.OPERATOR;
  }, [permissions, currentUser.role]);

  // Current Active SKPD / Kecamatan
  const currentSKPD = useMemo<SKPDUnit>(() => {
    return skpds.find((k) => k.id === selectedKecamatanId) || skpds[0] || DEFAULT_SKPD_LIST[0];
  }, [skpds, selectedKecamatanId]);

  // Current Active Session
  const currentSessionId = `${selectedKecamatanId}_${selectedYear}_${selectedUnit}`;
  const currentSession = useMemo<AuditSession>(() => {
    if (sessions[currentSessionId]) {
      return sessions[currentSessionId];
    }
    // Create fallback if not exists
    return {
      id: currentSessionId,
      kecamatanId: selectedKecamatanId,
      tahunAudit: selectedYear,
      targetUnit: selectedUnit,
      status: 'DRAFT',
      answers: {},
      totalSkor: 0,
      skorMaksimal: 100,
      nilaiAkhir: 0,
      predikat: 'D',
      persentaseProgress: 0,
      updatedAt: new Date().toISOString(),
    };
  }, [sessions, currentSessionId, selectedKecamatanId, selectedYear, selectedUnit]);

  // Evaluated Audit logic on active questions & current answers
  const evalResult = useMemo(() => {
    if (questions.length === 0 || categories.length === 0) {
      return {
        evaluatedAnswers: {},
        totalScore: 0,
        maxScore: 0,
        percentageScore: 0,
        predikat: 'D' as const,
        progressPercentage: 0,
        answeredCount: 0,
        activeCount: 0,
        disabledCount: 0,
        categoryScores: {},
      };
    }
    return evaluateAuditLogic(questions, categories, currentSession.answers || {}, selectedUnit);
  }, [questions, categories, currentSession.answers, selectedUnit]);

  // Filtered active questions by unit
  const activeQuestions = useMemo(() => {
    return questions.filter((q) => q.targetUnit === selectedUnit || q.targetUnit === 'BOTH');
  }, [questions, selectedUnit]);

  const activeCategories = useMemo(() => {
    return categories
      .filter((c) => c.targetUnit === selectedUnit || c.targetUnit === 'BOTH')
      .sort((a, b) => a.urutan - b.urutan);
  }, [categories, selectedUnit]);

  const displayedCategories = useMemo(() => {
    if (selectedCategoryId === 'ALL') return activeCategories;
    return activeCategories.filter((c) => c.id === selectedCategoryId);
  }, [activeCategories, selectedCategoryId]);

  // Auto-set active category page to first category when categories/unit change
  useEffect(() => {
    if (activeCategories.length > 0 && (!activeCategoryPageId || !activeCategories.find((c) => c.id === activeCategoryPageId))) {
      setActiveCategoryPageId(activeCategories[0].id);
    }
  }, [activeCategories, activeCategoryPageId]);

  // User Switcher Handler
  const handleSelectUser = (newUserId: string) => {
    setActiveUserId(newUserId);
    saveStoredActiveUserId(newUserId);
    const target = users.find((u) => u.id === newUserId);
    if (target) {
      if (target.role === 'OPERATOR' && target.unitKerjaId !== 'ALL') {
        setSelectedKecamatanId(target.unitKerjaId);
        setActiveTab('audit-form');
      }
      showToast(`Beralih ke akun: ${target.namaLengkap} (${target.role})`);
    }
  };

  // Super Admin Handlers
  const handleSaveSKPDs = (newSKPDs: SKPDUnit[]) => {
    saveStoredSKPDs(newSKPDs);
    setSKPDs(newSKPDs);
    newSKPDs.forEach((skpd) => {
      saveSKPDToAppwrite(skpd).catch((e) => console.error('Failed to sync SKPD to Appwrite:', e));
    });
  };

  const handleSaveUsers = (newUsers: UserAccount[]) => {
    saveStoredUsers(newUsers);
    setUsers(newUsers);
    newUsers.forEach((user) => {
      saveUserToAppwrite(user).catch((e) => console.error('Failed to sync User to Appwrite:', e));
    });
  };

  const handleSavePermissions = (newPerms: PermissionMatrix) => {
    saveStoredPermissions(newPerms);
    setPermissions(newPerms);
    savePermissionsToAppwrite(newPerms).catch((e) => {
      console.error('Failed to sync permissions to Appwrite:', e);
    });
  };

  const handleResetPermissionsDefault = () => {
    saveStoredPermissions(DEFAULT_ROLE_PERMISSIONS);
    setPermissions(DEFAULT_ROLE_PERMISSIONS);
    savePermissionsToAppwrite(DEFAULT_ROLE_PERMISSIONS).catch((e) => {
      console.error('Failed to sync default permissions to Appwrite:', e);
    });
  };

  // Question Navigator click scroll
  const handleNavigateToQuestion = (questionId: string) => {
    const el = document.getElementById(`q-${questionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Handle Option Select (with Logic Engine update)
  const handleSelectOption = (questionId: string, optionId: string) => {
    if (!currentPermissions.canFillAuditForm) {
      showToast('Akun Anda tidak memiliki izin untuk mengubah jawaban audit.');
      return;
    }

    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const opt = question.options.find((o) => o.id === optionId);
    if (!opt) return;

    const rawAnswers = { ...currentSession.answers };
    const prevAnswer = rawAnswers[questionId] || {
      questionId,
      selectedOptionId: null,
      score: 0,
      level: 0,
      isDisabled: false,
      evidenceList: [],
    };

    rawAnswers[questionId] = {
      ...prevAnswer,
      selectedOptionId: optionId,
      score: opt.skor,
      level: opt.level,
      isDisabled: false,
    };

    const reEvaluated = evaluateAuditLogic(questions, categories, rawAnswers, selectedUnit);

    const updatedSession: AuditSession = {
      ...currentSession,
      answers: reEvaluated.evaluatedAnswers,
      totalSkor: reEvaluated.totalScore,
      skorMaksimal: reEvaluated.maxScore,
      nilaiAkhir: reEvaluated.percentageScore,
      predikat: reEvaluated.predikat,
      persentaseProgress: reEvaluated.progressPercentage,
      updatedAt: new Date().toISOString(),
    };

    saveStoredSession(updatedSession);
    debouncedSaveSessionToAppwrite(updatedSession).catch(() => {});
    setSessions((prev) => ({ ...prev, [updatedSession.id]: updatedSession }));
    setLastSavedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WITA');
  };

  // Handle Evidence Update
  const handleUpdateEvidence = (questionId: string, newEvidenceList: EvidenceFile[]) => {
    if (!currentPermissions.canUploadEvidence) {
      showToast('Akun Anda tidak memiliki izin untuk mengunggah berkas bukti dukung.');
      return;
    }

    const rawAnswers = { ...currentSession.answers };
    if (!rawAnswers[questionId]) return;
    rawAnswers[questionId].evidenceList = newEvidenceList;

    const updatedSession: AuditSession = {
      ...currentSession,
      answers: rawAnswers,
      updatedAt: new Date().toISOString(),
    };

    saveStoredSession(updatedSession);
    debouncedSaveSessionToAppwrite(updatedSession).catch(() => {});
    setSessions((prev) => ({ ...prev, [updatedSession.id]: updatedSession }));
    setLastSavedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WITA');
  };

  // Handle Auditor Notes Update
  const handleUpdateAuditorNote = (questionId: string, note: string) => {
    if (!currentPermissions.canEvaluateAudits) {
      showToast('Hanya Tim Audit atau Super Admin yang dapat menulis catatan rekomendasi.');
      return;
    }

    const rawAnswers = { ...currentSession.answers };
    if (!rawAnswers[questionId]) return;
    rawAnswers[questionId].catatanAuditor = note;

    const updatedSession: AuditSession = {
      ...currentSession,
      answers: rawAnswers,
      updatedAt: new Date().toISOString(),
    };

    saveStoredSession(updatedSession);
    debouncedSaveSessionToAppwrite(updatedSession).catch(() => {});
    setSessions((prev) => ({ ...prev, [updatedSession.id]: updatedSession }));
  };

  // Save Draft (Immediate flush & direct save)
  const handleSaveDraft = async () => {
    saveStoredSession(currentSession);
    await flushPendingSessionSave(currentSession.id);
    await saveSessionToAppwrite(currentSession).catch(() => {});
    setLastSavedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WITA');
    showToast(`Draf audit ${selectedUnit} ${currentSKPD.nama} tersimpan aman ke cloud.`);
  };

  // Submit / Verify Audit (Immediate flush & direct save)
  const handleSubmitAudit = async () => {
    const isAuditorOrAdmin = currentUser.role === 'AUDITOR' || currentUser.role === 'SUPERADMIN';
    const updated: AuditSession = {
      ...currentSession,
      status: isAuditorOrAdmin ? 'VERIFIED' : 'SUBMITTED',
      namaAuditor: isAuditorOrAdmin ? currentUser.namaLengkap : currentSession.namaAuditor,
      namaOperator: !isAuditorOrAdmin ? currentUser.namaLengkap : currentSession.namaOperator,
      updatedAt: new Date().toISOString(),
    };
    saveStoredSession(updated);
    await flushPendingSessionSave(updated.id);
    await saveSessionToAppwrite(updated).catch(() => {});
    setSessions((prev) => ({ ...prev, [updated.id]: updated }));
    setLastSavedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WITA');

    if (isAuditorOrAdmin) {
      showToast(`Hasil pengawasan ${selectedUnit} ${currentSKPD.nama} berhasil diverifikasi & disahkan.`);
    } else {
      showToast(`Pengawasan ${selectedUnit} ${currentSKPD.nama} resmi dikirim ke Tim Dispersip.`);
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    const kecPayload = {
      id: currentSKPD.id,
      kode: currentSKPD.kode,
      nama: currentSKPD.nama,
      tipe: (currentSKPD.tipe as 'Daratan' | 'Kepulauan') || 'Daratan',
      ibukota: currentSKPD.ibukota || currentSKPD.kategori || 'Kotabaru',
      kontakOperator: currentSKPD.kontak || currentSKPD.kontakOperator,
    };
    exportSingleAuditToExcel(currentSession, kecPayload, questions, categories);
    showToast('Lembar kerja ASKI Excel berhasil diunduh.');
  };

  const handleSelectKecamatanAndUnit = (kecId: string, unit: 'UP' | 'UK') => {
    flushPendingSessionSave().catch(() => {});
    setSelectedKecamatanId(kecId);
    setSelectedUnit(unit);
    setActiveTab('audit-form');
  };

  const handleSaveMasterQuestions = (newQuestions: AuditQuestion[]) => {
    saveStoredQuestions(newQuestions);
    setQuestions(newQuestions);
    newQuestions.forEach((q) => {
      saveQuestionToAppwrite(q).catch((e) => console.error('Failed to sync Question to Appwrite:', e));
    });
    showToast('Master instrumen butir soal dan alur logic berhasil disimpan.');
  };

  const handleSaveMasterCategories = (newCategories: AuditCategory[]) => {
    saveStoredCategories(newCategories);
    setCategories(newCategories);
    newCategories.forEach((c) => {
      saveCategoryToAppwrite(c).catch((e) => console.error('Failed to sync Category to Appwrite:', e));
    });
    showToast('Kategori kearsipan berhasil disimpan.');
  };

  // If user is not authenticated, present the dedicated Full-Page Login
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        skpds={skpds.length > 0 ? skpds : DEFAULT_SKPD_LIST}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#090d16] dark:text-slate-100 transition-colors duration-150">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white rounded-lg shadow-2xl text-xs font-semibold border border-emerald-500/50">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar with Profile Bar and User Menu */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedKecamatanId={selectedKecamatanId}
        setSelectedKecamatanId={setSelectedKecamatanId}
        selectedUnit={selectedUnit}
        setSelectedUnit={setSelectedUnit}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        currentUser={currentUser}
        skpds={skpds}
        permissions={permissions}
        theme={theme}
        onToggleTheme={toggleTheme}
        onResetDefaults={resetAllDataToDefault}
        onLogout={handleLogout}
        onOpenProfileSettings={() => setIsProfileModalOpen(true)}
      />

      {/* User Profile Settings Modal (Lazy-loaded on demand) */}
      {isProfileModalOpen && (
        <Suspense fallback={null}>
          <ProfileSettingsModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            currentUser={currentUser}
            skpds={skpds}
            onSaveProfile={handleSaveProfile}
          />
        </Suspense>
      )}



      {/* Content Body */}
      {activeTab === 'audit-form' ? (
        /* AUDIT FORM TAB: Full-width sidebar + content layout (no max-w container) */
        <div className="flex-1 flex overflow-hidden">
          {/* Permanent Left Sidebar */}
          <AuditSidebar
            selectedKecamatanId={selectedKecamatanId}
            setSelectedKecamatanId={setSelectedKecamatanId}
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            currentUser={currentUser}
            skpds={skpds}
            activeCategories={activeCategories}
            activeQuestions={activeQuestions}
            evalResult={evalResult}
            activeCategoryId={activeCategoryPageId}
            onSelectCategory={setActiveCategoryPageId}
            sessionStatus={currentSession.status}
            onSaveDraft={handleSaveDraft}
            onSubmitAudit={handleSubmitAudit}
            onExportExcel={handleExportExcel}
            canExport={currentPermissions.canExportReports}
            userRole={currentUser.role}
          />

          {/* Main Content: Category-Page Guided Form */}
          <AuditFormPage
            activeCategories={activeCategories}
            activeQuestions={activeQuestions}
            evalResult={evalResult}
            activeCategoryId={activeCategoryPageId}
            onChangeCategoryId={setActiveCategoryPageId}
            onSelectOption={handleSelectOption}
            onUpdateEvidence={handleUpdateEvidence}
            onUpdateAuditorNote={handleUpdateAuditorNote}
            isAuditorView={currentPermissions.canEvaluateAudits}
            canAnswer={currentPermissions.canFillAuditForm}
            canUploadEvidence={currentPermissions.canUploadEvidence}
            unitName={selectedUnit === 'UP' ? 'Unit Pengolah (UP)' : 'Unit Kearsipan (UK)'}
            skpdName={currentSKPD.nama}
            lastSavedTime={lastSavedTime}
          />
        </div>
      ) : (
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center p-16 space-y-3 text-slate-400">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              <span className="text-xs font-medium">Memuat modul pengawasan...</span>
            </div>
          }
        >
          {/* TAB 2: REKAPITULASI 22 KECAMATAN & SKPD (TANSTACK TABLE) */}
          {activeTab === 'rekap-kecamatan' && (
            currentPermissions.canViewAllRekap ? (
              <KecamatanDataTable
                sessions={sessions}
                selectedYear={selectedYear}
                onSelectKecamatanAndUnit={handleSelectKecamatanAndUnit}
                skpds={skpds}
              />
            ) : (
              <div className="gov-card p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <Lock className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Akses Rekapitulasi Dibatasi</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Akun Operator hanya dapat mengakses formulir pengawasan pada unit kerja yang ditugaskan.
                </p>
              </div>
            )
          )}

          {/* TAB 3: ADMIN INSTRUMENT & LOGIC BUILDER */}
          {activeTab === 'admin-builder' && (
            currentPermissions.canManageInstruments ? (
              <AdminInstrumentBuilder
                questions={questions}
                categories={categories}
                onSaveQuestions={handleSaveMasterQuestions}
                onSaveCategories={handleSaveMasterCategories}
              />
            ) : (
              <div className="gov-card p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <Lock className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Akses Manajemen Instrumen Dibatasi</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Hanya Tim Audit Dispersip dan Super Administrator yang berwenang merumuskan butir instrumen audit dan aturan logic.
                </p>
              </div>
            )
          )}

          {/* TAB 4: SUPER ADMIN PANEL (SKPD, USERS, TOGGLE PERMISSIONS) */}
          {activeTab === 'superadmin' && (
            <SuperAdminPanel
              skpds={skpds}
              users={users}
              permissions={permissions}
              onSaveSKPDs={handleSaveSKPDs}
              onSaveUsers={handleSaveUsers}
              onSavePermissions={handleSavePermissions}
              onResetPermissionsDefault={handleResetPermissionsDefault}
              showToast={showToast}
            />
          )}

          {/* TAB 5: PANDUAN ASKI */}
          {activeTab === 'panduan' && <PanduanSection />}
        </Suspense>
      </main>
      )}

      {/* Institutional Footer */}
      <footer className="mt-12 py-5 border-t border-slate-200 dark:border-slate-800/80 text-center text-xs text-slate-500 bg-slate-100 dark:bg-[#070a12]">
        <p>
          Sistem Pengawasan Kearsipan Internal (ASKI) • Pemerintah Kabupaten Kotabaru • Dinas Perpustakaan dan Kearsipan
        </p>
      </footer>
    </div>
  );
};
