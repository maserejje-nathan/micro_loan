import { Shield } from 'lucide-react';
import { formatEnumLabel } from '@/lib/format-label';
import { formatMoney } from '@/lib/format-money';

export type CollateralItem = {
    id: number;
    type: string;
    description: string;
    estimated_value: number;
    identifier: string | null;
};

type LoanApplicationCollateralListProps = {
    collaterals: CollateralItem[];
    currency: string;
};

export function LoanApplicationCollateralList({
    collaterals,
    currency,
}: LoanApplicationCollateralListProps) {
    if (collaterals.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No collateral recorded for this application.
            </p>
        );
    }

    const totalValue = collaterals.reduce(
        (sum, item) => sum + item.estimated_value,
        0,
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 text-sm">
                <p className="text-muted-foreground">
                    {collaterals.length} item
                    {collaterals.length === 1 ? '' : 's'}
                </p>
                <p className="font-medium">
                    Total: {formatMoney(totalValue, currency)}
                </p>
            </div>

            <div className="space-y-3">
                {collaterals.map((collateral) => (
                    <div
                        key={collateral.id}
                        className="rounded-lg border bg-muted/30 p-4"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                                <Shield className="size-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="font-medium">
                                        {formatEnumLabel(collateral.type)}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {formatMoney(
                                            collateral.estimated_value,
                                            currency,
                                        )}
                                    </p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {collateral.description}
                                </p>
                                {collateral.identifier && (
                                    <p className="font-mono text-xs text-muted-foreground">
                                        {collateral.identifier}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
