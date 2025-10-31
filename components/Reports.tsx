
import * as React from 'react';
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

const DocumentDownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

const Reports: React.FC<ReportsProps> = ({ employees, masterEmployees, profile, showNotification }) => {
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth() + 1);

  const handleExportXML = () => {
    try {
        const filteredEmployees = employees.filter(e => e.periodYear === selectedYear && e.periodMonth === selectedMonth);
        if (filteredEmployees.length === 0) {
            showNotification(`Tidak ada data PPh 21 untuk periode ${selectedMonth}/${selectedYear}.`, 'error');
            return;
        }

        const companyTin = profile.companyNpwp.replace(/\D/g, '');

        const escapeXML = (str: string | number | undefined | null): string => {
            if (str === undefined || str === null) return '';
            const s = String(str);
            return s.replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&apos;');
        };

        const mmPayrollList = filteredEmployees.map(emp => {
            const masterEmp = masterEmployees.find(m => m.id === emp.masterEmployeeId);
            const counterpartOpt = emp.isForeigner ? 'Foreign' : 'Resident';
            const counterpartPassport = masterEmp?.passportNumber;
            const counterpartTin = masterEmp?.ktp?.replace(/\D/g, '') || '';
            
            let taxCertificate = 'N/A';
            if (emp.taxFacility === 'PPh Ditanggung Pemerintah (DTP)') {
                taxCertificate = 'DTP';
            } else if (emp.taxFacility === 'Fasilitas Lainnya') {
                taxCertificate = 'ETC';
            }
            
            const terRate = getTerRate(emp.status, emp.grossIncome);
            const rateValue = terRate * 100;

            const lastDay = new Date(emp.periodYear, emp.periodMonth, 0);
            const withholdingDateStr = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

            const idPlaceOfBusiness = (profile.idTku || (companyTin + '000000')).replace(/\D/g, '');

            const passportField = counterpartPassport 
                ? `<CounterpartPassport>${escapeXML(counterpartPassport)}</CounterpartPassport>` 
                : `<CounterpartPassport xsi:nil="true"/>`;

            return `
		<MmPayroll>
			<TaxPeriodMonth>${escapeXML(emp.periodMonth)}</TaxPeriodMonth>
			<TaxPeriodYear>${escapeXML(emp.periodYear)}</TaxPeriodYear>
			<CounterpartOpt>${escapeXML(counterpartOpt)}</CounterpartOpt>
			${passportField}
			<CounterpartTin>${escapeXML(counterpartTin)}</CounterpartTin>
			<StatusTaxExemption>${escapeXML(emp.status)}</StatusTaxExemption>
			<Position>${escapeXML(masterEmp?.position || 'N/A')}</Position>
			<TaxCertificate>${escapeXML(taxCertificate)}</TaxCertificate>
			<TaxObjectCode>${escapeXML(emp.taxObjectCode || '21-100-01')}</TaxObjectCode>
			<Gross>${escapeXML(Math.round(emp.grossIncome))}</Gross>
			<Rate>${escapeXML(rateValue)}</Rate>
			<IDPlaceOfBusinessActivity>${escapeXML(idPlaceOfBusiness)}</IDPlaceOfBusinessActivity>
			<WithholdingDate>${escapeXML(withholdingDateStr)}</WithholdingDate>
		</MmPayroll>`;
        }).join('');

        const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<MmPayrollBulk xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
	<TIN>${escapeXML(companyTin)}</TIN>
	<ListOfMmPayroll>${mmPayrollList}
	</ListOfMmPayroll>
</MmPayrollBulk>`;
        
        const blob = new Blob([xmlContent.trim()], { type: 'application/xml;charset=utf-8' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `PPh21_Bulk_${selectedYear}_${selectedMonth}.xml`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
            'TIN',
            'TaxPeriodMonth',
            'TaxPeriodYear',
            'CounterpartOpt',
            'CounterpartPassport',
            'CounterpartTin',
            'StatusTaxExemption',
            'Position',
            'TaxCertificate',
            'TaxObjectCode',
            'Gross',
            'Rate',
            'IDPlaceOfBusinessActivity',
            'WithholdingDate'
        ];

        const dataForSheet: any[][] = [headers];

        filteredEmployees.forEach(emp => {
            const masterEmp = masterEmployees.find(m => m.id === emp.masterEmployeeId);
            
            let counterpartTin = (emp.npwp || '').replace(/\D/g, '');
            if (!counterpartTin && masterEmp?.ktp) {
                counterpartTin = masterEmp.ktp.replace(/\D/g, '');
            }
            
            const lastDayOfMonth = new Date(emp.periodYear, emp.periodMonth, 0);
            const formattedWithholdingDate = `${lastDayOfMonth.getDate().toString().padStart(2, '0')}/${(lastDayOfMonth.getMonth() + 1).toString().padStart(2, '0')}/${lastDayOfMonth.getFullYear()}`;

            let taxCertificate = 'N/A';
            if (emp.taxFacility === 'PPh Ditanggung Pemerintah (DTP)') {
                taxCertificate = 'DTP';
            } else if (emp.taxFacility === 'Fasilitas Lainnya') {
                taxCertificate = 'ETC';
            }

            const employeeRow = [
                companyTinRaw,
                emp.periodMonth,
                emp.periodYear,
                emp.isForeigner ? 'Foreign' : 'Resident',
                masterEmp?.passportNumber || '',
                counterpartTin || '',
                emp.status,
                masterEmp?.position || 'N/A',
                taxCertificate,
                emp.taxObjectCode,
                emp.grossIncome,
                getTerRate(emp.status, emp.grossIncome) * 100,
                idTku,
                formattedWithholdingDate,
            ];
            dataForSheet.push(employeeRow);
        });
        
        const ws = XLSX.utils.aoa_to_sheet(dataForSheet);

        const integerFormat = '#,##0';
        const decimalFormat = '#,##0.00';

        // Data starts at row 2 (Excel), which is index 1
        for (let R = 1; R < dataForSheet.length; ++R) { 
            // Gross (Column K, index 10)
            const cellK = XLSX.utils.encode_cell({r: R, c: 10});
            if(ws[cellK]) {
                ws[cellK].t = 'n';
                ws[cellK].z = integerFormat;
            }
            
            // Rate (Column L, index 11)
            const cellL = XLSX.utils.encode_cell({r: R, c: 11});
            if(ws[cellL]) {
                ws[cellL].t = 'n';
                ws[cellL].z = decimalFormat;
            }
        }

        ws['!cols'] = [
            { wch: 20 }, // A: TIN
            { wch: 15 }, // B: TaxPeriodMonth
            { wch: 15 }, // C: TaxPeriodYear
            { wch: 15 }, // D: CounterpartOpt
            { wch: 20 }, // E: CounterpartPassport
            { wch: 20 }, // F: CounterpartTin
            { wch: 20 }, // G: StatusTaxExemption
            { wch: 20 }, // H: Position
            { wch: 15 }, // I: TaxCertificate
            { wch: 15 }, // J: TaxObjectCode
            { wch: 15 }, // K: Gross
            { wch: 10 }, // L: Rate
            { wch: 25 }, // M: IDPlaceOfBusinessActivity
            { wch: 15 }, // N: WithholdingDate
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

  const uniqueYears = React.useMemo(() => Array.from(new Set<number>(employees.map(e => e.periodYear))).sort((a,b) => b - a), [employees]);
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div className="space-y-6 animate-fade-in-up max-w-2xl mx-auto">
        <div>
            <div className="flex items-center space-x-3">
                <DocumentDownloadIcon />
                <h1 className="text-3xl font-bold text-gray-100">Laporan & Export</h1>
            </div>
            <p className="text-gray-400 mt-1">Generate laporan PPh 21 bulanan dalam format Excel atau XML.</p>
        </div>

        <div className="bg-gray-800 p-8 rounded-lg shadow-xl shadow-black/20">
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
    </div>
  );
};

const ReportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


export default Reports;
