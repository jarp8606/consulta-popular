import InputField from '@/components/input-field';
import PreguntaInput from '@/components/PreguntaInput';
import GenderSelector from '@/components/sexo';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface BreadcrumbItem {
    title: string;
    href: string;
}

interface SugerenciaColonia {
    id: number;
    nombre: string;
    municipio: string;
    seccion: number;
}

interface SugerenciaCalle {
    id: number;
    tipo: number;
    nombre: string;
}

declare const route: any;

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Registro de Beneficiario', href: '/consulta/registro' },
];

export default function Create() {
    const { props } = usePage<any>();
    const advertencia = props.flash?.advertencia;
    const coincidencias = props.flash?.coincidencias;

    const { data, setData, post, processing, errors, reset, setErrors } = useForm({
        nombre: '',
        snombre: '',
        apellido: '',
        sapellido: '',
        colonia: '',
        telefono: '',
        calle: '',
        numint: '',
        numext: '',
        municipio: '',
        cp: '',
        nacimiento: '',
        edad: '',
        tarjeta: '',
        genero: '',
        respuestas: {} as Record<number, string>,
        detalles: {} as Record<number, string>,
    });

    const [sugerenciasColonias, setSugerenciasColonias] = useState<SugerenciaColonia[]>([]);
    const [mostrarColonias, setMostrarColonias] = useState(false);

    const [sugerenciasCalles, setSugerenciasCalles] = useState<SugerenciaCalle[]>([]);
    const [mostrarCalles, setMostrarCalles] = useState(false);

    useEffect(() => {
        const buscarColonias = async () => {
            if (data.colonia.length >= 2) {
                try {
                    const response = await axios.get(`/api/colonias/buscar?q=${data.colonia}`);
                    setSugerenciasColonias(response.data);
                    setMostrarColonias(true);
                } catch (error) {
                    console.error('Error al consultar colonias:', error);
                }
            } else {
                setSugerenciasColonias([]);
                setMostrarColonias(false);
            }
        };

        const temporizador = setTimeout(() => {
            buscarColonias();
        }, 300);

        return () => clearTimeout(temporizador);
    }, [data.colonia]);

    useEffect(() => {
        const buscarCalles = async () => {
            if (data.calle.length >= 2) {
                try {
                    const response = await axios.get(`/api/calles/buscar?q=${data.calle}`);
                    setSugerenciasCalles(response.data);
                    setMostrarCalles(true);
                } catch (error) {
                    console.error('Error al consultar calles:', error);
                }
            } else {
                setSugerenciasCalles([]);
                setMostrarCalles(false);
            }
        };

        const temporizador = setTimeout(() => {
            buscarCalles();
        }, 300);

        return () => clearTimeout(temporizador);
    }, [data.calle]);

    const seleccionarColonia = (nombreColonia: string, nombreMunicipio: string) => {
        setData((prev) => ({
            ...prev,
            colonia: nombreColonia,
            municipio: nombreMunicipio,
        }));
        setMostrarColonias(false);
    };

    const seleccionarCalle = (nombreCalle: string) => {
        setData('calle', nombreCalle);
        setMostrarCalles(false);
    };

    const lanzarAlertaExito = async () => {
        await MySwal.fire({
            title: <p className="text-xl font-bold text-neutral-800">¡Registro Exitoso!</p>,
            html: <span className="text-sm text-neutral-600">El beneficiario se ha guardado correctamente en el sistema.</span>,
            icon: 'success',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#1FB7E9',
            customClass: {
                popup: 'rounded-xl shadow-lg border border-neutral-100',
            },
        });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('consulta.store'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                if (!page.props.flash?.advertencia) {
                    lanzarAlertaExito().then(() => {
                        reset();
                    });
                }
            },
        });
    };

    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 6) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 10)}`;
    };

    const handleConfirmarForzado = async () => {
        try {
            const response = await axios.post(route('consulta.store'), {
                ...data,
                fuerza_bruta: true,
            });

            if (response.data.success) {
                await lanzarAlertaExito();
                reset();
                window.location.href = response.data.redirect;
            }
        } catch (error: any) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                MySwal.fire({
                    title: 'Error',
                    text: 'Ocurrió un problema al procesar la inserción.',
                    icon: 'error',
                    confirmButtonColor: '#DC2626',
                });
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registro de Beneficiario" />

            <div className="w-full space-y-6 p-10">
                {/* FORMULARIO PRINCIPAL */}
                <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-8 pt-6 pb-4 border-b border-neutral-100 bg-gradient-to-r from-white to-neutral-50">
                        <h2 className="text-2xl font-bold text-neutral-800 tracking-tight">Registro de Beneficiario</h2>
                        <p className="text-sm text-neutral-500 mt-1">Introduzca los datos del beneficiario.</p>
                    </div>

                    <div className="p-8">
                        {errors.error && (
                            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                                <p className="text-sm font-medium text-red-800">{errors.error}</p>
                            </div>
                        )}

                        {advertencia && (
                            <div className="mb-6 rounded-xl border-2 border-amber-500 bg-amber-50 p-6 shadow-md">
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="text-2xl">⚠️</span>
                                    <h3 className="text-lg font-bold text-amber-800">{advertencia}</h3>
                                </div>

                                <p className="mb-4 text-sm text-amber-700 font-medium">Datos de Beneficiario con Coincidencias en el Sistema:</p>

                                <div className="mb-4 overflow-x-auto rounded-lg border border-amber-200 bg-white">
                                    <table className="w-full text-left text-sm text-gray-700">
                                        <thead className="bg-amber-100 font-semibold text-amber-900">
                                            <tr>
                                                <th className="px-6 py-3">Nombre Beneficiario</th>
                                                <th className="px-6 py-3">Fecha Nacimiento</th>
                                                <th className="px-6 py-3">Ubicación</th>
                                                <th className="px-6 py-3">Teléfono</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {coincidencias?.map((item: any) => (
                                                <tr key={item.id} className="hover:bg-amber-50/50 transition-colors">
                                                    <td className="px-6 py-3 font-medium">
                                                        {item.nombre} {item.snombre} {item.apellido} {item.sapellido}
                                                    </td>
                                                    <td className="px-6 py-3">{item.nacimiento}</td>
                                                    <td className="px-6 py-3 text-xs">
                                                        {item.municipio}, Col. {item.colonia}, Calle {item.calle} #{item.numext}
                                                    </td>
                                                    <td className="px-6 py-3">{item.telefono}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => window.location.reload()}
                                        className="rounded-lg bg-gray-200 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
                                    >
                                        Cancelar y Corregir
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleConfirmarForzado}
                                        className="rounded-lg bg-amber-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-amber-700"
                                    >
                                        Ignorar Alerta e Insertar Registro
                                    </button>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Datos Personales */}
                            <div>
                                <h3 className="text-base font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-200">Datos Personales</h3>
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                                    <InputField
                                        label="Primer Nombre"
                                        id="nombre"
                                        type="text"
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        error={errors.nombre}
                                        placeholder="Primer Nombre"
                                        required
                                    />
                                    <InputField
                                        label="Segundo Nombre"
                                        id="snombre"
                                        type="text"
                                        value={data.snombre}
                                        onChange={(e) => setData('snombre', e.target.value)}
                                        error={errors.snombre}
                                        placeholder="Segundo Nombre"
                                    />
                                    <InputField
                                        label="Primer Apellido"
                                        id="apellido"
                                        type="text"
                                        value={data.apellido}
                                        onChange={(e) => setData('apellido', e.target.value)}
                                        error={errors.apellido}
                                        placeholder="Primer Apellido"
                                        required
                                    />
                                    <InputField
                                        label="Segundo Apellido"
                                        id="sapellido"
                                        type="text"
                                        value={data.sapellido}
                                        onChange={(e) => setData('sapellido', e.target.value)}
                                        error={errors.sapellido}
                                        placeholder="Segundo Apellido"
                                    />
                                </div>
                            </div>

                            {/* Domicilio */}
                            <div>
                                <h3 className="text-base font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-200">Domicilio</h3>
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                                    <div className="relative">
                                        <InputField
                                            label="Colonia"
                                            id="colonia"
                                            type="text"
                                            value={data.colonia}
                                            onChange={(e) => setData('colonia', e.target.value)}
                                            error={errors.colonia}
                                            placeholder="Escribe para buscar..."
                                            required
                                            autoComplete="off"
                                        />
                                        {data.municipio && (
                                            <span className="absolute top-9 right-2 rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                                                {data.municipio}
                                            </span>
                                        )}

                                        {mostrarColonias && sugerenciasColonias.length > 0 && (
                                            <ul className="absolute z-50 mt-1 max-h-60 w-full divide-y divide-neutral-100 overflow-auto rounded-lg border border-neutral-200 bg-white shadow-lg">
                                                {sugerenciasColonias.map((colonia) => (
                                                    <li
                                                        key={colonia.id}
                                                        onClick={() => seleccionarColonia(colonia.nombre, colonia.municipio)}
                                                        className="cursor-pointer px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
                                                    >
                                                        {colonia.nombre} - {colonia.municipio} - {colonia.seccion}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <InputField
                                            label="Calle"
                                            id="calle"
                                            type="text"
                                            value={data.calle}
                                            onChange={(e) => setData('calle', e.target.value)}
                                            error={errors.calle}
                                            placeholder="Escribe para buscar..."
                                            required
                                            autoComplete="off"
                                        />
                                        {mostrarCalles && sugerenciasCalles.length > 0 && (
                                            <ul className="absolute z-50 mt-1 max-h-60 w-full divide-y divide-neutral-100 overflow-auto rounded-lg border border-neutral-200 bg-white shadow-lg">
                                                {sugerenciasCalles.map((calle) => (
                                                    <li
                                                        key={calle.id}
                                                        onClick={() => seleccionarCalle(calle.nombre)}
                                                        className="cursor-pointer px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
                                                    >
                                                        {calle.nombre} - {calle.tipo === 1 ? 'Calle' : 'Avenida'}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <InputField
                                        label="Número Externo"
                                        id="numext"
                                        type="text"
                                        value={data.numext}
                                        onChange={(e) => setData('numext', e.target.value)}
                                        error={errors.numext}
                                        placeholder="XXXX"
                                    />
                                    <InputField
                                        label="Número Interno"
                                        id="numint"
                                        type="text"
                                        value={data.numint}
                                        onChange={(e) => setData('numint', e.target.value)}
                                        error={errors.numint}
                                        placeholder="XXXX"
                                    />
                                </div>
                            </div>

                            {/* Información Adicional */}
                            <div>
                                <h3 className="text-base font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-200">Información Adicional</h3>
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                                    <InputField
                                        label="Código Postal"
                                        id="cp"
                                        type="text"
                                        value={data.cp}
                                        onChange={(e) => setData('cp', e.target.value)}
                                        error={errors.cp}
                                        placeholder="XXXXX"
                                    />
                                    <InputField
                                        label="Fecha de nacimiento"
                                        id="nacimiento"
                                        type="date"
                                        value={data.nacimiento}
                                        onChange={(e) => setData('nacimiento', e.target.value)}
                                        error={errors.nacimiento}
                                    />
                                    <InputField
                                        label="Teléfono"
                                        id="telefono"
                                        type="text"
                                        value={data.telefono}
                                        onChange={(e) => {
                                            const formatted = formatPhoneNumber(e.target.value);
                                            setData('telefono', formatted);
                                        }}
                                        error={errors.telefono}
                                        placeholder="123 456 7890"
                                    />
                                    <GenderSelector value={data.genero} onChange={(val) => setData('genero', val)} error={errors.genero} />
                                </div>
                            </div>

                            {/* Edad */}
                            <div>
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                                    <InputField
                                        label="Edad"
                                        id="edad"
                                        type="number"
                                        value={data.edad}
                                        onChange={(e) => setData('edad', e.target.value)}
                                        error={errors.edad}
                                        placeholder="Edad"
                                    />
                                </div>
                            </div>

                            {/* Preguntas de Evaluación */}
                            {props.preguntas && props.preguntas.length > 0 && (
                                <div>
                                    <h3 className="text-base font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-200">
                                        Evaluación Social - {props.preguntas.length} Preguntas
                                    </h3>
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {props.preguntas.map((pregunta: any) => (
                                            <PreguntaInput key={pregunta.id} pregunta={pregunta} data={data} setData={setData} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Botones de acción */}
                            <div className="flex justify-end gap-4 pt-6 border-t border-neutral-200">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="rounded-lg border-2 border-neutral-300 bg-white px-6 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-[#1FB7E9] px-8 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#1699c2] hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Guardando...
                                        </span>
                                    ) : (
                                        'Registrar Beneficiario'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }
            `}</style>
        </AppLayout>
    );
}
