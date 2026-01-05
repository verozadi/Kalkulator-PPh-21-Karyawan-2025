
import React, { useRef } from 'react';
import { Employee, MasterEmployee, Profile } from '../types';

declare const html2canvas: any;
declare const jspdf: any;

const formatCurrency = (value: number) => {
    // Ensure we handle 0 correctly without returning generic strings if standard formatting is preferred
    if (value === undefined || value === null || isNaN(value)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

interface EmployeeDetailModalProps {
    employee: Employee | null;
    onClose: () => void;
    profile: Profile;
    masterEmployees: MasterEmployee[];
}

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ employee, onClose, profile, masterEmployees }) => {
    const modalContentRef = useRef<HTMLDivElement>(null);

    if (!employee) return null;

    // Retrieve Master Employee Data for consistent ID, Position, Address, Email
    const masterData = masterEmployees.find(m => m.id === employee.masterEmployeeId);

    // --- Data Preparation for Payslip ---
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const periodName = `${months[employee.periodMonth - 1]} ${employee.periodYear}`;

    // 1. EARNINGS (PENDAPATAN) - Filtered > 0
    const rawEarningsList = [
        { label: 'Gaji Pokok', value: employee.baseSalary || 0 },
        { label: 'Tunjangan Jabatan', value: employee.tunjanganJabatan || 0 },
        { label: 'Tunjangan PPh (Gross Up)', value: employee.tunjanganPph || 0 },
        { label: 'Tunjangan Telekomunikasi', value: employee.tunjanganTelekomunikasi || 0 },
        { label: 'Tunjangan Makan', value: employee.tunjanganMakan || 0 },
        { label: 'Tunjangan Transportasi', value: employee.tunjanganTransportasi || 0 },
        { label: 'Lembur / Overtime', value: employee.overtimePay || 0 },
        { label: 'Bonus / THR', value: employee.bonus || 0 },
        { label: 'Natura / Kenikmatan', value: employee.facilityValue || 0 },
    ];

    // Add Custom Allowances
    if (employee.customFixedAllowances && employee.customFixedAllowances.length > 0) {
        employee.customFixedAllowances.forEach(ca => rawEarningsList.push({ label: ca.name, value: ca.value }));
    }
    if (employee.customVariableAllowances && employee.customVariableAllowances.length > 0) {
        employee.customVariableAllowances.forEach(ca => rawEarningsList.push({ label: ca.name, value: ca.value }));
    }

    const earningsList = rawEarningsList.filter(item => item.value > 0);
    const totalGross = employee.grossIncome || 0;

    // 2. DEDUCTIONS (POTONGAN) - Filtered > 0
    const rawDeductionsList = [
        { label: 'PPh 21 (Pajak)', value: employee.finalPPh21Monthly || 0 },
        { label: 'BPJS Kesehatan (1%)', value: employee.bpjsDeduction || 0 },
        { label: 'JHT Karyawan (2%)', value: employee.pensionDeduction || 0 },
        { label: 'JP Karyawan (1%)', value: employee.jpDeduction || 0 },
        { label: 'Pinjaman Karyawan', value: employee.loan || 0 },
        { label: 'Potongan Lainnya', value: employee.otherDeductions || 0 },
    ];

    // Add Custom Deductions
    if (employee.customDeductions && employee.customDeductions.length > 0) {
        employee.customDeductions.forEach(cd => rawDeductionsList.push({ label: cd.name, value: cd.value }));
    }

    const deductionsList = rawDeductionsList.filter(item => item.value > 0);
    // Recalculate distinct cash deduction total for display logic
    const totalDeductionsCash = deductionsList.reduce((sum, item) => sum + item.value, 0);

    // 3. TAKE HOME PAY
    const takeHomePay = totalGross - totalDeductionsCash;

    const handleDownloadPDF = () => {
        if (!modalContentRef.current || typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
            alert('Library PDF belum siap. Silakan tunggu sebentar atau refresh halaman.');
            return;
        }

        const input = modalContentRef.current;
        
        // Clone specific part to ensure clean PDF (ignoring scrollbars etc)
        const slipElement = input.querySelector('#payslip-content') as HTMLElement;
        if(!slipElement) return;

        html2canvas(slipElement, { 
            scale: 2, // Higher quality
            backgroundColor: '#ffffff',
            useCORS: true,
            windowWidth: slipElement.scrollWidth,
            windowHeight: slipElement.scrollHeight
        }).then((canvas: any) => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = jspdf;
            
            // Calculate dimensions to match content exactly
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            
            // Convert pixels to mm (approx 1px = 0.264583 mm)
            const mmWidth = imgWidth * 0.264583 / 2; // dividing by 2 because scale is 2
            const mmHeight = imgHeight * 0.264583 / 2;

            // Create PDF with custom size based on content
            const pdf = new jsPDF({
                orientation: mmWidth > mmHeight ? 'l' : 'p',
                unit: 'mm',
                format: [mmWidth, mmHeight]
            });
            
            pdf.addImage(imgData, 'PNG', 0, 0, mmWidth, mmHeight);
            pdf.save(`Slip_Gaji_${(employee.name || 'Emp').replace(/\s+/g, '_')}_${employee.periodMonth}_${employee.periodYear}.pdf`);
        }).catch((err: any) => {
            console.error("Error generating PDF:", err);
            alert("Gagal membuat PDF.");
        });
    };

    const handleDownloadPNG = () => {
        if (!modalContentRef.current || typeof html2canvas === 'undefined') {
            alert('Library gambar belum siap.');
            return;
        }

        const input = modalContentRef.current;
        const slipElement = input.querySelector('#payslip-content') as HTMLElement;
        if(!slipElement) return;

        html2canvas(slipElement, { 
            scale: 3, 
            backgroundColor: '#ffffff',
            useCORS: true 
        }).then((canvas: any) => {
            const link = document.createElement('a');
            link.download = `Slip_Gaji_${(employee.name || 'Emp').replace(/\s+/g, '_')}.png`;
            link.href = canvas.toDataURL();
            link.click();
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl w-full max-w-4xl flex flex-col max-h-[95vh] animate-fade-in-up" onClick={e => e.stopPropagation()}>
                
                {/* Header Toolbar */}
                <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900 rounded-t-lg">
                    <h2 className="text-lg font-bold text-gray-100">Detail Slip Gaji</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={handleDownloadPNG} className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-lg">
                            <ImageIcon /> Download PNG
                        </button>
                        <button onClick={handleDownloadPDF} className="px-4 py-2 text-sm font-bold text-white bg-green-600 rounded hover:bg-green-700 flex items-center gap-2 transition-colors shadow-lg">
                            <DownloadIcon /> Download PDF
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* Slip Gaji Content Area (Scrollable Wrapper) */}
                <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-800" ref={modalContentRef}>
                    
                    {/* The Actual Payslip (White Paper Look) */}
                    {/* Added 'w-fit' and 'inline-block' to force wrapper to shrink-wrap content for accurate html2canvas capture */}
                    <div className="w-full flex justify-center">
                        <div id="payslip-content" className="bg-white text-gray-800 p-8 md:p-10 rounded-sm shadow-xl w-full max-w-4xl mx-auto font-sans relative">
                            
                            {/* 1. Header Slip */}
                            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
                                {/* Left Side: Logo & Company Info */}
                                <div className="flex items-start gap-4">
                                    {profile.logoUrl && (
                                        <img src={profile.logoUrl} alt="Company Logo" className="h-16 w-16 object-contain" />
                                    )}
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 uppercase leading-tight">{profile.companyName || 'Nama Perusahaan'}</h3>
                                        <p className="text-xs text-gray-500 mt-1 max-w-[280px] leading-snug">
                                            {profile.companyAddress || 'Alamat Perusahaan belum diisi'}
                                        </p>
                                    </div>
                                </div>

                                {/* Right Side: Slip Title & Period */}
                                <div className="text-right">
                                    <h1 className="text-3xl font-extrabold uppercase tracking-wide text-gray-900">SLIP GAJI</h1>
                                    <p className="text-sm font-semibold text-gray-600 mt-1 uppercase">Periode: {periodName}</p>
                                </div>
                            </div>

                            {/* 2. Employee Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-8 text-sm">
                                <div className="space-y-1">
                                    <div className="flex justify-between border-b border-gray-200 py-1">
                                        <span className="text-gray-500">Nama Karyawan</span>
                                        <span className="font-bold text-gray-900 uppercase">{employee.name || '-'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 py-1">
                                        <span className="text-gray-500">Jabatan</span>
                                        <span className="font-medium text-gray-900">{masterData?.position || employee.position || '-'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 py-1">
                                        <span className="text-gray-500">ID Karyawan</span>
                                        <span className="font-medium text-gray-900">{masterData?.employeeId || employee.masterEmployeeId}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 py-1">
                                        <span className="text-gray-500">NPWP / NIK</span>
                                        <span className="font-mono text-gray-900">{employee.npwp || '-'}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between border-b border-gray-200 py-1">
                                        <span className="text-gray-500">Status / PTKP</span>
                                        <span className="font-medium text-gray-900">{employee.employeeStatus} ({employee.status})</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 py-1">
                                        <span className="text-gray-500">Fasilitas Pajak</span>
                                        <span className="font-medium text-gray-900 truncate max-w-[150px]">{employee.taxFacility !== 'Tanpa Fasilitas' ? 'Ya (SKB/DTP)' : 'Standar'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 py-1">
                                        <span className="text-gray-500">Alamat</span>
                                        <span className="font-medium text-gray-900 truncate max-w-[180px]">{masterData?.address || employee.address || '-'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 py-1">
                                        <span className="text-gray-500">Email</span>
                                        <span className="font-medium text-gray-900">{masterData?.email || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Financial Details (Columns) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                
                                {/* Earnings Column */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b-2 border-gray-300 pb-2 mb-3">Penerimaan (Earnings)</h4>
                                    <div className="space-y-2">
                                        {earningsList.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm items-center">
                                                <span className="text-gray-600">{item.label}</span>
                                                <span className="font-medium text-gray-800">
                                                    {formatCurrency(item.value)}
                                                </span>
                                            </div>
                                        ))}
                                        {earningsList.length === 0 && <p className="text-xs text-gray-400 italic">Tidak ada pendapatan.</p>}
                                    </div>
                                    <div className="mt-4 pt-3 border-t-2 border-gray-200 flex justify-between items-center bg-blue-50 px-3 py-2 rounded">
                                        <span className="font-bold text-gray-800 text-sm">Total Bruto</span>
                                        <span className="font-bold text-blue-900">{formatCurrency(totalGross)}</span>
                                    </div>
                                </div>

                                {/* Deductions Column */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b-2 border-gray-300 pb-2 mb-3">Potongan (Deductions)</h4>
                                    <div className="space-y-2">
                                        {deductionsList.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm items-center">
                                                <span className="text-gray-600">{item.label}</span>
                                                <span className="font-medium text-red-600">
                                                    ({formatCurrency(item.value)})
                                                </span>
                                            </div>
                                        ))}
                                        {deductionsList.length === 0 && <p className="text-xs text-gray-400 italic">Tidak ada potongan.</p>}
                                    </div>
                                    <div className="mt-4 pt-3 border-t-2 border-gray-200 flex justify-between items-center bg-red-50 px-3 py-2 rounded">
                                        <span className="font-bold text-gray-800 text-sm">Total Potongan</span>
                                        <span className="font-bold text-red-700">({formatCurrency(totalDeductionsCash)})</span>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Take Home Pay (Highlighted) */}
                            <div className="bg-gray-900 text-white rounded-lg p-6 flex flex-col md:flex-row justify-between items-center shadow-lg print:bg-black">
                                <div className="mb-2 md:mb-0">
                                    <span className="block text-xs text-gray-400 uppercase tracking-widest font-bold">Gaji Bersih Diterima</span>
                                    <span className="block text-2xl font-extrabold uppercase">Take Home Pay</span>
                                </div>
                                <div className="text-4xl font-black tracking-tight text-white">
                                    {formatCurrency(takeHomePay)}
                                </div>
                            </div>

                            {/* 5. Footer / Disclaimer */}
                            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-end">
                                <div className="text-left">
                                    <p className="text-xs text-gray-400 italic mb-1">
                                        Dokumen ini dibuat secara otomatis oleh sistem dan sah tanpa tanda tangan basah.
                                    </p>
                                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Powered by VerozTax App</p>
                                </div>
                                <div className="text-right text-xs text-gray-600">
                                    <p className="mb-4">Dibuat oleh,</p>
                                    <p className="font-bold uppercase text-gray-900 mt-8">{profile.contactName || 'Admin'}</p>
                                    {profile.contactPosition && <p className="text-[10px]">{profile.contactPosition}</p>}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetailModal;
