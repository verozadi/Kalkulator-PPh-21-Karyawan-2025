
import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Employee, EmployeeData, MasterEmployee, OvertimeRecord, Profile, MaritalStatus, CalculationType } from '../types';
import { getTerRate } from '../services/taxCalculator';
import { getAvailableTaxYears } from '../constants';

interface EmployeeFormProps {
    onSave: (data: EmployeeData) => Promise<void> | void;
    existingEmployee: Employee | null;
    onCancel: () => void;
    profile: Profile;
    masterEmployees: MasterEmployee[];
    overtimeRecords?: OvertimeRecord[];
    employees?: Employee[];
    showNotification: (message: string, type: 'success' | 'error') => void;
    fixedType?: CalculationType;
}

const NON_FINAL_TAX_OBJECTS = [
    { code: '21-100-04', name: 'Imbalan kepada Distributor Perusahaan Pemasaran Berjenjang atau Penjualan Langsung dan Kegiatan Sejenis Lainnya' },
    { code: '21-100-05', name: 'Imbalan kepada Agen Asuransi' },
    { code: '21-100-06', name: 'Imbalan kepada Petugas Penjaja Barang Dagangan' },
    { code: '21-100-07', name: 'Imbalan kepada Tenaga Ahli (Pengacara, Akuntan, Arsitek, Dokter, Konsultan, Notaris, Pejabat Pembuat Akte Tanah, Penilai, Aktuaris)' },
    { code: '21-100-10', name: 'Honorarium atau Imbalan kepada Anggota Dewan Komisaris atau Dewan Pengawas yang Menerima Imbalan secara Tidak Teratur' },
    { code: '21-100-11', name: 'Penghasilan atau Imbalan yang Diterima atau Diperoleh Mantan Pegawai (Jasa Produksi, Tantiem, Gratifikasi, Bonus, dan Imbalan Lain yang Bersifat Tidak Teratur)' },
    { code: '21-100-12', name: 'Uang Manfaat Pensiun atau Penghasilan Sejenisnya yang Diambil Sebagian oleh Peserta Program Pensiun yang Masih Berstatus sebagai Pegawai' },
    { code: '21-100-14', name: 'Imbalan kepada Peserta Rapat, Konferensi, Sidang, Pertemuan, Kunjungan Kerja, Seminar, Lokakarya, atau Pertunjukan, atau Kegiatan Tertentu Lainnya' },
    { code: '21-100-15', name: 'Imbalan kepada Peserta atau Anggota dalam Suatu Kepanitiaan sebagai Penyelenggara Kegiatan Tertentu' },
    { code: '21-100-16', name: 'Imbalan kepada Peserta Pendidikan, Pelatihan, dan Magang' },
    { code: '21-100-17', name: 'Imbalan kepada Peserta Kegiatan Lainnya' },
    { code: '21-100-18', name: 'Imbalan kepada Penasihat, Pengajar, Pelatih, Penceramah, Penyuluh, dan Moderator' },
    { code: '21-100-19', name: 'Imbalan kepada Pengarang, Peneliti, Penerjemah' },
    { code: '21-100-20', name: 'Imbalan kepada Pemberi Jasa dalam Segala Bidang' },
    { code: '21-100-21', name: 'Imbalan kepada Agen Iklan' },
    { code: '21-100-22', name: 'Imbalan kepada Pengawas atau Pengelola Proyek' },
    { code: '21-100-23', name: 'Imbalan kepada Pembawa Pesanan atau yang Menemukan Langganan atau yang Menjadi Perantara' },
    { code: '21-100-24', name: 'Upah Pegawai Tidak Tetap yang Dibayarkan secara Harian, Mingguan, Satuan dan Borongan dengan Penghasilan Bruto sampai dengan Rp2.500.000 Sehari' },
    { code: '21-100-25', name: 'Penghasilan berupa Uang Pesangon, Uang Manfaat Pensiun, Tunjangan Hari Tua, atau Jaminan Hari Tua yang Terutang atau Dibayarkan pada Tahun Ketiga dan Tahun-Tahun Berikutnya' },
    { code: '21-100-27', name: 'Upah Pegawai Tidak Tetap yang Dibayarkan secara Bulanan yang Mendapat Fasilitas di Daerah Tertentu' },
    { code: '21-100-29', name: 'Upah Pegawai Tidak Tetap yang Dibayarkan secara Harian, Mingguan, Satuan dan Borongan dengan Penghasilan Bruto sampai dengan Rp2.500.000 Sehari yang Mendapat Fasilitas di Daerah Tertentu' },
    { code: '21-100-30', name: 'Upah Pegawai Tidak Tetap yang Dibayarkan secara Harian, Mingguan, Satuan dan Borongan dengan Penghasilan Bruto lebih dari Rp2.500.000 Sehari' },
    { code: '21-100-31', name: 'Upah Pegawai Tidak Tetap yang Dibayarkan secara Harian, Mingguan, Satuan dan Borongan dengan Penghasilan Bruto lebih dari Rp2.500.000 Sehari yang Mendapat Fasilitas di Daerah Tertentu' },
    { code: '21-100-32', name: 'Penghasilan yang diterima atau Diperoleh oleh Pegawai tetap yang menerima fasilitas di daerah tertentu' },
    { code: '21-100-33', name: 'Imbalan kepada Pemain Musik, Pembawa Acara, Penyanyi, Pelawak, Bintang Film, Bintang Sinetron, Bintang Iklan, Sutradara, Kru Film, Foto Model, Peragawan/Peragawati, Pemain Drama, Penari, Pemahat, Pelukis, Pembuat/Pencipta Konten pada Media yang Dibagikan secara Daring (Influencer, Selebgram, Blogger, Vlogger, dan Sejenis Lainnya), dan Seniman Lainnya' },
    { code: '21-100-34', name: 'Imbalan yang Diterima oleh Olahragawan' },
    { code: '21-100-35', name: 'Upah Pegawai Tidak Tetap yang Dibayarkan secara Bulanan' },
    { code: '21-100-36', name: 'Imbalan kepada Peserta Perlombaan dalam Segala Bidang, antara lain Perlombaan Olah Raga, Seni, Ketangkasan, Ilmu Pengetahuan, Teknologi, dan Perlombaan Lainnya' },
    { code: '21-100-37', name: 'Penghasilan yang Diterima atau Diperoleh Pegawai Tetap di Daerah Tertentu yang Tidak Memenuhi Persyaratan Fasilitas' },
    { code: '21-100-38', name: 'Penyesuaian nilai kompensasi dari Masa Pajak sebelumnya' },
    { code: '21-401-01', name: 'Uang Pesangon yang Dibayarkan Sekaligus' },
    { code: '21-401-02', name: 'Uang Manfaat Pensiun, Tunjangan Hari Tua, atau Jaminan Hari Tua yang Dibayarkan Sekaligus' },
    { code: '21-402-02', name: 'Honor atau Imbalan Lain yang Dibebankan kepada APBN atau APBD yang Diterima oleh PNS Golongan III, Anggota TNI dan Anggota POLRI Golongan Pangkat Perwira Pertama, dan pensiunannya' },
    { code: '21-402-03', name: 'Honor atau Imbalan Lain yang Dibebankan kepada APBN atau APBD yang Diterima oleh Pejabat Negara, PNS Golongan IV, Anggota TNI dan Anggota POLRI Golongan Pangkat Perwira Menengah dan Perwira Tinggi, dan Pensiunannya' },
    { code: '21-402-04', name: 'Honor atau Imbalan Lain yang Dibebankan kepada APBN atau APBD yang Diterima oleh PNS Golongan I dan Golongan II, Anggota TNI dan Anggota POLRI Golongan Pangkat Tamtama dan Bintara, dan Pensiunannya' },
];

const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const formatNumberForDisplay = (num: number): string => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    return new Intl.NumberFormat('id-ID').format(num);
};

const parseFormattedNumber = (str: string): number => {
    if (typeof str !== 'string') return 0;
    return parseInt(str.replace(/[^0-9-]/g, ''), 10) || 0;
};

// --- Custom Internal Components for Precise UI Styling (Copied from EmployeeForm) ---

const FormLabel: React.FC<{ children: React.ReactNode, required?: boolean, info?: string }> = ({ children, required, info }) => (
    <label className="block text-[13px] font-semibold text-gray-400 mb-1.5 flex items-center">
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

const FormInput = ({ value, onChange, name, readOnly, placeholder, className = "" }: any) => (
    <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full px-3 py-2 bg-[#334155]/50 border border-[#475569] rounded text-gray-100 text-sm focus:outline-none focus:border-primary-500 transition-colors ${readOnly ? 'bg-[#1e293b] text-gray-500 cursor-not-allowed' : ''} ${className}`}
    />
);

const FormSelect = ({ value, onChange, name, children, className = "" }: any) => (
    <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 bg-[#334155]/50 border border-[#475569] rounded text-gray-100 text-sm focus:outline-none focus:border-primary-500 appearance-none transition-colors [&>option]:bg-[#1e293b] [&>option]:text-gray-200 ${className}`}
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
    >
        {children}
    </select>
);

const SearchableTaxObjectSelect: React.FC<{
    options: { code: string, name: string }[],
    value: string,
    onChange: (name: string, code: string) => void
}> = ({ options, value, onChange }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!isOpen) {
             setSearchTerm(value);
        }
    }, [value, isOpen]);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm(value);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value]);

    const filteredOptions = React.useMemo(() => {
        if (!searchTerm) return options;
        const lowerTerm = searchTerm.toLowerCase();
        return options.filter(o => 
            o.name.toLowerCase().includes(lowerTerm) || 
            o.code.toLowerCase().includes(lowerTerm)
        );
    }, [options, searchTerm]);

    const handleSelect = (option: { code: string, name: string }) => {
        onChange(option.name, option.code);
        setSearchTerm(option.name);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <FormLabel>Nama Objek Pajak</FormLabel>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder="Ketik nama atau kode objek pajak..."
                className="w-full px-3 py-2 bg-[#334155]/50 border border-[#475569] rounded text-gray-100 text-sm focus:outline-none focus:border-primary-500 transition-colors"
            />
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-[#1e293b] border border-[#475569] rounded shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <button
                                key={option.code}
                                type="button"
                                onClick={() => handleSelect(option)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-primary-600 hover:text-white transition-colors border-b border-gray-700/50 last:border-0"
                            >
                                <div className="flex justify-between items-center mb-1">
                                     <span className="font-bold text-xs text-primary-400 bg-primary-900/30 px-1.5 py-0.5 rounded">{option.code}</span>
                                </div>
                                <div className="text-sm leading-snug">{option.name}</div>
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 italic">Tidak ada objek pajak ditemukan.</div>
                    )}
                </div>
            )}
        </div>
    );
};

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
        if (searchTerm.length < 2) return masterEmployees; // Return all if < 2 chars
        
        return masterEmployees.filter(e => 
            e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            e.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, masterEmployees]);

    return (
        <div className="relative" ref={wrapperRef}>
            <FormLabel required>Nama Penerima Penghasilan</FormLabel>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder="Ketik min. 2 huruf atau pilih..."
                className="w-full px-3 py-2 bg-[#334155]/50 border border-[#475569] rounded text-gray-100 text-sm focus:outline-none focus:border-primary-500 transition-colors"
            />
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-[#1e293b] border border-[#475569] rounded shadow-2xl max-h-60 overflow-y-auto">
                    {filteredEmployees.length > 0 ? (
                        filteredEmployees.map(emp => (
                            <button
                                key={emp.id}
                                type="button"
                                onClick={() => {
                                    onSelect(emp.id);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-primary-600 hover:text-white transition-colors border-b border-gray-700/50 last:border-0"
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
    <h3 className="text-base font-bold text-gray-100 mb-6 text-center">{children}</h3>
);

const FormSubHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h4 className="text-sm font-bold text-primary-400 mb-4 border-l-4 border-primary-500 pl-3 uppercase tracking-wider">{children}</h4>
);

const SpinnerIcon = () => <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

const EmployeeForm2: React.FC<EmployeeFormProps> = ({ 
    onSave, existingEmployee, onCancel, profile, masterEmployees, showNotification, fixedType, employees = [] 
}) => {
    
    const [formData, setFormData] = React.useState<Omit<EmployeeData, 'id'>>({
        masterEmployeeId: '',
        calculationType: fixedType || 'nonFinal',
        name: '',
        npwp: '',
        address: '',
        status: MaritalStatus.TK0,
        employeeStatus: 'Bukan Pegawai',
        isForeigner: false,
        periodYear: new Date().getFullYear(),
        periodMonth: new Date().getMonth() + 1,
        baseSalary: 0,
        tunjanganPph: 0,
        tunjanganJabatan: 0,
        tunjanganTelekomunikasi: 0,
        tunjanganMakan: 0,
        tunjanganTransportasi: 0,
        overtimePay: 0,
        bonus: 0,
        facilityValue: 0,
        honorarium: 0,
        insurancePremi: 0,
        customFixedAllowances: [],
        customVariableAllowances: [],
        customDeductions: [],
        loan: 0,
        otherDeductions: 0,
        bpjsDeduction: 0,
        pensionDeduction: 0,
        jpDeduction: 0,
        zakatDeduction: 0,
        isGrossUp: false,
        taxFacility: 'Tanpa Fasilitas',
        taxFacilityNumber: '',
        taxObjectName: 'Upah Pegawai Tidak Tetap yang Dibayarkan secara Bulanan',
        taxObjectCode: '21-100-35',
        signerIdentity: 'NPWP',
        pph21PaidPreviously: 0,
        periodType: 'fullYear',
    });

    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (existingEmployee) {
            const { id, ...data } = existingEmployee;
            setFormData(data);
        }
    }, [existingEmployee]);

    React.useEffect(() => {
        const {
            baseSalary, tunjanganJabatan, tunjanganTelekomunikasi,
            tunjanganMakan, tunjanganTransportasi, overtimePay,
            bonus, facilityValue, customFixedAllowances, customVariableAllowances,
            status, isGrossUp
        } = formData;

        const customFixedTotal = (customFixedAllowances || []).reduce((sum, item) => sum + item.value, 0);
        const customVariableTotal = (customVariableAllowances || []).reduce((sum, item) => sum + item.value, 0);

        const grossWithoutTax = baseSalary + tunjanganJabatan + tunjanganTelekomunikasi +
            tunjanganMakan + tunjanganTransportasi + overtimePay +
            bonus + facilityValue + customFixedTotal + customVariableTotal;

        if (!isGrossUp) {
            if (formData.tunjanganPph !== 0) {
                setFormData(prev => ({ ...prev, tunjanganPph: 0 }));
            }
            return;
        }

        let currentTaxAllowance = 0;
        let finalTax = 0;

        for (let i = 0; i < 10; i++) {
            const currentGross = grossWithoutTax + currentTaxAllowance;
            const rate = getTerRate(status, currentGross);
            finalTax = Math.floor(currentGross * rate);

            if (Math.abs(finalTax - currentTaxAllowance) <= 1) {
                currentTaxAllowance = finalTax;
                break; 
            }
            currentTaxAllowance = finalTax;
        }

        if (formData.tunjanganPph !== currentTaxAllowance) {
            setFormData(prev => ({ ...prev, tunjanganPph: currentTaxAllowance }));
        }

    }, [
        formData.baseSalary, formData.tunjanganJabatan, formData.tunjanganTelekomunikasi,
        formData.tunjanganMakan, formData.tunjanganTransportasi, formData.overtimePay,
        formData.bonus, formData.facilityValue, formData.customFixedAllowances,
        formData.customVariableAllowances, formData.status, formData.isGrossUp
    ]);

    const totalPenghasilanBruto = React.useMemo(() => {
        const customFixedTotal = (formData.customFixedAllowances || []).reduce((sum, item) => sum + item.value, 0);
        const customVariableTotal = (formData.customVariableAllowances || []).reduce((sum, item) => sum + item.value, 0);
        return (
            formData.baseSalary + formData.tunjanganPph + formData.tunjanganJabatan + formData.tunjanganTelekomunikasi +
            formData.tunjanganMakan + formData.tunjanganTransportasi + formData.overtimePay +
            formData.bonus + formData.facilityValue + customFixedTotal + customVariableTotal
        );
    }, [formData]);

    const biayaJabatanValue = React.useMemo(() => Math.min(totalPenghasilanBruto * 0.05, 500000), [totalPenghasilanBruto]);
    const totalTaxDeductions = React.useMemo(() => 
        biayaJabatanValue + formData.pensionDeduction + formData.jpDeduction + (formData.zakatDeduction || 0), 
    [biayaJabatanValue, formData.pensionDeduction, formData.jpDeduction, formData.zakatDeduction]);
    const totalNonTaxDeductions = React.useMemo(() => {
        const customDeductionsTotal = (formData.customDeductions || []).reduce((sum, i) => sum + i.value, 0);
        return formData.bpjsDeduction + formData.loan + formData.otherDeductions + customDeductionsTotal;
    }, [formData.bpjsDeduction, formData.loan, formData.otherDeductions, formData.customDeductions]);
    const terRate = getTerRate(formData.status, totalPenghasilanBruto);
    const pph21Est = Math.floor(totalPenghasilanBruto * terRate);
    const takeHomePay = React.useMemo(() => {
        const totalCashDeductions = (totalTaxDeductions - biayaJabatanValue) + totalNonTaxDeductions;
        return Math.round(totalPenghasilanBruto - totalCashDeductions - pph21Est);
    }, [totalPenghasilanBruto, totalTaxDeductions, biayaJabatanValue, totalNonTaxDeductions, pph21Est]);

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
                employeeStatus: master.employeeStatus,
                baseSalary: master.baseSalary,
                tunjanganJabatan: master.positionAllowance || 0,
                isForeigner: master.isForeigner
            }));
        }
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
                employeeStatus: master.employeeStatus,
                isForeigner: master.isForeigner,
                baseSalary: master.baseSalary,
                tunjanganJabatan: master.positionAllowance || 0,
            }));
            showNotification('Data identitas dan gaji berhasil diperbarui dari Master Karyawan.', 'success');
        } else {
            showNotification('Data Master Karyawan tidak ditemukan.', 'error');
        }
    };

    const handleFetchPreviousData = () => {
        if (!formData.masterEmployeeId) {
            showNotification('Pilih karyawan terlebih dahulu.', 'error');
            return;
        }
        let prevMonth = Number(formData.periodMonth) - 1;
        let prevYear = Number(formData.periodYear);
        if (prevMonth === 0) {
            prevMonth = 12;
            prevYear -= 1;
        }
        const prevData = employees.find(e => 
            e.masterEmployeeId === formData.masterEmployeeId && 
            e.periodMonth === prevMonth && 
            e.periodYear === prevYear
        );
        if (prevData) {
            setFormData(prev => ({
                ...prev,
                baseSalary: prevData.baseSalary,
                tunjanganJabatan: prevData.tunjanganJabatan,
                tunjanganTelekomunikasi: prevData.tunjanganTelekomunikasi,
                tunjanganMakan: prevData.tunjanganMakan,
                tunjanganTransportasi: prevData.tunjanganTransportasi,
                facilityValue: prevData.facilityValue,
                customFixedAllowances: prevData.customFixedAllowances,
                customVariableAllowances: prevData.customVariableAllowances,
                loan: prevData.loan,
                otherDeductions: prevData.otherDeductions,
                customDeductions: prevData.customDeductions,
                bpjsDeduction: prevData.bpjsDeduction,
                pensionDeduction: prevData.pensionDeduction,
                jpDeduction: prevData.jpDeduction,
                zakatDeduction: prevData.zakatDeduction,
                isGrossUp: prevData.isGrossUp,
                taxFacility: prevData.taxFacility,
                taxFacilityNumber: prevData.taxFacilityNumber,
                taxObjectName: prevData.taxObjectName,
                taxObjectCode: prevData.taxObjectCode,
                signerIdentity: prevData.signerIdentity,
            }));
            showNotification('Berhasil di Ambil', 'success');
        } else {
            showNotification(`Data untuk bulan ${MONTH_NAMES[prevMonth - 1]} ${prevYear} tidak ditemukan.`, 'error');
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        const numericFields = ['baseSalary', 'tunjanganJabatan', 'tunjanganTelekomunikasi', 'tunjanganMakan', 'tunjanganTransportasi', 'overtimePay', 'bonus', 'facilityValue', 'loan', 'otherDeductions', 'pensionDeduction', 'jpDeduction', 'bpjsDeduction', 'zakatDeduction'];
        if (numericFields.includes(name)) {
            setFormData(prev => ({ ...prev, [name]: parseFormattedNumber(value) }));
        } else if (name === 'isGrossUp') {
            setFormData(prev => ({ ...prev, [name]: value === 'true' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAutoCalculate = (type: 'jht' | 'jp' | 'bpjs') => {
        const baseForBpjs = formData.baseSalary + formData.tunjanganJabatan + formData.tunjanganTelekomunikasi + (formData.customFixedAllowances || []).reduce((s, i) => s + i.value, 0);
        let val = 0;
        if (type === 'jht') val = baseForBpjs * 0.02;
        else if (type === 'jp') val = baseForBpjs * 0.01;
        else if (type === 'bpjs') val = baseForBpjs * 0.01;
        const field = type === 'jht' ? 'pensionDeduction' : type === 'jp' ? 'jpDeduction' : 'bpjsDeduction';
        setFormData(prev => ({ ...prev, [field]: Math.round(val) }));
    };

    const handleAddAllowance = (type: 'fixed' | 'variable') => {
        const key = type === 'fixed' ? 'customFixedAllowances' : 'customVariableAllowances';
        setFormData(prev => ({ ...prev, [key]: [...(prev[key as any] || []), { id: uuidv4(), name: '', value: 0 }] }));
    };

    const handleCustomAllowanceChange = (type: 'fixed' | 'variable', index: number, field: 'name' | 'value', value: string) => {
        const key = type === 'fixed' ? 'customFixedAllowances' : 'customVariableAllowances';
        const list = [...(formData[key as any] || [])];
        if (field === 'name') list[index].name = value;
        else list[index].value = parseFormattedNumber(value);
        setFormData(prev => ({ ...prev, [key]: list }));
    };

    const handleAddDeduction = () => {
        setFormData(prev => ({ ...prev, customDeductions: [...(prev.customDeductions || []), { id: uuidv4(), name: '', value: 0 }] }));
    };

    const handleCustomDeductionChange = (index: number, field: 'name' | 'value', value: string) => {
        const list = [...(formData.customDeductions || [])];
        if (field === 'name') list[index].name = value;
        else list[index].value = parseFormattedNumber(value);
        setFormData(prev => ({ ...prev, customDeductions: list }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave({ id: existingEmployee?.id || uuidv4(), ...formData });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto pb-10 animate-fade-in-up">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-100">Hitung PPh 21 Final / Tidak Final</h1>
                    <p className="text-sm text-gray-400">Khusus untuk penerima penghasilan Non-Pegawai Tetap.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button 
                        type="button"
                        onClick={handleUpdateFromMaster}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600/60 hover:bg-blue-600 text-blue-100 text-sm font-medium rounded border border-blue-500 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        <span>Update Data Master</span>
                    </button>
                    <button 
                        type="button"
                        onClick={handleFetchPreviousData}
                        className="flex items-center space-x-2 px-4 py-2 bg-[#334155]/60 hover:bg-[#475569] text-gray-300 text-sm font-medium rounded border border-[#475569] transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
                        <span>Ambil Data Bulan Sebelumnya</span>
                    </button>
                </div>
            </div>

            {/* Identitas Card */}
            <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6 mb-8 shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <FormLabel required>Masa Pajak</FormLabel>
                        <FormSelect name="periodMonth" value={formData.periodMonth} onChange={handleChange}>
                            {MONTH_NAMES.map((m, i) => (
                                <option key={m} value={i + 1}>{m}</option>
                            ))}
                        </FormSelect>
                    </div>
                    <div>
                        <FormLabel required>Tahun Pajak</FormLabel>
                        <FormSelect name="periodYear" value={formData.periodYear} onChange={handleChange}>
                            {getAvailableTaxYears().map(y => <option key={y} value={y}>{y}</option>)}
                        </FormSelect>
                    </div>
                    <div>
                        <SearchableEmployeeSelect 
                            masterEmployees={masterEmployees} 
                            value={formData.masterEmployeeId} 
                            onSelect={handleEmployeeSelect} 
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div>
                        <FormLabel>Status Pegawai</FormLabel>
                        <FormInput value={formData.employeeStatus} readOnly />
                    </div>
                    <div>
                        <FormLabel>Status Pegawai Asing</FormLabel>
                        <FormInput value={formData.isForeigner ? 'Ya' : 'Tidak'} readOnly />
                    </div>
                    <div>
                        <FormLabel>Kode PTKP</FormLabel>
                        <FormInput value={formData.status} readOnly />
                    </div>
                    <div>
                        <FormLabel>Gross Up</FormLabel>
                        <FormSelect name="isGrossUp" value={String(formData.isGrossUp)} onChange={handleChange}>
                            <option value="false">Tidak</option>
                            <option value="true">Ya</option>
                        </FormSelect>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1">
                        <FormLabel>NPWP/NIK</FormLabel>
                        <FormInput value={formData.npwp} readOnly />
                    </div>
                    <div className="md:col-span-3">
                        <FormLabel>Alamat</FormLabel>
                        <FormInput value={formData.address} readOnly />
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                
                {/* Left Column: Earnings & Deductions */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-8 shadow-sm">
                        <FormSectionHeader>Rincian Penghasilan</FormSectionHeader>
                        
                        {/* Penghasilan Pokok */}
                        <div className="mb-10">
                            <FormSubHeader>Penghasilan Pokok / Imbalan</FormSubHeader>
                            <div className="bg-[#0f172a]/30 p-5 rounded border border-[#334155]">
                                <FormLabel>Gaji Pokok / Imbalan Utama</FormLabel>
                                <FormInput name="baseSalary" value={formatNumberForDisplay(formData.baseSalary)} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Tunjangan Tetap */}
                        <div className="mb-10">
                            <FormSubHeader>Tunjangan Tetap</FormSubHeader>
                            <div className="bg-[#0f172a]/30 p-5 rounded border border-[#334155]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
                                    <div>
                                        <FormLabel>Tunjangan Jabatan</FormLabel>
                                        <FormInput name="tunjanganJabatan" value={formatNumberForDisplay(formData.tunjanganJabatan)} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <FormLabel info="Dihitung otomatis jika Metode Gross Up aktif">Tunjangan PPh 21</FormLabel>
                                        <FormInput value={formatNumberForDisplay(formData.tunjanganPph)} readOnly />
                                    </div>
                                    <div>
                                        <FormLabel>Tunjangan Telekomunikasi</FormLabel>
                                        <FormInput name="tunjanganTelekomunikasi" value={formatNumberForDisplay(formData.tunjanganTelekomunikasi)} onChange={handleChange} />
                                    </div>
                                </div>
                                
                                {formData.customFixedAllowances?.map((item, idx) => (
                                    <div key={item.id} className="flex gap-4 mb-3 items-end">
                                        <div className="flex-1">
                                            <FormLabel>Nama Tunjangan Lain</FormLabel>
                                            <FormInput 
                                                value={item.name} 
                                                onChange={(e: any) => handleCustomAllowanceChange('fixed', idx, 'name', e.target.value)} 
                                                placeholder="Nama Tunjangan"
                                            />
                                        </div>
                                        <div className="w-36">
                                            <FormLabel>Jumlah</FormLabel>
                                            <FormInput 
                                                value={formatNumberForDisplay(item.value)} 
                                                onChange={(e: any) => handleCustomAllowanceChange('fixed', idx, 'value', e.target.value)} 
                                                className="text-right"
                                            />
                                        </div>
                                        <button type="button" onClick={() => {
                                            const list = [...formData.customFixedAllowances];
                                            list.splice(idx, 1);
                                            setFormData(prev => ({ ...prev, customFixedAllowances: list }));
                                        }} className="p-2 bg-red-950/20 text-red-500 hover:bg-red-900/40 border border-red-900/50 rounded mb-0.5 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => handleAddAllowance('fixed')} className="w-full mt-2 py-2 bg-primary-900/20 border border-primary-500/30 text-primary-400 text-xs font-bold rounded hover:bg-primary-900/40 transition-colors flex items-center justify-center gap-2">
                                    <span className="text-base">+</span> Tambah Tunjangan Tetap
                                </button>
                            </div>
                        </div>

                        {/* Tunjangan Tidak Tetap */}
                        <div className="mb-10">
                            <FormSubHeader>Tunjangan Tidak Tetap / Insidentil</FormSubHeader>
                            <div className="bg-[#0f172a]/30 p-5 rounded border border-[#334155]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    <div>
                                        <FormLabel>Tunjangan Makan</FormLabel>
                                        <FormInput name="tunjanganMakan" value={formatNumberForDisplay(formData.tunjanganMakan)} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <FormLabel>Tunjangan Transportasi</FormLabel>
                                        <FormInput name="tunjanganTransportasi" value={formatNumberForDisplay(formData.tunjanganTransportasi)} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <FormLabel>Lembur / Extra Time</FormLabel>
                                        <FormInput name="overtimePay" value={formatNumberForDisplay(formData.overtimePay)} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <FormLabel>Natura/Kenikmatan</FormLabel>
                                        <FormInput name="facilityValue" value={formatNumberForDisplay(formData.facilityValue)} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <FormLabel>THR/Bonus</FormLabel>
                                        <FormInput name="bonus" value={formatNumberForDisplay(formData.bonus)} onChange={handleChange} />
                                    </div>
                                </div>

                                {formData.customVariableAllowances?.map((item, idx) => (
                                    <div key={item.id} className="flex gap-4 mb-3 items-end">
                                        <div className="flex-1">
                                            <FormLabel>Nama Tunjangan Tidak Tetap</FormLabel>
                                            <FormInput 
                                                value={item.name} 
                                                onChange={(e: any) => handleCustomAllowanceChange('variable', idx, 'name', e.target.value)} 
                                                placeholder="Nama Tunjangan"
                                            />
                                        </div>
                                        <div className="w-36">
                                            <FormLabel>Jumlah</FormLabel>
                                            <FormInput 
                                                value={formatNumberForDisplay(item.value)} 
                                                onChange={(e: any) => handleCustomAllowanceChange('variable', idx, 'value', e.target.value)} 
                                                className="text-right"
                                            />
                                        </div>
                                        <button type="button" onClick={() => {
                                            const list = [...formData.customVariableAllowances];
                                            list.splice(idx, 1);
                                            setFormData(prev => ({ ...prev, customVariableAllowances: list }));
                                        }} className="p-2 bg-red-950/20 text-red-500 hover:bg-red-900/40 border border-red-900/50 rounded mb-0.5 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}

                                <button type="button" onClick={() => handleAddAllowance('variable')} className="w-full mt-6 py-2 bg-primary-900/20 border border-primary-500/30 text-primary-400 text-xs font-bold rounded hover:bg-primary-900/40 transition-colors flex items-center justify-center gap-2">
                                    <span className="text-base">+</span> Tambah Tunjangan Tdk Tetap
                                </button>
                            </div>
                        </div>

                        {/* Pengurangan Pajak */}
                        <div className="mb-10">
                            <FormSubHeader>Komponen Pengurangan Penghasilan</FormSubHeader>
                            <div className="bg-[#0f172a]/30 p-5 rounded border border-[#334155]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                    <div>
                                        <FormLabel info="Otomatis max 500rb/bulan jika berlaku">Biaya Jabatan (5%)</FormLabel>
                                        <FormInput value={formatNumberForDisplay(biayaJabatanValue)} readOnly />
                                    </div>
                                    <div>
                                        <FormLabel>JHT - Karyawan</FormLabel>
                                        <div className="flex">
                                            <FormInput name="pensionDeduction" value={formatNumberForDisplay(formData.pensionDeduction)} onChange={handleChange} className="rounded-r-none border-r-0" />
                                            <button type="button" onClick={() => handleAutoCalculate('jht')} className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-r text-[10px] font-bold uppercase transition-colors">Auto</button>
                                        </div>
                                    </div>
                                    <div>
                                        <FormLabel>JP - Karyawan</FormLabel>
                                        <div className="flex">
                                            <FormInput name="jpDeduction" value={formatNumberForDisplay(formData.jpDeduction)} onChange={handleChange} className="rounded-r-none border-r-0" />
                                            <button type="button" onClick={() => handleAutoCalculate('jp')} className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-r text-[10px] font-bold uppercase transition-colors">Auto</button>
                                        </div>
                                    </div>
                                    <div>
                                        <FormLabel>Zakat / Sumbangan Keagamaan</FormLabel>
                                        <FormInput name="zakatDeduction" value={formatNumberForDisplay(formData.zakatDeduction || 0)} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Potongan Non-Pajak */}
                        <div className="mb-6">
                            <FormSubHeader>Potongan Lain / Non-Pajak (Take Home Pay)</FormSubHeader>
                            <div className="bg-[#0f172a]/30 p-5 rounded border border-[#334155]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-4">
                                    <div>
                                        <FormLabel>BPJS Kesehatan (1%)</FormLabel>
                                        <div className="flex">
                                            <FormInput name="bpjsDeduction" value={formatNumberForDisplay(formData.bpjsDeduction)} onChange={handleChange} className="rounded-r-none border-r-0" />
                                            <button type="button" onClick={() => handleAutoCalculate('bpjs')} className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-r text-[10px] font-bold uppercase transition-colors">Auto</button>
                                        </div>
                                    </div>
                                    <div>
                                        <FormLabel>Potongan Pinjaman</FormLabel>
                                        <FormInput name="loan" value={formatNumberForDisplay(formData.loan)} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <FormLabel>Potongan Kasbon</FormLabel>
                                        <FormInput name="otherDeductions" value={formatNumberForDisplay(formData.otherDeductions)} onChange={handleChange} />
                                    </div>
                                </div>

                                {formData.customDeductions?.map((item, idx) => (
                                    <div key={item.id} className="flex gap-4 mb-3 items-end">
                                        <div className="flex-1">
                                            <FormLabel>Nama Potongan Lain</FormLabel>
                                            <FormInput 
                                                value={item.name} 
                                                onChange={(e: any) => handleCustomDeductionChange(idx, 'name', e.target.value)} 
                                                placeholder="Nama Potongan"
                                            />
                                        </div>
                                        <div className="w-36">
                                            <FormLabel>Jumlah</FormLabel>
                                            <FormInput 
                                                value={formatNumberForDisplay(item.value)} 
                                                onChange={(e: any) => handleCustomDeductionChange(idx, 'value', e.target.value)} 
                                                className="text-right"
                                            />
                                        </div>
                                        <button type="button" onClick={() => {
                                            const list = [...(formData.customDeductions || [])];
                                            list.splice(idx, 1);
                                            setFormData(prev => ({ ...prev, customDeductions: list }));
                                        }} className="p-2 bg-red-950/20 text-red-500 hover:bg-red-900/40 border border-red-900/50 rounded mb-0.5 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddDeduction} className="w-full mt-2 py-2 bg-red-900/20 border border-red-500/30 text-red-400 text-xs font-bold rounded hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2">
                                    <span className="text-base">+</span> Tambah Potongan Lain (Non-Pajak) Lainnya
                                </button>
                            </div>
                        </div>

                        {/* Left Bottom Neto Box */}
                        <div className="mt-8 bg-[#0f172a] border border-[#334155] rounded-lg p-5">
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Penghasilan Bruto (Dasar Pajak Non-Final)</p>
                            <p className="text-3xl font-bold text-gray-100">{formatNumberForDisplay(totalPenghasilanBruto)}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Tax Summary */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-8 shadow-lg">
                        <FormSectionHeader>Perhitungan Pajak Non-Final</FormSectionHeader>
                        
                        <div className="space-y-6">
                            <div>
                                <FormLabel>Fasilitas</FormLabel>
                                <FormSelect name="taxFacility" value={formData.taxFacility} onChange={handleChange}>
                                    <option value="Tanpa Fasilitas">Tanpa Fasilitas</option>
                                    <option value="PPh Ditanggung Pemerintah (DTP)">PPh Ditanggung Pemerintah (DTP)</option>
                                    <option value="Fasilitas Lainnya">Fasilitas Lainnya</option>
                                </FormSelect>
                            </div>
                            
                            {(formData.taxFacility === 'PPh Ditanggung Pemerintah (DTP)' || formData.taxFacility === 'Fasilitas Lainnya') && (
                                <div className="animate-fade-in">
                                    <FormLabel required>Nomor Fasilitas (SKB/DTP)</FormLabel>
                                    <FormInput 
                                        name="taxFacilityNumber" 
                                        value={formData.taxFacilityNumber || ''} 
                                        onChange={handleChange} 
                                        placeholder="Nomor SK/Fasilitas..."
                                    />
                                </div>
                            )}

                            <SearchableTaxObjectSelect 
                                options={NON_FINAL_TAX_OBJECTS} 
                                value={formData.taxObjectName} 
                                onChange={(name, code) => {
                                    setFormData(prev => ({ 
                                        ...prev, 
                                        taxObjectName: name,
                                        taxObjectCode: code
                                    }));
                                }}
                            />

                            <div>
                                <FormLabel>Kode Objek Pajak</FormLabel>
                                <div className="bg-[#1e293b] border border-[#475569] rounded px-3 py-2 text-gray-500 text-sm cursor-not-allowed">
                                    {formData.taxObjectCode || '21-100-35'}
                                </div>
                            </div>
                            
                            {/* Updated Gross Income UI */}
                            <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-5">
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Penghasilan Bruto Bulan Ini</p>
                                <p className="text-3xl font-bold text-gray-100">{formatNumberForDisplay(totalPenghasilanBruto)}</p>
                            </div>

                            <div>
                                <FormLabel info="Tarif TER diterapkan pada Penghasilan Bruto untuk Bukan Pegawai (sesuai PP 58/2023)">Tarif TER</FormLabel>
                                <div className="bg-[#334155]/40 border border-[#475569] rounded px-3 py-2 text-gray-100 text-sm font-bold">{`${(terRate * 100).toFixed(2)}%`}</div>
                            </div>

                            {/* Large PPh Display */}
                            <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-6">
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">PPh Pasal 21 Terutang</p>
                                <p className="text-5xl font-black text-gray-100">{formatNumberForDisplay(pph21Est)}</p>
                            </div>

                            {/* Take Home Pay Box */}
                            <div className="bg-[#c2410c] border border-[#ea580c] rounded-lg p-6 shadow-lg">
                                <p className="text-orange-200 text-[10px] font-bold uppercase tracking-wider mb-1">Neto Diterima (Take Home Pay)</p>
                                <p className="text-4xl font-black text-white">{formatNumberForDisplay(takeHomePay)}</p>
                            </div>

                            <div className="pt-4 space-y-4 border-t border-[#334155]">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <FormLabel>KAP-KJS</FormLabel>
                                        <FormInput value="411121 - 100" readOnly />
                                    </div>
                                    <div>
                                        <FormLabel>NITKU</FormLabel>
                                        <FormInput value={profile.nitku || "00246974358040000000000"} readOnly />
                                    </div>
                                </div>
                                <div>
                                    <FormLabel>Penandatangan</FormLabel>
                                    <FormSelect name="signerIdentity" value={formData.signerIdentity} onChange={handleChange}>
                                        <option value="NPWP">{profile.contactName} (NPWP: {profile.contactNpwp})</option>
                                        <option value="NIK">{profile.contactName} (NIK: {profile.contactNik})</option>
                                    </FormSelect>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex justify-end items-center gap-4 pt-4">
                        <button 
                            type="button" 
                            onClick={onCancel}
                            disabled={isSaving}
                            className="px-8 py-3 bg-[#334155]/60 hover:bg-[#475569] text-gray-200 font-bold rounded-lg transition-all border border-[#475569] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className="px-10 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-xl shadow-primary-900/30 transition-all transform active:scale-95 flex items-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <SpinnerIcon />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <span>Simpan & Hitung Pajak</span>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EmployeeForm2;
