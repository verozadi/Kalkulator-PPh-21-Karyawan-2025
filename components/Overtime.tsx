
import * as React from 'react';
import { MasterEmployee, OvertimeRecord } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { getAvailableTaxYears } from '../constants';

interface OvertimeProps {
  masterEmployees: MasterEmployee[];
  existingRecords: OvertimeRecord[];
  onSave: (records: OvertimeRecord[]) => Promise<void> | void;
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
const SpinnerIcon = () => <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;


const AddEmployeeOvertimeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (masterEmployeeId: string) => void;
    availableEmployees: MasterEmployee[];
}> = ({ isOpen, onClose, onAdd, availableEmployees }) => {
    const [selectedId, setSelectedId] = React.useState('');

    if (!isOpen) return null;

    const handleAdd = () => {
        if (selectedId) {
            onAdd(selectedId);
            setSelectedId('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
                <h3 className="text-lg font-bold text-gray-100 mb-4">Tambah Karyawan Lembur</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Pilih Karyawan</label>
                    <select
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-primary-500"
                    >
                        <option value="">-- Pilih Karyawan --</option>
                        {availableEmployees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-300 hover:text-white">Batal</button>
                    <button 
                        onClick={handleAdd} 
                        disabled={!selectedId}
                        className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Tambah
                    </button>
                </div>
            </div>
        </div>
    );
};

const Overtime: React.FC<OvertimeProps> = ({ masterEmployees, existingRecords, onSave }) => {
    const [year, setYear] = React.useState(new Date().getFullYear());
    const [month, setMonth] = React.useState(new Date().getMonth() + 1);
    const [records, setRecords] = React.useState<OvertimeRecord[]>([]);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);

    // Initialize/Sync records from existing data for the selected period
    React.useEffect(() => {
        const periodRecords = existingRecords.filter(r => r.year === year && r.month === month);
        setRecords(periodRecords);
    }, [year, month, existingRecords]);

    const handleAddEmployee = (masterEmployeeId: string) => {
        const existing = records.find(r => r.masterEmployeeId === masterEmployeeId);
        if (existing) return;

        const newRecord: OvertimeRecord = {
            id: uuidv4(),
            masterEmployeeId,
            year,
            month,
            dayType: 'workday',
            workSystem: '5-day',
            overtimeHours: 0,
            overtimeMinutes: 0,
            totalPay: 0,
            overtimeDate: new Date().toISOString().split('T')[0],
            startTime: '17:00',
            endTime: '18:00',
            activity: '',
            isManualPay: false,
            includePositionAllowance: false
        };
        setRecords([...records, newRecord]);
    };

    const handleRemoveRecord = (id: string) => {
        setRecords(records.filter(r => r.id !== id));
    };

    const handleChange = (id: string, field: keyof OvertimeRecord, value: any) => {
        setRecords(prev => prev.map(record => {
            if (record.id !== id) return record;

            const updatedRecord = { ...record, [field]: value };

            if (!updatedRecord.isManualPay) {
                const master = masterEmployees.find(m => m.id === updatedRecord.masterEmployeeId);
                const base = master ? master.baseSalary + (updatedRecord.includePositionAllowance ? (master.positionAllowance || 0) : 0) : 0;
                updatedRecord.totalPay = calculateDepnakerOvertimePay(
                    base,
                    updatedRecord.dayType,
                    updatedRecord.workSystem,
                    updatedRecord.overtimeHours,
                    updatedRecord.overtimeMinutes
                );
            }

            return updatedRecord;
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // We need to save the current state of records to the global store
            await onSave(records);
        } finally {
            setIsSaving(false);
        }
    };

    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    return (
        <div className="space-y-6 animate-fade-in-up pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center space-x-3">
                        <ClockIcon />
                        <h1 className="text-3xl font-bold text-gray-100">Perhitungan Lembur</h1>
                    </div>
                    <p className="text-gray-400 mt-1">Hitung upah lembur karyawan berdasarkan aturan Depnaker.</p>
                </div>
                
                <div className="flex items-center space-x-3 bg-gray-800 p-2 rounded-lg border border-gray-700">
                    <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-primary-500">
                        {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                    <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-primary-500">
                        {getAvailableTaxYears().map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-200">Daftar Lembur Periode Ini</h2>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center space-x-2 text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded transition-colors"
                    >
                        <PlusCircleIcon />
                        <span>Tambah Karyawan</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase w-48">Nama Karyawan</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase w-32">Tipe Hari</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase w-32">Durasi (Jam)</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase w-32">Durasi (Menit)</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase w-40">Basis (Gaji+Tunj)</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-300 uppercase w-40">Upah Lembur</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-300 uppercase w-16">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {records.length > 0 ? records.map((record) => {
                                const master = masterEmployees.find(m => m.id === record.masterEmployeeId);
                                const base = master ? master.baseSalary + (record.includePositionAllowance ? (master.positionAllowance || 0) : 0) : 0;

                                return (
                                    <tr key={record.id} className="hover:bg-gray-700/50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm font-medium text-white">{master?.fullName || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">{master?.employeeId}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <select 
                                                value={record.dayType} 
                                                onChange={(e) => handleChange(record.id, 'dayType', e.target.value)}
                                                className="bg-gray-700 text-white text-xs rounded border border-gray-600 px-2 py-1 w-full"
                                            >
                                                <option value="workday">Hari Kerja</option>
                                                <option value="holiday">Hari Libur</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <input 
                                                type="number" 
                                                min="0"
                                                value={record.overtimeHours}
                                                onChange={(e) => handleChange(record.id, 'overtimeHours', parseInt(e.target.value) || 0)}
                                                className="bg-gray-700 text-white text-xs rounded border border-gray-600 px-2 py-1 w-20"
                                            />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <input 
                                                type="number" 
                                                min="0"
                                                max="59"
                                                value={record.overtimeMinutes}
                                                onChange={(e) => handleChange(record.id, 'overtimeMinutes', parseInt(e.target.value) || 0)}
                                                className="bg-gray-700 text-white text-xs rounded border border-gray-600 px-2 py-1 w-20"
                                            />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                                            <div className="flex flex-col">
                                                <span>{formatCurrency(base)}</span>
                                                <label className="flex items-center space-x-1 text-[10px] mt-1 cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={record.includePositionAllowance || false}
                                                        onChange={(e) => handleChange(record.id, 'includePositionAllowance', e.target.checked)}
                                                        className="form-checkbox h-3 w-3 text-primary-500 rounded bg-gray-700 border-gray-600"
                                                    />
                                                    <span>+ Tunj. Jabatan</span>
                                                </label>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-bold text-primary-400">
                                            {formatCurrency(record.totalPay)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            <button onClick={() => handleRemoveRecord(record.id)} className="text-red-400 hover:text-red-300 p-1">
                                                <TrashIcon />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                        Belum ada data lembur untuk periode ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 flex justify-end z-20 md:pl-64">
                <div className="flex items-center space-x-4 mr-4">
                    <p className="text-gray-400 text-sm">Total Lembur Periode Ini:</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(records.reduce((sum, r) => sum + r.totalPay, 0))}</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isSaving || records.length === 0}
                    className="bg-primary-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-900/50 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                    {isSaving ? (
                        <>
                            <SpinnerIcon />
                            <span>Menyimpan...</span>
                        </>
                    ) : (
                        <span>Simpan Data Lembur</span>
                    )}
                </button>
            </div>

            <AddEmployeeOvertimeModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onAdd={handleAddEmployee} 
                availableEmployees={masterEmployees} 
            />
        </div>
    );
};

export default Overtime;
