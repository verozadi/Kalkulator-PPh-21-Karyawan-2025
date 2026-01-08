
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
    const activeClasses = 'bg-primary-900 text-primary-300 border-l-4 border-primary-500';
    const inactiveClasses = 'text-gray-400 hover:bg-gray-800 hover:text-gray-100 border-l-4 border-transparent';
    return (
        <div className="relative group">
            <button
                onClick={() => navigateTo(page)}
                className={`w-full flex items-center py-3 text-sm font-semibold transition-all duration-200 ${isActive ? activeClasses : inactiveClasses} ${isOpen ? 'px-4 space-x-3' : 'justify-center px-0'}`}
            >
                <div className={`${isActive ? 'text-primary-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                    {icon}
                </div>
                <span className={`${isOpen ? 'inline-block' : 'hidden'}`}>{label}</span>
            </button>
            {!isOpen && (
                 <span className="absolute left-full top-2 ml-2 px-2 py-1 bg-gray-900 border border-gray-700 text-white text-xs rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
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

    const baseClasses = 'text-gray-400 hover:bg-gray-800 hover:text-gray-100 border-l-4 border-transparent';
    const activeClasses = 'bg-gray-800 text-primary-300 border-l-4 border-primary-500';

    return (
        <div className="relative">
            <button
                onClick={() => isOpen && setIsExpanded(!isExpanded)}
                className={`w-full flex items-center py-3 text-sm font-semibold transition-all duration-200 ${isActiveParent ? activeClasses : baseClasses} ${isOpen ? 'px-4 space-x-3 justify-between' : 'justify-center px-0'}`}
            >
                <div className="flex items-center space-x-3">
                    <div className={`${isActiveParent ? 'text-primary-400' : 'text-gray-500'}`}>
                        {icon}
                    </div>
                    <span className={`${isOpen ? 'inline-block' : 'hidden'}`}>{label}</span>
                </div>
                {isOpen && (
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                )}
            </button>
            
            {!isOpen && (
                 <div className="absolute left-full top-0 ml-2 bg-gray-900 border border-gray-700 rounded-md shadow-xl opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity z-50 w-52 p-2 hidden group-hover:block">
                    <p className="text-xs text-gray-500 font-bold mb-2 px-2 border-b border-gray-700 pb-1 uppercase tracking-wider">{label}</p>
                    {children}
                </div>
            )}

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded && isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-900/30 pb-2">
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
        className={`w-full flex items-center py-2 pl-12 pr-4 text-xs transition-colors duration-200 ${isActive ? 'text-primary-400 font-bold bg-primary-900/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
    >
        <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive ? 'bg-primary-500' : 'bg-gray-600'}`}></span>
        {label}
    </button>
);


const Sidebar: React.FC<SidebarProps> = ({ currentPage, navigateTo, isOpen }) => {
  const isCalcActive = ['pph21Monthly', 'pph21NonFinal', 'pph21Annual', 'employeeInput'].includes(currentPage);
  const isListActive = ['employeeList', 'employeeListMonthly', 'employeeListNonFinal', 'employeeListAnnual'].includes(currentPage);

  return (
    <aside className={`flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-72' : 'w-20'}`}>
      <div className="flex-1 flex flex-col py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <NavLink page="dashboard" label="Dashboard" navigateTo={navigateTo} isActive={currentPage === 'dashboard'} icon={<ChartBarIcon />} isOpen={isOpen} />
          <NavLink page="employeeMasterList" label="Data Induk Karyawan" navigateTo={navigateTo} isActive={currentPage === 'employeeMasterList'} icon={<UsersIcon />} isOpen={isOpen} />
          
          <div className="pt-2 pb-1">
            <div className={`px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest ${isOpen ? 'block' : 'hidden'}`}>Transaksi</div>
          </div>

          <NavDropdown label="Hitung PPh 21" icon={<CalculatorIcon />} isOpen={isOpen} isActiveParent={isCalcActive}>
                <SubNavLink page="pph21Monthly" label="Bulanan (Pegawai Tetap)" navigateTo={navigateTo} isActive={currentPage === 'pph21Monthly'} />
                <SubNavLink page="pph21NonFinal" label="Final / Tidak Final" navigateTo={navigateTo} isActive={currentPage === 'pph21NonFinal'} />
                <SubNavLink page="pph21Annual" label="Tahunan (1721-A1)" navigateTo={navigateTo} isActive={currentPage === 'pph21Annual'} />
          </NavDropdown>

          <NavDropdown label="Riwayat & Data" icon={<ClipboardDocumentListIcon />} isOpen={isOpen} isActiveParent={isListActive}>
                <SubNavLink page="employeeListMonthly" label="Data Bulanan" navigateTo={navigateTo} isActive={currentPage === 'employeeListMonthly'} />
                <SubNavLink page="employeeListNonFinal" label="Data Final/TF" navigateTo={navigateTo} isActive={currentPage === 'employeeListNonFinal'} />
                <SubNavLink page="employeeListAnnual" label="Data A1 Tahunan" navigateTo={navigateTo} isActive={currentPage === 'employeeListAnnual'} />
          </NavDropdown>

          <NavLink page="overtime" label="Lembur & Jam Kerja" navigateTo={navigateTo} isActive={currentPage === 'overtime'} icon={<ClockIcon />} isOpen={isOpen} />
          
          <div className="pt-4 pb-1">
            <div className={`px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest ${isOpen ? 'block' : 'hidden'}`}>Lainnya</div>
          </div>

          <NavLink page="reports" label="Laporan & Ekspor" navigateTo={navigateTo} isActive={currentPage === 'reports'} icon={<DocumentChartBarIcon />} isOpen={isOpen} />
          <NavLink page="taxRules" label="Aturan Pajak" navigateTo={navigateTo} isActive={currentPage === 'taxRules'} icon={<ScaleIcon />} isOpen={isOpen} />
          <NavLink page="settings" label="Pengaturan" navigateTo={navigateTo} isActive={currentPage === 'settings'} icon={<Cog6ToothIcon />} isOpen={isOpen} />
      </div>
    </aside>
  );
};

// --- CONSISTENT VECTOR ICONS (Outline Style stroke-width 1.5) ---
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
const CalculatorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ClipboardDocumentListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.091-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const DocumentChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const ScaleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" /></svg>;
const Cog6ToothIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

export default Sidebar;
