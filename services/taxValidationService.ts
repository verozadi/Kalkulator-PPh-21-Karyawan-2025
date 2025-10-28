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
        name: 'St Syamsiah (dari Dukcapil)',
        address: 'Jl. Perintis Kemerdekaan No. 10, Makassar (dari Dukcapil)'
    },
    '918887776543000': {
        name: 'St Syamsiah (dari DJP)',
        address: 'Jl. Perintis Kemerdekaan No. 10, Makassar (dari DJP)'
    },
    // Aan Alfian Syahriansah
    '7371102307920006': {
        name: 'Aan Alfian Syahriansah (dari Dukcapil)',
        address: 'Jl. Sultan Alauddin No. 20, Makassar (dari Dukcapil)'
    },
     '927776665543001': {
        name: 'Aan Alfian Syahriansah (dari DJP)',
        address: 'Jl. Sultan Alauddin No. 20, Makassar (dari DJP)'
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