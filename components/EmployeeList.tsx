
import * as React from 'react';
import { Employee, Page, MasterEmployee, MaritalStatus } from '../types';

interface EmployeeListProps {
  employees: Employee[];
  masterEmployees: MasterEmployee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employeeId: string) => void;
  navigateTo: (page: Page) => void;
  onOpenDetailModal: (employee: Employee) => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

// --- Icon Components ---
const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ViewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;


const EmployeeList: React.FC<EmployeeListProps> = ({ employees, masterEmployees, onEdit, onDelete, navigateTo, onOpenDetailModal }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterYear, setFilterYear] = React.useState('');
  const [filterMonth, setFilterMonth] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('');
  
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];


  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterYear('');
    setFilterMonth('');
    setFilterStatus('');
  };

  const handleDeleteClick = (employee: Employee) => {
    const period = `${months[employee.periodMonth - 1]} ${employee.periodYear}`;
    if (window.confirm(`Anda yakin ingin menghapus data PPh 21 untuk ${employee.name} periode ${period}?`)) {
        onDelete(employee.id);
    }
  };


  const filteredEmployees = React.useMemo(() => {
    return employees.filter(employee => 
      (employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       (employee.npwp && employee.npwp.includes(searchTerm))) &&
      (filterYear === '' || employee.periodYear.toString() === filterYear) &&
      (filterMonth === '' || employee.periodMonth.toString() === filterMonth) &&
      (filterStatus === '' || employee.status === filterStatus)
    );
  }, [employees, searchTerm, filterYear, filterMonth, filterStatus]);
  
  const summary = React.useMemo(() => {
      return {
          totalKaryawan: masterEmployees.length,
          totalGajiBruto: filteredEmployees.reduce((sum, e) => sum + e.grossIncome, 0),
          totalPph21: filteredEmployees.reduce((sum, e) => sum + e.finalPPh21Monthly, 0)
      }
  }, [masterEmployees, filteredEmployees]);

  const uniqueYears = React.useMemo(() => {
      const startYear = 2024;
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let year = currentYear; year >= startYear; year--) {
          years.push(year);
      }
      return years;
  }, []);

  return (
    <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <div className="flex items-center space-x-3">
                    <UserGroupIcon />
                    <h1 className="text-3xl font-bold text-gray-100">Daftar PPh 21 Karyawan</h1>
                </div>
                <p className="text-gray-400 mt-1">Kelola data karyawan dan perhitungan PPh 21</p>
            </div>
            <button
                onClick={() => navigateTo('employeeInput')}
                className="bg-accent-500 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-accent-600 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-accent-900/50"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                <span>Hitung PPh 21 Baru</span>
            </button>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-400 font-medium">Total Karyawan</p>
                    <p className="text-3xl font-bold text-white">{summary.totalKaryawan}</p>
                </div>
                <div className="bg-primary-900/50 p-3 rounded-full"><UserGroupIcon /></div>
            </div>
            <div className="bg-yellow-900/30 p-5 rounded-lg border border-yellow-700/50 flex items-center justify-between">
                 <div>
                    <p className="text-sm text-yellow-400 font-medium">Total Gaji Bruto</p>
                    <p className="text-3xl font-bold text-white">{formatCurrency(summary.totalGajiBruto)}</p>
                </div>
                <div className="bg-yellow-500/20 text-yellow-300 font-bold text-lg p-3 rounded-full w-12 h-12 flex items-center justify-center">Rp</div>
            </div>
             <div className="bg-teal-900/30 p-5 rounded-lg border border-teal-700/50 flex items-center justify-between">
                 <div>
                    <p className="text-sm text-teal-400 font-medium">Total PPH 21</p>
                    <p className="text-3xl font-bold text-white">{formatCurrency(summary.totalPph21)}</p>
                </div>
                <div className="bg-teal-500/20 text-teal-300 font-bold text-lg p-3 rounded-full w-12 h-12 flex items-center justify-center">%</div>
            </div>
        </div>
        
        {/* Filter Section */}
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-4">
             <div className="flex items-center space-x-2">
                <FilterIcon />
                <h3 className="text-lg font-semibold text-gray-200">Filter & Pencarian</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative lg:col-span-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input type="text" placeholder="Cari nama atau NPWP..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200 placeholder-gray-400" />
                </div>
                <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200">
                    <option value="">Semua Bulan</option>
                    {months.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
                </select>
                <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200">
                    <option value="">Semua Tahun</option>
                    {uniqueYears.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200">
                    <option value="">Semua Status</option>
                    {Object.values(MaritalStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="flex justify-end">
                <button onClick={handleResetFilters} className="text-sm font-semibold text-gray-400 hover:text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">Reset Filter</button>
            </div>
        </div>

        {/* Employee Table */}
        <div className="overflow-x-auto bg-gray-800 rounded-lg border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
                <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Nama Karyawan</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">NPWP</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Periode</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Gaji Bruto</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">PPH 21</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Aksi</th>
                </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredEmployees.length > 0 ? filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-white">{employee.name}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{employee.npwp || 'Tidak Ada NPWP'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-400">{`${months[employee.periodMonth - 1]} ${employee.periodYear}`}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-300">{employee.status}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-300 text-right">{formatCurrency(employee.grossIncome)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-accent-400 text-right">{formatCurrency(employee.finalPPh21Monthly)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => onOpenDetailModal(employee)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md" title="Lihat Detail"><ViewIcon /></button>
                        <button onClick={() => onEdit(employee)} className="p-2 text-gray-400 hover:text-primary-400 hover:bg-gray-700 rounded-md" title="Edit"><EditIcon /></button>
                        <button onClick={() => handleDeleteClick(employee)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-md" title="Hapus"><TrashIcon /></button>
                    </div>
                    </td>
                </tr>
                )) : (
                    <tr>
                        <td colSpan={7} className="text-center py-10 text-gray-500">
                            Tidak ada data yang cocok dengan filter Anda.
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
