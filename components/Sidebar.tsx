
import React from 'react';
import { Page, Profile } from '../types';

interface SidebarProps {
  currentPage: Page;
  navigateTo: (page: Page) => void;
  profile: Profile;
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


const Sidebar: React.FC<SidebarProps> = ({ currentPage, navigateTo, profile, isOpen }) => {
  return (
    <aside className={`flex-shrink-0 bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className={`h-16 flex items-center border-b border-gray-700 ${isOpen ? 'px-6' : 'px-4 justify-center'}`}>
        <div className="flex items-center space-x-3">
            <img src={profile.logoUrl} alt="Logo" className="h-8 w-8 rounded-md object-cover bg-gray-700 flex-shrink-0"/>
            <span className={`text-xl font-bold text-gray-100 whitespace-nowrap transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>{profile.appName}</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col p-2 space-y-6 overflow-y-auto">
        <nav className="space-y-1">
          <NavLink page="dashboard" label="Dashboard" navigateTo={navigateTo} isActive={currentPage === 'dashboard'} icon={<HomeIcon />} isOpen={isOpen} />
          <NavLink page="employeeMasterList" label="Daftar Nama Karyawan" navigateTo={navigateTo} isActive={currentPage === 'employeeMasterList'} icon={<UsersIcon />} isOpen={isOpen} />
          <NavLink page="employeeList" label="Daftar PPh 21 Karyawan" navigateTo={navigateTo} isActive={currentPage === 'employeeList'} icon={<DocumentTextIcon />} isOpen={isOpen} />
          <NavLink page="overtime" label="Lembur" navigateTo={navigateTo} isActive={currentPage === 'overtime'} icon={<ClockIcon />} isOpen={isOpen} />
          <NavLink page="taxRules" label="Aturan Pajak" navigateTo={navigateTo} isActive={currentPage === 'taxRules'} icon={<BookOpenIcon />} isOpen={isOpen} />
          <NavLink page="reports" label="Laporan" navigateTo={navigateTo} isActive={currentPage === 'reports'} icon={<DocumentReportIcon />} isOpen={isOpen} />
          <NavLink page="settings" label="Pengaturan" navigateTo={navigateTo} isActive={currentPage === 'settings'} icon={<CogIcon />} isOpen={isOpen} />
        </nav>

        <div className={`space-y-2 pt-4 border-t border-gray-700 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 h-0 invisible'}`}>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Akses Cepat</h3>
            <div className="px-2 space-y-2">
                <button onClick={() => navigateTo('employeeInput')} className="w-full flex items-center justify-center space-x-2 bg-accent-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-accent-600 transition-colors">
                    <PlusCircleIcon />
                    <span>Hitung PPh 21</span>
                </button>
                 <button onClick={() => navigateTo('reports')} className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                    <DownloadIcon />
                    <span>Export Laporan</span>
                </button>
            </div>
        </div>

      </div>
    </aside>
  );
};

// Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>;
const DocumentTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const DocumentReportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const CogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

export default Sidebar;
