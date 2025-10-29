

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
        <p>Kalkulator PPh 21 TER 2025 adalah alat bantu sederhana yang dirancang untuk membantu Karyawan dan praktisi HR menghitung estimasi Pajak Penghasilan Pasal 21 bulanan.</p>
        <p>Aplikasi ini menggunakan metode Tarif Efektif Rata-rata (TER) terbaru sesuai Peraturan Pemerintah yang berlaku di Indonesia. Tujuan kami adalah menyediakan alat perhitungan yang cepat, mudah diakses, dan mudah dipahami untuk memberikan gambaran potongan pajak bulanan Anda.</p>
      </div>
    ),
  },
  privacy: {
    title: 'Kebijakan Privasi',
    content: (
       <div className="space-y-4">
        <p>Kami sangat menghargai privasi dan keamanan data finansial Anda.</p>
        <p>Aplikasi Kalkulator PPh 21 ini beroperasi sepenuhnya di sisi klien (client-side). Artinya, semua data yang Anda masukkan (seperti Gaji Bruto, status PTKP, dll.) diproses secara lokal hanya di browser Anda.</p>
        <p>Kami TIDAK menyimpan, TIDAK mengirim, dan TIDAK membagikan data perhitungan pribadi atau keuangan Anda ke server kami atau pihak ketiga mana pun. Saat Anda menutup halaman ini, data yang Anda masukkan akan hilang.</p>
      </div>
    ),
  },
  terms: {
    title: 'Syarat & Ketentuan',
    content: (
       <div className="space-y-4">
        <p>Dengan menggunakan aplikasi Kalkulator PPh 21 TER 2025 ini, Anda memahami dan menyetujui ketentuan berikut:</p>
        <ul className="list-disc list-inside space-y-2 pl-4">
            <li><strong>Hanya Estimasi:</strong> Aplikasi ini adalah alat simulasi dan hanya ditujukan untuk tujuan estimasi dan edukasi.</li>
            <li><strong>Bukan Nasihat Pajak:</strong> Hasil perhitungan dari aplikasi ini BUKAN merupakan nasihat keuangan atau pajak resmi.</li>
            <li><strong>Akurasi Data:</strong> Kami tidak menjamin akurasi 100% yang sesuai dengan perhitungan resmi perusahaan Anda (HR/Payroll) atau Direktorat Jenderal Pajak (DJP), karena mungkin ada variabel lain (seperti bonus, tunjangan natura, dll) yang tidak tercakup.</li>
            <li><strong>Verifikasi Wajib:</strong> Pengguna bertanggung jawab penuh untuk memverifikasi dan mengonfirmasi hasil perhitungan dengan departemen HR atau konsultan pajak resmi sebelum mengambil keputusan finansial.</li>
            <li><strong>Batasan Tanggung Jawab:</strong> Pengembang tidak bertanggung jawab atas kerugian, selisih perhitungan, atau masalah apa pun yang mungkin timbul dari penggunaan atau ketergantungan pada informasi yang disediakan oleh aplikasi ini.</li>
        </ul>
      </div>
    ),
  },
  faq: {
    title: 'Bantuan / FAQ',
    content: (
       <div className="space-y-4">
            <div>
                <p className="font-semibold text-gray-200">T: Apa itu Tarif TER?</p>
                <p>J: TER (Tarif Efektif Rata-rata) adalah skema perhitungan PPh 21 yang lebih sederhana untuk masa pajak Januari hingga November. Tarif persentase ini sudah memperhitungkan Penghasilan Tidak Kena Pajak (PTKP).</p>
            </div>
             <div>
                <p className="font-semibold text-gray-200">T: Apa yang dimaksud 'Penghasilan Bruto' di kalkulator ini?</p>
                <p>J: Masukkan seluruh penghasilan kotor Anda dalam satu bulan, termasuk gaji pokok, semua tunjangan (tetap/tidak tetap), uang lembur, dan bonus (jika ada di bulan tersebut).</p>
            </div>
             <div>
                <p className="font-semibold text-gray-200">T: Mengapa perhitungan Desember berbeda?</p>
                <p>J: Sesuai peraturan, Tarif TER hanya berlaku untuk bulan Januari hingga November. Pada bulan Desember, perusahaan akan melakukan perhitungan ulang PPh 21 setahun penuh menggunakan tarif Pasal 17 (metode lama) dan memperhitungkan total pajak yang sudah dibayar dari Jan-Nov.</p>
            </div>
             <div>
                <p className="font-semibold text-gray-200">T: Apakah hasil perhitungan ini sudah pasti akurat?</p>
                <p>J: Hasil ini adalah estimasi yang baik. Namun, perhitungan resmi payroll perusahaan mungkin jauh lebih kompleks. Selalu gunakan angka ini sebagai referensi dan konfirmasi ke HR Anda untuk angka pastinya.</p>
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
                <div className="p-6 overflow-y-auto text-gray-300">
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
                    <p className="text-xs text-gray-400">PPH 21 Calculator Indonesia 2025</p>
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
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-primary-500 hover:bg-gray-700/50 transition-all duration-300 transform hover:-translate-y-1" style={style}>
        <div className="mb-4 text-accent-400">{icon}</div>
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
                    <p className="text-sm text-gray-400">Kalkulator PPh 21 dengan Tarif Efektif Rata-rata (TER) terbaru untuk tahun 2025.</p>
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
                    <div className="relative z-10 p-4">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            Perhitungan PPh 21 Menjadi Lebih Mudah
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                           Gunakan aplikasi kami untuk mengelola, menghitung, dan melaporkan PPh 21 karyawan Anda dengan cepat dan akurat sesuai regulasi TER 2025.
                        </p>
                        <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                            <button onClick={() => onNavigate('register')} className="bg-primary-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-700 transition-colors text-lg shadow-lg shadow-primary-900/50">
                                Mulai Gratis
                            </button>
                        </div>
                    </div>
                </section>
                
                {/* Features Section */}
                <section ref={featuresRef} id="features" className={`py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 scroll-animate ${areFeaturesVisible ? 'visible' : ''}`}>
                    <div className="container mx-auto text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">Fitur Unggulan</h2>
                        <p className="text-gray-400 mb-12 max-w-2xl mx-auto">Dirancang untuk efisiensi dan kemudahan penggunaan bagi para profesional HR dan pemilik bisnis.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
                            <FeatureCard 
                                icon={<CalculatorIcon />} 
                                title="Perhitungan Cepat & Akurat" 
                                description="Hitung PPh 21 bulanan secara instan menggunakan metode TER terbaru, termasuk perhitungan lembur dan bonus." 
                                style={{'--stagger-delay': '0.1s'} as React.CSSProperties}
                            />
                            <FeatureCard 
                                icon={<UsersIcon />} 
                                title="Manajemen Data Karyawan" 
                                description="Kelola data master karyawan, termasuk informasi pribadi, status PTKP, dan riwayat gaji." 
                                style={{'--stagger-delay': '0.2s'} as React.CSSProperties}
                            />
                            <FeatureCard 
                                icon={<DocumentReportIcon />} 
                                title="Laporan & Ekspor Data" 
                                description="Buat laporan PPh 21 bulanan dan ekspor data dalam format Excel (.xlsx) atau XML untuk e-SPT."
                                style={{'--stagger-delay': '0.3s'} as React.CSSProperties}
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
const DocumentReportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

export default LandingPage;