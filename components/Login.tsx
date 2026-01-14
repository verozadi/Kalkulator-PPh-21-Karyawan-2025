
import * as React from 'react';
import { loginWithGoogle, loginWithEmail } from '../services/authService';
import { User } from '../types';

interface LoginProps {
    onLoginSuccess: (user: User) => void;
    onNavigate: (page: 'register' | 'forgotPassword' | 'landing') => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigate }) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [showVerificationPopup, setShowVerificationPopup] = React.useState(false);

    // Ensure session flag is cleared when user lands on Login page
    React.useEffect(() => {
        sessionStorage.removeItem('veroz_is_registering');
    }, []);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Mohon isi email dan kata sandi.');
            return;
        }
        setError('');
        setIsLoading(true);
        
        try {
            const result = await loginWithEmail(email, password);
            if (result.success && result.user) {
                onLoginSuccess(result.user);
            } else {
                if (result.message === 'Silahkan verifikasi email anda') {
                    setShowVerificationPopup(true);
                } else {
                    setError(result.message);
                }
                setIsLoading(false);
            }
        } catch (err: any) {
            setError(err.message || 'Gagal login.');
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setIsLoading(true);
        try {
            const result = await loginWithGoogle();
            if (result.success && result.user) {
                onLoginSuccess(result.user);
            } else {
                setError(result.message);
                setIsLoading(false);
            }
        } catch (err: any) {
            setError(err.message || 'Gagal login.');
            setIsLoading(false);
        }
    };

    if (showVerificationPopup) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-2xl shadow-yellow-900/20 border border-gray-700 relative animate-fade-in-up text-center">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-900/30 mb-6 border border-yellow-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Verifikasi Email Diperlukan</h2>
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 text-left mb-6">
                        <p className="text-gray-300 text-sm leading-relaxed text-center">
                            Silahkan verifikasi email anda untuk dapat masuk ke aplikasi. Cek inbox atau spam email Anda.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowVerificationPopup(false)}
                        className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors shadow-lg"
                    >
                        OK
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
                    <p className="text-gray-400 mt-2">Masuk Akun</p>
                </div>
                
                <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                        <input 
                            id="email" 
                            type="email" 
                            required 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 placeholder-gray-500" 
                            placeholder="nama@email.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">Kata Sandi</label>
                        <input 
                            id="password" 
                            type="password" 
                            required 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 placeholder-gray-500" 
                            placeholder="••••••••"
                        />
                        <div className="flex justify-end mt-1">
                            <button type="button" onClick={() => onNavigate('forgotPassword')} className="text-xs text-primary-400 hover:text-primary-300">Lupa Kata Sandi?</button>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-400 bg-red-900/30 border border-red-800 p-3 rounded-md text-center">{error}</p>}

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
                        ) : 'Masuk'}
                    </button>
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
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-600 rounded-md shadow-sm bg-white hover:bg-gray-100 text-gray-800 font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Masuk dengan Google</span>
                </button>
                
                <p className="mt-6 text-center text-sm text-gray-400">
                    Belum punya akun?{' '}
                    <button onClick={() => onNavigate('register')} className="font-medium text-primary-400 hover:text-primary-300">
                        Daftar
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
