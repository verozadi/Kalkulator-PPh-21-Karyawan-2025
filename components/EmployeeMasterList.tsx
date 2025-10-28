import React, { useState } from 'react';
import { MasterEmployee } from '../types';
import MasterEmployeeFormModal from './MasterEmployeeFormModal';

interface EmployeeMasterListProps {
  masterEmployees: MasterEmployee[];
  onSave: (employee: MasterEmployee) => void;
  onDelete: (id: string) => void;
}

const EmployeeMasterList: React.FC<EmployeeMasterListProps> = ({ masterEmployees, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<MasterEmployee | null>(null);

    const handleAddNew = () => {
        setEditingEmployee(null);
        setIsModalOpen(true);
    };

    const handleEdit = (employee: MasterEmployee) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    const handleSave = (employee: MasterEmployee) => {
        onSave(employee);
        setIsModalOpen(false);
    };

    return (
        <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl shadow-black/20">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary-400">Daftar Nama Karyawan</h2>
                <button
                    onClick={handleAddNew}
                    className="bg-accent-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-600 transition-colors flex items-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    <span>Tambah Karyawan Baru</span>
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Nama Lengkap</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Jabatan</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Kontak</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {masterEmployees.length > 0 ? masterEmployees.map((employee) => (
                            <tr key={employee.id} className="hover:bg-gray-700 transition-colors">
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
                                    <button onClick={() => handleEdit(employee)} className="text-primary-400 hover:text-primary-300 mr-4">Edit</button>
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
            
            {isModalOpen && (
                <MasterEmployeeFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    existingEmployee={editingEmployee}
                />
            )}
        </div>
    );
};

export default EmployeeMasterList;
