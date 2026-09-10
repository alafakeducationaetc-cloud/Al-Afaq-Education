import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { I18nProvider, useI18n } from './lib/i18n';
import { LoginView } from './components/auth/LoginView';
import { PublicHomeView } from './components/home/PublicHomeView';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { StudentDashboard } from './components/student/StudentDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { InteractiveWhiteboard } from './components/classroom/InteractiveWhiteboard';
import { ActivityLibrary } from './components/activities/ActivityLibrary';
import { ClassScheduleView } from './components/classroom/ClassScheduleView';
import { AttendanceView } from './components/classroom/AttendanceView';
import { ProgramListView } from './components/programs/ProgramListView';
import { LessonBuilderView } from './components/lessons/LessonBuilderView';
import { ProfileView } from './components/profile/ProfileView';
import { MessagingView } from './components/chat/MessagingView';
import { CertificatesManager } from './components/certificates/CertificatesManager';
import { FloatingWhatsAppButton } from './components/common/FloatingWhatsAppButton';

const MainAppLayout: React.FC = () => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showLoginScreen, setShowLoginScreen] = useState<boolean>(false);

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <PublicHomeView onOpenLogin={() => setActiveTab('dashboard')} />;

      case 'dashboard':
        if (currentUser?.role === 'STUDENT') {
          return <StudentDashboard onNavigateTab={setActiveTab} />;
        }
        if (currentUser?.role === 'TEACHER') {
          return <TeacherDashboard onNavigateTab={setActiveTab} />;
        }
        return <AdminDashboard onNavigateTab={setActiveTab} />;

      case 'whiteboard':
        return <InteractiveWhiteboard />;

      case 'activities':
        return <ActivityLibrary />;

      case 'classes':
      case 'zoom':
        return <ClassScheduleView onNavigateTab={setActiveTab} />;

      case 'attendance':
        return <AttendanceView />;

      case 'programs':
        return <ProgramListView onNavigateTab={setActiveTab} />;

      case 'lessons':
        return <LessonBuilderView onNavigateTab={setActiveTab} />;

      case 'certificates':
        return <CertificatesManager />;

      case 'my_classes':
        return <AdminDashboard onNavigateTab={setActiveTab} initialSubTab="MY_CLASSES" key="my_classes" />;

      case 'students':
        return <AdminDashboard onNavigateTab={setActiveTab} initialSubTab="STUDENTS" key="students" />;

      case 'teachers':
        return <AdminDashboard onNavigateTab={setActiveTab} initialSubTab="TEACHERS" key="teachers" />;

      case 'subscriptions':
        return <AdminDashboard onNavigateTab={setActiveTab} initialSubTab="SUBSCRIPTIONS" key="subscriptions" />;

      case 'permissions':
        return <AdminDashboard onNavigateTab={setActiveTab} initialSubTab="PERMISSIONS" key="permissions" />;

      case 'reports':
      case 'settings':
        return <AdminDashboard onNavigateTab={setActiveTab} initialSubTab="SETTINGS" key="settings" />;

      case 'profile':
        return <ProfileView />;

      case 'messages':
      case 'chat':
        return <MessagingView />;

      default:
        if (currentUser?.role === 'STUDENT') return <StudentDashboard onNavigateTab={setActiveTab} />;
        if (currentUser?.role === 'TEACHER') return <TeacherDashboard onNavigateTab={setActiveTab} />;
        return <AdminDashboard onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <>
      {!currentUser ? (
        showLoginScreen ? (
          <LoginView onBackToHome={() => setShowLoginScreen(false)} />
        ) : (
          <PublicHomeView onOpenLogin={() => setShowLoginScreen(true)} />
        )
      ) : (
        <div className="min-h-screen bg-[#F8F6F0] text-[#29235D] flex flex-col font-sans selection:bg-[#D3B673]/30 selection:text-[#29235D]">
          {/* Top Header Navigation */}
          <Navbar onNavigateTab={setActiveTab} activeTab={activeTab} />

          {/* Main Workspace Body */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex gap-6">
            {/* Role-Based Desktop Sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Dynamic Viewport Content */}
            <section className="flex-1 min-w-0">
              {renderActiveTabContent()}
            </section>
          </main>

          {/* Footer Notice */}
          <footer className="py-4 border-t border-[#29235D]/10 text-center text-xs text-[#786F9A]">
            <p>
              منصة الآفاق التعليمية © {new Date().getFullYear()} — جميع الحقوق محفوظة
            </p>
          </footer>
        </div>
      )}

      {/* Persistent 'Contact Support' Floating Action Button (WhatsApp direct chat) */}
      <FloatingWhatsAppButton />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <I18nProvider>
        <MainAppLayout />
      </I18nProvider>
    </AppProvider>
  );
}
