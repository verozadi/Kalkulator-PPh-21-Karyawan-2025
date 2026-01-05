
export type Page = 'dashboard' | 'employeeInput' | 'pph21Monthly' | 'pph21NonFinal' | 'pph21Annual' | 'employeeList' | 'employeeListMonthly' | 'employeeListNonFinal' | 'employeeListAnnual' | 'taxRules' | 'reports' | 'overtime' | 'employeeMasterList' | 'settings' | 'login' | 'register' | 'forgotPassword' | 'landing';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

export enum MaritalStatus {
  TK0 = 'TK/0',
  TK1 = 'TK/1',
  TK2 = 'TK/2',
  TK3 = 'TK/3',
  K0 = 'K/0',
  K1 = 'K/1',
  K2 = 'K/2',
  K3 = 'K/3',
}

export interface MasterEmployee {
  id: string;
  employeeId: string;
  fullName: string;
  gender: 'Laki-Laki' | 'Perempuan';
  position: string;
  email: string;
  phone: string;
  hireDate: string;
  ktp: string;
  address: string;
  isPph21Applicable: boolean;
  npwp: string;
  employeeStatus: 'Pegawai Tetap' | 'Bukan Pegawai';
  isForeigner: boolean;
  countryCode?: string; // New field for Country Code
  passportNumber: string;
  ptkpStatus: MaritalStatus;
  baseSalary: number; // Moved here for overtime calculation base
  positionAllowance: number; // New: Tunjangan Jabatan for overtime base & auto-fill
  isActive: boolean;
}

export interface OvertimeRecord {
  id: string; // Unique identifier for the overtime entry
  masterEmployeeId: string;
  year: number;
  month: number;
  dayType: 'workday' | 'holiday';
  workSystem: '5-day' | '6-day'; // This is a period-wide setting but stored per record for history
  overtimeHours: number;
  overtimeMinutes: number;
  totalPay: number;
  // New Fields
  overtimeDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  activity: string;
  isManualPay?: boolean;
  includePositionAllowance?: boolean; // Toggle to calculate from (Base + PositionAllowance)
}

export interface CustomAllowance {
  id: string;
  name: string;
  value: number;
}

export type CalculationType = 'monthly' | 'nonFinal' | 'annual';

// Represents a single monthly PPh 21 calculation record
export interface EmployeeData {
  id: string; // Transaction ID
  masterEmployeeId: string; // Link to the master employee
  calculationType: CalculationType;
  
  // Fields from Master that might be snapshot at time of calculation
  name: string;
  npwp: string; // Will hold NPWP or NIK
  address: string;
  status: MaritalStatus; // This is the PTKP Code
  employeeStatus: 'Pegawai Tetap' | 'Bukan Pegawai';
  isForeigner: boolean;
  gender?: 'Laki-Laki' | 'Perempuan'; // Snapshot for Annual Form
  position?: string; // Snapshot for Annual Form
  
  // Transactional Fields for the specific period
  periodYear: number;
  periodMonth: number;

  // Income Components
  baseSalary: number; // In Annual Mode: Gaji/Pensiun atau THT/JHT Setahun
  tunjanganPph: number;
  tunjanganJabatan: number; // In Annual Mode: Used for "Tunjangan Lainnya" aggregation if needed
  tunjanganTelekomunikasi: number;
  tunjanganMakan: number;
  tunjanganTransportasi: number;
  overtimePay: number; // In Annual Mode: Tunjangan Lainnya / Lembur / Uang Makan (Total)
  bonus: number; // Bonus / Tantiem / THR
  facilityValue: number; // Natura
  honorarium?: number; // Honorarium & Imbalan Sejenis (Annual)
  insurancePremi?: number; // Premi Asuransi Dibayar Perusahaan (Annual)
  
  customFixedAllowances: CustomAllowance[];
  customVariableAllowances: CustomAllowance[];
  
  // Deduction Components
  loan: number;
  otherDeductions: number;
  customDeductions: CustomAllowance[];
  bpjsDeduction: number;
  pensionDeduction: number; // JHT
  jpDeduction: number; // JP (Jaminan Pensiun)
  zakatDeduction?: number; // Zakat / Sumbangan Wajib
  
  // Other Configs
  isGrossUp: boolean;
  taxFacility: 'Fasilitas Lainnya' | 'PPh Ditanggung Pemerintah (DTP)' | 'Surat Keterangan Bebas (SKB) Pemotongan PPh Pasal 21' | 'Tanpa Fasilitas';
  taxFacilityNumber?: string; // New field for SKB/DTP/Facility Number
  taxObjectName: string;
  taxObjectCode: string;
  signerIdentity: 'NPWP' | 'NIK';

  // Fields for Annual A1 Calculation
  grossIncomeAccumulated?: number; // Total Bruto Setahun (Calculated)
  taxPaidAccumulated?: number; // Deprecated in favor of explicit pph21PaidPreviously
  pph21PaidPreviously?: number; // PPh Pasal 21 Dipotong dari Bukti Pemotongan Sebelumnya / Jan-Nov
  netIncomeAccumulated?: number; // Deprecated
  netIncomePrevious?: number; // 14. Penghasilan Neto dari Pemotongan Sebelumnya
  
  // New Fields for Annual A1 Period Logic
  periodType?: 'fullYear' | 'annualized' | 'lessThanYear';
  jenisPemotongan?: 'Setahun penuh' | 'Disetahunkan' | 'Kurang dari setahun';
  tanggalPemotongan?: string; // YYYY-MM-DD
  taxPeriodStart?: number; // 1-12
  taxPeriodEnd?: number; // 1-12
  previousTaxReceiptNumber?: string; // Nomor Bupot Sebelumnya

  // Manual Override fields for "Fasilitas Lainnya" & DTP
  manualNetIncomeCalc?: number; // 15
  manualPph21Pkp?: number; // 18
  manualPph21KurangBayar?: number; // 23
  manualPph21Dtp?: number; // 22. PPh 21 DTP Manual Override

  // Deprecated fields, kept for potential data migration but not used in new forms
  dependents?: number;
  fixedAllowance?: number;
  variableAllowance?: number;
  overtimeHours?: number;
  overtimeRate?: number;
  isDTPApplicable?: boolean;
  identityType?: 'NPWP' | 'NIK';
  hireDate?: string;
}

export interface TaxCalculationResult {
    grossIncome: number;
    totalDeductions: number;
    netIncomeForTax: number; // Penghasilan Neto
    ptkp: number;
    pkpYearly: number; // Penghasilan Kena Pajak Setahun/Disetahunkan
    pph21Yearly: number; // PPh 21 atas PKP Setahun
    pph21Monthly: number; // In Annual: PPh Terutang
    finalPPh21Monthly: number; // In Annual: Kurang/Lebih Bayar
    dtpIncentive: number;
    paymentStatus: 'Paid' | 'Unpaid';
    // For Annual
    taxUnderOverPayment?: number; // Kurang/Lebih Bayar
    pph21Terutang?: number; // 19. PPh Terutang
}


export interface Employee extends EmployeeData, TaxCalculationResult {}

export interface Profile {
  logoUrl: string;
  appName: string;
  companyName: string;
  companyAddress?: string;
  companyNpwp: string;
  contactName: string;
  contactPosition?: string; // Added Job Title for PIC
  contactNpwp: string;
  contactNik: string;
  nitku: string;
  idTku: string;
}
