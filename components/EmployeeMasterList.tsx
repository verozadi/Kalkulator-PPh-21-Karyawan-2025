
import * as React from 'react';
import * as XLSX from 'xlsx';
import { MasterEmployee, MaritalStatus } from '../types';

interface EmployeeMasterListProps {
  masterEmployees: MasterEmployee[];
  onAddNew: () => void;
  onEdit: (employee: MasterEmployee) => void;
  onDelete: (id: string) => void;
  onImport: (employees: Omit<MasterEmployee, 'id'>[]) => void;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

// --- Icon Components ---
const IdentificationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-4 0h4m-4 0H9m4 0h2m-2 0h-2m2 0h2m-6 4h6m-6 4h6m-6 4h6" /></svg>;
const ImportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const SortAscIcon = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>;
const SortDescIcon = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4 4m0 0l4-4m-4 4V4" /></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;

const EmployeeMasterList: React.FC<EmployeeMasterListProps> = ({ masterEmployees, onAddNew, onEdit, onDelete, onImport, showNotification }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // State for filtering and sorting
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterEmployeeStatus, setFilterEmployeeStatus] = React.useState<'all' | 'Pegawai Tetap' | 'Bukan Pegawai'>('all');
    const [filterIsActive, setFilterIsActive] = React.useState<'all' | 'true' | 'false'>('all');
    const [isFilterOpen, setIsFilterOpen] = React.useState(true);
    
    type SortableKey = keyof Pick<MasterEmployee, 'fullName' | 'position' | 'email' | 'employeeStatus'>;
    const [sortConfig, setSortConfig] = React.useState<{ key: SortableKey; direction: 'ascending' | 'descending' }>({ key: 'fullName', direction: 'ascending' });

    const requestSort = (key: SortableKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setFilterEmployeeStatus('all');
        setFilterIsActive('all');
        setSortConfig({ key: 'fullName', direction: 'ascending' });
    };
    
    const filteredAndSortedEmployees = React.useMemo(() => {
        let sortableEmployees = [...masterEmployees];

        // Filtering
        sortableEmployees = sortableEmployees.filter(employee => {
            const searchTermMatch = searchTerm === '' ||
                employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
            
            const employeeStatusMatch = filterEmployeeStatus === 'all' || employee.employeeStatus === filterEmployeeStatus;

            const isActiveMatch = filterIsActive === 'all' || String(employee.isActive) === filterIsActive;

            return searchTermMatch && employeeStatusMatch && isActiveMatch;
        });

        // Sorting
        sortableEmployees.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        return sortableEmployees;
    }, [masterEmployees, searchTerm, filterEmployeeStatus, filterIsActive, sortConfig]);

    const handleDownloadTemplate = () => {
        const headers = [
            'ID Karyawan', 'Nama Lengkap', 'Jabatan', 'Email', 'No. Handphone', 
            'Tanggal Masuk (YYYY-MM-DD)', 'No. KTP', 'Alamat', 'Dikenakan PPh 21 (YA/TIDAK)', 
            'NPWP', 'Status Pegawai (Pegawai Tetap/Bukan Pegawai)', 'WNA (YA/TIDAK)', 
            'No. Paspor', `Status PTKP (${Object.values(MaritalStatus).join('/')})`, 
            'Gaji Pokok (Angka saja)', 'Status Aktif (YA/TIDAK)'
        ];
        const exampleRow = [
            'K003', 'Budi Santoso', 'Staff', 'budi.s@example.com', '0812xxxxxx',
            '2023-01-15', '3171012345678901', 'Jl. Merdeka No. 5, Jakarta', 'YA',
            '98.765.432.1-012.000', 'Pegawai Tetap', 'TIDAK',
            '', 'TK/0',
            '8000000', 'YA'
        ];
        const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
        ws['!cols'] = headers.map(h => ({ wch: h.length + 5 })); // Auto-width columns
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template Karyawan");
        XLSX.writeFile(wb, "template_import_karyawan.xlsx");
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
                const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

                if (jsonData.length === 0) {
                    showNotification('File Excel kosong atau tidak memiliki data.', 'error');
                    return;
                }
                
                const importedEmployees: Omit<MasterEmployee, 'id'>[] = [];
                const errors: string[] = [];

                const ptkpValues = Object.values(MaritalStatus);

                jsonData.forEach((row, index) => {
                    const employeeId = row['ID Karyawan'];
                    const fullName = row['Nama Lengkap'];
                    const hireDate = row['Tanggal Masuk (YYYY-MM-DD)'];

                    if (!employeeId || !fullName || !hireDate) {
                        errors.push(`Baris ${index + 2}: ID Karyawan, Nama Lengkap, dan Tanggal Masuk wajib diisi.`);
                        return;
                    }
                    
                    const ptkpStatus = row[`Status PTKP (${ptkpValues.join('/')})`] as MaritalStatus;
                    if (!ptkpStatus || !ptkpValues.includes(ptkpStatus)) {
                         errors.push(`Baris ${index + 2}: Status PTKP '${ptkpStatus}' tidak valid.`);
                         return;
                    }

                    let formattedHireDate = '';
                    if (hireDate instanceof Date) {
                        const year = hireDate.getFullYear();
                        const month = String(hireDate.getMonth() + 1).padStart(2, '0');
                        const day = String(hireDate.getDate()).padStart(2, '0');
                        formattedHireDate = `${year}-${month}-${day}`;
                    } else if (typeof hireDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(hireDate)) {
                        formattedHireDate = hireDate;
                    } else {
                         errors.push(`Baris ${index + 2}: Format Tanggal Masuk tidak valid. Gunakan YYYY-MM-DD.`);
                         return;
                    }

                    const baseSalary = parseInt(row['Gaji Pokok (Angka saja)'], 10);
                    if (isNaN(baseSalary)) {
                         errors.push(`Baris ${index + 2}: Gaji Pokok harus berupa angka.`);
                         return;
                    }

                    const employee: Omit<MasterEmployee, 'id'> = {
                        employeeId: String(employeeId),
                        fullName: String(fullName),
                        position: String(row['Jabatan'] || ''),
                        email: String(row['Email'] || ''),
                        phone: String(row['No. Handphone'] || ''),
                        hireDate: formattedHireDate,
                        ktp: String(row['No. KTP'] || ''),
                        address: String(row['Alamat'] || ''),
                        isPph21Applicable: String(row['Dikenakan PPh 21 (YA/TIDAK)'] || 'YA').toUpperCase() === 'YA',
                        npwp: String(row['NPWP'] || ''),
                        employeeStatus: (String(row['Status Pegawai (Pegawai Tetap/Bukan Pegawai)'] || 'Pegawai Tetap') === 'Pegawai Tetap') ? 'Pegawai Tetap' : 'Bukan Pegawai',
                        isForeigner: String(row['WNA (YA/TIDAK)'] || 'TIDAK').toUpperCase() === 'YA',
                        passportNumber: String(row['No. Paspor'] || ''),
                        ptkpStatus,
                        baseSalary,
                        isActive: String(row['Status Aktif (YA/TIDAK)'] || 'YA').toUpperCase() === 'YA',
                    };
                    importedEmployees.push(employee);
                });

                if (errors.length > 0) {
                    showNotification(`Gagal mengimpor. Ditemukan ${errors.length} error. Cek konsol browser untuk detail.`, 'error');
                    console.error("Import Errors:", errors);
                } else if (importedEmployees.length > 0) {
                    onImport(importedEmployees);
                } else {
                    showNotification('Tidak ada data karyawan yang valid untuk diimpor.', 'error');
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

    const SortableHeader: React.FC<{ sortKey: SortableKey; children: React.ReactNode }> = ({ sortKey, children }) => (
        <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
            <button onClick={() => requestSort(sortKey)} className="flex items-center space-x-1 hover:text-white">
                <span>{children}</span>
                {sortConfig.key === sortKey && (sortConfig.direction === 'ascending' ? <SortAscIcon /> : <SortDescIcon />)}
            </button>
        </th>
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <div className="flex items-center space-x-3">
                        <IdentificationIcon />
                        <h1 className="text-3xl font-bold text-gray-100">Daftar Nama Karyawan</h1>
                    </div>
                    <p className="text-gray-400 mt-1">Kelola data master seluruh karyawan Anda.</p>
                </div>
                <div className="flex items-center flex-wrap gap-2">
                     <button
                        onClick={handleDownloadTemplate}
                        className="bg-gray-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center space-x-2"
                    >
                        <DownloadIcon />
                        <span>Download Template</span>
                    </button>
                     <button
                        onClick={handleImportClick}
                        className="bg-primary-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                    >
                        <ImportIcon />
                        <span>Import Karyawan</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".xlsx, .xls" />
                    <button
                        onClick={onAddNew}
                        className="bg-accent-500 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-accent-600 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-accent-900/50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-5-6a3 3 0 100-6 3 3 0 000 6zM13 18a6 6 0 00-6-6H5a6 6 0 00-6 6v1h14v-1z" /></svg>
                        <span>Tambah Karyawan Baru</span>
                    </button>
                </div>
            </div>
            
             {/* Filter Section */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="w-full flex justify-between items-center p-4 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 rounded-lg"
                    aria-expanded={isFilterOpen}
                    aria-controls="master-filter-content"
                >
                    <div className="flex items-center space-x-3">
                        <FilterIcon />
                        <h3 className="text-lg font-semibold text-gray-200">Filter & Pencarian</h3>
                    </div>
                    <ChevronDownIcon className={`transform transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>
                {isFilterOpen && (
                    <div id="master-filter-content" className="p-4 border-t border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative md:col-span-2">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                                <input type="text" placeholder="Cari Nama atau ID Karyawan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200 placeholder-gray-400" />
                            </div>
                            <select value={filterEmployeeStatus} onChange={(e) => setFilterEmployeeStatus(e.target.value as any)} className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200">
                                <option value="all">Semua status pegawai</option>
                                <option value="Pegawai Tetap">Pegawai Tetap</option>
                                <option value="Bukan Pegawai">Bukan Pegawai</option>
                            </select>
                            <select value={filterIsActive} onChange={(e) => setFilterIsActive(e.target.value as any)} className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200">
                                <option value="all">Semua status karyawan</option>
                                <option value="true">Aktif</option>
                                <option value="false">Tidak Aktif</option>
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
                            <SortableHeader sortKey="fullName">Nama Lengkap / ID</SortableHeader>
                            <SortableHeader sortKey="position">Jabatan</SortableHeader>
                            <SortableHeader sortKey="email">Kontak</SortableHeader>
                            <SortableHeader sortKey="employeeStatus">Status</SortableHeader>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {filteredAndSortedEmployees.length > 0 ? filteredAndSortedEmployees.map((employee) => (
                            <tr 
                                key={employee.id} 
                                className="hover:bg-gray-700/50 transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-200">{employee.fullName}</div>
                                    <div className="text-sm text-gray-400 font-mono">{employee.employeeId}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{employee.position}</td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-300">{employee.email}</div>
                                    <div className="text-sm text-gray-400">{employee.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                    <div className="flex flex-col items-start space-y-1">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.employeeStatus === 'Pegawai Tetap' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                            {employee.employeeStatus}
                                        </span>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.isActive ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-400'}`}>
                                            {employee.isActive ? 'Aktif' : 'Tidak Aktif'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <button onClick={() => onEdit(employee)} className="text-primary-400 hover:text-primary-300 mr-4">Edit</button>
                                    <button onClick={() => window.confirm(`Anda yakin ingin menghapus ${employee.fullName}? Ini tidak akan menghapus data PPh 21 yang sudah ada.`) && onDelete(employee.id)} className="text-red-400 hover:text-red-300">Hapus</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-gray-500">
                                   {masterEmployees.length > 0 ? "Tidak ada karyawan yang cocok dengan filter Anda." : "Belum ada data master karyawan."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeeMasterList;