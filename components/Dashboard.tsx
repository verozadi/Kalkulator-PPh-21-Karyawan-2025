
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
        <Card title="Total Karyawan" value={summaryData.totalEmployees} icon={<BuildingOfficeIcon />} />
        <Card title="Total Gaji Bruto (Bulan Ini)" value={formatCurrency(summaryData.totalGrossSalary)} icon={<CurrencyDollarIcon />} />
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
const BuildingOfficeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const CurrencyDollarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ReceiptTaxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

export default Dashboard;
