
import * as React from 'react';
import { User } from '../types';
import { updateUserPassword, changeUserEmail } from '../services/authService';

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

const CogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const UserCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const LockClosedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const DatabaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;

const Settings: React.FC<SettingsProps> = ({ showNotification, currentUser }) => {
    // Backup & Restore State
    const [restoreFile, setRestoreFile] = React.useState<File | null>(null);
    const [isRestoring, setIsRestoring] = React.useState(false);

    // Password State
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [isSavingPassword, setIsSavingPassword] = React.useState(false);

    // Email Change State
    const [newEmail, setNewEmail] = React.useState('');
    const [emailPassword, setEmailPassword] = React.useState(''); // Verification password
    const [isUpdatingEmail, setIsUpdatingEmail] = React.useState(false);

    // --- Backup Logic ---
    const handleBackup = () => {
        try {
            const userStorageKeys = GENERIC_STORAGE_KEYS.map(key => `${key}_${currentUser.id}`);
            const backupData: { [key: string]: any } = {};
            
            GENERIC_STORAGE_KEYS.forEach((genericKey, index) => {
                const userSpecificKey = userStorageKeys[index];
                const data = localStorage.getItem(userSpecificKey);
                if (data) {
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

                showNotification('Berhasil Dipulihkan. Halaman akan dimuat ulang secara otomatis.');
                setRestoreFile(null);

                setTimeout(() => {
                    window.location.reload();
                }, 2000);

            } catch (error: any) {
                console.error('Restore failed:', error);
                showNotification(`Gagal: ${error.message}`, 'error');
                setIsRestoring(false);
            }
        };
        
        reader.onerror = () => {
             showNotification('Gagal membaca file.', 'error');
             setIsRestoring(false);
        };

        reader.readAsText(restoreFile);
    };

    // --- Password Logic ---
    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            showNotification('Kata sandi harus terdiri dari minimal 6 karakter.', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showNotification('Konfirmasi kata sandi tidak cocok.', 'error');
            return;
        }

        setIsSavingPassword(true);
        try {
            const result = await updateUserPassword(newPassword);
            if (result.success) {
                showNotification(result.message, 'success');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            showNotification('Terjadi kesalahan yang tidak terduga.', 'error');
        } finally {
            setIsSavingPassword(false);
        }
    };

    // --- Update Email Logic ---
    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail || !emailPassword) {
            showNotification('Mohon isi email baru dan kata sandi saat ini.', 'error');
            return;
        }
        
        setIsUpdatingEmail(true);
        try {
            const result = await changeUserEmail(newEmail, emailPassword);
            if (result.success) {
                showNotification(result.message, 'success');
                setNewEmail('');
                setEmailPassword('');
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            showNotification('Terjadi kesalahan yang tidak terduga.', 'error');
        } finally {
            setIsUpdatingEmail(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up max-w-4xl mx-auto pb-12">
            <div>
                <div className="flex items-center space-x-3">
                    <CogIcon />
                    <h1 className="text-3xl font-bold text-gray-100">Pengaturan</h1>
                </div>
                <p className="text-gray-400 mt-1">Kelola profil, keamanan, dan data aplikasi Anda.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-8">
                {/* 1. Profil Pengguna */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-xl shadow-black/20 border border-gray-700">
                    <div className="flex items-center space-x-2 mb-6 border-b border-gray-700 pb-3">
                        <UserCircleIcon />
                        <h2 className="text-xl font-semibold text-gray-200">Profil Pengguna</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Nama Pengguna</label>
                            <div className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-md text-gray-200 font-medium">
                                {currentUser.name}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Email Saat Ini</label>
                            <div className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-md text-gray-200 font-medium">
                                {currentUser.email}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Keamanan (Password & Email) */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-xl shadow-black/20 border border-gray-700">
                    <div className="flex items-center space-x-2 mb-6 border-b border-gray-700 pb-3">
                        <LockClosedIcon />
                        <h2 className="text-xl font-semibold text-gray-200">Keamanan</h2>
                    </div>
                    
                    {/* Change Password Section */}
                    <form onSubmit={handleSavePassword} className="space-y-6">
                        <h3 className="text-lg font-medium text-white mb-2">Ubah Kata Sandi</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Kata Sandi Baru</label>
                                <input 
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Minimal 6 karakter"
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-primary-500 focus:border-primary-500 placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Konfirmasi Kata Sandi</label>
                                <input 
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Ulangi kata sandi baru"
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-primary-500 focus:border-primary-500 placeholder-gray-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                disabled={isSavingPassword || !newPassword}
                                className="bg-primary-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg"
                            >
                                {isSavingPassword ? (
                                    <>
                                        <SpinnerIcon /> <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <span>Simpan Kata Sandi</span>
                                )}
                            </button>
                        </div>
                    </form>

                    <hr className="my-8 border-gray-700" />

                    {/* Change Email Section */}
                    <form onSubmit={handleUpdateEmail} className="space-y-6">
                        <div className="flex items-center space-x-2">
                            <MailIcon />
                            <h3 className="text-lg font-medium text-white">Ubah Alamat Email</h3>
                        </div>
                        <p className="text-sm text-gray-400 bg-gray-700/30 p-3 rounded border border-gray-600">
                            Perhatian: Mengubah email akan memperbarui lisensi Anda dan memerlukan login ulang dengan email baru. 
                            Anda wajib memasukkan kata sandi saat ini untuk verifikasi.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email Baru</label>
                                <input 
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="nama@emailbaru.com"
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-primary-500 focus:border-primary-500 placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Kata Sandi Saat Ini</label>
                                <input 
                                    type="password"
                                    value={emailPassword}
                                    onChange={(e) => setEmailPassword(e.target.value)}
                                    placeholder="Konfirmasi password untuk keamanan"
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-primary-500 focus:border-primary-500 placeholder-gray-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                disabled={isUpdatingEmail || !newEmail || !emailPassword}
                                className="bg-accent-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-accent-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg"
                            >
                                {isUpdatingEmail ? (
                                    <>
                                        <SpinnerIcon /> <span>Memproses...</span>
                                    </>
                                ) : (
                                    <span>Update Email</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* 3. Database (Existing) */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-xl shadow-black/20 border border-gray-700">
                    <div className="flex items-center space-x-2 mb-6 border-b border-gray-700 pb-3">
                        <DatabaseIcon />
                        <h2 className="text-xl font-semibold text-gray-200">Database</h2>
                    </div>
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-300">Cadangkan Database</h3>
                            <p className="text-sm text-gray-400">
                                Simpan semua data Anda (karyawan, perhitungan PPh 21, lembur, profil) ke dalam satu file JSON lokal.
                            </p>
                            <button 
                                onClick={handleBackup} 
                                className="w-full sm:w-auto bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center space-x-2"
                            >
                                <BackupIcon />
                                <span>Cadangkan Sekarang</span>
                            </button>
                        </div>

                        <hr className="border-gray-700" />

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-300">Pulihkan Database</h3>
                            <p className="text-sm text-gray-400">
                                Pulihkan data dari file cadangan JSON. <strong className="text-red-400">Perhatian:</strong> Tindakan ini akan menimpa semua data yang ada.
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
                                    {isRestoring ? <SpinnerIcon/> : <RestoreIcon />}
                                    <span>{isRestoring ? 'Memulihkan...' : 'Pulihkan'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BackupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const RestoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4 4m0 0l4-4m-4 4V4" /></svg>;
const SpinnerIcon = () => <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

export default Settings;
