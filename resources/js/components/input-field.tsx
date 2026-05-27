import { InputHTMLAttributes } from 'react';

// Extendemos los atributos nativos de un input para poder pasar cualquier propiedad (type, placeholder, etc.)
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export default function InputField({ label, id, error, className = '', ...props }: InputFieldProps) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
                {label}
            </label>
            <input
                id={id}
                className={`mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-[#1FB7E9] focus:outline-none focus:ring-1 focus:ring-[#1FB7E9] ${className}`}
                {...props}
            />
            {error && (
                <span className="mt-1 block text-xs font-medium text-red-500">{error}</span>
            )}
        </div>
    );
}