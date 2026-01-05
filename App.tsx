
import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { auth, db } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc } from 'firebase/firestore';

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

// Type Imports
import { Page, Employee, EmployeeData, Profile, MasterEmployee, OvertimeRecord, User } from './types';

// Service Imports (Note: save functions now use Firestore)
import { calculatePPh21 } from './services/taxCalculator';
import * as authService from './services/authService';
import { saveEmployee as saveEmployeeService, deleteEmployee as deleteEmployeeService, importEmployees as importEmployeesService } from './services/employeeService';
import { saveProfile as saveProfileService, defaultProfile } from './services/profileService';
import { saveMasterEmployee as saveMasterEmployeeService, deleteMasterEmployee as deleteMasterEmployeeService, importMasterEmployees as importMasterEmployeesService } from './services/masterEmployeeService';
import { saveOvertimeRecords as saveOvertimeRecordsService } from './services/overtimeService';

const LICENSE_API_URL = "https://script.google.com/macros/s/AKfycbwC5xHIrnG39FMYU853IOAwrLGE4U25ZTZc_MbWXkhQHNgY27WIRXy48NmzXTkXhZeStQ/exec";

const App: React.FC = () => {
    // --- AUTH & LICENSE STATE ---
    const [currentUser, setCurrentUser] = React.useState<User | null>(null);
    const [authLoading, setAuthLoading] = React.useState(true);
    const [isLicenseActivated, setIsLicenseActivated] = React.useState<boolean>(false);
    const [authPage, setAuthPage] = React.useState<Extract<Page, 'login' | 'register' | 'forgotPassword' | 'landing'>>('landing');

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
    const [isProfileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
    
    const profileDropdownRef = React.useRef<HTMLDivElement>(null);
    const mainContentRef = React.useRef<HTMLElement>(null);

    // --- AUTH LISTENER (Firebase) ---
    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
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
        if (!currentUser || !isLicenseActivated) return;

        const userId = currentUser.id;

        // 1. Employees Listener
        const unsubEmployees = onSnapshot(collection(db, 'users', userId, 'employees'), (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as Employee);
            setEmployees(data);
        }, (error) => console.error("Sync Error Employees:", error));

        // 2. Master Employees Listener
        const unsubMasters = onSnapshot(collection(db, 'users', userId, 'master_employees'), (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as MasterEmployee);
            setMasterEmployees(data);
        }, (error) => console.error("Sync Error Master:", error));

        // 3. Overtime Listener
        const unsubOvertime = onSnapshot(collection(db, 'users', userId, 'overtime_records'), (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as OvertimeRecord);
            setOvertimeRecords(data);
        }, (error) => console.error("Sync Error Overtime:", error));

        // 4. Profile Listener
        const unsubProfile = onSnapshot(doc(db, 'users', userId, 'settings', 'profile'), (docSnap) => {
            if (docSnap.exists()) {
                setProfile(docSnap.data() as Profile);
            } else {
                setProfile(defaultProfile); // Use default if fresh account
                saveProfileService(userId, defaultProfile); // Initialize in cloud
            }
        }, (error) => console.error("Sync Error Profile:", error));

        return () => {
            unsubEmployees();
            unsubMasters();
            unsubOvertime();
            unsubProfile();
        };
    }, [currentUser, isLicenseActivated]);


    // --- LICENSE VALIDATION LOGIC ---
    const validateLicenseSession = React.useCallback(async (silent: boolean = true) => {
        // If not logged in, we don't check license yet
        if (!currentUser) return;

        const storedKey = localStorage.getItem('veroz_license_key');
        let deviceId = localStorage.getItem('veroz_device_id');

        if (!deviceId) {
            deviceId = uuidv4();
            localStorage.setItem('veroz_device_id', deviceId);
        }

        if (!storedKey) {
            setIsLicenseActivated(false);
            return;
        }

        try {
            // Optimistic Check
            if (silent && localStorage.getItem('veroz_license_active') === 'true') {
                setIsLicenseActivated(true);
            }

            // Server Check
            const params = new URLSearchParams({
                key: storedKey,
                deviceId: deviceId,
                email: currentUser.email // Validate against email too
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
                setIsLicenseActivated(false);
                localStorage.removeItem('veroz_license_active');
                if (!silent) {
                    alert(`Sesi Lisensi Berakhir: ${data.message}`);
                }
            }
        } catch (error) {
            console.error("License Validation Network Error (Offline?):", error);
            // Allow offline access if previously valid
            if (localStorage.getItem('veroz_license_active') === 'true') {
                setIsLicenseActivated(true);
            }
        }
    }, [currentUser]);

    // Trigger license check when user logs in
    React.useEffect(() => {
        if (!authLoading && currentUser) {
            validateLicenseSession(false);
        }
    }, [authLoading, currentUser, validateLicenseSession]);

    // Interval license re-check
    React.useEffect(() => {
        const intervalId = setInterval(() => {
            if(currentUser) validateLicenseSession(true);
        }, 10 * 60 * 1000); 
        return () => clearInterval(intervalId);
    }, [validateLicenseSession, currentUser]);


    // --- HANDLERS (UPDATED TO ASYNC/FIRESTORE) ---
    
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
            setProfileDropdownOpen(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    React.useEffect(() => {
        if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
    }, [currentPage]);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
    };

    // Note: Login is handled by Firebase Listener now
    const handleLogout = async () => {
        await authService.logout();
        setAuthPage('landing');
    };

    const handleSaveProfile = async (updatedProfile: Profile) => {
        if (!currentUser) return;
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
        try {
            let employeeToSave: Employee;
            if (employeeData.calculationType === 'annual') {
                employeeToSave = { ...employeeData } as Employee;
            } else {
                const calculationResult = calculatePPh21(employeeData);
                employeeToSave = { ...employeeData, ...calculationResult };
            }

            await saveEmployeeService(currentUser.id, employeeToSave);
            // State updates automatically via listener
            
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
        try {
            await deleteEmployeeService(currentUser.id, employeeId);
            showNotification('Data dihapus dari Cloud');
        } catch (error) {
            showNotification('Gagal menghapus data', 'error');
        }
    };

    const handleImportEmployees = async (employeesToImport: Omit<EmployeeData, 'id'>[]) => {
        if (!currentUser) return;
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
        try {
            await deleteMasterEmployeeService(currentUser.id, id);
            showNotification('Karyawan dihapus dari Cloud');
        } catch (error) {
            showNotification('Gagal menghapus karyawan', 'error');
        }
    };

    const handleImportMasterEmployees = async (employeesToImport: Omit<MasterEmployee, 'id'>[]) => {
        if (!currentUser) return;
        try {
            await importMasterEmployeesService(currentUser.id, employeesToImport);
            showNotification(`${employeesToImport.length} karyawan master berhasil diimpor.`);
        } catch (error) {
            showNotification('Gagal mengimpor data.', 'error');
        }
    };

    const handleSaveOvertime = async (records: OvertimeRecord[]) => {
        if (!currentUser) return;
        try {
            await saveOvertimeRecordsService(currentUser.id, records);
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

    // 1. Authentication Barrier
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

    // 2. License Check Barrier (Post-Auth)
    if (!isLicenseActivated) {
        return <LicenseActivation 
            user={currentUser}
            onActivationSuccess={() => {
                setIsLicenseActivated(true);
            }} 
        />;
    }

    const renderContent = () => {
        // Fallback profile if loading or error
        const activeProfile = profile || defaultProfile;

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
        };

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
                return <Reports employees={employees} masterEmployees={masterEmployees} profile={activeProfile} showNotification={showNotification} />;
            case 'overtime':
                return <Overtime masterEmployees={masterEmployees} existingRecords={overtimeRecords} onSave={handleSaveOvertime} />;
            case 'settings':
                return <Settings showNotification={showNotification} currentUser={currentUser} />;
            default:
                return <Dashboard employees={employees} masterEmployees={masterEmployees} navigateTo={navigateTo} onEditEmployee={handleEditEmployee} />;
        }
    };

    // Ensure profile is loaded (or default) before rendering main app to prevent flickers
    const activeProfile = profile || defaultProfile;

    return (
        <div className="flex flex-col h-screen bg-gray-900 font-sans text-gray-200">
            <header className="flex-shrink-0 bg-gray-800 border-b border-gray-700 flex items-center h-16 z-10">
                <div className={`flex-shrink-0 h-full flex items-center border-r border-gray-700 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 px-6' : 'w-20 px-4 justify-center'}`}>
                    <div className="flex items-center space-x-3">
                        <img src={activeProfile.logoUrl} alt="Logo" className="h-8 w-8 rounded-md object-cover bg-gray-700 flex-shrink-0"/>
                        <span className={`text-xl font-bold text-gray-100 whitespace-nowrap transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>{activeProfile.appName}</span>
                    </div>
                </div>
                <div className="flex-1 flex justify-between items-center px-4 sm:px-6">
                     <div>
                        <button onClick={toggleSidebar} className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                            <span className="sr-only">Toggle sidebar</span>
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="p-2 rounded-full hover:bg-gray-700" title="Notifikasi">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </button>
                        <div className="relative" ref={profileDropdownRef}>
                            <button onClick={() => setProfileDropdownOpen(prev => !prev)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700">
                                <img className="h-9 w-9 rounded-full object-cover bg-gray-700" src={activeProfile.logoUrl} alt="Company Logo" />
                                <div>
                                    <div className="text-sm font-semibold text-gray-200 text-left">{currentUser.name}</div>
                                    <div className="text-xs text-gray-400 text-left truncate max-w-[150px]">{currentUser.email}</div>
                                </div>
                            </button>
                            {isProfileDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50 border border-gray-600">
                                <button
                                    onClick={() => { setProfileModalOpen(true); setProfileDropdownOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                                >
                                    Profil Perusahaan
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
                <main ref={mainContentRef} className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {renderContent()}
                    <Footer />
                </main>
            </div>
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
        </div>
    );
};

export default App;
