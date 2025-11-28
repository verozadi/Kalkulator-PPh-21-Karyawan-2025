
import * as React from 'react';
import { register } from '../services/authService';
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError('Kata sandi minimal harus 6 karakter.');
            return;
        }
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            const result = register(name, email, password);
            if (result.success && result.user) {
                onRegisterSuccess(result.user);
            } else {
                setError(result.message);
            }
            setIsLoading(false);
        }, 1000);
    };

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

                <h2 className="text-xl font-bold text-center text-gray-100 mb-6 border-b border-gray-700 pb-2">Daftar</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nama</label>
                        <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                        <label htmlFor="email-register" className="block text-sm font-medium text-gray-300">Email</label>
                        <input id="email-register" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                        <label htmlFor="password-register" className="block text-sm font-medium text-gray-300">Kata Sandi</label>
                        <input id="password-register" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    
                    {error && <p className="text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}

                    <div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:bg-gray-500">
                            {isLoading ? 'Mendaftar...' : 'Daftar'}
                        </button>
                    </div>
                </form>
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
