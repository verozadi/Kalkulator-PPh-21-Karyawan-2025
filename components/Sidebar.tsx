
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

    // If sidebar is closed, we cannot expand conventionally inline. 
    // For simplicity in this layout, we expand if sidebar is open.
    // If sidebar closed, clicking main icon could toggle specific menu or navigate to default.
    // Here we assume basic accordion behavior when sidebar is open.

    React.useEffect(() => {
        if (isActiveParent) setIsExpanded(true);
    }, [isActiveParent]);

    const baseClasses = 'text-gray-300 hover:bg-gray-700 hover:text-gray-100';
    const activeClasses = 'bg-gray-800 text-white';

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
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </button>
            
            {/* Tooltip for collapsed sidebar */}
            {!isOpen && (
                 <div className="absolute left-full top-0 ml-3 bg-gray-900 border border-gray-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity z-50 w-48 p-2 hidden group-hover:block">
                    <p className="text-xs text-gray-400 font-bold mb-2 px-2 border-b border-gray-700 pb-1">{label}</p>
                    {children}
                </div>
            )}

            {/* Accordion Content */}
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
        className={`w-full flex items-center py-2 px-3 rounded-md text-sm transition-colors duration-200 ${isActive ? 'text-primary-400 bg-gray-700/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'}`}
    >
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-2"></span>
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
          
          {/* Dropdown for PPh 21 Calculation */}
          <div className="relative group">
            <NavDropdown label="Perhitungan PPh 21" icon={<CalculatorIcon />} isOpen={isOpen} isActiveParent={isCalcActive}>
                <SubNavLink page="pph21Monthly" label="PPh 21 Bulanan" navigateTo={navigateTo} isActive={currentPage === 'pph21Monthly'} />
                <SubNavLink page="pph21NonFinal" label="PPh 21 Final/Tidak Final" navigateTo={navigateTo} isActive={currentPage === 'pph21NonFinal'} />
                <SubNavLink page="pph21Annual" label="PPh 21 Tahunan A1" navigateTo={navigateTo} isActive={currentPage === 'pph21Annual'} />
            </NavDropdown>
          </div>

          {/* Dropdown for PPh 21 List (Separated) */}
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

// Icons
const ChartPieIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>;
const IdentificationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-4 0h4m-4 0H9m4 0h2m-2 0h-2m2 0h2m-6 4h6m-6 4h6m-6 4h6" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ScaleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>;
const DocumentDownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const CalculatorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-6 4h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" /></svg>;
const CogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

export default Sidebar;
