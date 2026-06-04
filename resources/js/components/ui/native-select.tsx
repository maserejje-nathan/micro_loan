import * as React from 'react';

import { cn } from '@/lib/utils';

export type NativeSelectOption = {
    value: string;
    label: string;
};

type NativeSelectProps = React.ComponentProps<'select'> & {
    options?: NativeSelectOption[];
};

function NativeSelect({
    className,
    options,
    children,
    ...props
}: NativeSelectProps) {
    return (
        <select
            data-slot="native-select"
            className={cn(
                'border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        >
            {options
                ? options.map((option) => (
                      <option key={option.value} value={option.value}>
                          {option.label}
                      </option>
                  ))
                : children}
        </select>
    );
}

export { NativeSelect };
