
import * as React from 'react';
import * as XLSX from 'xlsx';
import { Employee, Page, MasterEmployee, MaritalStatus, OvertimeRecord, EmployeeData, Profile } from '../types';
import { getAvailableTaxYears } from '../constants';
import ConfirmationModal from './ConfirmationModal';

declare const html2canvas: any;
declare const jspdf: any;

interface EmployeeListProps {
  employees: Employee[];
  masterEmployees: MasterEmployee[];
  overtimeRecords: OvertimeRecord[];
  onEdit: (employee: Employee) => void;
  onDelete: (employeeId: string) => Promise<void> | void;
  navigateTo: (page: Page) => void;
  onOpenDetailModal: (employee: Employee) => void;
  onImport: (employees: Omit<EmployeeData, 'id'>[]) => void;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  title?: string;
  addNewPage?: Page;
  profile: Profile; // ADDED: Menerima prop profile dari App.tsx
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

// --- ELEGANT ACCOUNTING ICONS (Stroke 1.5) ---
const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;
const ViewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const ImportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
const ChevronDownIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>;
const SortAscIcon = () => <svg className="h-4 w-4 ml-1 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" /></svg>;
const SortDescIcon = () => <svg className="h-4 w-4 ml-1 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" /></svg>;
const PrinterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" /></svg>;


type SortableKey = 'employeeId' | 'name' | 'npwp' | 'period' | 'status' | 'grossIncome' | 'finalPPh21Monthly' | 'netIncomeForTax' | 'pph21Terutang' | 'taxUnderOverPayment';

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, masterEmployees, overtimeRecords, onEdit, onDelete, navigateTo, onOpenDetailModal, onImport, showNotification, title, addNewPage, profile }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterYear, setFilterYear] = React.useState('');
  const [filterMonth, setFilterMonth] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [sortConfig, setSortConfig] = React.useState<{ key: SortableKey; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
  
  // Selection & Bulk Action State
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isGeneratingBulk, setIsGeneratingBulk] = React.useState(false);
  const hiddenPrintRef = React.useRef<HTMLDivElement>(null);
  const [bulkPrintData, setBulkPrintData] = React.useState<Employee[]>([]);
  const [printOrientation, setPrintOrientation] = React.useState<'portrait' | 'landscape'>('landscape');
  
  // Modal Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [idsToDelete, setIdsToDelete] = React.useState<string[]>([]);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const months = ["JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI", "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"];
  
  const requestSort = (key: SortableKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // ... (Keep XLSX logic unchanged) ...
  const handleDownloadPphTemplate = () => {
    // ... (Existing code) ...
    const headers = [
        'ID Karyawan*', 'Tahun*', 'Bulan*',
        'Gaji Pokok', 'Tunjangan PPh', 'Tunjangan Jabatan', 'Tunjangan Telekomunikasi',
        'Tunjangan Makan', 'Tunjangan Transportasi', 'Lembur', 'Bonus/THR', 'Natura/Kenikmatan',
        'Pot. Pinjaman/Kasbon', 'Potongan Lain', 'JHT (2%)', 'JP (1%)', 'BPJS Kes (1%)', 'Zakat',
        'Gross Up (YA/TIDAK)', 'Fasilitas (Tanpa Fasilitas/DTP/Fasilitas Lainnya)', 'No SKB/DTP'
    ];
    const exampleRow = [
        'K001', new Date().getFullYear(), new Date().getMonth() + 1,
        10000000, 0, 500000, 300000,
        400000, 400000, 0, 0, 0,
        0, 0, 200000, 100000, 100000, 0,
        'TIDAK', 'Tanpa Fasilitas', ''
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
    ws['!cols'] = headers.map(h => ({ wch: h.length + 5 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Bulanan");
    XLSX.writeFile(wb, "template_import_pph21_bulanan.xlsx");
};

const handleImportPphClick = () => {
    fileInputRef.current?.click();
};

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... (Existing code) ...
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
                const employeeId = row['ID Karyawan*'];
                const year = parseInt(row['Tahun*'], 10);
                const month = parseInt(row['Bulan*'], 10);

                if (!employeeId || !year || !month || month < 1 || month > 12) {
                    errors.push(`Baris ${index + 2}: ID Karyawan, Tahun, dan Bulan (1-12) wajib diisi dengan format yang benar.`);
                    return;
                }

                const masterEmp = masterEmployees.find(e => e.employeeId === employeeId);
                if (!masterEmp) {
                    errors.push(`Baris ${index + 2}: Karyawan dengan ID '${employeeId}' tidak ditemukan di data master.`);
                    return;
                }

                // Check for manual overtime input in Excel, if 0/undefined, check system records
                let overtimeInput = Number(row['Lembur'] || 0);
                if (overtimeInput === 0) {
                    const employeeOvertimeRecords = overtimeRecords.filter(o =>
                        o.masterEmployeeId === masterEmp.id &&
                        o.year === year &&
                        o.month === month
                    );
                    overtimeInput = employeeOvertimeRecords.reduce((sum, record) => sum + record.totalPay, 0);
                }

                const employeeData: Omit<EmployeeData, 'id'> = {
                    masterEmployeeId: masterEmp.id,
                    calculationType: 'monthly',
                    name: masterEmp.fullName,
                    npwp: masterEmp.npwp,
                    address: masterEmp.address,
                    status: masterEmp.ptkpStatus,
                    employeeStatus: masterEmp.employeeStatus,
                    isForeigner: masterEmp.isForeigner,
                    periodYear: year,
                    periodMonth: month,
                    baseSalary: Number(row['Gaji Pokok'] || masterEmp.baseSalary || 0),
                    tunjanganPph: Number(row['Tunjangan PPh'] || 0),
                    tunjanganJabatan: Number(row['Tunjangan Jabatan'] || masterEmp.positionAllowance || 0),
                    tunjanganTelekomunikasi: Number(row['Tunjangan Telekomunikasi'] || 0),
                    tunjanganMakan: Number(row['Tunjangan Makan'] || 0),
                    tunjanganTransportasi: Number(row['Tunjangan Transportasi'] || 0),
                    overtimePay: overtimeInput,
                    bonus: Number(row['Bonus/THR'] || 0),
                    facilityValue: Number(row['Natura/Kenikmatan'] || 0),
                    loan: Number(row['Pot. Pinjaman/Kasbon'] || 0),
                    otherDeductions: Number(row['Potongan Lain'] || 0),
                    pensionDeduction: Number(row['JHT (2%)'] || 0),
                    jpDeduction: Number(row['JP (1%)'] || 0),
                    bpjsDeduction: Number(row['BPJS Kes (1%)'] || 0),
                    zakatDeduction: Number(row['Zakat'] || 0),
                    isGrossUp: String(row['Gross Up (YA/TIDAK)'] || 'TIDAK').toUpperCase() === 'YA',
                    taxFacility: (row['Fasilitas (Tanpa Fasilitas/DTP/Fasilitas Lainnya)'] || 'Tanpa Fasilitas') as any,
                    taxFacilityNumber: row['No SKB/DTP'] || '',
                    taxObjectName: 'Penghasilan yang Diterima atau Diperoleh Pegawai Tetap',
                    taxObjectCode: '21-100-01',
                    signerIdentity: 'NPWP',
                    customFixedAllowances: [],
                    customVariableAllowances: [],
                    customDeductions: [],
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

  // --- DELETE LOGIC ---
  const handleDeleteClick = (employee: Employee) => {
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
        showNotification(`${idsToDelete.length} data berhasil dihapus.`, 'success');
        setSelectedIds(new Set());
        setIdsToDelete([]);
        setIsDeleteModalOpen(false);
    } catch (error) {
        showNotification('Gagal menghapus beberapa data.', 'error');
    } finally {
        setIsDeleting(false);
    }
  };


  const filteredAndSortedEmployees = React.useMemo(() => {
    // ... (Existing sorting logic) ...
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
                case 'period': return emp.periodYear * 100 + emp.periodMonth;
                case 'name': return emp.name.toLowerCase();
                case 'npwp': return emp.npwp;
                case 'status': return emp.status;
                case 'grossIncome': return emp.grossIncome;
                case 'finalPPh21Monthly': return emp.finalPPh21Monthly;
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
}, [employees, masterEmployees, searchTerm, filterYear, filterMonth, filterStatus, sortConfig]);

  // Bulk Selection Logic
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

  // Bulk PDF Generation
  const handleBulkDownload = async () => {
      // ... (Existing PDF logic) ...
      if (selectedIds.size === 0) {
          showNotification('Pilih karyawan terlebih dahulu.', 'error');
          return;
      }
      setIsGeneratingBulk(true);
      
      const employeesToPrint = employees.filter(e => selectedIds.has(e.id));
      setBulkPrintData(employeesToPrint);
      
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!hiddenPrintRef.current) {
          setIsGeneratingBulk(false);
          return;
      }

      try {
          const { jsPDF } = jspdf;
          const isLandscape = printOrientation === 'landscape';
          const pdf = new jsPDF(isLandscape ? 'l' : 'p', 'mm', 'a4');
          
          const pageWidth = isLandscape ? 297 : 210;
          const pageHeight = isLandscape ? 210 : 297;
          const margin = 5; // Reduced margin for cleaner fit
          
          const cellWidth = (pageWidth - (margin * 2)) / 2;
          const cellHeight = (pageHeight - (margin * 2)) / 2;

          const slips = hiddenPrintRef.current.querySelectorAll('.bulk-slip-item');
          
          for (let i = 0; i < slips.length; i++) {
              const slipElement = slips[i] as HTMLElement;
              
              const canvas = await html2canvas(slipElement, { 
                  scale: 3, // Higher quality for small text
                  useCORS: true,
                  backgroundColor: '#ffffff',
              });
              const imgData = canvas.toDataURL('image/png');

              const itemsPerPage = 4;
              const positionInPage = i % itemsPerPage;
              
              const col = positionInPage % 2;
              const row = Math.floor(positionInPage / 2);

              if (i > 0 && positionInPage === 0) {
                  pdf.addPage();
              }

              const x = margin + (col * cellWidth);
              const y = margin + (row * cellHeight);
              
              // Remove Rect Border for cleaner look
              // pdf.setDrawColor(220, 220, 220);
              // pdf.rect(x, y, cellWidth, cellHeight);

              const padding = 2; // Reduced padding
              const availableWidth = cellWidth - (padding * 2);
              const availableHeight = cellHeight - (padding * 2);
              
              const imgAspect = canvas.width / canvas.height;
              let drawW = availableWidth;
              let drawH = drawW / imgAspect;

              if (drawH > availableHeight) {
                  drawH = availableHeight;
                  drawW = drawH * imgAspect;
              }
              
              const xOffset = x + padding + (availableWidth - drawW) / 2;
              const yOffset = y + padding + (availableHeight - drawH) / 2; 

              pdf.addImage(imgData, 'PNG', xOffset, yOffset, drawW, drawH);
          }

          pdf.save(`Bulk_Slip_Gaji_${printOrientation}_${new Date().getTime()}.pdf`);
          showNotification('Download PDF massal berhasil.');

      } catch (error) {
          console.error("Error generating bulk PDF:", error);
          showNotification('Gagal membuat PDF massal.', 'error');
      } finally {
          setIsGeneratingBulk(false);
          setBulkPrintData([]);
          setSelectedIds(new Set());
      }
  };

  const summary = React.useMemo(() => {
      return {
          totalPerhitungan: filteredAndSortedEmployees.length,
          totalGajiBruto: filteredAndSortedEmployees.reduce((sum, e) => sum + e.grossIncome, 0),
          totalPph21: filteredAndSortedEmployees.reduce((sum, e) => sum + e.finalPPh21Monthly, 0)
      }
  }, [filteredAndSortedEmployees]);

  const uniqueYears = React.useMemo(() => {
      const dataYears = Array.from(new Set<number>(employees.map(e => e.periodYear)));
      const dynamicYears = getAvailableTaxYears();
      const allYears = Array.from(new Set([...dataYears, ...dynamicYears])).sort((a,b) => b - a);
      return allYears;
  }, [employees]);

  // Use a fixed width slightly larger than a typical A4 quarter to ensure good resolution before downscaling
  // 148mm (half A4 width) * 4 px/mm approx = ~600px. Doubling for safety.
  const hiddenContainerWidth = '1300px'; 

  return (
    <div className="space-y-6 animate-fade-in-up relative">
        {/* Bulk Generation Overlay */}
        {isGeneratingBulk && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center flex-col">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
                <p className="text-white font-bold text-lg">Membuat PDF Massal (4 slip per halaman)...</p>
                <p className="text-gray-400 text-sm">Mohon tunggu, proses ini mungkin memakan waktu.</p>
            </div>
        )}

        {/* Hidden Container for Bulk HTML Rendering - Redesigned to match image */}
        <div className="absolute left-[-9999px] top-0" style={{ width: hiddenContainerWidth }} ref={hiddenPrintRef}>
            {bulkPrintData.map(emp => {
                const master = masterEmployees.find(m => m.id === emp.masterEmployeeId);
                const allowanceTotal = (emp.tunjanganJabatan || 0) + (emp.tunjanganTelekomunikasi || 0) + (emp.tunjanganMakan || 0) + (emp.tunjanganTransportasi || 0) + (emp.overtimePay || 0) + (emp.bonus || 0) + (emp.facilityValue || 0) + (emp.customFixedAllowances?.reduce((s,i)=>s+i.value,0)||0) + (emp.customVariableAllowances?.reduce((s,i)=>s+i.value,0)||0);
                const gross = emp.grossIncome;
                const deductionTotal = (emp.finalPPh21Monthly || 0) + (emp.bpjsDeduction || 0) + (emp.pensionDeduction || 0) + (emp.jpDeduction || 0) + (emp.loan || 0) + (emp.otherDeductions || 0) + (emp.customDeductions?.reduce((s,i)=>s+i.value,0)||0);
                const thp = gross - deductionTotal;
                
                return (
                    <div key={emp.id} className="bulk-slip-item bg-white p-6 mb-4 text-black font-sans text-[10px] w-[600px] h-[400px] inline-block relative overflow-hidden" style={{fontFamily: 'Arial, sans-serif'}}>
                        {/* Header */}
                        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-3 mb-3">
                            <div className="flex items-center gap-3">
                                {profile.logoUrl && <img src={profile.logoUrl} alt="Logo" className="h-10 w-10 object-contain" />}
                                <div>
                                    <h3 className="font-bold text-sm uppercase leading-tight">{profile.companyName}</h3>
                                    <p className="text-[8px] text-gray-500 max-w-[200px] leading-tight">{profile.companyAddress}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="font-extrabold text-xl uppercase tracking-wide">SLIP GAJI</h2>
                                <p className="text-[10px] font-bold text-red-600 uppercase">PERIODE: {months[emp.periodMonth-1]} {emp.periodYear}</p>
                            </div>
                        </div>

                        {/* Employee Info Grid */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-4 text-[9px]">
                            {/* Left Col */}
                            <div className="space-y-1">
                                <div className="flex justify-between border-b border-gray-300 pb-0.5">
                                    <span className="text-gray-500">Nama Karyawan</span>
                                    <span className="font-bold uppercase">{emp.name}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-300 pb-0.5">
                                    <span className="text-gray-500">Jabatan</span>
                                    <span className="font-medium text-right">{master?.position || '-'}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-300 pb-0.5">
                                    <span className="text-gray-500">ID Karyawan</span>
                                    <span className="font-medium">{master?.employeeId || '-'}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-300 pb-0.5">
                                    <span className="text-gray-500">NPWP / NIK</span>
                                    <span className="font-medium">{emp.npwp || '-'}</span>
                                </div>
                            </div>
                            {/* Right Col */}
                            <div className="space-y-1">
                                <div className="flex justify-between border-b border-gray-300 pb-0.5">
                                    <span className="text-gray-500">Status / PTKP</span>
                                    <span className="font-medium">{emp.employeeStatus} ({emp.status})</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-300 pb-0.5">
                                    <span className="text-gray-500">Fasilitas Pajak</span>
                                    <span className="font-medium">{emp.taxFacility === 'Tanpa Fasilitas' ? 'Standar' : 'SKB/DTP'}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-300 pb-0.5">
                                    <span className="text-gray-500">Alamat</span>
                                    <span className="font-medium text-right truncate w-[100px]">{master?.address || '-'}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-300 pb-0.5">
                                    <span className="text-gray-500">Email</span>
                                    <span className="font-medium text-right truncate w-[100px]">{master?.email || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Financials Grid */}
                        <div className="grid grid-cols-2 gap-6 mb-4 text-[9px]">
                            {/* Earnings */}
                            <div>
                                <h4 className="font-bold text-gray-500 uppercase text-[8px] mb-2 border-b border-gray-300 pb-1">PENERIMAAN (EARNINGS)</h4>
                                <div className="space-y-1">
                                    <div className="flex justify-between"><span>Gaji Pokok</span> <span>{formatCurrency(emp.baseSalary)}</span></div>
                                    <div className="flex justify-between"><span>Tunjangan Jabatan</span> <span>{formatCurrency(allowanceTotal)}</span></div>
                                </div>
                                <div className="flex justify-between font-bold bg-blue-50 text-blue-800 p-1 mt-2 rounded-sm">
                                    <span>Total Bruto</span> <span>{formatCurrency(gross)}</span>
                                </div>
                            </div>
                            {/* Deductions */}
                            <div>
                                <h4 className="font-bold text-gray-500 uppercase text-[8px] mb-2 border-b border-gray-300 pb-1">POTONGAN (DEDUCTIONS)</h4>
                                <div className="space-y-1 text-red-600">
                                    <div className="flex justify-between"><span>PPh 21 (Pajak)</span> <span>({formatCurrency(emp.finalPPh21Monthly)})</span></div>
                                    <div className="flex justify-between"><span>BPJS Kesehatan (1%)</span> <span>({formatCurrency(emp.bpjsDeduction)})</span></div>
                                    <div className="flex justify-between"><span>JHT Karyawan (2%)</span> <span>({formatCurrency(emp.pensionDeduction + emp.jpDeduction)})</span></div>
                                </div>
                                <div className="flex justify-between font-bold bg-red-50 text-red-800 p-1 mt-2 rounded-sm">
                                    <span>Total Potongan</span> <span>({formatCurrency(deductionTotal)})</span>
                                </div>
                            </div>
                        </div>

                        {/* Take Home Pay */}
                        <div className="bg-black text-white p-3 flex justify-between items-center rounded-sm mb-6">
                            <div>
                                <span className="block text-[8px] text-gray-400 uppercase font-bold">GAJI BERSIH DITERIMA</span>
                                <span className="block text-sm font-extrabold">TAKE HOME PAY</span>
                            </div>
                            <div className="text-xl font-bold">
                                {formatCurrency(thp)}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-end text-[8px] text-gray-500 relative">
                            <div className="italic">
                                <p className="mb-1">Dokumen ini dibuat secara otomatis oleh sistem dan sah tanpa tanda tangan basah.</p>
                                <p className="font-bold uppercase tracking-wider">POWERED BY VEROZTAX APP</p>
                            </div>
                            <div className="text-right">
                                <p className="mb-4">Dibuat oleh,</p>
                                <p className="font-bold text-black uppercase text-[9px]">{profile.contactName || 'Admin'}</p>
                                <p>{profile.contactPosition || 'HRD'}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <div className="flex items-center space-x-3">
                    <UserGroupIcon />
                    <h1 className="text-3xl font-bold text-gray-100">{title || 'Daftar PPh 21 Bulanan'}</h1>
                </div>
                <p className="text-gray-400 mt-1">Kelola data perhitungan pajak penghasilan bulanan karyawan.</p>
            </div>
            <div className="flex flex-wrap gap-2">
                 <button onClick={handleDownloadPphTemplate} className="bg-gray-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center space-x-2 text-sm">
                    <DownloadIcon />
                    <span>Template</span>
                </button>
                <button onClick={handleImportPphClick} className="bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm">
                    <ImportIcon />
                    <span>Import Excel</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".xlsx, .xls" />
                <button onClick={() => navigateTo(addNewPage || 'pph21Monthly')} className="bg-primary-600 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-primary-900/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    <span>Tambah Bulanan</span>
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
                    <select 
                        value={printOrientation} 
                        onChange={(e) => setPrintOrientation(e.target.value as 'portrait' | 'landscape')}
                        className="bg-gray-800 text-gray-200 text-sm rounded border border-gray-600 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="landscape">Mode Lanskap (Recommended)</option>
                        <option value="portrait">Mode Potret</option>
                    </select>
                    <button 
                        onClick={handleBulkDownload} 
                        disabled={isGeneratingBulk}
                        className="bg-white text-blue-900 font-bold py-2 px-4 rounded hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        {isGeneratingBulk ? <span className="animate-spin h-4 w-4 border-2 border-blue-900 border-t-transparent rounded-full"></span> : <PrinterIcon />}
                        Slip (4-in-1)
                    </button>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400">Total Data</p>
                <p className="text-2xl font-bold text-gray-100">{summary.totalPerhitungan}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400">Total Gaji Bruto</p>
                <p className="text-2xl font-bold text-blue-400">{formatCurrency(summary.totalGajiBruto)}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400">Total PPh 21 Terpotong</p>
                <p className="text-2xl font-bold text-orange-400">{formatCurrency(summary.totalPph21)}</p>
            </div>
        </div>

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
                        <div className="relative md:col-span-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                            <input type="text" placeholder="Cari Nama/NPWP..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200 placeholder-gray-400" />
                        </div>
                        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200 [&>option]:bg-gray-800">
                            <option value="">Semua Tahun</option>
                            {uniqueYears.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200 [&>option]:bg-gray-800">
                            <option value="">Semua Bulan</option>
                            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                        </select>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200 [&>option]:bg-gray-800">
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

        {/* Data Table */}
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
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => requestSort('name')}>
                            <div className="flex items-center space-x-1">
                                <span>Nama Karyawan</span>
                                {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? <SortAscIcon /> : <SortDescIcon />)}
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => requestSort('period')}>
                            <div className="flex items-center space-x-1">
                                <span>Periode</span>
                                {sortConfig.key === 'period' && (sortConfig.direction === 'ascending' ? <SortAscIcon /> : <SortDescIcon />)}
                            </div>
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => requestSort('grossIncome')}>
                            <div className="flex items-center justify-end space-x-1">
                                <span>Bruto</span>
                                {sortConfig.key === 'grossIncome' && (sortConfig.direction === 'ascending' ? <SortAscIcon /> : <SortDescIcon />)}
                            </div>
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => requestSort('finalPPh21Monthly')}>
                            <div className="flex items-center justify-end space-x-1">
                                <span>PPh 21</span>
                                {sortConfig.key === 'finalPPh21Monthly' && (sortConfig.direction === 'ascending' ? <SortAscIcon /> : <SortDescIcon />)}
                            </div>
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {filteredAndSortedEmployees.length > 0 ? (
                        filteredAndSortedEmployees.map((employee) => (
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
                                    <div className="text-sm font-medium text-gray-200">{employee.name}</div>
                                    <div className="text-xs text-gray-400">{employee.npwp}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-300">{months[employee.periodMonth - 1]} {employee.periodYear}</div>
                                    <div className="text-xs text-gray-500">Bulanan</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-300">
                                    {formatCurrency(employee.grossIncome)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-orange-400">
                                    {formatCurrency(employee.finalPPh21Monthly)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button onClick={() => onOpenDetailModal(employee)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md" title="Lihat Detail"><ViewIcon /></button>
                                        <button onClick={() => onEdit(employee)} className="p-2 text-gray-400 hover:text-primary-400 hover:bg-gray-700 rounded-md" title="Edit"><EditIcon /></button>
                                        <button onClick={() => handleDeleteClick(employee)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-md" title="Hapus"><TrashIcon /></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                Tidak ada data yang ditemukan.
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
            title="Hapus Data Bulanan"
            message={`Anda akan menghapus ${idsToDelete.length} data perhitungan PPh 21 Bulanan. Tindakan ini tidak dapat dibatalkan.`}
            isLoading={isDeleting}
        />
    </div>
  );
};

export default EmployeeList;
