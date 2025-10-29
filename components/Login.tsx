
import * as React from 'react';
import { login } from '../services/authService';
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate network delay
        setTimeout(() => {
            const result = login(email, password);
            if (result.success && result.user) {
                onLoginSuccess(result.user);
            } else {
                setError(result.message);
            }
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
             <div className="text-center mb-8">
                <button type="button" onClick={() => onNavigate('landing')} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-primary-500 rounded-lg">
                    <h1 className="text-4xl font-bold text-primary-400">VerozTax</h1>
                </button>
                <p className="text-gray-400 mt-2">Silakan masuk untuk melanjutkan</p>
            </div>
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-xl shadow-black/20 border border-gray-700">
                <h2 className="text-2xl font-bold text-center text-gray-100 mb-6">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-gray-300">Kata Sandi</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-white"
                        />
                    </div>

                    {error && <p className="text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <button type="button" onClick={() => onNavigate('forgotPassword')} className="font-medium text-primary-400 hover:text-primary-300">
                                Lupa kata sandi?
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-500 disabled:cursor-wait"
                        >
                            {isLoading ? 'Memproses...' : 'Masuk'}
                        </button>
                    </div>
                </form>
                <p className="mt-6 text-center text-sm text-gray-400">
                    Belum punya akun?{' '}
                    <button onClick={() => onNavigate('register')} className="font-medium text-accent-400 hover:text-accent-300">
                        Daftar sekarang
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
