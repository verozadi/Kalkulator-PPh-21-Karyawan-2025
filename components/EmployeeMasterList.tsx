
import * as React from 'react';
import * as XLSX from 'xlsx';
import { MasterEmployee, MaritalStatus } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface EmployeeMasterListProps {
  masterEmployees: MasterEmployee[];
  onAddNew: () => void;
  onEdit: (employee: MasterEmployee) => void;
  onDelete: (id: string) => Promise<void> | void; // Updated to Promise for bulk await
  onImport: (employees: Omit<MasterEmployee, 'id'>[]) => void;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  onOpenDetailModal: (employee: MasterEmployee) => void;
}

// --- ELEGANT ACCOUNTING ICONS (Stroke 1.5) ---
// Matching Sidebar: UsersIcon
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-primary-400"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;

const ImportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;
const SortAscIcon = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" /></svg>;
const SortDescIcon = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" /></svg>;
const ChevronDownIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>;
const ViewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
// Updated Vector Icon for "Tambah Karyawan Baru"
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3.75 19.5a6.957 6.957 0 0014.049-2.343 19.08 19.08 0 00-14.049 0 6.957 6.957 0 00-3.75 6.093 16.375 16.375 0 017.5 0z" /></svg>;

const EmployeeMasterList: React.FC<EmployeeMasterListProps> = ({ masterEmployees, onAddNew, onEdit, onDelete, onImport, showNotification, onOpenDetailModal }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // State
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterEmployeeStatus, setFilterEmployeeStatus] = React.useState<'all' | 'Pegawai Tetap' | 'Bukan Pegawai'>('all');
    const [filterIsActive, setFilterIsActive] = React.useState<'all' | 'true' | 'false'>('all');
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);
    
    // Selection & Modal State
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
    const [idsToDelete, setIdsToDelete] = React.useState<string[]>([]);
    const [isDeleting, setIsDeleting] = React.useState(false);

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

    // Filter Logic
    const filteredAndSortedEmployees = React.useMemo(() => {
        let sortableEmployees = [...masterEmployees];

        sortableEmployees = sortableEmployees.filter(employee => {
            const searchTermMatch = searchTerm === '' ||
                employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
            
            const employeeStatusMatch = filterEmployeeStatus === 'all' || employee.employeeStatus === filterEmployeeStatus;
            const isActiveMatch = filterIsActive === 'all' || String(employee.isActive) === filterIsActive;

            return searchTermMatch && employeeStatusMatch && isActiveMatch;
        });

        sortableEmployees.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });

        return sortableEmployees;
    }, [masterEmployees, searchTerm, filterEmployeeStatus, filterIsActive, sortConfig]);

    // --- Selection Logic ---
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = new Set(filteredAndSortedEmployees.map(emp => emp.id));
            setSelectedIds(allIds);
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectRow = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    // --- Delete Logic ---
    const handleDeleteClick = (employee: MasterEmployee) => {
        setIdsToDelete([employee.id]);
        setIsDeleteModalOpen(true);
    };

    const handleBulkDeleteClick = () => {
        setIdsToDelete(Array.from(selectedIds));
        setIsDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        setIsDeleting(true);
        try {
            await Promise.all(idsToDelete.map(id => onDelete(id)));
            showNotification(`${idsToDelete.length} karyawan berhasil dihapus.`, 'success');
            setSelectedIds(new Set());
            setIdsToDelete([]);
            setIsDeleteModalOpen(false);
        } catch (error) {
            showNotification('Gagal menghapus beberapa data.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    // --- Import/Template Logic (Unchanged) ---
    const handleDownloadTemplate = () => {
        const headers = [
            'ID Karyawan', 'Nama Lengkap', 'Jenis Kelamin (Laki-Laki/Perempuan)', 'Jabatan', 'Email', 'No. Handphone', 
            'Tanggal Masuk (YYYY-MM-DD)', 'No. KTP', 'Alamat', 'Dikenakan PPh 21 (YA/TIDAK)', 
            'NPWP', 'Status Pegawai (Pegawai Tetap/Bukan Pegawai)', 'WNA (YA/TIDAK)', 'Kode Negara (2 Huruf)',
            'No. Paspor', `Status PTKP (${Object.values(MaritalStatus).join('/')})`, 
            'Gaji Pokok (Angka saja)', 'Tunjangan Jabatan (Angka saja)', 'Status Aktif (YA/TIDAK)'
        ];
        const exampleRow = [
            'K003', 'Budi Santoso', 'Laki-Laki', 'Staff', 'budi.s@example.com', '0812xxxxxx',
            '2023-01-15', '3171012345678901', 'Jl. Merdeka No. 5, Jakarta', 'YA',
            '98.765.432.1-012.000', 'Pegawai Tetap', 'TIDAK', '',
            '', 'TK/0',
            '8000000', '500000', 'YA'
        ];
        const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
        ws['!cols'] = headers.map(h => ({ wch: h.length + 5 })); 
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template Karyawan");
        XLSX.writeFile(wb, "template_import_karyawan.xlsx");
    };

    const handleImportClick = () => fileInputRef.current?.click();

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
                    showNotification('File Excel kosong.', 'error');
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
                    const positionAllowance = parseInt(row['Tunjangan Jabatan (Angka saja)'] || '0', 10);
                    const rawGender = String(row['Jenis Kelamin (Laki-Laki/Perempuan)'] || 'Laki-Laki');
                    const gender = (rawGender.toLowerCase() === 'perempuan') ? 'Perempuan' : 'Laki-Laki';

                    const employee: Omit<MasterEmployee, 'id'> = {
                        employeeId: String(employeeId),
                        fullName: String(fullName),
                        gender: gender,
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
                        countryCode: String(row['Kode Negara (2 Huruf)'] || ''),
                        passportNumber: String(row['No. Paspor'] || ''),
                        ptkpStatus,
                        baseSalary,
                        positionAllowance,
                        isActive: String(row['Status Aktif (YA/TIDAK)'] || 'YA').toUpperCase() === 'YA',
                    };
                    importedEmployees.push(employee);
                });

                if (errors.length > 0) {
                    showNotification(`Gagal import. ${errors.length} error ditemukan.`, 'error');
                } else if (importedEmployees.length > 0) {
                    onImport(importedEmployees);
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

    const SortableHeader: React.FC<{ sortKey: SortableKey; children: React.ReactNode; className?: string; }> = ({ sortKey, children, className = '' }) => (
        <th className={`px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider ${className}`}>
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
                        <UsersIcon />
                        <h1 className="text-3xl font-bold text-gray-100">Daftar Nama Karyawan</h1>
                    </div>
                    <p className="text-gray-400 mt-1">Kelola data master seluruh karyawan Anda.</p>
                </div>
                <div className="flex items-center flex-wrap gap-2">
                     <button onClick={handleDownloadTemplate} className="bg-gray-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center space-x-2">
                        <DownloadIcon />
                        <span>Download Template</span>
                    </button>
                     <button onClick={handleImportClick} className="bg-primary-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2">
                        <ImportIcon />
                        <span>Import Karyawan</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".xlsx, .xls" />
                    <button onClick={onAddNew} className="bg-accent-500 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-accent-600 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-accent-900/50">
                        <UserPlusIcon />
                        <span>Tambah Karyawan Baru</span>
                    </button>
                </div>
            </div>
            
            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
                <div className="bg-blue-900/40 border border-blue-700 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center animate-fade-in gap-4">
                    <div className="text-blue-200 font-medium flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {selectedIds.size} Data Terpilih
                    </div>
                    <div className="flex gap-3 items-center">
                        <button 
                            onClick={handleBulkDeleteClick} 
                            className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <TrashIcon />
                            Hapus ({selectedIds.size})
                        </button>
                    </div>
                </div>
            )}

             {/* Filter Section */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="w-full flex justify-between items-center p-4 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 rounded-lg"
                >
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
                                <input type="text" placeholder="Cari Nama atau ID Karyawan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200 placeholder-gray-400" />
                            </div>
                            <select value={filterEmployeeStatus} onChange={(e) => setFilterEmployeeStatus(e.target.value as any)} className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200 [&>option]:bg-gray-800">
                                <option value="all">Semua status pegawai</option>
                                <option value="Pegawai Tetap">Pegawai Tetap</option>
                                <option value="Bukan Pegawai">Bukan Pegawai</option>
                            </select>
                            <select value={filterIsActive} onChange={(e) => setFilterIsActive(e.target.value as any)} className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200 [&>option]:bg-gray-800">
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
                            <th className="px-4 py-3 w-10 text-center">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                                    onChange={handleSelectAll}
                                    checked={filteredAndSortedEmployees.length > 0 && selectedIds.size === filteredAndSortedEmployees.length}
                                />
                            </th>
                            <SortableHeader sortKey="fullName">Nama Lengkap / ID</SortableHeader>
                            <SortableHeader sortKey="position">Jabatan</SortableHeader>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">NIK/NPWP16</th>
                            <SortableHeader sortKey="email">Kontak</SortableHeader>
                            <SortableHeader sortKey="employeeStatus">Status</SortableHeader>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {filteredAndSortedEmployees.length > 0 ? filteredAndSortedEmployees.map((employee) => (
                            <tr key={employee.id} className={`hover:bg-gray-700/50 transition-colors ${selectedIds.has(employee.id) ? 'bg-blue-900/20' : ''}`}>
                                <td className="px-4 py-4 text-center">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                                        checked={selectedIds.has(employee.id)}
                                        onChange={() => handleSelectRow(employee.id)}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-200">{employee.fullName}</div>
                                    <div className="text-sm text-gray-400 font-mono">{employee.employeeId}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{employee.position}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">{employee.npwp || '-'}</td>
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
                                    <div className="flex items-center justify-center space-x-2">
                                        <button onClick={() => onOpenDetailModal(employee)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md" title="Lihat Detail"><ViewIcon /></button>
                                        <button onClick={() => onEdit(employee)} className="p-2 text-gray-400 hover:text-primary-400 hover:bg-gray-700 rounded-md" title="Edit"><EditIcon /></button>
                                        <button onClick={() => handleDeleteClick(employee)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-md" title="Hapus"><TrashIcon /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} className="text-center py-10 text-gray-500">
                                   {masterEmployees.length > 0 ? "Tidak ada karyawan yang cocok dengan filter Anda." : "Belum ada data master karyawan."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmationModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={executeDelete}
                title="Hapus Karyawan Master"
                message={`Anda akan menghapus ${idsToDelete.length} data karyawan master. Data PPh 21 yang sudah ada tidak akan hilang, tetapi karyawan ini tidak akan muncul di opsi input baru.`}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default EmployeeMasterList;
