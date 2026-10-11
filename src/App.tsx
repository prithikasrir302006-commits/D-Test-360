import React, { useState } from 'react';
import { Operator, FieldTestRecord } from './types';
import {
  getStoredOperator,
  saveOperator,
  clearOperator,
  getStoredFieldTests,
  saveFieldTest,
  deleteFieldTest,
} from './services/storage';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { DashboardView } from './components/DashboardView';
import { NewTestWizard } from './components/NewTestWizard';
import { EvidenceHistoryView } from './components/EvidenceHistoryView';
import { EvidenceVerificationView } from './components/EvidenceVerificationView';
import { SecurityKeysView } from './components/SecurityKeysView';
import { RecordDetailModal } from './components/RecordDetailModal';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  // Authentication State
  const [operator, setOperator] = useState<Operator | null>(() => getStoredOperator());

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Field Tests & Evidence Records
  const [tests, setTests] = useState<FieldTestRecord[]>(() => getStoredFieldTests());

  // Active Dossier Modal
  const [selectedRecordForModal, setSelectedRecordForModal] = useState<FieldTestRecord | null>(null);

  // Verification Pre-selection
  const [preselectedVerificationRecord, setPreselectedVerificationRecord] = useState<FieldTestRecord | null>(null);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Login handler
  const handleLoginSuccess = (op: Operator) => {
    saveOperator(op);
    setOperator(op);
    addToast('success', `Session Authorized`, `Welcome, Operator ${op.username} (${op.badgeNumber})`);
  };

  // Logout handler
  const handleLogout = () => {
    clearOperator();
    setOperator(null);
    setCurrentTab('dashboard');
    setSelectedRecordForModal(null);
    setPreselectedVerificationRecord(null);
    addToast('info', 'Session Closed', 'You have been logged out of the field testing enclave.');
  };

  // Complete a newly conducted field test
  const handleCompleteNewTest = (newRecord: FieldTestRecord) => {
    saveFieldTest(newRecord);
    setTests(getStoredFieldTests());
    setCurrentTab('dashboard');
  };

  // Delete a test record
  const handleDeleteTest = (id: string) => {
    deleteFieldTest(id);
    setTests(getStoredFieldTests());
    if (selectedRecordForModal?.id === id) {
      setSelectedRecordForModal(null);
    }
    addToast('info', 'Record Removed', `Evidence record ${id} deleted.`);
  };

  // Verify a specific record from table or dashboard
  const handleTriggerVerification = (record: FieldTestRecord) => {
    setPreselectedVerificationRecord(record);
    setCurrentTab('verification');
  };

  // If user is unauthenticated, show LoginScreen first (per prompt instruction)
  if (!operator) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#E4D8CE] text-[#30302E] flex flex-col md:flex-row selection:bg-[#A85F4B] selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'verification') {
            setPreselectedVerificationRecord(null);
          }
        }}
        operator={operator}
        onLogout={handleLogout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        totalRecords={tests.length}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNav
          currentTab={currentTab}
          operator={operator}
          onLogout={handleLogout}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {/* TAB 1: DASHBOARD */}
          {currentTab === 'dashboard' && (
            <DashboardView
              tests={tests}
              onStartNewTest={() => setCurrentTab('new-test')}
              onViewReport={(record) => setSelectedRecordForModal(record)}
              onVerifyRecord={handleTriggerVerification}
              onViewAllHistory={() => setCurrentTab('history')}
              onRefresh={() => {
                setTests(getStoredFieldTests());
                addToast('info', 'Dashboard Refreshed', 'Calculated fresh statistics from evidence records.');
              }}
            />
          )}

          {/* TAB 2: NEW FIELD TEST */}
          {currentTab === 'new-test' && (
            <NewTestWizard
              operator={operator}
              onCancel={() => setCurrentTab('dashboard')}
              onCompleteTest={handleCompleteNewTest}
              onShowToast={addToast}
            />
          )}

          {/* TAB 3: EVIDENCE HISTORY */}
          {currentTab === 'history' && (
            <EvidenceHistoryView
              tests={tests}
              onViewRecord={(record) => setSelectedRecordForModal(record)}
              onVerifyRecord={handleTriggerVerification}
              onDeleteRecord={handleDeleteTest}
              onShowToast={addToast}
            />
          )}

          {/* TAB 4: EVIDENCE VERIFICATION */}
          {currentTab === 'verification' && (
            <EvidenceVerificationView
              tests={tests}
              preselectedRecord={preselectedVerificationRecord}
            />
          )}

          {/* TAB 5: SECURITY & KEYS */}
          {currentTab === 'security' && <SecurityKeysView />}
        </main>

        {/* Global Footer matching WELLS minimal editorial style */}
        <footer className="border-t border-[#D3C7BD] bg-[#E4D8CE] py-4 px-6 text-xs text-[#77716C] mt-auto">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <span className="font-heading font-bold text-[#30302E]">D-TEST 360</span>
              <span> · Field Drug Testing Support System · Narcotics Control Bureau Operations</span>
            </div>
            <div className="text-[11px] font-mono text-[#8C8680]">
              SWGDRUG Category C Screening · Digital Traceability & SHA-256 Enclave
            </div>
          </div>
        </footer>
      </div>

      {/* Record Detail Dossier Modal */}
      <RecordDetailModal
        record={selectedRecordForModal}
        onClose={() => setSelectedRecordForModal(null)}
        onShowToast={addToast}
      />

      {/* Global Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
