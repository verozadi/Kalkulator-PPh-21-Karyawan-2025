
import { Profile } from '../types';

const getStorageKey = (userId: string) => `pph21_profile_${userId}`;

// Logo VerozTax (Shield with V Blue & Checkmark Gold)
// This serves as the "App Logo" default. User can upload "Company Logo" to override it in the UI.
const defaultLogoSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M256 32L50 100V240C50 360 140 460 256 500C372 460 462 360 462 240V100L256 32Z" fill="white" stroke="#172554" stroke-width="25" stroke-linejoin="round"/>
<path d="M160 150 L220 300 L352 130" stroke="#1e3a8a" stroke-width="50" stroke-linecap="round" stroke-linejoin="round" fill="none"/> 
<path d="M200 320 L270 240 L400 90" stroke="none" fill="#ca8a04"/> 
<path d="M190 270 L256 360 L420 160" stroke="#ca8a04" stroke-width="40" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

const defaultLogoUrl = `data:image/svg+xml;base64,${btoa(defaultLogoSvg)}`;

const defaultProfile: Profile = {
    logoUrl: defaultLogoUrl,
    appName: 'VerozTax',
    companyName: 'Nama Perusahaan Anda',
    companyNpwp: '00.000.000.0-000.000',
    contactName: 'Nama Penanggung Jawab',
    contactNpwp: '00.000.000.0-000.000',
    contactNik: '3171000000000000',
    nitku: '',
    idTku: '',
};

export const initializeProfileForUser = (userId: string): void => {
    const storageKey = getStorageKey(userId);
    if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, JSON.stringify(defaultProfile));
    }
};

export const getProfile = (userId: string): Profile => {
    const storageKey = getStorageKey(userId);
    try {
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            
            // Logic to enforce App Name and reset Logo if it was the old generic one
            // This ensures the new VerozTax logo appears even for existing users unless they explicitly uploaded a custom one
            if (!parsedData.appName || parsedData.appName === 'Kalkulator PPh 21') {
                parsedData.appName = 'VerozTax';
            }
            
            // Check if the current logo is an old default SVG (heuristic check) to update to new Brand Logo
            if (parsedData.logoUrl && parsedData.logoUrl.startsWith('data:image/svg+xml') && !parsedData.logoUrl.includes('M256 32L50 100V240')) {
                 // Only reset if it looks like a generated SVG but NOT the new one (and not a user uploaded png/jpg)
                 // This is a safe fallback to ensure the new logo propagates
                 const isOldDefault = parsedData.logoUrl.length < 5000; // heuristic for simple SVGs
                 if(isOldDefault) {
                    parsedData.logoUrl = defaultLogoUrl;
                 }
            }

            return { ...defaultProfile, ...parsedData };
        }
    } catch (error) {
        console.error("Failed to parse profile from localStorage", error);
    }
    // If nothing in storage, initialize with default data
    localStorage.setItem(storageKey, JSON.stringify(defaultProfile));
    return defaultProfile;
};

export const saveProfile = (userId: string, profile: Profile): void => {
    const storageKey = getStorageKey(userId);
    try {
        const dataToStore = JSON.stringify(profile);
        localStorage.setItem(storageKey, dataToStore);
    } catch (error) {
        console.error("Failed to save profile to localStorage", error);
    }
};
