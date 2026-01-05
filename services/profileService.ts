
import { Profile } from '../types';
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Default logo (same as before)
const defaultLogoSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M256 32L50 100V240C50 360 140 460 256 500C372 460 462 360 462 240V100L256 32Z" fill="white" stroke="#172554" stroke-width="25" stroke-linejoin="round"/>
<path d="M160 150 L220 300 L352 130" stroke="#1e3a8a" stroke-width="50" stroke-linecap="round" stroke-linejoin="round" fill="none"/> 
<path d="M200 320 L270 240 L400 90" stroke="none" fill="#ca8a04"/> 
<path d="M190 270 L256 360 L420 160" stroke="#ca8a04" stroke-width="40" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

const defaultLogoUrl = `data:image/svg+xml;base64,${btoa(defaultLogoSvg)}`;

export const defaultProfile: Profile = {
    logoUrl: defaultLogoUrl,
    appName: 'VerozTax',
    companyName: 'Nama Perusahaan Anda',
    companyAddress: 'Jl. Jend. Sudirman No. 1, Jakarta',
    companyNpwp: '00.000.000.0-000.000',
    contactName: 'Nama Penanggung Jawab',
    contactPosition: 'Direktur',
    contactNpwp: '00.000.000.0-000.000',
    contactNik: '3171000000000000',
    nitku: '',
    idTku: '',
};

export const saveProfile = async (userId: string, profile: Profile): Promise<void> => {
    try {
        const ref = doc(db, 'users', userId, 'settings', 'profile');
        await setDoc(ref, profile);
    } catch (error) {
        console.error("Error saving profile:", error);
        throw error;
    }
};

// Only used for initial load if needed, but App.tsx handles listener
export const getProfile = (userId: string): Profile => {
    return defaultProfile;
};
