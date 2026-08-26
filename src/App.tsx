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

const MainAppLayout: React.FC = () => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showLoginScreen, setShowLoginScreen] = useState<boolean>(false);

  // If visitor is not authenticated:
  if (!currentUser) {
    if (showLoginScreen) {
      return <LoginView onBackToHome={() => setShowLoginScreen(false)} />;
    }
    return <PublicHomeView onOpenLogin={() => setShowLoginScreen(true)} />;
  }

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <PublicHomeView onOpenLogin={() => setActiveTab('dashboard')} />;

      case 'dashboard':
        if (currentUser.role === 'STUDENT') {
          return <StudentDashboard onNavigateTab={setActiveTab} />;
        }
        if (currentUser.role === 'TEACHER') {
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

      case 'students':
      case 'teachers':
      case 'subscriptions':
      case 'permissions':
      case 'reports':
      case 'settings':
        return <AdminDashboard onNavigateTab={setActiveTab} />;

      case 'profile':
        return <ProfileView />;

      default:
        if (currentUser.role === 'STUDENT') return <StudentDashboard onNavigateTab={setActiveTab} />;
        if (currentUser.role === 'TEACHER') return <TeacherDashboard onNavigateTab={setActiveTab} />;
        return <AdminDashboard onNavigateTab={setActiveTab} />;
    }
  };

  return (
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
          ALTEQ Platform © {new Date().getFullYear()} — Alafak International Training and Education Consultants. All rights reserved.
        </p>
      </footer>
    </div>
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
