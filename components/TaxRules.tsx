
import React from 'react';

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl shadow-black/20 mb-6">
        <h3 className="text-xl font-bold text-primary-400 mb-3">{title}</h3>
        <div className="prose prose-slate max-w-none text-gray-300 prose-strong:text-gray-200 prose-ul:text-gray-300">
            {children}
        </div>
    </div>
);

const TaxRules: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-primary-400">Aturan & Update Pajak PPh 21 (2025)</h2>

      <InfoCard title="Skema Perhitungan Baru: Tarif Efektif Rata-rata (TER)">
        <p>Sesuai Peraturan Pemerintah Nomor 58 Tahun 2023, perhitungan PPh 21 untuk masa pajak Januari hingga November menggunakan skema Tarif Efektif Rata-rata (TER) bulanan. Skema ini menyederhanakan perhitungan pajak bulanan.</p>
        <ul>
            <li><strong>Masa Pajak Januari - November:</strong> PPh 21 dihitung dengan mengalikan Penghasilan Bruto sebulan dengan tarif TER yang sesuai.</li>
            <li><strong>Masa Pajak Terakhir (Desember):</strong> PPh 21 dihitung ulang menggunakan tarif progresif Pasal 17 ayat (1) UU PPh atas total penghasilan setahun, lalu dikurangi total pajak yang sudah dibayar dari Januari-November. Ini memastikan total pajak setahun tetap akurat.</li>
        </ul>
        <p>Tarif TER ditentukan berdasarkan kategori PTKP (Penghasilan Tidak Kena Pajak) dan rentang penghasilan bruto bulanan.</p>
      </InfoCard>

      <InfoCard title="Insentif PPh 21 Ditanggung Pemerintah (DTP)">
        <p>Berdasarkan regulasi terbaru (contoh: PMK No. 10/2025), pemerintah memberikan insentif PPh 21 DTP untuk sektor industri padat karya tertentu, seperti industri alas kaki, tekstil, furnitur, dan lainnya.</p>
        <p><strong>Syarat Utama:</strong></p>
        <ul>
            <li>Karyawan bekerja pada perusahaan yang termasuk dalam daftar sektor penerima insentif.</li>
            <li>Memiliki NPWP.</li>
            <li>Penghasilan bruto bulanan <strong>tidak melebihi Rp 10.000.000</strong>.</li>
        </ul>
        <p>Jika memenuhi syarat, PPh 21 yang terutang pada bulan tersebut akan ditanggung oleh pemerintah, sehingga karyawan menerima gaji penuh tanpa potongan pajak.</p>
      </InfoCard>

       <InfoCard title="PTKP (Penghasilan Tidak Kena Pajak) 2025">
        <p>PTKP adalah batas penghasilan yang tidak dikenai pajak. Besaran PTKP untuk tahun 2025 (berdasarkan aturan saat ini) adalah sebagai berikut:</p>
        <ul>
          <li><strong>Wajib Pajak Orang Pribadi:</strong> Rp 54.000.000</li>
          <li><strong>Tambahan untuk Wajib Pajak yang Kawin:</strong> Rp 4.500.000</li>
          <li><strong>Tambahan untuk setiap anggota keluarga (maks. 3 orang):</strong> Rp 4.500.000</li>
        </ul>
        <p>Status PTKP (TK/0, K/1, dll) menentukan total PTKP tahunan Anda.</p>
      </InfoCard>

      <div className="text-center mt-8">
        <a href="https://pajak.go.id" target="_blank" rel="noopener noreferrer" className="bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors">
          Kunjungi Situs Resmi Pajak
        </a>
      </div>
    </div>
  );
};

export default TaxRules;
