
import * as React from 'react';
import { Profile } from '../types';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (profile: Profile) => void;
    profile: Profile;
}

const InputField: React.FC<{ label: string; name: keyof Profile; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }> = ({ label, name, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200"
        />
    </div>
);


const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onSave, profile }) => {
    const [formData, setFormData] = React.useState<Profile>(profile);
    const fileInputRef = React.useRef<HTMLInputElement>(null);


    React.useEffect(() => {
        setFormData(profile);
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-100">Edit Profil</h2>
                        <p className="text-sm text-gray-400 mt-1">Informasi ini akan digunakan di seluruh aplikasi dan laporan.</p>
                    </div>

                    <div className="p-6 border-t border-b border-gray-700 space-y-8">
                        <div className="flex items-center space-x-6">
                             <img src={formData.logoUrl} alt="Logo" className="h-20 w-20 rounded-full object-cover bg-gray-700" />
                            <div>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-semibold text-primary-400 hover:text-primary-300">
                                    Ganti Logo
                                </button>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG. Ukuran maks 800x800px.</p>
                                <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-md font-semibold text-gray-200 border-b border-gray-700 pb-2 mb-4">Profil Perusahaan</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {/* App Name Input Removed */}
                                <InputField label="Nama Perusahaan" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="cth: PT Maju Jaya" />
                                <InputField label="NPWP Perusahaan" name="companyNpwp" value={formData.companyNpwp} onChange={handleChange} placeholder="00.000.000.0-000.000" />
                                <div className="md:col-span-2">
                                    <InputField label="Alamat Perusahaan" name="companyAddress" value={formData.companyAddress || ''} onChange={handleChange} placeholder="Alamat lengkap perusahaan" />
                                </div>
                                <InputField label="ID TKU" name="idTku" value={formData.idTku || ''} onChange={handleChange} placeholder="ID Tempat Kegiatan Usaha" />
                                <InputField label="NITKU" name="nitku" value={formData.nitku || ''} onChange={handleChange} placeholder="16 digit NITKU" />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-md font-semibold text-gray-200 border-b border-gray-700 pb-2 mb-4">Penanggung Jawab</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <InputField label="Nama Penanggung Jawab" name="contactName" value={formData.contactName} onChange={handleChange} placeholder="Nama lengkap" />
                                <InputField label="Jabatan Penanggung Jawab" name="contactPosition" value={formData.contactPosition || ''} onChange={handleChange} placeholder="Misal: Direktur" />
                                <InputField label="NPWP Penanggung Jawab" name="contactNpwp" value={formData.contactNpwp} onChange={handleChange} placeholder="00.000.000.0-000.000" />
                                <InputField label="NIK Penanggung Jawab" name="contactNik" value={formData.contactNik} onChange={handleChange} placeholder="16 digit NIK" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end p-6 bg-gray-900 rounded-b-lg space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600">
                            Batal
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700">
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileModal;
