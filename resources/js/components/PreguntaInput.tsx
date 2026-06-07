// resources/js/components/PreguntaInput.tsx
import InputField from '@/components/input-field';

export default function PreguntaInput({ pregunta, data, setData }: any) {
    // Definimos si el comportamiento es inverso (ej: vivienda)
    const esCasoInverso = pregunta.id === 6; 

    // Lógica para decidir si mostrar el campo de texto
    const mostrarInput = esCasoInverso 
        ? data.respuestas[pregunta.id] === 'no' 
        : data.respuestas[pregunta.id] === 'si';

    return (
        <div className="mb-4 p-4 border border-neutral-100 rounded-lg">
            <label className="block text-sm font-semibold text-neutral-800 mb-2">{pregunta.descripcion}</label>
            <div className="flex gap-4 mb-3">
                <label className="flex items-center gap-2"><input type="radio" value="si" checked={data.respuestas[pregunta.id] === 'si'} onChange={(e) => setData('respuestas', {...data.respuestas, [pregunta.id]: 'si'})}/> Sí</label>
                <label className="flex items-center gap-2"><input type="radio" value="no" checked={data.respuestas[pregunta.id] === 'no'} onChange={(e) => {
                    setData('respuestas', {...data.respuestas, [pregunta.id]: 'no'});
                    if (esCasoInverso) setData('detalles', {...data.detalles, [pregunta.id]: ''});
                }}/> No</label>
            </div>

            {mostrarInput && (
                <InputField
                    label="Describa:"
                    value={data.detalles[pregunta.id] || ''}
                    onChange={(e: any) => setData('detalles', {...data.detalles, [pregunta.id]: e.target.value})}
                    placeholder="Especifique aquí..."
                />
            )}
        </div>
    );
}