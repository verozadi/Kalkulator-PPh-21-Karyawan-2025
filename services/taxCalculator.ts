import { EmployeeData, TaxCalculationResult, MaritalStatus } from '../types';
import { PTKP_RATES, PASAL_17_RATES, TER_RATES, TER_CATEGORY_MAP, DTP_INCOME_LIMIT, NPWP_SURCHARGE_RATE } from '../constants';

function getTerRate(status: MaritalStatus, monthlyGross: number): number {
    const category = TER_CATEGORY_MAP[status] || 'A';
    const ratesForCategory = TER_RATES[category];

    for (const bracket of ratesForCategory) {
        if (monthlyGross <= bracket.limit) {
            return bracket.rate;
        }
    }
    // This case will be hit for incomes exceeding the highest defined limit, using the rate for Infinity.
    return ratesForCategory[ratesForCategory.length - 1]?.rate || 0;
}


function calculatePasal17(pkp: number): number {
    if (pkp <= 0) return 0;

    let tax = 0;
    let remainingPkp = pkp;
    let previousLimit = 0;

    for (const bracket of PASAL_17_RATES) {
        const taxableInBracket = Math.min(remainingPkp, bracket.limit - previousLimit);
        tax += taxableInBracket * bracket.rate;
        remainingPkp -= taxableInBracket;
        if (remainingPkp <= 0) break;
        previousLimit = bracket.limit;
    }

    return tax;
}

export const calculatePPh21 = (employee: EmployeeData): TaxCalculationResult => {
    const {
        baseSalary, overtimePay = 0, bonus, facilityValue,
        bpjsDeduction, pensionDeduction, otherDeductions, loan,
        status, npwp, periodMonth,
        // New fields with defaults for backward compatibility
        tunjanganPph = 0, tunjanganJabatan = 0, tunjanganTelekomunikasi = 0, tunjanganMakan = 0, tunjanganTransportasi = 0,
        taxFacility = 'Tanpa Fasilitas'
    } = employee;

    const grossIncome = baseSalary + overtimePay + bonus + facilityValue +
                        tunjanganPph + tunjanganJabatan + tunjanganTelekomunikasi + tunjanganMakan + tunjanganTransportasi;

    // --- Start of Corrected Logic (aligns with PMK 168/2023 & Coretax) ---
    // Calculate monthly deductions for payroll and yearly calculations
    const biayaJabatanMonthly = Math.min(grossIncome * 0.05, 500000);
    const taxDeductibleContributions = bpjsDeduction + pensionDeduction;
    const totalDeductions = biayaJabatanMonthly + taxDeductibleContributions + otherDeductions + loan;
    const netIncomeForTaxMonthly = grossIncome - biayaJabatanMonthly - taxDeductibleContributions;
    
    // PPh 21 TER calculation is based on the original GROSS INCOME.
    const terRate = getTerRate(status, grossIncome);
    const pph21MonthlyTER = grossIncome * terRate;
    // --- End of Corrected Logic ---

    // Recalculate for yearly tax with Biaya Jabatan (Pasal 17 method for December)
    const grossIncomeYearly = grossIncome * 12;
    const biayaJabatanYearly = Math.min(grossIncomeYearly * 0.05, 6000000);
    const taxDeductionsYearly = taxDeductibleContributions * 12;
    const netIncomeForTaxYearly = grossIncomeYearly - biayaJabatanYearly - taxDeductionsYearly;
    
    const ptkp = PTKP_RATES[status] || PTKP_RATES[MaritalStatus.TK0];
    const pkpYearly = Math.max(0, netIncomeForTaxYearly - ptkp);
    
    let pph21Yearly = calculatePasal17(pkpYearly);

    // Surcharge if using NIK or NPWP is blank
    const hasNpwp = npwp && npwp.trim() !== '' && !/^\d{16}$/.test(npwp.replace(/\D/g, ''));
    if (!hasNpwp) {
        pph21Yearly *= NPWP_SURCHARGE_RATE;
    }

    const pph21MonthlyPasal17 = pph21Yearly / 12;

    const pph21Monthly = periodMonth < 12 ? pph21MonthlyTER : pph21MonthlyPasal17;

    let dtpIncentive = 0;
    if (taxFacility === 'PPh Ditanggung Pemerintah (DTP)' && grossIncome <= DTP_INCOME_LIMIT) {
        dtpIncentive = pph21Monthly;
    }

    const finalPPh21Monthly = pph21Monthly - dtpIncentive;
    
    return {
        grossIncome,
        totalDeductions,
        netIncomeForTax: netIncomeForTaxMonthly, // Standard definition of net income for tax
        ptkp,
        pkpYearly,
        pph21Yearly,
        pph21Monthly,
        finalPPh21Monthly: Math.round(finalPPh21Monthly),
        dtpIncentive: Math.round(dtpIncentive),
        paymentStatus: 'Unpaid',
    };
};
