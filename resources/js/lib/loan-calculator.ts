export type InterestType = 'flat' | 'reducing';

export type RepaymentFrequency = 'daily' | 'weekly' | 'monthly';

export type LoanCalculatorInput = {
    principal: number;
    interestRate: number;
    interestType: InterestType;
    termDays: number;
    processingFee?: number;
    repaymentFrequency?: RepaymentFrequency;
};

export type LoanCalculatorResult = {
    principal: number;
    total_interest: number;
    processing_fee: number;
    total_repayable: number;
    installment_count: number;
    installment_amount: number;
};

export function installmentsForTerm(
    frequency: RepaymentFrequency,
    termDays: number,
): number {
    switch (frequency) {
        case 'daily':
            return Math.max(1, termDays);
        case 'weekly':
            return Math.max(1, Math.ceil(termDays / 7));
        default:
            return Math.max(1, Math.ceil(termDays / 30));
    }
}

export function calculateLoanEstimate(
    input: LoanCalculatorInput,
): LoanCalculatorResult {
    const principal = Math.max(0, Math.round(input.principal));
    const termDays = Math.max(1, Math.round(input.termDays));
    const processingFee = Math.max(0, Math.round(input.processingFee ?? 0));
    const frequency = input.repaymentFrequency ?? 'monthly';
    const rate = input.interestRate;

    const totalInterest =
        input.interestType === 'flat'
            ? Math.round(principal * (rate / 100))
            : Math.round(principal * (rate / 100) * (termDays / 365));

    const totalRepayable = principal + totalInterest + processingFee;
    const installmentCount = installmentsForTerm(frequency, termDays);
    const installmentAmount = Math.round(totalRepayable / installmentCount);

    return {
        principal,
        total_interest: totalInterest,
        processing_fee: processingFee,
        total_repayable: totalRepayable,
        installment_count: installmentCount,
        installment_amount: installmentAmount,
    };
}
