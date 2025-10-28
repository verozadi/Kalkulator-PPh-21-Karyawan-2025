import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { initializeProfileForUser } from './profileService';
import { initializeMasterEmployeesForUser } from './masterEmployeeService';
import { initializeEmployeesForUser } from './employeeService';
import { initializeOvertimeForUser } from './overtimeService';

const USERS_KEY = 'pph21_users';
const SESSION_KEY = 'pph21_session_userId';

// Simple password hashing simulation (DO NOT USE IN PRODUCTION)
const hashPassword = (password: string): string => {
    return `hashed_${password}`;
};

const verifyPassword = (password: string, hash: string): boolean => {
    return `hashed_${password}` === hash;
};


const getUsers = (): User[] => {
    try {
        const storedUsers = localStorage.getItem(USERS_KEY);
        return storedUsers ? JSON.parse(storedUsers) : [];
    } catch (e) {
        return [];
    }
};

const saveUsers = (users: User[]): void => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const register = (name: string, email: string, password: string): { success: boolean; message: string; user?: User } => {
    const users = getUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
        return { success: false, message: 'Email sudah terdaftar.' };
    }

    const newUser: User = {
        id: uuidv4(),
        name,
        email,
        passwordHash: hashPassword(password),
    };

    users.push(newUser);
    saveUsers(users);

    // Initialize all data stores for the new user
    initializeProfileForUser(newUser.id);
    initializeMasterEmployeesForUser(newUser.id);
    initializeEmployeesForUser(newUser.id);
    initializeOvertimeForUser(newUser.id);

    return { success: true, message: 'Pendaftaran berhasil!', user: newUser };
};


export const login = (email: string, password: string): { success: boolean; message: string; user?: User } => {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        return { success: false, message: 'Email atau kata sandi salah.' };
    }

    const isPasswordCorrect = verifyPassword(password, user.passwordHash);
    if (!isPasswordCorrect) {
        return { success: false, message: 'Email atau kata sandi salah.' };
    }

    sessionStorage.setItem(SESSION_KEY, user.id);
    return { success: true, message: 'Login berhasil!', user };
};

export const logout = (): void => {
    sessionStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
    try {
        const userId = sessionStorage.getItem(SESSION_KEY);
        if (!userId) {
            return null;
        }
        const users = getUsers();
        return users.find(u => u.id === userId) || null;
    } catch (e) {
        return null;
    }
};