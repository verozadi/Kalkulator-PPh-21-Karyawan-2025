
import { OvertimeRecord } from '../types';
import { db } from './firebase';

export const saveOvertimeRecords = async (userId: string, records: OvertimeRecord[], deletedIds?: string[]): Promise<void> => {
    const batch = db.batch();
    
    // 1. Handle Deletions (if provided)
    if (deletedIds && deletedIds.length > 0) {
        deletedIds.forEach(id => {
            const ref = db.collection('users').doc(userId).collection('overtime_records').doc(id);
            batch.delete(ref);
        });
    }

    // 2. Handle Upserts (Update/Insert)
    // We only update the records provided in the 'records' array.
    records.forEach(rec => {
        const ref = db.collection('users').doc(userId).collection('overtime_records').doc(rec.id);
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
