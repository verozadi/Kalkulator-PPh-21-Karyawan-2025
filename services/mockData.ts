import { Employee, MaritalStatus, EmployeeData, MasterEmployee, OvertimeRecord } from '../types';
import { calculatePPh21 } from './taxCalculator';
import { v4 as uuidv4 } from 'uuid';

export const initialMasterEmployees: MasterEmployee[] = [
    {
        id: 'master-001',
        employeeId: 'K001',
        fullName: 'St Syamsiah',
        position: 'Manager',
        email: 'syamsiah.st@example.com',
        phone: '081234560001',
        hireDate: '2019-05-10',
        ktp: '7371026702680004',
        address: 'Jl. Perintis Kemerdekaan No. 10, Makassar',
        isPph21Applicable: true,
        npwp: '91.888.777.6-543.000',
        employeeStatus: 'Pegawai Tetap',
        isForeigner: false,
        ptkpStatus: MaritalStatus.K3,
        baseSalary: 15000000,
        passportNumber: '',
    },
    {
        id: 'master-002',
        employeeId: 'K002',
        fullName: 'Aan Alfian Syahriansah',
        position: 'Supervisor',
        email: 'aan.alfian@example.com',
        phone: '081234560002',
        hireDate: '2021-02-20',
        ktp: '7371102307920006',
        address: 'Jl. Sultan Alauddin No. 20, Makassar',
        isPph21Applicable: true,
        npwp: '92.777.666.5-543.001',
        employeeStatus: 'Pegawai Tetap',
        isForeigner: false,
        ptkpStatus: MaritalStatus.K3,
        baseSalary: 10000000,
        passportNumber: '',
    }
];

export const initialOvertimeRecords: OvertimeRecord[] = [];

// This now represents PPh 21 calculation records, not master data.
const rawEmployeeData: Omit<EmployeeData, 'id'>[] = [
  {
    masterEmployeeId: 'master-001',
    name: 'St Syamsiah',
    npwp: '91.888.777.6-543.000',
    address: 'Jl. Perintis Kemerdekaan No. 10, Makassar',
    status: MaritalStatus.K3,
    employeeStatus: 'Pegawai Tetap',
    isForeigner: false,
    periodYear: 2025,
    periodMonth: 1,
    baseSalary: 15000000,
    overtimePay: 0,
    bonus: 2000000,
    loan: 0,
    otherDeductions: 0,
    bpjsDeduction: 150000,
    pensionDeduction: 300000,
    facilityValue: 0,
    isGrossUp: false,
    tunjanganPph: 0,
    tunjanganJabatan: 5000000,
    tunjanganTelekomunikasi: 300000,
    tunjanganMakan: 500000,
    tunjanganTransportasi: 500000,
    taxFacility: 'Tanpa Fasilitas',
    taxObjectName: 'Penghasilan yang Diterima atau Diperoleh Pegawai Tetap',
    taxObjectCode: '21-100-01',
    signerIdentity: 'NPWP',
  },
];

export const initialEmployeeData: Employee[] = rawEmployeeData.map(data => {
    const fullData = { ...data, id: uuidv4() };
    const taxData = calculatePPh21(fullData);
    return {
        ...fullData,
        ...taxData
    };
});