
import * as React from 'react';
import * as XLSX from 'xlsx';
import { Employee, MasterEmployee, Profile, MaritalStatus } from '../types';
import { TER_RATES, TER_CATEGORY_MAP, getAvailableTaxYears } from '../constants';

interface ReportsProps {
  employees: Employee[];
  masterEmployees: MasterEmployee[];
  profile: Profile;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

// Helper to calculate effective rate for display/xml if needed
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

const Reports: React.FC<ReportsProps> = ({ employees, masterEmployees, profile, showNotification }) => {
  const [activeTab, setActiveTab] = React.useState<'monthly' | 'nonFinal' | 'annual'>('monthly');
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth() + 1);

  // --- XML GENERATION HELPERS ---

  const escapeXML = (str: string | number | undefined | null): string => {
      if (str === undefined || str === null) return '';
      const s = String(str);
      return s.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;');
  };

  const formatDateForXML = (dateString?: string): string => {
      if (!dateString) return new Date().toISOString().split('T')[0];
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
      return d.toISOString().split('T')[0];
  };

  // --- EXCEL GENERATION HELPERS ---

  const formatDateForExcel = (dateString?: string): string => {
      if (!dateString) return '';
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '';
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
      const blob = new Blob([content], { type });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  const downloadExcel = (data: any[][], sheetName: string, filename: string) => {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(data);
      ws['!cols'] = data[0].map(() => ({ wch: 20 })); // Set default column width
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, filename);
  };

  // --- 1. EXPORT MONTHLY (MmPayrollBulk) ---
  const getMonthlyDataFiltered = () => {
      // Ensure strict number comparison for Year and Month
      return employees.filter(e => 
          e.calculationType === 'monthly' && 
          Number(e.periodYear) === Number(selectedYear) && 
          Number(e.periodMonth) === Number(selectedMonth)
      );
  };

  const handleExportMonthlyXML = () => {
      const filtered = getMonthlyDataFiltered();
      if (filtered.length === 0) {
          showNotification(`Tidak ada data PPh 21 Bulanan untuk ${selectedMonth}/${selectedYear}`, 'error');
          return;
      }

      const companyTin = (profile.companyNpwp || '').replace(/\D/g, '');
      
      const items = filtered.map(emp => {
          const master = masterEmployees.find(m => m.id === emp.masterEmployeeId);
          const tin = (master?.npwp || emp.npwp || '').replace(/\D/g, '');
          const passport = master?.passportNumber || '';
          
          let cert = 'N/A';
          if (emp.taxFacility === 'PPh Ditanggung Pemerintah (DTP)') cert = 'DTP';
          else if (emp.taxFacility === 'Surat Keterangan Bebas (SKB) Pemotongan PPh Pasal 21') cert = 'SKB';

          const rate = getTerRate(emp.status, emp.grossIncome) * 100;
          const idPlace = (profile.idTku || (companyTin + '000000')).replace(/\D/g, '');
          const withholdingDate = formatDateForXML(emp.tanggalPemotongan || new Date(selectedYear, selectedMonth, 0).toISOString());

          return `
    <MmPayroll>
      <TaxPeriodMonth>${escapeXML(emp.periodMonth)}</TaxPeriodMonth>
      <TaxPeriodYear>${escapeXML(emp.periodYear)}</TaxPeriodYear>
      <CounterpartOpt>${emp.isForeigner ? 'Foreign' : 'Resident'}</CounterpartOpt>
      <CounterpartPassport>${escapeXML(passport)}</CounterpartPassport>
      <CounterpartTin>${escapeXML(tin)}</CounterpartTin>
      <StatusTaxExemption>${escapeXML(emp.status)}</StatusTaxExemption>
      <Position>${escapeXML(master?.position || 'Pegawai')}</Position>
      <TaxCertificate>${escapeXML(cert)}</TaxCertificate>
      <TaxObjectCode>${escapeXML(emp.taxObjectCode || '21-100-01')}</TaxObjectCode>
      <Gross>${Math.round(emp.grossIncome)}</Gross>
      <Rate>${rate}</Rate>
      <IDPlaceOfBusinessActivity>${escapeXML(idPlace)}</IDPlaceOfBusinessActivity>
      <WithholdingDate>${escapeXML(withholdingDate)}</WithholdingDate>
    </MmPayroll>`;
      }).join('');

      const xml = `<?xml version="1.0" encoding="utf-8"?>
<!-- Created with VerozTax -->
<MmPayrollBulk xsi:noNamespaceSchemaLocation="schema.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <TIN>${escapeXML(companyTin)}</TIN>
  <ListOfMmPayroll>${items}
  </ListOfMmPayroll>
</MmPayrollBulk>`;

      downloadFile(xml, `PPh21_Bulanan_${selectedYear}_${selectedMonth}.xml`, 'application/xml');
      showNotification('Export XML Bulanan Berhasil');
  };

  const handleExportMonthlyExcel = () => {
      const filtered = getMonthlyDataFiltered();
      if (filtered.length === 0) {
          showNotification(`Tidak ada data PPh 21 Bulanan untuk ${selectedMonth}/${selectedYear}`, 'error');
          return;
      }

      const headers = [
          'No', 'NITKU Pemotong', 'Masa Pajak', 'Tahun Pajak', 'Tgl Pemotongan (dd/MM/yyyy)', 
          'NIK/NPWP16 (tanpa format/tanda baca)', 'Nama Penerima Penghasilan Sesuai NIK/NPWP16', 
          'Alamat Penerima Penghasilan Sesuai NIK/NPWP16', 'Jabatan Penerima Penghasilan', 
          'Email Penerima Penghasilan', 'Kode Objek Pajak', 'Kode PTKP', 'Penghasilan Bruto', 
          'Fasilitas', 'Tarif Fasilitas Lainnya', 'Nomor Fasilitas', 'Menggunakan Gross Up? (Ya/Tidak)', 
          'Referensi', 'Nomor Bukti Potong Diganti', 'Pengganti Ke-', 'Nomor Paspor', 'Kode Negara'
      ];

      const data = filtered.map((emp, index) => {
          const master = masterEmployees.find(m => m.id === emp.masterEmployeeId);
          const tin = (master?.npwp || emp.npwp || '').replace(/\D/g, '');
          const withholdingDate = formatDateForExcel(emp.tanggalPemotongan || new Date(selectedYear, selectedMonth, 0).toISOString());
          
          let fasilitas = emp.taxFacility;
          if (fasilitas === 'Surat Keterangan Bebas (SKB) Pemotongan PPh Pasal 21') fasilitas = 'Fasilitas Lainnya'; 
          if (fasilitas === 'Tanpa Fasilitas') fasilitas = 'Tanpa Fasilitas'; 

          return [
              index + 1,
              profile.nitku,
              emp.periodMonth,
              emp.periodYear,
              withholdingDate,
              tin,
              emp.name,
              emp.address,
              master?.position || '',
              master?.email || '',
              emp.taxObjectCode || '21-100-01',
              emp.status,
              Math.round(emp.grossIncome),
              fasilitas,
              '', // Tarif Fasilitas Lainnya
              emp.taxFacilityNumber || '',
              emp.isGrossUp ? 'Ya' : 'Tidak',
              '', // Referensi
              '', // Nomor Bukti Potong Diganti
              '', // Pengganti Ke-
              master?.passportNumber || '',
              master?.countryCode || (emp.isForeigner ? 'ZZ' : 'ID') // Fallback if no country code
          ];
      });

      downloadExcel([headers, ...data], 'PPh 21 Bulanan', `PPh21_Bulanan_${selectedYear}_${selectedMonth}.xlsx`);
      showNotification('Export Excel Bulanan Berhasil');
  };

  // --- 2. EXPORT NON-FINAL (Bp21Bulk) ---
  const getNonFinalDataFiltered = () => {
      return employees.filter(e => 
          e.calculationType === 'nonFinal' && 
          Number(e.periodYear) === Number(selectedYear) && 
          Number(e.periodMonth) === Number(selectedMonth)
      );
  };

  const handleExportNonFinalXML = () => {
      const filtered = getNonFinalDataFiltered();
      if (filtered.length === 0) {
          showNotification(`Tidak ada data PPh 21 Final/Tidak Final untuk ${selectedMonth}/${selectedYear}`, 'error');
          return;
      }

      const companyTin = (profile.companyNpwp || '').replace(/\D/g, '');

      const items = filtered.map(emp => {
          const master = masterEmployees.find(m => m.id === emp.masterEmployeeId);
          const tin = (master?.npwp || emp.npwp || '').replace(/\D/g, '');
          const idPlaceRecipient = '000000'; 
          let cert = 'N/A';
          let effectiveRate = 0;
          if (emp.grossIncome > 0) {
              effectiveRate = (emp.finalPPh21Monthly / emp.grossIncome) * 100;
          }
          let deemed = 100;
          if (emp.taxObjectCode === '21-100-07') deemed = 50; 

          const idPlace = (profile.idTku || (companyTin + '000000')).replace(/\D/g, '');
          const withholdingDate = formatDateForXML(emp.tanggalPemotongan || new Date(selectedYear, selectedMonth, 0).toISOString());

          return `
        <Bp21>
            <TaxPeriodMonth>${escapeXML(emp.periodMonth)}</TaxPeriodMonth>
            <TaxPeriodYear>${escapeXML(emp.periodYear)}</TaxPeriodYear>
            <CounterpartTin>${escapeXML(tin)}</CounterpartTin>
            <IDPlaceOfBusinessActivityOfIncomeRecipient>${idPlaceRecipient}</IDPlaceOfBusinessActivityOfIncomeRecipient>
            <StatusTaxExemption>${escapeXML(emp.status)}</StatusTaxExemption>
            <TaxCertificate>${escapeXML(cert)}</TaxCertificate>
            <TaxObjectCode>${escapeXML(emp.taxObjectCode)}</TaxObjectCode>
            <Gross>${Math.round(emp.grossIncome)}</Gross>
            <Deemed>${deemed}</Deemed>
            <Rate>${effectiveRate.toFixed(7)}</Rate>
            <Document>Bukti Potong</Document>
            <DocumentNumber>${escapeXML(emp.id.substring(0,8).toUpperCase())}</DocumentNumber>
            <DocumentDate>${withholdingDate}</DocumentDate>
            <IDPlaceOfBusinessActivity>${escapeXML(idPlace)}</IDPlaceOfBusinessActivity>
            <WithholdingDate>${withholdingDate}</WithholdingDate>
        </Bp21>`;
      }).join('');

      const xml = `<?xml version="1.0" encoding="utf-8"?>
<Bp21Bulk xsi:noNamespaceSchemaLocation="schema.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <TIN>${escapeXML(companyTin)}</TIN>
    <ListOfBp21>${items}
    </ListOfBp21>
</Bp21Bulk>`;

      downloadFile(xml, `PPh21_NonFinal_${selectedYear}_${selectedMonth}.xml`, 'application/xml');
      showNotification('Export XML Non-Final Berhasil');
  };

  const handleExportNonFinalExcel = () => {
      const filtered = getNonFinalDataFiltered();
      if (filtered.length === 0) {
          showNotification(`Tidak ada data PPh 21 Final/Tidak Final untuk ${selectedMonth}/${selectedYear}`, 'error');
          return;
      }

      const headers = [
          'No', 'NITKU Pemotong', 'Masa Pajak', 'Tahun Pajak', 'Tgl Pemotongan (dd/MM/yyyy)', 
          'NIK/NPWP16 (tanpa format/tanda baca)', 'Nama Penerima Penghasilan Sesuai NIK/NPWP16', 
          'Alamat Penerima Penghasilan Sesuai NIK/NPWP16', 'Email Penerima Penghasilan', 
          'Kode Objek Pajak', 'Kode PTKP', 'Penghasilan Bruto', 
          'Akumulasi Penghasilan Bruto Sebelumnya', 'Fasilitas', 'Tarif Fasilitas Lainnya', 
          'Nomor Fasilitas', 'Jenis Dokumen', 'Tanggal Dokumen (dd/MM/yyyy)', 'Nomor Dokumen', 
          'Menggunakan Gross Up? (Ya/Tidak)', 'Referensi', 'Nomor Bukti Potong Diganti', 'Pengganti Ke-', 'Nitku Penerima'
      ];

      const data = filtered.map((emp, index) => {
          const master = masterEmployees.find(m => m.id === emp.masterEmployeeId);
          const tin = (master?.npwp || emp.npwp || '').replace(/\D/g, '');
          const withholdingDate = formatDateForExcel(emp.tanggalPemotongan || new Date(selectedYear, selectedMonth, 0).toISOString());

          return [
              index + 1,
              profile.nitku,
              emp.periodMonth,
              emp.periodYear,
              withholdingDate,
              tin,
              emp.name,
              emp.address,
              master?.email || '',
              emp.taxObjectCode,
              emp.status,
              Math.round(emp.grossIncome),
              0, // Akumulasi Sebelumnya (Usually 0 unless specifically tracked)
              emp.taxFacility,
              '',
              emp.taxFacilityNumber || '',
              '', // Jenis Dokumen
              '', // Tgl Dokumen
              '', // No Dokumen
              emp.isGrossUp ? 'Ya' : 'Tidak',
              '',
              '',
              '',
              '000000' // Nitku Penerima Default
          ];
      });

      downloadExcel([headers, ...data], 'PPh 21 Final-TF', `PPh21_NonFinal_${selectedYear}_${selectedMonth}.xlsx`);
      showNotification('Export Excel Non-Final Berhasil');
  };

  // --- 3. EXPORT ANNUAL A1 (A1Bulk) ---
  const getAnnualDataFiltered = () => {
      // Annual is by Year only
      return employees.filter(e => 
          e.calculationType === 'annual' && 
          Number(e.periodYear) === Number(selectedYear)
      );
  };

  const handleExportAnnualXML = () => {
      const filtered = getAnnualDataFiltered();
      if (filtered.length === 0) {
          showNotification(`Tidak ada data PPh 21 Tahunan (A1) untuk Tahun ${selectedYear}`, 'error');
          return;
      }

      const companyTin = (profile.companyNpwp || '').replace(/\D/g, '');

      const items = filtered.map(emp => {
          const master = masterEmployees.find(m => m.id === emp.masterEmployeeId);
          const tin = (master?.npwp || emp.npwp || '').replace(/\D/g, '');
          const passport = master?.passportNumber || '';
          
          let statusWithholding = 'FullYear';
          if (emp.jenisPemotongan === 'Kurang dari setahun' || emp.jenisPemotongan === 'Disetahunkan') {
              statusWithholding = 'PartialYear';
          }

          const salary = Math.round(emp.baseSalary); 
          const taxAllowance = Math.round(emp.tunjanganPph);
          const otherBenefit = Math.round(emp.tunjanganJabatan + emp.tunjanganTelekomunikasi + emp.tunjanganMakan + emp.tunjanganTransportasi + emp.overtimePay);
          const honorarium = Math.round(emp.honorarium || 0);
          const insurance = Math.round(emp.insurancePremi || 0);
          const natura = Math.round(emp.facilityValue);
          const bonus = Math.round(emp.bonus);
          const deductions = Math.round(emp.totalDeductions); 
          const zakat = Math.round(emp.zakatDeduction || 0);
          const taxYearly = Math.round(emp.pph21Yearly);
          
          const idPlace = (profile.idTku || (companyTin + '000000')).replace(/\D/g, '');
          const withholdingDate = formatDateForXML(emp.tanggalPemotongan);

          return `
    <A1>
      <WorkForSecondEmployer>No</WorkForSecondEmployer>
      <TaxPeriodMonthStart>${emp.taxPeriodStart || 1}</TaxPeriodMonthStart>
      <TaxPeriodMonthEnd>${emp.taxPeriodEnd || 12}</TaxPeriodMonthEnd>
      <TaxPeriodYear>${escapeXML(emp.periodYear)}</TaxPeriodYear>
      <CounterpartOpt>${emp.isForeigner ? 'Foreign' : 'Resident'}</CounterpartOpt>
      <CounterpartPassport>${escapeXML(passport)}</CounterpartPassport>
      <CounterpartTin>${escapeXML(tin)}</CounterpartTin>
      <TaxExemptOpt>${escapeXML(emp.status)}</TaxExemptOpt>
      <StatusOfWithholding>${statusWithholding}</StatusOfWithholding>
      <CounterpartPosition>${escapeXML(master?.position || 'Pegawai')}</CounterpartPosition>
      <TaxObjectCode>${escapeXML(emp.taxObjectCode || '21-100-01')}</TaxObjectCode>
      <NumberOfMonths>${(emp.taxPeriodEnd || 12) - (emp.taxPeriodStart || 1) + 1}</NumberOfMonths>
      <SalaryPensionJhtTht>${salary}</SalaryPensionJhtTht>
      <GrossUpOpt>${emp.isGrossUp ? 'Yes' : 'No'}</GrossUpOpt>
      <IncomeTaxBenefit>${taxAllowance}</IncomeTaxBenefit>
      <OtherBenefit>${otherBenefit}</OtherBenefit>
      <Honorarium>${honorarium}</Honorarium>
      <InsurancePaidByEmployer>${insurance}</InsurancePaidByEmployer>
      <Natura>${natura}</Natura>
      <TantiemBonusThr>${bonus}</TantiemBonusThr>
      <PensionContributionJhtThtFee>${deductions}</PensionContributionJhtThtFee>
      <Zakat>${zakat}</Zakat>
      <PrevWhTaxSlip>${escapeXML(emp.previousTaxReceiptNumber || '')}</PrevWhTaxSlip>
      <TaxCertificate>N/A</TaxCertificate>
      <Article21IncomeTax>${taxYearly}</Article21IncomeTax>
      <IDPlaceOfBusinessActivity>${escapeXML(idPlace)}</IDPlaceOfBusinessActivity>
      <WithholdingDate>${escapeXML(withholdingDate)}</WithholdingDate>
    </A1>`;
      }).join('');

      const xml = `<?xml version="1.0" encoding="utf-8"?>
<!-- Created with VerozTax -->
<A1Bulk xsi:noNamespaceSchemaLocation="schema.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <TIN>${escapeXML(companyTin)}</TIN>
  <ListOfA1>${items}
  </ListOfA1>
</A1Bulk>`;

      downloadFile(xml, `PPh21_TahunanA1_${selectedYear}.xml`, 'application/xml');
      showNotification('Export XML Tahunan A1 Berhasil');
  };

  const handleExportAnnualExcel = () => {
      const filtered = getAnnualDataFiltered();
      if (filtered.length === 0) {
          showNotification(`Tidak ada data PPh 21 Tahunan (A1) untuk Tahun ${selectedYear}`, 'error');
          return;
      }

      const headers = [
          'No', 'NITKU Pemotong', 'Metode Pemotongan', 'Masa Awal Pajak', 'Masa Akhir Pajak', 'Tahun Pajak', 
          'Tgl Pemotongan (dd/MM/yyyy)', 'Kode Objek Pajak', 'Pegawai Asing ? (Y/N)', 
          'Kode Negara (Jika Pegawai Asing)', 'Passport (Jika Pegawai Asing)', 
          'NIK/NPWP16 (tanpa format/tanda baca)', 'Nama Penerima Penghasilan Sesuai NIK/NPWP16', 
          'Alamat Penerima Penghasilan Sesuai NIK/NPWP16', 'Jenis Kelamin Penerima Penghasilan (F/M)', 
          'Jabatan Penerima Penghasilan', 'Email', 'Kode PTKP', 'Gaji Atau Uang Pensiun Berkala', 
          'Menggunakan Gross Up? (Y/N)', 'Tunjangan PPh', 'Tunjangan Lainnya, Uang Lembur Dan Sebagainya', 
          'Honorarium Dan Imbalan Lain Sejenisnya', 'Premi Asuransi Yang Dibayarkan Pemberi Kerja', 
          'Penerimaan Dalam Bentuk Natura Dan Kenikmatan Lainnya Yang Dikenakan Pemotongan PPh Pasal 21', 
          'Tantiem, Bonus, Gratifikasi, Jasa Produksi Dan Thr', 
          'Iuran Pensiun atau THT/JHT', 'Zakat/Sumbangan Keagamaan Wajib', 
          'Penghasilan Neto Masa Sebelumnya', 'PPh Pasal 21 yang telah dipotong masa sebelumnya'
      ];

      const data = filtered.map((emp, index) => {
          const master = masterEmployees.find(m => m.id === emp.masterEmployeeId);
          const tin = (master?.npwp || emp.npwp || '').replace(/\D/g, '');
          const withholdingDate = formatDateForExcel(emp.tanggalPemotongan);
          const otherBenefit = Math.round(emp.tunjanganJabatan + emp.tunjanganTelekomunikasi + emp.tunjanganMakan + emp.tunjanganTransportasi + emp.overtimePay);
          const pensionInput = Math.round(emp.pensionDeduction + emp.jpDeduction);

          return [
              index + 1,
              profile.nitku,
              emp.jenisPemotongan,
              emp.taxPeriodStart || 1,
              emp.taxPeriodEnd || 12,
              emp.periodYear,
              withholdingDate,
              emp.taxObjectCode,
              emp.isForeigner ? 'Y' : 'N',
              master?.countryCode || '',
              master?.passportNumber || '',
              tin,
              emp.name,
              emp.address,
              master?.gender === 'Perempuan' ? 'F' : 'M',
              master?.position || 'Pegawai',
              master?.email || '',
              emp.status,
              Math.round(emp.baseSalary),
              emp.isGrossUp ? 'Y' : 'N',
              Math.round(emp.tunjanganPph),
              otherBenefit,
              Math.round(emp.honorarium || 0),
              Math.round(emp.insurancePremi || 0),
              Math.round(emp.facilityValue),
              Math.round(emp.bonus),
              pensionInput,
              Math.round(emp.zakatDeduction || 0),
              Math.round(emp.netIncomePrevious || 0),
              Math.round(emp.pph21PaidPreviously || 0)
          ];
      });

      downloadExcel([headers, ...data], 'PPh 21 Tahunan A1', `PPh21_TahunanA1_${selectedYear}.xlsx`);
      showNotification('Export Excel Tahunan A1 Berhasil');
  };

  // FIX: Force numeric conversion to deduplicate years correctly
  const availableYears = React.useMemo(() => {
      const dataYears = employees.map(e => Number(e.periodYear));
      const dynamicYears = getAvailableTaxYears();
      const allYears = Array.from(new Set([...dataYears, ...dynamicYears])).sort((a,b) => b - a);
      return allYears;
  }, [employees]);

  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
            <DocumentDownloadIcon />
            <div>
                <h1 className="text-2xl font-bold text-gray-100">Laporan & Export CoreTax</h1>
                <p className="text-gray-400 text-sm">Download file XML atau Excel siap upload untuk sistem CoreTax DJP.</p>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg border border-gray-700 mb-6">
            <TabButton active={activeTab === 'monthly'} onClick={() => setActiveTab('monthly')} label="PPh 21 Bulanan" />
            <TabButton active={activeTab === 'nonFinal'} onClick={() => setActiveTab('nonFinal')} label="PPh 21 Final/TF" />
            <TabButton active={activeTab === 'annual'} onClick={() => setActiveTab('annual')} label="PPh 21 Tahunan A1" />
        </div>

        <div className="bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Tahun Pajak</label>
                    <select 
                        value={selectedYear} 
                        onChange={e => setSelectedYear(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                </div>
                {activeTab !== 'annual' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Masa Pajak (Bulan)</label>
                        <select 
                            value={selectedMonth} 
                            onChange={e => setSelectedMonth(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* Action Buttons based on Tab */}
            <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-700/50">
                {activeTab === 'monthly' && (
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-white mb-2">Export PPh 21 Bulanan</h3>
                        <p className="text-gray-400 text-sm mb-6">Unduh data perhitungan pajak masa dalam format XML atau Excel (skema <code>MmPayrollBulk</code>).</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button onClick={handleExportMonthlyXML} className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2">
                                <CodeIcon /> Download XML CoreTax
                            </button>
                            <button onClick={handleExportMonthlyExcel} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2">
                                <ExcelIcon /> Download Excel (.xlsx)
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'nonFinal' && (
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-white mb-2">Export PPh 21 Final / Tidak Final</h3>
                        <p className="text-gray-400 text-sm mb-6">Unduh data pemotongan pajak Bukan Pegawai dalam format XML atau Excel (skema <code>Bp21Bulk</code>).</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button onClick={handleExportNonFinalXML} className="px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2">
                                <CodeIcon /> Download XML CoreTax
                            </button>
                            <button onClick={handleExportNonFinalExcel} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2">
                                <ExcelIcon /> Download Excel (.xlsx)
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'annual' && (
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-white mb-2">Export PPh 21 Tahunan (1721-A1)</h3>
                        <p className="text-gray-400 text-sm mb-6">Unduh Bukti Potong 1721-A1 untuk pelaporan tahunan dalam format XML atau Excel (skema <code>A1Bulk</code>).</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button onClick={handleExportAnnualXML} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2">
                                <CodeIcon /> Download XML CoreTax
                            </button>
                            <button onClick={handleExportAnnualExcel} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2">
                                <ExcelIcon /> Download Excel (.xlsx)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
            active 
            ? 'bg-gray-700 text-white shadow-md' 
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
        }`}
    >
        {label}
    </button>
);

const DocumentDownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const CodeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
const ExcelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

export default Reports;
