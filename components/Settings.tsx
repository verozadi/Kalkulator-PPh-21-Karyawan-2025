import React, { useState } from 'react';

const STORAGE_KEYS = [
    'pph21_employees',
    'pph21_master_employees',
    'pph21_overtime_records',
    'pph21_profile'
];

const Settings: React.FC = () => {
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleBackup = () => {
        try {
            const backupData: { [key: string]: any } = {};
            STORAGE_KEYS.forEach(key => {
                const data = localStorage.getItem(key);
                if (data) {
                    backupData[key] = JSON.parse(data);
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
            setMessage({ type: 'success', text: 'Database berhasil dicadangkan.' });
        } catch (error) {
            console.error('Backup failed:', error);
            setMessage({ type: 'error', text: 'Gagal mencadangkan database.' });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setRestoreFile(e.target.files[0]);
            setMessage(null);
        }
    };

    const handleRestore = () => {
        if (!restoreFile) {
            setMessage({ type: 'error', text: 'Silakan pilih file cadangan terlebih dahulu.' });
            return;
        }

        if (!window.confirm('Anda yakin ingin memulihkan database? Semua data saat ini akan ditimpa oleh data dari file cadangan.')) {
            return;
        }

        setIsRestoring(true);
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const json = event.target?.result as string;
                const data = JSON.parse(json);

                // Basic validation
                const missingKeys = STORAGE_KEYS.filter(key => !(key in data));
                if (missingKeys.length > 0) {
                    throw new Error(`File cadangan tidak valid. Kunci yang hilang: ${missingKeys.join(', ')}`);
                }

                STORAGE_KEYS.forEach(key => {
                    localStorage.setItem(key, JSON.stringify(data[key]));
                });

                setMessage({ type: 'success', text: 'Database berhasil dipulihkan. Harap muat ulang halaman untuk melihat perubahan.' });
                setRestoreFile(null);
            } catch (error: any) {
                console.error('Restore failed:', error);
                setMessage({ type: 'error', text: `Gagal memulihkan: ${error.message}` });
            } finally {
                setIsRestoring(false);
            }
        };
        
        reader.onerror = () => {
             setMessage({ type: 'error', text: 'Gagal membaca file.' });
             setIsRestoring(false);
        };

        reader.readAsText(restoreFile);
    };

    return (
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl shadow-black/20 max-w-2xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-primary-400">Pengaturan</h2>
            
            {message && (
                <div className={`p-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {message.text}
                </div>
            )}
            
            {/* Backup Section */}
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

            {/* Restore Section */}
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

// Icons
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4 4m0 0l4-4m-4 4V4" /></svg>;
const SpinnerIcon = () => <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

export default Settings;
