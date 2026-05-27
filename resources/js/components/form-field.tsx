import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { ReactNode } from 'react';

interface FormFieldProps {
    id: string;
    label: string;
    type?: string;
    value: string;
    placeholder?: string;
    error?: string;
    onChange: (value: string) => void;
    children?: ReactNode; // Por si quieres meter un link de "Forgot password"
    required?: boolean;
}

export function FormField({ id, label, type = 'text', value, placeholder, error, onChange, children, required }: FormFieldProps) {
    return (
        <div className="grid gap-2">
            <div className="flex items-center justify-between">
                <Label htmlFor={id}>{label}</Label>
                {children}
            </div>
            <Input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                className={error ? 'border-destructive' : ''}
            />
            <InputError message={error} />
        </div>
    );
}