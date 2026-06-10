import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';

export type CollateralTypeOption = {
    value: string;
    label: string;
};

type CollateralRow = {
    type: string;
    description: string;
    estimated_value: string;
    identifier: string;
};

type LoanApplicationCollateralFieldsProps = {
    errors: Record<string, string | undefined>;
    collateralTypes: CollateralTypeOption[];
    currency?: string;
    initialCollaterals?: CollateralRow[];
};

function emptyRow(): CollateralRow {
    return {
        type: '',
        description: '',
        estimated_value: '',
        identifier: '',
    };
}

function fieldError(
    errors: Record<string, string | undefined>,
    index: number,
    field: keyof CollateralRow,
): string | undefined {
    return (
        errors[`collaterals.${index}.${field}`] ??
        errors[`collaterals.${index}`]
    );
}

function initialRows(initialCollaterals?: CollateralRow[]): CollateralRow[] {
    if (initialCollaterals && initialCollaterals.length > 0) {
        return initialCollaterals;
    }

    return [emptyRow()];
}

export function LoanApplicationCollateralFields({
    errors,
    collateralTypes,
    currency = 'UGX',
    initialCollaterals,
}: LoanApplicationCollateralFieldsProps) {
    const [rows, setRows] = useState<CollateralRow[]>(() =>
        initialRows(initialCollaterals),
    );

    function addRow(): void {
        setRows((current) => [...current, emptyRow()]);
    }

    function removeRow(index: number): void {
        setRows((current) =>
            current.filter((_, rowIndex) => rowIndex !== index),
        );
    }

    function updateRow(
        index: number,
        field: keyof CollateralRow,
        value: string,
    ): void {
        setRows((current) =>
            current.map((row, rowIndex) =>
                rowIndex === index ? { ...row, [field]: value } : row,
            ),
        );
    }

    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Collateral
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Security pledged for this loan. Describe each item
                        offered as collateral — add more if needed.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRow}
                >
                    <Plus className="mr-2 size-4" />
                    Add collateral
                </Button>
            </div>

            <div className="space-y-4">
                {rows.map((row, index) => (
                        <div
                            key={index}
                            className="space-y-4 rounded-lg border bg-muted/30 p-4"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-medium">
                                    Item {index + 1}
                                </p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeRow(index)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="mr-2 size-4" />
                                    Remove
                                </Button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    id={`collaterals_${index}_type`}
                                    label="Type"
                                    error={fieldError(errors, index, 'type')}
                                    required
                                >
                                    <NativeSelect
                                        id={`collaterals_${index}_type`}
                                        name={`collaterals[${index}][type]`}
                                        value={row.type}
                                        required
                                        aria-invalid={
                                            !!fieldError(errors, index, 'type')
                                        }
                                        onChange={(event) =>
                                            updateRow(
                                                index,
                                                'type',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="">Select type</option>
                                        {collateralTypes.map((type) => (
                                            <option
                                                key={type.value}
                                                value={type.value}
                                            >
                                                {type.label}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </FormField>

                                <FormField
                                    id={`collaterals_${index}_estimated_value`}
                                    label={`Estimated value (${currency})`}
                                    error={fieldError(
                                        errors,
                                        index,
                                        'estimated_value',
                                    )}
                                    required
                                >
                                    <Input
                                        id={`collaterals_${index}_estimated_value`}
                                        name={`collaterals[${index}][estimated_value]`}
                                        type="number"
                                        min={1}
                                        value={row.estimated_value}
                                        required
                                        aria-invalid={
                                            !!fieldError(
                                                errors,
                                                index,
                                                'estimated_value',
                                            )
                                        }
                                        className="h-10"
                                        onChange={(event) =>
                                            updateRow(
                                                index,
                                                'estimated_value',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </FormField>
                            </div>

                            <FormField
                                id={`collaterals_${index}_description`}
                                label="Description"
                                error={fieldError(errors, index, 'description')}
                                required
                                hint="Make, model, location, or other identifying details"
                            >
                                <Textarea
                                    id={`collaterals_${index}_description`}
                                    name={`collaterals[${index}][description]`}
                                    value={row.description}
                                    rows={2}
                                    required
                                    placeholder="Toyota Premio 2015, silver"
                                    aria-invalid={
                                        !!fieldError(
                                            errors,
                                            index,
                                            'description',
                                        )
                                    }
                                    onChange={(event) =>
                                        updateRow(
                                            index,
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                />
                            </FormField>

                            <FormField
                                id={`collaterals_${index}_identifier`}
                                label="Identifier (optional)"
                                error={fieldError(errors, index, 'identifier')}
                                hint="Registration, serial number, or title deed reference"
                            >
                                <Input
                                    id={`collaterals_${index}_identifier`}
                                    name={`collaterals[${index}][identifier]`}
                                    value={row.identifier}
                                    placeholder="UBH 123A"
                                    aria-invalid={
                                        !!fieldError(
                                            errors,
                                            index,
                                            'identifier',
                                        )
                                    }
                                    className="h-10"
                                    onChange={(event) =>
                                        updateRow(
                                            index,
                                            'identifier',
                                            event.target.value,
                                        )
                                    }
                                />
                            </FormField>
                        </div>
                ))}
            </div>
        </section>
    );
}
