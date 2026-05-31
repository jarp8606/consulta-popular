import { Head, useForm, Link } from '@inertiajs/react';
import React, { useState } from 'react';

export default function Login({ status }: any) {
    // Estado para manejar la visibilidad de la contraseña
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center p-4">
            <Head title="Iniciar Sesión" />

            <div className="w-full max-w-md bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden shadow-2xl shadow-blue-950/40">
                <div className="flex justify-center w-full">
                    <img 
                        src="/images/mesa1.webp" 
                        alt="Logo IAPAM" 
                        className="h-40 object-contain"
                    />
                </div>
                
                <div className="bg-[#1d3557] border-b border-[#e5e7eb] py-3 text-center">
                    <span className="text-white font-medium text-base">
                        Portal Institucional del IAPAM
                    </span>
                </div>

                <div className="p-8">
                    <h2 className="text-[#1e3a8a] text-2xl font-bold text-center mb-2">
                        Ingresa en tu cuenta
                    </h2>
                    <p className="text-gray-600 text-sm text-center mb-6">
                        Ingresa tu usuario y contraseña para iniciar sesión.
                    </p>

                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600 text-center">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        {/* Campo: Correo */}
                        <div>
                            <label className="block text-gray-700 font-medium text-sm mb-1">
                                Dirección de correo
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email}</span>}
                        </div>

                        {/* Campo: Contraseña con Ojito */}
                        <div>
                            <label className="block text-gray-700 font-medium text-sm mb-1">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 pr-10"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <div 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 17.772 17.772m0 0a10.442 10.442 0 0 1-5.772 1.523c-4.756 0-8.773-3.162-10.065-7.498a10.524 10.524 0 0 1 3.438-4.439L6.228 6.228Z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password}</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-[#1d3557] hover:bg-[#152844] text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 mt-6 relative"
                        >
                            <span className="text-base font-semibold">Ingresar</span>
                        </button>
                    </form>

                    {/* <div className="mt-6 text-center text-sm text-gray-600">
                        ¿No tienes una cuenta?{' '}
                        <Link href={route('register')} className="text-[#1d3557] font-semibold hover:underline">
                            Regístrate
                        </Link>
                    </div> */}
                </div>

                <div className="bg-[#f9fafb] border-t border-[#e5e7eb] py-3 text-center">
                    <p className="text-xs text-gray-500">
                        © 2026 Portal de Captura de Datos Personas Adultas Mayores.
                    </p>
                </div>
            </div>
        </div>
    );
}