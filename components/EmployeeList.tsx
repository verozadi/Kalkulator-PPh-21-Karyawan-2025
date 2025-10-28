
import React, { useState, useMemo } from 'react';
import { Employee, Page } from '../types';

interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employeeId: string) => void;
  navigateTo: (page: Page) => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onEdit, onDelete, navigateTo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterMonth, setFilterMonth] = useState('');

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => 
      (employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       employee.npwp.includes(searchTerm)) &&
      (filterYear === '' || employee.periodYear.toString() === filterYear) &&
      (filterMonth === '' || employee.periodMonth.toString() === filterMonth)
    );
  }, [employees, searchTerm, filterYear, filterMonth]);

  const uniqueYears = useMemo(() => {
      // Fix: Explicitly type the Set to prevent its elements from being inferred as 'unknown'.
      const years = new Set<number>(employees.map(e => e.periodYear));
      return Array.from(years).sort((a,b) => b - a);
  }, [employees]);

  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl shadow-black/20">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-primary-400">Daftar PPh 21 Karyawan</h2>
         <button
            onClick={() => navigateTo('employeeInput')}
            className="bg-accent-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-600 transition-colors flex items-center space-x-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span>Hitung PPh 21</span>
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Cari nama atau NPWP..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/2 px-4 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200 placeholder-gray-400"
        />
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200"
        >
          <option value="">Semua Tahun</option>
          {uniqueYears.map(year => <option key={year} value={year}>{year}</option>)}
        </select>
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200"
        >
          <option value="">Semua Bulan</option>
          {months.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
        </select>
      </div>

      {/* Employee Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">NPWP</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Periode</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-300 uppercase tracking-wider">Penghasilan Bruto</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-300 uppercase tracking-wider">PPh 21 Terutang</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {filteredEmployees.length > 0 ? filteredEmployees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-200">{employee.name}</div>
                    <div className="text-sm text-gray-400">{employee.status}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{employee.npwp || 'Tidak Ada'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{`${employee.periodMonth}/${employee.periodYear}`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 text-right">{formatCurrency(employee.grossIncome)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-400 text-right">{formatCurrency(employee.finalPPh21Monthly)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button onClick={() => onEdit(employee)} className="text-primary-400 hover:text-primary-300 mr-4">Edit</button>
                  <button onClick={() => window.confirm('Anda yakin ingin menghapus data PPh 21 ini?') && onDelete(employee.id)} className="text-red-400 hover:text-red-300">Hapus</button>
                </td>
              </tr>
            )) : (
                <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                        Tidak ada data PPh 21 yang cocok.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeList;
