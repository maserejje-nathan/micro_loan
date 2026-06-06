type PasswordRequirementsProps = {
    rules?: string;
};

/**
 * Human-readable hint aligned with Laravel's default password rules.
 */
export function PasswordRequirements({ rules }: PasswordRequirementsProps) {
    const minLength = rules?.includes('minlength') ? 8 : 8;

    return (
        <p className="text-xs leading-relaxed text-muted-foreground">
            Use at least {minLength} characters. Mix letters and numbers for a
            stronger password.
        </p>
    );
}
