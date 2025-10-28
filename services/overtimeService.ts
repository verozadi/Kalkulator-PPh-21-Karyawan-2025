import { OvertimeRecord } from '../types';
import { initialOvertimeRecords } from './mockData';

const STORAGE_KEY = 'pph21_overtime_records';

const getStoredOvertimeRecords = (): OvertimeRecord[] => {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.error("Failed to parse overtime records from localStorage", error);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialOvertimeRecords));
    return initialOvertimeRecords;
};

export const getOvertimeRecords = (): OvertimeRecord[] => {
    return getStoredOvertimeRecords();
};

export const saveOvertimeRecords = (records: OvertimeRecord[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};
