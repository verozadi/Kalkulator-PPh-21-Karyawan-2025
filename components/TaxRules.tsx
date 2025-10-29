

import * as React from 'react';
import { MaritalStatus } from '../types';
import { PTKP_RATES, PASAL_17_RATES, TER_RATES } from '../constants';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const ptkpDescriptions: { [key in MaritalStatus]: string } = {
    [MaritalStatus.TK0]: 'Tidak Kawin, 0 Tanggungan',
    [MaritalStatus.TK1]: 'Tidak Kawin, 1 Tanggungan',
    [MaritalStatus.TK2]: 'Tidak Kawin, 2 Tanggungan',
    [MaritalStatus.TK3]: 'Tidak Kawin, 3 Tanggungan',
    [MaritalStatus.K0]: 'Kawin, 0 Tanggungan',
    [MaritalStatus.K1]: 'Kawin, 1 Tanggungan',
    [MaritalStatus.K2]: 'Kawin, 2 Tanggungan',
    [MaritalStatus.K3]: 'Kawin, 3 Tanggungan',
};

const ptkpData = Object.entries(PTKP_RATES).map(([key, value]) => ({
    code: key as MaritalStatus,
    description: ptkpDescriptions[key as MaritalStatus],
    amount: value,
}));

const PASAL_17_DISPLAY_DATA = [
    { label: 'Sampai dengan Rp 60.000.000', rate: '5%' },
    { label: 'Di atas Rp 60.000.000 s.d. Rp 250.000.000', rate: '15%' },
    { label: 'Di atas Rp 250.000.000 s.d. Rp 500.000.000', rate: '25%' },
    { label: 'Di atas Rp 500.000.000 s.d. Rp 5.000.000.000', rate: '30%' },
    { label: 'Di atas Rp 5.000.000.000', rate: '35%' },
];

const TER_HARIAN_RATES = [
    { range: 'Penghasilan s.d. Rp 450.000', rate: '0%' },
    { range: 'Penghasilan > Rp 450.000 s.d. Rp 2.500.000', rate: '0.5%' },
    { range: 'Penghasilan > Rp 2.500.000', rate: '2.5%' },
];

const REGULATION_UPDATES = [
    {
        title: 'Perubahan Tarif PPh Pasal 21 Berdasarkan PP Nomor 58 Tahun 2023',
        regulation: 'PP No. 58 Tahun 2023',
        date: '01 Januari 2024',
        description: 'Penjelasan mengenai perubahan tarif PPh Pasal 21 dan penerapan Tarif Efektif Rata-rata (TER) bulanan yang berlaku mulai Januari 2024, sebagai dasar perhitungan PPh 21 tahun 2025.',
        link: 'https://peraturan.bpk.go.id/Download/332609/PP%20Nomor%2058%20Tahun%202023.pdf',
    },
    {
        title: 'Insentif PPh Pasal 21 Ditanggung Pemerintah (DTP) untuk Sektor Tertentu Tahun 2025',
        regulation: 'PMK No. 10 Tahun 2025',
        date: '01 Januari 2025',
        description: 'Peraturan mengenai perpanjangan dan penyesuaian insentif PPh 21 Ditanggung Pemerintah (DTP) bagi karyawan di sektor industri padat karya tertentu dengan penghasilan bruto hingga Rp10 juta per bulan untuk tahun pajak 2025.',
        link: 'https://fiskal.kemenkeu.go.id/files/peraturan/file/1752034262_pmk_10_2025.pdf',
    },
    {
        title: 'Penyesuaian Batasan Penghasilan Tidak Kena Pajak (PTKP) Tahun Pajak 2025',
        regulation: 'PMK No. 15 Tahun 2025',
        date: '01 Januari 2025',
        description: 'Informasi terbaru mengenai batasan Penghasilan Tidak Kena Pajak (PTKP) yang berlaku untuk tahun pajak 2025, termasuk penyesuaian untuk status perkawinan dan jumlah tanggungan.',
        link: 'https://peraturan.bpk.go.id/Download/375099/2025pmkeuangan015.pdf',
    },
    {
        title: 'Peraturan Pajak atas Fasilitas, Natura, dan Kenikmatan Karyawan',
        regulation: 'PMK No. 66 Tahun 2023',
        date: '01 Januari 2024',
        description: 'Penjelasan mengenai perlakuan pajak penghasilan atas penggantian atau imbalan sehubungan dengan pekerjaan atau jasa yang diterima dalam bentuk natura dan/atau kenikmatan, berlaku efektif untuk tahun pajak 2025.',
        link: 'https://peraturan.bpk.go.id/Download/310755/2023pmkeuangan066.pdf',
    }
];


const PtkpCard: React.FC<{ code: string; description: string; amount: number }> = ({ code, description, amount }) => (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
        <div>
            <span className="inline-block bg-gray-700 text-gray-300 text-xs font-semibold px-2 py-1 rounded-md mb-1">{code}</span>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
        <p className="text-md font-semibold text-cyan-400">{formatCurrency(amount)}</p>
    </div>
);

const DocumentLink: React.FC<{ href: string; icon: React.ReactNode; text: string }> = ({ href, icon, text }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-3 bg-gray-900 p-3 rounded-lg border border-gray-700 hover:bg-gray-700/50 hover:border-primary-500 transition-all"
    >
        <div className="text-primary-400">{icon}</div>
        <span className="text-sm font-medium text-gray-300">{text}</span>
    </a>
);

const RateRow: React.FC<{label: string, rate: string}> = ({ label, rate }) => (
    <div className="flex justify-between items-center bg-gray-900 p-3 rounded-md border border-gray-700/50">
        <p className="text-sm text-gray-300">{label}</p>
        <span className="bg-yellow-800 text-yellow-300 text-sm font-semibold px-3 py-1 rounded-md">{rate}</span>
    </div>
);

const InfoButton: React.FC<{ onClick: () => void, text: string}> = ({ onClick, text }) => (
    <button onClick={onClick} className="w-full text-center bg-primary-800 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{text}</span>
    </button>
);

const ModalContent: React.FC<{ type: string }> = ({ type }) => {
    const [activeTerTab, setActiveTerTab] = React.useState<'A' | 'B' | 'C'>('A');

    switch (type) {
        case 'pasal17':
            return (
                <div className="space-y-3">
                    {PASAL_17_DISPLAY_DATA.map(item => <RateRow key={item.label} {...item} />)}
                </div>
            );
        case 'terBulanan':
            return (
                <div>
                    <div className="flex border-b border-gray-600 mb-4">
                        {(['A', 'B', 'C'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTerTab(tab)}
                                className={`px-4 py-2 font-semibold text-sm focus:outline-none ${activeTerTab === tab ? 'border-b-2 border-primary-400 text-primary-300' : 'text-gray-400 hover:bg-gray-700'}`}
                            >
                                Kategori {tab}
                            </button>
                        ))}
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto pr-2">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-700 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left font-semibold text-gray-300">Penghasilan Bruto Bulanan (s.d.)</th>
                                    <th className="px-4 py-2 text-right font-semibold text-gray-300">Tarif</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800">
                                {TER_RATES[activeTerTab].map((bracket, index) => (
                                    <tr key={index} className="border-b border-gray-700">
                                        <td className="px-4 py-2 text-gray-300">{bracket.limit === Infinity ? 'Di atas batas sebelumnya' : formatCurrency(bracket.limit)}</td>
                                        <td className="px-4 py-2 text-right font-mono text-cyan-400">{`${(bracket.rate * 100).toFixed(4)}%`}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        case 'terHarian':
            return (
                <div className="space-y-3">
                    {TER_HARIAN_RATES.map(item => (
                         <div key={item.range} className="flex justify-between items-center bg-gray-900 p-3 rounded-md border border-gray-700/50">
                            <p className="text-sm text-gray-300">{item.range}</p>
                            <span className="bg-yellow-800 text-yellow-300 text-sm font-semibold px-3 py-1 rounded-md">{item.rate}</span>
                        </div>
                    ))}
                </div>
            );
        default: return null;
    }
};


const TaxInfoModal: React.FC<{ modalType: string | null; onClose: () => void; }> = ({ modalType, onClose }) => {
    if (!modalType) return null;

    const titles: { [key: string]: string } = {
        'pasal17': 'Tarif Umum PPh Pasal 21',
        'terBulanan': 'Tarif Efektif Rata-rata (TER) Bulanan',
        'terHarian': 'Tarif Efektif Rata-rata (TER) Harian',
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-lg font-bold text-gray-100">{titles[modalType]}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <ModalContent type={modalType} />
                </div>
                 <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-lg">
                    <button onClick={onClose} className="w-full sm:w-auto float-right px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Tutup</button>
                </div>
            </div>
        </div>
    );
};


const TaxRules: React.FC = () => {
    const [modalType, setModalType] = React.useState<string | null>(null);

    return (
        <>
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
                {/* Header */}
                <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center space-x-3">
                        <ShieldCheckIcon />
                        <h1 className="text-3xl font-bold text-gray-100">Aturan & Update Pajak</h1>
                    </div>
                    <p className="text-gray-400 mt-1">Regulasi terbaru PPh 21 Indonesia 2025</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* PTKP Card */}
                        <div className="bg-gray-800 p-6 rounded-lg shadow-xl shadow-black/20 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            <div className="flex items-center space-x-3 mb-4">
                                <BookOpenIcon />
                                <h2 className="text-xl font-bold text-primary-400">Penghasilan Tidak Kena Pajak (PTKP) 2025</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {ptkpData.map(item => (
                                    <PtkpCard key={item.code} {...item} />
                                ))}
                            </div>
                        </div>
                        {/* Progressive Tax Card */}
                        <div className="bg-gray-800 p-6 rounded-lg shadow-xl shadow-black/20 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                            <div className="flex items-center space-x-3 mb-4">
                                <DocumentTextIconGold />
                                <h2 className="text-xl font-bold text-gray-100">Tarif Progresif PPh 21 Pasal 17 Ayat (1)</h2>
                            </div>
                            <div className="space-y-3">
                                {PASAL_17_DISPLAY_DATA.map(item => <RateRow key={item.label} {...item} />)}
                            </div>
                            <div className="mt-4 p-3 bg-blue-900/50 rounded-lg text-sm text-blue-300 border border-blue-800">
                                <span className="font-bold text-blue-200">Catatan:</span> Tarif progresif berlaku untuk perhitungan PPh 21 pada masa pajak terakhir (Desember). Untuk masa pajak Januari-November menggunakan Tarif Efektif Rata-rata (TER) bulanan.
                            </div>
                        </div>
                         {/* DTP Incentive Card */}
                        <div className="bg-gray-800 p-6 rounded-lg shadow-xl shadow-black/20 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                             <div className="flex items-center space-x-3 mb-4">
                                <ShieldExclamationIcon />
                                <h2 className="text-xl font-bold text-gray-100">Insentif PPh 21 Ditanggung Pemerintah (DTP)</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-red-900/40 border border-red-700/50 rounded-lg">
                                    <h3 className="font-bold text-red-300 mb-2">Syarat dan Ketentuan DTP:</h3>
                                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                                        <li>Penghasilan bruto &le; Rp 10.000.000 per bulan</li>
                                        <li>Bekerja di sektor industri padat karya tertentu</li>
                                        <li>Industri alas kaki, tekstil/pakaian jadi, furnitur</li>
                                        <li>Industri kulit dan barang dari kulit</li>
                                        <li>Berlaku sesuai Peraturan Menteri Keuangan No. 10 Tahun 2025</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-green-900/40 border border-green-700/50 rounded-lg">
                                    <h3 className="font-bold text-green-300 mb-2">Implementasi:</h3>
                                    <p className="text-sm text-gray-300">
                                        Jika karyawan memenuhi syarat DTP, maka PPh 21 yang terutang akan ditanggung oleh pemerintah dan tidak dipotong dari gaji karyawan.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div className="bg-gray-800 p-6 rounded-lg shadow-xl shadow-black/20 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                            <h3 className="text-lg font-bold text-gray-200 mb-4">Referensi Cepat</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                    <span className="text-gray-400">PTKP Minimum:</span>
                                    <span className="font-semibold text-cyan-400">{formatCurrency(54000000)}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                    <span className="text-gray-400">Tarif Minimum:</span>
                                    <span className="font-semibold text-cyan-400">5%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Batas DTP:</span>
                                    <span className="font-semibold text-cyan-400">{formatCurrency(10000000)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg shadow-xl shadow-black/20 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                            <h3 className="text-lg font-bold text-gray-200 mb-4">Dokumen Penting</h3>
                            <div className="space-y-3">
                            <DocumentLink href="https://bphn.go.id/data/documents/07pp081.pdf" icon={<DocumentTextIcon />} text="UU PPh Pasal 17" />
                            <DocumentLink href="https://jdih.kemenkeu.go.id/dok/pmk-10-tahun-2025" icon={<DownloadIcon />} text="PMK No. 10/2025" />
                            <DocumentLink href="https://coretaxdjp.pajak.go.id/" icon={<ExternalLinkIcon />} text="Portal Pajak" />
                            </div>
                        </div>
                         <div className="bg-green-900/40 p-6 rounded-lg shadow-lg border border-green-700/50 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
                            <h3 className="text-lg font-bold text-white mb-2">Butuh Bantuan?</h3>
                            <p className="text-sm text-gray-300 mb-4">
                                Hubungi tim support untuk konsultasi perhitungan PPh 21 atau interpretasi regulasi terbaru.
                            </p>
                            <button className="w-full bg-cyan-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-cyan-400 transition-colors">
                                Hubungi Support
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-xl shadow-black/20 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                    <h3 className="text-xl font-bold text-gray-100 mb-4 text-center">Detail Tarif Pajak 2025</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InfoButton onClick={() => setModalType('pasal17')} text="Tarif Umum PPh Pasal 21" />
                        <InfoButton onClick={() => setModalType('terBulanan')} text="Tarif Efektif Bulanan (TER)" />
                        <InfoButton onClick={() => setModalType('terHarian')} text="Tarif Efektif Harian (TER)" />
                    </div>
                </div>

                {/* Latest Regulations Section */}
                <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                     <div className="flex items-center space-x-3 mb-6">
                        <NewspaperIcon />
                        <h2 className="text-2xl font-bold text-gray-100">Update Regulasi Terbaru</h2>
                    </div>
                    <div className="space-y-4">
                        {REGULATION_UPDATES.map((update, index) => (
                            <div key={index} className="bg-gray-800 p-5 rounded-lg border border-gray-700 hover:border-primary-500/50 transition-all">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                                    <div>
                                        <h3 className="font-bold text-primary-400">{update.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{update.regulation}</p>
                                    </div>
                                    <div className="flex-shrink-0 flex items-center space-x-2 text-sm text-gray-400 bg-gray-700/50 px-2 py-1 rounded-md">
                                        <CalendarIcon />
                                        <span>{update.date}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-300 mt-3 mb-4">{update.description}</p>
                                <a href={update.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-sm font-semibold text-accent-400 hover:text-accent-300">
                                    <LinkIcon />
                                    <span>Lihat Dokumen Resmi</span>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <TaxInfoModal modalType={modalType} onClose={() => setModalType(null)} />
        </>
    );
};

// SVG Icons
const ShieldCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const DocumentTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const DocumentTextIconGold = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const ExternalLinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>;
const ShieldExclamationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const NewspaperIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6M7 8h6" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;

export default TaxRules;