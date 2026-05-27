import React from 'react';

interface GenderSelectorProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    label?: string;
}

export default function GenderSelector({ 
    value, 
    onChange, 
    error, 
    label = "Género" 
}: GenderSelectorProps) {
    return (
        <div className="flex flex-col gap-2">
            {/* Etiqueta principal */}
            <span className="text-sm font-medium text-neutral-700">{label}</span>
            
            <div className="flex items-center gap-6 h-10">
                {/* Opción Masculina */}
                <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-600 select-none group">
                    <input 
                        type="radio" 
                        name="genero" 
                        value="m"
                        checked={value === 'm'} 
                        onChange={(e) => onChange(e.target.value)}
                        className="h-4 w-4 border-neutral-300 text-[#1FB7E9] focus:ring-[#1FB7E9] cursor-pointer"
                    />
                    <span className="group-hover:text-neutral-900 transition-colors">Masculino</span>
                </label>

                {/* Opción Femenina */}
                <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-600 select-none group">
                    <input 
                        type="radio" 
                        name="genero" 
                        value="f"
                        checked={value === 'f'} 
                        onChange={(e) => onChange(e.target.value)}
                        className="h-4 w-4 border-neutral-300 text-[#1FB7E9] focus:ring-[#1FB7E9] cursor-pointer"
                    />
                    <span className="group-hover:text-neutral-900 transition-colors">Femenino</span>
                </label>
            </div>

            {/* Renderizado condicional de errores */}
            {error && (
                <span className="text-xs font-medium text-red-500">{error}</span>
            )}
        </div>
    );
}