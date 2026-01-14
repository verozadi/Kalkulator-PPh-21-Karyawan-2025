
import * as React from 'react';
import { register, loginWithGoogle } from '../services/authService';
import { User } from '../types';

interface RegisterProps {
    onRegisterSuccess: (user: User) => void;
    onNavigate: (page: 'login' | 'landing') => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onNavigate }) => {
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false); // New state for success view

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError('Kata sandi minimal harus 6 karakter.');
            return;
        }
        setError('');
        setIsLoading(true);

        try {
            const result = await register(name, email, password);
            if (result.success) {
                // Show Success View instead of Alert
                setIsSuccess(true);
            } else {
                setError(result.message);
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan saat mendaftar.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setError('');
        setIsLoading(true);
        try {
            const result = await loginWithGoogle();
            if (result.success && result.user) {
                onRegisterSuccess(result.user);
            } else {
                setError(result.message);
                setIsLoading(false);
            }
        } catch (err: any) {
            setError(err.message || 'Gagal mendaftar dengan Google.');
            setIsLoading(false);
        }
    };

    // Render Success View if registration successful
    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-2xl shadow-green-900/20 border border-gray-700 relative animate-fade-in-up text-center">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-900/30 mb-6 border border-green-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Akun berhasil dibuat!</h2>
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 text-left mb-6">
                        <p className="text-gray-300 text-sm leading-relaxed mb-2">
                            Silakan cek email Anda (<strong>{email}</strong>) untuk verifikasi sebelum login.
                        </p>
                        <p className="text-yellow-400 text-xs font-semibold">
                            ⚠ Cek di folder SPAM jika tidak ada di kotak masuk.
                        </p>
                    </div>
                    <button
                        onClick={() => onNavigate('login')}
                        className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors shadow-lg"
                    >
                        Kembali ke Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm animate-fade-in">
             <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-2xl shadow-black/50 border border-gray-700 relative animate-fade-in-up">
                <button 
                    onClick={() => onNavigate('landing')}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none"
                    aria-label="Tutup"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-primary-400">VerozTax</h1>
                    <p className="text-gray-400 mt-2">Buat akun baru Anda</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nama</label>
                        <input 
                            id="name" 
                            type="text" 
                            required 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 placeholder-gray-500" 
                            placeholder="Nama Lengkap" 
                        />
                    </div>
                    <div>
                        <label htmlFor="email-register" className="block text-sm font-medium text-gray-300">Email</label>
                        <input 
                            id="email-register" 
                            type="email" 
                            required 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 placeholder-gray-500" 
                            placeholder="nama@email.com" 
                        />
                    </div>
                    <div>
                        <label htmlFor="password-register" className="block text-sm font-medium text-gray-300">Kata Sandi</label>
                        <input 
                            id="password-register" 
                            type="password" 
                            required 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 placeholder-gray-500" 
                            placeholder="Minimal 6 karakter" 
                        />
                    </div>
                    
                    {error && <p className="text-sm text-red-400 bg-red-900/30 border border-red-800 p-3 rounded-md text-center">{error}</p>}

                    <div>
                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Memproses...
                                </span>
                            ) : 'Daftar'}
                        </button>
                    </div>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-800 text-gray-400">--- atau ---</span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleRegister}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-600 rounded-md shadow-sm bg-white hover:bg-gray-100 text-gray-800 font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Daftar dengan Google</span>
                </button>

                 <p className="mt-6 text-center text-sm text-gray-400">
                    Sudah punya akun?{' '}
                    <button onClick={() => onNavigate('login')} className="font-medium text-primary-400 hover:text-primary-300">
                        Masuk di sini
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Register;
