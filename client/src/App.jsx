import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { FirstLoginModal } from './components/FirstLoginModal';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { CertificateModal } from './components/CertificateModal';
import { GatePassModal } from './components/GatePassModal';
import { KioskFallbackView } from './components/KioskFallbackView';
import { AdoptionNoteModal } from './components/AdoptionNoteModal';

// Pages
import { LoginPage } from './pages/LoginPage';

// Student Views
import { StudentDashboard } from './pages/student/StudentDashboard';
import { AttendanceView } from './pages/student/AttendanceView';
import { TimetableView } from './pages/student/TimetableView';
import { ComplaintsView } from './pages/student/ComplaintsView';
import { GatePassView } from './pages/student/GatePassView';
import { LeaveView } from './pages/student/LeaveView';
import { DocumentsView } from './pages/student/DocumentsView';
import { HostelView } from './pages/student/HostelView';
import { MessView } from './pages/student/MessView';
import { NoticesView } from './pages/student/NoticesView';
import { FeesView } from './pages/student/FeesView';
import { ProfileView } from './pages/student/ProfileView';

// Admin Views
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminComplaintsView } from './pages/admin/AdminComplaintsView';
import { AdminGatePassView } from './pages/admin/AdminGatePassView';
import { AdminLeaveView } from './pages/admin/AdminLeaveView';
import { AdminDocumentsView } from './pages/admin/AdminDocumentsView';
import { AdminStudentsView } from './pages/admin/AdminStudentsView';
import { AdminAttendanceView } from './pages/admin/AdminAttendanceView';
import { AdminNoticesView } from './pages/admin/AdminNoticesView';
import { AdminMessView } from './pages/admin/AdminMessView';
import { AdminAuditView } from './pages/admin/AdminAuditView';

function MainApp() {
  const { user, isAuthenticated, mustChangePassword, loading } = useAuth();
  const isAdmin = ['super_admin', 'academic_admin', 'hostel_admin'].includes(user?.role);

  const [currentTab, setCurrentTab] = useState(isAdmin ? 'admin-dashboard' : 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals state
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showKioskModal, setShowKioskModal] = useState(false);
  const [showAdoptionModal, setShowAdoptionModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Entity Modals
  const [activeCert, setActiveCert] = useState(null);
  const [activeGatePass, setActiveGatePass] = useState(null);

  // Update tab default when user role changes
  React.useEffect(() => {
    if (isAdmin) {
      if (!currentTab.startsWith('admin-')) {
        setCurrentTab('admin-dashboard');
      }
    } else {
      if (currentTab.startsWith('admin-')) {
        setCurrentTab('dashboard');
      }
    }
  }, [user?.role, isAdmin]);

  // Mandatory first login modal check
  React.useEffect(() => {
    if (isAuthenticated && mustChangePassword) {
      setShowFirstLoginModal(true);
    }
  }, [isAuthenticated, mustChangePassword]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-xs font-semibold text-slate-600">Connecting to Campus Life Database...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage
          onOpenForgotPassword={() => setShowForgotPasswordModal(true)}
          onOpenKiosk={() => setShowKioskModal(true)}
          onOpenAdoptionNote={() => setShowAdoptionModal(true)}
        />
        <ForgotPasswordModal
          isOpen={showForgotPasswordModal}
          onClose={() => setShowForgotPasswordModal(false)}
        />
        <KioskFallbackView
          isOpen={showKioskModal}
          onClose={() => setShowKioskModal(false)}
        />
        <AdoptionNoteModal
          isOpen={showAdoptionModal}
          onClose={() => setShowAdoptionModal(false)}
        />
      </>
    );
  }

  const renderContent = () => {
    switch (currentTab) {
      // Student Tabs
      case 'dashboard':
        return (
          <StudentDashboard
            onNavigate={setCurrentTab}
            onOpenGatePassModal={setActiveGatePass}
            onOpenCertModal={setActiveCert}
          />
        );
      case 'attendance':
        return <AttendanceView />;
      case 'timetable':
        return <TimetableView />;
      case 'complaints':
        return <ComplaintsView />;
      case 'gatepass':
        return <GatePassView onOpenGatePassModal={setActiveGatePass} />;
      case 'leave':
        return <LeaveView />;
      case 'documents':
        return <DocumentsView onOpenCertModal={setActiveCert} />;
      case 'hostel':
        return <HostelView />;
      case 'mess':
        return <MessView />;
      case 'notices':
        return <NoticesView />;
      case 'fees':
        return <FeesView />;
      case 'profile':
        return <ProfileView onChangePasswordModal={() => setShowChangePasswordModal(true)} />;

      // Admin Tabs
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={setCurrentTab} />;
      case 'admin-complaints':
        return <AdminComplaintsView />;
      case 'admin-gatepass':
        return <AdminGatePassView onOpenGatePassModal={setActiveGatePass} />;
      case 'admin-leave':
        return <AdminLeaveView />;
      case 'admin-documents':
        return <AdminDocumentsView onOpenCertModal={setActiveCert} />;
      case 'admin-students':
        return <AdminStudentsView />;
      case 'admin-attendance':
        return <AdminAttendanceView />;
      case 'admin-notices':
        return <AdminNoticesView />;
      case 'admin-mess':
        return <AdminMessView />;
      case 'admin-audit':
        return <AdminAuditView />;

      default:
        return isAdmin ? <AdminDashboard onNavigate={setCurrentTab} /> : <StudentDashboard onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenAdoptionNote={() => setShowAdoptionModal(true)}
        onOpenKioskModal={() => setShowKioskModal(true)}
        onChangePasswordModal={() => setShowChangePasswordModal(true)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenAdoptionNote={() => setShowAdoptionModal(true)}
          onOpenKioskModal={() => setShowKioskModal(true)}
        />

        {/* View Content Canvas */}
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 min-w-0">
          {renderContent()}
        </main>
      </div>

      {/* Mandatory First Login Password Change Modal */}
      <FirstLoginModal
        isOpen={showFirstLoginModal || showChangePasswordModal}
        onClose={() => {
          setShowFirstLoginModal(false);
          setShowChangePasswordModal(false);
        }}
      />

      {/* Printable Certificate Modal */}
      <CertificateModal
        certificate={activeCert}
        isOpen={!!activeCert}
        onClose={() => setActiveCert(null)}
      />

      {/* Digital Gate Pass Card Modal */}
      <GatePassModal
        pass={activeGatePass}
        isOpen={!!activeGatePass}
        onClose={() => setActiveGatePass(null)}
        onPassUpdated={() => {}}
      />

      {/* Kiosk / Offline Fallback Modal */}
      <KioskFallbackView
        isOpen={showKioskModal}
        onClose={() => setShowKioskModal(false)}
      />

      {/* Institutional Adoption Note Modal */}
      <AdoptionNoteModal
        isOpen={showAdoptionModal}
        onClose={() => setShowAdoptionModal(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </AuthProvider>
  );
}
