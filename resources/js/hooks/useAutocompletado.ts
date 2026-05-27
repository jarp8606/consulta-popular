import { useState, useEffect } from 'react';
import axios from 'axios';

export function useAutocompletado(endpoint: string, valorBusqueda: string, cargandoDatosGlobal: boolean) {
    const [lista, setLista] = useState<any[]>([]);
    const [mostrar, setMostrar] = useState(false);

    useEffect(() => {
        // Si el formulario principal se está cargando/poblando de un "Editar", bloqueamos la petición asíncrona automática
        if (cargandoDatosGlobal || !valorBusqueda || valorBusqueda.length < 2) {
            setMostrar(false);
            return;
        }

        // Controlador de aborto para evitar Race Conditions de peticiones lentas anteriores
        const controller = new AbortController();

        const delayDebounce = setTimeout(() => {
            axios.get(`${endpoint}?q=${valorBusqueda}`, { signal: controller.signal })
                .then(res => {
                    setLista(res.data);
                    setMostrar(true);
                })
                .catch(err => {
                    if (!axios.isCancel(err)) console.error("Error al buscar catálogo:", err);
                });
        }, 300); // Debounce de 300ms para no saturar PostgreSQL mientras el usuario tipea rápido

        return () => {
            clearTimeout(delayDebounce);
            controller.abort();
        };
    }, [valorBusqueda, endpoint, cargandoDatosGlobal]);

    return { lista, mostrar, setMostrar };
}