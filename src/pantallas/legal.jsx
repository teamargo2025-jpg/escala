import { DOCUMENTOS, RESPONSABLE } from '../data/legal.js'
import { enlaceWhatsapp } from '../data/asesores.js'
import { volver } from '../negocio.js'
import { Marco, Redirigir } from '../componentes.jsx'

// Los textos legales se leen igual con sesión o sin ella (desde la bienvenida o desde Mi cuenta).
export function Legal({ documento, guardado, alVolver = '/' }) {
  const doc = DOCUMENTOS[documento]
  if (!doc) return <Redirigir a={alVolver} />
  return (
    <Marco titulo={doc.titulo} emoji={doc.emoji} guardado={guardado} onAtras={() => volver(alVolver)}>
      <p className="legal__resumen">{doc.resumen}</p>
      {doc.secciones.map((s) => (
        <section key={s.titulo} className="legal__seccion">
          <h2>{s.titulo}</h2>
          {s.parrafos.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </section>
      ))}
      <a
        className="btn btn--whatsapp"
        href={enlaceWhatsapp({ telefono: `51${RESPONSABLE.telefono}` }, 'Hola, tengo una consulta sobre mis datos en ESCALA: ')}
        target="_blank"
        rel="noopener noreferrer"
      >
        Escribir por WhatsApp
      </a>
    </Marco>
  )
}
