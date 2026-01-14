
import * as React from 'react';
import { Page, Employee, MasterEmployee } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  employees: Employee[];
  masterEmployees: MasterEmployee[];
  navigateTo: (page: Page) => void;
  onEditEmployee: (employee: Employee) => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const useAnimateOnScroll = (options?: IntersectionObserverInit) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                if (ref.current) {
                    observer.unobserve(ref.current);
                }
            }
        }, options);

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                observer.unobserve(ref.current);
            }
        };
    }, [options]);

    return [ref, isVisible] as const;
};


const Card: React.FC<{ title: string; value: string | number; icon: React.ReactNode; style?: React.CSSProperties; className?: string }> = ({ title, value, icon, style, className }) => (
    <div className={`bg-gray-800 p-6 rounded-lg shadow-xl shadow-black/20 flex items-center space-x-4 ${className || ''}`} style={style}>
        <div className="bg-primary-900 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-100">{value}</p>
        </div>
    </div>
);

const ActionCard: React.FC<{ title: string; description: string; onClick: () => void; style?: React.CSSProperties }> = ({ title, description, onClick, style }) => (
    <button
        onClick={onClick}
        className="bg-gray-800 p-6 rounded-lg shadow-lg flex justify-between items-center transition-all duration-300 hover:border-primary-500 border border-gray-700 hover:shadow-primary-500/10 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
        style={style}
    >
        <div className="text-left">
            <h3 className="font-bold text-gray-100 text-lg">{title}</h3>
            <p className="text-sm text-gray-400 mt-1">{description}</p>
        </div>
        <ChevronRightIcon />
    </button>
);

// --- ELEGANT ACCOUNTING ICONS (Professional Vectors, Stroke 1.5) ---

// Presentation Chart Line Icon
const AccountingDashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
    </svg>
);

// Users Icon (Replaces Building)
const BuildingOfficeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
);

// Banknotes Icon (Replaces Currency Dollar)
const CurrencyDollarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
);

// Document Check Icon (Replaces Receipt Tax)
const ReceiptTaxIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
);

const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>;

const Dashboard: React.FC<DashboardProps> = ({ employees, masterEmployees, navigateTo, onEditEmployee }) => {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
    const datePickerRef = React.useRef<HTMLDivElement>(null);
    
    const [actionsRef, areActionsVisible] = useAnimateOnScroll({ threshold: 0.1 });
    const [summaryRef, isSummaryVisible] = useAnimateOnScroll({ threshold: 0.1 });

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setIsDatePickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePreviousMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handleMonthSelect = (monthIndex: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
        setIsDatePickerOpen(false);
    };

    const handleYearChange = (increment: number) => {
        setCurrentDate(new Date(currentDate.getFullYear() + increment, currentDate.getMonth(), 1));
    };

    const monthlyEmployees = React.useMemo(() => {
        return employees.filter(e => 
            e.calculationType === 'monthly' &&
            Number(e.periodYear) === currentDate.getFullYear() &&
            Number(e.periodMonth) === currentDate.getMonth() + 1
        );
    }, [employees, currentDate]);

    const summaryData = React.useMemo(() => {
        const totalEmployees = masterEmployees.length;
        const totalGrossSalary = monthlyEmployees.reduce((sum, e) => sum + e.grossIncome, 0);
        const totalPPh21 = monthlyEmployees.reduce((sum, e) => sum + e.finalPPh21Monthly, 0);
        return { totalEmployees, totalGrossSalary, totalPPh21 };
    }, [monthlyEmployees, masterEmployees]);
    
    const displayMonth = currentDate.toLocaleString('id-ID', { month: 'long' });
    const displayYear = currentDate.getFullYear();
    const displayPeriod = `${displayMonth} ${displayYear}`;
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    const chartData = [
        { name: 'Ringkasan', 'Total Gaji Bruto': summaryData.totalGrossSalary, 'Total PPh 21': summaryData.totalPPh21 }
    ];

  return (
    <div className="space-y-8 animate-fade-in">
       <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <div className="flex items-center space-x-3 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <AccountingDashboardIcon />
                    <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
                </div>
                <p className="text-gray-400 mt-1 animate-fade-in-up" style={{ animationDelay: '200ms' }}>Ringkasan data PPh 21 perusahaan Anda.</p>
            </div>
          
          {/* Interactive Date Picker */}
          <div className="relative" ref={datePickerRef} style={{ animationDelay: '300ms' }}>
              <div className="flex items-center space-x-1 bg-gray-800 border border-gray-700 p-1 rounded-lg animate-fade-in-up shadow-sm">
                <button onClick={handlePreviousMonth} className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label="Bulan sebelumnya">
                  <ChevronLeftIcon />
                </button>
                
                <button 
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 rounded-md hover:bg-gray-700 transition-colors w-48 text-gray-200 hover:text-white group focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <span className="font-semibold text-lg select-none">{displayPeriod}</span>
                    <span className={`transform transition-transform duration-200 ${isDatePickerOpen ? 'rotate-180 text-primary-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                        <ChevronDownIcon />
                    </span>
                </button>

                <button onClick={handleNextMonth} className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label="Bulan berikutnya">
                  <ChevronRightIcon />
                </button>
              </div>

              {/* Dropdown Popover */}
              {isDatePickerOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-4 z-50 w-72 animate-fade-in-up origin-top-right">
                      {/* Year Selector */}
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
                          <button onClick={() => handleYearChange(-1)} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"><ChevronLeftIcon /></button>
                          <span className="font-bold text-lg text-white">{currentDate.getFullYear()}</span>
                          <button onClick={() => handleYearChange(1)} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"><ChevronRightIcon /></button>
                      </div>
                      
                      {/* Month Grid */}
                      <div className="grid grid-cols-3 gap-2">
                          {months.map((m, idx) => (
                              <button
                                  key={m}
                                  onClick={() => handleMonthSelect(idx)}
                                  className={`px-2 py-2 text-sm rounded-lg transition-colors ${
                                      currentDate.getMonth() === idx 
                                      ? 'bg-primary-600 text-white font-bold shadow-lg shadow-primary-900/50' 
                                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white'
                                  }`}
                              >
                                  {m.substring(0, 3)}
                              </button>
                          ))}
                      </div>
                  </div>
              )}
          </div>
        </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
        <Card title="Total Karyawan Terdaftar" value={summaryData.totalEmployees} icon={<BuildingOfficeIcon />} className="animate-fade-in-up" style={{ '--stagger-delay': '300ms' } as React.CSSProperties} />
        <Card title={`Total Gaji Bruto (${displayMonth.substring(0,3)} ${displayYear})`} value={formatCurrency(summaryData.totalGrossSalary)} icon={<CurrencyDollarIcon />} className="animate-fade-in-up" style={{ '--stagger-delay': '400ms' } as React.CSSProperties} />
        <Card title={`Total PPh 21 Dipotong (${displayMonth.substring(0,3)} ${displayYear})`} value={formatCurrency(summaryData.totalPPh21)} icon={<ReceiptTaxIcon />} className="animate-fade-in-up" style={{ '--stagger-delay': '500ms' } as React.CSSProperties} />
      </div>

       {/* Quick Actions */}
      <div ref={actionsRef} className={`grid grid-cols-1 md:grid-cols-3 gap-6 scroll-animate ${areActionsVisible ? 'visible' : ''} stagger-children`}>
          <ActionCard
              title="Daftar Karyawan"
              description="Lihat dan kelola data karyawan"
              onClick={() => navigateTo('employeeMasterList')}
              style={{ '--stagger-delay': '0ms' } as React.CSSProperties}
          />
          <ActionCard
              title="Hitung PPh 21"
              description="Input perhitungan PPh 21"
              onClick={() => navigateTo('employeeInput')}
              style={{ '--stagger-delay': '100ms' } as React.CSSProperties}
          />
          <ActionCard
              title="Laporan & Export"
              description="Buat laporan dan export data"
              onClick={() => navigateTo('reports')}
              style={{ '--stagger-delay': '200ms' } as React.CSSProperties}
          />
      </div>


      {/* Chart and Recent Activity */}
      <div ref={summaryRef} className={`grid grid-cols-1 lg:grid-cols-3 gap-6 scroll-animate ${isSummaryVisible ? 'visible' : ''}`}>
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-xl shadow-black/20">
          <h3 className="font-bold text-lg mb-4 text-gray-200">Ringkasan Finansial - {displayPeriod}</h3>
           {monthlyEmployees.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#4A5568" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#A0AEC0' }} />
                    <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} tickLine={false} axisLine={false} tick={{ fill: '#A0AEC0' }} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} cursor={{fill: 'rgba(255, 255, 255, 0.1)'}} contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568', color: '#E2E8F0' }} />
                    <Legend wrapperStyle={{ color: '#E2E8F0' }} />
                    <Bar dataKey="Total Gaji Bruto" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Total PPh 21" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
           ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                    Tidak ada data untuk ditampilkan pada periode ini.
                </div>
           )}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-xl shadow-black/20">
            <h3 className="font-bold text-lg mb-4 text-gray-200">Aktivitas - {displayPeriod}</h3>
            <div className="space-y-4">
                {monthlyEmployees.length > 0 ? monthlyEmployees.slice(0, 5).map(emp => (
                    <div key={emp.id} className="flex justify-between items-center hover:bg-gray-700 p-2 rounded-md">
                        <div>
                            <p className="font-semibold text-gray-200">{emp.name}</p>
                            <p className="text-sm text-gray-400">PPh 21: {formatCurrency(emp.finalPPh21Monthly)}</p>
                        </div>
                        <button onClick={() => onEditEmployee(emp)} className="text-sm text-primary-400 hover:text-primary-300 font-semibold">
                            Lihat
                        </button>
                    </div>
                )) : (
                    <p className="text-sm text-gray-500 text-center py-8">Tidak ada aktivitas pada periode ini.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
