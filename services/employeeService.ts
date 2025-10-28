
import { Employee } from '../types';
import { initialEmployeeData } from './mockData';

const STORAGE_KEY = 'pph21_employees';

const getStoredEmployees = (): Employee[] => {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.error("Failed to parse employees from localStorage", error);
    }
    // If nothing in storage, initialize with mock data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialEmployeeData));
    return initialEmployeeData;
};

let employees: Employee[] = getStoredEmployees();

export const getEmployees = (): Employee[] => {
    employees = getStoredEmployees();
    return [...employees].sort((a, b) => a.name.localeCompare(b.name));
};

export const getEmployeeById = (id: string): Employee | undefined => {
    return employees.find(e => e.id === id);
};

export const saveEmployee = (employee: Employee): void => {
    const index = employees.findIndex(e => e.id === employee.id);
    if (index > -1) {
        employees[index] = employee;
    } else {
        employees.push(employee);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
};

export const deleteEmployee = (id: string): void => {
    employees = employees.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
};
