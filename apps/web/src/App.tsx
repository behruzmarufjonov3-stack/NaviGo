import React from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { LeftDock } from './components/LeftDock';
import { LeftPanel } from './components/LeftPanel';
import { MapContainer } from './components/MapContainer';
import { MobileBottomSheet } from './components/MobileBottomSheet';
import { ReportModal } from './components/ReportModal';
import { MyReportsModal } from './components/MyReportsModal';
import { SupportChatModal } from './components/SupportChatModal';
import { LegendModal } from './components/LegendModal';
import { AuthModal } from './components/AuthModal';
import { AdminConsole } from './components/AdminConsole';
import { EditorWorkspace } from './components/EditorWorkspace';
import { AnalystWorkspace } from './components/AnalystWorkspace';
import { SettingsModal } from './components/SettingsModal';
import { ListAlternativeModal } from './components/ListAlternativeModal';
import { NotificationsModal } from './components/NotificationsModal';
import { AmbulanceApp } from './ambulance/AmbulanceApp';
import { FuelSelectorModal } from './components/FuelSelectorModal';
import { UserProfileModal } from './components/UserProfileModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { LegalModal } from './components/LegalModal';
import { ErrorBoundary } from './components/ErrorBoundary';

export const MainLayout: React.FC = () => {
  const [legalModalState, setLegalModalState] = React.useState<{ isOpen: boolean; tab: 'privacy' | 'terms' | 'steps' }>({
    isOpen: false,
    tab: 'privacy'
  });

  const handleOpenLegalModal = (tab: 'privacy' | 'terms' | 'steps' = 'privacy') => {
    setLegalModalState({ isOpen: true, tab });
  };
  return (
    <div className="w-screen h-dvh overflow-hidden flex flex-col bg-outerBg dark:bg-darkOuter p-1.5 sm:p-4">
      {/* Outer App Panel Container with 32px radius (Part 4.1) */}
      <div className="w-full h-full flex flex-col bg-appPanel dark:bg-darkPanel rounded-[24px] sm:rounded-panel shadow-float border border-yolBorder dark:border-darkBorder overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Workspace Body Area */}
        <div className="flex-1 flex overflow-hidden p-1.5 pb-[92px] sm:p-4 md:pb-4 gap-4 relative">
          {/* Desktop Left Rail Dock */}
          <LeftDock />

          {/* Desktop Left Card Panel */}
          <LeftPanel />

          {/* Interactive Map */}
          <main className="flex-1 h-full relative" aria-label="Interactive Map Area">
            <MapContainer />
          </main>
        </div>

        {/* Mobile Bottom Sheet & Nav Bar */}
        <MobileBottomSheet />

        {/* Interactive Modals and Workspaces */}
        <ReportModal />
        <MyReportsModal />
        <SupportChatModal />
        <LegendModal />
        <AuthModal />
        <AdminConsole />
        <EditorWorkspace />
        <AnalystWorkspace />
        <SettingsModal />
        <ListAlternativeModal />
        <NotificationsModal />
        <FuelSelectorModal />
        <UserProfileModal onOpenLegalModal={handleOpenLegalModal} />
        <CookieConsentBanner onOpenLegalModal={handleOpenLegalModal} />
        <LegalModal 
          isOpen={legalModalState.isOpen} 
          onClose={() => setLegalModalState(prev => ({ ...prev, isOpen: false }))} 
          defaultTab={legalModalState.tab} 
        />
      </div>
    </div>
  );
};

export function App() {
  const [route, setRoute] = React.useState(window.location.hash);

  React.useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isEmergencyRoute = [
    '#/ambulance',
    '#/police',
    '#/fire',
    '#/gas',
    '#/rescue',
    '#/103',
    '#/102',
    '#/101',
    '#/104',
    '#/1050'
  ].includes(route);

  return (
    <ErrorBoundary>
      <AppProvider>
        {isEmergencyRoute ? <AmbulanceApp /> : <MainLayout />}
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
