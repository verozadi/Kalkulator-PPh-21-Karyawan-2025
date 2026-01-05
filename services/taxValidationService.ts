
// In a real-world application, this service would make API calls to DJP or other official sources.
// For this simulation, we use a mock database to demonstrate the functionality.

interface ValidationResponse {
    success: boolean;
    data?: {
        name: string;
        address: string;
    };
    message: string;
}

// Mock database simulating data from DJP (for NPWP) and Dukcapil (for NIK)
const MOCK_TAX_DATABASE: { [key: string]: { name: string; address: string } } = {
    // St Syamsiah
    '7371026702680004': {
        name: 'St Syamsiah (dari Database)',
        address: 'Dg Tata Tmn Artalia Blk A1/ No 4/5 RT 002 RW 002, Kel. Parang Tambung, Kec. Tamalate (Terverifikasi)'
    },
    // Aan Alfian Syahriansah
    '7371102307920006': {
        name: 'Aan Alfian Syahriansah (dari Database)',
        address: 'Dg Tata I Blk IV Perum. Graha Sanjaya No. A.5 RT 002 RW 002, Kel. Parang Tambung, Kec. Tamalate (Terverifikasi)'
    }
};

/**
 * Simulates validating an NIK or NPWP against an official database.
 * @param id The NIK or NPWP to validate.
 * @param type The type of ID being validated.
 * @returns A promise that resolves to a ValidationResponse object.
 */
export const validateTaxId = async (id: string, type: 'npwp' | 'nik'): Promise<ValidationResponse> => {
    // Simulate network delay of 1.5 seconds
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const cleanedId = id.replace(/\D/g, '');
    const record = MOCK_TAX_DATABASE[cleanedId];

    if (record) {
        return {
            success: true,
            data: {
                name: record.name,
                address: record.address
            },
            message: `Validasi ${type.toUpperCase()} berhasil! Data nama dan alamat telah diisi otomatis.`
        };
    } else {
        return {
            success: false,
            message: `${type.toUpperCase()} tidak valid atau tidak ditemukan di database.`
        };
    }
};
