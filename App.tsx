
import * as React from 'react';

// Component Imports
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
import MasterEmployeeFormModal from './components/MasterEmployeeFormModal';
import Settings from './components/Settings';
import Notification from './components/Notification';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import LandingPage from './components/LandingPage';
import EmployeeDetailModal from './components/EmployeeDetailModal';
import MasterEmployeeDetailModal from './components/MasterEmployeeDetailModal';

// Type Imports
import { Page, Employee, EmployeeData, Profile, MasterEmployee, OvertimeRecord, User } from './types';

// Service Imports
import { calculatePPh21 } from './services/taxCalculator';
import * as authService from './services/authService';
import { getEmployees, saveEmployee as saveEmployeeService, deleteEmployee as deleteEmployeeService, importEmployees as importEmployeesService } from './services/employeeService';
import { getProfile, saveProfile as saveProfileService } from './services/profileService';
import { getMasterEmployees, saveMasterEmployee as saveMasterEmployeeService, deleteMasterEmployee as deleteMasterEmployeeService, importMasterEmployees as importMasterEmployeesService } from './services/masterEmployeeService';
import { getOvertimeRecords, saveOvertimeRecords as saveOvertimeRecordsService } from './services/overtimeService';

const App: React.FC = () => {
    // --- AUTHENTICATION STATE ---
    const [currentUser, setCurrentUser] = React.useState<User | null>(authService.getCurrentUser());
    const [authPage, setAuthPage] = React.useState<Extract<Page, 'login' | 'register' | 'forgotPassword' | 'landing'>>('landing');
    const [isLoading, setIsLoading] = React.useState(true);

    // --- APP STATE (only initialized if logged in) ---
    const [currentPage, setCurrentPage] = React.useState<Page>('dashboard');
    const [employees, setEmployees] = React.useState<Employee[]>([]);
    const [masterEmployees, setMasterEmployees] = React.useState<MasterEmployee[]>([]);
    const [overtimeRecords, setOvertimeRecords] = React.useState<OvertimeRecord[]>([]);
    const [profile, setProfile] = React.useState<Profile | null>(null);
    const [editingEmployee, setEditingEmployee] = React.useState<Employee | null>(null);
    const [isProfileModalOpen, setProfileModalOpen] = React.useState(false);
    const [isSidebarOpen, setSidebarOpen] = React.useState(true);
    const [notification, setNotification] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isMasterEmployeeModalOpen, setMasterEmployeeModalOpen] = React.useState(false);
    const [editingMasterEmployee, setEditingMasterEmployee] = React.useState<MasterEmployee | null>(null);
    const [detailEmployee, setDetailEmployee] = React.useState<Employee | null>(null);
    const [detailMasterEmployee, setDetailMasterEmployee] = React.useState<MasterEmployee | null>(null);


    // Profile Dropdown state
    const [isProfileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
    const profileDropdownRef = React.useRef<HTMLDivElement>(null);


    // --- EFFECTS ---

    // Effect to load user-specific data upon login
    React.useEffect(() => {
        if (currentUser) {
            setProfile(getProfile(currentUser.id));
            setEmployees(getEmployees(currentUser.id));
            setMasterEmployees(getMasterEmployees(currentUser.id));
            setOvertimeRecords(getOvertimeRecords(currentUser.id));
        }
        setIsLoading(false);
    }, [currentUser]);

    // Effect for profile dropdown
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
            setProfileDropdownOpen(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
        setAuthPage('landing'); // Redirect to landing page on logout
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

     const handleImportEmployees = (employeesToImport: Omit<EmployeeData, 'id'>[]) => {
        if (!currentUser) return;
        try {
            importEmployeesService(currentUser.id, employeesToImport);
            setEmployees(getEmployees(currentUser.id)); // Refresh state
            showNotification(`${employeesToImport.length} data PPh 21 berhasil diimpor.`);
        } catch (error) {
            showNotification('Gagal mengimpor data PPh 21.', 'error');
            console.error(error);
        }
    };

    // Master Employee Handlers
    const handleOpenMasterEmployeeModal = (employee: MasterEmployee | null) => {
        setEditingMasterEmployee(employee);
        setMasterEmployeeModalOpen(true);
    };
    
    const handleOpenMasterDetailModal = (employee: MasterEmployee) => {
        setDetailMasterEmployee(employee);
    };

    const handleCloseMasterEmployeeModal = () => {
        setEditingMasterEmployee(null);
        setMasterEmployeeModalOpen(false);
    };
    
    const handleSaveMasterEmployee = (masterEmployee: MasterEmployee) => {
        if (!currentUser) return;
        try {
            saveMasterEmployeeService(currentUser.id, masterEmployee);
            setMasterEmployees(getMasterEmployees(currentUser.id));
            showNotification('Tersimpan');
            handleCloseMasterEmployeeModal();
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

    const handleImportMasterEmployees = (employeesToImport: Omit<MasterEmployee, 'id'>[]) => {
        if (!currentUser) return;
        try {
            importMasterEmployeesService(currentUser.id, employeesToImport);
            setMasterEmployees(getMasterEmployees(currentUser.id)); // Refresh state
            showNotification(`${employeesToImport.length} karyawan berhasil diimpor.`);
        } catch (error) {
            showNotification('Gagal mengimpor data karyawan.', 'error');
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

    // Detail Modal Handler
    const handleOpenDetailModal = (employee: Employee) => {
        setDetailEmployee(employee);
    };

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
                return <Login onLoginSuccess={handleLoginSuccess} onNavigate={setAuthPage} />;
            case 'landing':
            default:
                return <LandingPage onNavigate={setAuthPage} />;
        }
    }

    // Render App if logged in
    const renderContent = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard employees={employees} masterEmployees={masterEmployees} navigateTo={navigateTo} onEditEmployee={handleEditEmployee} />;
            case 'employeeMasterList':
                return <EmployeeMasterList 
                            masterEmployees={masterEmployees} 
                            onEdit={handleOpenMasterEmployeeModal}
                            onAddNew={() => handleOpenMasterEmployeeModal(null)}
                            onDelete={handleDeleteMasterEmployee} 
                            onImport={handleImportMasterEmployees}
                            showNotification={showNotification}
                            onOpenDetailModal={handleOpenMasterDetailModal}
                        />;
            case 'employeeList':
                return <EmployeeList 
                            employees={employees} 
                            masterEmployees={masterEmployees} 
                            overtimeRecords={overtimeRecords}
                            onEdit={handleEditEmployee} 
                            onDelete={handleDeleteEmployee} 
                            navigateTo={navigateTo} 
                            onOpenDetailModal={handleOpenDetailModal}
                            onImport={handleImportEmployees}
                            showNotification={showNotification}
                        />;
            case 'employeeInput':
                return <EmployeeForm 
                            onSave={handleSaveEmployee} 
                            existingEmployee={editingEmployee} 
                            onCancel={() => navigateTo('employeeList')} 
                            profile={profile!} 
                            masterEmployees={masterEmployees} 
                            overtimeRecords={overtimeRecords} 
                            employees={employees}
                            showNotification={showNotification}
                        />;
            case 'taxRules':
                return <TaxRules />;
            case 'reports':
                return <Reports employees={employees} masterEmployees={masterEmployees} profile={profile!} showNotification={showNotification} />;
            case 'overtime':
                return <Overtime masterEmployees={masterEmployees} existingRecords={overtimeRecords} onSave={handleSaveOvertime} />;
            case 'settings':
                return <Settings showNotification={showNotification} currentUser={currentUser} />;
            default:
                return <Dashboard employees={employees} masterEmployees={masterEmployees} navigateTo={navigateTo} onEditEmployee={handleEditEmployee} />;
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
        <div className="flex flex-col h-screen bg-gray-900 font-sans text-gray-200">
            {/* Unified Header */}
            <header className="flex-shrink-0 bg-gray-800 border-b border-gray-700 flex items-center h-16 z-10">
                {/* Logo and App name */}
                <div className={`flex-shrink-0 h-full flex items-center border-r border-gray-700 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 px-6' : 'w-20 px-4 justify-center'}`}>
                    <div className="flex items-center space-x-3">
                        <img src={profile.logoUrl} alt="Logo" className="h-8 w-8 rounded-md object-cover bg-gray-700 flex-shrink-0"/>
                        <span className={`text-xl font-bold text-gray-100 whitespace-nowrap transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>{profile.appName}</span>
                    </div>
                </div>

                {/* Main Header Content */}
                <div className="flex-1 flex justify-between items-center px-4 sm:px-6">
                    {/* Left side: Hamburger */}
                     <div>
                        <button onClick={toggleSidebar} className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                            <span className="sr-only">Toggle sidebar</span>
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    {/* Right side: Notifications and Profile */}
                    <div className="flex items-center space-x-4">
                        <button className="p-2 rounded-full hover:bg-gray-700" title="Notifikasi">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </button>
                        <div className="relative" ref={profileDropdownRef}>
                            <button onClick={() => setProfileDropdownOpen(prev => !prev)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700">
                                <img className="h-9 w-9 rounded-full object-cover bg-gray-700" src={profile.logoUrl} alt="Company Logo" />
                                <div>
                                    <div className="text-sm font-semibold text-gray-200 text-left">{profile.contactName}</div>
                                    <div className="text-xs text-gray-400 text-left">{profile.companyName}</div>
                                </div>
                            </button>
                            {isProfileDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50 border border-gray-600">
                                <button
                                    onClick={() => { setProfileModalOpen(true); setProfileDropdownOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                                >
                                    Profil
                                </button>
                                <button
                                    onClick={() => { handleLogout(); setProfileDropdownOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600"
                                >
                                    Logout
                                </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <Sidebar currentPage={currentPage} navigateTo={navigateTo} isOpen={isSidebarOpen} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {renderContent()}
                    <Footer />
                </main>
            </div>

            {detailEmployee && (
                <EmployeeDetailModal
                    employee={detailEmployee}
                    onClose={() => setDetailEmployee(null)}
                />
            )}
            {detailMasterEmployee && (
                <MasterEmployeeDetailModal
                    employee={detailMasterEmployee}
                    onClose={() => setDetailMasterEmployee(null)}
                />
            )}
            {isProfileModalOpen && (
                <ProfileModal
                    isOpen={isProfileModalOpen}
                    onClose={() => setProfileModalOpen(false)}
                    onSave={handleSaveProfile}
                    profile={profile}
                />
            )}
             {isMasterEmployeeModalOpen && (
                <MasterEmployeeFormModal
                    isOpen={isMasterEmployeeModalOpen}
                    onClose={handleCloseMasterEmployeeModal}
                    onSave={handleSaveMasterEmployee}
                    existingEmployee={editingMasterEmployee}
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
