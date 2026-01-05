
import { MasterEmployee } from '../types';
import { db } from './firebase';
import { doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export const saveMasterEmployee = async (userId: string, employee: MasterEmployee): Promise<void> => {
    try {
        if (!employee.id) employee.id = uuidv4();
        const ref = doc(db, 'users', userId, 'master_employees', employee.id);
        await setDoc(ref, employee);
    } catch (error) {
        console.error("Error saving master employee:", error);
        throw error;
    }
};

export const deleteMasterEmployee = async (userId: string, id: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'users', userId, 'master_employees', id));
    } catch (error) {
        console.error("Error deleting master employee:", error);
        throw error;
    }
};

export const importMasterEmployees = async (userId: string, newEmployees: Omit<MasterEmployee, 'id'>[]): Promise<void> => {
    const batch = writeBatch(db);
    
    newEmployees.forEach(e => {
        const id = uuidv4();
        const ref = doc(db, 'users', userId, 'master_employees', id);
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
