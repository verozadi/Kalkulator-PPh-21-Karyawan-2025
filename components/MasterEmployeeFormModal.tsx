
import * as React from 'react';
import { MasterEmployee, MaritalStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { validateTaxId } from '../services/taxValidationService';


interface MasterEmployeeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (employee: MasterEmployee) => Promise<void> | void;
    existingEmployee: MasterEmployee | null;
}

const initialFormData: Omit<MasterEmployee, 'id'> = {
    employeeId: '',
    fullName: '',
    gender: 'Laki-Laki',
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
    countryCode: '',
    ptkpStatus: MaritalStatus.TK0,
    baseSalary: 0,
    positionAllowance: 0,
    passportNumber: '',
    isActive: true,
};

// List of Countries
const COUNTRIES = [
    { code: 'AFG', name: 'Afghanistan' },
    { code: 'AGO', name: 'Angola' },
    { code: 'ALB', name: 'Albania' },
    { code: 'AND', name: 'Andorra' },
    { code: 'ARE', name: 'United Arab Emirates' },
    { code: 'ARG', name: 'Argentina' },
    { code: 'ARM', name: 'Armenia' },
    { code: 'ATG', name: 'Antigua dan Barbuda' },
    { code: 'AUS', name: 'Australia' },
    { code: 'AUT', name: 'Austria' },
    { code: 'AZE', name: 'Azerbaijan' },
    { code: 'BDI', name: 'Burundi' },
    { code: 'BEL', name: 'Belgium' },
    { code: 'BEN', name: 'Benin' },
    { code: 'BFA', name: 'Burkina Faso' },
    { code: 'BGD', name: 'Bangladesh' },
    { code: 'BGR', name: 'Bulgaria' },
    { code: 'BHR', name: 'Bahrain' },
    { code: 'BHS', name: 'Bahamas' },
    { code: 'BIH', name: 'Bosnia dan Herzegovina' },
    { code: 'BLR', name: 'Belarus' },
    { code: 'BLZ', name: 'Belize' },
    { code: 'BOL', name: 'Bolivia' },
    { code: 'BRA', name: 'Brazil' },
    { code: 'BRB', name: 'Barbados' },
    { code: 'BRN', name: 'Brunei Darussalam' },
    { code: 'BTN', name: 'Bhutan' },
    { code: 'BWA', name: 'Bostwana' },
    { code: 'CAF', name: 'Central African Republic' },
    { code: 'CAN', name: 'Canada' },
    { code: 'CHE', name: 'Switzerland' },
    { code: 'CHL', name: 'Chile' },
    { code: 'CHN', name: 'China' },
    { code: 'CIV', name: 'Pantai Gading' },
    { code: 'CMR', name: 'Cameroon' },
    { code: 'COD', name: 'Congo - the Democratic Republic of the' },
    { code: 'COG', name: 'Congo' },
    { code: 'COL', name: 'Colombia' },
    { code: 'COM', name: 'Comoros' },
    { code: 'CPV', name: 'Cabo Verde' },
    { code: 'CRI', name: 'Costa Rica' },
    { code: 'CUB', name: 'Cuba' },
    { code: 'CYP', name: 'Cyprus' },
    { code: 'CZE', name: 'Republik Ceko' },
    { code: 'DEU', name: 'Germany' },
    { code: 'DJI', name: 'Djibouti' },
    { code: 'DMA', name: 'Dominica' },
    { code: 'DNK', name: 'Denmark' },
    { code: 'DOM', name: 'Dominican Republic' },
    { code: 'DSA', name: 'Aljazair' },
    { code: 'ECU', name: 'Ekuador' },
    { code: 'EGY', name: 'Egypt' },
    { code: 'ERI', name: 'Eritrea' },
    { code: 'ESP', name: 'Spain' },
    { code: 'EST', name: 'Estonia' },
    { code: 'ETH', name: 'Ethiopia' },
    { code: 'FIN', name: 'Finlandia' },
    { code: 'FJI', name: 'Fiji' },
    { code: 'FRA', name: 'France' },
    { code: 'FSM', name: 'Micronesia' },
    { code: 'GAB', name: 'Gabon' },
    { code: 'GBR', name: 'United Kingdom' },
    { code: 'GEO', name: 'Georgia' },
    { code: 'GHA', name: 'Ghana' },
    { code: 'GIN', name: 'Guinea' },
    { code: 'GMB', name: 'Gambia' },
    { code: 'GNB', name: 'Guinea-Bissau' },
    { code: 'GNQ', name: 'Equatorial Guinea' },
    { code: 'GRC', name: 'Greece' },
    { code: 'GRD', name: 'Grenada' },
    { code: 'GTM', name: 'Guatemala' },
    { code: 'GUY', name: 'Guyana' },
    { code: 'HKG', name: 'Hong Kong' },
    { code: 'HND', name: 'Honduras' },
    { code: 'HRV', name: 'Croatia' },
    { code: 'HTI', name: 'Haiti' },
    { code: 'HUN', name: 'Hungary' },
    { code: 'IND', name: 'India' },
    { code: 'IRL', name: 'Irlandia' },
    { code: 'IRN', name: 'Iran' },
    { code: 'IRQ', name: 'Iraq' },
    { code: 'ISL', name: 'Iceland' },
    { code: 'ISR', name: 'Israel' },
    { code: 'ITA', name: 'Italy' },
    { code: 'JAM', name: 'Jamaica' },
    { code: 'JOR', name: 'Jordan' },
    { code: 'JPN', name: 'Japan' },
    { code: 'KAZ', name: 'Kazakhstan' },
    { code: 'KEN', name: 'Kenya' },
    { code: 'KGZ', name: 'Kyrgyzstan' },
    { code: 'KHM', name: 'Cambodia' },
    { code: 'KIR', name: 'Kiribati' },
    { code: 'KNA', name: 'Saint Kitts dan Nevis' },
    { code: 'KOR', name: 'Korea, Republic of' },
    { code: 'KWT', name: 'Kuwait' },
    { code: 'LAO', name: 'Laos' },
    { code: 'LBN', name: 'Lebanon' },
    { code: 'LBR', name: 'Liberia' },
    { code: 'LBY', name: 'Libya' },
    { code: 'LCA', name: 'Saint Lucia' },
    { code: 'LIE', name: 'Liechtenstein' },
    { code: 'LKA', name: 'Sri Lanka' },
    { code: 'LSO', name: 'Lesotho' },
    { code: 'LTU', name: 'Lituania' },
    { code: 'LUX', name: 'Luxembourg' },
    { code: 'LVA', name: 'Latvia' },
    { code: 'MAR', name: 'Morocco' },
    { code: 'MCO', name: 'Monaco' },
    { code: 'MDA', name: 'Moldova, Republic of' },
    { code: 'MDG', name: 'Madagascar' },
    { code: 'MDV', name: 'Maldives' },
    { code: 'MEX', name: 'Mexico' },
    { code: 'MHL', name: 'Marshall Islands' },
    { code: 'MKD', name: 'Macedonia' },
    { code: 'MLI', name: 'Mali' },
    { code: 'MLT', name: 'Malta' },
    { code: 'MMR', name: 'Myanmar' },
    { code: 'MNE', name: 'Montenegro' },
    { code: 'MNG', name: 'Mongolia' },
    { code: 'MOZ', name: 'Mozambique' },
    { code: 'MRT', name: 'Mauritania' },
    { code: 'MUS', name: 'Mauritius' },
    { code: 'MWI', name: 'Malawi' },
    { code: 'MYS', name: 'Malaysia' },
    { code: 'NAM', name: 'Namibia' },
    { code: 'NER', name: 'Niger' },
    { code: 'NGA', name: 'Nigeria' },
    { code: 'NIC', name: 'Nicaragua' },
    { code: 'NLD', name: 'Netherlands' },
    { code: 'NOR', name: 'Norway' },
    { code: 'NPL', name: 'Nepal' },
    { code: 'NRU', name: 'Nauru' },
    { code: 'NZL', name: 'New Zealand' },
    { code: 'OMN', name: 'Oman' },
    { code: 'PAK', name: 'Pakistan' },
    { code: 'PAN', name: 'Panama' },
    { code: 'PER', name: 'Peru' },
    { code: 'PHL', name: 'Philippines' },
    { code: 'PLW', name: 'Palau' },
    { code: 'PNG', name: 'Papua New Guinea' },
    { code: 'POL', name: 'Poland' },
    { code: 'PRK', name: 'North Korea' },
    { code: 'PRT', name: 'Portugal' },
    { code: 'PRY', name: 'Paraguay' },
    { code: 'QAT', name: 'Qatar' },
    { code: 'ROU', name: 'Romania' },
    { code: 'RUS', name: 'Russian Federation' },
    { code: 'RWA', name: 'Rwanda' },
    { code: 'SAU', name: 'Saudi Arabia' },
    { code: 'SDN', name: 'Sudan' },
    { code: 'SEN', name: 'Senegal' },
    { code: 'SGP', name: 'Singapore' },
    { code: 'SLB', name: 'Solomon Islands' },
    { code: 'SLE', name: 'Sierra Leone' },
    { code: 'SLV', name: 'El Salvador' },
    { code: 'SMR', name: 'San Marino' },
    { code: 'SOM', name: 'Somalia' },
    { code: 'SRB', name: 'Serbia' },
    { code: 'STP', name: 'Sao Tome dan Principe' },
    { code: 'SUR', name: 'Suriname' },
    { code: 'SVK', name: 'Slovakia' },
    { code: 'SVN', name: 'Slovenia' },
    { code: 'SWE', name: 'Sweden' },
    { code: 'SWZ', name: 'Swaziland' },
    { code: 'SYC', name: 'Seychelles' },
    { code: 'SYR', name: 'Syria' },
    { code: 'TCD', name: 'Chad' },
    { code: 'TGO', name: 'Togo' },
    { code: 'THA', name: 'Thailand' },
    { code: 'TJK', name: 'Tajikistan' },
    { code: 'TKM', name: 'Turkmenistan' },
    { code: 'TLS', name: 'Timor Leste' },
    { code: 'TON', name: 'Tonga' },
    { code: 'TTO', name: 'Trinidad dan Tobago' },
    { code: 'TUN', name: 'Tunisia' },
    { code: 'TUR', name: 'Turkey' },
    { code: 'TUV', name: 'Tuvalu' },
    { code: 'TWN', name: 'Taiwan' },
    { code: 'TZA', name: 'Tanzania' },
    { code: 'UGA', name: 'Uganda' },
    { code: 'UKR', name: 'Ukraine' },
    { code: 'URY', name: 'Uruguay' },
    { code: 'USA', name: 'United States' },
    { code: 'UZB', name: 'Uzbekistan' },
    { code: 'VAT', name: 'Vatican' },
    { code: 'VCT', name: 'Saint Vincent dan Grenadines' },
    { code: 'VEN', name: 'Venezuela' },
    { code: 'VNM', name: 'Viet Nam' },
    { code: 'VUT', name: 'Vanuatu' },
    { code: 'WSM', name: 'Samoa' },
    { code: 'YEM', name: 'Yemen' },
    { code: 'ZAF', name: 'South Africa' },
    { code: 'ZMB', name: 'Zambia' },
    { code: 'ZWE', name: 'Zimbabwe' },
    { code: 'VGB', name: 'Virgin Islands, British' },
    { code: 'VIR', name: 'Virgin Islands, US' },
    { code: 'UMI', name: 'United States Minor Outlying Islands' },
    { code: 'TKL', name: 'Tokelau' },
    { code: 'SPM', name: 'Saint Pierre and Miquelon' },
    { code: 'SJM', name: 'Svalbard and Jan Mayen' },
    { code: 'SHN', name: 'Saint Helena, Ascension and Tristan da Cunha' },
    { code: 'SGS', name: 'South Georgia and the South Sandwich Islands' },
    { code: 'REU', name: 'Réunion' },
    { code: 'PYF', name: 'French Polynesia' },
    { code: 'PSE', name: 'Palestine, State of' },
    { code: 'ABW', name: 'Aruba' },
    { code: 'AIA', name: 'Anguilla' },
    { code: 'ALA', name: 'Aland Islands' },
    { code: 'ASM', name: 'American Samoa' },
    { code: 'ATA', name: 'Antarctica' },
    { code: 'ATF', name: 'French Southern Territories' },
    { code: 'BES', name: 'Bonaire, Sint Eustatius and Saba' },
    { code: 'BLM', name: 'Saint Barthélemy' },
    { code: 'BMU', name: 'Bermuda' },
    { code: 'BVT', name: 'Bouvet Island' },
    { code: 'CCK', name: 'Cocos (Keeling) Islands' },
    { code: 'COK', name: 'Cook Islands' },
    { code: 'CUW', name: 'Curacao' },
    { code: 'CXR', name: 'Christmas Island' },
    { code: 'CYM', name: 'Cayman Islands' },
    { code: 'DZA', name: 'Algeria' },
    { code: 'ESH', name: 'Western Sahara' },
    { code: 'FLK', name: 'Falkland Islands (Malvinas)' },
    { code: 'FRO', name: 'Faroe Islands' },
    { code: 'GGY', name: 'Guernsey' },
    { code: 'GIB', name: 'Gibraltar' },
    { code: 'GRL', name: 'Greenland' },
    { code: 'GUF', name: 'French Guiana' },
    { code: 'GUM', name: 'Guam' },
    { code: 'HMD', name: 'Heard Island and McDonald Islands' },
    { code: 'IMN', name: 'Isle of Man' },
    { code: 'IOT', name: 'British Indian Ocean Territory' },
    { code: 'JEY', name: 'Jersey' },
    { code: 'MAC', name: 'Macao' },
    { code: 'MAF', name: 'Saint Martin' },
    { code: 'MNP', name: 'Northern Mariana Islands' },
    { code: 'MSR', name: 'Montserrat' },
    { code: 'MTQ', name: 'Martinique' },
    { code: 'MYT', name: 'Mayotte' },
    { code: 'NCL', name: 'New Caledonia' },
    { code: 'NFK', name: 'Norfolk Island' },
    { code: 'NIU', name: 'Niue' },
    { code: 'PCN', name: 'Pitcairn' },
    { code: 'PRI', name: 'Puerto Rico' },
    { code: 'SSD', name: 'South Sudan' },
    { code: 'SXM', name: 'Sint Maarten (Dutch part)' },
    { code: 'TCA', name: 'Turks and Caicos Islands' },
    { code: 'WLF', name: 'Wallis and Futuna' },
];

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
             <select id={name} name={name} value={value as string} onChange={onChange} required={required} className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200 [&>option]:bg-gray-800">
                {children}
            </select>
        ) : (
            <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200" />
        )}
    </div>
);

const SpinnerIcon = () => <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

const MasterEmployeeFormModal: React.FC<MasterEmployeeFormModalProps> = ({ isOpen, onClose, onSave, existingEmployee }) => {
    const [formData, setFormData] = React.useState<Omit<MasterEmployee, 'id'>>(initialFormData);
    const [isValidating, setIsValidating] = React.useState<'npwp' | 'ktp' | null>(null);
    const [validationMessage, setValidationMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isSaving, setIsSaving] = React.useState(false);
    
    // Country Search State
    const [countrySearch, setCountrySearch] = React.useState('');
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = React.useState(false);


    React.useEffect(() => {
        if (existingEmployee) {
            setFormData(existingEmployee);
            // Initialize search if country code exists
            const country = COUNTRIES.find(c => c.code === existingEmployee.countryCode);
            if (country) {
                setCountrySearch(`${country.name} (${country.code})`);
            } else {
                setCountrySearch('');
            }
        } else {
            setFormData(initialFormData);
            setCountrySearch('');
        }
        setValidationMessage(null);
        setIsValidating(null);
    }, [existingEmployee, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let processedValue: any = value;
        if(name === 'isForeigner' || name === 'isPph21Applicable' || name === 'isActive') {
            processedValue = value === 'true';
        } else if (name === 'baseSalary' || name === 'positionAllowance') {
            processedValue = parseFormattedNumber(value);
        } else if (type === 'checkbox') {
             processedValue = (e.target as HTMLInputElement).checked;
        }

        // Logic to reset Foreigner fields if status changes to No
        if (name === 'isForeigner' && processedValue === false) {
            setFormData(prev => ({ 
                ...prev, 
                [name]: processedValue,
                countryCode: '',
                passportNumber: '' 
            }));
            setCountrySearch('');
        } else {
            setFormData(prev => {
                const newData = { ...prev, [name]: processedValue };
                // Sync KTP with NPWP (NIK/NPWP16) to ensure both fields have data
                if (name === 'npwp') {
                    newData.ktp = processedValue as string;
                }
                return newData;
            });
        }
    };

    const handleValidation = async () => {
        // Use 'npwp' as the primary field for NIK/NPWP16 validation
        setIsValidating('npwp');
        setValidationMessage(null);
        const idToValidate = formData.npwp;
    
        if (!idToValidate) {
            setValidationMessage({ type: 'error', text: `Harap isi NIK/NPWP16 terlebih dahulu.` });
            setIsValidating(null);
            return;
        }
    
        // We use 'npwp' validation type as it relates to tax identity primarily
        const response = await validateTaxId(idToValidate, 'npwp');
    
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

    // Filter Countries based on search term (start searching after 2 chars)
    const filteredCountries = React.useMemo(() => {
        if (countrySearch.length < 2) return COUNTRIES;
        return COUNTRIES.filter(c => 
            c.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
            c.code.toLowerCase().includes(countrySearch.toLowerCase())
        );
    }, [countrySearch]);

    const handleCountrySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCountrySearch(e.target.value);
        setIsCountryDropdownOpen(true);
    };

    const selectCountry = (country: { code: string, name: string }) => {
        setFormData(prev => ({ ...prev, countryCode: country.code }));
        setCountrySearch(`${country.name} (${country.code})`);
        setIsCountryDropdownOpen(false);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave({ id: existingEmployee?.id || uuidv4(), ...formData });
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-gray-700 flex-shrink-0">
                        <h2 className="text-xl font-bold text-gray-100">{existingEmployee ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}</h2>
                        <p className="text-sm text-gray-400 mt-1">Informasi ini akan menjadi data master untuk perhitungan PPh 21.</p>
                    </div>

                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Nama Lengkap" name="fullName" value={formData.fullName} onChange={handleChange} required />
                            <InputField label="ID Karyawan" name="employeeId" value={formData.employeeId} onChange={handleChange} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Jenis Kelamin" name="gender" value={formData.gender} onChange={handleChange} required>
                                <option value="Laki-Laki">Laki-Laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </InputField>
                            <InputField label="Jabatan" name="position" value={formData.position} onChange={handleChange} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Tanggal Masuk (dd/mm/yyyy)" name="hireDate" type="date" value={formData.hireDate} onChange={handleChange} required />
                            <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="No. Handphone" name="phone" value={formData.phone} onChange={handleChange} />
                            <InputField label="Alamat" name="address" value={formData.address} onChange={handleChange} />
                        </div>
                        <hr className="border-gray-700 my-4" />
                        
                        {/* Modified ID Section: Removed KTP input, updated NPWP to NIK/NPWP16 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            <div className="md:col-span-2">
                                <label htmlFor="npwp" className="block text-sm font-medium text-gray-300 mb-1">NIK/NPWP16</label>
                                <div className="flex items-center space-x-2">
                                    <input type="text" id="npwp" name="npwp" value={formData.npwp} onChange={handleChange} placeholder="Masukkan 16 digit NIK atau NPWP" className="flex-grow w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200" />
                                    <button type="button" onClick={handleValidation} disabled={isValidating === 'npwp'} className="px-3 py-2 text-sm font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:bg-gray-500 disabled:cursor-wait flex items-center min-w-[90px] justify-center">
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

                        {/* Conditional Rendering for Foreigner Fields */}
                        {formData.isForeigner && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-900/50 rounded-md border border-gray-700 animate-fade-in">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Kode Negara</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200"
                                        value={countrySearch}
                                        onChange={handleCountrySearchChange}
                                        onFocus={() => setIsCountryDropdownOpen(true)}
                                        onBlur={() => setTimeout(() => setIsCountryDropdownOpen(false), 200)}
                                        placeholder="Ketik nama negara..."
                                    />
                                    {isCountryDropdownOpen && (
                                        <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                                            {filteredCountries.length > 0 ? (
                                                filteredCountries.map((c) => (
                                                    <li
                                                        key={c.code}
                                                        className="px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 cursor-pointer"
                                                        onMouseDown={() => selectCountry(c)}
                                                    >
                                                        {c.name} ({c.code})
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="px-3 py-2 text-sm text-gray-400">Tidak ditemukan.</li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                                <InputField label="Nomor Paspor" name="passportNumber" value={formData.passportNumber} onChange={handleChange} />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <InputField label="Status Karyawan" name="isActive" value={String(formData.isActive)} onChange={handleChange} required>
                                <option value="true">Aktif</option>
                                <option value="false">Tidak Aktif</option>
                            </InputField>
                             <div>
                                <label htmlFor="baseSalary" className="block text-sm font-medium text-gray-300 mb-1">Gaji Pokok (Bulanan)<span className="text-red-400">*</span></label>
                                <input type="text" id="baseSalary" name="baseSalary" value={formatNumberForDisplay(formData.baseSalary)} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200" />
                             </div>
                             <div>
                                <label htmlFor="positionAllowance" className="block text-sm font-medium text-gray-300 mb-1">Tunjangan Jabatan (Bulanan)</label>
                                <input type="text" id="positionAllowance" name="positionAllowance" value={formatNumberForDisplay(formData.positionAllowance)} onChange={handleChange} className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-gray-200" />
                             </div>
                        </div>

                    </div>

                    <div className="flex justify-end p-6 bg-gray-900 rounded-b-lg space-x-3 flex-shrink-0">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 disabled:opacity-50">
                            Batal
                        </button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 flex items-center gap-2 disabled:bg-gray-600">
                            {isSaving ? (
                                <>
                                    <SpinnerIcon />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <span>Simpan Karyawan</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MasterEmployeeFormModal;
