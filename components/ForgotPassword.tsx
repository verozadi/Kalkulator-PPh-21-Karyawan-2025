
import * as React from 'react';

interface ForgotPasswordProps {
    onNavigate: (page: 'login' | 'landing') => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
    const [email, setEmail] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        // Simulate API call
        setTimeout(() => {
            setMessage(`Jika ada akun yang terdaftar dengan email ${email}, instruksi untuk mereset kata sandi telah dikirim.`);
            setIsLoading(false);
        }, 1500);
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
                </div>

                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-100 mb-2">Lupa Kata Sandi</h2>
                    <p className="text-sm text-gray-400 mb-6">Masukkan email Anda untuk mereset kata sandi.</p>
                </div>
                
                {message ? (
                    <div className="text-center">
                        <p className="text-green-300 bg-green-900/50 p-4 rounded-md">{message}</p>
                        <button onClick={() => onNavigate('login')} className="mt-6 font-medium text-primary-400 hover:text-primary-300">
                            Kembali ke Login
                        </button>
                    </div>
                ) : (
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
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-500"
                            >
                                {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                            </button>
                        </div>
                    </form>
                )}
                
                {!message && (
                    <p className="mt-6 text-center text-sm text-gray-400">
                        Ingat kata sandi Anda?{' '}
                        <button onClick={() => onNavigate('login')} className="font-medium text-accent-400 hover:text-accent-300">
                            Login
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
