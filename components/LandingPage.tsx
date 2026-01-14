
import * as React from 'react';

type AuthPage = 'login' | 'register' | 'forgotPassword' | 'landing';

interface LandingPageProps {
    onNavigate: (page: AuthPage) => void;
}

const modalContentData = {
  about: {
    title: 'Tentang Kami',
    content: (
      <div className="space-y-4">
        <p>Kalkulator PPh 21 TER 2025 adalah solusi modern untuk pengelolaan pajak dan penggajian karyawan. Kami berdedikasi untuk menyediakan alat yang akurat, aman, dan mudah digunakan bagi pemilik bisnis dan profesional HR di Indonesia.</p>
        <p>Aplikasi ini terus dikembangkan untuk mematuhi regulasi terbaru, termasuk integrasi dengan sistem CoreTax DJP dan perhitungan lembur sesuai standar Depnaker.</p>
      </div>
    ),
  },
  privacy: {
    title: 'Kebijakan Privasi',
    content: (
       <div className="space-y-4">
        <h3 className="font-bold text-lg text-primary-400 mb-2">Keamanan & Privasi Data Anda Prioritas Kami</h3>
        <ul className="list-decimal list-outside space-y-3 pl-4">
            <li>
                <strong>Penyimpanan Data Terenkripsi:</strong> Berbeda dengan aplikasi konvensional, aplikasi ini menggunakan infrastruktur Google Cloud Firestore (Firebase) yang berstandar keamanan internasional. Data karyawan dan finansial Anda disimpan secara terpusat di server cloud yang aman, bukan di perangkat lokal yang rawan hilang.
            </li>
            <li>
                <strong>Akses & Otentikasi:</strong> Kami menerapkan sistem otentikasi ketat. Hanya pengguna terdaftar dengan kredensial yang valid yang dapat mengakses database perusahaan Anda. Kami tidak menjual, menyewakan, atau membagikan data Anda kepada pihak ketiga mana pun.
            </li>
            <li>
                <strong>Penggunaan Data:</strong> Data yang Anda input hanya digunakan untuk keperluan perhitungan pajak, penggajian, dan pembuatan laporan di dalam aplikasi. Kami tidak memproses data tersebut untuk kepentingan di luar fungsionalitas aplikasi.
            </li>
        </ul>
      </div>
    ),
  },
  terms: {
    title: 'Syarat & Ketentuan',
    content: (
       <div className="space-y-4">
        <p>Ketentuan Penggunaan Layanan:</p>
        <ul className="list-disc list-outside space-y-2 pl-4">
            <li><strong>Alat Bantu Hitung:</strong> Aplikasi ini dirancang sebagai alat bantu (tools) untuk mempermudah perhitungan PPh 21 dan Lembur. Pengguna tetap bertanggung jawab untuk memverifikasi hasil akhir sebelum melakukan pembayaran atau pelaporan resmi.</li>
            <li><strong>Fitur CoreTax:</strong> Fitur ekspor XML disediakan untuk mempermudah pelaporan ke sistem Coretax DJP. Pastikan untuk selalu memeriksa validitas data sebelum diunggah ke portal resmi DJP.</li>
            <li><strong>Kepatuhan Regulasi:</strong> Perhitungan lembur dan pajak didasarkan pada regulasi yang berlaku (UU Ketenagakerjaan & HPP). Perubahan peraturan pemerintah di masa depan mungkin memerlukan pembaruan pada aplikasi.</li>
            <li><strong>Keamanan Akun:</strong> Pengguna bertanggung jawab menjaga kerahasiaan password akun. Kami menyarankan penggantian password secara berkala melalui menu Pengaturan.</li>
        </ul>
      </div>
    ),
  },
  faq: {
    title: 'Bantuan / FAQ',
    content: (
       <div className="space-y-4">
            <div>
                <p className="font-semibold text-gray-200">T: Apakah hasil perhitungan bisa langsung dilapor ke DJP?</p>
                <p>J: Ya! Aplikasi ini memiliki fitur Ekspor XML CoreTax. Anda tinggal unduh file XML dari aplikasi, lalu impor langsung ke portal Coretax DJP tanpa perlu input manual satu per satu.</p>
            </div>
             <div>
                <p className="font-semibold text-gray-200">T: Bagaimana cara aplikasi menghitung lembur?</p>
                <p>J: Perhitungan lembur mengikuti standar Kepmenaker No. 102 Tahun 2004 dan peraturan turunannya. Sistem otomatis menghitung tarif 1.5x untuk jam pertama dan 2x untuk jam berikutnya sesuai tipe hari (kerja/libur).</p>
            </div>
             <div>
                <p className="font-semibold text-gray-200">T: Apakah data saya aman jika komputer rusak?</p>
                <p>J: Sangat aman. Karena kami menggunakan teknologi Cloud (Firebase), data Anda tersimpan di server internet yang aman. Jika komputer Anda rusak atau ganti perangkat, Anda cukup Login kembali dan data akan muncul seketika.</p>
            </div>
             <div>
                <p className="font-semibold text-gray-200">T: Apakah bisa mencetak Slip Gaji?</p>
                <p>J: Bisa. Setelah perhitungan selesai, Anda dapat mengunduh Slip Gaji (Payslip) untuk setiap karyawan yang mencakup rincian Gaji Pokok, Tunjangan, Potongan PPh 21, dan Upah Lembur.</p>
            </div>
       </div>
    ),
  },
  contact: {
    title: 'Kontak',
    content: (
      <div className="space-y-4">
        <p>Jika Anda menemukan bug (kesalahan hitung), memiliki saran fitur, atau ingin memberikan masukan, jangan ragu untuk menghubungi pengembang:</p>
        <div className="text-left">
            <p><strong className="text-gray-200">Nama Pembuat:</strong> VerozAdi</p>
            <p><strong className="text-gray-200">Email:</strong> supriadiimran1@gmail.com</p>
        </div>
      </div>
    ),
  },
};

type ModalContentKey = keyof typeof modalContentData;


// Info Modal Component
const InfoModal: React.FC<{ contentKey: ModalContentKey; onClose: () => void }> = ({ contentKey, onClose }) => {
    const { title, content } = modalContentData[contentKey];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-lg font-bold text-gray-100">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto text-gray-300 text-sm leading-relaxed">
                    {content}
                </div>
                <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-lg text-right">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Tutup</button>
                </div>
            </div>
        </div>
    );
};


// Custom hook for scroll animations
const useAnimateOnScroll = (options?: IntersectionObserverInit) => {
    const ref = React.useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                if (ref.current) {
                    observer.unobserve(ref.current);
                }
            }
        }, options);

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                observer.unobserve(ref.current);
            }
        };
    }, [options]);

    return [ref, isVisible] as const;
};


// Landing Header
const LandingHeader: React.FC<LandingPageProps> = ({ onNavigate }) => (
    <header className="absolute top-0 left-0 right-0 z-10 py-4 px-4 sm:px-6 lg:px-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
                <svg className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-6 4h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" /></svg>
                <div>
                    <h1 className="text-xl font-bold text-white">VerozTax</h1>
                    <p className="text-xs text-gray-400">Payroll & PPh 21 CoreTax</p>
                </div>
            </div>
            <div className="space-x-2">
                <button onClick={() => onNavigate('login')} className="px-4 py-2 text-sm font-semibold text-white rounded-md hover:bg-white/10 transition-colors">
                    Login
                </button>
                <button onClick={() => onNavigate('register')} className="px-4 py-2 text-sm font-semibold bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                    Daftar
                </button>
            </div>
        </div>
    </header>
);

// Feature Card
const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string, style?: React.CSSProperties }> = ({ icon, title, description, style }) => (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-primary-500 hover:bg-gray-700/50 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col items-center text-center" style={style}>
        <div className="mb-4 text-accent-400 bg-gray-900/50 p-3 rounded-full border border-gray-700">{icon}</div>
        <h3 className="text-lg font-bold text-gray-100 mb-2">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
    </div>
);

// Landing Footer
const LandingFooter: React.FC<{ onOpenModal: (key: ModalContentKey) => void }> = ({ onOpenModal }) => {
    const [footerRef, isFooterVisible] = useAnimateOnScroll({ threshold: 0.1 });

    return (
        <footer ref={footerRef} className={`py-12 px-4 sm:px-6 lg:px-8 bg-gray-800 border-t border-gray-700 scroll-animate ${isFooterVisible ? 'visible' : ''}`}>
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                <div>
                    <h3 className="font-bold text-lg text-white mb-3">VerozTax PPh 21</h3>
                    <p className="text-sm text-gray-400">Solusi perpajakan dan penggajian modern berbasis Cloud, siap untuk regulasi TER 2025 dan CoreTax.</p>
                </div>
                <div>
                    <h3 className="font-bold text-lg text-white mb-3">Tautan Penting</h3>
                    <ul className="space-y-2 text-sm">
                        <li><button onClick={() => onOpenModal('about')} className="text-gray-400 hover:text-primary-300 transition-colors">Tentang Kami</button></li>
                        <li><button onClick={() => onOpenModal('privacy')} className="text-gray-400 hover:text-primary-300 transition-colors">Kebijakan Privasi</button></li>
                        <li><button onClick={() => onOpenModal('terms')} className="text-gray-400 hover:text-primary-300 transition-colors">Syarat & Ketentuan</button></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold text-lg text-white mb-3">Bantuan</h3>
                    <ul className="space-y-2 text-sm">
                         <li><button onClick={() => onOpenModal('faq')} className="text-gray-400 hover:text-primary-300 transition-colors">FAQ</button></li>
                         <li><button onClick={() => onOpenModal('contact')} className="text-gray-400 hover:text-primary-300 transition-colors">Kontak</button></li>
                    </ul>
                </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} VerozTax. All rights reserved.</p>
            </div>
        </footer>
    );
};

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
    const [modalContentKey, setModalContentKey] = React.useState<ModalContentKey | null>(null);
    const [featuresRef, areFeaturesVisible] = useAnimateOnScroll({ threshold: 0.1 });

    const handleOpenModal = (key: ModalContentKey) => {
        setModalContentKey(key);
    };

    const handleCloseModal = () => {
        setModalContentKey(null);
    };

    return (
        <div className="bg-gray-900 text-gray-300 min-h-screen">
            <LandingHeader onNavigate={onNavigate} />
            <main>
                {/* Hero Section */}
                <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
                    <div className="absolute inset-0 bg-gray-900 opacity-60 z-0"></div>
                     <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-transparent to-gray-900 z-0"></div>
                    <div className="relative z-10 p-4 max-w-4xl mx-auto">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white animate-fade-in-up tracking-tight" style={{ animationDelay: '0.2s' }}>
                            Solusi Pajak & Payroll Terpadu untuk Bisnis Modern
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300 animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.4s' }}>
                           Hemat waktu dengan perhitungan otomatis, akurat sesuai regulasi, dan siap lapor CoreTax.
                        </p>
                        <div className="mt-10 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                            <button onClick={() => onNavigate('register')} className="bg-primary-600 text-white font-bold py-3.5 px-8 rounded-lg hover:bg-primary-700 transition-all text-lg shadow-lg shadow-primary-900/50 hover:-translate-y-1">
                                Mulai Sekarang
                            </button>
                        </div>
                    </div>
                </section>
                
                {/* Features Section */}
                <section ref={featuresRef} id="features" className={`py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 scroll-animate ${areFeaturesVisible ? 'visible' : ''}`}>
                    <div className="container mx-auto text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">Fitur Unggulan</h2>
                        <p className="text-gray-400 mb-12 max-w-2xl mx-auto">Platform lengkap untuk mengelola kewajiban pajak dan penggajian perusahaan Anda.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
                            <FeatureCard 
                                icon={<CalculatorIcon />} 
                                title="Perhitungan PPh 21 Terlengkap" 
                                description="Menghitung otomatis PPh 21 Bulanan (TER), Tahunan (A1), hingga Final dengan akurasi tinggi sesuai peraturan pajak terbaru 2025." 
                                style={{'--stagger-delay': '0.1s'} as React.CSSProperties}
                            />
                            <FeatureCard 
                                icon={<UsersIcon />} 
                                title="Manajemen Karyawan & Lembur" 
                                description="Kelola database karyawan terpusat dan hitung upah lembur otomatis sesuai rumus Depnaker. Hasilkan slip gaji transparan." 
                                style={{'--stagger-delay': '0.2s'} as React.CSSProperties}
                            />
                            <FeatureCard 
                                icon={<CodeIcon />} 
                                title="Integrasi Ekspor XML CoreTax" 
                                description="Tidak perlu input manual. Ekspor hasil perhitungan langsung ke format XML yang kompatibel dengan sistem Coretax DJP."
                                style={{'--stagger-delay': '0.3s'} as React.CSSProperties}
                            />
                            <FeatureCard 
                                icon={<CloudIcon />} 
                                title="Database Aman Berbasis Cloud" 
                                description="Data tersimpan aman di server Google Cloud. Akses data dari mana saja dan kapan saja tanpa takut data hilang di komputer lokal."
                                style={{'--stagger-delay': '0.4s'} as React.CSSProperties}
                            />
                        </div>
                    </div>
                </section>
            </main>
            <LandingFooter onOpenModal={handleOpenModal} />
            {modalContentKey && <InfoModal contentKey={modalContentKey} onClose={handleCloseModal} />}
        </div>
    );
};

// Icons for Features
const CalculatorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-6 4h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>;
const CodeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
const CloudIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>;

export default LandingPage;
