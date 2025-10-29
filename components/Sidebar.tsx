

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


const Sidebar: React.FC<SidebarProps> = ({ currentPage, navigateTo, isOpen }) => {
  return (
    <aside className={`flex-shrink-0 bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex-1 flex flex-col p-2 space-y-6 overflow-y-auto pt-4">
        <nav className="space-y-1">
          <NavLink page="dashboard" label="Dashboard" navigateTo={navigateTo} isActive={currentPage === 'dashboard'} icon={<ChartPieIcon />} isOpen={isOpen} />
          <NavLink page="employeeMasterList" label="Daftar Nama Karyawan" navigateTo={navigateTo} isActive={currentPage === 'employeeMasterList'} icon={<IdentificationIcon />} isOpen={isOpen} />
          <NavLink page="employeeList" label="Daftar PPh 21 Karyawan" navigateTo={navigateTo} isActive={currentPage === 'employeeList'} icon={<ClipboardListIcon />} isOpen={isOpen} />
          <NavLink page="overtime" label="Lembur" navigateTo={navigateTo} isActive={currentPage === 'overtime'} icon={<ClockIcon />} isOpen={isOpen} />
          <NavLink page="taxRules" label="Aturan Pajak" navigateTo={navigateTo} isActive={currentPage === 'taxRules'} icon={<ScaleIcon />} isOpen={isOpen} />
          <NavLink page="reports" label="Laporan" navigateTo={navigateTo} isActive={currentPage === 'reports'} icon={<DocumentDownloadIcon />} isOpen={isOpen} />
          <NavLink page="settings" label="Pengaturan" navigateTo={navigateTo} isActive={currentPage === 'settings'} icon={<CogIcon />} isOpen={isOpen} />
        </nav>

        <div className={`space-y-2 pt-4 border-t border-gray-700 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 h-0 invisible'}`}>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Akses Cepat</h3>
            <div className="px-2 space-y-2">
                <button onClick={() => navigateTo('employeeInput')} className="w-full flex items-center justify-center space-x-2 bg-accent-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-accent-600 transition-colors">
                    <CalculatorIcon />
                    <span>Hitung PPh 21</span>
                </button>
                 <button onClick={() => navigateTo('reports')} className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                    <ExportIcon />
                    <span>Export Laporan</span>
                </button>
            </div>
        </div>

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
const ExportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const CogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

export default Sidebar;
