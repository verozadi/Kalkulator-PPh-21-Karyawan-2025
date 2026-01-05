
import * as React from 'react';
import { MasterEmployee, OvertimeRecord } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { getAvailableTaxYears } from '../constants';

interface OvertimeProps {
  masterEmployees: MasterEmployee[];
  existingRecords: OvertimeRecord[];
  onSave: (records: OvertimeRecord[]) => void;
}

const formatCurrency = (value: number): string => {
    if (value === 0) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
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

const calculateDepnakerOvertimePay = (
    calculationBase: number, // Base Salary + (optional) Allowance
    dayType: 'workday' | 'holiday',
    workSystem: '5-day' | '6-day',
    hours: number,
    minutes: number
): number => {
    if (calculationBase <= 0 || (hours <= 0 && minutes <= 0)) {
        return 0;
    }

    const hourlyRate = calculationBase / 173;
    const totalDuration = hours + (minutes / 60);

    let overtimePay = 0;

    if (dayType === 'workday') {
        if (totalDuration > 0) {
            const firstHourPay = Math.min(1, totalDuration) * 1.5 * hourlyRate;
            const subsequentHours = Math.max(0, totalDuration - 1);
            const subsequentHoursPay = subsequentHours * 2 * hourlyRate;
            overtimePay = firstHourPay + subsequentHoursPay;
        }
    } else { // holiday
        if (workSystem === '6-day') {
            if (totalDuration > 0) {
                const first7HoursPay = Math.min(7, totalDuration) * 2 * hourlyRate;
                const eighthHour = totalDuration > 7 ? Math.min(1, totalDuration - 7) : 0;
                const eighthHourPay = eighthHour * 3 * hourlyRate;
                const subsequentHours = Math.max(0, totalDuration - 8);
                const subsequentHoursPay = subsequentHours * 4 * hourlyRate;
                overtimePay = first7HoursPay + eighthHourPay + subsequentHoursPay;
            }
        } else { // 5-day
            if (totalDuration > 0) {
                const first8HoursPay = Math.min(8, totalDuration) * 2 * hourlyRate;
                const ninthHour = totalDuration > 8 ? Math.min(1, totalDuration - 9) : 0;
                const ninthHourPay = ninthHour * 3 * hourlyRate;
                const subsequentHours = Math.max(0, totalDuration - 9);
                const subsequentHoursPay = subsequentHours * 4 * hourlyRate;
                overtimePay = first8HoursPay + ninthHourPay + subsequentHoursPay;
            }
        }
    }

    return Math.round(overtimePay);
};


// --- Icons ---
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;


const AddEmployeeOvertimeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (masterEmployeeId: string) => void;
    availableEmployees: MasterEmployee[];
}> = ({ isOpen, onClose, onAdd, availableEmployees }) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [suggestions, setSuggestions] = React.useState<MasterEmployee[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setSuggestions([]);
            setSelectedEmployeeId(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        setSelectedEmployeeId(null);

        if (value.length >= 2) {
            const filtered = availableEmployees.filter(emp =>
                emp.fullName.toLowerCase().includes(value.toLowerCase()) ||
                emp.employeeId.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (employee: MasterEmployee) => {
        setSearchTerm(employee.fullName);
        setSelectedEmployeeId(employee.id);
        setSuggestions([]);
    };

    const handleAddClick = () => {
        if (selectedEmployeeId) {
            onAdd(selectedEmployeeId);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-gray-100">Tambah Lembur Karyawan</h2>
                    <p className="text-sm text-gray-400 mt-1">Pilih karyawan untuk ditambahkan ke daftar lembur periode ini.</p>
                </div>
                <div className="p-6">
                    {availableEmployees.length > 0 ? (
                        <div className="relative">
                            <label htmlFor="employee-search" className="block text-sm font-medium text-gray-300 mb-2">
                                Cari Karyawan (min. 2 huruf)
                            </label>
                            <input
                                id="employee-search"
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                                autoComplete="off"
                                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200"
                                placeholder="Ketik nama atau ID karyawan..."
                            />
                            {suggestions.length > 0 && (
                                <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
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
                    ) : (
                        <p className="text-center text-gray-400">Semua karyawan aktif sudah ada di daftar lembur.</p>
                    )}
                </div>
                <div className="flex justify-end p-4 bg-gray-900 rounded-b-lg space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500">Batal</button>
                    <button
                        type="button"
                        onClick={handleAddClick}
                        disabled={!selectedEmployeeId}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        Tambah
                    </button>
                </div>
            </div>
        </div>
    );
};


const Overtime: React.FC<OvertimeProps> = ({ masterEmployees, existingRecords, onSave }) => {
  const [selectedYear, setSelectedYear] = React.useState(2025);
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth() + 1);
  const [workSystem, setWorkSystem] = React.useState<'5-day' | '6-day'>('5-day');
  const [currentPeriodRecords, setCurrentPeriodRecords] = React.useState<OvertimeRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  const activeMasterEmployees = React.useMemo(() => masterEmployees.filter(emp => emp.isActive), [masterEmployees]);

  React.useEffect(() => {
    const relevantRecords = existingRecords.filter(r => r.year === selectedYear && r.month === selectedMonth);
    // Initialize default fields if missing from old records
    const normalizedRecords = relevantRecords.map(r => ({
        ...r,
        overtimeDate: r.overtimeDate || `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`,
        startTime: r.startTime || '17:00',
        endTime: r.endTime || '18:00',
        activity: r.activity || '',
        isManualPay: r.isManualPay || false,
        includePositionAllowance: r.includePositionAllowance || false,
    }));
    setCurrentPeriodRecords(normalizedRecords);
    
    if (normalizedRecords.length > 0 && normalizedRecords[0].workSystem) {
        setWorkSystem(normalizedRecords[0].workSystem);
    } else {
        setWorkSystem('5-day'); 
    }
  }, [selectedYear, selectedMonth, existingRecords]);
  
  // Recalculate Logic
  const recalculateAll = React.useCallback((records: OvertimeRecord[], currentWorkSystem: '5-day' | '6-day') => {
      return records.map(rec => {
            if (rec.isManualPay) return { ...rec, workSystem: currentWorkSystem };

            const employee = masterEmployees.find(emp => emp.id === rec.masterEmployeeId);
            if (!employee) return rec;
            
            const calculationBase = employee.baseSalary + (rec.includePositionAllowance ? (employee.positionAllowance || 0) : 0);

            const newTotalPay = calculateDepnakerOvertimePay(
                calculationBase, rec.dayType, currentWorkSystem, rec.overtimeHours, rec.overtimeMinutes
            );
            return { ...rec, totalPay: newTotalPay, workSystem: currentWorkSystem };
        });
  }, [masterEmployees]);

  React.useEffect(() => {
    setCurrentPeriodRecords(prev => recalculateAll(prev, workSystem));
  }, [workSystem, recalculateAll]);

  const handleAddOvertimeEntry = (masterEmployeeId: string) => {
    const defaultDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
    // Find if user already has records to inherit setting
    const existingRec = currentPeriodRecords.find(r => r.masterEmployeeId === masterEmployeeId);
    const inheritIncludeAllowance = existingRec ? existingRec.includePositionAllowance : false;

    const newRecord: OvertimeRecord = {
      id: uuidv4(),
      masterEmployeeId,
      year: selectedYear,
      month: selectedMonth,
      dayType: 'workday',
      workSystem: workSystem,
      overtimeHours: 1,
      overtimeMinutes: 0,
      totalPay: 0,
      // New default fields
      overtimeDate: defaultDate,
      startTime: '17:00',
      endTime: '18:00',
      activity: '',
      isManualPay: false,
      includePositionAllowance: inheritIncludeAllowance,
    };
    
    // Initial calculate based on default 1 hour
    const employee = masterEmployees.find(emp => emp.id === masterEmployeeId);
    if(employee) {
        const base = employee.baseSalary + (inheritIncludeAllowance ? (employee.positionAllowance || 0) : 0);
        newRecord.totalPay = calculateDepnakerOvertimePay(base, newRecord.dayType, workSystem, 1, 0);
    }

    setCurrentPeriodRecords(prev => [...prev, newRecord]);
  };

  const handleAddEmployeeToOvertime = (masterEmployeeId: string) => {
    handleAddOvertimeEntry(masterEmployeeId);
  };

  const handleRemoveEmployeeOvertime = (masterEmployeeId: string) => {
      setCurrentPeriodRecords(prev => prev.filter(r => r.masterEmployeeId !== masterEmployeeId));
  };

  const handleDeleteOvertimeEntry = (recordId: string) => {
    setCurrentPeriodRecords(prev => prev.filter(r => r.id !== recordId));
  };

  const handleToggleIncludeAllowance = (masterEmployeeId: string, newValue: boolean) => {
      setCurrentPeriodRecords(prev => {
          // Update the setting for ALL records of this employee
          const updatedRecords = prev.map(rec => {
              if (rec.masterEmployeeId === masterEmployeeId) {
                  return { ...rec, includePositionAllowance: newValue };
              }
              return rec;
          });
          // Trigger recalculation with new settings
          return recalculateAll(updatedRecords, workSystem);
      });
  };

  const calculateDurationFromTimes = (start: string, end: string) => {
      if (!start || !end) return { hours: 0, minutes: 0 };
      
      const [startH, startM] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);
      
      let startTotal = startH * 60 + startM;
      let endTotal = endH * 60 + endM;
      
      // Handle cross-midnight (e.g. 23:00 to 02:00)
      if (endTotal < startTotal) {
          endTotal += 24 * 60;
      }
      
      const diff = endTotal - startTotal;
      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;
      
      return { hours, minutes };
  };

  const handleInputChange = (recordId: string, field: keyof OvertimeRecord, value: string | number | boolean) => {
    setCurrentPeriodRecords(prev =>
      prev.map(rec => {
        if (rec.id === recordId) {
          const employee = masterEmployees.find(emp => emp.id === rec.masterEmployeeId);
          if (!employee) return rec;

          let updatedRecord = { ...rec, [field]: value };

          // If user edits totalPay directly
          if (field === 'totalPay') {
              updatedRecord.isManualPay = true;
          }
          // If user changes parameters affecting calculation
          else if (field === 'startTime' || field === 'endTime' || field === 'dayType' || field === 'overtimeHours' || field === 'overtimeMinutes') {
                // Auto-calculate duration if start or end time changes
                if (field === 'startTime' || field === 'endTime') {
                    const { hours, minutes } = calculateDurationFromTimes(
                        field === 'startTime' ? String(value) : rec.startTime,
                        field === 'endTime' ? String(value) : rec.endTime
                    );
                    updatedRecord.overtimeHours = hours;
                    updatedRecord.overtimeMinutes = minutes;
                }

                // Recalculate Pay only if NOT manual
                if (!updatedRecord.isManualPay) {
                    const calculationBase = employee.baseSalary + (updatedRecord.includePositionAllowance ? (employee.positionAllowance || 0) : 0);
                    const newTotalPay = calculateDepnakerOvertimePay(
                        calculationBase, updatedRecord.dayType, workSystem, updatedRecord.overtimeHours, updatedRecord.overtimeMinutes
                    );
                    updatedRecord.totalPay = newTotalPay;
                }
          }

          return updatedRecord;
        }
        return rec;
      })
    );
  };
  
  const handleResetToAuto = (recordId: string) => {
    setCurrentPeriodRecords(prev => prev.map(rec => {
        if (rec.id === recordId) {
             const employee = masterEmployees.find(emp => emp.id === rec.masterEmployeeId);
             if (!employee) return rec;
             const calculationBase = employee.baseSalary + (rec.includePositionAllowance ? (employee.positionAllowance || 0) : 0);
             const newTotalPay = calculateDepnakerOvertimePay(
                calculationBase, rec.dayType, workSystem, rec.overtimeHours, rec.overtimeMinutes
             );
             return { ...rec, totalPay: newTotalPay, isManualPay: false };
        }
        return rec;
    }));
  };
  
  const handleSaveClick = () => {
    const recordsToSave = currentPeriodRecords.filter(
      data => data.overtimeHours > 0 || data.overtimeMinutes > 0
    );
    const otherRecords = existingRecords.filter(r => r.year !== selectedYear || r.month !== selectedMonth);
    onSave([...otherRecords, ...recordsToSave]);
  };

  const employeesWithOvertime = React.useMemo(() => {
      const employeeIdsInPeriod = new Set(currentPeriodRecords.map(r => r.masterEmployeeId));
      return activeMasterEmployees.filter(emp => employeeIdsInPeriod.has(emp.id));
  }, [currentPeriodRecords, activeMasterEmployees]);

  const availableEmployeesForModal = React.useMemo(() => {
      return activeMasterEmployees; 
  }, [activeMasterEmployees]);

  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
            <div className="flex items-center space-x-3">
                <ClockIcon />
                <h1 className="text-3xl font-bold text-gray-100">Input & Perhitungan Lembur</h1>
            </div>
            <p className="text-gray-400 mt-1">Kelola data lembur karyawan sesuai peraturan Depnaker.</p>
        </div>
         <div className="flex items-center space-x-4">
            <button onClick={() => setIsModalOpen(true)} className="bg-primary-600 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2">
              <PlusCircleIcon />
              <span>Tambah Karyawan</span>
            </button>
            <button onClick={handleSaveClick} className="bg-accent-500 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-accent-600 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-accent-900/50">
              Simpan Data Lembur
            </button>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">Tahun</label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200 [&>option]:bg-gray-800">
                  {getAvailableTaxYears().map(year => <option key={year} value={year}>{year}</option>)}
              </select>
          </div>
          <div><label className="text-sm font-medium text-gray-400 mb-2 block">Bulan</label><select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200 [&>option]:bg-gray-800">{months.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select></div>
          <div><label className="text-sm font-medium text-gray-400 mb-2 block">Sistem Jam Kerja</label><select value={workSystem} onChange={(e) => setWorkSystem(e.target.value as '5-day' | '6-day')} className="w-full px-4 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200 [&>option]:bg-gray-800"><option value="5-day">5 Hari Kerja (40 Jam/Minggu)</option><option value="6-day">6 Hari Kerja (40 Jam/Minggu)</option></select></div>
        </div>
      </div>

      <div className="overflow-x-auto bg-gray-800 rounded-lg border border-gray-700">
        <table className="min-w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider w-40">Nama Karyawan</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">Tanggal</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">Tipe Hari</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">Jam</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">Durasi</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Kegiatan</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-300 uppercase tracking-wider">Upah Lembur</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800">
            {employeesWithOvertime.length > 0 ? employeesWithOvertime.map((employee) => {
              const employeeRecords = currentPeriodRecords.filter(r => r.masterEmployeeId === employee.id);
              const employeeTotalPay = employeeRecords.reduce((sum, r) => sum + r.totalPay, 0);
              // Use first record to determine the toggle state for the group
              const isIncluded = employeeRecords[0]?.includePositionAllowance || false;

              return (
                <React.Fragment key={employee.id}>
                  {/* Summary Row per Employee */}
                  <tr className="border-t border-b border-gray-700 bg-gray-700/30">
                    <td className="px-4 py-3" colSpan={2}>
                        <div className="flex items-center gap-3">
                           <button onClick={() => handleRemoveEmployeeOvertime(employee.id)} className="p-1 text-red-500 hover:text-red-400 hover:bg-red-800/50 rounded-full" title="Hapus Semua Lembur Karyawan Ini">
                                <TrashIcon />
                           </button>
                           <div>
                                <div className="text-sm font-medium text-gray-200">{employee.fullName}</div>
                                <div className="text-xs text-gray-400">
                                    Gaji: {formatCurrency(employee.baseSalary)} 
                                    {employee.positionAllowance > 0 && ` + Tunj: ${formatCurrency(employee.positionAllowance)}`}
                                </div>
                           </div>
                        </div>
                    </td>
                    <td colSpan={2} className="px-4 py-3">
                        {/* Toggle Position Allowance */}
                        {employee.positionAllowance > 0 && (
                            <div className="flex items-center justify-center">
                                <label className="inline-flex items-center cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={isIncluded}
                                        onChange={(e) => handleToggleIncludeAllowance(employee.id, e.target.checked)}
                                    />
                                    <div className="relative w-9 h-5 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                                    <span className="ms-3 text-xs font-medium text-gray-400 group-hover:text-gray-200 transition-colors">Hitung dari Gaji + Tunjangan</span>
                                </label>
                            </div>
                        )}
                    </td>
                    <td colSpan={2} className="px-4 py-3 text-center">
                         <button onClick={() => handleAddOvertimeEntry(employee.id)} className="text-sm font-semibold text-green-400 hover:text-green-300 flex items-center justify-center gap-1 mx-auto bg-green-900/30 px-3 py-1 rounded-md border border-green-800"><PlusCircleIcon /> Tambah Baris Lembur</button>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-lg text-accent-400">{formatCurrency(employeeTotalPay)}</td>
                  </tr>
                  
                  {/* Detail Rows (Individual Overtime Records) */}
                  {employeeRecords.map(record => (
                    <tr key={record.id} className="hover:bg-gray-700/50 border-b border-gray-800">
                      <td className="px-4 py-2"></td>
                      <td className="px-2 py-2">
                           <input type="date" value={record.overtimeDate} onChange={(e) => handleInputChange(record.id, 'overtimeDate', e.target.value)} className="w-full px-2 py-1 border border-gray-600 rounded-md bg-gray-900 text-gray-200 text-xs" />
                      </td>
                      <td className="px-2 py-2">
                          <select value={record.dayType} onChange={(e) => handleInputChange(record.id, 'dayType', e.target.value)} className="w-full px-2 py-1 border border-gray-600 rounded-md bg-gray-900 text-gray-200 text-xs focus:ring-primary-500 focus:border-primary-500 [&>option]:bg-gray-800">
                              <option value="workday">Hari Kerja</option>
                              <option value="holiday">Hari Libur</option>
                          </select>
                      </td>
                      <td className="px-2 py-2">
                          <div className="flex items-center gap-1">
                              <input type="time" value={record.startTime} onChange={(e) => handleInputChange(record.id, 'startTime', e.target.value)} className="w-20 px-1 py-1 border border-gray-600 rounded-md bg-gray-900 text-gray-200 text-xs text-center" />
                              <span className="text-gray-500 text-xs">s/d</span>
                              <input type="time" value={record.endTime} onChange={(e) => handleInputChange(record.id, 'endTime', e.target.value)} className="w-20 px-1 py-1 border border-gray-600 rounded-md bg-gray-900 text-gray-200 text-xs text-center" />
                          </div>
                      </td>
                       <td className="px-2 py-2 text-center">
                           <div className="text-xs font-mono text-gray-300 bg-gray-800 py-1 px-2 rounded border border-gray-600">
                               {record.overtimeHours}j {record.overtimeMinutes}m
                           </div>
                      </td>
                      <td className="px-2 py-2">
                           <input type="text" placeholder="Ket. Kegiatan" value={record.activity} onChange={(e) => handleInputChange(record.id, 'activity', e.target.value)} className="w-full px-2 py-1 border border-gray-600 rounded-md bg-gray-900 text-gray-200 text-xs" />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right flex items-center justify-end gap-3">
                         <div className="flex items-center justify-end gap-2">
                            {record.isManualPay && (
                                <button onClick={() => handleResetToAuto(record.id)} className="text-xs text-blue-400 hover:text-blue-300 p-1 hover:bg-gray-700 rounded" title="Reset ke Otomatis">
                                    <RefreshIcon />
                                </button>
                            )}
                            <input 
                                type="text" 
                                value={formatNumberForDisplay(record.totalPay)} 
                                onChange={(e) => handleInputChange(record.id, 'totalPay', parseFormattedNumber(e.target.value))}
                                className={`w-24 px-2 py-1 text-right border rounded-md text-xs font-semibold ${record.isManualPay ? 'border-yellow-600 bg-yellow-900/20 text-yellow-200' : 'border-gray-600 bg-gray-900 text-gray-200'}`}
                            />
                        </div>
                        <button onClick={() => handleDeleteOvertimeEntry(record.id)} className="p-1 text-red-500 hover:text-red-400 hover:bg-red-800/50 rounded-full" title="Hapus entri"><TrashIcon /></button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            }) : (
                <tr><td colSpan={7} className="text-center py-10 text-gray-500">Tidak ada data lembur untuk periode ini. Klik "Tambah Karyawan" untuk memulai.</td></tr>
            )}
          </tbody>
        </table>
      </div>

       <AddEmployeeOvertimeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddEmployeeToOvertime}
        availableEmployees={availableEmployeesForModal}
      />
    </div>
  );
};

export default Overtime;
