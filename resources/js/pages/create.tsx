import InputField from '@/components/input-field';
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

interface BeneficioDisponible {
    id: number;
    nombre: string;
    descripcion: string | null;
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
    
    // BLINDAJE ANTI-PANTALLA EN BLANCO: Convertimos a array si llega como objeto indexado
    const beneficiosDisponibles: BeneficioDisponible[] = props.beneficios 
        ? (Array.isArray(props.beneficios) ? props.beneficios : Object.values(props.beneficios)) 
        : [];

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
        beneficios: [] as number[], // Arreglo de IDs numéricos para la tabla de unión
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

    // Control dinámico de Checkboxes múltiples (Inserta o remueve IDs del estado)
    const handleCheckboxChange = (beneficioId: number, checked: boolean) => {
        if (checked) {
            setData('beneficios', [...data.beneficios, beneficioId]);
        } else {
            setData('beneficios', data.beneficios.filter(id => id !== beneficioId));
        }
    };

    const lanzarAlertaExito = async () => {
        await MySwal.fire({
            title: <p className="font-bold text-xl text-neutral-800">¡Registro Exitoso!</p>,
            html: <span className="text-sm text-neutral-600">El beneficiario se ha guardado correctamente en el sistema.</span>,
            icon: 'success',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#1FB7E9',
            customClass: {
                popup: 'rounded-xl shadow-lg border border-neutral-100',
            }
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
            }
        });
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
                    confirmButtonColor: '#DC2626'
                });
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registro de Beneficiario" />

            <div className="w-full rounded-xl border border-neutral-200 bg-white p-[30px] shadow-sm">
                <div className="mb-6 border-b border-neutral-100 pb-4">
                    <h2 className="text-2xl font-bold text-neutral-800">Registro de Beneficiario.</h2>
                    <p className="mt-1 text-sm text-neutral-500">Introduzca los datos del beneficiario.</p>
                </div>

                {errors.error && (
                    <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-800">{errors.error}</p>
                    </div>
                )}

                {advertencia && (
                    <div className="mb-6 p-6 bg-red-600 border-2 border-amber-500 rounded-xl shadow-md">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">⚠️</span>
                            <h3 className="text-white font-bold text-lg">{advertencia}</h3>
                        </div>
                        
                        <p className="text-white text-sm mb-4">
                            Datos de Beneficiario con Coincidencias en el Sistema:
                        </p>

                        <div className="overflow-x-auto bg-white rounded-lg border border-amber-200 mb-4">
                            <table className="w-full text-left text-sm text-gray-700">
                                <thead className="bg-amber-100 text-amber-900 font-semibold">
                                    <tr>
                                        <th className="p-3">Nombre Beneficiario</th>
                                        <th className="p-3">Fecha Nacimiento</th>
                                        <th className="p-3">Ubicación</th>
                                        <th className="p-3">Teléfono</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {coincidencias?.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-amber-50/50">
                                            <td className="p-3 font-medium">{item.nombre} {item.snombre} {item.apellido} {item.sapellido}</td>
                                            <td className="p-3">{item.nacimiento}</td>
                                            <td className="p-3 text-xs">{item.municipio}, Col. {item.colonia}, Calle {item.calle} #{item.numext}</td>
                                            <td className="p-3">{item.telefono}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button 
                                type="button"
                                onClick={() => window.location.reload()} 
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium transition"
                            >
                                Cancelar y Corregir
                            </button>
                            
                            <button
                                type="button"
                                onClick={handleConfirmarForzado}
                                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-sm font-bold transition shadow-sm"
                            >
                                Ignorar Alerta e Insertar Registro
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
                                <ul className="absolute z-50 mt-1 max-h-60 w-full divide-y divide-neutral-100 overflow-auto rounded-md border border-neutral-200 bg-white shadow-lg">
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
                                <ul className="absolute z-50 mt-1 max-h-60 w-full divide-y divide-neutral-100 overflow-auto rounded-md border border-neutral-200 bg-white shadow-lg">
                                    {sugerenciasCalles.map((calle) => (
                                        <li
                                            key={calle.id}
                                            onClick={() => seleccionarCalle(calle.nombre)}
                                            className="cursor-pointer px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
                                        >
                                            {calle.nombre} - {calle.tipo}
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

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
                            type="tel"
                            value={data.telefono}
                            onChange={(e) => setData('telefono', e.target.value)}
                            error={errors.telefono}
                            placeholder="449 000 0000"
                        />

                        <GenderSelector value={data.genero} onChange={(val) => setData('genero', val)} error={errors.genero} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <InputField
                            label="Edad"
                            id="edad"
                            type="text"
                            value={data.edad}
                            onChange={(e) => setData('edad', e.target.value)}
                            error={errors.edad}
                            placeholder="Edad"
                        />
                    </div>

                    {/* SECCIÓN DE CHECKBOXES DINÁMICOS DE BENEFICIOS */}
                    <div className="border-t border-neutral-100 pt-5">
                        <h3 className="text-sm font-semibold text-neutral-800 mb-3">Asignación de Beneficios Programáticos</h3>
                        {beneficiosDisponibles.length === 0 ? (
                            <p className="text-xs text-neutral-400 italic">No hay programas sociales o beneficios activos creados en el catálogo.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                                {beneficiosDisponibles.map((beneficio) => (
                                    <label 
                                        key={beneficio.id} 
                                        className="flex items-start gap-3 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50 cursor-pointer transition-colors select-none"
                                    >
                                        <input
                                            type="checkbox"
                                            className="mt-1 h-4 w-4 rounded border-neutral-300 text-[#1FB7E9] focus:ring-[#1FB7E9]"
                                            checked={data.beneficios.includes(beneficio.id)}
                                            onChange={(e) => handleCheckboxChange(beneficio.id, e.target.checked)}
                                        />
                                        <div className="text-sm">
                                            <span className="block font-medium text-neutral-700 uppercase">{beneficio.nombre}</span>
                                            {beneficio.descripcion && (
                                                <span className="block text-xs text-neutral-400 mt-0.5">{beneficio.descripcion}</span>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                        {errors.beneficios && (
                            <p className="mt-1 text-xs text-red-600 font-medium">{errors.beneficios}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-start gap-3 border-t border-neutral-100 pt-4">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-[#1FB7E9] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#199ecb]"
                            disabled={processing}
                        >
                            Registrar Beneficiario
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}