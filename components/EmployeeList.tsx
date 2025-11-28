
import * as React from 'react';
import * as XLSX from 'xlsx';
import { Employee, Page, MasterEmployee, MaritalStatus, OvertimeRecord, EmployeeData } from '../types';

interface EmployeeListProps {
  employees: Employee[];
  masterEmployees: MasterEmployee[];
  overtimeRecords: OvertimeRecord[];
  onEdit: (employee: Employee) => void;
  onDelete: (employeeId: string) => void;
  navigateTo: (page: Page) => void;
  onOpenDetailModal: (employee: Employee) => void;
  onImport: (employees: Omit<EmployeeData, 'id'>[]) => void;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

// --- Icon Components ---
const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ViewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const ImportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const ChevronDownIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const SortAscIcon = () => <svg className="h-4 w-4 ml-1 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>;
const SortDescIcon = () => <svg className="h-4 w-4 ml-1 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4 4m0 0l4-4m-4 4V4" /></svg>;


type SortableKey = 'employeeId' | 'name' | 'npwp' | 'period' | 'status' | 'grossIncome' | 'finalPPh21Monthly';

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, masterEmployees, overtimeRecords, onEdit, onDelete, navigateTo, onOpenDetailModal, onImport, showNotification }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterYear, setFilterYear] = React.useState('');
  const [filterMonth, setFilterMonth] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isFilterOpen, setIsFilterOpen] = React.useState(true);
  const [sortConfig, setSortConfig] = React.useState<{ key: SortableKey; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
  
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  
  const requestSort = (key: SortableKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleDownloadPphTemplate = () => {
    const headers = [
        'ID Karyawan (dari Data Master)*', 'Tahun Pajak*', 'Bulan Pajak (1-12)*',
        'Tunjangan PPh', 'Tunjangan Jabatan', 'Tunjangan Telekomunikasi',
        'Tunjangan Makan', 'Tunjangan Transportasi', 'Bonus/THR', 'Natura/Kenikmatan',
        'Pot. Pinjaman/Kasbon', 'Potongan Lain', 'JHT - Karyawan', 'BPJS Kesehatan',
        'Gross Up (YA/TIDAK)', 'Fasilitas Pajak (Tanpa Fasilitas/DTP/Fasilitas Lainnya)',
        'Nama Objek Pajak', 'Penandatangan (NPWP/NIK)'
    ];
    const exampleRow = [
        'K001', new Date().getFullYear(), new Date().getMonth() + 1,
        0, 500000, 300000,
        400000, 400000, 1000000, 0,
        0, 0, 100000, 50000,
        'TIDAK', 'Tanpa Fasilitas',
        'Penghasilan yang Diterima atau Diperoleh Pegawai Tetap', 'NPWP'
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
    ws['!cols'] = headers.map(h => ({ wch: h.length + 5 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template PPh 21");
    XLSX.writeFile(wb, "template_import_pph21.xlsx");
};

const handleImportPphClick = () => {
    fileInputRef.current?.click();
};

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = event.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

            if (jsonData.length === 0) {
                showNotification('File Excel kosong atau tidak memiliki data.', 'error');
                return;
            }

            const employeesToImport: Omit<EmployeeData, 'id'>[] = [];
            const errors: string[] = [];

            jsonData.forEach((row, index) => {
                const employeeId = row['ID Karyawan (dari Data Master)*'];
                const year = parseInt(row['Tahun Pajak*'], 10);
                const month = parseInt(row['Bulan Pajak (1-12)*'], 10);

                if (!employeeId || !year || !month || month < 1 || month > 12) {
                    errors.push(`Baris ${index + 2}: ID Karyawan, Tahun, dan Bulan (1-12) wajib diisi dengan format yang benar.`);
                    return;
                }

                const masterEmp = masterEmployees.find(e => e.employeeId === employeeId);
                if (!masterEmp) {
                    errors.push(`Baris ${index + 2}: Karyawan dengan ID '${employeeId}' tidak ditemukan di data master.`);
                    return;
                }

                const employeeOvertimeRecords = overtimeRecords.filter(o =>
                    o.masterEmployeeId === masterEmp.id &&
                    o.year === year &&
                    o.month === month
                );
                const totalOvertimePay = employeeOvertimeRecords.reduce((sum, record) => sum + record.totalPay, 0);

                const taxFacilityOptions = ['Tanpa Fasilitas', 'PPh Ditanggung Pemerintah (DTP)', 'Fasilitas Lainnya'];
                const taxFacility = row['Fasilitas Pajak (Tanpa Fasilitas/DTP/Fasilitas Lainnya)'] || 'Tanpa Fasilitas';
                if (!taxFacilityOptions.includes(taxFacility)) {
                     errors.push(`Baris ${index + 2}: Fasilitas Pajak tidak valid.`);
                     return;
                }
                
                const taxObjectMapping: { [key: string]: EmployeeData['taxObjectCode'] } = {
                    'Penghasilan yang Diterima atau Diperoleh Pegawai Tetap': '21-100-01',
                    'Penghasilan yang Diterima atau Diperoleh Pensiunan Secara Teratur': '21-100-02',
                    'Penghasilan yang Diterima atau Diperoleh Pegawai Tetap yang Menerima fasilitas di Daerah Tertentu': '21-100-03',
                };
                const taxObjectName = row['Nama Objek Pajak'] || 'Penghasilan yang Diterima atau Diperoleh Pegawai Tetap';
                const taxObjectCode = taxObjectMapping[taxObjectName] || '21-100-01';


                const employeeData: Omit<EmployeeData, 'id'> = {
                    masterEmployeeId: masterEmp.id,
                    calculationType: 'monthly', // Default to monthly for imports
                    name: masterEmp.fullName,
                    npwp: masterEmp.npwp,
                    address: masterEmp.address,
                    status: masterEmp.ptkpStatus,
                    employeeStatus: masterEmp.employeeStatus,
                    isForeigner: masterEmp.isForeigner,
                    baseSalary: masterEmp.baseSalary,
                    overtimePay: totalOvertimePay,
                    periodYear: year,
                    periodMonth: month,
                    tunjanganPph: Number(row['Tunjangan PPh'] || 0),
                    tunjanganJabatan: Number(row['Tunjangan Jabatan'] || 0),
                    tunjanganTelekomunikasi: Number(row['Tunjangan Telekomunikasi'] || 0),
                    tunjanganMakan: Number(row['Tunjangan Makan'] || 0),
                    tunjanganTransportasi: Number(row['Tunjangan Transportasi'] || 0),
                    bonus: Number(row['Bonus/THR'] || 0),
                    facilityValue: Number(row['Natura/Kenikmatan'] || 0),
                    loan: Number(row['Pot. Pinjaman/Kasbon'] || 0),
                    otherDeductions: Number(row['Potongan Lain'] || 0),
                    pensionDeduction: Number(row['JHT - Karyawan'] || 0),
                    bpjsDeduction: Number(row['BPJS Kesehatan'] || 0),
                    isGrossUp: String(row['Gross Up (YA/TIDAK)'] || 'TIDAK').toUpperCase() === 'YA',
                    taxFacility: taxFacility as EmployeeData['taxFacility'],
                    taxObjectName: taxObjectName as EmployeeData['taxObjectName'],
                    taxObjectCode: taxObjectCode,
                    signerIdentity: (row['Penandatangan (NPWP/NIK)'] || 'NPWP') as EmployeeData['signerIdentity'],
                    // FIX: Add missing properties to conform to EmployeeData type
                    customFixedAllowances: [],
                    customVariableAllowances: [],
                };
                employeesToImport.push(employeeData);
            });

            if (errors.length > 0) {
                showNotification(`Gagal mengimpor. Ditemukan ${errors.length} error. Cek konsol browser untuk detail.`, 'error');
                console.error("Import Errors:", errors);
            } else if (employeesToImport.length > 0) {
                onImport(employeesToImport);
            } else {
                showNotification('Tidak ada data yang valid untuk diimpor.', 'error');
            }

        } catch (error) {
            console.error(error);
            showNotification('Gagal memproses file. Pastikan format file dan data sudah benar.', 'error');
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    reader.readAsBinaryString(file);
};


  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterYear('');
    setFilterMonth('');
    setFilterStatus('');
  };

  const handleDeleteClick = (employee: Employee) => {
    const period = `${months[employee.periodMonth - 1]} ${employee.periodYear}`;
    if (window.confirm(`Anda yakin ingin menghapus data PPh 21 untuk ${employee.name} periode ${period}?`)) {
        onDelete(employee.id);
    }
  };


  const filteredAndSortedEmployees = React.useMemo(() => {
    let processedEmployees = employees.filter(employee => 
      (employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       (employee.npwp && employee.npwp.includes(searchTerm))) &&
      (filterYear === '' || employee.periodYear.toString() === filterYear) &&
      (filterMonth === '' || employee.periodMonth.toString() === filterMonth) &&
      (filterStatus === '' || employee.status === filterStatus)
    );
  
    processedEmployees.sort((a, b) => {
        const key = sortConfig.key;

        const getSortableValue = (emp: Employee, sortKey: SortableKey) => {
            switch (sortKey) {
                case 'employeeId':
                    const master = masterEmployees.find(m => m.id === emp.masterEmployeeId);
                    return master ? master.employeeId.toLowerCase() : '';
                case 'period':
                    return emp.periodYear * 100 + emp.periodMonth;
                case 'name':
                case 'npwp':
                case 'status':
                    return (emp[sortKey] || '').toLowerCase();
                case 'grossIncome':
                case 'finalPPh21Monthly':
                    return emp[sortKey] || 0;
                default:
                    return '';
            }
        };

        const aValue = getSortableValue(a, key);
        const bValue = getSortableValue(b, key);

        if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    return processedEmployees;
}, [employees, masterEmployees, searchTerm, filterYear, filterMonth, filterStatus, sortConfig]);

  
  const summary = React.useMemo(() => {
      return {
          totalPerhitungan: filteredAndSortedEmployees.length,
          totalGajiBruto: filteredAndSortedEmployees.reduce((sum, e) => sum + e.grossIncome, 0),
          totalPph21: filteredAndSortedEmployees.reduce((sum, e) => sum + e.finalPPh21Monthly, 0)
      }
  }, [filteredAndSortedEmployees]);

  const uniqueYears = React.useMemo(() => {
      const startYear = 2024;
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let year = currentYear; year >= startYear; year--) {
          years.push(year);
      }
      return years;
  }, []);
// FIX: The `SortableHeader` component's props type was incorrect. 
// It has been updated to correctly accept `children` and an optional `className`.
  const SortableHeader: React.FC<{ sortKey: SortableKey; children: React.ReactNode; className?: string }> = ({ sortKey, children, className = '' }) => (
    <th className={`px-5 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider ${className}`}>
        <button onClick={() => requestSort(sortKey)} className="flex items-center space-x-1 hover:text-white transition-colors group">
            <span className="group-hover:text-white">{children}</span>
            {sortConfig.key === sortKey 
                ? (sortConfig.direction === 'ascending' ? <SortAscIcon /> : <SortDescIcon />)
                : <div className="w-4 h-4 opacity-0 group-hover:opacity-50"><SortAscIcon/></div>
            }
        </button>
    </th>
);

  return (
    <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <div className="flex items-center space-x-3">
                    <UserGroupIcon />
                    <h1 className="text-3xl font-bold text-gray-100">Daftar PPh 21 Karyawan</h1>
                </div>
                <p className="text-gray-400 mt-1">Kelola data karyawan dan perhitungan PPh 21</p>
            </div>
            <div className="flex items-center flex-wrap gap-2">
                 <button
                    onClick={handleDownloadPphTemplate}
                    className="bg-gray-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center space-x-2"
                >
                    <DownloadIcon />
                    <span>Template PPh 21</span>
                </button>
                 <button
                    onClick={handleImportPphClick}
                    className="bg-primary-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                >
                    <ImportIcon />
                    <span>Import PPh 21</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".xlsx, .xls" />
                <button
                    onClick={() => navigateTo('employeeInput')}
                    className="bg-accent-500 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-accent-600 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-accent-900/50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    <span>Hitung PPh 21 Baru</span>
                </button>
            </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-400 font-medium">Total Perhitungan PPh 21</p>
                    <p className="text-3xl font-bold text-white">{summary.totalPerhitungan}</p>
                </div>
                <div className="bg-primary-900/50 p-3 rounded-full"><UserGroupIcon /></div>
            </div>
            <div className="bg-yellow-900/30 p-5 rounded-lg border border-yellow-700/50 flex items-center justify-between">
                 <div>
                    <p className="text-sm text-yellow-400 font-medium">Total Gaji Bruto</p>
                    <p className="text-3xl font-bold text-white">{formatCurrency(summary.totalGajiBruto)}</p>
                </div>
                <div className="bg-yellow-500/20 text-yellow-300 font-bold text-lg p-3 rounded-full w-12 h-12 flex items-center justify-center">Rp</div>
            </div>
             <div className="bg-teal-900/30 p-5 rounded-lg border border-teal-700/50 flex items-center justify-between">
                 <div>
                    <p className="text-sm text-teal-400 font-medium">Total PPH 21</p>
                    <p className="text-3xl font-bold text-white">{formatCurrency(summary.totalPph21)}</p>
                </div>
                <div className="bg-teal-500/20 text-teal-300 font-bold text-lg p-3 rounded-full w-12 h-12 flex items-center justify-center">%</div>
            </div>
        </div>
        
        {/* Filter Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
            <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full flex justify-between items-center p-4 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 rounded-lg"
                aria-expanded={isFilterOpen}
                aria-controls="filter-section-content"
            >
                <div className="flex items-center space-x-3">
                    <FilterIcon />
                    <h3 className="text-lg font-semibold text-gray-200">Filter & Pencarian</h3>
                </div>
                <ChevronDownIcon className={`transform transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            {isFilterOpen && (
                <div id="filter-section-content" className="p-4 border-t border-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon />
                            </div>
                            <input type="text" placeholder="Cari nama atau NPWP..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200 placeholder-gray-400" />
                        </div>
                        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200">
                            <option value="">Semua bulan</option>
                            {months.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
                        </select>
                        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200">
                            <option value="">Semua tahun</option>
                            {uniqueYears.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200">
                            <option value="">Semua status</option>
                            {Object.values(MaritalStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button onClick={handleResetFilters} className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">Reset Filter</button>
                    </div>
                </div>
            )}
        </div>

        {/* Employee Table */}
        <div className="overflow-x-auto bg-gray-800 rounded-lg border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
                <tr>
                    <SortableHeader sortKey="employeeId">ID</SortableHeader>
                    <SortableHeader sortKey="name">Nama Karyawan</SortableHeader>
                    <SortableHeader sortKey="npwp">NPWP</SortableHeader>
                    <SortableHeader sortKey="period">Periode</SortableHeader>
                    <SortableHeader sortKey="status">Status</SortableHeader>
                    <SortableHeader sortKey="grossIncome" className="text-right">Gaji Bruto</SortableHeader>
                    <SortableHeader sortKey="finalPPh21Monthly" className="text-right">PPh 21</SortableHeader>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Aksi</th>
                </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredAndSortedEmployees.length > 0 ? filteredAndSortedEmployees.map((employee) => {
                    const masterEmp = masterEmployees.find(m => m.id === employee.masterEmployeeId);
                    return (
                        <tr key={employee.id} className="hover:bg-gray-700/50 transition-colors">
                            <td className="px-5 py-4 whitespace-nowrap text-sm font-mono text-gray-400">{masterEmp?.employeeId || 'N/A'}</td>
                            <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-white">{employee.name}</td>
                            <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{employee.npwp || 'Tidak Ada NPWP'}</td>
                            <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-400">{`${months[employee.periodMonth - 1]} ${employee.periodYear}`}</td>
                            <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-300">{employee.status}</td>
                            <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-300 text-right">{formatCurrency(employee.grossIncome)}</td>
                            <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-accent-400 text-right">{formatCurrency(employee.finalPPh21Monthly)}</td>
                            <td className="px-5 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex items-center justify-center space-x-2">
                                <button onClick={() => onOpenDetailModal(employee)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md" title="Lihat Detail"><ViewIcon /></button>
                                <button onClick={() => onEdit(employee)} className="p-2 text-gray-400 hover:text-primary-400 hover:bg-gray-700 rounded-md" title="Edit"><EditIcon /></button>
                                <button onClick={() => handleDeleteClick(employee)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-md" title="Hapus"><TrashIcon /></button>
                            </div>
                            </td>
                        </tr>
                    )
                }) : (
                    <tr>
                        <td colSpan={8} className="text-center py-10 text-gray-500">
                            Tidak ada data yang cocok dengan filter Anda.
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
    </div>
  );
};

export default EmployeeList;
