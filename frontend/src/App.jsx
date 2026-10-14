
import React, { useState, useEffect } from 'react';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import EmployeeModal from './components/EmployeeModal';
import Toast from './components/Toast';

import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeDetails from './pages/EmployeeDetails';
import AttritionPrediction from './pages/AttritionPrediction';
import SkillMapping from './pages/SkillMapping';
import Recommendations from './pages/Recommendations';

import { api } from './services/api';

export default function App() {
  // AUTH STATE
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // APPLICATION STATE
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [targetRoleForRecommendations, setTargetRoleForRecommendations] =
    useState('');
  const [simulationData, setSimulationData] = useState(null);

  // MODAL + TOAST STATE
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // BACKEND HEALTH
  const [healthInfo, setHealthInfo] = useState(null);
  const [refreshRosterKey, setRefreshRosterKey] = useState(0);

  // RESTORE LOGIN SESSION
  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem('workforce_token');

      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await api.getMe();

        if (response.success && response.user) {
          setUser(response.user);
        } else {
          localStorage.removeItem('workforce_token');
          localStorage.removeItem('workforce_user');
        }
      } catch (error) {
        console.warn('Session restore failed:', error.message);

        localStorage.removeItem('workforce_token');
        localStorage.removeItem('workforce_user');
      } finally {
        setAuthLoading(false);
      }
    }

    restoreSession();
  }, []);

  // BACKEND HEALTH CHECK
  useEffect(() => {
    if (!user) return;

    async function checkHealth() {
      try {
        const res = await api.getHealth();
        setHealthInfo(res);
      } catch (err) {
        console.warn('Backend health check warning:', err.message);
      }
    }

    checkHealth();
  }, [user]);

  // TOAST
  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // LOGIN
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setActiveTab('dashboard');

    triggerToast(
      `Welcome back, ${loggedInUser.name}!`,
      'success'
    );
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('workforce_token');
    localStorage.removeItem('workforce_user');

    setUser(null);
    setActiveTab('dashboard');
    setSelectedEmployeeId(null);
    setSimulationData(null);
    setToastMessage('');
  };

  // ADD EMPLOYEE MODAL
  const handleOpenAddModal = () => {
    if (user?.role !== 'HR') {
      triggerToast(
        'Only HR administrators can add employees.',
        'error'
      );
      return;
    }

    setEditingEmployee(null);
    setIsEmployeeModalOpen(true);
  };

  // EDIT EMPLOYEE
  const handleEditEmployee = (emp) => {
    if (user?.role !== 'HR') {
      triggerToast(
        'Only HR administrators can edit employees.',
        'error'
      );
      return;
    }

    setEditingEmployee(emp);
    setIsEmployeeModalOpen(true);
  };

  // SAVE EMPLOYEE
  const handleSaveEmployee = async (employeeData) => {
    if (user?.role !== 'HR') {
      triggerToast(
        'Only HR administrators can modify employees.',
        'error'
      );
      return;
    }

    try {
      if (editingEmployee) {
        const id =
          editingEmployee._id ||
          editingEmployee.employeeId;

        await api.updateEmployee(id, employeeData);

        triggerToast(
          `Employee ${employeeData.name} updated successfully! Attrition risk re-evaluated.`,
          'success'
        );
      } else {
        await api.createEmployee(employeeData);

        triggerToast(
          `Employee ${employeeData.name} added! AI risk score indexed.`,
          'success'
        );
      }

      setRefreshRosterKey((key) => key + 1);
      setIsEmployeeModalOpen(false);
    } catch (err) {
      triggerToast(
        err.message || 'Error saving employee profile',
        'error'
      );

      throw err;
    }
  };

  // SIMULATE EMPLOYEE
  const handleSimulateEmployee = (emp) => {
    setSimulationData(emp);
    setActiveTab('predict');
  };

  // OPEN RECOMMENDATIONS
  const handleOpenRecommendations = (empId, role) => {
    setSelectedEmployeeId(empId);
    setTargetRoleForRecommendations(role);
    setActiveTab('recommendations');
  };

  // LOADING SCREEN
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080d18]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-400/20 border-t-cyan-300" />

          <p className="mt-4 text-sm text-white">
            Loading WorkforceAI...
          </p>
        </div>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // MAIN APPLICATION
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080d18] font-sans">

      {/* SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* MAIN COLUMN */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">

        {/* NAVBAR */}
        <Navbar
          activeTab={activeTab}
          onOpenAddModal={handleOpenAddModal}
          healthInfo={healthInfo}
          user={user}
          onLogout={handleLogout}
        />

        {/* SCROLLABLE CONTENT AREA */}
        <main
          className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#080d18]"
          style={{ overscrollBehaviorY: 'contain' }}
        >

          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigate={setActiveTab}
              onSelectEmployee={(id) => {
                setSelectedEmployeeId(id);
                setActiveTab('details');
              }}
            />
          )}

          {activeTab === 'employees' && user.role === 'HR' && (
            <Employees
              onSelectEmployee={(id) => {
                setSelectedEmployeeId(id);
                setActiveTab('details');
              }}
              onNavigate={setActiveTab}
              onOpenAddModal={handleOpenAddModal}
              onEditEmployee={handleEditEmployee}
              refreshTrigger={refreshRosterKey}
            />
          )}

          {activeTab === 'details' && user.role === 'HR' && (
            <EmployeeDetails
              employeeId={selectedEmployeeId}
              onNavigate={setActiveTab}
              onEditEmployee={handleEditEmployee}
              onSimulateEmployee={handleSimulateEmployee}
              onOpenRecommendations={handleOpenRecommendations}
            />
          )}

          {activeTab === 'predict' && (
            <AttritionPrediction
              initialData={simulationData}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'skills' && (
            <SkillMapping
              onNavigate={setActiveTab}
              onOpenRecommendations={handleOpenRecommendations}
            />
          )}

          {activeTab === 'recommendations' && (
            <Recommendations
              initialEmployeeId={selectedEmployeeId}
              initialTargetRole={targetRoleForRecommendations}
            />
          )}

        </main>
      </div>

      {/* EMPLOYEE MODAL */}
      {user.role === 'HR' && (
        <EmployeeModal
          isOpen={isEmployeeModalOpen}
          onClose={() => setIsEmployeeModalOpen(false)}
          onSave={handleSaveEmployee}
          employee={editingEmployee}
        />
      )}

      {/* TOAST */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage('')}
      />

    </div>
  );
}
