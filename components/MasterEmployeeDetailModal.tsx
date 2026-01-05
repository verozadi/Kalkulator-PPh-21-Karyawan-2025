
import React from 'react';
import { MasterEmployee } from '../types';

const formatCurrency = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const DetailRow: React.FC<{ label: string; value: string | number | boolean; isCurrency?: boolean; }> = ({ label, value, isCurrency = false }) => {
    let displayValue: string | number = '';
    if (typeof value === 'boolean') {
        displayValue = value ? 'Ya' : 'Tidak';
    } else if (isCurrency) {
        displayValue = formatCurrency(Number(value));
    } else {
        displayValue = value as string | number;
    }
    
    return (
        <div className="flex justify-between py-2 border-b border-gray-700/50">
            <span className="text-sm text-gray-400">{label}</span>
            <span className={`text-sm font-semibold text-white text-right ml-4`}>
                {displayValue}
            </span>
        </div>
    );
};


const MasterEmployeeDetailModal: React.FC<{ employee: MasterEmployee | null; onClose: () => void; }> = ({ employee, onClose }) => {
    
    if (!employee) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            {/* Added 'my-auto' and max-height logic to ensure it centers and scrolls properly */}
            <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-700 bg-gray-800 rounded-t-lg">
                    <div>
                        <h2 className="text-xl font-bold text-gray-100">Detail Karyawan</h2>
                        <p className="text-sm text-gray-400 mt-1">{employee.fullName} <span className="text-gray-600">|</span> <span className="font-mono text-primary-400">{employee.employeeId}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                    {/* Personal & Employment Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                            <h3 className="font-bold text-primary-400 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                Informasi Pribadi & Pekerjaan
                            </h3>
                            <div className="space-y-1">
                                <DetailRow label="Nama Lengkap" value={employee.fullName} />
                                <DetailRow label="ID Karyawan" value={employee.employeeId} />
                                <DetailRow label="Jenis Kelamin" value={employee.gender} />
                                <DetailRow label="Jabatan" value={employee.position} />
                                <DetailRow label="Tanggal Masuk" value={employee.hireDate} />
                                <DetailRow label="Status Karyawan" value={employee.isActive ? 'Aktif' : 'Tidak Aktif'} />
                            </div>
                        </div>
                         <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                            <h3 className="font-bold text-primary-400 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                                Informasi Kontak
                            </h3>
                            <div className="space-y-1">
                                <DetailRow label="Email" value={employee.email || '-'} />
                                <DetailRow label="No. Handphone" value={employee.phone || '-'} />
                                <DetailRow label="Alamat" value={employee.address || '-'} />
                            </div>
                        </div>
                    </div>

                    {/* Tax & Identity Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                            <h3 className="font-bold text-accent-400 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                Informasi Identitas
                            </h3>
                            <div className="space-y-1">
                                <DetailRow label="No. KTP" value={employee.ktp} />
                                <DetailRow label="NPWP" value={employee.npwp || 'Tidak Ada'} />
                                <DetailRow label="Warga Negara Asing" value={employee.isForeigner} />
                                {employee.isForeigner && (
                                    <>
                                        <DetailRow label="Kode Negara" value={employee.countryCode || '-'} />
                                        <DetailRow label="No. Paspor" value={employee.passportNumber || '-'} />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                            <h3 className="font-bold text-accent-400 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.312-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.312.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" /></svg>
                                Informasi Pajak & Gaji
                            </h3>
                            <div className="space-y-1">
                                 <DetailRow label="Status PTKP" value={employee.ptkpStatus} />
                                <DetailRow label="Status Pegawai" value={employee.employeeStatus} />
                                <DetailRow label="Dikenakan PPh 21" value={employee.isPph21Applicable} />
                                <DetailRow label="Gaji Pokok" value={employee.baseSalary} isCurrency />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-lg flex justify-end items-center">
                    <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-900/50">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MasterEmployeeDetailModal;
