
import React from 'react';
import { Page, Employee } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface SummaryData {
  totalEmployees: number;
  totalGrossSalary: number;
  totalPPh21: number;
}

interface DashboardProps {
  summaryData: SummaryData;
  recentEmployees: Employee[];
  navigateTo: (page: Page) => void;
  onEditEmployee: (employee: Employee) => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const Card: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl shadow-black/20 flex items-center space-x-4">
        <div className="bg-primary-900 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-100">{value}</p>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ summaryData, recentEmployees, navigateTo, onEditEmployee }) => {
  const chartData = [
    { name: 'Ringkasan', 'Total Gaji Bruto': summaryData.totalGrossSalary, 'Total PPh 21': summaryData.totalPPh21 }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Karyawan" value={summaryData.totalEmployees} icon={<UsersIcon />} />
        <Card title="Total Gaji Bruto (Bulan Ini)" value={formatCurrency(summaryData.totalGrossSalary)} icon={<CashIcon />} />
        <Card title="Total PPh 21 Dipotong (Bulan Ini)" value={formatCurrency(summaryData.totalPPh21)} icon={<ReceiptTaxIcon />} />
      </div>

      {/* Chart and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-xl shadow-black/20">
          <h3 className="font-bold text-lg mb-4 text-gray-200">Ringkasan Finansial Bulan Ini</h3>
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
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-xl shadow-black/20">
            <h3 className="font-bold text-lg mb-4 text-gray-200">Aktivitas Terakhir</h3>
            <div className="space-y-4">
                {recentEmployees.length > 0 ? recentEmployees.map(emp => (
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
                    <p className="text-sm text-gray-500 text-center py-8">Tidak ada aktivitas terbaru.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// SVG Icons
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>;
const CashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ReceiptTaxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 14l-6-6m5.5.5h.01M9 19l-6-6m5.5.5h.01M19 9l-6 6m-5.5-.5h.01M9 5l6 6" /></svg>;

export default Dashboard;
