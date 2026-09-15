import { Fragment, useState } from 'react'
import { LECCION, LECCIONES } from '../data/educacion.js'
import { APARTADO } from '../lib/apartados.js'
import { ir, volver } from '../negocio.js'
import { BotonSiguiente, Marco, Redirigir } from '../componentes.jsx'

// "**negrita**" → <strong>
function Texto({ children }) {
  return (
    <p>
      {String(children)
        .split('**')
        .map((parte, i) => (i % 2 ? <strong key={i}>{parte}</strong> : <Fragment key={i}>{parte}</Fragment>))}
    </p>
  )
}

const marco = (guardado, extra) => ({
  titulo: APARTADO.educacion.nombre,
  emoji: APARTADO.educacion.emoji,
  guardado,
  onAtras: () => volver('/'),
  ...extra,
})

export function Educacion({ datos, guardado }) {
  const hechas = datos.educacion ?? {}
  const cuantas = LECCIONES.filter((l) => hechas[l.id]).length
  const siguiente = LECCIONES.find((l) => !hechas[l.id])
  return (
    <Marco {...marco(guardado)}>
      <div className="progreso-edu">
        <div>
          <strong>
            {cuantas} de {LECCIONES.length}
          </strong>{' '}
          lecciones
        </div>
        <div className="mes__barra mes__barra--pos">
          <span style={{ width: `${(cuantas / LECCIONES.length) * 100}%` }} />
        </div>
        <small>Cada lección toma 2 minutos y termina con una pregunta.</small>
      </div>
      <div className="lecciones">
        {LECCIONES.map((l, i) => (
          <button
            key={l.id}
            className={`leccion-tarjeta${hechas[l.id] ? ' leccion-tarjeta--hecha' : ''}${siguiente?.id === l.id ? ' leccion-tarjeta--siguiente' : ''}`}
            onClick={() => ir(`/educacion/${l.id}`)}
          >
            <span className="apartado__icono">{hechas[l.id] ? '✓' : l.emoji}</span>
            <span className="apartado__texto">
              <span className="apartado__detalle">Lección {i + 1}</span>
              <span className="apartado__nombre">{l.titulo}</span>
            </span>
            {siguiente?.id === l.id ? <span className="apartado__chip">Sigue aquí</span> : <span className="apartado__flecha">→</span>}
          </button>
        ))}
      </div>
    </Marco>
  )
}

export function Leccion({ id, datos, despachar, guardado, r, n }) {
  const l = LECCION[id]
  const [paso, setPaso] = useState(0)
  const [elegida, setElegida] = useState(null)
  if (!l) return <Redirigir a="/educacion" />
  const tarjetas = l.tarjetas(r, n, datos.hechos ?? {})
  const pregunta = l.pregunta(r, n)
  const total = tarjetas.length + 1
  const enPregunta = paso >= tarjetas.length
  const acerto = elegida === pregunta.correcta
  const yaHecha = datos.educacion?.[id]

  const terminar = () => volver('/educacion')

  return (
    <Marco
      {...marco(guardado, {
        titulo: l.titulo,
        emoji: l.emoji,
        pasos: { actual: paso + 1, total },
        onAtras: () => (paso > 0 ? (setPaso(paso - 1), setElegida(null)) : volver('/educacion')),
      })}
      pie={
        !enPregunta ? (
          <BotonSiguiente onClick={() => setPaso(paso + 1)}>{paso === tarjetas.length - 1 ? 'Ir a la pregunta' : 'Siguiente'}</BotonSiguiente>
        ) : acerto ? (
          <BotonSiguiente onClick={terminar}>Terminar lección ✓</BotonSiguiente>
        ) : null
      }
    >
      {!enPregunta ? (
        <div className="leccion">
          <span className="leccion__emoji">{l.emoji}</span>
          {paso === 0 && <h1 className="leccion__titulo">{l.titulo}</h1>}
          <Texto>{tarjetas[paso]}</Texto>
        </div>
      ) : (
        <>
          <div className="pregunta">
            <span className="aprende__etiqueta">Pregunta</span>
            <h1>{pregunta.texto}</h1>
          </div>
          <div className="opciones">
            {pregunta.opciones.map((o, i) => {
              const estado = elegida == null ? '' : i === pregunta.correcta && acerto ? ' opcion--bien' : i === elegida ? ' opcion--mal' : ''
              return (
                <button
                  key={o}
                  className={`opcion${estado}`}
                  disabled={acerto}
                  onClick={() => {
                    setElegida(i)
                    // Se marca hecha al acertar, aunque después salga por el botón de acción.
                    if (i === pregunta.correcta && !yaHecha) despachar({ tipo: 'leccion', id })
                  }}
                >
                  {o}
                </button>
              )
            })}
          </div>
          {elegida != null && (
            <div className={`respuesta ${acerto ? 'respuesta--bien' : 'respuesta--mal'}`} role="status">
              <strong>{acerto ? '¡Muy bien! 🎉' : 'Todavía no. Piénsalo otra vez.'}</strong>
              {acerto && <p>{pregunta.porQue}</p>}
            </div>
          )}
          {acerto && l.accion && (
            <button className="btn btn--suave" onClick={() => ir(l.accion.ruta)}>
              {l.accion.texto} →
            </button>
          )}
        </>
      )}
    </Marco>
  )
}
