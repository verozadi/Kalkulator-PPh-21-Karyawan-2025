import { Employee, MaritalStatus, EmployeeData, MasterEmployee, OvertimeRecord } from '../types';
import { calculatePPh21 } from './taxCalculator';
import { v4 as uuidv4 } from 'uuid';

export const initialMasterEmployees: MasterEmployee[] = [
    {
        id: 'master-001',
        employeeId: 'K001',
        fullName: 'St Syamsiah',
        position: 'Komisaris',
        email: '',
        phone: '082188288884',
        hireDate: '2005-09-28',
        ktp: '7371026702680004',
        address: 'Dg. Tata Tmn Artalia Blk.A1',
        isPph21Applicable: true,
        npwp: '7371026702680004',
        employeeStatus: 'Pegawai Tetap',
        isForeigner: false,
        ptkpStatus: MaritalStatus.K3,
        baseSalary: 15000000,
        passportNumber: '',
        isActive: true,
    },
    {
        id: 'master-002',
        employeeId: 'K002',
        fullName: 'Aan Alfian Syahriansah',
        position: 'Supervisor',
        email: 'aan.alfian@example.com',
        phone: '081234567891',
        hireDate: '2021-03-20',
        ktp: '7371102307920006',
        address: 'Jl. Sultan Alauddin No. 20, Makassar',
        isPph21Applicable: true,
        npwp: '92.777.666.5-543.001',
        employeeStatus: 'Pegawai Tetap',
        isForeigner: false,
        ptkpStatus: MaritalStatus.TK2,
        baseSalary: 10000000,
        passportNumber: '',
        isActive: true,
    },
];

export const initialOvertimeRecords: OvertimeRecord[] = [];

// This now represents PPh 21 calculation records, not master data.
const rawEmployeeData: Omit<EmployeeData, 'id'>[] = [
    {
        masterEmployeeId: 'master-001',
        name: 'St Syamsiah',
        npwp: '7371026702680004',
        address: 'Dg. Tata Tmn Artalia Blk.A1',
        status: MaritalStatus.K3,
        employeeStatus: 'Pegawai Tetap',
        isForeigner: false,
        periodYear: new Date().getFullYear(),
        periodMonth: new Date().getMonth() + 1,
        baseSalary: 15000000,
        tunjanganPph: 0,
        tunjanganJabatan: 0,
        tunjanganTelekomunikasi: 0,
        tunjanganMakan: 0,
        tunjanganTransportasi: 0,
        overtimePay: 0,
        bonus: 0,
        facilityValue: 0,
        loan: 0,
        otherDeductions: 0,
        bpjsDeduction: 0,
        pensionDeduction: 0,
        isGrossUp: false,
        taxFacility: 'Tanpa Fasilitas',
        taxObjectName: 'Penghasilan yang Diterima atau Diperoleh Pegawai Tetap',
        taxObjectCode: '21-100-01',
        signerIdentity: 'NPWP',
    }
];

export const initialEmployeeData: Employee[] = rawEmployeeData.map(data => {
    const fullData = { ...data, id: uuidv4() };
    const taxData = calculatePPh21(fullData);
    return {
        ...fullData,
        ...taxData
    };
});