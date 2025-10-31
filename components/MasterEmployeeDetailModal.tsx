
import React from 'react';
import { MasterEmployee } from '../types';

const formatCurrency = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const DetailRow: React.FC<{ label: string; value: string | number | boolean; isCurrency?: boolean; }> = ({ label, value, isCurrency = false }) => {
    let displayValue: string | number = value;
    if (typeof value === 'boolean') {
        displayValue = value ? 'Ya' : 'Tidak';
    } else if (isCurrency) {
        displayValue = formatCurrency(Number(value));
    }
    
    return (
        <div className="flex justify-between py-2 border-b border-gray-700/50">
            <span className="text-sm text-gray-400">{label}</span>
            <span className={`text-sm font-semibold text-white`}>
                {displayValue}
            </span>
        </div>
    );
};


const MasterEmployeeDetailModal: React.FC<{ employee: MasterEmployee | null; onClose: () => void; }> = ({ employee, onClose }) => {
    
    if (!employee) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-start pt-10 px-4 pb-10 overflow-y-auto animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div>
                    <div className="flex justify-between items-center p-4 border-b border-gray-700">
                        <div>
                            <h2 className="text-lg font-bold text-gray-100">Detail Karyawan</h2>
                            <p className="text-sm text-gray-400">{employee.fullName} ({employee.employeeId})</p>
                        </div>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-6">
                        {/* Personal & Employment Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-900 p-4 rounded-md">
                                <h3 className="font-semibold text-primary-400 mb-2 border-b border-gray-700 pb-2">Informasi Pribadi & Pekerjaan</h3>
                                <div className="space-y-1">
                                    <DetailRow label="Nama Lengkap" value={employee.fullName} />
                                    <DetailRow label="ID Karyawan" value={employee.employeeId} />
                                    <DetailRow label="Jabatan" value={employee.position} />
                                    <DetailRow label="Tanggal Masuk" value={employee.hireDate} />
                                    <DetailRow label="Status Karyawan" value={employee.isActive ? 'Aktif' : 'Tidak Aktif'} />
                                </div>
                            </div>
                             <div className="bg-gray-900 p-4 rounded-md">
                                <h3 className="font-semibold text-primary-400 mb-2 border-b border-gray-700 pb-2">Informasi Kontak</h3>
                                <div className="space-y-1">
                                    <DetailRow label="Email" value={employee.email || '-'} />
                                    <DetailRow label="No. Handphone" value={employee.phone || '-'} />
                                    <DetailRow label="Alamat" value={employee.address || '-'} />
                                </div>
                            </div>
                        </div>

                        {/* Tax & Identity Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-900 p-4 rounded-md">
                                <h3 className="font-semibold text-accent-400 mb-2 border-b border-gray-700 pb-2">Informasi Identitas</h3>
                                <div className="space-y-1">
                                    <DetailRow label="No. KTP" value={employee.ktp} />
                                    <DetailRow label="NPWP" value={employee.npwp || 'Tidak Ada'} />
                                    <DetailRow label="Warga Negara Asing" value={employee.isForeigner} />
                                    {employee.isForeigner && <DetailRow label="No. Paspor" value={employee.passportNumber || '-'} />}
                                </div>
                            </div>

                            <div className="bg-gray-900 p-4 rounded-md">
                                <h3 className="font-semibold text-accent-400 mb-2 border-b border-gray-700 pb-2">Informasi Pajak & Gaji</h3>
                                <div className="space-y-1">
                                     <DetailRow label="Status PTKP" value={employee.ptkpStatus} />
                                    <DetailRow label="Status Pegawai" value={employee.employeeStatus} />
                                    <DetailRow label="Dikenakan PPh 21" value={employee.isPph21Applicable} />
                                    <DetailRow label="Gaji Pokok" value={employee.baseSalary} isCurrency />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-lg flex justify-end items-center space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Tutup</button>
                </div>
            </div>
        </div>
    );
};

export default MasterEmployeeDetailModal;
