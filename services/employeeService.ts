import { Employee } from '../types';
import { initialEmployeeData } from './mockData';

const getStorageKey = (userId: string) => `pph21_employees_${userId}`;

export const initializeEmployeesForUser = (userId: string): void => {
    const storageKey = getStorageKey(userId);
    if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, JSON.stringify(initialEmployeeData));
    }
};

const getStoredEmployees = (userId: string): Employee[] => {
    const storageKey = getStorageKey(userId);
    try {
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.error("Failed to parse employees from localStorage", error);
    }
    localStorage.setItem(storageKey, JSON.stringify(initialEmployeeData));
    return initialEmployeeData;
};

export const getEmployees = (userId: string): Employee[] => {
    const employees = getStoredEmployees(userId);
    return [...employees].sort((a, b) => a.name.localeCompare(b.name));
};

export const getEmployeeById = (userId: string, id: string): Employee | undefined => {
    const employees = getStoredEmployees(userId);
    return employees.find(e => e.id === id);
};

export const saveEmployee = (userId: string, employee: Employee): void => {
    let employees = getStoredEmployees(userId);
    const index = employees.findIndex(e => e.id === employee.id);
    if (index > -1) {
        employees[index] = employee;
    } else {
        employees.push(employee);
    }
    localStorage.setItem(getStorageKey(userId), JSON.stringify(employees));
};

export const deleteEmployee = (userId: string, id: string): void => {
    let employees = getStoredEmployees(userId);
    employees = employees.filter(e => e.id !== id);
    localStorage.setItem(getStorageKey(userId), JSON.stringify(employees));
};