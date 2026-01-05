
import * as React from 'react';
import * as XLSX from 'xlsx';
import { Employee, Page, MasterEmployee, MaritalStatus, OvertimeRecord, EmployeeData } from '../types';
import { getAvailableTaxYears } from '../constants';
import { getProfile } from '../services/profileService';

declare const html2canvas: any;
declare const jspdf: any;

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

// Icons
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
const PrinterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2v4h10z" /></svg>;

type SortableKey = 'employeeId' | 'name' | 'npwp' | 'period' | 'status' | 'grossIncome' | 'finalPPh21Monthly';

const EmployeeList2: React.FC<EmployeeListProps> = ({ employees, masterEmployees, onEdit, onDelete, navigateTo, onOpenDetailModal, onImport, showNotification, title, addNewPage }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterYear, setFilterYear] = React.useState('');
  const [filterMonth, setFilterMonth] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // Set default to false (collapsed)
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [sortConfig, setSortConfig] = React.useState<{ key: SortableKey; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isGeneratingBulk, setIsGeneratingBulk] = React.useState(false);
  const hiddenPrintRef = React.useRef<HTMLDivElement>(null);
  const [bulkPrintData, setBulkPrintData] = React.useState<Employee[]>([]);
  const [printOrientation, setPrintOrientation] = React.useState<'portrait' | 'landscape'>('portrait');
  
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const profile = getProfile(employees[0]?.masterEmployeeId || 'dummy');

  const requestSort = (key: SortableKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

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

  // Bulk PDF Generation (4 Slips per A4 Page)
  const handleBulkDownload = async () => {
      if (selectedIds.size === 0) {
          showNotification('Pilih data terlebih dahulu.', 'error');
          return;
      }
      setIsGeneratingBulk(true);
      
      const employeesToPrint = employees.filter(e => selectedIds.has(e.id));
      setBulkPrintData(employeesToPrint);
      
      // Allow DOM to update
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
          const margin = 10;
          
          const cellWidth = (pageWidth - (margin * 2)) / 2;
          const cellHeight = (pageHeight - (margin * 2)) / 2;

          const slips = hiddenPrintRef.current.querySelectorAll('.bulk-slip-item');
          
          for (let i = 0; i < slips.length; i++) {
              const slipElement = slips[i] as HTMLElement;
              
              const canvas = await html2canvas(slipElement, { 
                  scale: 2,
                  useCORS: true,
                  backgroundColor: '#ffffff'
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
              
              pdf.setDrawColor(200, 200, 200);
              pdf.rect(x, y, cellWidth, cellHeight);

              const padding = 5;
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

          pdf.save(`Bulk_Slip_NonFinal_${printOrientation}_${new Date().getTime()}.pdf`);
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

  const handleDownloadTemplate = () => {
      const headers = [
          'ID Karyawan*', 'Tahun*', 'Bulan*', 
          'Penghasilan Bruto', 
          'Kode Objek Pajak (Contoh: 21-100-07)', 
          'Nama Objek Pajak (Optional)',
          'Gross Up (YA/TIDAK)',
          'Fasilitas (Tanpa Fasilitas/DTP/Fasilitas Lainnya)',
          'No SKB/DTP'
      ];
      const example = [
          'K005', new Date().getFullYear(), new Date().getMonth()+1, 
          5000000, '21-100-07', 'Tenaga Ahli',
          'TIDAK', 'Tanpa Fasilitas', ''
      ];
      const ws = XLSX.utils.aoa_to_sheet([headers, example]);
      ws['!cols'] = headers.map(h => ({ wch: h.length + 5 }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template NonFinal");
      XLSX.writeFile(wb, "template_import_pph21_nonfinal.xlsx");
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
                  showNotification('File Excel kosong atau tidak memiliki data.', 'error');
                  return;
              }

              const employeesToImport: Omit<EmployeeData, 'id'>[] = [];
              const errors: string[] = [];

              jsonData.forEach((row, index) => {
                  const employeeId = row['ID Karyawan*'];
                  const year = parseInt(row['Tahun*'], 10);
                  const month = parseInt(row['Bulan*'], 10);
                  const gross = Number(row['Penghasilan Bruto'] || 0);
                  const taxObjectCode = row['Kode Objek Pajak (Contoh: 21-100-07)'];

                  if (!employeeId || !year || !month || month < 1 || month > 12) {
                      errors.push(`Baris ${index + 2}: ID Karyawan, Tahun, dan Bulan wajib diisi.`);
                      return;
                  }
                  if (!taxObjectCode) {
                      errors.push(`Baris ${index + 2}: Kode Objek Pajak wajib diisi.`);
                      return;
                  }

                  const masterEmp = masterEmployees.find(e => e.employeeId === employeeId);
                  if (!masterEmp) {
                      errors.push(`Baris ${index + 2}: Karyawan dengan ID '${employeeId}' tidak ditemukan.`);
                      return;
                  }

                  const employeeData: Omit<EmployeeData, 'id'> = {
                      masterEmployeeId: masterEmp.id,
                      calculationType: 'nonFinal',
                      name: masterEmp.fullName,
                      npwp: masterEmp.npwp,
                      address: masterEmp.address,
                      status: masterEmp.ptkpStatus,
                      employeeStatus: masterEmp.employeeStatus,
                      isForeigner: masterEmp.isForeigner,
                      periodYear: year,
                      periodMonth: month,
                      baseSalary: gross,
                      tunjanganPph: 0, tunjanganJabatan: 0, tunjanganTelekomunikasi: 0,
                      tunjanganMakan: 0, tunjanganTransportasi: 0, overtimePay: 0,
                      bonus: 0, facilityValue: 0, loan: 0, otherDeductions: 0,
                      pensionDeduction: 0, jpDeduction: 0, bpjsDeduction: 0, zakatDeduction: 0,
                      
                      isGrossUp: String(row['Gross Up (YA/TIDAK)'] || 'TIDAK').toUpperCase() === 'YA',
                      taxFacility: (row['Fasilitas (Tanpa Fasilitas/DTP/Fasilitas Lainnya)'] || 'Tanpa Fasilitas') as any,
                      taxFacilityNumber: row['No SKB/DTP'] || '',
                      taxObjectCode: taxObjectCode,
                      taxObjectName: row['Nama Objek Pajak (Optional)'] || taxObjectCode,
                      signerIdentity: 'NPWP',
                      customFixedAllowances: [], customVariableAllowances: [], customDeductions: [],
                  };
                  employeesToImport.push(employeeData);
              });

              if (errors.length > 0) {
                  showNotification(`Gagal import. ${errors.length} error ditemukan. Cek konsol.`, 'error');
                  console.error("Import Errors:", errors);
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
    setFilterMonth('');
    setFilterStatus('');
  };

  const handleDeleteClick = (employee: Employee) => {
    const period = `${months[employee.periodMonth - 1]} ${employee.periodYear}`;
    if (window.confirm(`Anda yakin ingin menghapus data PPh 21 Final/Tidak Final untuk ${employee.name} periode ${period}?`)) {
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
                case 'employeeId': return emp.masterEmployeeId; 
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
}, [employees, searchTerm, filterYear, filterMonth, filterStatus, sortConfig]);

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

  // Dynamic width for hidden container based on orientation to simulate print width
  const hiddenContainerWidth = printOrientation === 'landscape' ? '1200px' : '800px'; 

  return (
    <div className="space-y-6 animate-fade-in-up relative">
        {/* Bulk Generation Overlay */}
        {isGeneratingBulk && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center flex-col">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
                <p className="text-white font-bold text-lg">Membuat PDF Massal (4 slip per halaman)...</p>
            </div>
        )}

        {/* Hidden Container for Bulk HTML Rendering */}
        <div className="absolute left-[-9999px] top-0" style={{ width: hiddenContainerWidth }} ref={hiddenPrintRef}>
            {bulkPrintData.map(emp => {
                const thp = emp.grossIncome - emp.finalPPh21Monthly; // Simpler THP for non-final usually
                return (
                    <div key={emp.id} className="bulk-slip-item bg-white p-4 mb-4 text-black font-sans text-[10px] border border-gray-300 w-full h-auto inline-block">
                        <div className="flex justify-between items-start border-b border-black pb-2 mb-2">
                            <div>
                                <h2 className="font-bold text-lg uppercase">BUKTI POTONG NON-FINAL</h2>
                                <p>Periode: {months[emp.periodMonth-1]} {emp.periodYear}</p>
                            </div>
                            <div className="text-right">
                                <h3 className="font-bold uppercase">{profile.companyName}</h3>
                                <p className="text-[8px] max-w-[150px]">{profile.companyAddress}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <div>
                                <div className="flex justify-between"><span>Nama:</span> <span className="font-bold">{emp.name}</span></div>
                                <div className="flex justify-between"><span>NPWP:</span> <span>{emp.npwp}</span></div>
                            </div>
                            <div>
                                <div className="flex justify-between"><span>Objek Pajak:</span> <span>{emp.taxObjectCode}</span></div>
                                <div className="flex justify-between"><span>Status:</span> <span>{emp.status}</span></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-2 border-t border-black pt-2">
                            <div>
                                <h4 className="font-bold border-b border-gray-300 mb-1">PENGHASILAN</h4>
                                <div className="flex justify-between font-bold mt-1 pt-1"><span>Bruto</span> <span>{formatCurrency(emp.grossIncome)}</span></div>
                            </div>
                            <div>
                                <h4 className="font-bold border-b border-gray-300 mb-1">PEMOTONGAN</h4>
                                <div className="flex justify-between"><span>Tarif Efektif</span> <span>{emp.grossIncome > 0 ? ((emp.finalPPh21Monthly/emp.grossIncome)*100).toFixed(2) : 0}%</span></div>
                                <div className="flex justify-between font-bold border-t border-gray-300 mt-1 pt-1"><span>PPh 21</span> <span>{formatCurrency(emp.finalPPh21Monthly)}</span></div>
                            </div>
                        </div>
                        <div className="bg-gray-200 p-2 flex justify-between items-center font-bold text-lg mb-4">
                            <span>NETO DITERIMA</span>
                            <span>{formatCurrency(thp)}</span>
                        </div>
                        <div className="text-center text-[8px] italic">
                            Dokumen ini sah dan dicetak otomatis oleh sistem VerozTax.
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <div className="flex items-center space-x-3">
                    <UserGroupIcon />
                    <h1 className="text-3xl font-bold text-gray-100">{title || 'Daftar PPh 21 Final / Tidak Final'}</h1>
                </div>
                <p className="text-gray-400 mt-1">Kelola pajak untuk Bukan Pegawai (Tenaga Ahli, Peserta Kegiatan, dll).</p>
            </div>
            <div className="flex flex-wrap gap-2">
                 <button onClick={handleDownloadTemplate} className="bg-gray-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center space-x-2 text-sm">
                    <DownloadIcon />
                    <span>Template</span>
                </button>
                <button onClick={handleImportClick} className="bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm">
                    <ImportIcon />
                    <span>Import Excel</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".xlsx, .xls" />
                <button onClick={() => navigateTo(addNewPage || 'pph21NonFinal')} className="bg-primary-600 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-primary-900/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    <span>Tambah Data</span>
                </button>
            </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
            <div className="bg-blue-900/40 border border-blue-700 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center animate-fade-in gap-4">
                <div className="text-blue-200 font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {selectedIds.size} Data Terpilih
                </div>
                <div className="flex gap-3 items-center">
                    <select 
                        value={printOrientation} 
                        onChange={(e) => setPrintOrientation(e.target.value as 'portrait' | 'landscape')}
                        className="bg-gray-800 text-white text-sm rounded border border-gray-600 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="portrait">Mode Potret</option>
                        <option value="landscape">Mode Lanskap</option>
                    </select>
                    <button 
                        onClick={handleBulkDownload} 
                        disabled={isGeneratingBulk}
                        className="bg-white text-blue-900 font-bold py-2 px-4 rounded hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        {isGeneratingBulk ? <span className="animate-spin h-4 w-4 border-2 border-blue-900 border-t-transparent rounded-full"></span> : <PrinterIcon />}
                        Download Slip (4-in-1)
                    </button>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400">Total Transaksi</p>
                <p className="text-2xl font-bold text-gray-100">{summary.totalPerhitungan}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400">Total Penghasilan Bruto</p>
                <p className="text-2xl font-bold text-blue-400">{formatCurrency(summary.totalGajiBruto)}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400">Total PPh 21 Terpotong</p>
                <p className="text-2xl font-bold text-orange-400">{formatCurrency(summary.totalPph21)}</p>
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
                        <div className="relative md:col-span-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                            <input type="text" placeholder="Cari Nama/NPWP..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200" />
                        </div>
                        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200 [&>option]:bg-gray-800">
                            <option value="">Semua Tahun</option>
                            {uniqueYears.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200 [&>option]:bg-gray-800">
                            <option value="">Semua Bulan</option>
                            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
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
                                <span>Nama Penerima</span>
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
                                    <div className="text-xs text-gray-400 max-w-[200px] truncate" title={employee.taxObjectName}>{employee.taxObjectName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-300">{months[employee.periodMonth - 1]} {employee.periodYear}</div>
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
                        <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">Tidak ada data.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default EmployeeList2;
