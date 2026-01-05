
import { OvertimeRecord } from '../types';
import { db } from './firebase';
import { doc, setDoc, writeBatch, collection, getDocs, query } from 'firebase/firestore';

export const saveOvertimeRecords = async (userId: string, records: OvertimeRecord[]): Promise<void> => {
    const batch = writeBatch(db);
    
    // For simplicity in this specific "bulk save" feature of the Overtime component,
    // we iterate and set each record. 
    // Optimization: In a real app, only save changed/new records.
    records.forEach(rec => {
        const ref = doc(db, 'users', userId, 'overtime_records', rec.id);
        batch.set(ref, rec);
    });

    try {
        await batch.commit();
    } catch (error) {
        console.error("Error saving overtime records:", error);
        throw error;
    }
};

export const getOvertimeRecords = (userId: string): OvertimeRecord[] => {
    return []; // Handled by App.tsx listener
};
