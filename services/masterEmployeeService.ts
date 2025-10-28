import { MasterEmployee } from '../types';
import { initialMasterEmployees } from './mockData';
import { v4 as uuidv4 } from 'uuid';

const getStorageKey = (userId: string) => `pph21_master_employees_${userId}`;

export const initializeMasterEmployeesForUser = (userId: string): void => {
    const storageKey = getStorageKey(userId);
    if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, JSON.stringify(initialMasterEmployees));
    }
};

const getStoredMasterEmployees = (userId: string): MasterEmployee[] => {
    const storageKey = getStorageKey(userId);
    try {
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.error("Failed to parse master employees from localStorage", error);
    }
    localStorage.setItem(storageKey, JSON.stringify(initialMasterEmployees));
    return initialMasterEmployees;
};

export const getMasterEmployees = (userId: string): MasterEmployee[] => {
    const masterEmployees = getStoredMasterEmployees(userId);
    return [...masterEmployees].sort((a, b) => a.fullName.localeCompare(b.fullName));
};

export const getMasterEmployeeById = (userId: string, id: string): MasterEmployee | undefined => {
    const masterEmployees = getStoredMasterEmployees(userId);
    return masterEmployees.find(e => e.id === id);
};

export const saveMasterEmployee = (userId: string, employee: MasterEmployee): void => {
    let masterEmployees = getStoredMasterEmployees(userId);
    if (!employee.id) {
        employee.id = uuidv4();
    }
    const index = masterEmployees.findIndex(e => e.id === employee.id);
    if (index > -1) {
        masterEmployees[index] = employee;
    } else {
        masterEmployees.push(employee);
    }
    localStorage.setItem(getStorageKey(userId), JSON.stringify(masterEmployees));
};

export const deleteMasterEmployee = (userId: string, id: string): void => {
    let masterEmployees = getStoredMasterEmployees(userId);
    masterEmployees = masterEmployees.filter(e => e.id !== id);
    localStorage.setItem(getStorageKey(userId), JSON.stringify(masterEmployees));
};