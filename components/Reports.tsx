
import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Employee, MasterEmployee, Profile, MaritalStatus } from '../types';
import { TER_RATES, TER_CATEGORY_MAP } from '../constants';

interface ReportsProps {
  employees: Employee[];
  masterEmployees: MasterEmployee[];
  profile: Profile;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

function getTerRate(status: MaritalStatus, monthlyGross: number): number {
    const category = TER_CATEGORY_MAP[status] || 'A';
    const ratesForCategory = TER_RATES[category];

    for (const bracket of ratesForCategory) {
        if (monthlyGross <= bracket.limit) {
            return bracket.rate;
        }
    }
    return ratesForCategory[ratesForCategory.length - 1]?.rate || 0;
}

const getTerRateForCategory = (category: 'A' | 'B' | 'C', monthlyGross: number): number => {
    const ratesForCategory = TER_RATES[category];
    for (const bracket of ratesForCategory) {
        if (monthlyGross <= bracket.limit) {
            return bracket.rate;
        }
    }
    return ratesForCategory[ratesForCategory.length - 1]?.rate || 0;
};


const Reports: React.FC<ReportsProps> = ({ employees, masterEmployees, profile, showNotification }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const handleExportXML = () => {
    try {
        const filteredEmployees = employees.filter(e => e.periodYear === selectedYear && e.periodMonth === selectedMonth);
        if (filteredEmployees.length === 0) {
            showNotification(`Tidak ada data PPh 21 untuk periode ${selectedMonth}/${selectedYear}.`, 'error');
            return;
        }

        const companyTin = profile.companyNpwp.replace(/\D/g, '');
        const idPlaceOfBusiness = (profile.idTku || (companyTin + '0000')).replace(/\D/g, '');
        
        // Force these long numbers to be treated as text by prepending a zero-width space.
        // This prevents spreadsheet programs from converting them to scientific notation.
        const textFormattedCompanyTin = `\u200B${companyTin}`;
        const textFormattedIdPlaceOfBusiness = `\u200B${idPlaceOfBusiness}`;


        const dataRows = filteredEmployees.map(emp => {
            const masterEmp = masterEmployees.find(m => m.id === emp.masterEmployeeId);
            
            const counterpartOpt = emp.isForeigner ? 'Foreign' : 'Resident';
            const counterpartPassport = masterEmp?.passportNumber || '';
            const rawCounterpartTin = masterEmp?.ktp?.replace(/\D/g, '') || '';
            const textFormattedCounterpartTin = `\u200B${rawCounterpartTin}`;

            
            let taxCertificate = 'N/A';
            if (emp.taxFacility === 'PPh Ditanggung Pemerintah (DTP)') {
                taxCertificate = 'DTP';
            } else if (emp.taxFacility === 'Fasilitas Lainnya') {
                taxCertificate = 'ETC';
            }

            const terRate = getTerRate(emp.status, emp.grossIncome);
            const ratePercentage = terRate * 100;
            const rateFormatted = ratePercentage.toLocaleString('de-DE', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 4
            });

            const withholdingDate = new Date(emp.periodYear, emp.periodMonth, 3);
            const withholdingDateStr = `${withholdingDate.getFullYear()}-${(withholdingDate.getMonth() + 1).toString().padStart(2, '0')}-${withholdingDate.getDate().toString().padStart(2, '0')}`;
            
            return `  <Karyawan>
        <TIN>${textFormattedCompanyTin}</TIN>
        <TaxPeriodMonth>${emp.periodMonth}</TaxPeriodMonth>
        <TaxPeriodYear>${emp.periodYear}</TaxPeriodYear>
        <CounterpartOpt>${counterpartOpt}</CounterpartOpt>
        <CounterpartPassport>${counterpartPassport}</CounterpartPassport>
        <CounterpartTin>${textFormattedCounterpartTin}</CounterpartTin>
        <StatusTaxExemption>${emp.status}</StatusTaxExemption>
        <Position>${masterEmp?.position || 'N/A'}</Position>
        <TaxCertificate>${taxCertificate}</TaxCertificate>
        <TaxObjectCode>${emp.taxObjectCode || '21-100-01'}</TaxObjectCode>
        <Gross>${Math.round(emp.grossIncome)}</Gross>
        <Rate>${rateFormatted}</Rate>
        <IDPlaceOfBusinessActivity>${textFormattedIdPlaceOfBusiness}</IDPlaceOfBusinessActivity>
        <WithholdingDate>${withholdingDateStr}</WithholdingDate>
    </Karyawan>`;
        }).join('\n');

        const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
    <LaporanPPh21>
    ${dataRows}
    </LaporanPPh21>`;

        const blob = new Blob([xmlString.trim()], { type: 'application/xml;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `laporan_pph21_${selectedYear}_${selectedMonth}.xml`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('Berhasil Unduh');
    } catch (error) {
        showNotification('Gagal', 'error');
        console.error(error);
    }
  };

  const handleExportXLSX = () => {
    try {
        const filteredEmployees = employees.filter(e => e.periodYear === selectedYear && e.periodMonth === selectedMonth);
        if (filteredEmployees.length === 0) {
            showNotification(`Tidak ada data PPh 21 untuk periode ${selectedMonth}/${selectedYear}.`, 'error');
            return;
        }

        const companyTinRaw = profile.companyNpwp.replace(/\D/g, '');
        const idTku = profile.idTku || (companyTinRaw + '0000');
        
        const headers = [
            null, // Column A is empty for the header row
            'Masa Pajak', 'Tahun Pajak', 'Status Pegawai', 'NPWP/NIK/TIN', 'Nomor Passport',
            'Status', 'Posisi', 'Sertifikat/Fasilitas', 'Kode Objek Pajak', 'Penghasilan Kotor',
            'Tarif', 'ID TKU', 'Tgl Pemotongan', null, 'TER A', 'TER B', 'TER C'
        ];

        const dataForSheet: any[][] = [
            ['NPWP Pemotong', companyTinRaw],
            [], // Empty Row 2
            [], // Empty Row 3
            headers // Headers start on Row 4
        ];

        filteredEmployees.forEach(emp => {
            const masterEmp = masterEmployees.find(m => m.id === emp.masterEmployeeId);
            let counterpartTin = (emp.npwp || '').replace(/\D/g, '');
            if (!counterpartTin && masterEmp?.ktp) {
                counterpartTin = masterEmp.ktp.replace(/\D/g, '');
            }

            const withholdingDate = new Date(emp.periodYear, emp.periodMonth, 3);
            const formattedWithholdingDate = `${withholdingDate.getDate().toString().padStart(2, '0')}/${(withholdingDate.getMonth() + 1).toString().padStart(2, '0')}/${withholdingDate.getFullYear()}`;

            let taxCertificate = 'N/A';
            if (emp.taxFacility === 'PPh Ditanggung Pemerintah (DTP)') {
                taxCertificate = 'DTP';
            } else if (emp.taxFacility === 'Fasilitas Lainnya') {
                taxCertificate = 'ETC';
            }

            const employeeRow = [
                null, // Column A is empty
                emp.periodMonth,
                emp.periodYear,
                emp.isForeigner ? 'Foreign' : 'Resident',
                counterpartTin || '',
                masterEmp?.passportNumber || '',
                emp.status,
                masterEmp?.position || 'N/A',
                taxCertificate,
                emp.taxObjectCode,
                emp.grossIncome,
                getTerRate(emp.status, emp.grossIncome) * 100,
                idTku,
                formattedWithholdingDate,
                null, // Empty column O
                getTerRateForCategory('A', emp.grossIncome) * 100,
                getTerRateForCategory('B', emp.grossIncome) * 100,
                getTerRateForCategory('C', emp.grossIncome) * 100,
            ];
            dataForSheet.push(employeeRow);
        });
        
        const ws = XLSX.utils.aoa_to_sheet(dataForSheet);

        // Apply number formatting for specific columns
        const integerFormat = '#,##0';
        const decimalFormat = '#,##0.00';

        for (let R = 4; R < dataForSheet.length; ++R) { // Data starts at row 5 (Excel), which is index 4
            // Penghasilan Kotor (Column K, index 10)
            const cellK = XLSX.utils.encode_cell({r: R, c: 10});
            if(ws[cellK]) ws[cellK].z = integerFormat;
            
            // Tarif (Column L, index 11)
            const cellL = XLSX.utils.encode_cell({r: R, c: 11});
            if(ws[cellL]) ws[cellL].z = decimalFormat;

            // TER A, B, C (Columns P, Q, R, indices 15, 16, 17)
            [15, 16, 17].forEach(C => {
                const cell = XLSX.utils.encode_cell({r: R, c: C});
                if (ws[cell]) ws[cell].z = decimalFormat;
            });
        }

        // Set Column Widths
        ws['!cols'] = [
            { wch: 2 },  // A (very narrow as it's empty)
            { wch: 12 }, // B Masa Pajak
            { wch: 12 }, // C Tahun Pajak
            { wch: 15 }, // D Status Pegawai
            { wch: 20 }, // E NPWP/NIK
            { wch: 15 }, // F Passport
            { wch: 10 }, // G Status PTKP
            { wch: 20 }, // H Posisi
            { wch: 20 }, // I Sertifikat
            { wch: 15 }, // J Kode Objek
            { wch: 20 }, // K Penghasilan
            { wch: 10 }, // L Tarif
            { wch: 25 }, // M ID TKU
            { wch: 15 }, // N Tgl Pemotongan
            { wch: 2 },  // O (empty column)
            { wch: 10 }, // P TER A
            { wch: 10 }, // Q TER B
            { wch: 10 }  // R TER C
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Laporan PPh 21");
        XLSX.writeFile(wb, `laporan_pph21_${selectedYear}_${selectedMonth}.xlsx`);
        showNotification('Berhasil Unduh');
    } catch (error) {
        showNotification('Gagal', 'error');
        console.error(error);
    }
  };

  // Fix: Explicitly type the Set to prevent its elements from being inferred as 'unknown', which causes type errors in sort.
  const uniqueYears = useMemo(() => Array.from(new Set<number>(employees.map(e => e.periodYear))).sort((a,b) => b - a), [employees]);
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-xl shadow-black/20 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-primary-400">Laporan & Export</h2>
      <p className="text-gray-400 mb-6">
        Pilih periode laporan yang ingin Anda generate, kemudian export ke format yang diinginkan.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <label htmlFor="year-select" className="block text-sm font-medium text-gray-300 mb-1">Tahun Laporan</label>
          <select 
              id="year-select" 
              value={selectedYear} 
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200"
          >
            {uniqueYears.length > 0 ? uniqueYears.map(year => <option key={year} value={year}>{year}</option>) : <option>{new Date().getFullYear()}</option>}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="month-select" className="block text-sm font-medium text-gray-300 mb-1">Bulan Laporan</label>
          <select 
              id="month-select" 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200"
          >
            {months.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
         <button 
          onClick={handleExportXLSX} 
          className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
        >
          <ReportIcon />
          <span>Export ke Excel (.xlsx)</span>
        </button>
        <button 
          onClick={handleExportXML} 
          className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
        >
          <ReportIcon />
          <span>Export ke XML</span>
        </button>
      </div>

    </div>
  );
};

const ReportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


export default Reports;
