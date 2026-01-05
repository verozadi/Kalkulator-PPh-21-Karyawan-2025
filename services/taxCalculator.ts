
import { EmployeeData, TaxCalculationResult, MaritalStatus } from '../types';
import { PTKP_RATES, PASAL_17_RATES, TER_RATES, TER_CATEGORY_MAP, DTP_INCOME_LIMIT, NPWP_SURCHARGE_RATE } from '../constants';

export function getTerRate(status: MaritalStatus, monthlyGross: number): number {
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


export function calculatePasal17(pkp: number): number {
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
        baseSalary, overtimePay = 0, bonus = 0, facilityValue = 0,
        bpjsDeduction = 0, pensionDeduction = 0, jpDeduction = 0,
        status, npwp, calculationType,
        tunjanganPph = 0, tunjanganJabatan = 0, tunjanganTelekomunikasi = 0, tunjanganMakan = 0, tunjanganTransportasi = 0,
        customFixedAllowances = [], customVariableAllowances = [],
        honorarium = 0, insurancePremi = 0, zakatDeduction = 0, pph21PaidPreviously = 0,
        taxFacility = 'Tanpa Fasilitas',
        manualPph21Dtp
    } = employee;

    const ptkp = PTKP_RATES[status] || PTKP_RATES[MaritalStatus.TK0];
    
    let grossIncome = 0;
    let totalTaxDeductions = 0;
    let netIncomeForTax = 0;
    let pkpYearly = 0;
    let pph21Yearly = 0;
    let pph21Monthly = 0;
    let finalPPh21Monthly = 0;
    let dtpIncentive = 0;
    let taxUnderOverPayment = 0;

    // Calculate Gross Income
    const customFixedTotal = (customFixedAllowances || []).reduce((acc, curr) => acc + curr.value, 0);
    const customVarTotal = (customVariableAllowances || []).reduce((acc, curr) => acc + curr.value, 0);
    
    grossIncome = baseSalary + tunjanganPph + tunjanganJabatan + tunjanganTelekomunikasi + 
                  tunjanganMakan + tunjanganTransportasi + overtimePay + bonus + facilityValue + 
                  customFixedTotal + customVarTotal;

    if (calculationType === 'annual') {
        const biayaJabatanYearly = Math.min(grossIncome * 0.05, 6000000);
        const iuranWajibTotal = pensionDeduction + jpDeduction + (zakatDeduction || 0);
        
        totalTaxDeductions = biayaJabatanYearly + iuranWajibTotal;
        netIncomeForTax = grossIncome - totalTaxDeductions;

        const rawPkp = netIncomeForTax - ptkp;
        pkpYearly = Math.max(0, Math.floor(rawPkp / 1000) * 1000);
        pph21Yearly = calculatePasal17(pkpYearly);

        const hasNpwp = npwp && npwp.trim() !== '' && !/^\d{16}$/.test(npwp.replace(/\D/g, ''));
        if (!hasNpwp) {
            pph21Yearly *= NPWP_SURCHARGE_RATE;
        }

        if (taxFacility === 'PPh Ditanggung Pemerintah (DTP)') {
             // Use manual override if present, otherwise calculate automatically
             if (manualPph21Dtp !== undefined && manualPph21Dtp !== null) {
                 dtpIncentive = manualPph21Dtp;
             } else {
                 const avgMonthlyIncome = grossIncome / 12; 
                 if (avgMonthlyIncome <= DTP_INCOME_LIMIT) {
                     dtpIncentive = pph21Yearly;
                 }
             }
        }

        taxUnderOverPayment = pph21Yearly - pph21PaidPreviously - dtpIncentive;
        pph21Monthly = pph21Yearly; 
        finalPPh21Monthly = taxUnderOverPayment;

    } else if (calculationType === 'nonFinal') {
        const terRate = getTerRate(status, grossIncome);
        pph21Monthly = grossIncome * terRate;
        finalPPh21Monthly = pph21Monthly;
        netIncomeForTax = grossIncome; 

    } else {
        // Monthly TER Logic
        const biayaJabatanMonthly = Math.min(grossIncome * 0.05, 500000);
        // Only JHT, JP, and Zakat reduce the tax base. BPJS Kes and Loans do NOT.
        const taxDeductibleContributions = pensionDeduction + jpDeduction + (zakatDeduction || 0);
        
        totalTaxDeductions = biayaJabatanMonthly + taxDeductibleContributions;
        netIncomeForTax = grossIncome - totalTaxDeductions;

        const terRate = getTerRate(status, grossIncome);
        pph21Monthly = Math.floor(grossIncome * terRate);

        const hasNpwp = npwp && npwp.trim() !== '' && !/^\d{16}$/.test(npwp.replace(/\D/g, ''));
        if (!hasNpwp) {
            pph21Monthly = Math.floor(pph21Monthly * NPWP_SURCHARGE_RATE);
        }

        if (taxFacility === 'PPh Ditanggung Pemerintah (DTP)') {
            if (manualPph21Dtp !== undefined && manualPph21Dtp !== null) {
                dtpIncentive = manualPph21Dtp;
            } else if (grossIncome <= DTP_INCOME_LIMIT) {
                dtpIncentive = pph21Monthly;
            }
        }

        finalPPh21Monthly = pph21Monthly - dtpIncentive;
    }

    if (taxFacility === 'Surat Keterangan Bebas (SKB) Pemotongan PPh Pasal 21') {
        finalPPh21Monthly = 0;
        taxUnderOverPayment = 0;
        dtpIncentive = 0; 
    }
    
    return {
        grossIncome,
        totalDeductions: totalTaxDeductions,
        netIncomeForTax,
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
