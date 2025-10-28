export type Page = 'dashboard' | 'employeeInput' | 'employeeList' | 'taxRules' | 'reports' | 'overtime' | 'employeeMasterList' | 'settings';

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
  passportNumber: string;
  ptkpStatus: MaritalStatus;
  baseSalary: number; // Moved here for overtime calculation base
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
}


// Represents a single monthly PPh 21 calculation record
export interface EmployeeData {
  id: string; // Transaction ID
  masterEmployeeId: string; // Link to the master employee
  
  // Fields from Master that might be snapshot at time of calculation
  name: string;
  npwp: string; // Will hold NPWP or NIK
  address: string;
  status: MaritalStatus; // This is the PTKP Code
  employeeStatus: 'Pegawai Tetap' | 'Bukan Pegawai';
  isForeigner: boolean;
  
  // Transactional Fields for the specific period
  periodYear: number;
  periodMonth: number;

  // Income Components
  baseSalary: number;
  tunjanganPph: number;
  tunjanganJabatan: number;
  tunjanganTelekomunikasi: number;
  tunjanganMakan: number;
  tunjanganTransportasi: number;
  overtimePay: number; // Replaces overtimeHours and overtimeRate
  bonus: number;
  facilityValue: number; // Mapped to Natura/Kenikmatan
  
  // Deduction Components
  loan: number;
  otherDeductions: number;
  bpjsDeduction: number;
  pensionDeduction: number;
  
  // Other Configs
  isGrossUp: boolean;
  taxFacility: 'Fasilitas Lainnya' | 'PPh Ditanggung Pemerintah (DTP)' | 'Tanpa Fasilitas';
  taxObjectName: 'Penghasilan yang Diterima atau Diperoleh Pegawai Tetap' | 'Penghasilan yang Diterima atau Diperoleh Pensiunan Secara Teratur' | 'Penghasilan yang Diterima atau Diperoleh Pegawai Tetap yang Menerima fasilitas di Daerah Tertentu';
  taxObjectCode: '21-100-01' | '21-100-02' | '21-100-03' | '';
  signerIdentity: 'NPWP' | 'NIK';
  
  // Deprecated fields, kept for potential data migration but not used in new forms
  dependents?: number;
  fixedAllowance?: number;
  variableAllowance?: number;
  overtimeHours?: number;
  overtimeRate?: number;
  zakatDeduction?: number;
  isDTPApplicable?: boolean;
  identityType?: 'NPWP' | 'NIK';
  position?: string;
  hireDate?: string;
}

export interface TaxCalculationResult {
    grossIncome: number;
    totalDeductions: number;
    netIncomeForTax: number;
    ptkp: number;
    pkpYearly: number;
    pph21Yearly: number;
    pph21Monthly: number;
    finalPPh21Monthly: number;
    dtpIncentive: number;
    paymentStatus: 'Paid' | 'Unpaid';
}


export interface Employee extends EmployeeData, TaxCalculationResult {}

export interface Profile {
  logoUrl: string;
  appName: string;
  companyName: string;
  companyNpwp: string;
  contactName: string;
  contactNpwp: string;
  contactNik: string;
  nitku: string;
  idTku: string;
}