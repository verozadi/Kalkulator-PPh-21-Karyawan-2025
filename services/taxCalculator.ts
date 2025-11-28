
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
        status, npwp, periodMonth, calculationType,
        // New fields with defaults for backward compatibility
        tunjanganPph = 0, tunjanganJabatan = 0, tunjanganTelekomunikasi = 0, tunjanganMakan = 0, tunjanganTransportasi = 0,
        taxFacility = 'Tanpa Fasilitas',
        // Annual specific fields
        taxPaidAccumulated = 0,
        netIncomeAccumulated = 0
    } = employee;

    const grossIncome = baseSalary + overtimePay + bonus + facilityValue +
                        tunjanganPph + tunjanganJabatan + tunjanganTelekomunikasi + tunjanganMakan + tunjanganTransportasi;

    // --- Standard Deductions ---
    const biayaJabatanMonthly = Math.min(grossIncome * 0.05, 500000);
    const taxDeductibleContributions = bpjsDeduction + pensionDeduction;
    const totalDeductions = biayaJabatanMonthly + taxDeductibleContributions + otherDeductions + loan;
    const netIncomeForTaxMonthly = grossIncome - biayaJabatanMonthly - taxDeductibleContributions;
    
    // Default values
    let pph21Monthly = 0;
    let finalPPh21Monthly = 0;
    let dtpIncentive = 0;
    let pkpYearly = 0;
    let pph21Yearly = 0;
    let taxUnderOverPayment = 0;

    const ptkp = PTKP_RATES[status] || PTKP_RATES[MaritalStatus.TK0];

    // --- Logic based on Calculation Type ---

    if (calculationType === 'annual') {
        // --- Annual A1 Calculation (Masa Pajak Terakhir) ---
        // Formula: (Total Net Income Year - PTKP) * Tarif Pasal 17 - Tax Paid Previously

        // 1. Calculate Total Net Income for the Year
        // If we are in Dec, we add current month net income to accumulated previous net income.
        const totalNetIncomeYearly = netIncomeAccumulated + netIncomeForTaxMonthly;
        
        // 2. Calculate PKP (Setahun)
        pkpYearly = Math.max(0, totalNetIncomeYearly - ptkp);
        
        // 3. Calculate PPh 21 Setahun (Pasal 17)
        pph21Yearly = calculatePasal17(pkpYearly);

        // 4. Surcharge check
        const hasNpwp = npwp && npwp.trim() !== '' && !/^\d{16}$/.test(npwp.replace(/\D/g, ''));
        if (!hasNpwp) {
            pph21Yearly *= NPWP_SURCHARGE_RATE;
        }

        // 5. Calculate Kurang/Lebih Bayar (This month's tax to pay)
        // Total Tax Yearly - Tax Paid Jan-Nov
        taxUnderOverPayment = pph21Yearly - taxPaidAccumulated;
        
        // For display consistency in the list, we map this to finalPPh21Monthly
        pph21Monthly = taxUnderOverPayment; // Raw value
        finalPPh21Monthly = taxUnderOverPayment; // Value to pay

    } else if (calculationType === 'nonFinal') {
        // --- Non-Permanent / Non-Final Calculation ---
        // Typically simpler: (Gross * 50% - PTKP) or Daily thresholds. 
        // BUT user asked for "Components similar to Monthly", so we use TER logic 
        // but typically the 'status' might be different. 
        // For simplicity and matching current app structure, we use the standard TER logic 
        // but flagged as 'nonFinal'.

        const terRate = getTerRate(status, grossIncome);
        pph21Monthly = grossIncome * terRate;
        finalPPh21Monthly = pph21Monthly;

    } else {
        // --- Monthly (Bulanan) Calculation (Default) ---
        // PPh 21 TER calculation is based on the original GROSS INCOME.
        const terRate = getTerRate(status, grossIncome);
        const pph21MonthlyTER = grossIncome * terRate;

        // Recalculate for yearly tax projection (just for reference in monthly view, not A1)
        const grossIncomeYearly = grossIncome * 12;
        const biayaJabatanYearly = Math.min(grossIncomeYearly * 0.05, 6000000);
        const taxDeductionsYearly = taxDeductibleContributions * 12;
        const netIncomeForTaxYearly = grossIncomeYearly - biayaJabatanYearly - taxDeductionsYearly;
        
        pkpYearly = Math.max(0, netIncomeForTaxYearly - ptkp);
        
        pph21Yearly = calculatePasal17(pkpYearly);

        // Surcharge if using NIK or NPWP is blank
        const hasNpwp = npwp && npwp.trim() !== '' && !/^\d{16}$/.test(npwp.replace(/\D/g, ''));
        if (!hasNpwp) {
            pph21Yearly *= NPWP_SURCHARGE_RATE;
        }

        const pph21MonthlyPasal17 = pph21Yearly / 12;

        // If it's December but user selected "Monthly" tab (which is weird but possible), fallback to TER
        // But realistically, December should use Annual logic. 
        // We stick to TER for Jan-Nov, and Pasal 17 projection for Dec if needed.
        // However, user logic is "Bulanan" = Jan-Nov default.
        pph21Monthly = periodMonth < 12 ? pph21MonthlyTER : pph21MonthlyPasal17;

        // Check DTP
        if (taxFacility === 'PPh Ditanggung Pemerintah (DTP)' && grossIncome <= DTP_INCOME_LIMIT) {
            dtpIncentive = pph21Monthly;
        }

        finalPPh21Monthly = pph21Monthly - dtpIncentive;
    }
    
    return {
        grossIncome,
        totalDeductions,
        netIncomeForTax: netIncomeForTaxMonthly,
        ptkp,
        pkpYearly,
        pph21Yearly,
        pph21Monthly,
        finalPPh21Monthly: Math.round(finalPPh21Monthly),
        dtpIncentive: Math.round(dtpIncentive),
        paymentStatus: 'Unpaid',
        taxUnderOverPayment: Math.round(taxUnderOverPayment)
    };
};
