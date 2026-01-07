
import * as React from 'react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  navigateTo: (page: Page) => void;
  isOpen: boolean;
}

const NavLink: React.FC<{
    page: Page;
    label: string;
    icon: React.ReactNode;
    navigateTo: (page: Page) => void;
    isActive: boolean;
    isOpen: boolean;
}> = ({ page, label, icon, navigateTo, isActive, isOpen }) => {
    const activeClasses = 'bg-primary-900 text-primary-300';
    const inactiveClasses = 'text-gray-300 hover:bg-gray-700 hover:text-gray-100';
    return (
        <div className="relative group">
            <button
                onClick={() => navigateTo(page)}
                className={`w-full flex items-center py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses} ${isOpen ? 'px-3 space-x-3' : 'justify-center'}`}
            >
                {icon}
                <span className={`${isOpen ? 'inline-block' : 'hidden'}`}>{label}</span>
            </button>
            {!isOpen && (
                 <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 border border-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                    {label}
                </span>
            )}
        </div>
    );
};

const NavDropdown: React.FC<{
    label: string;
    icon: React.ReactNode;
    isOpen: boolean;
    children: React.ReactNode;
    isActiveParent: boolean;
}> = ({ label, icon, isOpen, children, isActiveParent }) => {
    const [isExpanded, setIsExpanded] = React.useState(isActiveParent);

    React.useEffect(() => {
        if (isActiveParent) setIsExpanded(true);
    }, [isActiveParent]);

    // Updated Logic: Parent gets active style if any child is active (isActiveParent is true)
    const baseClasses = 'text-gray-300 hover:bg-gray-700 hover:text-gray-100';
    // Gunakan style yang sama dengan NavLink aktif (bg-primary-900 text-primary-300) jika parent aktif
    const activeClasses = 'bg-primary-900 text-primary-300'; 

    return (
        <div className="relative">
            <button
                onClick={() => isOpen && setIsExpanded(!isExpanded)}
                className={`w-full flex items-center py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${isActiveParent ? activeClasses : baseClasses} ${isOpen ? 'px-3 space-x-3 justify-between' : 'justify-center'}`}
            >
                <div className="flex items-center space-x-3">
                    {icon}
                    <span className={`${isOpen ? 'inline-block' : 'hidden'}`}>{label}</span>
                </div>
                {isOpen && (
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                )}
            </button>
            
            {!isOpen && (
                 <div className="absolute left-full top-0 ml-3 bg-gray-900 border border-gray-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity z-50 w-48 p-2 hidden group-hover:block">
                    <p className="text-xs text-gray-400 font-bold mb-2 px-2 border-b border-gray-700 pb-1">{label}</p>
                    {children}
                </div>
            )}

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded && isOpen ? 'max-h-60 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                <div className="pl-4 space-y-1">
                    {children}
                </div>
            </div>
        </div>
    );
};

const SubNavLink: React.FC<{
    page: Page;
    label: string;
    navigateTo: (page: Page) => void;
    isActive: boolean;
}> = ({ page, label, navigateTo, isActive }) => (
    <button
        onClick={() => navigateTo(page)}
        className={`w-full flex items-center py-2 px-3 rounded-md text-sm transition-colors duration-200 ${isActive ? 'text-primary-300 font-bold bg-primary-900/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'}`}
    >
        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isActive ? 'bg-primary-400' : 'bg-gray-500'}`}></span>
        {label}
    </button>
);


const Sidebar: React.FC<SidebarProps> = ({ currentPage, navigateTo, isOpen }) => {
  const isCalcActive = ['pph21Monthly', 'pph21NonFinal', 'pph21Annual', 'employeeInput'].includes(currentPage);
  const isListActive = ['employeeList', 'employeeListMonthly', 'employeeListNonFinal', 'employeeListAnnual'].includes(currentPage);

  return (
    <aside className={`flex-shrink-0 bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex-1 flex flex-col p-2 space-y-6 overflow-y-auto pt-4">
        <nav className="space-y-1">
          <NavLink page="dashboard" label="Dashboard" navigateTo={navigateTo} isActive={currentPage === 'dashboard'} icon={<ChartPieIcon />} isOpen={isOpen} />
          <NavLink page="employeeMasterList" label="Daftar Nama Karyawan" navigateTo={navigateTo} isActive={currentPage === 'employeeMasterList'} icon={<IdentificationIcon />} isOpen={isOpen} />
          
          <div className="relative group">
            <NavDropdown label="Perhitungan PPh 21" icon={<CalculatorIcon />} isOpen={isOpen} isActiveParent={isCalcActive}>
                <SubNavLink page="pph21Monthly" label="PPh 21 Bulanan" navigateTo={navigateTo} isActive={currentPage === 'pph21Monthly'} />
                <SubNavLink page="pph21NonFinal" label="PPh 21 Final/Tidak Final" navigateTo={navigateTo} isActive={currentPage === 'pph21NonFinal'} />
                <SubNavLink page="pph21Annual" label="PPh 21 Tahunan A1" navigateTo={navigateTo} isActive={currentPage === 'pph21Annual'} />
            </NavDropdown>
          </div>

          <div className="relative group">
            <NavDropdown label="Daftar PPh 21 Karyawan" icon={<ClipboardListIcon />} isOpen={isOpen} isActiveParent={isListActive}>
                <SubNavLink page="employeeListMonthly" label="Daftar PPh 21 Bulanan" navigateTo={navigateTo} isActive={currentPage === 'employeeListMonthly'} />
                <SubNavLink page="employeeListNonFinal" label="Daftar PPh 21 Final/TF" navigateTo={navigateTo} isActive={currentPage === 'employeeListNonFinal'} />
                <SubNavLink page="employeeListAnnual" label="Daftar PPh 21 Tahunan A1" navigateTo={navigateTo} isActive={currentPage === 'employeeListAnnual'} />
            </NavDropdown>
          </div>

          <NavLink page="overtime" label="Lembur" navigateTo={navigateTo} isActive={currentPage === 'overtime'} icon={<ClockIcon />} isOpen={isOpen} />
          <NavLink page="taxRules" label="Aturan Pajak" navigateTo={navigateTo} isActive={currentPage === 'taxRules'} icon={<ScaleIcon />} isOpen={isOpen} />
          <NavLink page="reports" label="Laporan" navigateTo={navigateTo} isActive={currentPage === 'reports'} icon={<DocumentDownloadIcon />} isOpen={isOpen} />
          <NavLink page="settings" label="Pengaturan" navigateTo={navigateTo} isActive={currentPage === 'settings'} icon={<CogIcon />} isOpen={isOpen} />
        </nav>
      </div>
    </aside>
  );
};

// --- ELEGANT ACCOUNTING ICONS (Stroke 1.5) ---
const ChartPieIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>;
const IdentificationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-1.294-3.711 6.721 6.721 0 01-1.294 3.711 6.72 6.72 0 01-5.704 3.711 6.72 6.72 0 015.704-3.711z" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.091-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ScaleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" /></svg>;
const DocumentDownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const CalculatorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

export default Sidebar;
