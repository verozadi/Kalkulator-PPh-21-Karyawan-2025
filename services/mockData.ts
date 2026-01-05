
import { Employee, MaritalStatus, EmployeeData, MasterEmployee, OvertimeRecord } from '../types';
import { calculatePPh21 } from './taxCalculator';
import { v4 as uuidv4 } from 'uuid';

export const initialMasterEmployees: MasterEmployee[] = [
    {
        id: 'master-001',
        employeeId: 'K-001',
        fullName: 'St Syamsiah',
        gender: 'Perempuan',
        position: 'Komisaris',
        email: '',
        phone: '082188288884',
        hireDate: '2005-09-25',
        ktp: '7371026702680004',
        address: 'Dg Tata Tmn Artalia Blk A1/ No 4/5 RT 002 RW 002, Kel. Parang Tambung, Kec. Tamalate',
        isPph21Applicable: true,
        npwp: '7371026702680004',
        employeeStatus: 'Pegawai Tetap',
        isForeigner: false,
        countryCode: '',
        ptkpStatus: MaritalStatus.K3,
        baseSalary: 15000000,
        positionAllowance: 5000000,
        passportNumber: '',
        isActive: true,
    },
    {
        id: 'master-002',
        employeeId: 'K-002',
        fullName: 'Aan Alfian Syahriansah',
        gender: 'Laki-Laki',
        position: 'Direktur Utama',
        email: 'aan.alfian@example.com',
        phone: '081234567891',
        hireDate: '2021-03-20',
        ktp: '7371102307920006',
        address: 'Dg Tata I Blk IV Perum. Graha Sanjaya No. A.5 RT 002 RW 002, Kel. Parang Tambung, Kec. Tamalate',
        isPph21Applicable: true,
        npwp: '7371102307920006',
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
