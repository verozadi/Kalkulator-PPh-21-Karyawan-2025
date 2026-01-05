import { MasterEmployee } from '../types';
import { db } from './firebase';
import { v4 as uuidv4 } from 'uuid';

export const saveMasterEmployee = async (userId: string, employee: MasterEmployee): Promise<void> => {
    try {
        if (!employee.id) employee.id = uuidv4();
        await db.collection('users').doc(userId).collection('master_employees').doc(employee.id).set(employee);
    } catch (error) {
        console.error("Error saving master employee:", error);
        throw error;
    }
};

export const deleteMasterEmployee = async (userId: string, id: string): Promise<void> => {
    try {
        await db.collection('users').doc(userId).collection('master_employees').doc(id).delete();
    } catch (error) {
        console.error("Error deleting master employee:", error);
        throw error;
    }
};

export const importMasterEmployees = async (userId: string, newEmployees: Omit<MasterEmployee, 'id'>[]): Promise<void> => {
    const batch = db.batch();
    
    newEmployees.forEach(e => {
        const id = uuidv4();
        const ref = db.collection('users').doc(userId).collection('master_employees').doc(id);
        batch.set(ref, { ...e, id });
    });

    try {
        await batch.commit();
    } catch (error) {
        console.error("Error importing master employees:", error);
        throw error;
    }
};

export const getMasterEmployees = (userId: string): MasterEmployee[] => {
    return []; // Handled by App.tsx listener
};
