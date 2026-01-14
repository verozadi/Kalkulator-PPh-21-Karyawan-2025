
import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { auth, db } from './services/firebase';

// Component Imports
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import EmployeeList2 from './components/EmployeeList2';
import EmployeeList3 from './components/EmployeeList3';
import EmployeeForm from './components/EmployeeForm';
import EmployeeForm2 from './components/EmployeeForm2';
import EmployeeForm3 from './components/EmployeeForm3';
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
import LicenseActivation from './components/LicenseActivation';
import Navbar from './components/Navbar'; // Import Navbar directly here to control props

// Type Imports
import { Page, Employee, EmployeeData, Profile, MasterEmployee, OvertimeRecord, User, AppTheme } from './types';

// Service Imports
import { calculatePPh21 } from './services/taxCalculator';
import * as authService from './services/authService';
import { saveEmployee as saveEmployeeService, deleteEmployee as deleteEmployeeService, importEmployees as importEmployeesService } from './services/employeeService';
import { saveProfile as saveProfileService, defaultProfile } from './services/profileService';
import { saveMasterEmployee as saveMasterEmployeeService, deleteMasterEmployee as deleteMasterEmployeeService, importMasterEmployees as importMasterEmployeesService } from './services/masterEmployeeService';
import { saveOvertimeRecords as saveOvertimeRecordsService } from './services/overtimeService';

const LICENSE_API_URL = "https://script.google.com/macros/s/AKfycbwC5xHIrnG39FMYU853IOAwrLGE4U25ZTZc_MbWXkhQHNgY27WIRXy48NmzXTkXhZeStQ/exec";

// --- THEME DEFINITIONS ---
const themes: Record<AppTheme, React.CSSProperties> = {
    default: {
        '--bg-main': '#111827', // gray-900
        '--bg-card': '#1f2937', // gray-800
        '--bg-input': '#374151', // gray-700
        '--border-color': '#4b5563', // gray-600
        '--text-highlight': '#f3f4f6', // gray-100
        '--text-primary': '#e5e7eb', // gray-200
        '--text-secondary': '#d1d5db', // gray-300
        '--text-muted': '#9ca3af', // gray-400
        '--primary-light': '#60a5fa',
        '--primary-main': '#2563eb', // blue-600
        '--primary-hover': '#1d4ed8', // blue-700
        '--primary-dark': '#1e3a8a',
        '--accent-main': '#ea580c', // orange-600
        '--accent-hover': '#c2410c',
    } as React.CSSProperties,
    word: {
        '--bg-main': '#f3f4f6', // Light gray
        '--bg-card': '#ffffff', // White
        '--bg-input': '#e5e7eb', // Slightly darker input
        '--border-color': '#d1d5db',
        '--text-highlight': '#111827', // Black/Dark
        '--text-primary': '#1f2937',
        '--text-secondary': '#374151',
        '--text-muted': '#6b7280',
        '--primary-light': '#3b82f6',
        '--primary-main': '#2b579a', // Word Blue
        '--primary-hover': '#1e3a8a',
        '--primary-dark': '#172554',
        '--accent-main': '#2563eb',
        '--accent-hover': '#1d4ed8',
    } as React.CSSProperties,
    cyberpunk: {
        '--bg-main': '#050505', // Deep Black
        '--bg-card': '#121212', // Dark Gray
        '--bg-input': '#2a2a2a',
        '--border-color': '#fde047', // Yellow border
        '--text-highlight': '#fde047', // Yellow Text
        '--text-primary': '#22d3ee', // Cyan Text
        '--text-secondary': '#ffffff',
        '--text-muted': '#94a3b8',
        '--primary-light': '#fde047',
        '--primary-main': '#facc15', // Yellow
        '--primary-hover': '#eab308',
        '--primary-dark': '#854d0e',
        '--accent-main': '#06b6d4', // Cyan
        '--accent-hover': '#0891b2',
    } as React.CSSProperties,
    anime: {
        '--bg-main': '#fdf2f8', // Pinkish White
        '--bg-card': '#fff1f2', // Soft Rose
        '--bg-input': '#ffe4e6',
        '--border-color': '#fda4af',
        '--text-highlight': '#881337', // Deep Rose
        '--text-primary': '#be185d',
        '--text-secondary': '#9d174d',
        '--text-muted': '#db2777',
        '--primary-light': '#f472b6',
        '--primary-main': '#db2777', // Pink-600
        '--primary-hover': '#be185d',
        '--primary-dark': '#831843',
        '--accent-main': '#c026d3', // Purple
        '--accent-hover': '#a21caf',
    } as React.CSSProperties,
    blackRed: {
        '--bg-main': '#000000',
        '--bg-card': '#18181b', // Zinc 900
        '--bg-input': '#27272a',
        '--border-color': '#7f1d1d', // Red 900
        '--text-highlight': '#ef4444', // Red 500
        '--text-primary': '#f87171', // Red 400
        '--text-secondary': '#d1d5db',
        '--text-muted': '#9ca3af',
        '--primary-light': '#ef4444',
        '--primary-main': '#dc2626', // Red 600
        '--primary-hover': '#b91c1c',
        '--primary-dark': '#7f1d1d',
        '--accent-main': '#991b1b',
        '--accent-hover': '#7f1d1d',
    } as React.CSSProperties,
};

const App: React.FC = () => {
    // --- AUTH & LICENSE STATE ---
    const [currentUser, setCurrentUser] = React.useState<User | null>(null);
    const [authLoading, setAuthLoading] = React.useState(true);
    const [isLicenseActivated, setIsLicenseActivated] = React.useState<boolean>(false);
    const [authPage, setAuthPage] = React.useState<Extract<Page, 'login' | 'register' | 'forgotPassword' | 'landing'>>('landing');
    const [isActivationModalOpen, setActivationModalOpen] = React.useState(false);

    // --- APP DATA STATE (Synced via Firestore) ---
    const [employees, setEmployees] = React.useState<Employee[]>([]);
    const [masterEmployees, setMasterEmployees] = React.useState<MasterEmployee[]>([]);
    const [overtimeRecords, setOvertimeRecords] = React.useState<OvertimeRecord[]>([]);
    const [profile, setProfile] = React.useState<Profile | null>(null);

    // --- UI STATE ---
    const [currentPage, setCurrentPage] = React.useState<Page>('dashboard');
    const [editingEmployee, setEditingEmployee] = React.useState<Employee | null>(null);
    const [isProfileModalOpen, setProfileModalOpen] = React.useState(false);
    const [isSidebarOpen, setSidebarOpen] = React.useState(true);
    const [notification, setNotification] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isMasterEmployeeModalOpen, setMasterEmployeeModalOpen] = React.useState(false);
    const [editingMasterEmployee, setEditingMasterEmployee] = React.useState<MasterEmployee | null>(null);
    const [detailEmployee, setDetailEmployee] = React.useState<Employee | null>(null);
    const [detailMasterEmployee, setDetailMasterEmployee] = React.useState<MasterEmployee | null>(null);
    
    // --- THEME STATE ---
    const [currentTheme, setCurrentTheme] = React.useState<AppTheme>('default');
    
    const mainContentRef = React.useRef<HTMLElement>(null);

    // Load theme from localStorage
    React.useEffect(() => {
        const savedTheme = localStorage.getItem('veroz_theme') as AppTheme;
        if (savedTheme && themes[savedTheme]) {
            setCurrentTheme(savedTheme);
        }
    }, []);

    const handleSetTheme = (theme: AppTheme) => {
        if (!isLicenseActivated) {
            handleOpenActivation();
            return;
        }
        setCurrentTheme(theme);
        localStorage.setItem('veroz_theme', theme);
    };

    // --- AUTH LISTENER (Firebase) ---
    React.useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setCurrentUser(authService.mapFirebaseUser(user));
            } else {
                setCurrentUser(null);
                setEmployees([]);
                setMasterEmployees([]);
                setOvertimeRecords([]);
                setProfile(null);
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- FIRESTORE SYNC LISTENERS ---
    React.useEffect(() => {
        if (!currentUser) return;

        const userId = currentUser.id;

        // 1. Sync User Activation Status from Firestore (Source of Truth)
        const unsubUser = db.collection('users').doc(userId).onSnapshot((doc) => {
            const data = doc.data();
            // Only update if true to prevent overwriting local validation temporarily
            if (data?.isActivated === true) {
                setIsLicenseActivated(true);
                localStorage.setItem('veroz_license_active', 'true');
            }
            // If data is false or missing, we stay in Preview Mode (isLicenseActivated defaults false)
        }, (error) => console.error("Sync Error User Data:", error));

        const unsubEmployees = db.collection('users').doc(userId).collection('employees').onSnapshot((snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as Employee);
            setEmployees(data);
        }, (error) => console.error("Sync Error Employees:", error));

        const unsubMasters = db.collection('users').doc(userId).collection('master_employees').onSnapshot((snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as MasterEmployee);
            setMasterEmployees(data);
        }, (error) => console.error("Sync Error Master:", error));

        const unsubOvertime = db.collection('users').doc(userId).collection('overtime_records').onSnapshot((snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as OvertimeRecord);
            setOvertimeRecords(data);
        }, (error) => console.error("Sync Error Overtime:", error));

        const unsubProfile = db.collection('users').doc(userId).collection('settings').doc('profile').onSnapshot((docSnap) => {
            if (docSnap.exists) {
                setProfile(docSnap.data() as Profile);
            } else {
                setProfile(defaultProfile);
                // Note: We don't auto-save default profile on read failure to avoid write loops or permission issues for non-active users.
                // It will be saved when user saves profile manually.
            }
        }, (error) => console.error("Sync Error Profile:", error));

        return () => {
            unsubUser();
            unsubEmployees();
            unsubMasters();
            unsubOvertime();
            unsubProfile();
        };
    }, [currentUser]);


    // --- LICENSE VALIDATION LOGIC ---
    // Kept as secondary/initial check, but Firestore listener (above) is primary for updates
    const validateLicenseSession = React.useCallback(async (silent: boolean = true) => {
        if (!currentUser) return;

        const storedKey = localStorage.getItem('veroz_license_key');
        let deviceId = localStorage.getItem('veroz_device_id');

        if (!deviceId) {
            deviceId = uuidv4();
            localStorage.setItem('veroz_device_id', deviceId);
        }

        if (!storedKey) {
            // No key found, stay in preview mode (do nothing, default is false)
            return;
        }

        try {
            if (silent && localStorage.getItem('veroz_license_active') === 'true') {
                setIsLicenseActivated(true);
            }

            const params = new URLSearchParams({
                key: storedKey,
                deviceId: deviceId,
                email: currentUser.email
            });

            const response = await fetch(`${LICENSE_API_URL}?${params.toString()}`, {
                method: 'GET',
            });
            const data = await response.json();

            if (data.result === 'success') {
                setIsLicenseActivated(true);
                localStorage.setItem('veroz_license_active', 'true');
            } else {
                console.warn("License Check Failed:", data.message);
                // Don't force false immediately if Firestore says true, but clear local storage
                localStorage.removeItem('veroz_license_active');
            }
        } catch (error) {
            console.error("License Validation Network Error (Offline?):", error);
            if (localStorage.getItem('veroz_license_active') === 'true') {
                setIsLicenseActivated(true);
            }
        }
    }, [currentUser]);

    React.useEffect(() => {
        if (!authLoading && currentUser) {
            validateLicenseSession(false);
        }
    }, [authLoading, currentUser, validateLicenseSession]);

    // Check periodically
    React.useEffect(() => {
        const intervalId = setInterval(() => {
            if(currentUser) validateLicenseSession(true);
        }, 10 * 60 * 1000); 
        return () => clearInterval(intervalId);
    }, [validateLicenseSession, currentUser]);


    // --- HANDLERS ---
    
    React.useEffect(() => {
        if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
    }, [currentPage]);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
    };

    const handleLogout = async () => {
        await authService.logout();
        setAuthPage('landing');
    };

    // Centralized Activation Trigger
    const handleOpenActivation = () => {
        setActivationModalOpen(true);
    };

    const handleSaveProfile = async (updatedProfile: Profile) => {
        if (!currentUser) return;
        if (!isLicenseActivated) { handleOpenActivation(); return; }
        
        try {
            await saveProfileService(currentUser.id, updatedProfile);
            setProfileModalOpen(false);
            showNotification('Profil berhasil disinkronisasi ke cloud');
        } catch(e) {
            showNotification('Gagal menyimpan profil ke cloud', 'error');
        }
    };

    const navigateTo = (page: Page) => {
        setEditingEmployee(null);
        setCurrentPage(page);
    };
    
    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    const handleEditEmployee = (employee: Employee) => {
        setEditingEmployee(employee);
        if (employee.calculationType === 'annual') setCurrentPage('pph21Annual');
        else if (employee.calculationType === 'nonFinal') setCurrentPage('pph21NonFinal');
        else setCurrentPage('pph21Monthly');
    };

    const handleSaveEmployee = async (employeeData: EmployeeData) => {
        if (!currentUser) return;
        if (!isLicenseActivated) { handleOpenActivation(); return; }

        try {
            let employeeToSave: Employee;
            if (employeeData.calculationType === 'annual') {
                employeeToSave = { ...employeeData } as Employee;
            } else {
                const calculationResult = calculatePPh21(employeeData);
                employeeToSave = { ...employeeData, ...calculationResult };
            }

            await saveEmployeeService(currentUser.id, employeeToSave);
            
            if (employeeToSave.calculationType === 'annual') navigateTo('employeeListAnnual');
            else if (employeeToSave.calculationType === 'nonFinal') navigateTo('employeeListNonFinal');
            else navigateTo('employeeListMonthly');
            
            showNotification('Tersimpan di Cloud');
        } catch (error) {
            showNotification('Gagal menyimpan data', 'error');
            console.error(error);
        }
    };
    
    const handleDeleteEmployee = async (employeeId: string) => {
        if (!currentUser) return;
        if (!isLicenseActivated) { handleOpenActivation(); return; }

        try {
            await deleteEmployeeService(currentUser.id, employeeId);
            showNotification('Data dihapus dari Cloud');
        } catch (error) {
            showNotification('Gagal menghapus data', 'error');
        }
    };

    const handleImportEmployees = async (employeesToImport: Omit<EmployeeData, 'id'>[]) => {
        if (!currentUser) return;
        if (!isLicenseActivated) { handleOpenActivation(); return; }

        try {
            await importEmployeesService(currentUser.id, employeesToImport);
            showNotification(`${employeesToImport.length} data berhasil diimpor ke Cloud.`);
        } catch (error) {
            showNotification('Gagal mengimpor data.', 'error');
        }
    };

    const handleOpenMasterEmployeeModal = (employee: MasterEmployee | null) => {
        setEditingMasterEmployee(employee);
        setMasterEmployeeModalOpen(true);
    };
    
    const handleCloseMasterEmployeeModal = () => {
        setEditingMasterEmployee(null);
        setMasterEmployeeModalOpen(false);
    };
    
    const handleSaveMasterEmployee = async (masterEmployee: MasterEmployee) => {
        if (!currentUser) return;
        if (!isLicenseActivated) { handleOpenActivation(); return; }

        try {
            await saveMasterEmployeeService(currentUser.id, masterEmployee);
            showNotification('Karyawan Master Tersimpan');
            handleCloseMasterEmployeeModal();
        } catch (error) {
            showNotification('Gagal menyimpan karyawan', 'error');
        }
    };

    const handleDeleteMasterEmployee = async (id: string) => {
        if (!currentUser) return;
        if (!isLicenseActivated) { handleOpenActivation(); return; }

        try {
            await deleteMasterEmployeeService(currentUser.id, id);
            showNotification('Karyawan dihapus dari Cloud');
        } catch (error) {
            showNotification('Gagal menghapus karyawan', 'error');
        }
    };

    const handleImportMasterEmployees = async (employeesToImport: Omit<MasterEmployee, 'id'>[]) => {
        if (!currentUser) return;
        if (!isLicenseActivated) { handleOpenActivation(); return; }

        try {
            await importMasterEmployeesService(currentUser.id, employeesToImport);
            showNotification(`${employeesToImport.length} karyawan master berhasil diimpor.`);
        } catch (error) {
            showNotification('Gagal mengimpor data.', 'error');
        }
    };

    const handleSaveOvertime = async (records: OvertimeRecord[], deletedIds?: string[]) => {
        if (!currentUser) return;
        if (!isLicenseActivated) { handleOpenActivation(); return; }

        try {
            await saveOvertimeRecordsService(currentUser.id, records, deletedIds);
            showNotification('Data lembur tersimpan di Cloud');
        } catch (error) {
            showNotification('Gagal menyimpan lembur', 'error');
        }
    };

    const handleOpenDetailModal = (employee: Employee) => setDetailEmployee(employee);
    const handleOpenMasterDetailModal = (employee: MasterEmployee) => setDetailMasterEmployee(employee);


    // --- RENDER ---
    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
                <div className="flex flex-col items-center">
                    <svg className="animate-spin h-8 w-8 text-primary-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p>Menghubungkan ke Cloud...</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <>
                {authPage === 'landing' && <LandingPage onNavigate={setAuthPage} />}
                {authPage === 'login' && <Login onLoginSuccess={() => {}} onNavigate={setAuthPage} />}
                {authPage === 'register' && <Register onRegisterSuccess={() => {}} onNavigate={setAuthPage} />}
                {authPage === 'forgotPassword' && <ForgotPassword onNavigate={setAuthPage} />}
            </>
        );
    }

    const renderContent = () => {
        const activeProfile = profile || defaultProfile;

        // Shared props for forms
        const employeeFormProps = {
            onSave: handleSaveEmployee,
            existingEmployee: editingEmployee,
            onCancel: () => {
                if (editingEmployee) {
                    if (editingEmployee.calculationType === 'annual') navigateTo('employeeListAnnual');
                    else if (editingEmployee.calculationType === 'nonFinal') navigateTo('employeeListNonFinal');
                    else navigateTo('employeeListMonthly');
                } else {
                    navigateTo('dashboard');
                }
            },
            profile: activeProfile,
            masterEmployees: masterEmployees,
            overtimeRecords: overtimeRecords,
            employees: employees,
            showNotification: showNotification,
        };

        const listProps = {
            masterEmployees: masterEmployees,
            overtimeRecords: overtimeRecords,
            onEdit: handleEditEmployee,
            onDelete: handleDeleteEmployee,
            navigateTo: navigateTo,
            onOpenDetailModal: handleOpenDetailModal,
            onImport: handleImportEmployees,
            showNotification: showNotification,
            profile: activeProfile,
        };

        switch (currentPage) {
            case 'dashboard':
                return <Dashboard employees={employees} masterEmployees={masterEmployees} navigateTo={navigateTo} onEditEmployee={handleEditEmployee} />;
            case 'employeeMasterList':
                return <EmployeeMasterList 
                            masterEmployees={masterEmployees} 
                            onEdit={handleOpenMasterEmployeeModal}
                            onAddNew={() => {
                                if(!isLicenseActivated) handleOpenActivation();
                                else handleOpenMasterEmployeeModal(null);
                            }}
                            onDelete={handleDeleteMasterEmployee} 
                            onImport={handleImportMasterEmployees}
                            showNotification={showNotification}
                            onOpenDetailModal={handleOpenMasterDetailModal}
                        />;
            case 'employeeListMonthly':
                return <EmployeeList 
                            employees={employees.filter(e => e.calculationType === 'monthly')} 
                            title="Daftar PPh 21 Bulanan"
                            addNewPage="pph21Monthly"
                            {...listProps} 
                        />;
            case 'employeeListNonFinal':
                return <EmployeeList2 
                            employees={employees.filter(e => e.calculationType === 'nonFinal')} 
                            title="Daftar PPh 21 Final/Tidak Final"
                            addNewPage="pph21NonFinal"
                            {...listProps} 
                        />;
            case 'employeeListAnnual':
                return <EmployeeList3 
                            employees={employees.filter(e => e.calculationType === 'annual')} 
                            title="Daftar PPh 21 Tahunan A1"
                            addNewPage="pph21Annual"
                            {...listProps} 
                        />;
            case 'pph21Monthly':
                return <EmployeeForm {...employeeFormProps} fixedType="monthly" />;
            case 'pph21NonFinal':
                return <EmployeeForm2 {...employeeFormProps} fixedType="nonFinal" />;
            case 'pph21Annual':
                return <EmployeeForm3 {...employeeFormProps} fixedType="annual" />;
            case 'employeeInput': 
                 return <EmployeeForm {...employeeFormProps} fixedType="monthly" />;
            case 'taxRules':
                return <TaxRules />;
            case 'reports':
                return <Reports 
                    employees={employees} 
                    masterEmployees={masterEmployees} 
                    profile={activeProfile} 
                    showNotification={showNotification} 
                    isLicenseActivated={isLicenseActivated}
                    onOpenActivation={handleOpenActivation}
                />;
            case 'overtime':
                return <Overtime 
                    masterEmployees={masterEmployees} 
                    existingRecords={overtimeRecords} 
                    onSave={handleSaveOvertime} 
                    isLicenseActivated={isLicenseActivated}
                    onOpenActivation={handleOpenActivation}
                />;
            case 'settings':
                return <Settings 
                    showNotification={showNotification} 
                    currentUser={currentUser} 
                    currentTheme={currentTheme} 
                    onSetTheme={handleSetTheme} 
                    isLicenseActivated={isLicenseActivated}
                    onOpenActivation={handleOpenActivation}
                />;
            default:
                return <Dashboard employees={employees} masterEmployees={masterEmployees} navigateTo={navigateTo} onEditEmployee={handleEditEmployee} />;
        }
    };

    const activeProfile = profile || defaultProfile;

    return (
        <div 
            className="flex flex-col h-screen bg-gray-900 font-sans text-gray-200 transition-colors duration-300"
            style={themes[currentTheme]}
        >
            <Navbar 
                profile={activeProfile}
                user={currentUser}
                onOpenProfileModal={() => {
                    if(!isLicenseActivated) handleOpenActivation();
                    else setProfileModalOpen(true);
                }}
                onToggleSidebar={toggleSidebar}
                onLogout={handleLogout}
                isLicenseActivated={isLicenseActivated}
                onOpenActivation={handleOpenActivation}
            />
            
            <div className="flex flex-1 overflow-hidden">
                <Sidebar currentPage={currentPage} navigateTo={navigateTo} isOpen={isSidebarOpen} />
                <main ref={mainContentRef} className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
                    {renderContent()}
                    <Footer />
                </main>
            </div>

            {/* Modals */}
            {detailEmployee && <EmployeeDetailModal 
                employee={detailEmployee} 
                onClose={() => setDetailEmployee(null)} 
                profile={activeProfile} 
                masterEmployees={masterEmployees} 
            />}
            {detailMasterEmployee && <MasterEmployeeDetailModal employee={detailMasterEmployee} onClose={() => setDetailMasterEmployee(null)} />}
            {isProfileModalOpen && <ProfileModal isOpen={isProfileModalOpen} onClose={() => setProfileModalOpen(false)} onSave={handleSaveProfile} profile={activeProfile} />}
            {isMasterEmployeeModalOpen && <MasterEmployeeFormModal isOpen={isMasterEmployeeModalOpen} onClose={handleCloseMasterEmployeeModal} onSave={handleSaveMasterEmployee} existingEmployee={editingMasterEmployee} />}
            {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
            
            {/* Activation Modal */}
            <LicenseActivation 
                isOpen={isActivationModalOpen}
                onClose={() => setActivationModalOpen(false)}
                user={currentUser}
                onActivationSuccess={() => {
                    setIsLicenseActivated(true);
                    setActivationModalOpen(false);
                }} 
            />
        </div>
    );
};

export default App;
