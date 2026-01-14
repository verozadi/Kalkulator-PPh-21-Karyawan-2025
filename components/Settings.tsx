
import * as React from 'react';
import { User, AppTheme } from '../types';
import { updateUserPassword, changeUserEmail } from '../services/authService';
import { db } from '../services/firebase'; // Import Firestore connection

interface SettingsProps {
  showNotification: (message: string, type?: 'success' | 'error') => void;
  currentUser: User;
  currentTheme: AppTheme;
  onSetTheme: (theme: AppTheme) => void;
  isLicenseActivated: boolean; // Prop added
  onOpenActivation: () => void; // Prop added
}

// Icons (Same as before)
const CogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const UserCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const LockClosedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const DatabaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const BackupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const CloudArrowUp = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const CloudIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const SpinnerIcon = () => <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const PaletteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>;

const Settings: React.FC<SettingsProps> = ({ showNotification, currentUser, currentTheme, onSetTheme, isLicenseActivated, onOpenActivation }) => {
    // Backup & Restore State
    const [restoreFile, setRestoreFile] = React.useState<File | null>(null);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [statusMessage, setStatusMessage] = React.useState('');

    // Password State
    const [oldPassword, setOldPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [isSavingPassword, setIsSavingPassword] = React.useState(false);

    // Email Change State
    const [newEmail, setNewEmail] = React.useState('');
    const [emailPassword, setEmailPassword] = React.useState('');
    const [isUpdatingEmail, setIsUpdatingEmail] = React.useState(false);

    // --- Helper for License Check ---
    const checkLicense = (action: () => void) => {
        if (!isLicenseActivated) {
            onOpenActivation();
            return;
        }
        action();
    };

    // --- Helper for Batching ---
    const chunkArray = (array: any[], size: number) => {
        const chunked = [];
        for (let i = 0; i < array.length; i += size) {
            chunked.push(array.slice(i, i + size));
        }
        return chunked;
    };

    // --- Backup Logic (From Firebase to .db) ---
    const handleBackup = async () => {
        checkLicense(async () => {
            setIsProcessing(true);
            setStatusMessage('Sedang mengambil data dari Cloud...');
            
            try {
                const userId = currentUser.id;
                const backupData: any = {
                    metadata: {
                        version: "1.0",
                        timestamp: new Date().toISOString(),
                        userId: userId,
                        type: "veroztax_full_backup"
                    },
                    data: {
                        employees: [],
                        master_employees: [],
                        overtime_records: [],
                        profile: null
                    }
                };

                // Fetch data logic remains same...
                const empSnap = await db.collection('users').doc(userId).collection('employees').get();
                backupData.data.employees = empSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const masterSnap = await db.collection('users').doc(userId).collection('master_employees').get();
                backupData.data.master_employees = masterSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const overtimeSnap = await db.collection('users').doc(userId).collection('overtime_records').get();
                backupData.data.overtime_records = overtimeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const profileSnap = await db.collection('users').doc(userId).collection('settings').doc('profile').get();
                if (profileSnap.exists) { backupData.data.profile = profileSnap.data(); }

                setStatusMessage('Membuat file database...');
                const jsonString = JSON.stringify(backupData, null, 2);
                const blob = new Blob([jsonString], { type: 'application/octet-stream' }); 
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                const date = new Date().toISOString().slice(0, 10);
                a.href = url;
                a.download = `VerozTax_Backup_${date}.db`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                showNotification('Database Cloud berhasil dicadangkan ke file .db');
            } catch (error) {
                console.error('Cloud Backup failed:', error);
                showNotification('Gagal mencadangkan database cloud', 'error');
            } finally {
                setIsProcessing(false);
                setStatusMessage('');
            }
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setRestoreFile(e.target.files[0]);
        }
    };

    const handleRestore = async () => {
        checkLicense(async () => {
            if (!restoreFile) {
                showNotification('Silakan pilih file .db terlebih dahulu.', 'error');
                return;
            }
            if (!window.confirm('PERINGATAN: Memulihkan database akan MENIMPA/MENGGABUNGKAN data cloud Anda dengan data dari file ini. Lanjutkan?')) {
                return;
            }

            setIsProcessing(true);
            setStatusMessage('Membaca file database...');
            
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const json = event.target?.result as string;
                    const parsed = JSON.parse(json);
                    if (!parsed.data || !parsed.metadata) throw new Error("Format file .db tidak valid.");

                    const userId = currentUser.id;
                    setStatusMessage('Mengunggah ke Cloud (Proses ini mungkin memakan waktu)...');

                    const performBatchWrite = async (collectionName: string, items: any[]) => {
                        const chunks = chunkArray(items, 400); 
                        let processedCount = 0;
                        for (const chunk of chunks) {
                            const batch = db.batch();
                            chunk.forEach((item: any) => {
                                if (item.id) {
                                    const ref = db.collection('users').doc(userId).collection(collectionName).doc(item.id);
                                    batch.set(ref, item);
                                }
                            });
                            await batch.commit();
                            processedCount += chunk.length;
                            setStatusMessage(`Memulihkan ${collectionName}: ${processedCount}/${items.length}...`);
                        }
                    };

                    if (parsed.data.employees && Array.isArray(parsed.data.employees)) {
                        await performBatchWrite('employees', parsed.data.employees);
                    }
                    if (parsed.data.master_employees && Array.isArray(parsed.data.master_employees)) {
                        await performBatchWrite('master_employees', parsed.data.master_employees);
                    }
                    if (parsed.data.overtime_records && Array.isArray(parsed.data.overtime_records)) {
                        await performBatchWrite('overtime_records', parsed.data.overtime_records);
                    }
                    if (parsed.data.profile) {
                        await db.collection('users').doc(userId).collection('settings').doc('profile').set(parsed.data.profile);
                    }

                    showNotification('Database berhasil dipulihkan ke Cloud!');
                    setRestoreFile(null);
                    setTimeout(() => window.location.reload(), 1500);

                } catch (error: any) {
                    console.error('Cloud Restore failed:', error);
                    showNotification(`Gagal memulihkan: ${error.message}`, 'error');
                } finally {
                    setIsProcessing(false);
                    setStatusMessage('');
                }
            };
            
            reader.onerror = () => {
                showNotification('Gagal membaca file.', 'error');
                setIsProcessing(false);
            };
            reader.readAsText(restoreFile);
        });
    };

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        checkLicense(async () => {
            if (!oldPassword) {
                showNotification('Mohon isi kata sandi lama untuk verifikasi.', 'error');
                return;
            }
            if (newPassword.length < 6) {
                showNotification('Kata sandi baru harus terdiri dari minimal 6 karakter.', 'error');
                return;
            }
            if (newPassword !== confirmPassword) {
                showNotification('Konfirmasi kata sandi tidak cocok.', 'error');
                return;
            }

            setIsSavingPassword(true);
            try {
                const result = await updateUserPassword(newPassword, oldPassword);
                if (result.success) {
                    showNotification(result.message, 'success');
                    setOldPassword('');
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
        });
    };

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        checkLicense(async () => {
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
        });
    };

    return (
        <div className="space-y-8 animate-fade-in-up max-w-4xl mx-auto pb-12">
            {/* ... [Header and Profile section same as original] ... */}
            <div>
                <div className="flex items-center space-x-3">
                    <CogIcon />
                    <h1 className="text-3xl font-bold text-gray-100">Pengaturan</h1>
                </div>
                <p className="text-gray-400 mt-1">Kelola profil, keamanan, tema, dan database cloud Anda.</p>
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

                {/* 2. Tema & UI (No change needed, license check is at App.tsx level handler) */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-xl shadow-black/20 border border-gray-700">
                    <div className="flex items-center space-x-2 mb-6 border-b border-gray-700 pb-3">
                        <PaletteIcon />
                        <h2 className="text-xl font-semibold text-gray-200">Tema Tampilan (UI)</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {[
                            { id: 'default', name: 'Default', bg: 'bg-[#1f2937]' },
                            { id: 'word', name: 'Ms Word', bg: 'bg-[#2b579a]' },
                            { id: 'cyberpunk', name: 'Cyberpunk', bg: 'bg-[#050505] border border-yellow-400' },
                            { id: 'anime', name: 'Anime', bg: 'bg-[#db2777]' },
                            { id: 'blackRed', name: 'Black & Red', bg: 'bg-[#000000] border border-red-900' },
                        ].map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => onSetTheme(theme.id as AppTheme)}
                                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                                    currentTheme === theme.id 
                                    ? 'border-primary-500 shadow-lg scale-105' 
                                    : 'border-gray-600 hover:border-gray-500'
                                }`}
                            >
                                <div className={`w-full h-8 rounded ${theme.bg}`}></div>
                                <span className={`text-sm font-medium ${currentTheme === theme.id ? 'text-white' : 'text-gray-400'}`}>{theme.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Keamanan (Password & Email) */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-xl shadow-black/20 border border-gray-700">
                    <div className="flex items-center space-x-2 mb-6 border-b border-gray-700 pb-3">
                        <LockClosedIcon />
                        <h2 className="text-xl font-semibold text-gray-200">Keamanan</h2>
                    </div>
                    
                    <form onSubmit={handleSavePassword} className="space-y-6">
                        <h3 className="text-lg font-medium text-white mb-2">Ubah Kata Sandi</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Kata Sandi Lama <span className="text-red-500">*</span></label>
                                <input 
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="Masukkan kata sandi lama untuk verifikasi"
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-primary-500 focus:border-primary-500 placeholder-gray-500"
                                />
                            </div>
                        </div>
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
                                <label className="block text-sm font-medium text-gray-400 mb-1">Konfirmasi Kata Sandi Baru</label>
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
                                disabled={isSavingPassword || !newPassword || !oldPassword}
                                className="bg-primary-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg"
                            >
                                {isSavingPassword ? <><SpinnerIcon /> <span>Menyimpan...</span></> : <span>Simpan Kata Sandi</span>}
                            </button>
                        </div>
                    </form>

                    <hr className="my-8 border-gray-700" />

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
                                {isUpdatingEmail ? <><SpinnerIcon /> <span>Memproses...</span></> : <span>Update Email</span>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* 4. Database (Moved to Bottom) */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-xl shadow-black/20 border border-gray-700 relative overflow-hidden">
                    {isProcessing && (
                        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fade-in">
                            <SpinnerIcon />
                            <p className="text-white font-semibold mt-4">{statusMessage}</p>
                        </div>
                    )}

                    <div className="flex items-center space-x-2 mb-6 border-b border-gray-700 pb-3">
                        <DatabaseIcon />
                        <h2 className="text-xl font-semibold text-gray-200">Database Cloud & Backup</h2>
                    </div>
                    
                    <div className="space-y-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-blue-900/20 p-4 rounded-lg border border-blue-800/50">
                            <div>
                                <h3 className="text-lg font-medium text-blue-100 flex items-center gap-2">
                                    <CloudIcon /> Status: Terhubung ke Cloud
                                </h3>
                                <p className="text-sm text-blue-300 mt-1">
                                    Data Anda disinkronisasi secara otomatis ke server (Cloud) yang aman. Anda tetap disarankan melakukan backup berkala.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-300">Cadangkan Data (Cloud ke Lokal)</h3>
                            <p className="text-sm text-gray-400">
                                Unduh salinan lengkap database Anda dari Cloud ke komputer dalam format <strong>.db</strong>. File ini dapat digunakan untuk pemulihan di masa depan.
                            </p>
                            <button 
                                onClick={handleBackup} 
                                disabled={isProcessing}
                                className="w-full sm:w-auto bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                                <BackupIcon />
                                <span>Download Database (.db)</span>
                            </button>
                        </div>

                        <hr className="border-gray-700" />

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-300">Pulihkan Data (Lokal ke Cloud)</h3>
                            <p className="text-sm text-gray-400">
                                Upload file <strong>.db</strong> untuk memulihkan data ke Cloud. <strong className="text-red-400">Perhatian:</strong> Data di cloud akan diperbarui dengan data dari file backup.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <input 
                                    type="file" 
                                    accept=".db,.json" 
                                    onChange={handleFileChange} 
                                    disabled={isProcessing}
                                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600 w-full text-sm text-gray-400 cursor-pointer"
                                />
                                <button 
                                    onClick={handleRestore} 
                                    disabled={!restoreFile || isProcessing}
                                    className="w-full sm:w-auto bg-accent-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-accent-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                                >
                                    <CloudArrowUp />
                                    <span>Pulihkan ke Cloud</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
