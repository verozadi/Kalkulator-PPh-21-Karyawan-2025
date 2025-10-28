import React, { useState, useMemo, useEffect } from 'react';

// Component Imports
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
import Settings from './components/Settings';
import Notification from './components/Notification';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';

// Type Imports
import { Page, Employee, EmployeeData, Profile, MasterEmployee, OvertimeRecord, User } from './types';

// Service Imports
import { calculatePPh21 } from './services/taxCalculator';
import * as authService from './services/authService';
import { getEmployees, saveEmployee as saveEmployeeService, deleteEmployee as deleteEmployeeService } from './services/employeeService';
import { getProfile, saveProfile as saveProfileService } from './services/profileService';
import { getMasterEmployees, saveMasterEmployee as saveMasterEmployeeService, deleteMasterEmployee as deleteMasterEmployeeService } from './services/masterEmployeeService';
import { getOvertimeRecords, saveOvertimeRecords as saveOvertimeRecordsService } from './services/overtimeService';

const App: React.FC = () => {
    // --- AUTHENTICATION STATE ---
    const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
    const [authPage, setAuthPage] = useState<Extract<Page, 'login' | 'register' | 'forgotPassword'>>('login');
    const [isLoading, setIsLoading] = useState(true);

    // --- APP STATE (only initialized if logged in) ---
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [masterEmployees, setMasterEmployees] = useState<MasterEmployee[]>([]);
    const [overtimeRecords, setOvertimeRecords] = useState<OvertimeRecord[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // --- EFFECTS ---

    // Effect to load user-specific data upon login
    useEffect(() => {
        if (currentUser) {
            setProfile(getProfile(currentUser.id));
            setEmployees(getEmployees(currentUser.id));
            setMasterEmployees(getMasterEmployees(currentUser.id));
            setOvertimeRecords(getOvertimeRecords(currentUser.id));
        }
        setIsLoading(false);
    }, [currentUser]);

    // --- HANDLERS ---
    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
    };

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
    };

    const handleLogout = () => {
        authService.logout();
        setCurrentUser(null);
    };

    const handleSaveProfile = (updatedProfile: Profile) => {
        if (!currentUser) return;
        try {
            saveProfileService(currentUser.id, updatedProfile);
            setProfile(updatedProfile);
            setProfileModalOpen(false);
            showNotification('Profil berhasil disimpan');
        } catch(e) {
            showNotification('Gagal menyimpan profil', 'error');
        }
    };

    const navigateTo = (page: Page) => {
        setEditingEmployee(null);
        setCurrentPage(page);
    };
    
    const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    };

    // PPh 21 Calculation Handlers
    const handleEditEmployee = (employee: Employee) => {
        setEditingEmployee(employee);
        setCurrentPage('employeeInput');
    };

    const handleSaveEmployee = (employeeData: EmployeeData) => {
        if (!currentUser) return;
        try {
            const calculationResult = calculatePPh21(employeeData);
            const employeeToSave: Employee = { ...employeeData, ...calculationResult };
            saveEmployeeService(currentUser.id, employeeToSave);
            setEmployees(getEmployees(currentUser.id));
            navigateTo('employeeList');
            showNotification('Tersimpan');
        } catch (error) {
            showNotification('Gagal menyimpan data PPh 21', 'error');
            console.error(error);
        }
    };
    
    const handleDeleteEmployee = (employeeId: string) => {
        if (!currentUser) return;
        try {
            deleteEmployeeService(currentUser.id, employeeId);
            setEmployees(getEmployees(currentUser.id));
            showNotification('Data PPh 21 berhasil dihapus');
        } catch (error) {
            showNotification('Gagal menghapus data PPh 21', 'error');
            console.error(error);
        }
    };

    // Master Employee Handlers
    const handleSaveMasterEmployee = (masterEmployee: MasterEmployee) => {
        if (!currentUser) return;
        try {
            saveMasterEmployeeService(currentUser.id, masterEmployee);
            setMasterEmployees(getMasterEmployees(currentUser.id));
            showNotification('Tersimpan');
        } catch (error) {
            showNotification('Gagal menyimpan karyawan', 'error');
            console.error(error);
        }
    };

    const handleDeleteMasterEmployee = (id: string) => {
        if (!currentUser) return;
        try {
            deleteMasterEmployeeService(currentUser.id, id);
            setMasterEmployees(getMasterEmployees(currentUser.id));
            showNotification('Karyawan berhasil dihapus');
        } catch (error) {
            showNotification('Gagal menghapus karyawan', 'error');
            console.error(error);
        }
    };

    // Overtime Handlers
    const handleSaveOvertime = (records: OvertimeRecord[]) => {
        if (!currentUser) return;
        try {
            saveOvertimeRecordsService(currentUser.id, records);
            setOvertimeRecords(getOvertimeRecords(currentUser.id));
            showNotification('Tersimpan');
        } catch (error) {
            showNotification('Gagal', 'error');
            console.error(error);
        }
    };

    // --- MEMOIZED DATA ---
    const summaryData = useMemo(() => {
        const totalEmployees = masterEmployees.length;
        const totalGrossSalary = employees.reduce((sum, e) => sum + e.grossIncome, 0);
        const totalPPh21 = employees.reduce((sum, e) => sum + e.pph21Monthly, 0);
        return { totalEmployees, totalGrossSalary, totalPPh21 };
    }, [employees, masterEmployees]);

    const recentEmployees = useMemo(() => employees.slice(-5).reverse(), [employees]);

    // --- RENDER LOGIC ---

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
                <p>Loading application...</p>
            </div>
        );
    }

    // Render Auth pages if not logged in
    if (!currentUser) {
        switch (authPage) {
            case 'register':
                return <Register onRegisterSuccess={handleLoginSuccess} onNavigate={setAuthPage} />;
            case 'forgotPassword':
                return <ForgotPassword onNavigate={setAuthPage} />;
            case 'login':
            default:
                return <Login onLoginSuccess={handleLoginSuccess} onNavigate={setAuthPage} />;
        }
    }

    // Render App if logged in
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
                return <Reports employees={employees} masterEmployees={masterEmployees} profile={profile!} showNotification={showNotification} />;
            case 'overtime':
                return <Overtime masterEmployees={masterEmployees} existingRecords={overtimeRecords} onSave={handleSaveOvertime} />;
            case 'settings':
                return <Settings showNotification={showNotification} currentUser={currentUser} />;
            default:
                return <Dashboard summaryData={summaryData} recentEmployees={recentEmployees} navigateTo={navigateTo} onEditEmployee={handleEditEmployee} />;
        }
    };

    if (!profile) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
                <p>Loading user data...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-900 font-sans text-gray-200">
            <Sidebar currentPage={currentPage} navigateTo={navigateTo} profile={profile} isOpen={isSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar profile={profile} onOpenProfileModal={() => setProfileModalOpen(true)} onToggleSidebar={toggleSidebar} onLogout={handleLogout} />
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
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
};

export default App;