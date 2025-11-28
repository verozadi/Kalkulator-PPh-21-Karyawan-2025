
import * as React from 'react';
import { Employee, EmployeeData, MaritalStatus, Profile, MasterEmployee, OvertimeRecord, CustomAllowance, CalculationType } from '../types';
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
  customFixedAllowances: [],
  customVariableAllowances: [],
  taxFacility: 'Tanpa Fasilitas',
  taxObjectName: 'Penghasilan yang Diterima atau Diperoleh Pegawai Tetap',
  taxObjectCode: '21-100-01',
  signerIdentity: 'NPWP',
  calculationType: 'monthly',
  netIncomeAccumulated: 0,
  taxPaidAccumulated: 0,
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
    <div className={className}>
        <label htmlFor={name} className="flex items-center text-sm font-medium text-gray-300 mb-1">
            {label}
            {tooltip && (
                <div className="relative group ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div className="absolute bottom-full mb-2 w-72 p-2 bg-gray-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {tooltip}
                    </div>
                </div>
            )}
        </label>
        {children ? (
            <select id={name} name={name} value={value} onChange={onChange} disabled={disabled || readOnly} className={`w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm ${disabled || readOnly ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-700 text-gray-200'}`}>
                {children}
            </select>
        ) : (
            <input type={type} id={name} name={name} value={value} onChange={onChange} readOnly={readOnly} disabled={disabled} className={`w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm ${readOnly ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-700 text-gray-200'}`} />
        )}
    </div>
);

const CurrencyInputWithButton: React.FC<{ label: string; name: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onButtonClick: () => void; buttonText: string }> =
({ label, name, value, onChange, onButtonClick, buttonText }) => (
    <div>
         <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <div className="flex">
            <input type="text" name={name} value={formatNumberForDisplay(value)} onChange={onChange} className="w-full px-3 py-2 border border-gray-600 rounded-l-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200 text-sm" />
            <button type="button" onClick={onButtonClick} className="px-2 py-1 border border-l-0 border-primary-500 bg-primary-800 text-primary-300 text-xs font-semibold rounded-r-md hover:bg-primary-700">
                {buttonText}
            </button>
        </div>
    </div>
);

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>;
const CogUserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const HandshakeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>;


const getTerRate = (status: MaritalStatus, monthlyGross: number): number => {
    const category = TER_CATEGORY_MAP[status] || 'A';
    const ratesForCategory = TER_RATES[category];
    for (const bracket of ratesForCategory) {
        if (monthlyGross <= bracket.limit) return bracket.rate;
    }
    return ratesForCategory[ratesForCategory.length - 1]?.rate || 0;
};

const EmployeeForm: React.FC<EmployeeFormProps> = ({ onSave, existingEmployee, onCancel, profile, masterEmployees, overtimeRecords, employees, showNotification }) => {
  const [activeTab, setActiveTab] = React.useState<CalculationType>('monthly');
  const [formData, setFormData] = React.useState<Omit<EmployeeData, 'id'>>(initialFormData);
  const [selectedMasterEmployeeId, setSelectedMasterEmployeeId] = React.useState<string>('');
  const [nameSearchTerm, setNameSearchTerm] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<MasterEmployee[]>([]);
  const [isDuplicate, setIsDuplicate] = React.useState(false);
  const months = React.useMemo(() => ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"], []);

  const activeMasterEmployees = React.useMemo(() => masterEmployees.filter(emp => emp.isActive), [masterEmployees]);

  // Effect to setup the form for editing an existing PPh21 record or creating a new one.
  React.useEffect(() => {
    if (existingEmployee) {
        const masterData = masterEmployees.find(emp => emp.id === existingEmployee.masterEmployeeId);
        setSelectedMasterEmployeeId(existingEmployee.masterEmployeeId);
        setNameSearchTerm(masterData?.fullName || '');
        setFormData({ 
            ...initialFormData, 
            ...existingEmployee,
            customFixedAllowances: existingEmployee.customFixedAllowances || [],
            customVariableAllowances: existingEmployee.customVariableAllowances || [],
        });
        setActiveTab(existingEmployee.calculationType || 'monthly');
    } else {
        setFormData(initialFormData);
        setSelectedMasterEmployeeId('');
        setNameSearchTerm('');
        setActiveTab('monthly');
    }
    setIsDuplicate(false); // Reset duplicate status on form load
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingEmployee]);

  // Effect to switch tab configuration
  React.useEffect(() => {
    setFormData(prev => ({
        ...prev,
        calculationType: activeTab
    }));
  }, [activeTab]);

  // Effect to check for duplicate entries when employee or period changes
  React.useEffect(() => {
      if (!formData.masterEmployeeId) {
          setIsDuplicate(false);
          return;
      }

      const duplicateExists = employees.some(emp =>
          emp.masterEmployeeId === formData.masterEmployeeId &&
          emp.periodYear === formData.periodYear &&
          emp.periodMonth === formData.periodMonth &&
          emp.id !== (existingEmployee?.id || '') &&
          emp.calculationType === activeTab
      );
      
      setIsDuplicate(duplicateExists);

      if (duplicateExists) {
          showNotification('Data PPh 21 untuk karyawan ini pada periode tersebut sudah ada.', 'error');
      }
  }, [formData.masterEmployeeId, formData.periodMonth, formData.periodYear, employees, existingEmployee, showNotification, activeTab]);


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
        calculationType: activeTab,
        masterEmployeeId: employee.id,
        name: employee.fullName,
        npwp: employee.npwp,
        address: employee.address,
        status: employee.ptkpStatus,
        employeeStatus: activeTab === 'nonFinal' ? 'Bukan Pegawai' : employee.employeeStatus, // Force Bukan Pegawai if Non-Final tab
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
        setFormData(prev => ({ ...prev, masterEmployeeId: '' }));
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
    
    const currencyFields = new Set(['tunjanganPph', 'tunjanganJabatan', 'tunjanganTelekomunikasi', 'tunjanganMakan', 'tunjanganTransportasi', 'bonus', 'facilityValue', 'pensionDeduction', 'bpjsDeduction', 'loan', 'otherDeductions', 'netIncomeAccumulated', 'taxPaidAccumulated']);
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

  // Effect for automatic Gross Up calculation and setting tunjanganPph to 0 if not gross up
  React.useEffect(() => {
    if (!formData.isGrossUp) {
      if (formData.tunjanganPph !== 0) {
        setFormData((prev) => ({ ...prev, tunjanganPph: 0 }));
      }
      return;
    }

    // Iterative calculation to find the correct PPh 21 allowance for gross-up
    const calculateGrossUpValue = () => {
      let tunjanganPph = 0;
      let previousTunjanganPph = -1;
      let iterations = 0;
      const MAX_ITERATIONS = 15; // Safeguard against infinite loops
      
      const customFixedTotal = (formData.customFixedAllowances || []).reduce((sum, item) => sum + item.value, 0);
      const customVariableTotal = (formData.customVariableAllowances || []).reduce((sum, item) => sum + item.value, 0);

      const baseIncome =
        formData.baseSalary +
        formData.tunjanganJabatan +
        formData.tunjanganTelekomunikasi +
        formData.tunjanganMakan +
        formData.tunjanganTransportasi +
        formData.overtimePay +
        formData.bonus +
        formData.facilityValue +
        customFixedTotal +
        customVariableTotal;

      // Loop until the calculated tax equals the allowance (stabilizes)
      while (tunjanganPph !== previousTunjanganPph && iterations < MAX_ITERATIONS) {
        previousTunjanganPph = tunjanganPph;
        const grossIncome = baseIncome + tunjanganPph;
        const terRate = getTerRate(formData.status, grossIncome);
        const pph21 = grossIncome * terRate;
        tunjanganPph = Math.round(pph21);
        iterations++;
      }
      return tunjanganPph;
    };

    const newTunjanganPph = calculateGrossUpValue();

    // Only update state if the calculated value is different to prevent re-renders
    if (newTunjanganPph !== formData.tunjanganPph) {
      setFormData((prev) => ({
        ...prev,
        tunjanganPph: newTunjanganPph,
      }));
    }
  }, [formData]); // Listen to the entire formData object to recalculate on any income change.

  const totalPenghasilan = React.useMemo(() => {
    const customFixedTotal = (formData.customFixedAllowances || []).reduce((sum, item) => sum + item.value, 0);
    const customVariableTotal = (formData.customVariableAllowances || []).reduce((sum, item) => sum + item.value, 0);

    return (
        formData.baseSalary + formData.tunjanganPph + formData.tunjanganJabatan + formData.tunjanganTelekomunikasi +
        formData.tunjanganMakan + formData.tunjanganTransportasi + formData.overtimePay +
        formData.bonus + formData.facilityValue + customFixedTotal + customVariableTotal
    );
  }, [formData]);

  const biayaJabatan = React.useMemo(() => Math.min(totalPenghasilan * 0.05, 500000), [totalPenghasilan]);

  const totalPengurangan = React.useMemo(() => {
    return biayaJabatan + formData.pensionDeduction + formData.bpjsDeduction + formData.loan + formData.otherDeductions;
  }, [biayaJabatan, formData.pensionDeduction, formData.bpjsDeduction, formData.loan, formData.otherDeductions]);
  
  const penghasilanNetoBulanan = React.useMemo(() => {
    return totalPenghasilan - totalPengurangan;
  }, [totalPenghasilan, totalPengurangan]);

  const terRate = React.useMemo(() => getTerRate(formData.status, totalPenghasilan), [formData.status, totalPenghasilan]);
  
  // Display only estimation
  const pph21 = React.useMemo(() => totalPenghasilan * terRate, [totalPenghasilan, terRate]);
  
  const takeHomePay = React.useMemo(() => {
    const cashDeductions = formData.pensionDeduction + formData.bpjsDeduction + formData.loan + formData.otherDeductions;
    return Math.round(totalPenghasilan - cashDeductions - pph21);
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
            employeeStatus: activeTab === 'nonFinal' ? 'Bukan Pegawai' : masterData.employeeStatus,
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
            customFixedAllowances: previousRecord.customFixedAllowances || [],
            customVariableAllowances: previousRecord.customVariableAllowances || [],
        }));
        
        showNotification(`Data dari bulan ${months[prevMonth - 1]} ${prevYear} berhasil dimuat.`);
    };
    
    // Handlers for custom allowances
    const handleAddCustomAllowance = (type: 'fixed' | 'variable') => {
        const newAllowance = { id: uuidv4(), name: '', value: 0 };
        const key = type === 'fixed' ? 'customFixedAllowances' : 'customVariableAllowances';
        setFormData(prev => ({
            ...prev,
            [key]: [...(prev[key] || []), newAllowance]
        }));
    };

    const handleCustomAllowanceChange = (type: 'fixed' | 'variable', index: number, field: 'name' | 'value', value: string) => {
        const key = type === 'fixed' ? 'customFixedAllowances' : 'customVariableAllowances';
        setFormData(prev => {
            const updatedList = [...(prev[key] || [])];
            const updatedItem = { ...updatedList[index] };

            if (field === 'name') {
                updatedItem.name = value;
            } else {
                updatedItem.value = parseFormattedNumber(value);
            }
            updatedList[index] = updatedItem;
            return { ...prev, [key]: updatedList };
        });
    };

    const handleDeleteCustomAllowance = (type: 'fixed' | 'variable', idToDelete: string) => {
        const key = type === 'fixed' ? 'customFixedAllowances' : 'customVariableAllowances';
        setFormData(prev => ({
            ...prev,
            [key]: (prev[key] || []).filter(item => item.id !== idToDelete)
        }));
    };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.masterEmployeeId) {
        showNotification("Silakan pilih karyawan terlebih dahulu.", "error");
        return;
    }
    if (isDuplicate) {
        showNotification("Tidak dapat menyimpan karena data untuk periode ini sudah ada.", "error");
        return;
    }
    onSave({ id: existingEmployee?.id || uuidv4(), ...formData });
  };
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2023 + 1 }, (_, i) => 2024 + i);

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl shadow-black/20 max-w-7xl mx-auto animate-fade-in flex flex-col">
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 overflow-x-auto">
            <button
                onClick={() => setActiveTab('monthly')}
                className={`flex-1 py-4 text-center font-bold text-sm flex items-center justify-center space-x-2 transition-colors min-w-[150px] ${activeTab === 'monthly' ? 'text-primary-400 border-b-2 border-primary-400 bg-gray-700/50' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            >
                <UsersIcon />
                <span>Bupot Bulanan</span>
            </button>
            <button
                onClick={() => setActiveTab('nonFinal')}
                className={`flex-1 py-4 text-center font-bold text-sm flex items-center justify-center space-x-2 transition-colors min-w-[150px] ${activeTab === 'nonFinal' ? 'text-accent-400 border-b-2 border-accent-400 bg-gray-700/50' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            >
                <CogUserIcon />
                <span>Bupot Final/Tidak Final</span>
            </button>
            <button
                onClick={() => setActiveTab('annual')}
                className={`flex-1 py-4 text-center font-bold text-sm flex items-center justify-center space-x-2 transition-colors min-w-[150px] ${activeTab === 'annual' ? 'text-green-400 border-b-2 border-green-400 bg-gray-700/50' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            >
                <HandshakeIcon />
                <span>Bupot Tahunan A1</span>
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 w-full">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-6 gap-4">
                <div>
                     <h2 className="text-2xl font-bold text-gray-100">
                        {existingEmployee ? 'Edit Perhitungan PPh 21' : 
                         activeTab === 'monthly' ? 'Hitung PPh 21 Bulanan' : 
                         activeTab === 'nonFinal' ? 'Hitung PPh 21 Final/Tidak Final' : 'Hitung PPh 21 Tahunan (A1)'}
                     </h2>
                     <p className="text-gray-400 text-sm mt-1">
                        {activeTab === 'monthly' ? 'Perhitungan untuk masa pajak Januari s.d. November (TER).' :
                         activeTab === 'nonFinal' ? 'Perhitungan untuk pegawai tidak tetap atau penerima penghasilan lain.' :
                         'Perhitungan ulang PPh 21 setahun (Pasal 17) untuk masa pajak Desember atau terakhir.'}
                     </p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 border border-gray-700 rounded-lg bg-black/20">
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
                        className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm bg-gray-700 text-gray-200"
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
                <div className="flex-1 lg:w-1/2 p-4 border border-gray-700 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-200 mb-4 text-center">Rincian Penghasilan Bulanan Ini</h3>
                    <div className="space-y-6">
                        <div className="space-y-4">
                            {/* Penghasilan Pokok */}
                            <div>
                                <h4 className="text-md font-semibold text-primary-400 mb-2">Penghasilan Pokok</h4>
                                <div className="p-4 bg-gray-900 rounded-md">
                                    <InputField label="Gaji Pokok" name="baseSalary" type="text" value={formatNumberForDisplay(formData.baseSalary)} onChange={() => { }} readOnly={true} />
                                </div>
                            </div>

                            {/* Tunjangan Tetap */}
                            <div>
                                <h4 className="text-md font-semibold text-primary-400 mb-2">Tunjangan Tetap</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-900 rounded-md">
                                    <InputField label="Tunjangan Jabatan" name="tunjanganJabatan" type="text" value={formatNumberForDisplay(formData.tunjanganJabatan)} onChange={handleChange} />
                                    <InputField
                                        label="Tunjangan PPh 21"
                                        name="tunjanganPph"
                                        type="text"
                                        value={formatNumberForDisplay(formData.tunjanganPph)}
                                        onChange={() => {}}
                                        readOnly={true}
                                        tooltip="Otomatis terisi 0 jika 'Gross Up' adalah 'Tidak', atau dihitung otomatis jika 'Ya'."
                                    />
                                    <InputField label="Tunjangan Telekomunikasi" name="tunjanganTelekomunikasi" type="text" value={formatNumberForDisplay(formData.tunjanganTelekomunikasi)} onChange={handleChange} />
                                </div>
                                <div className="p-4 bg-gray-900 rounded-md mt-2 space-y-3">
                                    {(formData.customFixedAllowances || []).map((allowance, index) => (
                                        <div key={allowance.id} className="grid grid-cols-10 gap-2 items-end">
                                            <div className="col-span-5">
                                                {index === 0 && <label className="block text-xs font-medium text-gray-400 mb-1">Nama Tunjangan Lain</label>}
                                                <input type="text" placeholder="Nama Tunjangan" value={allowance.name} onChange={(e) => handleCustomAllowanceChange('fixed', index, 'name', e.target.value)} className="w-full text-sm px-2 py-1.5 border border-gray-600 rounded-md bg-gray-700 text-gray-200" />
                                            </div>
                                            <div className="col-span-4">
                                                 {index === 0 && <label className="block text-xs font-medium text-gray-400 mb-1">Jumlah</label>}
                                                <input type="text" placeholder="Jumlah" value={formatNumberForDisplay(allowance.value)} onChange={(e) => handleCustomAllowanceChange('fixed', index, 'value', e.target.value)} className="w-full text-sm px-2 py-1.5 border border-gray-600 rounded-md bg-gray-700 text-gray-200" />
                                            </div>
                                            <div className="col-span-1">
                                                <button type="button" onClick={() => handleDeleteCustomAllowance('fixed', allowance.id)} className="p-1.5 text-red-500 hover:text-red-400 bg-gray-700 hover:bg-gray-600 rounded-md"><TrashIcon /></button>
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => handleAddCustomAllowance('fixed')} className="w-full text-sm font-semibold text-primary-300 hover:text-primary-200 bg-primary-900/50 hover:bg-primary-800/50 py-1.5 px-3 rounded-md flex items-center justify-center space-x-2 transition-colors">
                                        <PlusIcon /><span>Tambah Tunjangan Tetap</span>
                                    </button>
                                </div>
                            </div>

                            {/* Tunjangan Tidak Tetap */}
                            <div>
                                <h4 className="text-md font-semibold text-primary-400 mb-2">Tunjangan Tidak Tetap / Insidentil</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-900 rounded-md">
                                    <InputField label="Tunjangan Makan" name="tunjanganMakan" type="text" value={formatNumberForDisplay(formData.tunjanganMakan)} onChange={handleChange} />
                                    <InputField label="Tunjangan Transportasi" name="tunjanganTransportasi" type="text" value={formatNumberForDisplay(formData.tunjanganTransportasi)} onChange={handleChange} />
                                    <InputField label="Lembur" name="overtimePay" type="text" value={formatNumberForDisplay(formData.overtimePay)} onChange={() => { }} readOnly={true} />
                                    <InputField label="Natura/Kenikmatan" name="facilityValue" type="text" value={formatNumberForDisplay(formData.facilityValue)} onChange={handleChange} />
                                    <InputField label="THR/Bonus" name="bonus" type="text" value={formatNumberForDisplay(formData.bonus)} onChange={handleChange} />
                                </div>
                                <div className="p-4 bg-gray-900 rounded-md mt-2 space-y-3">
                                    {(formData.customVariableAllowances || []).map((allowance, index) => (
                                        <div key={allowance.id} className="grid grid-cols-10 gap-2 items-end">
                                            <div className="col-span-5">
                                                {index === 0 && <label className="block text-xs font-medium text-gray-400 mb-1">Nama Tunjangan Lain</label>}
                                                <input type="text" placeholder="Nama Tunjangan" value={allowance.name} onChange={(e) => handleCustomAllowanceChange('variable', index, 'name', e.target.value)} className="w-full text-sm px-2 py-1.5 border border-gray-600 rounded-md bg-gray-700 text-gray-200" />
                                            </div>
                                            <div className="col-span-4">
                                                {index === 0 && <label className="block text-xs font-medium text-gray-400 mb-1">Jumlah</label>}
                                                <input type="text" placeholder="Jumlah" value={formatNumberForDisplay(allowance.value)} onChange={(e) => handleCustomAllowanceChange('variable', index, 'value', e.target.value)} className="w-full text-sm px-2 py-1.5 border border-gray-600 rounded-md bg-gray-700 text-gray-200" />
                                            </div>
                                            <div className="col-span-1">
                                                <button type="button" onClick={() => handleDeleteCustomAllowance('variable', allowance.id)} className="p-1.5 text-red-500 hover:text-red-400 bg-gray-700 hover:bg-gray-600 rounded-md"><TrashIcon /></button>
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => handleAddCustomAllowance('variable')} className="w-full text-sm font-semibold text-primary-300 hover:text-primary-200 bg-primary-900/50 hover:bg-primary-800/50 py-1.5 px-3 rounded-md flex items-center justify-center space-x-2 transition-colors">
                                        <PlusIcon /><span>Tambah Tunjangan Tdk Tetap</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                         <div>
                            <h4 className="text-md font-semibold text-primary-400 mb-2">Komponen Pengurangan Penghasilan</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-900 rounded-md">
                               <InputField label="Biaya Jabatan (5%)" name="biayaJabatan" type="text" value={formatNumberForDisplay(biayaJabatan)} onChange={()=>{}} readOnly={true}/>
                               <CurrencyInputWithButton 
                                    label="JHT - Karyawan (2%)" 
                                    name="pensionDeduction" 
                                    value={formData.pensionDeduction} 
                                    onChange={handleChange} 
                                    onButtonClick={() => setFormData(prev => {
                                        const customFixedTotal = (prev.customFixedAllowances || []).reduce((sum, item) => sum + item.value, 0);
                                        const deductionBase = prev.baseSalary + prev.tunjanganJabatan + prev.tunjanganPph + prev.tunjanganTelekomunikasi + customFixedTotal;
                                        return {...prev, pensionDeduction: Math.round(deductionBase * 0.02)};
                                    })} 
                                    buttonText="Auto"
                                />
                               <CurrencyInputWithButton 
                                    label="BPJS Kesehatan (1%)" 
                                    name="bpjsDeduction" 
                                    value={formData.bpjsDeduction} 
                                    onChange={handleChange} 
                                    onButtonClick={() => setFormData(prev => {
                                        const customFixedTotal = (prev.customFixedAllowances || []).reduce((sum, item) => sum + item.value, 0);
                                        const deductionBase = prev.baseSalary + prev.tunjanganJabatan + prev.tunjanganPph + prev.tunjanganTelekomunikasi + customFixedTotal;
                                        return {...prev, bpjsDeduction: Math.round(Math.min(deductionBase, 12000000) * 0.01)};
                                    })} 
                                    buttonText="Auto"
                                />
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
                <div className="flex-1 lg:w-1/2 p-4 border border-gray-700 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-200 mb-4 text-center">
                        {activeTab === 'annual' ? 'Perhitungan PPh 21 Tahunan (A1)' : 'Perhitungan PPh 21 Bulanan (TER)'}
                    </h3>
                    
                    <div className="space-y-4">
                        {activeTab === 'annual' && (
                            <div className="p-4 bg-gray-900 rounded-md border border-gray-600 space-y-4 mb-4">
                                <h4 className="font-semibold text-green-400">Akumulasi Masa Sebelumnya</h4>
                                <InputField 
                                    label="Penghasilan Neto Masa Sebelumnya" 
                                    name="netIncomeAccumulated" 
                                    type="text" 
                                    value={formatNumberForDisplay(formData.netIncomeAccumulated || 0)} 
                                    onChange={handleChange}
                                    tooltip="Total penghasilan neto dari Januari s.d. November (atau masa sebelum Desember)."
                                />
                                <InputField 
                                    label="PPh Dipotong s.d. Masa Sebelumnya" 
                                    name="taxPaidAccumulated" 
                                    type="text" 
                                    value={formatNumberForDisplay(formData.taxPaidAccumulated || 0)} 
                                    onChange={handleChange}
                                    tooltip="Total PPh 21 yang sudah dipotong dan disetor dari masa Januari s.d. November."
                                />
                            </div>
                        )}

                        <InputField label="Fasilitas" name="taxFacility" value={formData.taxFacility} onChange={handleChange}>
                            <option>Tanpa Fasilitas</option><option>PPh Ditanggung Pemerintah (DTP)</option><option>Fasilitas Lainnya</option>
                        </InputField>
                        <InputField label="Nama Objek Pajak" name="taxObjectName" value={formData.taxObjectName} onChange={handleChange}>
                            <option>Penghasilan yang Diterima atau Diperoleh Pegawai Tetap</option>
                            <option>Penghasilan yang Diterima atau Diperoleh Pensiunan Secara Teratur</option>
                            <option>Penghasilan yang Diterima atau Diperoleh Pegawai Tetap yang Menerima fasilitas di Daerah Tertentu</option>
                        </InputField>
                        <InputField label="Kode Objek Pajak" name="taxObjectCode" value={formData.taxObjectCode} onChange={()=>{}} readOnly={true} />
                        <InputField label="Penghasilan Bruto Bulan Ini" name="grossIncomeDisplay" type="text" value={formatNumberForDisplay(totalPenghasilan)} onChange={()=>{}} readOnly={true} />
                        
                        {activeTab !== 'annual' && (
                             <InputField label="Tarif TER" name="terRate" value={`${(terRate * 100).toFixed(2)}%`} onChange={()=>{}} readOnly={true} className="font-bold text-xl" tooltip="Tarif Efektif Rata-rata berdasarkan PMK 168/2023."/>
                        )}

                        <div className="bg-gray-900 p-4 rounded-lg mt-4 border border-gray-600">
                             <p className="text-sm font-semibold text-gray-400 mb-1">
                                {activeTab === 'annual' ? 'Status Kurang/Lebih Bayar' : 'PPh Pasal 21 Bulan Ini'}
                             </p>
                             <p className={`text-3xl font-bold ${activeTab === 'annual' ? 'text-green-400' : 'text-white'}`}>
                                {formatNumberForDisplay(pph21)}
                             </p>
                        </div>
                        
                        {activeTab !== 'annual' && (
                            <div className="p-4 bg-accent-800 rounded-lg text-white mt-4">
                                <p className="text-sm font-semibold text-accent-200">Take Home Pay</p>
                                <p className="text-2xl font-bold">{formatNumberForDisplay(takeHomePay)}</p>
                            </div>
                        )}

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
                <button
                    type="submit"
                    disabled={isDuplicate || !formData.masterEmployeeId}
                    className="bg-accent-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-accent-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                    title={isDuplicate ? 'Data untuk karyawan dan periode ini sudah ada.' : !formData.masterEmployeeId ? 'Pilih karyawan terlebih dahulu' : 'Simpan Perhitungan PPh 21'}
                >
                    Simpan & Hitung Pajak
                </button>
            </div>
        </form>
    </div>
  );
};

export default EmployeeForm;
