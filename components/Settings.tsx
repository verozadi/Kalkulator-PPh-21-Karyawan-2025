import React, { useState } from 'react';
import { User } from '../types';

interface SettingsProps {
  showNotification: (message: string, type?: 'success' | 'error') => void;
  currentUser: User;
}

const GENERIC_STORAGE_KEYS = [
    'pph21_employees',
    'pph21_master_employees',
    'pph21_overtime_records',
    'pph21_profile'
];

const Settings: React.FC<SettingsProps> = ({ showNotification, currentUser }) => {
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);

    const handleBackup = () => {
        try {
            const userStorageKeys = GENERIC_STORAGE_KEYS.map(key => `${key}_${currentUser.id}`);
            const backupData: { [key: string]: any } = {};
            
            GENERIC_STORAGE_KEYS.forEach((genericKey, index) => {
                const userSpecificKey = userStorageKeys[index];
                const data = localStorage.getItem(userSpecificKey);
                if (data) {
                    // Save with generic key in the backup file
                    backupData[genericKey] = JSON.parse(data);
                }
            });

            const jsonString = JSON.stringify(backupData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const date = new Date().toISOString().slice(0, 10);
            a.href = url;
            a.download = `veroz-tax-backup-${date}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showNotification('Berhasil Dicadangkan');
        } catch (error) {
            console.error('Backup failed:', error);
            showNotification('Gagal', 'error');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setRestoreFile(e.target.files[0]);
        }
    };

    const handleRestore = () => {
        if (!restoreFile) {
            showNotification('Silakan pilih file cadangan terlebih dahulu.', 'error');
            return;
        }

        if (!window.confirm('Anda yakin ingin memulihkan database? Semua data saat ini untuk pengguna Anda akan ditimpa oleh data dari file cadangan.')) {
            return;
        }

        setIsRestoring(true);
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const json = event.target?.result as string;
                const data = JSON.parse(json);

                const missingKeys = GENERIC_STORAGE_KEYS.filter(key => !(key in data));
                if (missingKeys.length > 0) {
                    throw new Error(`File cadangan tidak valid. Kunci yang hilang: ${missingKeys.join(', ')}`);
                }

                GENERIC_STORAGE_KEYS.forEach(key => {
                    const userSpecificKey = `${key}_${currentUser.id}`;
                    localStorage.setItem(userSpecificKey, JSON.stringify(data[key]));
                });

                showNotification('Berhasil Dipulihkan. Harap muat ulang halaman.');
                setRestoreFile(null);
            } catch (error: any) {
                console.error('Restore failed:', error);
                showNotification(`Gagal: ${error.message}`, 'error');
            } finally {
                setIsRestoring(false);
            }
        };
        
        reader.onerror = () => {
             showNotification('Gagal membaca file.', 'error');
             setIsRestoring(false);
        };

        reader.readAsText(restoreFile);
    };

    return (
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl shadow-black/20 max-w-2xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-primary-400">Pengaturan</h2>
            
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-200">Cadangkan Database</h3>
                <p className="text-gray-400">
                    Simpan semua data Anda (karyawan, perhitungan PPh 21, lembur, profil) ke dalam satu file JSON. Simpan file ini di tempat yang aman.
                </p>
                <button 
                    onClick={handleBackup} 
                    className="w-full sm:w-auto bg-primary-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                >
                    <DownloadIcon />
                    <span>Cadangkan Sekarang</span>
                </button>
            </div>

            <hr className="border-gray-700" />

            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-200">Pulihkan Database</h3>
                <p className="text-gray-400">
                    Pulihkan data dari file cadangan. <strong className="text-red-400">Perhatian:</strong> Tindakan ini akan menimpa semua data yang ada saat ini.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <input 
                        type="file" 
                        accept=".json" 
                        onChange={handleFileChange} 
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600 w-full text-sm text-gray-400"
                    />
                    <button 
                        onClick={handleRestore} 
                        disabled={!restoreFile || isRestoring}
                        className="w-full sm:w-auto bg-accent-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-accent-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isRestoring ? <SpinnerIcon/> : <UploadIcon />}
                        <span>{isRestoring ? 'Memulihkan...' : 'Pulihkan'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4 4m0 0l4-4m-4 4V4" /></svg>;
const SpinnerIcon = () => <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

export default Settings;