import { MasterEmployee } from '../types';
import { initialMasterEmployees } from './mockData';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'pph21_master_employees';

const getStoredMasterEmployees = (): MasterEmployee[] => {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.error("Failed to parse master employees from localStorage", error);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMasterEmployees));
    return initialMasterEmployees;
};

let masterEmployees: MasterEmployee[] = getStoredMasterEmployees();

export const getMasterEmployees = (): MasterEmployee[] => {
    masterEmployees = getStoredMasterEmployees();
    return [...masterEmployees].sort((a, b) => a.fullName.localeCompare(b.fullName));
};

export const getMasterEmployeeById = (id: string): MasterEmployee | undefined => {
    return masterEmployees.find(e => e.id === id);
};

export const saveMasterEmployee = (employee: MasterEmployee): void => {
    if (!employee.id) {
        employee.id = uuidv4();
    }
    const index = masterEmployees.findIndex(e => e.id === employee.id);
    if (index > -1) {
        masterEmployees[index] = employee;
    } else {
        masterEmployees.push(employee);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(masterEmployees));
};

export const deleteMasterEmployee = (id: string): void => {
    masterEmployees = masterEmployees.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(masterEmployees));
};
