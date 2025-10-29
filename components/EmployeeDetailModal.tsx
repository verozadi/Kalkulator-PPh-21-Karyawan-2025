import React, { useRef } from 'react';
import { Employee } from '../types';

declare const html2canvas: any;
declare const jspdf: any;


const formatCurrency = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const DetailRow: React.FC<{ label: string; value: string | number; isCurrency?: boolean; highlight?: boolean }> = ({ label, value, isCurrency = false, highlight = false }) => (
    <div className="flex justify-between py-2 border-b border-gray-700/50">
        <span className="text-sm text-gray-400">{label}</span>
        <span className={`text-sm font-semibold ${highlight ? 'text-accent-400 text-base' : 'text-white'}`}>
            {isCurrency ? formatCurrency(Number(value)) : value}
        </span>
    </div>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


const EmployeeDetailModal: React.FC<{ employee: Employee | null; onClose: () => void; }> = ({ employee, onClose }) => {
    const modalContentRef = useRef<HTMLDivElement>(null);

    const handleDownloadPDF = () => {
        if (!modalContentRef.current || !employee || typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
            alert('Gagal membuat PDF. Harap coba lagi.');
            return;
        }

        html2canvas(modalContentRef.current, {
            useCORS: true,
            backgroundColor: '#1f2937' 
        }).then((canvas: HTMLCanvasElement) => {
            const imgData = canvas.toDataURL('image/png');
            
            const { jsPDF } = jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            
            const ratio = Math.min((pdfWidth - 20) / canvasWidth, (pdfHeight - 20) / canvasHeight);
            
            const imgWidth = canvasWidth * ratio;
            const imgHeight = canvasHeight * ratio;
            
            const x = (pdfWidth - imgWidth) / 2;
            const y = 10;
            
            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
            
            const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
            const filename = `Detail_PPh21_${employee.name.replace(/ /g, '_')}_${months[employee.periodMonth - 1]}_${employee.periodYear}.pdf`;
            
            pdf.save(filename);
        });
    };
    
    if (!employee) return null;
    
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-start pt-10 px-4 pb-10 overflow-y-auto animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div ref={modalContentRef}>
                    <div className="flex justify-between items-center p-4 border-b border-gray-700">
                        <div>
                            <h2 className="text-lg font-bold text-gray-100">Detail Perhitungan PPh 21</h2>
                            <p className="text-sm text-gray-400">{employee.name} - {months[employee.periodMonth - 1]} {employee.periodYear}</p>
                        </div>
                         <button className="p-1 rounded-full text-gray-400 hover:bg-gray-700 invisible">&times;</button>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-400">NPWP:</span><span className="font-mono text-gray-200">{employee.npwp || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Status PTKP:</span><span className="font-semibold text-gray-200">{employee.status}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Status Pegawai:</span><span className="font-semibold text-gray-200">{employee.employeeStatus}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Fasilitas Pajak:</span><span className="font-semibold text-gray-200">{employee.taxFacility}</span></div>
                        </div>

                        {/* Financial Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Penghasilan */}
                            <div className="bg-gray-900 p-4 rounded-md">
                                <h3 className="font-semibold text-primary-400 mb-2 border-b border-gray-700 pb-2">Komponen Penghasilan</h3>
                                <div className="space-y-1">
                                    <DetailRow label="Gaji Pokok" value={employee.baseSalary} isCurrency />
                                    <DetailRow label="Tunjangan PPh" value={employee.tunjanganPph} isCurrency />
                                    <DetailRow label="Tunjangan Jabatan" value={employee.tunjanganJabatan} isCurrency />
                                    <DetailRow label="Tunj. Telekomunikasi" value={employee.tunjanganTelekomunikasi} isCurrency />
                                    <DetailRow label="Tunjangan Makan" value={employee.tunjanganMakan} isCurrency />
                                    <DetailRow label="Tunjangan Transportasi" value={employee.tunjanganTransportasi} isCurrency />
                                    <DetailRow label="Lembur" value={employee.overtimePay} isCurrency />
                                    <DetailRow label="Bonus/THR" value={employee.bonus} isCurrency />
                                    <DetailRow label="Natura/Kenikmatan" value={employee.facilityValue} isCurrency />
                                    <DetailRow label="Total Penghasilan Bruto" value={employee.grossIncome} isCurrency highlight />
                                </div>
                            </div>

                            {/* Pengurangan & Hasil */}
                            <div className="space-y-6">
                                <div className="bg-gray-900 p-4 rounded-md">
                                    <h3 className="font-semibold text-red-400 mb-2 border-b border-gray-700 pb-2">Komponen Pengurangan</h3>
                                    <div className="space-y-1">
                                        <DetailRow label="Biaya Jabatan" value={Math.min(employee.grossIncome * 0.05, 500000)} isCurrency />
                                        <DetailRow label="JHT - Karyawan" value={employee.pensionDeduction} isCurrency />
                                        <DetailRow label="BPJS Kesehatan" value={employee.bpjsDeduction} isCurrency />
                                        <DetailRow label="Pinjaman/Kasbon" value={employee.loan} isCurrency />
                                        <DetailRow label="Potongan Lain" value={employee.otherDeductions} isCurrency />
                                        <DetailRow label="Total Pengurangan Gaji" value={employee.totalDeductions} isCurrency highlight/>
                                    </div>
                                </div>

                                <div className="bg-gray-900 p-4 rounded-md">
                                    <h3 className="font-semibold text-green-400 mb-2 border-b border-gray-700 pb-2">Hasil Perhitungan PPh 21</h3>
                                    <div className="space-y-1">
                                        <DetailRow label="PPh 21 (TER)" value={employee.pph21Monthly} isCurrency />
                                        <DetailRow label="Insentif DTP" value={employee.dtpIncentive} isCurrency />
                                        <DetailRow label="PPh 21 Terpotong" value={employee.finalPPh21Monthly} isCurrency highlight />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-lg flex justify-end items-center space-x-3">
                     <button onClick={handleDownloadPDF} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center space-x-2">
                        <DownloadIcon />
                        <span>Download PDF</span>
                    </button>
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Tutup</button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetailModal;