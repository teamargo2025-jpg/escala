import { useEffect, useState } from 'react'
import { MATERIALES, TIPOS_OPORTUNIDAD, puntosDe } from '../data/eco.js'
import { almacen } from '../almacen.js'
import { hoy } from '../lib/caja.js'
import { fechaBonita } from '../lib/marketing.js'
import { limpiarTexto } from '../lib/cuenta.js'
import { volver } from '../negocio.js'
import { Ayuda, CampoNumero, CampoTexto, Marco, MensajeError, Pregunta } from '../componentes.jsx'

const ESTADOS_POSTULACION = ['enviada', 'revision', 'seleccionada', 'no_seleccionada']
const NOMBRE_ESTADO = { enviada: 'Enviada', revision: 'En revisión', seleccionada: 'Seleccionada', no_seleccionada: 'Esta vez no' }

// Panel del equipo: lo que antes había que mirar en el panel de Supabase.
export function Equipo({ guardado }) {
  const [datos, setDatos] = useState(null)
  const [seccion, setSeccion] = useState('interesados')
  const [error, setError] = useState(null)

  const cargar = () =>
    Promise.all([
      almacen.oportunidades(),
      almacen.equipoInteresados(),
      almacen.equipoPostulaciones(),
      almacen.equipoPersonas(),
      almacen.jornadas(),
      almacen.equipoCanjes(),
    ])
      .then(([oportunidades, interesados, postulaciones, personas, jornadas, canjes]) =>
        setDatos({ oportunidades, interesados, postulaciones, personas, jornadas, canjes }),
      )
      .catch(() => setError('No se pudo cargar. Revisa tu internet.'))

  useEffect(() => {
    cargar()
  }, [])

  const pendientes = {
    interesados: datos?.interesados?.length ?? 0,
    postulaciones: datos?.postulaciones?.filter((p) => p.estado === 'enviada').length ?? 0,
    eco: datos?.canjes?.filter((c) => c.estado === 'pedido').length ?? 0,
  }

  return (
    <Marco titulo="Equipo ESCALA" emoji="🛠️" guardado={guardado} onAtras={() => volver('/')}>
      <Pregunta sub="Lo que la gente respondió en la app. Aquí no se ven sus números: solo lo que publicaron o pidieron.">
        Panel del equipo
      </Pregunta>
      <MensajeError>{error}</MensajeError>

      <div className="chips chips--tres">
        {[
          ['interesados', `📣 Interesados${pendientes.interesados ? ` (${pendientes.interesados})` : ''}`],
          ['postulaciones', `📰 Revista${pendientes.postulaciones ? ` (${pendientes.postulaciones})` : ''}`],
          ['eco', `🌱 EcoEscala${pendientes.eco ? ` (${pendientes.eco})` : ''}`],
        ].map(([id, texto]) => (
          <button key={id} className={`chip${seccion === id ? ' chip--activo' : ''}`} onClick={() => setSeccion(id)}>
            {texto}
          </button>
        ))}
      </div>

      {!datos && <p className="nota-suave">Cargando…</p>}

      {datos && seccion === 'interesados' && <Interesados datos={datos} recargar={cargar} />}
      {datos && seccion === 'postulaciones' && <Postulaciones datos={datos} recargar={cargar} />}
      {datos && seccion === 'eco' && <Eco datos={datos} recargar={cargar} />}

      <Ayuda etiqueta="¿Quién más puede entrar aquí?">
        Solo las cuentas marcadas como equipo en Supabase (tabla <strong>admins</strong>). Para sumar a alguien: que cree
        su cuenta normal, copia su UID desde Authentication → Users y agrégalo a esa tabla.
      </Ayuda>
    </Marco>
  )
}

// ---------- Interesados por convocatoria ----------
function Interesados({ datos, recargar }) {
  const [nueva, setNueva] = useState(null)

  const publicar = async () => {
    if (limpiarTexto(nueva.titulo).length < 3 || limpiarTexto(nueva.detalle).length < 3) return
    await almacen.equipoCrearOportunidad({
      titulo: limpiarTexto(nueva.titulo),
      detalle: limpiarTexto(nueva.detalle),
      tipo: nueva.tipo,
      emoji: TIPOS_OPORTUNIDAD[nueva.tipo].emoji,
      lugar: limpiarTexto(nueva.lugar) || null,
      fecha_limite: nueva.fecha_limite || null,
    })
    setNueva(null)
    recargar()
  }

  return (
    <>
      {datos.oportunidades.map((o) => {
        const suyos = datos.interesados.filter((i) => i.oportunidad_id === o.id)
        return (
          <article key={o.id} className="oportunidad" style={{ '--c': (TIPOS_OPORTUNIDAD[o.tipo] ?? TIPOS_OPORTUNIDAD.convocatoria).color }}>
            <div className="oportunidad__cabeza">
              <span className="fecha-clave__emoji">{o.emoji ?? '📣'}</span>
              <span className="fecha-clave__texto">
                <strong>{o.titulo}</strong>
                <small>
                  {suyos.length} {suyos.length === 1 ? 'persona apuntada' : 'personas apuntadas'}
                  {o.fecha_limite ? ` · hasta el ${fechaBonita(o.fecha_limite)}` : ''}
                </small>
              </span>
            </div>
            {suyos.length > 0 && (
              <ul className="lista-simple">
                {suyos.map((i) => (
                  <li key={i.id}>
                    <strong>{i.nombre ?? 'Sin nombre'}</strong> · {i.emprendimiento ?? 'sin emprendimiento'}
                  </li>
                ))}
              </ul>
            )}
            <button className="btn btn--chico btn--suave" onClick={() => almacen.equipoCerrarOportunidad(o.id).then(recargar)}>
              Cerrar convocatoria
            </button>
          </article>
        )
      })}

      {nueva ? (
        <div className="explica calculadora">
          <h2 className="subtitulo">Nueva convocatoria</h2>
          <CampoTexto etiqueta="Título" valor={nueva.titulo} maxLength={90} placeholder="Ej. Feria de emprendedores" onCambio={(v) => setNueva({ ...nueva, titulo: v })} />
          <CampoTexto etiqueta="Detalle" valor={nueva.detalle} maxLength={400} placeholder="Qué es, qué necesitan, cupos" onCambio={(v) => setNueva({ ...nueva, detalle: v })} />
          <div className="conceptos">
            {Object.entries(TIPOS_OPORTUNIDAD).map(([id, t]) => (
              <button key={id} className={`chip chip--concepto${nueva.tipo === id ? ' chip--activo' : ''}`} onClick={() => setNueva({ ...nueva, tipo: id })}>
                {t.emoji} {t.nombre}
              </button>
            ))}
          </div>
          <div className="dos-columnas">
            <CampoTexto etiqueta="Lugar" valor={nueva.lugar} maxLength={60} onCambio={(v) => setNueva({ ...nueva, lugar: v })} />
            <label className="campo">
              <span className="campo__etiqueta">Hasta cuándo</span>
              <span className="campo__caja">
                <input type="date" min={hoy()} value={nueva.fecha_limite} onChange={(e) => setNueva({ ...nueva, fecha_limite: e.target.value })} />
              </span>
            </label>
          </div>
          <button className="btn btn--principal" onClick={publicar}>
            Publicar
          </button>
          <button className="btn btn--texto" onClick={() => setNueva(null)}>
            Cancelar
          </button>
        </div>
      ) : (
        <button className="btn btn--principal" onClick={() => setNueva({ titulo: '', detalle: '', tipo: 'convocatoria', lugar: '', fecha_limite: '' })}>
          + Publicar una convocatoria
        </button>
      )}
    </>
  )
}

// ---------- Postulaciones a la revista ----------
function Postulaciones({ datos, recargar }) {
  const [nota, setNota] = useState({})

  const responder = async (p, estado) => {
    await almacen.equipoResponderPostulacion(p.id, { estado, nota: limpiarTexto(nota[p.id] ?? p.nota ?? '') || null })
    recargar()
  }

  if (!datos.postulaciones.length) return <div className="explica">Todavía no hay postulaciones a la revista.</div>

  return datos.postulaciones.map((p) => (
    <article key={p.id} className="oportunidad" style={{ '--c': '#0e8a8a' }}>
      <div className="oportunidad__cabeza">
        {p.foto && <img className="foto-marca foto-marca--chica" src={p.foto} alt={`Logo de ${p.emprendimiento}`} />}
        <span className="fecha-clave__texto">
          <strong>{p.emprendimiento}</strong>
          <small>
            {p.rubro ?? 'sin rubro'} · {NOMBRE_ESTADO[p.estado]}
          </small>
        </span>
      </div>
      <p className="oportunidad__detalle">{p.que_vende}</p>
      {p.historia && <p className="oportunidad__detalle">{p.historia}</p>}
      {p.contacto && (
        <a className="enlace" href={`https://wa.me/51${String(p.contacto).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
          Escribirle por WhatsApp →
        </a>
      )}
      <CampoTexto
        etiqueta="Nota para esta persona (la ve en su app)"
        valor={nota[p.id] ?? p.nota ?? ''}
        maxLength={200}
        onCambio={(v) => setNota({ ...nota, [p.id]: v })}
      />
      <div className="chips chips--tres">
        {ESTADOS_POSTULACION.slice(1).map((e) => (
          <button key={e} className={`chip${p.estado === e ? ' chip--activo' : ''}`} onClick={() => responder(p, e)}>
            {NOMBRE_ESTADO[e]}
          </button>
        ))}
      </div>
    </article>
  ))
}

// ---------- EcoEscala: registrar kilos y entregar premios ----------
function Eco({ datos, recargar }) {
  const [f, setF] = useState({ user_id: '', material: 'plastico', kilos: '' })
  const [aviso, setAviso] = useState(null)
  const jornada = datos.jornadas?.[0]
  const valido = f.user_id && Number(f.kilos) > 0

  const registrar = async () => {
    if (!valido) return
    await almacen.equipoRegistrarEntrega({
      user_id: f.user_id,
      material: f.material,
      kilos: Number(String(f.kilos).replace(',', '.')),
      jornada_id: jornada?.id ?? null,
    })
    const persona = datos.personas.find((p) => p.user_id === f.user_id)
    setAviso(`✓ ${persona?.nickname ?? 'Registrado'}: +${puntosDe(f.material, f.kilos)} puntos`)
    setF({ ...f, kilos: '' })
    recargar()
  }

  const pedidos = datos.canjes.filter((c) => c.estado === 'pedido')

  return (
    <>
      <div className="explica calculadora">
        <h2 className="subtitulo">Registrar una entrega</h2>
        {jornada ? (
          <p className="nota-suave nota-suave--izq">Jornada del {fechaBonita(jornada.fecha)} · {jornada.lugar}</p>
        ) : (
          <p className="nota-suave nota-suave--izq">Sin jornada agendada: la entrega se registra igual.</p>
        )}
        <label className="campo">
          <span className="campo__etiqueta">¿Quién trajo el material?</span>
          <select className="selector" value={f.user_id} onChange={(e) => setF({ ...f, user_id: e.target.value })}>
            <option value="">Elegir persona…</option>
            {datos.personas.map((p) => (
              <option key={p.user_id} value={p.user_id}>
                {p.nickname} · {p.emprendimiento}
              </option>
            ))}
          </select>
        </label>
        <div className="conceptos">
          {Object.entries(MATERIALES).map(([id, m]) => (
            <button key={id} className={`chip chip--concepto${f.material === id ? ' chip--activo' : ''}`} onClick={() => setF({ ...f, material: id })}>
              {m.emoji} {m.nombre}
            </button>
          ))}
        </div>
        <CampoNumero etiqueta="¿Cuántos kilos?" prefijo={null} sufijo="kilos" valor={f.kilos} placeholder="0" onCambio={(v) => setF({ ...f, kilos: v })} />
        {Number(f.kilos) > 0 && <p className="nota-suave nota-suave--izq">Son {puntosDe(f.material, f.kilos)} puntos.</p>}
        <button className="btn btn--principal" disabled={!valido} onClick={registrar}>
          Registrar entrega
        </button>
        {aviso && <p className="respuesta respuesta--bien">{aviso}</p>}
      </div>

      <section className="ficha__seccion">
        <h2 className="subtitulo">🎁 Premios pedidos</h2>
        {!pedidos.length && <div className="explica">Nadie ha pedido un premio todavía.</div>}
        {pedidos.map((c) => (
          <div key={c.id} className="premio">
            <span className="fecha-clave__emoji">🎁</span>
            <span className="fecha-clave__texto">
              <strong>{c.premio}</strong>
              <small>{c.puntos} puntos · {fechaBonita(String(c.creado_at).slice(0, 10))}</small>
            </span>
            <button className="btn btn--chico btn--principal" onClick={() => almacen.equipoEntregarCanje(c.id).then(recargar)}>
              Entregado
            </button>
          </div>
        ))}
      </section>
    </>
  )
}
