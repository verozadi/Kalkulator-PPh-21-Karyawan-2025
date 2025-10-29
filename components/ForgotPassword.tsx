
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
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
             <div className="text-center mb-8">
                <button type="button" onClick={() => onNavigate('landing')} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-primary-500 rounded-lg">
                    <h1 className="text-4xl font-bold text-primary-400">VerozTax</h1>
                </button>
            </div>
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-xl shadow-black/20 border border-gray-700">
                <h2 className="text-2xl font-bold text-center text-gray-100 mb-2">Lupa Kata Sandi</h2>
                <p className="text-sm text-center text-gray-400 mb-6">Masukkan email Anda untuk mereset kata sandi.</p>
                
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
