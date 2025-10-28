
import React, { useState, useEffect } from 'react';
import { MasterEmployee, MaritalStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { validateTaxId } from '../services/taxValidationService';


interface MasterEmployeeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (employee: MasterEmployee) => void;
    existingEmployee: MasterEmployee | null;
}

const initialFormData: Omit<MasterEmployee, 'id'> = {
    employeeId: '',
    fullName: '',
    position: '',
    email: '',
    phone: '',
    hireDate: '',
    ktp: '',
    address: '',
    isPph21Applicable: true,
    npwp: '',
    employeeStatus: 'Pegawai Tetap',
    isForeigner: false,
    ptkpStatus: MaritalStatus.TK0,
    baseSalary: 0,
    passportNumber: '',
};

const formatNumberForDisplay = (num: number): string => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    return new Intl.NumberFormat('id-ID').format(num);
};

const parseFormattedNumber = (str: string): number => {
    if (typeof str !== 'string') return 0;
    const numericString = str.replace(/[^0-9-]/g, '');
    return parseInt(numericString, 10) || 0;
};


const InputField: React.FC<{ label: string; name: keyof MasterEmployee; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; type?: string; children?: React.ReactNode, required?: boolean }> = 
({ label, name, value, onChange, type = "text", children, required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}{required && <span className="text-red-400">*</span>}</label>
        {children ? (
             <select id={name} name={name} value={value as string} onChange={onChange} required={required} className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200">
                {children}
            </select>
        ) : (
            <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200" />
        )}
    </div>
);

const SpinnerIcon = () => <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

const MasterEmployeeFormModal: React.FC<MasterEmployeeFormModalProps> = ({ isOpen, onClose, onSave, existingEmployee }) => {
    const [formData, setFormData] = useState<Omit<MasterEmployee, 'id'>>(initialFormData);
    const [isValidating, setIsValidating] = useState<'npwp' | 'ktp' | null>(null);
    const [validationMessage, setValidationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);


    useEffect(() => {
        if (existingEmployee) {
            setFormData(existingEmployee);
        } else {
            setFormData(initialFormData);
        }
        setValidationMessage(null);
        setIsValidating(null);
    }, [existingEmployee, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let processedValue: any = value;
        if(name === 'isForeigner' || name === 'isPph21Applicable') {
            processedValue = value === 'true';
        } else if (name === 'baseSalary') {
            processedValue = parseFormattedNumber(value);
        } else if (type === 'checkbox') {
             processedValue = (e.target as HTMLInputElement).checked;
        }

        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleValidation = async (type: 'npwp' | 'ktp') => {
        setIsValidating(type);
        setValidationMessage(null);
        const idToValidate = formData[type];
    
        if (!idToValidate) {
            setValidationMessage({ type: 'error', text: `Harap isi No. ${type.toUpperCase()} terlebih dahulu.` });
            setIsValidating(null);
            return;
        }
    
        // In a real app, 'ktp' would be 'nik' for the API call
        const apiType = type === 'ktp' ? 'nik' : 'npwp';
        const response = await validateTaxId(idToValidate, apiType);
    
        if (response.success && response.data) {
            setFormData(prev => ({
                ...prev,
                fullName: response.data!.name,
                address: response.data!.address,
            }));
            setValidationMessage({ type: 'success', text: response.message });
        } else {
            setValidationMessage({ type: 'error', text: response.message });
        }
        setIsValidating(null);
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: existingEmployee?.id || uuidv4(), ...formData });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                    <div className="p-6 border-b border-gray-700">
                        <h2 className="text-xl font-bold text-gray-100">{existingEmployee ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}</h2>
                        <p className="text-sm text-gray-400 mt-1">Informasi ini akan menjadi data master untuk perhitungan PPh 21.</p>
                    </div>

                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Nama Lengkap" name="fullName" value={formData.fullName} onChange={handleChange} required />
                            <InputField label="ID Karyawan" name="employeeId" value={formData.employeeId} onChange={handleChange} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Jabatan" name="position" value={formData.position} onChange={handleChange} required />
                            <InputField label="Tanggal Masuk" name="hireDate" type="date" value={formData.hireDate} onChange={handleChange} required />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                            <InputField label="No. Handphone" name="phone" value={formData.phone} onChange={handleChange} />
                        </div>
                        <InputField label="Alamat" name="address" value={formData.address} onChange={handleChange} />
                        <hr className="border-gray-700 my-4" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            <div>
                                <label htmlFor="ktp" className="block text-sm font-medium text-gray-300 mb-1">No. KTP<span className="text-red-400">*</span></label>
                                <div className="flex items-center space-x-2">
                                    <input type="text" id="ktp" name="ktp" value={formData.ktp} onChange={handleChange} required className="flex-grow w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200" />
                                    <button type="button" onClick={() => handleValidation('ktp')} disabled={isValidating === 'ktp'} className="px-3 py-2 text-sm font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:bg-gray-500 disabled:cursor-wait flex items-center min-w-[90px] justify-center">
                                        {isValidating === 'ktp' ? <SpinnerIcon/> : 'Validasi'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="npwp" className="block text-sm font-medium text-gray-300 mb-1">No. NPWP</label>
                                <div className="flex items-center space-x-2">
                                    <input type="text" id="npwp" name="npwp" value={formData.npwp} onChange={handleChange} className="flex-grow w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200" />
                                    <button type="button" onClick={() => handleValidation('npwp')} disabled={isValidating === 'npwp'} className="px-3 py-2 text-sm font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:bg-gray-500 disabled:cursor-wait flex items-center min-w-[90px] justify-center">
                                         {isValidating === 'npwp' ? <SpinnerIcon/> : 'Validasi'}
                                    </button>
                                </div>
                            </div>
                            {validationMessage && (
                                <div className={`md:col-span-2 mt-1 text-sm p-2 rounded-md ${validationMessage.type === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                    {validationMessage.text}
                                </div>
                            )}
                        </div>
                         <InputField label="Nomor Paspor (jika WNA)" name="passportNumber" value={formData.passportNumber} onChange={handleChange} />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                             <InputField label="Status PTKP" name="ptkpStatus" value={formData.ptkpStatus} onChange={handleChange} required>
                                {Object.values(MaritalStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </InputField>
                            <InputField label="Status Pegawai" name="employeeStatus" value={formData.employeeStatus} onChange={handleChange} required>
                                <option value="Pegawai Tetap">Pegawai Tetap</option>
                                <option value="Bukan Pegawai">Bukan Pegawai</option>
                            </InputField>
                            <InputField label="Status WNA" name="isForeigner" value={String(formData.isForeigner)} onChange={handleChange} required>
                                <option value="false">Tidak</option>
                                <option value="true">Ya</option>
                            </InputField>
                             <InputField label="Dikenakan PPh 21" name="isPph21Applicable" value={String(formData.isPph21Applicable)} onChange={handleChange} required>
                                <option value="true">Ya</option>
                                <option value="false">Tidak</option>
                            </InputField>
                        </div>
                         <div>
                            <label htmlFor="baseSalary" className="block text-sm font-medium text-gray-300 mb-1">Gaji Pokok (Bulanan)<span className="text-red-400">*</span></label>
                            <input type="text" id="baseSalary" name="baseSalary" value={formatNumberForDisplay(formData.baseSalary)} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200" />
                         </div>

                    </div>

                    <div className="flex justify-end p-6 bg-gray-900 rounded-b-lg space-x-3 mt-auto">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600">
                            Batal
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700">
                            Simpan Karyawan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MasterEmployeeFormModal;