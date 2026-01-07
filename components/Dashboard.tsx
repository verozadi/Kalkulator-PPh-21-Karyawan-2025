
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

// --- ELEGANT ACCOUNTING ICONS (Stroke 1.5) ---
// Updated to a Bar Chart / Presentation Graph for better "Accounting" feel
const AccountingDashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>;

const BuildingOfficeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>;
const CurrencyDollarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>;
const ReceiptTaxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
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
