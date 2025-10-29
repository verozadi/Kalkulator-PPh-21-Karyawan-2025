

import * as React from 'react';
import { MasterEmployee } from '../types';
import MasterEmployeeFormModal from './MasterEmployeeFormModal';

interface EmployeeMasterListProps {
  masterEmployees: MasterEmployee[];
  onAddNew: () => void;
  onEdit: (employee: MasterEmployee) => void;
  onDelete: (id: string) => void;
}

const IdentificationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-4 0h4m-4 0H9m4 0h2m-2 0h-2m2 0h2m-6 4h6m-6 4h6m-6 4h6" /></svg>;

const EmployeeMasterList: React.FC<EmployeeMasterListProps> = ({ masterEmployees, onAddNew, onEdit, onDelete }) => {
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <div className="flex items-center space-x-3">
                        <IdentificationIcon />
                        <h1 className="text-3xl font-bold text-gray-100">Daftar Nama Karyawan</h1>
                    </div>
                    <p className="text-gray-400 mt-1">Kelola data master seluruh karyawan Anda.</p>
                </div>
                <button
                    onClick={onAddNew}
                    className="bg-accent-500 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-accent-600 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-accent-900/50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-5-6a3 3 0 100-6 3 3 0 000 6zM13 18a6 6 0 00-6-6H5a6 6 0 00-6 6v1h14v-1z" /></svg>
                    <span>Tambah Karyawan Baru</span>
                </button>
            </div>
            
            <div className="overflow-x-auto bg-gray-800 rounded-lg border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Nama Lengkap</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Jabatan</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Kontak</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {masterEmployees.length > 0 ? masterEmployees.map((employee, index) => (
                            <tr 
                                key={employee.id} 
                                className="hover:bg-gray-700/50 transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-200">{employee.fullName}</div>
                                    <div className="text-sm text-gray-400">{employee.employeeId}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{employee.position}</td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-300">{employee.email}</div>
                                    <div className="text-sm text-gray-400">{employee.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.employeeStatus === 'Pegawai Tetap' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                        {employee.employeeStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <button onClick={() => onEdit(employee)} className="text-primary-400 hover:text-primary-300 mr-4">Edit</button>
                                    <button onClick={() => window.confirm(`Anda yakin ingin menghapus ${employee.fullName}? Ini tidak akan menghapus data PPh 21 yang sudah ada.`) && onDelete(employee.id)} className="text-red-400 hover:text-red-300">Hapus</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-gray-500">
                                    Belum ada data master karyawan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeeMasterList;