
import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../types';

// API URL for License Verification (Google Apps Script)
const API_URL = "https://script.google.com/macros/s/AKfycbwC5xHIrnG39FMYU853IOAwrLGE4U25ZTZc_MbWXkhQHNgY27WIRXy48NmzXTkXhZeStQ/exec";

interface LicenseActivationProps {
    onActivationSuccess: () => void;
    onClose: () => void; // Added onClose prop
    user: User | null;
    isOpen: boolean; // Added isOpen prop
}

const LicenseActivation: React.FC<LicenseActivationProps> = ({ onActivationSuccess, onClose, user, isOpen }) => {
    const [licenseKey, setLicenseKey] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [successMsg, setSuccessMsg] = React.useState('');
    const [error, setError] = React.useState('');

    if (!isOpen) return null;

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        
        const cleanKey = licenseKey.trim();

        if (!cleanKey) {
            setError('Masukkan Kunci Lisensi.');
            return;
        }

        setIsLoading(true);

        try {
            // 1. Get or Create Device ID
            let deviceId = localStorage.getItem('veroz_device_id');
            if (!deviceId) {
                deviceId = uuidv4();
                localStorage.setItem('veroz_device_id', deviceId);
            }

            // 2. Send Key + Device ID + Email to API
            const params = new URLSearchParams({
                key: cleanKey,
                deviceId: deviceId,
                email: user?.email || '', // Bind license to this email
                uid: user?.id || '', // Bind to firebase UID
                action: 'activate'
            });

            const response = await fetch(`${API_URL}?${params.toString()}`, {
                method: 'GET',
            });

            const data = await response.json();

            if (data.result === 'success') {
                // Success: Persist local flag
                localStorage.setItem('veroz_license_active', 'true');
                localStorage.setItem('veroz_license_key', cleanKey); 
                
                setSuccessMsg(data.message || 'Lisensi Valid! Mengalihkan...');
                
                setTimeout(() => {
                    onActivationSuccess();
                    onClose();
                }, 1500);
            } else {
                setError(data.message || 'License Key Invalid or Expired');
            }

        } catch (err) {
            console.error(err);
            setError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-2xl shadow-black/50 border border-gray-700 relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
                
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mb-8">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-900/30 mb-4 border border-primary-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-100">Aktivasi Produk</h1>
                    <p className="text-gray-400 mt-2 text-sm">
                        Halo <span className="text-white font-semibold">{user?.name}</span>, silakan aktivasi untuk membuka fitur penuh (Simpan, Export, dll).
                    </p>
                </div>
                
                <form onSubmit={handleActivate} className="space-y-6">
                    <div>
                        <label htmlFor="licenseKey" className="block text-sm font-medium text-gray-300 mb-2">Kunci Lisensi</label>
                        <input
                            id="licenseKey"
                            name="licenseKey"
                            type="text"
                            required
                            autoComplete="off"
                            placeholder="Contoh: VZ-2025-XXXX"
                            value={licenseKey}
                            onChange={(e) => setLicenseKey(e.target.value)}
                            disabled={isLoading || !!successMsg}
                            className="block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white font-mono text-center tracking-wider text-lg uppercase transition-all disabled:opacity-50"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-900/30 border border-red-800/50 text-red-200 text-sm p-3 rounded-lg flex items-start gap-3 animate-fade-in">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {successMsg && (
                        <div className="bg-green-900/30 border border-green-800/50 text-green-200 text-sm p-3 rounded-lg flex items-start gap-3 animate-fade-in">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{successMsg}</span>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading || !!successMsg}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-gray-800 ${
                                isLoading || !!successMsg
                                ? 'bg-gray-600 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600'
                            }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Checking...
                                </span>
                            ) : successMsg ? 'Activated' : 'Aktifkan Sekarang'}
                        </button>
                    </div>
                </form>
                
                <div className="mt-8 text-center border-t border-gray-700 pt-4">
                    <p className="text-xs text-gray-500">
                        Belum punya lisensi? <a href="http://wa.me/6282349465835" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 transition-colors font-bold">Beli Lisensi</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LicenseActivation;
