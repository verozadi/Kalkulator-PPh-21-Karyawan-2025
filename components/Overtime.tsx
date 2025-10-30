import * as React from 'react';
import { MasterEmployee, OvertimeRecord } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface OvertimeProps {
  masterEmployees: MasterEmployee[];
  existingRecords: OvertimeRecord[];
  onSave: (records: OvertimeRecord[]) => void;
}

const formatCurrency = (value: number): string => {
    if (value === 0) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const calculateDepnakerOvertimePay = (
    baseSalary: number,
    dayType: 'workday' | 'holiday',
    workSystem: '5-day' | '6-day',
    hours: number,
    minutes: number
): number => {
    if (baseSalary <= 0 || (hours <= 0 && minutes <= 0)) {
        return 0;
    }

    const hourlyRate = baseSalary / 173;
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
                const ninthHour = totalDuration > 8 ? Math.min(1, totalDuration - 8) : 0;
                const ninthHourPay = ninthHour * 3 * hourlyRate;
                const subsequentHours = Math.max(0, totalDuration - 9);
                const subsequentHoursPay = subsequentHours * 4 * hourlyRate;
                overtimePay = first8HoursPay + ninthHourPay + subsequentHoursPay;
            }
        }
    }

    return Math.round(overtimePay);
};

const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const Overtime: React.FC<OvertimeProps> = ({ masterEmployees, existingRecords, onSave }) => {
  const [selectedYear, setSelectedYear] = React.useState(2025);
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth() + 1);
  const [workSystem, setWorkSystem] = React.useState<'5-day' | '6-day'>('5-day');
  const [currentPeriodRecords, setCurrentPeriodRecords] = React.useState<OvertimeRecord[]>([]);
  
  const activeMasterEmployees = React.useMemo(() => masterEmployees.filter(emp => emp.isActive), [masterEmployees]);


  React.useEffect(() => {
    const relevantRecords = existingRecords.filter(r => r.year === selectedYear && r.month === selectedMonth);
    setCurrentPeriodRecords(relevantRecords);
    
    if (relevantRecords.length > 0 && relevantRecords[0].workSystem) {
        setWorkSystem(relevantRecords[0].workSystem);
    } else {
        setWorkSystem('5-day'); 
    }
  }, [selectedYear, selectedMonth, existingRecords]);
  
  // Recalculate all pays when workSystem changes
  React.useEffect(() => {
    setCurrentPeriodRecords(prevRecords =>
        prevRecords.map(rec => {
            const employee = masterEmployees.find(emp => emp.id === rec.masterEmployeeId);
            if (!employee) return rec;
            
            const newTotalPay = calculateDepnakerOvertimePay(
                employee.baseSalary, rec.dayType, workSystem, rec.overtimeHours, rec.overtimeMinutes
            );
            return { ...rec, totalPay: newTotalPay, workSystem };
        })
    );
  }, [workSystem, masterEmployees]);

  const handleAddOvertime = (masterEmployeeId: string) => {
    const newRecord: OvertimeRecord = {
      id: uuidv4(),
      masterEmployeeId,
      year: selectedYear,
      month: selectedMonth,
      dayType: 'workday',
      workSystem: workSystem,
      overtimeHours: 0,
      overtimeMinutes: 0,
      totalPay: 0,
    };
    setCurrentPeriodRecords(prev => [...prev, newRecord]);
  };

  const handleDeleteOvertime = (recordId: string) => {
    setCurrentPeriodRecords(prev => prev.filter(r => r.id !== recordId));
  };

  const handleInputChange = (recordId: string, field: keyof OvertimeRecord, value: string | number) => {
    setCurrentPeriodRecords(prev =>
      prev.map(rec => {
        if (rec.id === recordId) {
          const employee = masterEmployees.find(emp => emp.id === rec.masterEmployeeId);
          if (!employee) return rec;

          const processedValue = (field === 'overtimeHours' || field === 'overtimeMinutes') ? Number(value) || 0 : value;
          const updatedRecord = { ...rec, [field]: processedValue };

          const newTotalPay = calculateDepnakerOvertimePay(
            employee.baseSalary, updatedRecord.dayType, workSystem, updatedRecord.overtimeHours, updatedRecord.overtimeMinutes
          );
          return { ...updatedRecord, totalPay: newTotalPay };
        }
        return rec;
      })
    );
  };
  
  const handleSaveClick = () => {
    const recordsToSave = currentPeriodRecords.filter(
      data => data.overtimeHours > 0 || data.overtimeMinutes > 0
    );
    const otherRecords = existingRecords.filter(r => r.year !== selectedYear || r.month !== selectedMonth);
    onSave([...otherRecords, ...recordsToSave]);
  };

  const years = [2026, 2025, 2024];
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
        <button onClick={handleSaveClick} className="bg-accent-500 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-accent-600 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-accent-900/50">
          Simpan Data Lembur
        </button>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div><label className="text-sm font-medium text-gray-400 mb-2 block">Tahun</label><select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200">{years.map(year => <option key={year} value={year}>{year}</option>)}</select></div>
          <div><label className="text-sm font-medium text-gray-400 mb-2 block">Bulan</label><select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200">{months.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select></div>
          <div><label className="text-sm font-medium text-gray-400 mb-2 block">Sistem Jam Kerja</label><select value={workSystem} onChange={(e) => setWorkSystem(e.target.value as '5-day' | '6-day')} className="w-full px-4 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200"><option value="5-day">5 Hari Kerja (40 Jam/Minggu)</option><option value="6-day">6 Hari Kerja (40 Jam/Minggu)</option></select></div>
        </div>
      </div>

      <div className="overflow-x-auto bg-gray-800 rounded-lg border border-gray-700">
        <table className="min-w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider w-1/4">Nama Karyawan</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Gaji Pokok</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">Tipe Hari</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">Durasi Lembur</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-300 uppercase tracking-wider">Total Upah Lembur</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800">
            {activeMasterEmployees.map((employee) => {
              const employeeRecords = currentPeriodRecords.filter(r => r.masterEmployeeId === employee.id);
              const employeeTotalPay = employeeRecords.reduce((sum, r) => sum + r.totalPay, 0);
              return (
                <React.Fragment key={employee.id}>
                  <tr className="border-t border-b border-gray-700 bg-gray-700/30">
                    <td className="px-6 py-3"><div className="text-sm font-medium text-gray-200">{employee.fullName}</div><div className="text-sm text-gray-400">{employee.position}</div></td>
                    <td className="px-6 py-3 text-left">{formatCurrency(employee.baseSalary)}</td>
                    <td className="px-6 py-3 text-center"><button onClick={() => handleAddOvertime(employee.id)} className="text-sm font-semibold text-green-400 hover:text-green-300 flex items-center justify-center gap-1 mx-auto"><PlusCircleIcon /> Tambah Lembur</button></td>
                    <td></td>
                    <td className="px-6 py-3 text-right font-bold text-lg text-accent-400">{formatCurrency(employeeTotalPay)}</td>
                  </tr>
                  {employeeRecords.map(record => (
                    <tr key={record.id} className="hover:bg-gray-700/50">
                      <td colSpan={2}></td>
                      <td className="px-6 py-4 whitespace-nowrap"><select value={record.dayType} onChange={(e) => handleInputChange(record.id, 'dayType', e.target.value)} className="w-full px-2 py-1 border border-gray-600 rounded-md bg-gray-900 text-gray-200 focus:ring-primary-500 focus:border-primary-500"><option value="workday">Hari Kerja Biasa</option><option value="holiday">Hari Libur / Minggu</option></select></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center justify-center gap-2"><input type="number" min="0" value={record.overtimeHours || ''} onChange={(e) => handleInputChange(record.id, 'overtimeHours', e.target.value)} className="w-16 px-2 py-1 border border-gray-600 rounded-md bg-gray-900 text-gray-200 text-center" placeholder="Jam" /><span className="text-gray-400">:</span><input type="number" min="0" max="59" value={record.overtimeMinutes || ''} onChange={(e) => handleInputChange(record.id, 'overtimeMinutes', e.target.value)} className="w-16 px-2 py-1 border border-gray-600 rounded-md bg-gray-900 text-gray-200 text-center" placeholder="Menit" /></div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-right flex items-center justify-end gap-2"><span className="text-sm font-semibold text-accent-400">{formatCurrency(record.totalPay)}</span><button onClick={() => handleDeleteOvertime(record.id)} className="p-1 text-red-500 hover:text-red-400 hover:bg-red-800/50 rounded-full" title="Hapus entri"><TrashIcon /></button></td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
             {masterEmployees.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-gray-500">Tidak ada data karyawan. Silakan tambah di "Daftar Nama Karyawan".</td></tr>
            )}
            {masterEmployees.length > 0 && activeMasterEmployees.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-gray-500">Tidak ada karyawan aktif yang dapat diinputkan lemburnya.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default Overtime;