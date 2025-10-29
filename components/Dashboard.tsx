

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

const ChartPieIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>;

const Dashboard: React.FC<DashboardProps> = ({ employees, masterEmployees, navigateTo, onEditEmployee }) => {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [actionsRef, areActionsVisible] = useAnimateOnScroll({ threshold: 0.1 });
    const [summaryRef, isSummaryVisible] = useAnimateOnScroll({ threshold: 0.1 });


    const handlePreviousMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const monthlyEmployees = React.useMemo(() => {
        return employees.filter(e => 
            e.periodYear === currentDate.getFullYear() &&
            e.periodMonth === currentDate.getMonth() + 1
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

    const chartData = [
        { name: 'Ringkasan', 'Total Gaji Bruto': summaryData.totalGrossSalary, 'Total PPh 21': summaryData.totalPPh21 }
    ];

  return (
    <div className="space-y-8 animate-fade-in">
       <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <div className="flex items-center space-x-3 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <ChartPieIcon />
                    <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
                </div>
                <p className="text-gray-400 mt-1 animate-fade-in-up" style={{ animationDelay: '200ms' }}>Ringkasan data PPh 21 perusahaan Anda.</p>
            </div>
          <div className="flex items-center space-x-2 bg-gray-800/50 border border-gray-700 p-1 rounded-lg animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <button onClick={handlePreviousMonth} className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label="Bulan sebelumnya">
              <ChevronLeftIcon />
            </button>
            <span className="font-semibold text-lg text-gray-200 w-40 text-center select-none" aria-live="polite">{displayPeriod}</span>
            <button onClick={handleNextMonth} className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label="Bulan berikutnya">
              <ChevronRightIcon />
            </button>
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
              title="Input Karyawan"
              description="Tambah data karyawan baru"
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

// SVG Icons
const BuildingOfficeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const CurrencyDollarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ReceiptTaxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;

export default Dashboard;