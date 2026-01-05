
import { Employee, MaritalStatus, EmployeeData, MasterEmployee, OvertimeRecord } from '../types';
import { calculatePPh21 } from './taxCalculator';
import { v4 as uuidv4 } from 'uuid';

export const initialMasterEmployees: MasterEmployee[] = [
    {
        id: 'master-002',
        employeeId: 'K002',
        fullName: 'Aan Alfian Syahriansah',
        gender: 'Laki-Laki',
        position: 'Direktur Utama',
        email: 'aan.alfian@example.com',
        phone: '081234567891',
        hireDate: '2021-03-20',
        ktp: '7371102307920006',
        address: 'Dg Tata I Blk IV Perum. Graha Sanjaya No. A.5 RT 002 RW 002, Kel. Parang Tambung, Kec. Tamalate',
        isPph21Applicable: true,
        npwp: '92.777.666.5-543.001',
        employeeStatus: 'Pegawai Tetap',
        isForeigner: false,
        countryCode: '',
        ptkpStatus: MaritalStatus.K3,
        baseSalary: 10000000,
        positionAllowance: 3000000,
        passportNumber: '',
        isActive: true,
    },
];

export const initialOvertimeRecords: OvertimeRecord[] = [];

// This now represents PPh 21 calculation records, not master data.
const rawEmployeeData: Omit<EmployeeData, 'id'>[] = [];

export const initialEmployeeData: Employee[] = rawEmployeeData.map(data => {
    const fullData = { ...data, id: uuidv4() };
    const taxData = calculatePPh21(fullData);
    return {
        ...fullData,
        ...taxData
    };
});
