import InputField from '@/components/input-field';
import GenderSelector from '@/components/sexo';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import axios from 'axios';
import { FormEvent, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from "sweetalert2-react-content";
import { useAutocompletado } from '@/hooks/useAutocompletado';

const MySwal = withReactContent(Swal);

// --- INTERFACES ESTÁNDAR ---
interface BreadcrumbItem { title: string; href: string; }
interface Beneficiario {
    id: number; nombre: string; snombre: string | null; apellido: string; sapellido: string | null;
    colonia: string; telefono: string | null; calle: string; numint: string | null; numext: string | null;
    municipio: string; cp: string | null; nacimiento: string; edad: string | null; tarjeta: string | null; genero: string;
}
interface BeneficioDisponible { id: number; nombre: string; descripcion: string | null; }

declare const route: any;
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Filtro y Actualización', href: '#' },
];

/**
 * Normaliza objetos del backend mitigando diferencias de mayúsculas/minúsculas en las llaves (Atributos SQL)
 */
const normalizarObjeto = (obj: any): Record<string, string> => {
    if (!obj) return {};
    return new Proxy(obj, {
        get: (target, prop: string) => {
            const keyFound = Object.keys(target).find(k => k.toLowerCase() === prop.toLowerCase());
            const value = keyFound ? target[keyFound] : '';
            if (prop.toLowerCase() === 'telefono' && value) {
                return String(value).replace(/\s+/g, '');
            }
            return value !== null ? String(value) : '';
        }
    });
};

export default function ConsultaDinamica() {
    const { props } = usePage<any>();
    
    const beneficiarios: any[] = props.beneficiarios || [];
    const filtros = props.filtros || {};
    const haFiltrado = !!(filtros.nombre || filtros.apellido || filtros.nacimiento);
    
    const beneficiosDisponibles: BeneficioDisponible[] = Array.isArray(props.beneficios) 
        ? props.beneficios 
        : Object.values(props.beneficios || {});

    // Estados para la consulta de filtros
    const [fNombre, setFNombre] = useState(filtros.nombre || '');
    const [fApellido, setFApellido] = useState(filtros.apellido || '');
    const [fNacimiento, setFNacimiento] = useState(filtros.nacimiento || '');

    const [beneficiarioSeleccionado, setBeneficiarioSeleccionado] = useState<any | null>(null);
    const [cargandoDatos, setCargandoDatos] = useState(false);
    const [erroresServidor, setErroresServidor] = useState<Record<string, string>>({});

    // Formulario Inyectado controlado de Inertia
    const { data, setData, processing, errors, reset, clearErrors } = useForm({
        nombre: '', snombre: '', apellido: '', sapellido: '', colonia: '', telefono: '',
        calle: '', numint: '', numext: '', municipio: '', cp: '', nacimiento: '',
        edad: '', tarjeta: '', genero: '', beneficios: [] as number[],
    });

    // Limpiar errores del servidor cuando se selecciona un nuevo beneficiario
    useEffect(() => {
        setErroresServidor({});
        clearErrors();
    }, [beneficiarioSeleccionado]);

    // Custom Hooks para manejar búsquedas asíncronas con debounce incorporado
    const colonias = useAutocompletado('/api/colonias/buscar', data.colonia, cargandoDatos);
    const calles = useAutocompletado('/api/calles/buscar', data.calle, cargandoDatos);

    const handleBuscar = (e: FormEvent) => {
        e.preventDefault();
        router.get(route('consulta.index'), 
            { nombre: fNombre, apellido: fApellido, nacimiento: fNacimiento },
            { preserveState: true, preserveScroll: true }
        );
    };

    const seleccionarParaEditar = async (b: any) => {
        setCargandoDatos(true); 
        setBeneficiarioSeleccionado(b);
        const proxyB = normalizarObjeto(b);
        
        try {
            const response = await axios.get(`/api/beneficiarios/${proxyB.id}/beneficios`);
            const beneficiosIds = response.data.map((item: any) => 
                typeof item === 'object' && item !== null ? (item.id ?? item.beneficio_id) : item
            );

            setData({
                nombre: proxyB.nombre,
                snombre: proxyB.snombre,
                apellido: proxyB.apellido,
                sapellido: proxyB.sapellido,
                colonia: proxyB.colonia,
                telefono: proxyB.telefono,
                calle: proxyB.calle,
                numint: proxyB.numint,
                numext: proxyB.numext,
                municipio: proxyB.municipio,
                cp: proxyB.cp,
                nacimiento: proxyB.nacimiento,
                edad: proxyB.edad,
                tarjeta: proxyB.tarjeta,
                genero: proxyB.genero,
                beneficios: beneficiosIds,
            });

            setTimeout(() => {
                document.getElementById('area-edicion')?.scrollIntoView({ behavior: 'smooth' });
                setCargandoDatos(false); 
            }, 80);

        } catch (error) {
            setCargandoDatos(false);
            console.error('Error al recuperar pivotes de beneficios:', error);
            MySwal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los beneficios asignados',
                icon: 'error',
                confirmButtonColor: '#EF4444'
            });
        }
    };

    const handleEliminarRegistro = (id: number, nombreCompleto: string) => {
        MySwal.fire({
            title: '¿Está seguro de eliminar?',
            text: `El registro de "${nombreCompleto}" y sus beneficios asignados se borrarán permanentemente.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('consulta.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        MySwal.fire({ 
                            title: '¡Eliminado!', 
                            text: 'El beneficiario ha sido removido.', 
                            icon: 'success', 
                            confirmButtonColor: '#1FB7E9' 
                        });
                        if ((beneficiarioSeleccionado?.id ?? beneficiarioSeleccionado?.ID) === id) {
                            setBeneficiarioSeleccionado(null);
                            reset();
                        }
                    },
                    onError: (errors) => {
                        MySwal.fire({
                            title: 'Error',
                            text: 'No se pudo eliminar el registro',
                            icon: 'error',
                            confirmButtonColor: '#EF4444'
                        });
                    }
                });
            }
        });
    };

    const handleCheckboxChange = (id: number, checked: boolean) => {
        setData('beneficios', checked ? [...data.beneficios, id] : data.beneficios.filter(bId => bId !== id));
    };

    const handleUpdateSubmit = (e: FormEvent) => {
        e.preventDefault();
        const bId = beneficiarioSeleccionado?.id ?? beneficiarioSeleccionado?.ID;
        if (!bId) {
            MySwal.fire({
                title: 'Error',
                text: 'No se identificó el beneficiario a actualizar',
                icon: 'error',
                confirmButtonColor: '#EF4444'
            });
            return;
        }

        // Limpiar errores anteriores antes de enviar
        setErroresServidor({});
        clearErrors();

        // Usamos router.put correctamente
        router.put(route('consulta.update', bId), data, {
            preserveScroll: true,
            onSuccess: () => {
                // Solo mostramos éxito con SweetAlert, sin alerta de error
                MySwal.fire({ 
                    title: '¡Registro Actualizado!', 
                    text: 'Los cambios fueron aplicados con éxito.', 
                    icon: 'success', 
                    confirmButtonColor: '#1FB7E9',
                    timer: 2000,
                    showConfirmButton: true
                });
                setBeneficiarioSeleccionado(null);
                reset();
                setErroresServidor({});
                // Recargar la página para actualizar la tabla
                router.reload({ only: ['beneficiarios'] });
            },
            onError: (errors) => {
                console.error("Errores del servidor:", errors);
                
                // Guardar errores del servidor para mostrar en el formulario
                if (errors && Object.keys(errors).length > 0) {
                    setErroresServidor(errors);
                    
                    // Scroll al primer campo con error
                    const firstErrorField = Object.keys(errors)[0];
                    const errorElement = document.getElementById(`field-${firstErrorField}`);
                    if (errorElement) {
                        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        errorElement.focus();
                    }
                }
                
                // NO mostrar alerta de error de validación
                // Solo mostramos alerta para errores de conexión o del sistema
                if (errors && errors.message && typeof errors.message === 'string') {
                    MySwal.fire({
                        title: 'Error del sistema',
                        text: errors.message,
                        icon: 'error',
                        confirmButtonColor: '#EF4444'
                    });
                }
            }
        });
    };

    // Función para obtener el mensaje de error de un campo específico
    const getFieldError = (fieldName: string): string | undefined => {
        return erroresServidor[fieldName] || errors[fieldName];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Consulta y Actualización" />

            <div className="w-full space-y-6">
                {/* FORMULARIO BUSCADOR */}
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 border-b border-neutral-100 pb-3">
                        <h2 className="text-xl font-bold text-neutral-800">Criterios de Consulta</h2>
                        <p className="text-xs text-neutral-500">Tipee los datos para filtrar la base de datos.</p>
                    </div>
                    <form onSubmit={handleBuscar} className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 items-end">
                        <div>
                            <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1.5">Nombre</label>
                            <input 
                                type="text" 
                                value={fNombre} 
                                onChange={(e) => setFNombre(e.target.value)} 
                                placeholder="Primer Nombre" 
                                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800 focus:border-[#1FB7E9] focus:outline-none focus:ring-1 focus:ring-[#1FB7E9]" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1.5">Apellido</label>
                            <input 
                                type="text" 
                                value={fApellido} 
                                onChange={(e) => setFApellido(e.target.value)} 
                                placeholder="Primer Apellido" 
                                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800 focus:border-[#1FB7E9] focus:outline-none focus:ring-1 focus:ring-[#1FB7E9]" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1.5">Fecha de Nacimiento</label>
                            <input 
                                type="date" 
                                value={fNacimiento} 
                                onChange={(e) => setFNacimiento(e.target.value)} 
                                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800 focus:border-[#1FB7E9] focus:outline-none focus:ring-1 focus:ring-[#1FB7E9]" 
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-neutral-800 transition"
                        >
                            Buscar Registros
                        </button>
                    </form>
                </div>

                {/* TABLA DE RESULTADOS */}
                {haFiltrado && (
                    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                        <div className="p-4 bg-neutral-50 border-b border-neutral-100">
                            <h3 className="text-sm font-bold text-neutral-700 uppercase">Resultados Obtenidos</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-neutral-700">
                                <thead className="bg-neutral-100/50 text-xs font-semibold text-neutral-600 border-b border-neutral-200 uppercase">
                                    <tr>
                                        <th className="p-3">Beneficiario</th>
                                        <th className="p-3">F. Nacimiento</th>
                                        <th className="p-3">Domicilio</th>
                                        <th className="p-3 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {beneficiarios.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-xs text-neutral-400 italic">
                                                No se han encontrado registros coincidentes.
                                            </td>
                                        </tr>
                                    ) : (
                                        beneficiarios.map((b) => {
                                            const p = normalizarObjeto(b);
                                            return (
                                                <tr key={p.id} className={`transition-colors ${(beneficiarioSeleccionado?.id ?? beneficiarioSeleccionado?.ID) === Number(p.id) ? 'bg-blue-50/70' : 'hover:bg-neutral-50/50'}`}>
                                                    <td className="p-3 font-medium text-neutral-900">
                                                        {p.nombre} {p.snombre} {p.apellido} {p.sapellido}
                                                    </td>
                                                    <td className="p-3 whitespace-nowrap">{p.nacimiento}</td>
                                                    <td className="p-3 text-xs text-neutral-500">
                                                        {p.municipio}, Col. {p.colonia}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button 
                                                                type="button" 
                                                                onClick={() => seleccionarParaEditar(b)} 
                                                                className="rounded bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 text-xs font-bold transition shadow-xs"
                                                            >
                                                                Editar
                                                            </button>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleEliminarRegistro(Number(p.id), `${p.nombre} ${p.apellido}`)} 
                                                                className="rounded bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs font-bold transition shadow-xs"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* FORMULARIO DE EDICIÓN */}
                {beneficiarioSeleccionado && (
                    <div id="area-edicion" className="rounded-xl border border-amber-300 bg-white p-6 shadow-md transition-all duration-300 ring-2 ring-amber-500/10 animate-in slide-in-from-bottom-2 duration-200">
                        <div className="mb-5 border-b border-neutral-100 pb-3 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-neutral-800">Actualizar Registro Seleccionado</h3>
                                <p className="text-xs text-amber-600 font-medium">Modificando datos de: {data.nombre} {data.apellido}</p>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => { setBeneficiarioSeleccionado(null); reset(); setErroresServidor({}); }} 
                                className="text-xs font-bold text-neutral-400 hover:text-neutral-600"
                            >
                                ✕ Cerrar Editor
                            </button>
                        </div>
                        
                        {/* Resumen de errores (opcional, muestra un contador)
                        {Object.keys(erroresServidor).length > 0 && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                                <p className="text-sm font-semibold text-red-800">
                                    Por favor corrige los siguientes errores:
                                </p>
                                <ul className="mt-1 list-disc list-inside text-xs text-red-700">
                                    {Object.entries(erroresServidor).slice(0, 3).map(([campo, error]) => (
                                        <li key={campo}>
                                            <strong>{campo}:</strong> {error as string}
                                        </li>
                                    ))}
                                    {Object.keys(erroresServidor).length > 3 && (
                                        <li>...y {Object.keys(erroresServidor).length - 3} errores más</li>
                                    )}
                                </ul>
                            </div>
                        )} */}
                        
                        <form onSubmit={handleUpdateSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div id="field-nombre">
                                    <InputField 
                                        label="Primer Nombre" 
                                        id="nombre" 
                                        type="text" 
                                        value={data.nombre} 
                                        onChange={(e) => {
                                            setData('nombre', e.target.value);
                                            // Limpiar error específico cuando el usuario escribe
                                            if (erroresServidor.nombre) {
                                                const newErrors = { ...erroresServidor };
                                                delete newErrors.nombre;
                                                setErroresServidor(newErrors);
                                            }
                                        }} 
                                        error={getFieldError('nombre')} 
                                        required 
                                    />
                                </div>
                                <div id="field-snombre">
                                    <InputField 
                                        label="Segundo Nombre" 
                                        id="snombre" 
                                        type="text" 
                                        value={data.snombre} 
                                        onChange={(e) => setData('snombre', e.target.value)} 
                                        error={getFieldError('snombre')} 
                                    />
                                </div>
                                <div id="field-apellido">
                                    <InputField 
                                        label="Primer Apellido" 
                                        id="apellido" 
                                        type="text" 
                                        value={data.apellido} 
                                        onChange={(e) => {
                                            setData('apellido', e.target.value);
                                            if (erroresServidor.apellido) {
                                                const newErrors = { ...erroresServidor };
                                                delete newErrors.apellido;
                                                setErroresServidor(newErrors);
                                            }
                                        }} 
                                        error={getFieldError('apellido')} 
                                        required 
                                    />
                                </div>
                                <div id="field-sapellido">
                                    <InputField 
                                        label="Segundo Apellido" 
                                        id="sapellido" 
                                        type="text" 
                                        value={data.sapellido} 
                                        onChange={(e) => setData('sapellido', e.target.value)} 
                                        error={getFieldError('sapellido')} 
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div className="relative" id="field-colonia">
                                    <InputField 
                                        label="Colonia" 
                                        id="colonia" 
                                        type="text" 
                                        value={data.colonia} 
                                        onChange={(e) => {
                                            setData('colonia', e.target.value);
                                            if (erroresServidor.colonia) {
                                                const newErrors = { ...erroresServidor };
                                                delete newErrors.colonia;
                                                setErroresServidor(newErrors);
                                            }
                                        }} 
                                        error={getFieldError('colonia')} 
                                        required 
                                        autoComplete="off" 
                                    />
                                    {colonias.mostrar && colonias.lista.length > 0 && (
                                        <ul className="absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded border border-neutral-200 bg-white shadow-lg text-xs divide-y divide-neutral-100">
                                            {colonias.lista.map((c: any) => (
                                                <li 
                                                    key={c.id} 
                                                    onClick={() => { 
                                                        setData(p => ({ ...p, colonia: c.nombre, municipio: c.municipio })); 
                                                        colonias.setMostrar(false); 
                                                    }} 
                                                    className="cursor-pointer p-2 hover:bg-neutral-50"
                                                >
                                                    {c.nombre} - {c.municipio}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="relative" id="field-calle">
                                    <InputField 
                                        label="Calle" 
                                        id="calle" 
                                        type="text" 
                                        value={data.calle} 
                                        onChange={(e) => {
                                            setData('calle', e.target.value);
                                            if (erroresServidor.calle) {
                                                const newErrors = { ...erroresServidor };
                                                delete newErrors.calle;
                                                setErroresServidor(newErrors);
                                            }
                                        }} 
                                        error={getFieldError('calle')} 
                                        required 
                                        autoComplete="off" 
                                    />
                                    {calles.mostrar && calles.lista.length > 0 && (
                                        <ul className="absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded border border-neutral-200 bg-white shadow-lg text-xs divide-y divide-neutral-100">
                                            {calles.lista.map((ca: any) => (
                                                <li 
                                                    key={ca.id} 
                                                    onClick={() => { 
                                                        setData('calle', ca.nombre); 
                                                        calles.setMostrar(false); 
                                                    }} 
                                                    className="cursor-pointer p-2 hover:bg-neutral-50"
                                                >
                                                    {ca.nombre}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div id="field-numext">
                                    <InputField 
                                        label="Num Ext" 
                                        id="numext" 
                                        type="text" 
                                        value={data.numext} 
                                        onChange={(e) => setData('numext', e.target.value)} 
                                        error={getFieldError('numext')} 
                                    />
                                </div>
                                <div id="field-numint">
                                    <InputField 
                                        label="Num Int" 
                                        id="numint" 
                                        type="text" 
                                        value={data.numint} 
                                        onChange={(e) => setData('numint', e.target.value)} 
                                        error={getFieldError('numint')} 
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
                                <div id="field-cp">
                                    <InputField 
                                        label="C.P." 
                                        id="cp" 
                                        type="text" 
                                        value={data.cp} 
                                        onChange={(e) => setData('cp', e.target.value)} 
                                        error={getFieldError('cp')} 
                                    />
                                </div>
                                <div id="field-nacimiento">
                                    <InputField 
                                        label="Nacimiento" 
                                        id="nacimiento" 
                                        type="date" 
                                        value={data.nacimiento} 
                                        onChange={(e) => setData('nacimiento', e.target.value)} 
                                        error={getFieldError('nacimiento')} 
                                    />
                                </div>
                                <div id="field-edad">
                                    <InputField 
                                        label="Edad" 
                                        id="edad" 
                                        type="number" 
                                        value={data.edad} 
                                        onChange={(e) => setData('edad', e.target.value)} 
                                        error={getFieldError('edad')} 
                                    />
                                </div>
                                <div id="field-telefono">
                                    <InputField 
                                        label="Teléfono" 
                                        id="telefono" 
                                        type="tel" 
                                        value={data.telefono} 
                                        onChange={(e) => setData('telefono', e.target.value)} 
                                        error={getFieldError('telefono')} 
                                    />
                                </div>
                                <div id="field-genero">
                                    <GenderSelector 
                                        value={data.genero} 
                                        onChange={(val) => setData('genero', val)} 
                                        error={getFieldError('genero')} 
                                    />
                                </div>
                            </div>
                            
                            <div className="border-t border-neutral-100 pt-4">
                                <h4 className="text-xs font-semibold text-neutral-700 uppercase mb-2">Programas Sociales Asignados</h4>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                    {beneficiosDisponibles.map(b => (
                                        <label key={b.id} className="flex items-center gap-3 rounded border border-neutral-200 p-2.5 hover:bg-neutral-50 cursor-pointer text-xs">
                                            <input 
                                                type="checkbox" 
                                                className="h-4 w-4 rounded border-neutral-300 text-[#1FB7E9] focus:ring-[#1FB7E9]" 
                                                checked={data.beneficios.includes(b.id)} 
                                                onChange={(e) => handleCheckboxChange(b.id, e.target.checked)} 
                                            />
                                            <div>
                                                <span className="font-semibold block uppercase">{b.nombre}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                {getFieldError('beneficios') && (
                                    <p className="mt-1 text-xs text-red-600">{getFieldError('beneficios')}</p>
                                )}
                            </div>
                            
                            <div className="flex justify-start gap-3 border-t border-neutral-100 pt-3">
                                <button 
                                    type="submit" 
                                    disabled={processing} 
                                    className="rounded bg-[#1FB7E9] px-5 py-2 text-sm font-bold text-white shadow hover:bg-[#1699c2] transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Guardando...' : 'Aplicar Modificaciones'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => { setBeneficiarioSeleccionado(null); reset(); setErroresServidor({}); }} 
                                    className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}