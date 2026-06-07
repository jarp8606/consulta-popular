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
interface BreadcrumbItem { 
    title: string; 
    href: string; 
}

interface Pregunta {
    id: number;
    descripcion: string;
    activa: boolean;
}

interface RespuestaUsuario {
    id?: number;
    registro_id?: number;
    pregunta_id: number;
    catalogo_id: number | null;
    valor_extra: string | null;
    detalle: string | null;
    catalogo?: {
        id: number;
        nombre: string;
        pregunta_id: number;
    };
}

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
    const preguntas: Pregunta[] = props.preguntas || [];

    // Estados para la consulta de filtros
    const [fNombre, setFNombre] = useState(filtros.nombre || '');
    const [fApellido, setFApellido] = useState(filtros.apellido || '');
    const [fNacimiento, setFNacimiento] = useState(filtros.nacimiento || '');

    const [beneficiarioSeleccionado, setBeneficiarioSeleccionado] = useState<any | null>(null);
    const [cargandoDatos, setCargandoDatos] = useState(false);
    const [erroresServidor, setErroresServidor] = useState<Record<string, string>>({});

    // Formulario Inyectado controlado de Inertia
    const { data, setData, processing, errors, reset, clearErrors } = useForm({
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
        catalogo_ids: {} as Record<number, number | null>,
        detalles: {} as Record<number, string>,
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
            const url = `/api/beneficiarios/${proxyB.id}/respuestas`;
            const responseRespuestas = await axios.get(url);
            const respuestasData: RespuestaUsuario[] = Array.isArray(responseRespuestas.data) ? responseRespuestas.data : [];
            
            const respuestasFormateadas: Record<number, string> = {};
            const catalogoIdsFormateados: Record<number, number | null> = {};
            const detallesFormateados: Record<number, string> = {};
            
            respuestasData.forEach((item: RespuestaUsuario) => {
                if (item.valor_extra) {
                    respuestasFormateadas[item.pregunta_id] = item.valor_extra;
                }
                
                if (item.catalogo_id) {
                    catalogoIdsFormateados[item.pregunta_id] = item.catalogo_id;
                }
                
                // Para la pregunta 6, el detalle puede venir del catálogo o del campo detalle
                if (item.pregunta_id === 6) {
                    if (item.catalogo && item.catalogo.nombre) {
                        detallesFormateados[item.pregunta_id] = item.catalogo.nombre;
                    } else if (item.detalle) {
                        detallesFormateados[item.pregunta_id] = item.detalle;
                    }
                } else {
                    // Para otras preguntas, solo mostrar detalle si es SI
                    if (item.catalogo && item.catalogo.nombre && item.valor_extra === 'SI') {
                        detallesFormateados[item.pregunta_id] = item.catalogo.nombre;
                    } else if (item.detalle && item.valor_extra === 'SI') {
                        detallesFormateados[item.pregunta_id] = item.detalle;
                    }
                }
            });

            setData({
                nombre: proxyB.nombre || '',
                snombre: proxyB.snombre || '',
                apellido: proxyB.apellido || '',
                sapellido: proxyB.sapellido || '',
                colonia: proxyB.colonia || '',
                telefono: proxyB.telefono || '',
                calle: proxyB.calle || '',
                numint: proxyB.numint || '',
                numext: proxyB.numext || '',
                municipio: proxyB.municipio || '',
                cp: proxyB.cp || '',
                nacimiento: proxyB.nacimiento || '',
                edad: proxyB.edad || '',
                tarjeta: proxyB.tarjeta || '',
                genero: proxyB.genero || '',
                respuestas: respuestasFormateadas,
                catalogo_ids: catalogoIdsFormateados,
                detalles: detallesFormateados,
            });

            setTimeout(() => {
                document.getElementById('area-edicion')?.scrollIntoView({ behavior: 'smooth' });
                setCargandoDatos(false); 
            }, 80);

        } catch (error: any) {
            setCargandoDatos(false);
            console.error('Error al recuperar respuestas:', error);
            
            MySwal.fire({
                title: 'Error',
                text: 'No se pudieron cargar las respuestas del beneficiario',
                icon: 'error',
                confirmButtonColor: '#EF4444'
            });
        }
    };

    const handleEliminarRegistro = (id: number, nombreCompleto: string) => {
        MySwal.fire({
            title: '¿Está seguro de eliminar?',
            text: `El registro de "${nombreCompleto}" se borrará permanentemente.`,
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

        setErroresServidor({});
        clearErrors();

        const dataToSend = {
            ...data,
            respuestas: data.respuestas,
            catalogo_ids: data.catalogo_ids,
            detalles: data.detalles
        };

        router.put(route('consulta.update', bId), dataToSend, {
            preserveScroll: true,
            onSuccess: () => {
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
                router.reload({ only: ['beneficiarios'] });
            },
            onError: (errors) => {
                console.error("Errores del servidor:", errors);
                
                if (errors && Object.keys(errors).length > 0) {
                    setErroresServidor(errors);
                    
                    const firstErrorField = Object.keys(errors)[0];
                    const errorElement = document.getElementById(`field-${firstErrorField}`);
                    if (errorElement) {
                        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        errorElement.focus();
                    }
                }
                
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

    const getFieldError = (fieldName: string): string | undefined => {
        if (fieldName.includes('.')) {
            const [parent, child] = fieldName.split('.');
            if (erroresServidor[parent] && typeof erroresServidor[parent] === 'object') {
                return (erroresServidor[parent] as any)[child];
            }
            return undefined;
        }
        return erroresServidor[fieldName] || errors[fieldName];
    };

    const handleRespuestaChange = (preguntaId: number, valor: string) => {
        setData('respuestas', {
            ...data.respuestas,
            [preguntaId]: valor
        });
        
        // Para la pregunta 6: si cambia a "SI", limpiar el detalle de NO
        if (preguntaId === 6) {
            if (valor === 'SI') {
                // Si responde SI, limpiamos el detalle (porque solo aplica para NO)
                setData('detalles', {
                    ...data.detalles,
                    [preguntaId]: ''
                });
                setData('catalogo_ids', {
                    ...data.catalogo_ids,
                    [preguntaId]: null
                });
            }
            // Si responde NO, mantenemos el detalle para que el usuario lo llene
        } else {
            // Para otras preguntas: si cambia a "NO", limpiar el detalle
            if (valor === 'NO') {
                setData('detalles', {
                    ...data.detalles,
                    [preguntaId]: ''
                });
                setData('catalogo_ids', {
                    ...data.catalogo_ids,
                    [preguntaId]: null
                });
            }
        }
        
        if (erroresServidor[`respuestas.${preguntaId}`]) {
            const newErrors = { ...erroresServidor };
            delete newErrors[`respuestas.${preguntaId}`];
            setErroresServidor(newErrors);
        }
    };

    const handleDetalleChange = (preguntaId: number, valor: string) => {
        setData('detalles', {
            ...data.detalles,
            [preguntaId]: valor
        });
    };

    // Verificar si debe mostrar el campo de detalle para una pregunta específica
    const shouldShowDetalle = (pregunta: Pregunta) => {
        const respuesta = data.respuestas[pregunta.id];
        
        if (pregunta.id === 6) {
            // Para pregunta 6: mostrar el campo cuando la respuesta es "NO"
            return respuesta === 'NO';
        } else {
            // Para otras preguntas: mostrar el campo cuando la respuesta es "SI"
            return respuesta === 'SI';
        }
    };

    // Obtener el placeholder para el campo de detalle
    const getDetallePlaceholder = (pregunta: Pregunta) => {
        if (pregunta.id === 6) {
            return "Por favor, especifique el motivo o situación...";
        } else {
            return "Por favor, proporcione más detalles...";
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Consulta y Actualización" />

            <div className="w-full space-y-6 p-10">
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
                        
                        <form onSubmit={handleUpdateSubmit} className="space-y-5">
                            {/* Datos Personales */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div id="field-nombre">
                                    <InputField 
                                        label="Primer Nombre" 
                                        id="nombre" 
                                        type="text" 
                                        value={data.nombre} 
                                        onChange={(e) => {
                                            setData('nombre', e.target.value);
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
                            
                            {/* Dirección */}
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
                                        label="Número Exterior" 
                                        id="numext" 
                                        type="text" 
                                        value={data.numext} 
                                        onChange={(e) => setData('numext', e.target.value)} 
                                        error={getFieldError('numext')} 
                                    />
                                </div>
                                <div id="field-numint">
                                    <InputField 
                                        label="Número Interior" 
                                        id="numint" 
                                        type="text" 
                                        value={data.numint} 
                                        onChange={(e) => setData('numint', e.target.value)} 
                                        error={getFieldError('numint')} 
                                    />
                                </div>
                            </div>
                            
                            {/* Datos adicionales */}
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

                            {/* SECCIÓN DE RESPUESTAS CON RADIO BUTTONS */}
                            {preguntas.length > 0 && (
                                <div className="border-t border-neutral-100 pt-4 mt-4">
                                    <h4 className="text-sm font-bold text-neutral-800 mb-4">
                                        Evaluación Social - {preguntas.length} Preguntas
                                    </h4>
                                    <div className="space-y-4">
                                        {preguntas.map((pregunta, index) => (
                                            <div key={pregunta.id} className="border border-neutral-200 rounded-lg p-4 bg-neutral-50/30">
                                                <label className="block text-sm font-semibold text-neutral-800 mb-3">
                                                    {index + 1}. {pregunta.descripcion}


                                                </label>
                                                
                                                <div className="flex gap-6 mb-3">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`pregunta_${pregunta.id}`}
                                                            value="SI"
                                                            checked={data.respuestas[pregunta.id] === 'SI'}
                                                            onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                                                            className="w-4 h-4 text-[#1FB7E9] focus:ring-[#1FB7E9]"
                                                        />
                                                        <span className="text-sm text-neutral-700">Sí</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`pregunta_${pregunta.id}`}
                                                            value="NO"
                                                            checked={data.respuestas[pregunta.id] === 'NO'}
                                                            onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                                                            className="w-4 h-4 text-[#1FB7E9] focus:ring-[#1FB7E9]"
                                                        />
                                                        <span className="text-sm text-neutral-700">No</span>
                                                    </label>
                                                </div>
                                                
                                                {/* Campo de detalle/descripción con lógica especial para pregunta 6 */}
                                                {shouldShowDetalle(pregunta) && (
                                                    <div className="mt-3">
                                                        <textarea
                                                            placeholder={getDetallePlaceholder(pregunta)}
                                                            value={data.detalles[pregunta.id] || ''}
                                                            onChange={(e) => handleDetalleChange(pregunta.id, e.target.value)}
                                                            rows={2}
                                                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-[#1FB7E9] focus:outline-none focus:ring-1 focus:ring-[#1FB7E9]"
                                                        />
                                                        {/* {data.catalogo_ids[pregunta.id] && (
                                                            <p className="mt-1 text-xs text-green-600">
                                                                ✓ Información registrada en catálogo
                                                            </p>
                                                        )} */}
                                                    </div>
                                                )}
                                                
                                                {getFieldError(`respuestas.${pregunta.id}`) && (
                                                    <p className="mt-1 text-xs text-red-600">{getFieldError(`respuestas.${pregunta.id}`)}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Botones de acción */}
                            <div className="flex justify-start gap-3 border-t border-neutral-100 pt-3 mt-4">
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