import * as React from 'react';
import { Employee, EmployeeData, MaritalStatus, Profile, MasterEmployee, OvertimeRecord } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { TER_RATES, TER_CATEGORY_MAP } from '../constants';

interface EmployeeFormProps {
  onSave: (employee: EmployeeData) => void;
  existingEmployee: Employee | null;
  onCancel: () => void;
  profile: Profile;
  masterEmployees: MasterEmployee[];
  overtimeRecords: OvertimeRecord[];
  employees: Employee[];
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const initialFormData: Omit<EmployeeData, 'id'> = {
  masterEmployeeId: '', name: '', npwp: '', periodYear: new Date().getFullYear(), periodMonth: new Date().getMonth() + 1,
  status: MaritalStatus.TK0, baseSalary: 0, overtimePay: 0, bonus: 0, loan: 0, otherDeductions: 0, 
  bpjsDeduction: 0, pensionDeduction: 0, facilityValue: 0,
  employeeStatus: 'Pegawai Tetap',
  address: '',
  isGrossUp: false,
  isForeigner: false,
  tunjanganPph: 0,
  tunjanganJabatan: 0,
  tunjanganTelekomunikasi: 0,
  tunjanganMakan: 0,
  tunjanganTransportasi: 0,
  taxFacility: 'Tanpa Fasilitas',
  taxObjectName: 'Penghasilan yang Diterima atau Diperoleh Pegawai Tetap',
  taxObjectCode: '21-100-01',
  signerIdentity: 'NPWP',
};

const formatNumberForDisplay = (num: number): string => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    return new Intl.NumberFormat('id-ID').format(num);
};

const parseFormattedNumber = (str: string): number => {
    if (typeof str !== 'string') return 0;
    const numericString = str.replace(/[^0-9-]/g, '');
    return parseInt(numericString, 10) || 0;
};

const taxObjectMapping: { [key: string]: EmployeeData['taxObjectCode'] } = {
    'Penghasilan yang Diterima atau Diperoleh Pegawai Tetap': '21-100-01',
    'Penghasilan yang Diterima atau Diperoleh Pensiunan Secara Teratur': '21-100-02',
    'Penghasilan yang Diterima atau Diperoleh Pegawai Tetap yang Menerima fasilitas di Daerah Tertentu': '21-100-03',
};

const InputField: React.FC<{ label: string; name: string; value: string | number; onChange: (e: React.ChangeEvent<any>) => void; type?: string; children?: React.ReactNode; readOnly?: boolean; className?: string, tooltip?: string, disabled?: boolean }> =
 ({ label, name, value, onChange, type = "text", children, readOnly = false, className = '', tooltip, disabled = false }) => (
    <div>
        <label htmlFor={name} className="flex items-center text-sm font-medium text-gray-300 mb-1">
            {label}
            {tooltip && (
                <div className="relative group ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div className="absolute bottom-full mb-2 w-72 p-2 bg-gray-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {tooltip} <a href="https://ortax.org/ortax/?mod=peraturan&page=show&id=17900" target="_blank" rel="noopener noreferrer" className="text-primary-400 underline">PMK 168/2023</a>.
                    </div>
                </div>
            )}
        </label>
        {children ? (
            <select id={name} name={name} value={value} onChange={onChange} disabled={disabled || readOnly} className={`w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm ${disabled || readOnly ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-800'}`}>
                {children}
            </select>
        ) : (
            <input type={type} id={name} name={name} value={value} onChange={onChange} readOnly={readOnly} disabled={disabled} className={`w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm ${readOnly ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-800'}`} />
        )}
    </div>
);

const CurrencyInputWithButton: React.FC<{ label: string; name: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onButtonClick: () => void; buttonText: string }> =
({ label, name, value, onChange, onButtonClick, buttonText }) => (
    <div>
         <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <div className="flex">
            <input type="text" name={name} value={formatNumberForDisplay(value)} onChange={onChange} className="w-full px-3 py-2 border border-gray-600 rounded-l-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-800 text-sm" />
            <button type="button" onClick={onButtonClick} className="px-2 py-1 border border-l-0 border-primary-500 bg-primary-800 text-primary-300 text-xs font-semibold rounded-r-md hover:bg-primary-700">
                {buttonText}
            </button>
        </div>
    </div>
);


const EmployeeForm: React.FC<EmployeeFormProps> = ({ onSave, existingEmployee, onCancel, profile, masterEmployees, overtimeRecords, employees, showNotification }) => {
  const [formData, setFormData] = React.useState<Omit<EmployeeData, 'id'>>(initialFormData);
  const [selectedMasterEmployeeId, setSelectedMasterEmployeeId] = React.useState<string>('');
  const [nameSearchTerm, setNameSearchTerm] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<MasterEmployee[]>([]);
  const months = React.useMemo(() => ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"], []);

  const activeMasterEmployees = React.useMemo(() => masterEmployees.filter(emp => emp.isActive), [masterEmployees]);

  // Effect to setup the form for editing an existing PPh21 record or creating a new one.
  React.useEffect(() => {
    if (existingEmployee) {
        const masterData = masterEmployees.find(emp => emp.id === existingEmployee.masterEmployeeId);
        setSelectedMasterEmployeeId(existingEmployee.masterEmployeeId);
        setNameSearchTerm(masterData?.fullName || '');
        setFormData({ ...initialFormData, ...existingEmployee });
    } else {
        setFormData(initialFormData);
        setSelectedMasterEmployeeId('');
        setNameSearchTerm('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingEmployee]);


  // Effect to handle selecting a new employee from autocomplete
  // This resets transactional data and populates master data for the newly selected employee.
  const handleSelectNewEmployee = (employee: MasterEmployee) => {
    const employeeOvertimeRecords = overtimeRecords.filter(o => 
        o.masterEmployeeId === employee.id &&
        o.year === formData.periodYear &&
        o.month === formData.periodMonth
    );
    const totalOvertimePay = employeeOvertimeRecords.reduce((sum, record) => sum + record.totalPay, 0);

    setFormData(prev => ({
        ...initialFormData,
        periodYear: prev.periodYear,
        periodMonth: prev.periodMonth,
        masterEmployeeId: employee.id,
        name: employee.fullName,
        npwp: employee.npwp,
        address: employee.address,
        status: employee.ptkpStatus,
        employeeStatus: employee.employeeStatus,
        isForeigner: employee.isForeigner,
        baseSalary: employee.baseSalary,
        overtimePay: totalOvertimePay
    }));
  };

  const handleNameSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNameSearchTerm(value);
    
    // Clear selection if user is typing a new name
    if (selectedMasterEmployeeId) {
        setSelectedMasterEmployeeId('');
    }

    if (value.length >= 2) {
        const filteredSuggestions = activeMasterEmployees.filter(emp =>
            emp.fullName.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
    } else {
        setSuggestions([]);
    }
  };

  const handleSuggestionClick = (employee: MasterEmployee) => {
      setNameSearchTerm(employee.fullName);
      setSelectedMasterEmployeeId(employee.id);
      setSuggestions([]);
      handleSelectNewEmployee(employee);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    const currencyFields = new Set(['tunjanganPph', 'tunjanganJabatan', 'tunjanganTelekomunikasi', 'tunjanganMakan', 'tunjanganTransportasi', 'bonus', 'facilityValue', 'pensionDeduction', 'bpjsDeduction', 'loan', 'otherDeductions']);
    const booleanFields = new Set(['isGrossUp']);
    const numericFields = new Set(['periodYear', 'periodMonth']);

    setFormData(prev => {
        let processedValue: any = value;

        if (currencyFields.has(name)) {
            processedValue = parseFormattedNumber(value);
        } else if (booleanFields.has(name)) {
            processedValue = value === 'true';
        } else if (numericFields.has(name)) {
            processedValue = Number(value) || 0;
        }

        let newFormData = { ...prev, [name]: processedValue };
        
        if (name === 'taxObjectName') {
            newFormData.taxObjectCode = taxObjectMapping[value] || '';
        }
        
        return newFormData;
    });
  };

  // Effect to update overtime pay if the period changes for an already selected employee.
  // This does NOT reset other transactional data.
  React.useEffect(() => {
    if (selectedMasterEmployeeId) {
        const employeeOvertimeRecords = overtimeRecords.filter(o => 
            o.masterEmployeeId === selectedMasterEmployeeId &&
            o.year === formData.periodYear &&
            o.month === formData.periodMonth
        );
        const totalOvertimePay = employeeOvertimeRecords.reduce((sum, record) => sum + record.totalPay, 0);
        if (formData.overtimePay !== totalOvertimePay) {
            setFormData(prev => ({...prev, overtimePay: totalOvertimePay}));
        }
    }
  }, [formData.periodYear, formData.periodMonth, selectedMasterEmployeeId, overtimeRecords, formData.overtimePay]);


  const totalPenghasilan = React.useMemo(() => {
    return (
        formData.baseSalary + formData.tunjanganPph + formData.tunjanganJabatan + formData.tunjanganTelekomunikasi +
        formData.tunjanganMakan + formData.tunjanganTransportasi + formData.overtimePay +
        formData.bonus + formData.facilityValue
    );
  }, [formData]);

  const biayaJabatan = React.useMemo(() => Math.min(totalPenghasilan * 0.05, 500000), [totalPenghasilan]);

  const totalPengurangan = React.useMemo(() => {
    return biayaJabatan + formData.pensionDeduction + formData.bpjsDeduction + formData.loan + formData.otherDeductions;
  }, [biayaJabatan, formData.pensionDeduction, formData.bpjsDeduction, formData.loan, formData.otherDeductions]);
  
  const penghasilanNetoBulanan = React.useMemo(() => {
    return totalPenghasilan - totalPengurangan;
  }, [totalPenghasilan, totalPengurangan]);


  const getTerRate = (status: MaritalStatus, monthlyGross: number): number => {
    const category = TER_CATEGORY_MAP[status] || 'A';
    const ratesForCategory = TER_RATES[category];
    for (const bracket of ratesForCategory) {
        if (monthlyGross <= bracket.limit) return bracket.rate;
    }
    return ratesForCategory[ratesForCategory.length - 1]?.rate || 0;
  };
  
  const terRate = React.useMemo(() => getTerRate(formData.status, totalPenghasilan), [formData.status, totalPenghasilan]);
  
  const pph21 = React.useMemo(() => totalPenghasilan * terRate, [totalPenghasilan, terRate]);
  
  const takeHomePay = React.useMemo(() => {
    const cashDeductions = formData.pensionDeduction + formData.bpjsDeduction + formData.loan + formData.otherDeductions;
    return totalPenghasilan - cashDeductions - pph21;
  }, [totalPenghasilan, formData.pensionDeduction, formData.bpjsDeduction, formData.loan, formData.otherDeductions, pph21]);

  const handleSyncMasterData = () => {
        if (!formData.masterEmployeeId) return;
        const masterData = masterEmployees.find(emp => emp.id === formData.masterEmployeeId);
        if (!masterData) {
            showNotification('Data master karyawan tidak ditemukan.', 'error');
            return;
        }

        const employeeOvertimeRecords = overtimeRecords.filter(o => 
            o.masterEmployeeId === masterData.id &&
            o.year === formData.periodYear &&
            o.month === formData.periodMonth
        );
        const totalOvertimePay = employeeOvertimeRecords.reduce((sum, record) => sum + record.totalPay, 0);

        setFormData(prev => ({
            ...prev,
            name: masterData.fullName,
            npwp: masterData.npwp,
            address: masterData.address,
            status: masterData.ptkpStatus,
            employeeStatus: masterData.employeeStatus,
            isForeigner: masterData.isForeigner,
            baseSalary: masterData.baseSalary,
            overtimePay: totalOvertimePay,
        }));

        showNotification('Data berhasil disinkronkan dengan data master.');
    };

    const handleFetchPreviousMonthData = () => {
        if (!formData.masterEmployeeId) {
            showNotification('Pilih karyawan terlebih dahulu.', 'error');
            return;
        }

        const currentMonth = formData.periodMonth;
        const currentYear = formData.periodYear;

        const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

        const previousRecord = employees.find(emp => 
            emp.masterEmployeeId === formData.masterEmployeeId &&
            emp.periodYear === prevYear &&
            emp.periodMonth === prevMonth
        );

        if (!previousRecord) {
            showNotification(`Data untuk bulan ${months[prevMonth - 1]} ${prevYear} tidak ditemukan.`, 'error');
            return;
        }

        setFormData(prev => ({
            ...prev,
            tunjanganPph: previousRecord.tunjanganPph,
            tunjanganJabatan: previousRecord.tunjanganJabatan,
            tunjanganTelekomunikasi: previousRecord.tunjanganTelekomunikasi,
            tunjanganMakan: previousRecord.tunjanganMakan,
            tunjanganTransportasi: previousRecord.tunjanganTransportasi,
            bonus: previousRecord.bonus,
            facilityValue: previousRecord.facilityValue,
            loan: previousRecord.loan,
            otherDeductions: previousRecord.otherDeductions,
            bpjsDeduction: previousRecord.bpjsDeduction,
            pensionDeduction: previousRecord.pensionDeduction,
            isGrossUp: previousRecord.isGrossUp,
            taxFacility: previousRecord.taxFacility,
            taxObjectName: previousRecord.taxObjectName,
            taxObjectCode: previousRecord.taxObjectCode,
            signerIdentity: previousRecord.signerIdentity,
        }));
        
        showNotification(`Data dari bulan ${months[prevMonth - 1]} ${prevYear} berhasil dimuat.`);
    };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.masterEmployeeId) {
        alert("Silakan pilih karyawan terlebih dahulu.");
        return;
    }
    onSave({ id: existingEmployee?.id || uuidv4(), ...formData });
  };
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2023 + 1 }, (_, i) => 2024 + i);

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl shadow-black/20 max-w-7xl mx-auto animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-6 gap-4 animate-fade-in-up">
            <div>
                 <h2 className="text-2xl font-bold text-primary-400">{existingEmployee ? 'Edit Perhitungan PPh 21' : 'Hitung PPh 21 Karyawan'}</h2>
                 <p className="text-gray-400 text-sm mt-1">Isi detail penghasilan dan potongan untuk menghitung pajak.</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-shrink-0">
                {existingEmployee && (
                     <button type="button" onClick={handleSyncMasterData} className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l5 5M20 20l-5-5M4 20l5-5M20 4l-5 5" /></svg>
                        <span>Sinkronkan Data Master</span>
                    </button>
                )}
                <button type="button" onClick={handleFetchPreviousMonthData} disabled={!formData.masterEmployeeId} className="text-sm font-semibold text-white bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-md disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18" /></svg>
                    <span>Ambil Data Bulan Sebelumnya</span>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 border border-gray-700 rounded-lg bg-black/20 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <InputField label="Masa Pajak" name="periodMonth" value={formData.periodMonth} onChange={handleChange}>
                {months.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
            </InputField>
            <InputField label="Tahun Pajak" name="periodYear" value={formData.periodYear} onChange={handleChange}>
                {years.map(year => <option key={year} value={year}>{year}</option>)}
            </InputField>
            <div className="relative lg:col-span-2">
                <label htmlFor="name-search" className="block text-sm font-medium text-gray-300 mb-1">Nama Karyawan</label>
                <input
                    type="text"
                    id="name-search"
                    name="name-search"
                    value={nameSearchTerm}
                    onChange={handleNameSearchChange}
                    onBlur={() => setTimeout(() => setSuggestions([]), 200)} // Delay to allow click
                    className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm bg-white text-gray-800"
                    placeholder="Ketik min. 2 huruf nama..."
                    autoComplete="off"
                    disabled={!!existingEmployee}
                />
                {suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                        {suggestions.map(emp => (
                            <li
                                key={emp.id}
                                className="px-4 py-2 text-gray-200 cursor-pointer hover:bg-primary-800"
                                onMouseDown={() => handleSuggestionClick(emp)} 
                            >
                                {emp.fullName} ({emp.employeeId})
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <InputField label="Status Pegawai" name="employeeStatus" value={formData.employeeStatus} onChange={handleChange} readOnly={true}>
                <option>Pegawai Tetap</option><option>Bukan Pegawai</option>
            </InputField>
             <InputField label="Status Pegawai Asing" name="isForeigner" value={String(formData.isForeigner)} onChange={handleChange} readOnly={true}>
                <option value="false">Tidak</option><option value="true">Ya</option>
            </InputField>
             <InputField label="Kode PTKP" name="status" value={formData.status} onChange={handleChange} readOnly={true}>
                {Object.values(MaritalStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </InputField>
             <InputField label="Gross Up" name="isGrossUp" value={String(formData.isGrossUp)} onChange={handleChange}>
                <option value="false">Tidak</option><option value="true">Ya</option>
            </InputField>
            <InputField label="NPWP/NIK" name="npwp" value={formData.npwp} onChange={handleChange} readOnly={true} />
            <InputField label="Alamat" name="address" value={formData.address} onChange={handleChange} className="md:col-span-2 lg:col-span-3" readOnly={true} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Panel */}
            <div className="flex-1 lg:w-1/2 p-4 border border-gray-700 rounded-lg animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <h3 className="text-lg font-bold text-gray-200 mb-4 text-center">Perhitungan Gaji</h3>
                <div className="space-y-6">
                    <div>
                        <h4 className="text-md font-semibold text-primary-400 mb-2">Komponen Penghasilan</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-900 rounded-md">
                            <InputField label="Gaji Pokok" name="baseSalary" type="text" value={formatNumberForDisplay(formData.baseSalary)} onChange={()=>{}} readOnly={true}/>
                            <InputField label="Tunjangan PPh" name="tunjanganPph" type="text" value={formatNumberForDisplay(formData.tunjanganPph)} onChange={handleChange} />
                            <InputField label="Tunj. Jabatan" name="tunjanganJabatan" type="text" value={formatNumberForDisplay(formData.tunjanganJabatan)} onChange={handleChange} />
                            <InputField label="Tunj. Telekomunikasi" name="tunjanganTelekomunikasi" type="text" value={formatNumberForDisplay(formData.tunjanganTelekomunikasi)} onChange={handleChange} />
                            <InputField label="Tunj. Makan" name="tunjanganMakan" type="text" value={formatNumberForDisplay(formData.tunjanganMakan)} onChange={handleChange} />
                            <InputField label="Tunj. Transportasi" name="tunjanganTransportasi" type="text" value={formatNumberForDisplay(formData.tunjanganTransportasi)} onChange={handleChange} />
                            <InputField label="Lembur" name="overtimePay" type="text" value={formatNumberForDisplay(formData.overtimePay)} onChange={()=>{}} readOnly={true}/>
                            <InputField label="Natura/Kenikmatan" name="facilityValue" type="text" value={formatNumberForDisplay(formData.facilityValue)} onChange={handleChange} />
                            <InputField label="THR/Bonus" name="bonus" type="text" value={formatNumberForDisplay(formData.bonus)} onChange={handleChange} />
                        </div>
                    </div>
                     <div>
                        <h4 className="text-md font-semibold text-primary-400 mb-2">Komponen Pengurangan Penghasilan</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-900 rounded-md">
                           <InputField label="Biaya Jabatan (5%)" name="biayaJabatan" type="text" value={formatNumberForDisplay(biayaJabatan)} onChange={()=>{}} readOnly={true}/>
                           <CurrencyInputWithButton label="JHT - Karyawan (2%)" name="pensionDeduction" value={formData.pensionDeduction} onChange={handleChange} onButtonClick={() => setFormData(prev => ({...prev, pensionDeduction: prev.baseSalary * 0.02}))} buttonText="Auto"/>
                           <CurrencyInputWithButton label="BPJS Kesehatan (1%)" name="bpjsDeduction" value={formData.bpjsDeduction} onChange={handleChange} onButtonClick={() => setFormData(prev => ({...prev, bpjsDeduction: prev.baseSalary * 0.01}))} buttonText="Auto"/>
                           <InputField label="Pot. Pinjaman/Kasbon" name="loan" type="text" value={formatNumberForDisplay(formData.loan)} onChange={handleChange} />
                           <InputField label="Potongan Lain" name="otherDeductions" type="text" value={formatNumberForDisplay(formData.otherDeductions)} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg text-white">
                        <p className="text-sm font-semibold text-gray-400">Penghasilan Neto Bulanan</p>
                        <p className="text-2xl font-bold">{formatNumberForDisplay(penghasilanNetoBulanan)}</p>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 lg:w-1/2 p-4 border border-gray-700 rounded-lg animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <h3 className="text-lg font-bold text-gray-200 mb-4 text-center">Perhitungan PPh 21 Tarif TER 2025</h3>
                <div className="space-y-4">
                    <InputField label="Fasilitas" name="taxFacility" value={formData.taxFacility} onChange={handleChange}>
                        <option>Tanpa Fasilitas</option><option>PPh Ditanggung Pemerintah (DTP)</option><option>Fasilitas Lainnya</option>
                    </InputField>
                    <InputField label="Nama Objek Pajak" name="taxObjectName" value={formData.taxObjectName} onChange={handleChange}>
                        <option>Penghasilan yang Diterima atau Diperoleh Pegawai Tetap</option>
                        <option>Penghasilan yang Diterima atau Diperoleh Pensiunan Secara Teratur</option>
                        <option>Penghasilan yang Diterima atau Diperoleh Pegawai Tetap yang Menerima fasilitas di Daerah Tertentu</option>
                    </InputField>
                    <InputField label="Kode Objek Pajak" name="taxObjectCode" value={formData.taxObjectCode} onChange={()=>{}} readOnly={true} />
                    <InputField label="Penghasilan Bruto" name="grossIncomeDisplay" type="text" value={formatNumberForDisplay(totalPenghasilan)} onChange={()=>{}} readOnly={true} />
                    <InputField label="Tarif TER" name="terRate" value={`${(terRate * 100).toFixed(4)}%`} onChange={()=>{}} readOnly={true} className="font-bold text-xl" tooltip="Tarif Efektif Rata-rata berdasarkan"/>
                    <InputField label="PPh Pasal 21" name="pph21" type="text" value={formatNumberForDisplay(pph21)} onChange={()=>{}} readOnly={true} />
                    <div className="p-4 bg-accent-800 rounded-lg text-white mt-4">
                        <p className="text-sm font-semibold text-accent-200">Take Home Pay</p>
                        <p className="text-2xl font-bold">{formatNumberForDisplay(takeHomePay)}</p>
                    </div>
                     <InputField label="KAP-KJS" name="kapkjs" value="411121 - 100" onChange={()=>{}} readOnly={true} />
                    <InputField label="NITKU" name="nitku" value={profile.nitku || ''} onChange={()=>{}} readOnly={true} />
                    <InputField label="Penandatangan" name="signerIdentity" value={formData.signerIdentity} onChange={handleChange}>
                        <option value="NPWP">{profile.contactName} (NPWP: {profile.contactNpwp})</option>
                        <option value="NIK">{profile.contactName} (NIK: {profile.contactNik})</option>
                    </InputField>
                </div>
            </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onCancel} className="bg-gray-600 text-gray-200 font-bold py-2 px-6 rounded-lg hover:bg-gray-500 transition-colors">Batal</button>
            <button type="submit" className="bg-accent-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-accent-600 transition-colors">Simpan & Hitung Pajak</button>
        </div>
    </form>
  );
};

export default EmployeeForm;