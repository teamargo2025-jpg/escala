import { useRef, useState } from 'react'
import { ESTADOS_CONTENIDO, FOTO, IDEAS_GENERALES, IDEAS_POR_RUBRO, PALABRAS_MARCA } from '../data/marca.js'
import { APARTADO } from '../lib/apartados.js'
import { hoy } from '../lib/caja.js'
import { limpiarTexto } from '../lib/cuenta.js'
import { diasHasta, fechaBonita, fechaDeGrabacion, proximasFechas } from '../lib/marketing.js'
import { ir, volver } from '../negocio.js'
import { Ayuda, BotonSiguiente, CampoTexto, Marco, Pregunta } from '../componentes.jsx'

const marco = (guardado, extra) => ({
  titulo: APARTADO.marca.nombre,
  emoji: APARTADO.marca.emoji,
  guardado,
  onAtras: () => volver('/'),
  ...extra,
})

export const marcaDe = (datos) => datos.marca ?? { contenidos: [], palabras: [] }

// La foto se achica en el celular antes de guardarla: entra al negocio como texto.
export function leerFotoAchicada(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader()
    lector.onerror = () => reject(new Error('No se pudo leer la imagen'))
    lector.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('El archivo no es una imagen'))
      img.onload = () => {
        const lado = Math.min(img.width, img.height)
        const lienzo = document.createElement('canvas')
        lienzo.width = FOTO.lado
        lienzo.height = FOTO.lado
        const ctx = lienzo.getContext('2d')
        // Recorte cuadrado desde el centro.
        ctx.drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, FOTO.lado, FOTO.lado)
        resolve(lienzo.toDataURL('image/jpeg', FOTO.calidad))
      }
      img.src = lector.result
    }
    lector.readAsDataURL(archivo)
  })
}

export function FotoMarca({ foto, nombre, tamano = 'grande' }) {
  if (foto) return <img className={`foto-marca foto-marca--${tamano}`} src={foto} alt={`Logo de ${nombre}`} />
  return <span className={`foto-marca foto-marca--${tamano} foto-marca--vacia`}>{nombre.slice(0, 1).toUpperCase()}</span>
}

// ---------- Portada del apartado ----------
export function Marca({ datos, despachar, guardado, perfil, r }) {
  const m = marcaDe(datos)
  const proximas = proximasFechas(hoy(), 3)
  const pendientes = (m.contenidos ?? []).filter((c) => c.estado !== 'publicado').sort((a, b) => a.fecha.localeCompare(b.fecha))

  return (
    <Marco {...marco(guardado)}>
      <section className="marca-tarjeta">
        <FotoMarca foto={m.foto} nombre={perfil.emprendimiento} />
        <h1>{perfil.emprendimiento}</h1>
        {m.eslogan ? <p className="marca-eslogan">“{m.eslogan}”</p> : <p className="nota-suave">Sin frase todavía</p>}
        {!!(m.palabras ?? []).length && (
          <div className="marca-palabras">
            {m.palabras.map((p) => (
              <span key={p} className="chip chip--mini">{p}</span>
            ))}
          </div>
        )}
        <button className="btn btn--suave" onClick={() => ir('/marca/identidad')}>
          {m.eslogan || m.foto ? 'Editar mi marca' : 'Armar mi marca'}
        </button>
      </section>

      <section className="ficha__seccion">
        <h2 className="subtitulo">📅 Fechas que se vienen</h2>
        {proximas.map((f) => (
          <div key={f.id} className="fecha-clave">
            <span className="fecha-clave__emoji">{f.emoji}</span>
            <span className="fecha-clave__texto">
              <strong>{f.nombre}</strong>
              <small>
                {fechaBonita(f.fecha)} · {f.dias === 0 ? '¡hoy!' : `en ${f.dias} días`}
              </small>
            </span>
          </div>
        ))}
        <button className="btn btn--suave" onClick={() => ir('/marca/calendario')}>
          Ver el calendario del año
        </button>
      </section>

      <section className="ficha__seccion">
        <h2 className="subtitulo">🎬 Mis grabaciones</h2>
        {pendientes.length === 0 ? (
          <div className="explica">
            Todavía no tienes contenido planificado. Elige una idea y ponle fecha: grabar se hace fácil cuando ya sabes qué vas a grabar.
          </div>
        ) : (
          pendientes.slice(0, 3).map((c) => (
            <div key={c.id} className="fecha-clave">
              <span className="fecha-clave__emoji">{ESTADOS_CONTENIDO[c.estado].emoji}</span>
              <span className="fecha-clave__texto">
                <strong>{c.titulo}</strong>
                <small>
                  {fechaBonita(c.fecha)} · {ESTADOS_CONTENIDO[c.estado].nombre}
                </small>
              </span>
            </div>
          ))
        )}
        <button className="btn btn--principal" onClick={() => ir('/marca/contenido')}>
          {pendientes.length ? 'Ver mi plan de contenido' : 'Planear mi contenido'}
        </button>
      </section>

      <Ayuda etiqueta="¿Para qué sirve esto?">
        Tu marca es lo que la gente recuerda de ti: tu nombre, tu foto, tu frase y cómo tratas a tus clientes. Tenerlo
        claro te ayuda a publicar siempre igual y a que te reconozcan.
      </Ayuda>
    </Marco>
  )
}

// ---------- Identidad ----------
export function IdentidadMarca({ datos, despachar, guardado, perfil, r }) {
  const m = marcaDe(datos)
  const [error, setError] = useState(null)
  const archivo = useRef(null)
  const cambiar = (campo, valor) => despachar({ tipo: 'marca:campo', campo, valor })

  const subir = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setError(null)
    try {
      cambiar('foto', await leerFotoAchicada(f))
    } catch {
      setError('No se pudo usar esa imagen. Prueba con una foto del celular.')
    }
  }

  const palabras = m.palabras ?? []
  const alternarPalabra = (p) =>
    cambiar('palabras', palabras.includes(p) ? palabras.filter((x) => x !== p) : palabras.length < 3 ? [...palabras, p] : palabras)

  return (
    <Marco {...marco(guardado, { titulo: 'Mi marca', onAtras: () => volver('/marca') })} pie={<BotonSiguiente onClick={() => volver('/marca')}>Listo</BotonSiguiente>}>
      <Pregunta sub="Esto es lo que la gente ve y recuerda de tu negocio.">Arma tu marca</Pregunta>

      <div className="marca-foto">
        <FotoMarca foto={m.foto} nombre={perfil.emprendimiento} />
        <input ref={archivo} type="file" accept="image/*" hidden onChange={subir} />
        <div className="marca-foto__botones">
          <button className="btn btn--suave" onClick={() => archivo.current?.click()}>
            {m.foto ? 'Cambiar foto' : 'Subir mi logo o foto'}
          </button>
          {m.foto && (
            <button className="btn btn--texto" onClick={() => cambiar('foto', null)}>
              Quitar
            </button>
          )}
        </div>
      </div>
      {error && <p className="mensaje-error">{error}</p>}
      <Ayuda etiqueta="¿Qué foto pongo?">
        Tu logo, o una foto clara de tu mejor trabajo. Se recorta cuadrada, así que centra lo importante. Esta foto
        también aparece en tu página principal.
      </Ayuda>

      <CampoTexto
        etiqueta="Tu frase (eslogan)"
        valor={m.eslogan ?? ''}
        maxLength={60}
        placeholder="Ej. Hecho a tu medida, a tiempo"
        onCambio={(v) => cambiar('eslogan', v)}
      />
      <CampoTexto
        etiqueta="¿Qué te hace diferente?"
        valor={m.diferencia ?? ''}
        maxLength={120}
        placeholder={`Ej. entrego en 3 días y arreglo gratis si algo falla`}
        onCambio={(v) => cambiar('diferencia', v)}
      />
      <CampoTexto
        etiqueta="¿A quién le vendes?"
        valor={m.publico ?? ''}
        maxLength={120}
        placeholder={`Ej. mamás del barrio que buscan ${r.unidades} a buen precio`}
        onCambio={(v) => cambiar('publico', v)}
      />

      <div>
        <span className="campo__etiqueta">Elige 3 palabras que describan tu marca</span>
        <div className="conceptos">
          {PALABRAS_MARCA.map((p) => (
            <button
              key={p}
              className={`chip chip--concepto${palabras.includes(p) ? ' chip--activo' : ''}`}
              onClick={() => alternarPalabra(p)}
              disabled={!palabras.includes(p) && palabras.length >= 3}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <Ayuda etiqueta="¿Para qué sirven las palabras?">
        Son la personalidad de tu marca. Si eliges "puntual" y "artesanal", tus fotos, tus textos y tu trato deben
        mostrar justo eso.
      </Ayuda>
    </Marco>
  )
}

// ---------- Calendario de fechas ----------
export function CalendarioMarca({ datos, despachar, guardado, r }) {
  const contenidos = marcaDe(datos).contenidos ?? []
  const fechas = proximasFechas(hoy(), 12)
  const yaAgendada = (f) => contenidos.some((c) => c.fuente === f.id && c.fecha >= hoy())

  const agendar = (f) => {
    despachar({
      tipo: 'contenido:agregar',
      contenido: { titulo: `Contenido para ${f.nombre}`, fecha: fechaDeGrabacion(f.fecha), fuente: f.id, nota: f.idea(r) },
    })
    ir('/marca/contenido')
  }

  return (
    <Marco {...marco(guardado, { titulo: 'Calendario del año', onAtras: () => volver('/marca') })}>
      <Pregunta sub="Las fechas que más mueven las ventas. Prepara tu contenido con semanas de anticipación.">
        ¿Qué se viene?
      </Pregunta>
      {fechas.map((f) => (
        <article key={f.id} className="fecha-tarjeta">
          <div className="fecha-tarjeta__cabeza">
            <span className="fecha-clave__emoji">{f.emoji}</span>
            <span className="fecha-clave__texto">
              <strong>{f.nombre}</strong>
              <small>
                {fechaBonita(f.fecha)} · {f.dias === 0 ? '¡hoy!' : `en ${f.dias} días`}
              </small>
            </span>
          </div>
          <p className="fecha-tarjeta__idea">💡 {f.idea(r)}</p>
          {yaAgendada(f) ? (
            <span className="fecha-tarjeta__listo">✓ Ya está en tu plan</span>
          ) : (
            <button className="btn btn--suave" onClick={() => agendar(f)}>
              Agendar grabación ({fechaBonita(fechaDeGrabacion(f.fecha))})
            </button>
          )}
        </article>
      ))}
      <Ayuda etiqueta="¿Cuándo grabo?">
        Para fechas grandes como el Día de la Madre, empieza a publicar 3 semanas antes: la gente compra regalos con
        tiempo. La app propone grabar 2 semanas antes de cada fecha.
      </Ayuda>
    </Marco>
  )
}

// ---------- Plan de contenido ----------
export function ContenidoMarca({ datos, despachar, guardado, perfil, r }) {
  const contenidos = [...(marcaDe(datos).contenidos ?? [])].sort((a, b) => a.fecha.localeCompare(b.fecha))
  const [nuevo, setNuevo] = useState({ titulo: '', fecha: hoy() })
  const ideas = [...(IDEAS_POR_RUBRO[perfil.rubro] ?? []), ...IDEAS_GENERALES].filter(
    (i) => !contenidos.some((c) => c.titulo === i),
  )

  const agregar = (titulo, fecha = hoy()) => {
    if (limpiarTexto(titulo).length < 3) return
    despachar({ tipo: 'contenido:agregar', contenido: { titulo: limpiarTexto(titulo), fecha } })
    setNuevo({ titulo: '', fecha: hoy() })
  }

  return (
    <Marco {...marco(guardado, { titulo: 'Plan de contenido', onAtras: () => volver('/marca') })}>
      <Pregunta sub="Anota qué vas a grabar y cuándo. Lo que está en la lista se graba; lo que no, se olvida.">
        Mis grabaciones
      </Pregunta>

      {contenidos.length > 0 && (
        <div className="lista">
          {contenidos.map((c) => {
            const dias = diasHasta(c.fecha)
            const estado = ESTADOS_CONTENIDO[c.estado]
            return (
              <div key={c.id} className="contenido" style={{ '--c': estado.color }}>
                <div className="contenido__cabeza">
                  <span className="contenido__texto">
                    <strong>{c.titulo}</strong>
                    <small>
                      {dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : fechaBonita(c.fecha)}
                      {c.estado === 'pendiente' && dias < 0 ? ' · ya pasó' : ''}
                      {dias > 1 ? ` · en ${dias} días` : ''}
                    </small>
                  </span>
                  <button className="item__quitar" aria-label={`Quitar ${c.titulo}`} onClick={() => despachar({ tipo: 'contenido:quitar', id: c.id })}>
                    ✕
                  </button>
                </div>
                {c.nota && <p className="contenido__nota">💡 {c.nota}</p>}
                <div className="chips chips--tres">
                  {Object.entries(ESTADOS_CONTENIDO).map(([id, e]) => (
                    <button
                      key={id}
                      className={`chip${c.estado === id ? ' chip--activo' : ''}`}
                      onClick={() => despachar({ tipo: 'contenido:estado', id: c.id, estado: id })}
                    >
                      {e.emoji} {e.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="explica calculadora">
        <span className="campo__etiqueta">Agregar algo que quiero grabar</span>
        <CampoTexto valor={nuevo.titulo} placeholder="Ej. Antes y después de un arreglo" maxLength={80} onCambio={(v) => setNuevo({ ...nuevo, titulo: v })} />
        <label className="campo">
          <span className="campo__etiqueta">¿Qué día?</span>
          <span className="campo__caja">
            <input type="date" value={nuevo.fecha} onChange={(e) => e.target.value && setNuevo({ ...nuevo, fecha: e.target.value })} />
          </span>
        </label>
        <button className="btn btn--principal" disabled={limpiarTexto(nuevo.titulo).length < 3} onClick={() => agregar(nuevo.titulo, nuevo.fecha)}>
          Agregar a mi plan
        </button>
      </div>

      <h2 className="subtitulo">Ideas para tu oficio</h2>
      <div className="conceptos">
        {ideas.slice(0, 8).map((i) => (
          <button key={i} className="chip chip--concepto" onClick={() => agregar(i)}>
            + {i}
          </button>
        ))}
      </div>

      <Ayuda etiqueta="¿Cada cuánto publico?">
        Mejor poco y constante que mucho y una sola vez: dos publicaciones por semana, siempre los mismos días, ya hacen
        la diferencia. Graba varias de una sola vez y ve publicando.
      </Ayuda>
    </Marco>
  )
}
