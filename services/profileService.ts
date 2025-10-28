import { Profile } from '../types';

const STORAGE_KEY = 'pph21_profile';

const defaultLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-white"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21M3 3h18M3 7.5h18M3 12h18m-4.5-4.5h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75" /></svg>`;
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

export const getProfile = (): Profile => {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            // Merge with defaults to ensure all fields are present for forward compatibility
            return { ...defaultProfile, ...parsedData };
        }
    } catch (error) {
        console.error("Failed to parse profile from localStorage", error);
    }
    // If nothing in storage, initialize with default data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfile));
    return defaultProfile;
};

export const saveProfile = (profile: Profile): void => {
    try {
        const dataToStore = JSON.stringify(profile);
        localStorage.setItem(STORAGE_KEY, dataToStore);
    } catch (error) {
        console.error("Failed to save profile to localStorage", error);
    }
};