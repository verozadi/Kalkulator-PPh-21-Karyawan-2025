import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Employee, EmployeeData, MasterEmployee, Profile, MaritalStatus, CalculationType } from '../types';
import { PTKP_RATES } from '../constants';
import { calculatePasal17 } from '../services/taxCalculator';
import { getAvailableTaxYears } from '../constants';

interface EmployeeFormProps {
    onSave: (data: EmployeeData) => Promise<void> | void;
    existingEmployee: Employee | null;
    onCancel: () => void;
    profile: Profile;
    masterEmployees: MasterEmployee[];
    showNotification: (message: string, type: 'success' | 'error') => void;
    fixedType: CalculationType;
    employees?: Employee[]; // Added to access monthly data
}

const ANNUAL_TAX_OBJECTS = [
    { code: '21-100-01', name: 'Pegawai Tetap' },
    { code: '21-100-02', name: 'Penerima Pensiun Berkala' },
    { code: '21-100-32', name: 'Penghasilan yang diterima atau Diperoleh oleh Pegawai tetap yang menerima fasilitas di daerah tertentu' },
];

const formatNumberForDisplay = (num: number): string => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    return new Intl.NumberFormat('id-ID').format(num);
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const parseFormattedNumber = (str: string): number => {
    if (typeof str !== 'string') return 0;
    return parseInt(str.replace(/[^0-9-]/g, ''), 10) || 0;
};

// --- Custom Internal Components ---

const FormLabel: React.FC<{ children: React.ReactNode, required?: boolean, info?: string }> = ({ children, required, info }) => (
    <label className="block text-[12px] font-semibold text-gray-400 mb-1 flex items-center">
        {children} {required && <span className="text-red-500 ml-0.5">*</span>}
        {info && (
            <span className="ml-1.5 text-gray-500 cursor-help group relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-[10px] rounded shadow-xl border border-gray-700 z-50">
                    {info}
                </div>
            </span>
        )}
    </label>
);

const FormInput = ({ value, onChange, name, readOnly, placeholder, className = "", type = "text" }: any) => (
    <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded text-sm focus:outline-none focus:border-primary-500 transition-colors border ${readOnly ? 'bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-700 border-gray-600 text-gray-200'} ${className}`}
    />
);

const FormSelect = ({ value, onChange, name, children, className = "", disabled = false }: any) => (
    <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200 text-sm focus:outline-none focus:border-primary-500 appearance-none transition-colors [&>option]:bg-gray-800 [&>option]:text-gray-200 ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-900 border-gray-800 text-gray-500' : ''} ${className}`}
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
    >
        {children}
    </select>
);

const SearchableEmployeeSelect: React.FC<{ 
    masterEmployees: MasterEmployee[], 
    value: string, 
    onSelect: (empId: string) => void 
}> = ({ masterEmployees, value, onSelect }) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    const selectedEmployee = React.useMemo(() => masterEmployees.find(e => e.id === value), [value, masterEmployees]);

    React.useEffect(() => {
        if (selectedEmployee) {
            setSearchTerm(selectedEmployee.fullName);
        } else {
            setSearchTerm('');
        }
    }, [selectedEmployee]);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm(selectedEmployee?.fullName || '');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedEmployee]);

    const filteredEmployees = React.useMemo(() => {
        if (searchTerm.length < 2) return masterEmployees;
        
        return masterEmployees.filter(e => 
            e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            e.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, masterEmployees]);

    return (
        <div className="relative" ref={wrapperRef}>
            <FormLabel required>Nama Karyawan</FormLabel>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder="Ketik min. 2 huruf atau pilih..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200 text-sm focus:outline-none focus:border-primary-500 transition-colors"
            />
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                    {filteredEmployees.length > 0 ? (
                        filteredEmployees.map(emp => (
                            <button
                                key={emp.id}
                                type="button"
                                onClick={() => {
                                    onSelect(emp.id);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-primary-600 hover:text-white transition-colors border-b border-gray-600 last:border-0"
                            >
                                <div className="font-bold">{emp.fullName}</div>
                                <div className="text-xs opacity-70">{emp.employeeId} - {emp.position}</div>
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 italic">Tidak ada karyawan ditemukan.</div>
                    )}
                </div>
            )}
        </div>
    );
};

const FormSectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-base font-bold text-gray-100 mb-4 pb-2 border-b border-gray-600">{children}</h3>
);

// New Component for Auto Calc Button
const AutoCalcButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button 
        type="button" 
        onClick={onClick} 
        className="px-3 py-2 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/50 rounded transition-colors flex items-center justify-center group"
        title="Hitung Otomatis dari Data Bulanan (Jan-Des)"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    </button>
);

const SpinnerIcon = () => <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

// Matching Sidebar: CalculatorIcon
const CalculatorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary-400"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const ReadOnlyBox: React.FC<{ label: string, value: string | number, className?: string }> = ({ label, value, className = "" }) => (
    <div className={`flex flex-col ${className}`}>
        <FormLabel>{label}</FormLabel>
        <div className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded text-gray-400 text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap">
            {value}
        </div>
    </div>
);

const EmployeeForm3: React.FC<EmployeeFormProps> = ({ 
    onSave, existingEmployee, onCancel, profile, masterEmployees, showNotification, fixedType, employees = []
}) => {
    // ... [State management and calculation logic remains the same] ...
    
    const [formData, setFormData] = React.useState<Omit<EmployeeData, 'id'>>({
        masterEmployeeId: '',
        calculationType: 'annual',
        name: '', npwp: '', address: '',
        status: MaritalStatus.TK0,
        employeeStatus: 'Pegawai Tetap',
        gender: 'Laki-Laki',
        position: '',
        isForeigner: false,
        periodYear: new Date().getFullYear(),
        periodMonth: 12,
        // Income Fields
        baseSalary: 0, 
        tunjanganPph: 0, 
        tunjanganJabatan: 0, 
        honorarium: 0, 
        insurancePremi: 0,
        facilityValue: 0,
        bonus: 0,
        // Deductions
        pensionDeduction: 0, 
        jpDeduction: 0, 
        zakatDeduction: 0,
        
        netIncomePrevious: 0, 
        isGrossUp: false,
        taxFacility: 'Tanpa Fasilitas',
        taxObjectName: 'Pegawai Tetap',
        taxObjectCode: '21-100-01',
        signerIdentity: 'NPWP',
        pph21PaidPreviously: 0, 
        jenisPemotongan: 'Setahun penuh',
        tanggalPemotongan: new Date().toISOString().split('T')[0],
        taxPeriodStart: 1,
        taxPeriodEnd: 12,
        previousTaxReceiptNumber: '',
        manualNetIncomeCalc: 0,
        manualPph21Pkp: 0,
        manualPph21KurangBayar: 0,
        manualPph21Dtp: 0,
        tunjanganTelekomunikasi: 0, tunjanganMakan: 0, tunjanganTransportasi: 0, overtimePay: 0,
        customFixedAllowances: [], customVariableAllowances: [], customDeductions: [],
        loan: 0, otherDeductions: 0, bpjsDeduction: 0,
    });

    const [calc, setCalc] = React.useState({
        totalBruto: 0, biayaJabatan: 0, totalPengurangan: 0,
        neto: 0, netoSetahun: 0, ptkp: 0, pkp: 0,
        pph21Setahun: 0, pph21Terutang: 0, pph21TerutangBupot: 0,
        pph21Dtp: 0, pph21KurangBayar: 0
    });

    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (existingEmployee) {
            setFormData({
                ...existingEmployee,
                jenisPemotongan: existingEmployee.jenisPemotongan || 'Setahun penuh',
                tanggalPemotongan: existingEmployee.tanggalPemotongan || new Date().toISOString().split('T')[0],
                taxPeriodStart: existingEmployee.taxPeriodStart || 1,
                taxPeriodEnd: existingEmployee.taxPeriodEnd || 12,
                netIncomePrevious: existingEmployee.netIncomePrevious || 0,
                insurancePremi: existingEmployee.insurancePremi || 0,
                honorarium: existingEmployee.honorarium || 0,
                manualNetIncomeCalc: existingEmployee.manualNetIncomeCalc || 0,
                manualPph21Pkp: existingEmployee.manualPph21Pkp || 0,
                manualPph21KurangBayar: existingEmployee.taxUnderOverPayment || 0,
                manualPph21Dtp: existingEmployee.dtpIncentive || 0,
            });
            setCalc({
                totalBruto: existingEmployee.grossIncome,
                biayaJabatan: existingEmployee.grossIncome - existingEmployee.netIncomeForTax - (existingEmployee.pensionDeduction + existingEmployee.jpDeduction + (existingEmployee.zakatDeduction || 0)),
                totalPengurangan: existingEmployee.totalDeductions,
                neto: existingEmployee.grossIncome - existingEmployee.totalDeductions,
                netoSetahun: existingEmployee.netIncomeForTax,
                ptkp: existingEmployee.ptkp,
                pkp: existingEmployee.pkpYearly,
                pph21Setahun: existingEmployee.pph21Yearly,
                pph21Terutang: existingEmployee.pph21Terutang || existingEmployee.pph21Yearly,
                pph21TerutangBupot: existingEmployee.pph21Monthly,
                pph21Dtp: existingEmployee.dtpIncentive,
                pph21KurangBayar: existingEmployee.taxUnderOverPayment || 0
            });
        }
    }, [existingEmployee]);

    React.useEffect(() => {
        const {
            baseSalary, tunjanganJabatan, honorarium, insurancePremi, facilityValue, bonus,
            pensionDeduction, jpDeduction, zakatDeduction, netIncomePrevious,
            status, isGrossUp, pph21PaidPreviously, taxFacility, manualPph21Dtp,
            taxPeriodStart, taxPeriodEnd, jenisPemotongan
        } = formData;

        const grossNoTax = baseSalary + tunjanganJabatan + honorarium + insurancePremi + facilityValue + bonus;
        let calculatedTunjanganPph = 0;
        const startMonth = taxPeriodStart || 1;
        const endMonth = taxPeriodEnd || 12;
        const durationMonths = Math.max(1, (endMonth - startMonth) + 1);
        const maxBiayaJabatan = durationMonths * 500000;

        if (isGrossUp) {
            let currentTax = 0;
            for (let i = 0; i < 15; i++) {
                const tempGross = grossNoTax + currentTax;
                const tempBiayaJabatan = Math.min(tempGross * 0.05, maxBiayaJabatan); 
                const tempNeto = tempGross - tempBiayaJabatan - pensionDeduction - jpDeduction - zakatDeduction;
                const tempPkp = Math.max(0, Math.floor((tempNeto - (PTKP_RATES[status] || 54000000)) / 1000) * 1000);
                const tempTax = calculatePasal17(tempPkp);
                
                if (Math.abs(tempTax - currentTax) < 100) {
                    currentTax = tempTax;
                    break;
                }
                currentTax = tempTax;
            }
            calculatedTunjanganPph = Math.round(currentTax);
        }

        const finalTunjanganPph = isGrossUp ? calculatedTunjanganPph : (formData.tunjanganPph || 0);
        const totalBruto = grossNoTax + finalTunjanganPph;
        const biayaJabatan = Math.min(totalBruto * 0.05, maxBiayaJabatan);
        const totalPengurangan = biayaJabatan + pensionDeduction + jpDeduction + zakatDeduction;
        const neto = totalBruto - totalPengurangan;
        let netoSetahun = 0;
        const currentTotalNeto = neto + netIncomePrevious;

        if (jenisPemotongan === 'Disetahunkan') {
            netoSetahun = (currentTotalNeto / durationMonths) * 12;
        } else {
            netoSetahun = currentTotalNeto;
        }

        const ptkp = PTKP_RATES[status] || 54000000;
        let pkp = Math.max(0, Math.floor((netoSetahun - ptkp) / 1000) * 1000);
        let pph21Setahun = calculatePasal17(pkp);
        let pph21Terutang = pph21Setahun;
        
        if (jenisPemotongan === 'Disetahunkan') {
             pph21Terutang = (pph21Setahun / 12) * durationMonths;
        }

        const pph21TerutangBupot = Math.max(0, pph21Terutang - pph21PaidPreviously);
        let pph21Dtp = 0;
        if (taxFacility === 'PPh Ditanggung Pemerintah (DTP)') {
            let autoDtp = 0;
            const annualizedGross = (totalBruto / durationMonths) * 12;
            if ((annualizedGross / 12) <= 10000000) {
                autoDtp = pph21TerutangBupot;
            }
            if (manualPph21Dtp !== undefined && manualPph21Dtp !== null) {
                pph21Dtp = manualPph21Dtp;
            } else {
                pph21Dtp = autoDtp;
            }
        } 

        let pph21KurangBayar = pph21TerutangBupot - pph21Dtp;

        if (taxFacility === 'Fasilitas Lainnya') {
            if (formData.manualNetIncomeCalc) {
                netoSetahun = formData.manualNetIncomeCalc;
                pkp = Math.max(0, Math.floor((netoSetahun - ptkp) / 1000) * 1000);
            }
            if (formData.manualPph21Pkp) {
                pph21Setahun = formData.manualPph21Pkp;
                pph21Terutang = pph21Setahun; 
            }
            if (formData.manualPph21KurangBayar) {
                pph21KurangBayar = formData.manualPph21KurangBayar;
            }
        }

        setCalc(prev => {
            if (
                prev.totalBruto !== totalBruto ||
                prev.pph21KurangBayar !== pph21KurangBayar ||
                prev.netoSetahun !== netoSetahun
            ) {
                return {
                    totalBruto, biayaJabatan, totalPengurangan, neto, netoSetahun, ptkp, pkp,
                    pph21Setahun, pph21Terutang, pph21TerutangBupot, pph21Dtp, pph21KurangBayar
                };
            }
            return prev;
        });

        if (isGrossUp && formData.tunjanganPph !== calculatedTunjanganPph) {
            setFormData(prev => ({ ...prev, tunjanganPph: calculatedTunjanganPph }));
        }

    }, [formData]);

    const handleEmployeeSelect = (empId: string) => {
        const master = masterEmployees.find(m => m.id === empId);
        if (master) {
            setFormData(prev => ({
                ...prev,
                masterEmployeeId: empId,
                name: master.fullName,
                npwp: master.npwp,
                address: master.address,
                status: master.ptkpStatus,
                isForeigner: master.isForeigner,
                gender: master.gender,
                position: master.position,
                baseSalary: master.baseSalary * 12,
                tunjanganJabatan: (master.positionAllowance || 0) * 12
            }));
        }
    };

    // --- AUTO CALCULATION LOGIC ---
    const calculateFromMonthly = (type: 'salary' | 'allowance' | 'bonus' | 'natura' | 'pension' | 'zakat') => {
        if (!formData.masterEmployeeId) {
            showNotification('Pilih karyawan terlebih dahulu.', 'error');
            return;
        }

        // Ensure robust filtering: force conversion to Number for year check
        const monthlyRecords = employees.filter(e =>
            e.masterEmployeeId === formData.masterEmployeeId &&
            Number(e.periodYear) === Number(formData.periodYear) &&
            e.calculationType === 'monthly'
        );

        if (monthlyRecords.length === 0) {
            showNotification(`Data Bulanan belum ditemukan untuk karyawan ini di tahun ${formData.periodYear}. Pastikan Anda sudah membuat perhitungan bulanan (Jan-Des) terlebih dahulu.`, 'error');
            return;
        }

        let total = 0;
        monthlyRecords.forEach(rec => {
            switch (type) {
                case 'salary':
                    // Gaji/Pensiun/THT Berkala (Total Gaji Pokok)
                    total += rec.baseSalary || 0;
                    break;
                case 'allowance':
                    // Tunjangan Lainnya, Uang Lembur, dsb
                    // (Total Tunjangan Tetap + sebagian Tunjangan Tidak Tetap kecuali Tunjangan PPh 21 + Natura/Kenikmatan + THR/Bonus)
                    
                    // Fixed Allowances
                    total += (rec.tunjanganJabatan || 0) +
                             (rec.tunjanganTelekomunikasi || 0) +
                             (rec.customFixedAllowances || []).reduce((s, i) => s + i.value, 0);
                    
                    // Variable Allowances (excluding Bonus & Natura)
                    total += (rec.tunjanganMakan || 0) +
                             (rec.tunjanganTransportasi || 0) +
                             (rec.overtimePay || 0) + 
                             (rec.customVariableAllowances || []).reduce((s, i) => s + i.value, 0);
                    break;
                case 'bonus':
                    // Tantiem, Bonus, THR (Total THR/Bonus)
                    total += rec.bonus || 0;
                    break;
                case 'natura':
                    // Natura & Kenikmatan (Total Natura/Kenikmatan)
                    total += rec.facilityValue || 0;
                    break;
                case 'pension':
                    // Iuran Pensiun / THT / JHT (Total JHT - Karyawan (2%) + JP - Karyawan (1%))
                    total += (rec.pensionDeduction || 0) + (rec.jpDeduction || 0);
                    break;
                case 'zakat':
                    // Zakat / Sumbangan Keagamaan Wajib
                    total += rec.zakatDeduction || 0;
                    break;
            }
        });

        // Map to form state keys
        const fieldName = type === 'salary' ? 'baseSalary' :
                          type === 'allowance' ? 'tunjanganJabatan' :
                          type === 'bonus' ? 'bonus' :
                          type === 'natura' ? 'facilityValue' :
                          type === 'pension' ? 'pensionDeduction' : 
                          'zakatDeduction';

        // NOTE: For 'pension', we are summing into 'pensionDeduction' in A1 logic as the aggregate field.
        
        setFormData(prev => ({ ...prev, [fieldName]: total }));
        showNotification(`Berhasil menarik data dari ${monthlyRecords.length} bulan transaksi.`, 'success');
    };

    const handleUpdateFromMaster = () => {
        if (!formData.masterEmployeeId) {
            showNotification('Pilih karyawan terlebih dahulu.', 'error');
            return;
        }
        const master = masterEmployees.find(m => m.id === formData.masterEmployeeId);
        if (master) {
            setFormData(prev => ({
                ...prev,
                name: master.fullName,
                npwp: master.npwp,
                address: master.address,
                status: master.ptkpStatus,
                isForeigner: master.isForeigner,
                gender: master.gender,
                position: master.position,
                baseSalary: master.baseSalary * 12, 
                tunjanganJabatan: (master.positionAllowance || 0) * 12,
            }));
            showNotification('Data identitas dan gaji berhasil diperbarui dari Master Karyawan.', 'success');
        } else {
            showNotification('Data Master Karyawan tidak ditemukan.', 'error');
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        const numericFields = [
            'baseSalary', 'tunjanganPph', 'tunjanganJabatan', 'honorarium', 
            'insurancePremi', 'facilityValue', 'bonus', 
            'pensionDeduction', 'jpDeduction', 'zakatDeduction', 
            'netIncomePrevious', 'pph21PaidPreviously',
            'manualNetIncomeCalc', 'manualPph21Pkp', 'manualPph21KurangBayar', 'manualPph21Dtp',
            'periodYear', 'taxPeriodStart', 'taxPeriodEnd'
        ];
        
        if (name === 'jenisPemotongan') {
            const isFullYear = value === 'Setahun penuh';
            setFormData(prev => ({
                ...prev,
                jenisPemotongan: value,
                taxPeriodStart: isFullYear ? 1 : prev.taxPeriodStart,
                taxPeriodEnd: isFullYear ? 12 : prev.taxPeriodEnd,
                previousTaxReceiptNumber: isFullYear ? '' : prev.previousTaxReceiptNumber
            }));
            return;
        }

        if (name === 'taxObjectName') {
            const selectedObj = ANNUAL_TAX_OBJECTS.find(obj => obj.name === value);
            setFormData(prev => ({ 
                ...prev, 
                [name]: value,
                taxObjectCode: selectedObj ? selectedObj.code : prev.taxObjectCode
            }));
        } else if (name === 'isGrossUp') {
            setFormData(prev => ({ ...prev, [name]: value === 'true' }));
        } else if (numericFields.includes(name)) {
            setFormData(prev => ({ ...prev, [name]: parseFormattedNumber(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const fullEmployee: Employee = { 
                id: existingEmployee?.id || uuidv4(), 
                ...formData,
                grossIncome: calc.totalBruto,
                totalDeductions: calc.totalPengurangan,
                netIncomeForTax: calc.netoSetahun,
                ptkp: calc.ptkp,
                pkpYearly: calc.pkp,
                pph21Yearly: calc.pph21Setahun,
                pph21Terutang: calc.pph21Terutang,
                pph21Monthly: calc.pph21TerutangBupot,
                dtpIncentive: calc.pph21Dtp,
                finalPPh21Monthly: calc.pph21KurangBayar,
                taxUnderOverPayment: calc.pph21KurangBayar,
                paymentStatus: existingEmployee?.paymentStatus || 'Unpaid'
            };
            await onSave(fullEmployee); 
        } finally {
            setIsSaving(false);
        }
    };

    const periodOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const isFasilitasLainnya = formData.taxFacility === 'Fasilitas Lainnya';
    const isDtp = formData.taxFacility === 'PPh Ditanggung Pemerintah (DTP)';
    const showPreviousBupot = formData.jenisPemotongan === 'Disetahunkan' || formData.jenisPemotongan === 'Kurang dari setahun';

    return (
        <div className="max-w-[1400px] mx-auto pb-10 animate-fade-in-up">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <div className="flex items-center space-x-2">
                        <CalculatorIcon />
                        <h1 className="text-2xl font-bold text-gray-100">PPh 21 Tahunan 1721-A1</h1>
                    </div>
                    <p className="text-sm text-gray-400">Pemotongan Pajak Penghasilan Pasal 21 Tahunan (Final Year).</p>
                </div>
                <button 
                    type="button"
                    onClick={handleUpdateFromMaster}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600/60 hover:bg-blue-600 text-blue-100 text-sm font-medium rounded border border-blue-500 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    <span>Update Data Master</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                
                {/* --- KOTAK ATAS: Identitas (Updated Layout) --- */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 shadow-md">
                    <FormSectionHeader>Identitas Penerima Penghasilan</FormSectionHeader>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4">
                        <div className="md:col-span-8">
                            <SearchableEmployeeSelect masterEmployees={masterEmployees} value={formData.masterEmployeeId} onSelect={handleEmployeeSelect} />
                        </div>
                        <div className="md:col-span-4">
                            <FormLabel>Gross Up</FormLabel>
                            <FormSelect name="isGrossUp" value={String(formData.isGrossUp)} onChange={handleChange}>
                                <option value="false">Tidak</option>
                                <option value="true">Ya</option>
                            </FormSelect>
                        </div>

                        {/* Read-Only Identity Fields in Boxes */}
                        <div className="md:col-span-4">
                            <ReadOnlyBox label="NPWP / NIK" value={formData.npwp || '-'} />
                        </div>
                        <div className="md:col-span-4">
                            <ReadOnlyBox label="Status PTKP" value={formData.status ? `${formData.status} - ${formatCurrency(PTKP_RATES[formData.status])}` : '-'} />
                        </div>
                        <div className="md:col-span-4">
                            <ReadOnlyBox label="Jenis Kelamin" value={formData.gender || '-'} />
                        </div>

                        <div className="md:col-span-6">
                            <ReadOnlyBox label="Jabatan" value={formData.position || '-'} />
                        </div>
                        <div className="md:col-span-6">
                            <ReadOnlyBox label="Alamat" value={formData.address || '-'} />
                        </div>
                    </div>
                </div>

                {/* --- KOTAK TENGAH --- */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    
                    {/* Left Side: Settings */}
                    <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-lg p-5 shadow-md h-fit">
                        <FormSectionHeader>Rincian & Pengaturan</FormSectionHeader>
                        <div className="space-y-4">
                            <div>
                                <FormLabel required>Jenis Pemotongan</FormLabel>
                                <FormSelect name="jenisPemotongan" value={formData.jenisPemotongan} onChange={handleChange}>
                                    <option value="Setahun penuh">Setahun penuh</option>
                                    <option value="Disetahunkan">Disetahunkan</option>
                                    <option value="Kurang dari setahun">Kurang dari setahun</option>
                                </FormSelect>
                            </div>
                            
                            {showPreviousBupot && (
                                <div className="animate-fade-in">
                                    <FormLabel>Nomor Bupot Sebelumnya</FormLabel>
                                    <FormInput 
                                        name="previousTaxReceiptNumber" 
                                        value={formData.previousTaxReceiptNumber || ''} 
                                        onChange={handleChange} 
                                        placeholder="Nomor Bukti Potong..."
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <FormLabel required>Tanggal Pemotongan</FormLabel>
                                    <FormInput type="date" name="tanggalPemotongan" value={formData.tanggalPemotongan} onChange={handleChange} />
                                </div>
                                <div>
                                    <FormLabel required>Tahun Pajak</FormLabel>
                                    <FormSelect name="periodYear" value={formData.periodYear} onChange={handleChange}>
                                        {getAvailableTaxYears().map(y => <option key={y} value={y}>{y}</option>)}
                                    </FormSelect>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <FormLabel required>Masa Awal</FormLabel>
                                    <FormSelect 
                                        name="taxPeriodStart" 
                                        value={formData.taxPeriodStart} 
                                        onChange={handleChange}
                                        disabled={formData.jenisPemotongan === 'Setahun penuh'}
                                    >
                                        {periodOptions.map(m => <option key={m} value={m}>{m}</option>)}
                                    </FormSelect>
                                </div>
                                <div>
                                    <FormLabel required>Masa Akhir</FormLabel>
                                    <FormSelect 
                                        name="taxPeriodEnd" 
                                        value={formData.taxPeriodEnd} 
                                        onChange={handleChange}
                                        disabled={formData.jenisPemotongan === 'Setahun penuh'}
                                    >
                                        {periodOptions.map(m => <option key={m} value={m}>{m}</option>)}
                                    </FormSelect>
                                </div>
                            </div>

                            <div>
                                <FormLabel required>Nama Objek Pajak</FormLabel>
                                <FormSelect name="taxObjectName" value={formData.taxObjectName} onChange={handleChange}>
                                    {ANNUAL_TAX_OBJECTS.map(obj => <option key={obj.code} value={obj.name}>{obj.name}</option>)}
                                </FormSelect>
                                <div className="mt-1 text-xs text-gray-500 font-mono flex justify-between"><span>Kode Objek Pajak:</span> <span>{formData.taxObjectCode}</span></div>
                            </div>

                            <div>
                                <FormLabel required>Fasilitas PPh Pasal 21</FormLabel>
                                <FormSelect name="taxFacility" value={formData.taxFacility} onChange={handleChange}>
                                    <option value="Tanpa Fasilitas">Tanpa Fasilitas</option>
                                    <option value="PPh Ditanggung Pemerintah (DTP)">PPh Ditanggung Pemerintah (DTP)</option>
                                    <option value="Fasilitas Lainnya">Fasilitas Lainnya</option>
                                </FormSelect>
                            </div>
                            <div className="pt-2 border-t border-gray-700">
                                <div className="text-[10px] text-gray-400">KAP-KJS: 411121-100</div>
                                <div className="text-[10px] text-gray-400">NITKU: {profile.nitku || '-'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Calculation Details */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Income Inputs */}
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-200 mb-4 uppercase tracking-wider border-b border-gray-700/50 pb-2">DATA PENGHASILAN SETAHUN</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="grid grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-xs text-gray-500">01.</div>
                                    <div className="col-span-4"><FormLabel>Gaji/Pensiun/THT Berkala</FormLabel></div>
                                    <div className="col-span-7 flex gap-2">
                                        <FormInput name="baseSalary" value={formatNumberForDisplay(formData.baseSalary)} onChange={handleChange} className="flex-1" />
                                        <AutoCalcButton onClick={() => calculateFromMonthly('salary')} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-xs text-gray-500">02.</div>
                                    <div className="col-span-4"><FormLabel>Tunjangan PPh</FormLabel></div>
                                    <div className="col-span-7"><FormInput name="tunjanganPph" value={formatNumberForDisplay(formData.tunjanganPph)} onChange={handleChange} readOnly={formData.isGrossUp} /></div>
                                </div>
                                <div className="grid grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-xs text-gray-500">03.</div>
                                    <div className="col-span-4"><FormLabel>Tunjangan Lainnya, Uang Lembur, dsb</FormLabel></div>
                                    <div className="col-span-7 flex gap-2">
                                        <FormInput name="tunjanganJabatan" value={formatNumberForDisplay(formData.tunjanganJabatan)} onChange={handleChange} className="flex-1" />
                                        <AutoCalcButton onClick={() => calculateFromMonthly('allowance')} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-xs text-gray-500">04.</div>
                                    <div className="col-span-4"><FormLabel>Honorarium & Imbalan Sejenis</FormLabel></div>
                                    <div className="col-span-7"><FormInput name="honorarium" value={formatNumberForDisplay(formData.honorarium)} onChange={handleChange} /></div>
                                </div>
                                <div className="grid grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-xs text-gray-500">05.</div>
                                    <div className="col-span-4"><FormLabel>Premi Asuransi dibayar Pemberi Kerja</FormLabel></div>
                                    <div className="col-span-7"><FormInput name="insurancePremi" value={formatNumberForDisplay(formData.insurancePremi)} onChange={handleChange} /></div>
                                </div>
                                <div className="grid grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-xs text-gray-500">06.</div>
                                    <div className="col-span-4"><FormLabel>Natura & Kenikmatan</FormLabel></div>
                                    <div className="col-span-7 flex gap-2">
                                        <FormInput name="facilityValue" value={formatNumberForDisplay(formData.facilityValue)} onChange={handleChange} className="flex-1" />
                                        <AutoCalcButton onClick={() => calculateFromMonthly('natura')} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-xs text-gray-500">07.</div>
                                    <div className="col-span-4"><FormLabel>Tantiem, Bonus, THR</FormLabel></div>
                                    <div className="col-span-7 flex gap-2">
                                        <FormInput name="bonus" value={formatNumberForDisplay(formData.bonus)} onChange={handleChange} className="flex-1" />
                                        <AutoCalcButton onClick={() => calculateFromMonthly('bonus')} />
                                    </div>
                                </div>
                                {/* Highlights Item 08 */}
                                <div className="grid grid-cols-12 items-center gap-2 bg-gray-900 border border-gray-600 p-3 rounded mt-2">
                                    <div className="col-span-1 text-sm text-gray-300 font-bold">08.</div>
                                    <div className="col-span-4 text-sm font-bold text-white uppercase">Jumlah Penghasilan Bruto (01 s.d 07)</div>
                                    <div className="col-span-7 text-right">
                                        <div className="text-xl font-bold text-white">{formatCurrency(calc.totalBruto)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Deductions */}
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-200 mb-4 uppercase tracking-wider border-b border-gray-700/50 pb-2">PENGURANGAN</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="grid grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-xs text-gray-500">09.</div>
                                    <div className="col-span-4"><FormLabel>Biaya Jabatan / Biaya Pensiun</FormLabel></div>
                                    <div className="col-span-7"><FormInput value={formatNumberForDisplay(calc.biayaJabatan)} readOnly className="!bg-gray-900/50" /></div>
                                </div>
                                <div className="grid grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-xs text-gray-500">10.</div>
                                    <div className="col-span-4"><FormLabel>Iuran Pensiun / THT / JHT</FormLabel></div>
                                    <div className="col-span-7 flex gap-2">
                                        <FormInput name="pensionDeduction" value={formatNumberForDisplay(formData.pensionDeduction + formData.jpDeduction)} onChange={handleChange} className="flex-1" />
                                        <AutoCalcButton onClick={() => calculateFromMonthly('pension')} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-xs text-gray-500">11.</div>
                                    <div className="col-span-4"><FormLabel>Zakat / Sumbangan Keagamaan Wajib</FormLabel></div>
                                    <div className="col-span-7 flex gap-2">
                                        <FormInput name="zakatDeduction" value={formatNumberForDisplay(formData.zakatDeduction)} onChange={handleChange} className="flex-1" />
                                        <AutoCalcButton onClick={() => calculateFromMonthly('zakat')} />
                                    </div>
                                </div>
                                {/* Highlight Item 12 */}
                                <div className="grid grid-cols-12 items-center gap-2 bg-gray-900 border border-gray-600 p-3 rounded mt-2">
                                    <div className="col-span-1 text-sm text-gray-300 font-bold">12.</div>
                                    <div className="col-span-4 text-sm font-bold text-white uppercase">Jumlah Pengurangan (09 s.d 11)</div>
                                    <div className="col-span-7 text-right">
                                        <div className="text-xl font-bold text-white">{formatCurrency(calc.totalPengurangan)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Calculation */}
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-200 mb-4 uppercase tracking-wider border-b border-gray-700/50 pb-2">PENGHITUNGAN PPh PASAL 21</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="grid grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-xs text-gray-500">13.</div>
                                    <div className="col-span-4"><FormLabel>Jumlah Penghasilan Neto</FormLabel></div>
                                    <div className="col-span-7"><FormInput value={formatNumberForDisplay(calc.neto)} readOnly className="!bg-gray-900/50" /></div>
                                </div>
                                <div className="grid grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-xs text-gray-500">14.</div>
                                    <div className="col-span-4"><FormLabel>Neto Masa Sebelumnya</FormLabel></div>
                                    <div className="col-span-7"><FormInput name="netIncomePrevious" value={formatNumberForDisplay(formData.netIncomePrevious || 0)} onChange={handleChange} /></div>
                                </div>
                                <div className="grid grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-xs text-gray-500">15.</div>
                                    <div className="col-span-4"><FormLabel>Neto untuk PPh 21 (Setahun/Disetahunkan)</FormLabel></div>
                                    <div className="col-span-7">
                                        <FormInput 
                                            name="manualNetIncomeCalc"
                                            value={formatNumberForDisplay(isFasilitasLainnya ? (formData.manualNetIncomeCalc || calc.netoSetahun) : calc.netoSetahun)} 
                                            onChange={handleChange}
                                            readOnly={!isFasilitasLainnya} 
                                            className={!isFasilitasLainnya ? "!bg-gray-900/50" : "border-yellow-500"}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-xs text-gray-500">16.</div>
                                    <div className="col-span-4"><FormLabel>PTKP</FormLabel></div>
                                    <div className="col-span-7"><FormInput value={formatNumberForDisplay(calc.ptkp)} readOnly className="!bg-gray-900/50" /></div>
                                </div>
                                <div className="grid grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-xs text-gray-500">17.</div>
                                    <div className="col-span-4"><FormLabel>PKP Setahun / Disetahunkan</FormLabel></div>
                                    <div className="col-span-7"><FormInput value={formatNumberForDisplay(calc.pkp)} readOnly className="!bg-gray-900/50" /></div>
                                </div>
                                <div className="grid grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-xs text-gray-500">18.</div>
                                    <div className="col-span-4"><FormLabel>PPh 21 atas PKP Setahun/Disetahunkan</FormLabel></div>
                                    <div className="col-span-7">
                                        <FormInput 
                                            name="manualPph21Pkp"
                                            value={formatNumberForDisplay(isFasilitasLainnya ? (formData.manualPph21Pkp || calc.pph21Setahun) : calc.pph21Setahun)} 
                                            onChange={handleChange}
                                            readOnly={!isFasilitasLainnya} 
                                            className={!isFasilitasLainnya ? "!bg-gray-900/50" : "border-yellow-500"}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-xs text-gray-500">19.</div>
                                    <div className="col-span-4"><FormLabel>PPh 21 Terutang</FormLabel></div>
                                    <div className="col-span-7"><FormInput value={formatNumberForDisplay(calc.pph21Terutang)} readOnly className="!bg-gray-900/50" /></div>
                                </div>
                                <div className="grid grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-xs text-gray-500">20.</div>
                                    <div className="col-span-4"><FormLabel>PPh 21 Dipotong Sebelumnya</FormLabel></div>
                                    <div className="col-span-7"><FormInput name="pph21PaidPreviously" value={formatNumberForDisplay(formData.pph21PaidPreviously || 0)} onChange={handleChange} /></div>
                                </div>
                                <div className="grid grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-xs text-gray-500">21.</div>
                                    <div className="col-span-4"><FormLabel>PPh 21 Terutang Bupot Ini</FormLabel></div>
                                    <div className="col-span-7"><FormInput value={formatNumberForDisplay(calc.pph21TerutangBupot)} readOnly className="!bg-gray-900/50 font-bold text-gray-100" /></div>
                                </div>
                                <div className="grid grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-xs text-gray-500">22.</div>
                                    <div className="col-span-4"><FormLabel>PPh 21 yang Dipotong/Ditanggung Pemerintah</FormLabel></div>
                                    <div className="col-span-7">
                                        <FormInput 
                                            name="manualPph21Dtp"
                                            value={formatNumberForDisplay(isDtp ? (formData.manualPph21Dtp !== undefined ? formData.manualPph21Dtp : calc.pph21Dtp) : calc.pph21Dtp)} 
                                            onChange={handleChange}
                                            readOnly={!isDtp}
                                            className={!isDtp ? "!bg-gray-900/50" : "border-yellow-500"}
                                        />
                                    </div>
                                </div>
                                
                                {/* Highlight Item 23 (The Big Total) */}
                                <div className="grid grid-cols-12 items-center gap-2 bg-gray-900 border-2 border-yellow-600 p-4 rounded-lg mt-4 shadow-lg shadow-black/40">
                                    <div className="col-span-1 text-lg text-white font-black">23.</div>
                                    <div className="col-span-4 text-base font-bold text-yellow-400 uppercase tracking-wide">PPh 21 Kurang (Lebih) Bayar</div>
                                    <div className="col-span-7">
                                        <FormInput 
                                            name="manualPph21KurangBayar"
                                            value={formatNumberForDisplay(isFasilitasLainnya ? (formData.manualPph21KurangBayar || calc.pph21KurangBayar) : calc.pph21KurangBayar)} 
                                            onChange={handleChange}
                                            readOnly={!isFasilitasLainnya}
                                            className={!isFasilitasLainnya ? "!bg-transparent font-black text-5xl md:text-6xl text-white text-right border-none p-0 focus:ring-0" : "border-yellow-500 font-black text-2xl text-right bg-yellow-900/20 text-yellow-200"}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-4">
                    <button type="button" onClick={onCancel} disabled={isSaving} className="px-8 py-3 bg-gray-700/60 text-gray-200 font-bold rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors disabled:opacity-50">Batal</button>
                    <button type="submit" disabled={isSaving} className="px-10 py-3 bg-primary-600 text-white font-bold rounded-lg shadow-xl shadow-primary-900/30 hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:bg-gray-600">
                        {isSaving ? (
                            <>
                                <SpinnerIcon />
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <span>Simpan A1</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EmployeeForm3;