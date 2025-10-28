import { OvertimeRecord } from '../types';
import { initialOvertimeRecords } from './mockData';

const getStorageKey = (userId: string) => `pph21_overtime_records_${userId}`;

export const initializeOvertimeForUser = (userId: string): void => {
    const storageKey = getStorageKey(userId);
    if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, JSON.stringify(initialOvertimeRecords));
    }
};

const getStoredOvertimeRecords = (userId: string): OvertimeRecord[] => {
    const storageKey = getStorageKey(userId);
    try {
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.error("Failed to parse overtime records from localStorage", error);
    }
    localStorage.setItem(storageKey, JSON.stringify(initialOvertimeRecords));
    return initialOvertimeRecords;
};

export const getOvertimeRecords = (userId: string): OvertimeRecord[] => {
    return getStoredOvertimeRecords(userId);
};

export const saveOvertimeRecords = (userId: string, records: OvertimeRecord[]): void => {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(records));
};