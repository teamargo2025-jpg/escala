import { Fragment, useState } from 'react'
import { LECCION } from '../data/educacion.js'
import { APARTADO } from '../lib/apartados.js'
import { estadoLecciones } from '../lib/educacion.js'
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
  const { modulos, siguiente, completadas, total, terminado } = estadoLecciones(datos.educacion)
  return (
    <Marco {...marco(guardado)}>
      <div className="progreso-edu">
        <div>
          <strong>
            {completadas} de {total}
          </strong>{' '}
          lecciones
        </div>
        <div className="mes__barra mes__barra--pos">
          <span style={{ width: `${(completadas / total) * 100}%` }} />
        </div>
        <small>Cada lección dura 2 minutos y termina con una pregunta. La siguiente se abre al responderla bien.</small>
      </div>

      {terminado && (
        <div className="aviso-hecho" role="status">
          <span>
            🎉 <strong>¡Terminaste la capacitación!</strong> Ya puedes repasar cualquier lección cuando quieras.
          </span>
        </div>
      )}

      {modulos.map((m) => (
        <section key={m.id} className="modulo" style={{ '--c': m.color, '--c-claro': m.claro }}>
          <h2 className="modulo__titulo">
            {m.nombre}
            <span>
              {m.hechas}/{m.lecciones.length}
            </span>
          </h2>
          <div className="lecciones">
            {m.lecciones.map((l) => {
              const esSiguiente = l.id === siguiente
              return (
                <button
                  key={l.id}
                  className={`leccion-tarjeta leccion-tarjeta--${l.estado}${esSiguiente ? ' leccion-tarjeta--siguiente' : ''}`}
                  onClick={() => ir(`/educacion/${l.estado === 'bloqueada' ? siguiente : l.id}`)}
                >
                  <span className="apartado__icono">
                    {l.estado === 'hecha' ? '✓' : l.estado === 'bloqueada' ? '🔒' : l.emoji}
                  </span>
                  <span className="apartado__texto">
                    <span className="apartado__detalle">Lección {l.numero}</span>
                    <span className="apartado__nombre">{l.titulo}</span>
                    {l.estado === 'bloqueada' && (
                      <span className="apartado__detalle">Primero termina: {l.anterior.titulo.toLowerCase()}</span>
                    )}
                  </span>
                  {esSiguiente ? <span className="apartado__chip">Sigue aquí</span> : <span className="apartado__flecha">→</span>}
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </Marco>
  )
}

export function Leccion({ id, datos, despachar, guardado, r, n }) {
  const [paso, setPaso] = useState(0)
  const [elegida, setElegida] = useState(null)
  // Se recuerda si ya estaba hecha ANTES de entrar: así el aviso de "abriste la siguiente" no desaparece al acertar.
  const [yaHecha] = useState(() => !!datos.educacion?.[id])
  const l = LECCION[id]
  const { lista, siguiente } = estadoLecciones(datos.educacion)
  const estado = lista.find((x) => x.id === id)?.estado

  if (!l) return <Redirigir a="/educacion" />
  // Una lección bloqueada manda a la que toca: la capacitación va en orden.
  if (estado === 'bloqueada') return <Redirigir a={`/educacion/${siguiente}`} />

  const tarjetas = l.tarjetas(r, n, datos.hechos ?? {})
  const pregunta = l.pregunta(r, n)
  const total = tarjetas.length + 1
  const enPregunta = paso >= tarjetas.length
  const acerto = elegida === pregunta.correcta
  const siguienteTrasEsta = lista.find((x) => x.numero === (lista.find((y) => y.id === id)?.numero ?? 0) + 1)

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
          <BotonSiguiente onClick={() => setPaso(paso + 1)}>
            {paso === tarjetas.length - 1 ? 'Ir a la pregunta' : 'Siguiente'}
          </BotonSiguiente>
        ) : acerto ? (
          <BotonSiguiente onClick={() => (siguienteTrasEsta ? ir(`/educacion/${siguienteTrasEsta.id}`) : volver('/educacion'))}>
            {siguienteTrasEsta ? 'Siguiente lección →' : 'Terminar ✓'}
          </BotonSiguiente>
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
              const tono = elegida == null ? '' : i === pregunta.correcta && acerto ? ' opcion--bien' : i === elegida ? ' opcion--mal' : ''
              return (
                <button
                  key={o}
                  className={`opcion${tono}`}
                  disabled={acerto}
                  onClick={() => {
                    setElegida(i)
                    // Se marca hecha al acertar: eso abre la siguiente lección.
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
          {acerto && (
            <>
              {siguienteTrasEsta && !yaHecha && (
                <p className="nota-suave">Acabas de abrir la lección {siguienteTrasEsta.numero}: {siguienteTrasEsta.titulo}.</p>
              )}
              {l.accion && (
                <button className="btn btn--suave" onClick={() => ir(l.accion.ruta)}>
                  {l.accion.texto} →
                </button>
              )}
              <button className="btn btn--texto" onClick={() => volver('/educacion')}>
                Volver a las lecciones
              </button>
            </>
          )}
        </>
      )}
    </Marco>
  )
}
