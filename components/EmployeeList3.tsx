
import * as React from 'react';
import * as XLSX from 'xlsx';
import { Employee, Page, MasterEmployee, MaritalStatus, OvertimeRecord, EmployeeData } from '../types';
import { getAvailableTaxYears } from '../constants';

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
  title?: string;
  addNewPage?: Page;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

// Icons (Same as others)
const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ViewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const ImportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const ChevronDownIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const SortAscIcon = () => <svg className="h-4 w-4 ml-1 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m-4-4v12" /></svg>;
const SortDescIcon = () => <svg className="h-4 w-4 ml-1 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4 4m-4 4V4" /></svg>;

type SortableKey = 'employeeId' | 'name' | 'npwp' | 'period' | 'status' | 'grossIncome' | 'taxUnderOverPayment';

const EmployeeList3: React.FC<EmployeeListProps> = ({ employees, masterEmployees, onEdit, onDelete, navigateTo, onOpenDetailModal, onImport, showNotification, title, addNewPage }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterYear, setFilterYear] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('');
  // Set default to false (collapsed)
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [sortConfig, setSortConfig] = React.useState<{ key: SortableKey; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
  
  const requestSort = (key: SortableKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleDownloadTemplate = () => {
      // Annual Template 
      const headers = [
          'ID Karyawan*', 'Tahun*', 'Tanggal A1 (YYYY-MM-DD)*',
          'Jenis Pemotongan (Setahun penuh/Disetahunkan/Kurang dari setahun)',
          'Masa Awal (1-12)', 'Masa Akhir (1-12)',
          'Gaji Setahun', 'Tunjangan PPh', 'Tunjangan Lainnya/Lembur', 'Honorarium', 
          'Premi Asuransi', 'Natura', 'Bonus/THR',
          'Iuran Pensiun/JHT/JP Setahun', 'Zakat Wajib',
          'Neto Sebelumnya (Jika Pindah)', 'PPh Dipotong Sebelumnya (Jika Pindah)',
          'Gross Up (YA/TIDAK)'
      ];
      const example = [
          'K001', new Date().getFullYear(), new Date().toISOString().split('T')[0],
          'Setahun penuh', 1, 12,
          120000000, 0, 15000000, 0,
          2400000, 0, 10000000,
          3600000, 0,
          0, 0,
          'TIDAK'
      ];
      const ws = XLSX.utils.aoa_to_sheet([headers, example]);
      ws['!cols'] = headers.map(h => ({ wch: h.length + 5 }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template A1");
      XLSX.writeFile(wb, "template_import_pph21_tahunan.xlsx");
  };

  const handleImportClick = () => {
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
                  showNotification('File Excel kosong.', 'error');
                  return;
              }

              const employeesToImport: Omit<EmployeeData, 'id'>[] = [];
              const errors: string[] = [];

              jsonData.forEach((row, index) => {
                  const employeeId = row['ID Karyawan*'];
                  const year = parseInt(row['Tahun*'], 10);
                  
                  if (!employeeId || !year) {
                      errors.push(`Baris ${index + 2}: ID Karyawan dan Tahun wajib diisi.`);
                      return;
                  }

                  const masterEmp = masterEmployees.find(e => e.employeeId === employeeId);
                  if (!masterEmp) {
                      errors.push(`Baris ${index + 2}: Karyawan '${employeeId}' tidak ditemukan.`);
                      return;
                  }

                  const employeeData: Omit<EmployeeData, 'id'> = {
                      masterEmployeeId: masterEmp.id,
                      calculationType: 'annual',
                      name: masterEmp.fullName,
                      npwp: masterEmp.npwp,
                      address: masterEmp.address,
                      status: masterEmp.ptkpStatus,
                      employeeStatus: masterEmp.employeeStatus,
                      isForeigner: masterEmp.isForeigner,
                      gender: masterEmp.gender,
                      position: masterEmp.position,
                      periodYear: year,
                      periodMonth: 12,
                      tanggalPemotongan: row['Tanggal A1 (YYYY-MM-DD)*'] || new Date().toISOString().split('T')[0],
                      jenisPemotongan: (row['Jenis Pemotongan (Setahun penuh/Disetahunkan/Kurang dari setahun)'] || 'Setahun penuh') as any,
                      taxPeriodStart: Number(row['Masa Awal (1-12)'] || 1),
                      taxPeriodEnd: Number(row['Masa Akhir (1-12)'] || 12),
                      
                      // Incomes
                      baseSalary: Number(row['Gaji Setahun'] || 0),
                      tunjanganPph: Number(row['Tunjangan PPh'] || 0),
                      tunjanganJabatan: Number(row['Tunjangan Lainnya/Lembur'] || 0),
                      honorarium: Number(row['Honorarium'] || 0),
                      insurancePremi: Number(row['Premi Asuransi'] || 0),
                      facilityValue: Number(row['Natura'] || 0),
                      bonus: Number(row['Bonus/THR'] || 0),
                      
                      // Deductions
                      // Split logic: usually pension + jp. Here we map sum to pensionDeduction for simplicity or split if needed.
                      // Let's assume input is total contribution.
                      pensionDeduction: Number(row['Iuran Pensiun/JHT/JP Setahun'] || 0),
                      jpDeduction: 0,
                      zakatDeduction: Number(row['Zakat Wajib'] || 0),
                      
                      // Previous Net
                      netIncomePrevious: Number(row['Neto Sebelumnya (Jika Pindah)'] || 0),
                      pph21PaidPreviously: Number(row['PPh Dipotong Sebelumnya (Jika Pindah)'] || 0),
                      
                      isGrossUp: String(row['Gross Up (YA/TIDAK)'] || 'TIDAK').toUpperCase() === 'YA',
                      taxFacility: 'Tanpa Fasilitas',
                      taxObjectName: 'Pegawai Tetap',
                      taxObjectCode: '21-100-01',
                      signerIdentity: 'NPWP',
                      // Fillers
                      tunjanganTelekomunikasi: 0, tunjanganMakan: 0, tunjanganTransportasi: 0, overtimePay: 0,
                      customFixedAllowances: [], customVariableAllowances: [], customDeductions: [],
                      loan: 0, otherDeductions: 0, bpjsDeduction: 0,
                  };
                  employeesToImport.push(employeeData);
              });

              if (errors.length > 0) {
                  showNotification(`Gagal import. ${errors.length} error.`, 'error');
                  console.error("Errors:", errors);
              } else if (employeesToImport.length > 0) {
                  onImport(employeesToImport);
              } else {
                  showNotification('Tidak ada data valid.', 'error');
              }
          } catch (error) {
              console.error(error);
              showNotification('Gagal memproses file.', 'error');
          } finally {
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      };
      reader.readAsBinaryString(file);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterYear('');
    setFilterStatus('');
  };

  const handleDeleteClick = (employee: Employee) => {
    if (window.confirm(`Anda yakin ingin menghapus data PPh 21 Tahunan (A1) untuk ${employee.name} Tahun ${employee.periodYear}?`)) {
        onDelete(employee.id);
    }
  };

  const filteredAndSortedEmployees = React.useMemo(() => {
    let processedEmployees = employees.filter(employee => 
      (employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       (employee.npwp && employee.npwp.includes(searchTerm))) &&
      (filterYear === '' || employee.periodYear.toString() === filterYear) &&
      (filterStatus === '' || employee.status === filterStatus)
    );
  
    processedEmployees.sort((a, b) => {
        const key = sortConfig.key;
        const getSortableValue = (emp: Employee, sortKey: SortableKey) => {
            switch (sortKey) {
                case 'employeeId': return emp.masterEmployeeId;
                case 'period': return emp.periodYear;
                case 'name': return emp.name.toLowerCase();
                case 'npwp': return emp.npwp;
                case 'status': return emp.status;
                case 'grossIncome': return emp.grossIncome;
                case 'taxUnderOverPayment': return emp.taxUnderOverPayment || 0;
                default: return '';
            }
        };

        const aValue = getSortableValue(a, key);
        const bValue = getSortableValue(b, key);

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
    });

    return processedEmployees;
}, [employees, searchTerm, filterYear, filterStatus, sortConfig]);

  const summary = React.useMemo(() => {
      return {
          totalPerhitungan: filteredAndSortedEmployees.length,
          totalGajiBruto: filteredAndSortedEmployees.reduce((sum, e) => sum + e.grossIncome, 0),
          totalKurangBayar: filteredAndSortedEmployees.reduce((sum, e) => sum + (e.taxUnderOverPayment || 0), 0)
      }
  }, [filteredAndSortedEmployees]);

  const uniqueYears = React.useMemo(() => {
      const dataYears = Array.from(new Set<number>(employees.map(e => e.periodYear)));
      const dynamicYears = getAvailableTaxYears();
      const allYears = Array.from(new Set([...dataYears, ...dynamicYears])).sort((a,b) => b - a);
      return allYears;
  }, [employees]);

  return (
    <div className="space-y-6 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <div className="flex items-center space-x-3">
                    <UserGroupIcon />
                    <h1 className="text-3xl font-bold text-gray-100">{title || 'Daftar PPh 21 Tahunan (1721-A1)'}</h1>
                </div>
                <p className="text-gray-400 mt-1">Kelola Bukti Potong A1 untuk pelaporan tahunan.</p>
            </div>
            <div className="flex flex-wrap gap-2">
                 <button onClick={handleDownloadTemplate} className="bg-gray-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center space-x-2 text-sm">
                    <DownloadIcon />
                    <span>Template Import</span>
                </button>
                <button onClick={handleImportClick} className="bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm">
                    <ImportIcon />
                    <span>Import Excel</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".xlsx, .xls" />
                <button onClick={() => navigateTo(addNewPage || 'pph21Annual')} className="bg-primary-600 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-primary-900/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    <span>Buat SPT A1</span>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400">Total A1 Terbit</p>
                <p className="text-2xl font-bold text-gray-100">{summary.totalPerhitungan}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400">Total Penghasilan Bruto Setahun</p>
                <p className="text-2xl font-bold text-blue-400">{formatCurrency(summary.totalGajiBruto)}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400">Total Kurang Bayar (KB)</p>
                <p className="text-2xl font-bold text-orange-400">{formatCurrency(summary.totalKurangBayar)}</p>
            </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700">
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="w-full flex justify-between items-center p-4 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 rounded-lg">
                <div className="flex items-center space-x-3">
                    <FilterIcon />
                    <h3 className="text-lg font-semibold text-gray-200">Filter & Pencarian</h3>
                </div>
                <ChevronDownIcon className={`transform transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            {isFilterOpen && (
                <div className="p-4 border-t border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative md:col-span-2">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                            <input type="text" placeholder="Cari Nama/NPWP..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200" />
                        </div>
                        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200 [&>option]:bg-gray-800">
                            <option value="">Semua Tahun</option>
                            {uniqueYears.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200 [&>option]:bg-gray-800">
                            <option value="">Semua PTKP</option>
                            {Object.values(MaritalStatus).map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button onClick={handleResetFilters} className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">Reset Filter</button>
                    </div>
                </div>
            )}
        </div>

        <div className="overflow-x-auto bg-gray-800 rounded-lg border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => requestSort('name')}>
                            <div className="flex items-center space-x-1">
                                <span>Nama Karyawan</span>
                                {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? <SortAscIcon /> : <SortDescIcon />)}
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => requestSort('period')}>
                            <div className="flex items-center space-x-1">
                                <span>Tahun Pajak</span>
                                {sortConfig.key === 'period' && (sortConfig.direction === 'ascending' ? <SortAscIcon /> : <SortDescIcon />)}
                            </div>
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => requestSort('grossIncome')}>
                            <div className="flex items-center justify-end space-x-1">
                                <span>Bruto Setahun</span>
                                {sortConfig.key === 'grossIncome' && (sortConfig.direction === 'ascending' ? <SortAscIcon /> : <SortDescIcon />)}
                            </div>
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => requestSort('taxUnderOverPayment')}>
                            <div className="flex items-center justify-end space-x-1">
                                <span>Kurang Bayar</span>
                                {sortConfig.key === 'taxUnderOverPayment' && (sortConfig.direction === 'ascending' ? <SortAscIcon /> : <SortDescIcon />)}
                            </div>
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {filteredAndSortedEmployees.length > 0 ? (
                        filteredAndSortedEmployees.map((employee) => (
                            <tr key={employee.id} className="hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-200">{employee.name}</div>
                                    <div className="text-xs text-gray-400">{employee.npwp}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-300">{employee.periodYear}</div>
                                    <div className="text-xs text-gray-500">
                                        Masa: {employee.taxPeriodStart || 1} - {employee.taxPeriodEnd || 12}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-300">
                                    {formatCurrency(employee.grossIncome)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-orange-400">
                                    {formatCurrency(employee.taxUnderOverPayment || 0)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button onClick={() => onOpenDetailModal(employee)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md" title="Detail"><ViewIcon /></button>
                                        <button onClick={() => onEdit(employee)} className="p-2 text-gray-400 hover:text-primary-400 hover:bg-gray-700 rounded-md" title="Edit"><EditIcon /></button>
                                        <button onClick={() => handleDeleteClick(employee)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-md" title="Hapus"><TrashIcon /></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Tidak ada data.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default EmployeeList3;
