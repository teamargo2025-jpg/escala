import { ASESORES, enlaceWhatsapp } from '../data/asesores.js'
import { rubroDe } from '../data/rubros.js'
import { volver } from '../negocio.js'
import { Ayuda, Marco } from '../componentes.jsx'

// Abre WhatsApp con el mensaje escrito; la persona lo revisa y lo envía.
const mensaje = (perfil) => {
  const r = rubroDe(perfil)
  return `Hola, soy ${perfil.nickname} de "${perfil.emprendimiento}" (${r.nombre}). Estoy usando ESCALA y necesito ayuda con: `
}

export function Asesores({ perfil, guardado }) {
  return (
    <Marco titulo="Hablar con un asesor" emoji="💬" guardado={guardado} onAtras={() => volver('/')}>
      <p className="asesor__intro">
        ¿Te trabaste con tus números o con la app? Escríbele a una persona del equipo. Te va a responder por WhatsApp.
      </p>

      {ASESORES.map((a) => (
        <article key={a.id} className="asesor">
          <div className="asesor__cabeza">
            <span className="asesor__emoji">{a.emoji}</span>
            <div>
              <strong>{a.nombre}</strong>
              <span>{a.rol}</span>
            </div>
          </div>
          <p>{a.detalle}</p>
          <p className="asesor__horario">🕘 {a.horario}</p>
          <a className="btn btn--whatsapp" href={enlaceWhatsapp(a, mensaje(perfil))} target="_blank" rel="noopener noreferrer">
            Escribir por WhatsApp
          </a>
        </article>
      ))}

      <Ayuda etiqueta="¿Qué le escribo?">
        Cuéntale qué estabas haciendo y qué no te salió. Por ejemplo: "no sé qué poner en costos fijos" o "mi precio me
        sale muy alto". <br />
        El mensaje ya va escrito con tu nombre: solo agrega tu duda y toca enviar.
      </Ayuda>
    </Marco>
  )
}
