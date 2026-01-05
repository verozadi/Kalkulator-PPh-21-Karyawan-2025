import { Employee, EmployeeData, TaxCalculationResult } from '../types';
import { calculatePPh21 } from './taxCalculator';
import { db } from './firebase';
import { v4 as uuidv4 } from 'uuid';

// In Cloud Sync architecture, "getEmployees" is handled by onSnapshot in App.tsx.
// These services now focus on WRITING to Firestore.

export const saveEmployee = async (userId: string, employee: Employee): Promise<void> => {
    try {
        await db.collection('users').doc(userId).collection('employees').doc(employee.id).set(employee);
    } catch (error) {
        console.error("Error saving employee to Firestore:", error);
        throw error;
    }
};

export const deleteEmployee = async (userId: string, id: string): Promise<void> => {
    try {
        await db.collection('users').doc(userId).collection('employees').doc(id).delete();
    } catch (error) {
        console.error("Error deleting employee:", error);
        throw error;
    }
};

export const importEmployees = async (userId: string, employeesToImport: Omit<EmployeeData, 'id'>[]): Promise<void> => {
    const batch = db.batch();
    
    employeesToImport.forEach(data => {
        const id = uuidv4();
        const fullData: EmployeeData = { ...data, id };
        const taxData: TaxCalculationResult = calculatePPh21(fullData);
        const employee: Employee = { ...fullData, ...taxData };
        
        const empRef = db.collection('users').doc(userId).collection('employees').doc(id);
        batch.set(empRef, employee);
    });

    try {
        await batch.commit();
    } catch (error) {
        console.error("Error batch importing employees:", error);
        throw error;
    }
};

// Fallback for types if needed, though App.tsx handles reading
export const getEmployees = (userId: string): Employee[] => {
    return []; 
};
