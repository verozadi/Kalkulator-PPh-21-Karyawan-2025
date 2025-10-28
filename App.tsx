
import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import TaxRules from './components/TaxRules';
import Reports from './components/Reports';
import Sidebar from './components/Sidebar';
import ProfileModal from './components/ProfileModal';
import Overtime from './components/Overtime';
import EmployeeMasterList from './components/EmployeeMasterList';
import Settings from './components/Settings'; // Import Settings component

import { Page, Employee, EmployeeData, Profile, MasterEmployee, OvertimeRecord } from './types';
import { calculatePPh21 } from './services/taxCalculator';

// Service Imports
import { getEmployees, saveEmployee as saveEmployeeService, deleteEmployee as deleteEmployeeService } from './services/employeeService';
import { getProfile, saveProfile } from './services/profileService';
import { getMasterEmployees, saveMasterEmployee, deleteMasterEmployee } from './services/masterEmployeeService';
import { getOvertimeRecords, saveOvertimeRecords } from './services/overtimeService';


const App: React.FC = () => {
  // Page Navigation State
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  
  // Data State
  const [employees, setEmployees] = useState<Employee[]>(getEmployees());
  const [masterEmployees, setMasterEmployees] = useState<MasterEmployee[]>(getMasterEmployees());
  const [overtimeRecords, setOvertimeRecords] = useState<OvertimeRecord[]>(getOvertimeRecords());
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // Modal & Editing State
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  // --- Handlers ---
  const handleSaveProfile = (updatedProfile: Profile) => {
    saveProfile(updatedProfile);
    setProfile(updatedProfile);
    setProfileModalOpen(false);
  };

  const navigateTo = (page: Page) => {
    setEditingEmployee(null);
    setCurrentPage(page);
  };
  
  // PPh 21 Calculation Record Handlers
  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setCurrentPage('employeeInput');
  };

  const handleSaveEmployee = (employeeData: EmployeeData) => {
    const calculationResult = calculatePPh21(employeeData);
    const employeeToSave: Employee = {
        ...employeeData,
        ...calculationResult
    };
    saveEmployeeService(employeeToSave);
    setEmployees(getEmployees());
    navigateTo('employeeList');
  };
  
  const handleDeleteEmployee = (employeeId: string) => {
    deleteEmployeeService(employeeId);
    setEmployees(getEmployees());
  };

  // Master Employee Handlers
  const handleSaveMasterEmployee = (masterEmployee: MasterEmployee) => {
      saveMasterEmployee(masterEmployee);
      setMasterEmployees(getMasterEmployees());
  };

  const handleDeleteMasterEmployee = (id: string) => {
      deleteMasterEmployee(id);
      setMasterEmployees(getMasterEmployees());
  };

  // Overtime Handlers
  const handleSaveOvertime = (records: OvertimeRecord[]) => {
      saveOvertimeRecords(records);
      setOvertimeRecords(getOvertimeRecords());
      alert('Data lembur berhasil disimpan!');
  };

  // --- Memoized Data ---
  const summaryData = useMemo(() => {
    const totalEmployees = masterEmployees.length;
    const totalGrossSalary = employees.reduce((sum, e) => sum + e.grossIncome, 0);
    const totalPPh21 = employees.reduce((sum, e) => sum + e.pph21Monthly, 0);
    return { totalEmployees, totalGrossSalary, totalPPh21 };
  }, [employees, masterEmployees]);

  const recentEmployees = useMemo(() => employees.slice(-5).reverse(), [employees]);

  // --- Render Logic ---
  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard summaryData={summaryData} recentEmployees={recentEmployees} navigateTo={navigateTo} onEditEmployee={handleEditEmployee} />;
      case 'employeeMasterList':
        return <EmployeeMasterList masterEmployees={masterEmployees} onSave={handleSaveMasterEmployee} onDelete={handleDeleteMasterEmployee} />;
      case 'employeeList':
        return <EmployeeList employees={employees} onEdit={handleEditEmployee} onDelete={handleDeleteEmployee} navigateTo={navigateTo} />;
      case 'employeeInput':
        return <EmployeeForm onSave={handleSaveEmployee} existingEmployee={editingEmployee} onCancel={() => navigateTo('employeeList')} profile={profile!} masterEmployees={masterEmployees} overtimeRecords={overtimeRecords} />;
      case 'taxRules':
        return <TaxRules />;
      case 'reports':
        return <Reports employees={employees} masterEmployees={masterEmployees} profile={profile!} />;
      case 'overtime':
        return <Overtime masterEmployees={masterEmployees} existingRecords={overtimeRecords} onSave={handleSaveOvertime} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard summaryData={summaryData} recentEmployees={recentEmployees} navigateTo={navigateTo} onEditEmployee={handleEditEmployee}/>;
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 font-sans text-gray-200">
      <Sidebar currentPage={currentPage} navigateTo={navigateTo} profile={profile} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar profile={profile} onOpenProfileModal={() => setProfileModalOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderContent()}
          <Footer />
        </main>
      </div>
       {isProfileModalOpen && (
            <ProfileModal
              isOpen={isProfileModalOpen}
              onClose={() => setProfileModalOpen(false)}
              onSave={handleSaveProfile}
              profile={profile}
            />
        )}
    </div>
  );
};

export default App;