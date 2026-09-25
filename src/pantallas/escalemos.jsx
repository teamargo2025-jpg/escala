import { useEffect, useState } from 'react'
import { IDEAS_APROVECHAR, MATERIALES, PREMIOS, TIPOS_OPORTUNIDAD, puntosDe, puntosTotales } from '../data/eco.js'
import { almacen } from '../almacen.js'
import { diasHasta, fechaBonita } from '../lib/marketing.js'
import { limpiarTexto } from '../lib/cuenta.js'
import { registrar } from '../lib/analitica.js'
import { ir, volver } from '../negocio.js'
import { Ayuda, BotonSiguiente, CampoNumero, CampoTexto, Casilla, Marco, MensajeError, Pregunta } from '../componentes.jsx'
import { leerFotoAchicada } from './marca.jsx'

const marco = (extra) => ({ titulo: 'Escalemos', emoji: '🤝', onAtras: () => volver('/'), ...extra })

// Trae datos del almacén y avisa si algo falla, sin dejar la pantalla en blanco.
function useDatos(cargar, dependencias = []) {
  const [estado, setEstado] = useState({ cargando: true, datos: null })
  const recargar = () => {
    let vivo = true
    setEstado((e) => ({ ...e, cargando: true }))
    Promise.resolve(cargar())
      .then((datos) => vivo && setEstado({ cargando: false, datos }))
      .catch(() => vivo && setEstado({ cargando: false, datos: null }))
    return () => {
      vivo = false
    }
  }
  useEffect(recargar, dependencias)
  return [estado, recargar]
}

const Cargando = () => <p className="nota-suave">Cargando…</p>

// ---------- Revista ESCALA: todo en una sola pantalla ----------
export function Escalemos({ perfil, guardado }) {
  const [{ cargando, datos }, recargar] = useDatos(async () => ({
    oportunidades: await almacen.oportunidades(),
    mios: await almacen.misIntereses(),
    postulacion: await almacen.miPostulacion(),
    entregas: await almacen.misEntregas(),
    canjes: await almacen.misCanjes(),
    jornadas: await almacen.jornadas(),
  }))
  const puntos =
    puntosTotales(datos?.entregas ?? []) - (datos?.canjes ?? []).reduce((s, x) => s + x.puntos, 0)
  const jornada = datos?.jornadas?.[0]

  return (
    <Marco {...marco({ titulo: 'Revista ESCALA', emoji: '📰', guardado })}>
      <Pregunta sub="Lo que pasa en la red: convocatorias, ferias y la revista donde mostramos emprendimientos.">
        Revista ESCALA
      </Pregunta>

      {cargando && <Cargando />}

      {/* Oportunidades: son parte de la revista */}
      <section className="ficha__seccion">
        <h2 className="subtitulo">📣 Convocatorias y oportunidades</h2>
        {!cargando && !datos?.oportunidades?.length && (
          <div className="explica">Todavía no hay convocatorias abiertas. Cuando haya una feria o un pedido grande, aparece aquí.</div>
        )}
        {datos?.oportunidades?.map((o) => (
          <TarjetaOportunidad key={o.id} o={o} apuntado={datos.mios.includes(o.id)} perfil={perfil} alCambiar={recargar} />
        ))}
      </section>

      {/* Postulación */}
      <section className="ficha__seccion">
        <h2 className="subtitulo">✍️ Sal en la revista</h2>
        <button className="escalemos-tarjeta" style={{ '--c': '#0e8a8a', '--c-claro': '#daf3f2' }} onClick={() => ir('/escalemos/revista')}>
          <span className="escalemos-tarjeta__icono">📰</span>
          <span className="escalemos-tarjeta__texto">
            <strong>{datos?.postulacion ? 'Tu postulación' : 'Postula tu emprendimiento'}</strong>
            <small>
              {datos?.postulacion
                ? ESTADOS[datos.postulacion.estado].nombre
                : 'Mostramos emprendimientos de la red en cada edición'}
            </small>
          </span>
          <span className="apartado__flecha">→</span>
        </button>
      </section>

      {/* EcoEscala: sección propia, debajo de la revista */}
      <section className="ficha__seccion seccion-eco">
        <h2 className="subtitulo">🌱 EcoEscala</h2>
        <p className="nota-suave nota-suave--izq">
          La sección verde de la revista: aprovechar lo que sobra y reciclar lo que no.
        </p>
        <button className="escalemos-tarjeta" style={{ '--c': '#1f8a5b', '--c-claro': '#dff3e8' }} onClick={() => ir('/escalemos/eco')}>
          <span className="escalemos-tarjeta__icono">♻️</span>
          <span className="escalemos-tarjeta__texto">
            <strong>Entrar a EcoEscala</strong>
            <small>
              {puntos > 0 ? `Tienes ${puntos} puntos` : 'Recicla y gana asesorías'}
              {jornada ? ` · jornada el ${fechaBonita(jornada.fecha)}` : ''}
            </small>
          </span>
          <span className="apartado__flecha">→</span>
        </button>
        <button className="escalemos-tarjeta" style={{ '--c': '#9a6417', '--c-claro': '#f7ecd9' }} onClick={() => ir('/escalemos/sobrantes')}>
          <span className="escalemos-tarjeta__icono">🎁</span>
          <span className="escalemos-tarjeta__texto">
            <strong>Doy y busco material</strong>
            <small>Lo que a ti te sobra, a otro le sirve</small>
          </span>
          <span className="apartado__flecha">→</span>
        </button>
      </section>
    </Marco>
  )
}

// Una convocatoria con su botón de "Me interesa"; se usa en la revista y en la lista completa.
function TarjetaOportunidad({ o, apuntado, perfil, alCambiar }) {
  const [ocupado, setOcupado] = useState(false)
  const tipo = TIPOS_OPORTUNIDAD[o.tipo] ?? TIPOS_OPORTUNIDAD.convocatoria
  const dias = o.fecha_limite ? diasHasta(o.fecha_limite) : null

  const alternar = async () => {
    setOcupado(true)
    try {
      if (apuntado) await almacen.quitarInteres(o.id)
      else {
        await almacen.apuntarme(o.id, perfil)
        registrar('oportunidad_interes', perfil.rubro)
      }
      alCambiar()
    } finally {
      setOcupado(false)
    }
  }

  return (
    <article className="oportunidad" style={{ '--c': tipo.color }}>
      <div className="oportunidad__cabeza">
        <span className="fecha-clave__emoji">{o.emoji ?? tipo.emoji}</span>
        <span className="fecha-clave__texto">
          <strong>{o.titulo}</strong>
          <small>
            {tipo.nombre}
            {o.lugar ? ` · ${o.lugar}` : ''}
            {dias != null ? ` · ${dias <= 0 ? 'último día' : `quedan ${dias} días`}` : ''}
          </small>
        </span>
      </div>
      <p className="oportunidad__detalle">{o.detalle}</p>
      {o.enlace && (
        <a className="enlace" href={o.enlace} target="_blank" rel="noopener noreferrer">
          Ver más información →
        </a>
      )}
      <button className={`btn ${apuntado ? 'btn--suave' : 'btn--principal'}`} disabled={ocupado} onClick={alternar}>
        {ocupado ? 'Un momento…' : apuntado ? '✓ Te vamos a escribir · quitar' : 'Me interesa'}
      </button>
      {apuntado && <small className="texto-suave">El equipo de ESCALA ya vio que te apuntaste y te escribirá por WhatsApp.</small>}
    </article>
  )
}

// ---------- Todas las convocatorias ----------
export function Oportunidades({ perfil }) {
  const [{ cargando, datos }, recargar] = useDatos(async () => ({
    lista: await almacen.oportunidades(),
    mios: await almacen.misIntereses(),
  }))

  return (
    <Marco {...marco({ titulo: 'Convocatorias', emoji: '📣', onAtras: () => volver('/escalemos') })}>
      <Pregunta sub="Lo que organiza ESCALA para la red. Si te interesa algo, avísanos y te escribimos.">¿Qué se viene?</Pregunta>
      {cargando && <Cargando />}
      {!cargando && !datos?.lista?.length && (
        <div className="explica">Todavía no hay convocatorias publicadas.</div>
      )}
      {datos?.lista?.map((o) => (
        <TarjetaOportunidad key={o.id} o={o} apuntado={datos.mios.includes(o.id)} perfil={perfil} alCambiar={recargar} />
      ))}
    </Marco>
  )
}

// ---------- Sobrantes ----------
export function Sobrantes({ perfil, usuario }) {
  const [{ cargando, datos }, recargar] = useDatos(() => almacen.sobrantes())
  const [filtro, setFiltro] = useState('doy')
  const lista = (datos ?? []).filter((s) => s.tipo === filtro && s.estado === 'disponible')
  const mios = (datos ?? []).filter((s) => s.user_id === usuario.userId)

  const marcarEntregado = async (s) => {
    await almacen.cambiarSobrante(s.id, { estado: 'entregado' })
    recargar()
  }
  const borrar = async (s) => {
    await almacen.borrarSobrante(s.id)
    recargar()
  }

  return (
    <Marco {...marco({ titulo: 'Doy y busco', emoji: '♻️', onAtras: () => volver('/escalemos') })}>
      <Pregunta sub="Lo que a ti te sobra, a otro emprendedor le sirve. Y al revés.">Material entre nosotros</Pregunta>

      <div className="chips chips--dos">
        <button className={`chip${filtro === 'doy' ? ' chip--activo' : ''}`} onClick={() => setFiltro('doy')}>
          🎁 Dan material
        </button>
        <button className={`chip${filtro === 'busco' ? ' chip--activo' : ''}`} onClick={() => setFiltro('busco')}>
          🔎 Buscan material
        </button>
      </div>

      <button className="btn btn--principal" onClick={() => ir('/escalemos/publicar')}>
        + Publicar algo
      </button>

      {cargando && <Cargando />}
      {!cargando && !lista.length && (
        <div className="explica">
          {filtro === 'doy'
            ? 'Todavía nadie publicó material para dar. Puedes ser la primera persona: mira lo que te sobra en tu taller.'
            : 'Nadie está buscando material ahora mismo. Si necesitas algo, publícalo y alguien puede tenerlo guardado.'}
        </div>
      )}

      {lista.map((s) => (
        <article key={s.id} className="sobrante">
          {s.foto && <img className="sobrante__foto" src={s.foto} alt={`Foto de ${s.titulo}`} />}
          <div className="sobrante__texto">
            <strong>{s.titulo}</strong>
            {s.detalle && <p>{s.detalle}</p>}
            <small>
              {s.cantidad ? `${s.cantidad} · ` : ''}
              {s.zona ?? 'Sin zona'}
            </small>
          </div>
          {s.user_id === usuario.userId ? (
            <div className="sobrante__acciones">
              <span className="texto-suave">Es tuyo</span>
              <button className="btn btn--chico btn--suave" onClick={() => marcarEntregado(s)}>
                Ya lo entregué
              </button>
              <button className="btn btn--chico btn--peligro" onClick={() => borrar(s)}>
                Borrar
              </button>
            </div>
          ) : (
            s.contacto && (
              <a
                className="btn btn--whatsapp"
                href={`https://wa.me/51${String(s.contacto).replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hola, vi en ESCALA que ${s.tipo === 'doy' ? 'tienes' : 'buscas'} "${s.titulo}". `,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Escribir por WhatsApp
              </a>
            )
          )}
        </article>
      ))}

      {mios.filter((s) => s.estado === 'entregado').length > 0 && (
        <p className="nota-suave">Tienes {mios.filter((s) => s.estado === 'entregado').length} publicación(es) ya entregadas.</p>
      )}

      <section className="ficha__seccion">
        <h2 className="subtitulo">💡 Ideas de lo que sirve</h2>
        {IDEAS_APROVECHAR.slice(0, 5).map((i) => (
          <div key={i.de} className="idea-eco">
            <strong>{i.de}</strong>
            <small>
              para {i.para}: {i.usos}
            </small>
          </div>
        ))}
      </section>
    </Marco>
  )
}

export function PublicarSobrante({ perfil }) {
  const [f, setF] = useState({ tipo: 'doy', titulo: '', detalle: '', cantidad: '', zona: '', contacto: '', foto: null, acepto: false })
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const valido = limpiarTexto(f.titulo).length >= 3 && f.acepto && !enviando

  const subirFoto = async (e) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    try {
      setF({ ...f, foto: await leerFotoAchicada(archivo) })
    } catch {
      setError('No se pudo usar esa imagen. Prueba con otra foto.')
    }
  }

  const publicar = async () => {
    if (!valido) return
    setEnviando(true)
    setError(null)
    try {
      await almacen.publicarSobrante({
        tipo: f.tipo,
        titulo: limpiarTexto(f.titulo),
        detalle: limpiarTexto(f.detalle) || null,
        cantidad: limpiarTexto(f.cantidad) || null,
        zona: limpiarTexto(f.zona) || null,
        contacto: f.contacto.replace(/\D/g, '') || null,
        foto: f.foto,
      })
      registrar(`sobrante_${f.tipo}`, perfil.rubro)
      volver('/escalemos/sobrantes')
    } catch {
      setError('No se pudo publicar. Revisa tu internet y vuelve a intentar.')
      setEnviando(false)
    }
  }

  return (
    <Marco
      {...marco({ titulo: 'Publicar', emoji: '♻️', onAtras: () => volver('/escalemos/sobrantes') })}
      pie={
        <BotonSiguiente onClick={publicar} disabled={!valido} aviso="Escribe qué es y marca la casilla.">
          {enviando ? 'Publicando…' : 'Publicar'}
        </BotonSiguiente>
      }
    >
      <div className="chips chips--dos">
        <button className={`chip${f.tipo === 'doy' ? ' chip--activo' : ''}`} onClick={() => setF({ ...f, tipo: 'doy' })}>
          🎁 Doy material
        </button>
        <button className={`chip${f.tipo === 'busco' ? ' chip--activo' : ''}`} onClick={() => setF({ ...f, tipo: 'busco' })}>
          🔎 Busco material
        </button>
      </div>

      <CampoTexto
        etiqueta={f.tipo === 'doy' ? '¿Qué te sobra?' : '¿Qué necesitas?'}
        valor={f.titulo}
        maxLength={80}
        placeholder={f.tipo === 'doy' ? 'Ej. Retazos de tela de algodón' : 'Ej. Cajas de cartón medianas'}
        onCambio={(v) => setF({ ...f, titulo: v })}
      />
      <CampoTexto
        etiqueta="Cuéntalo en pocas palabras"
        valor={f.detalle}
        maxLength={200}
        placeholder="Ej. Me quedaron de la producción del mes, están limpios"
        onCambio={(v) => setF({ ...f, detalle: v })}
      />
      <div className="dos-columnas">
        <CampoTexto etiqueta="¿Cuánto?" valor={f.cantidad} maxLength={40} placeholder="Ej. Media bolsa" onCambio={(v) => setF({ ...f, cantidad: v })} />
        <CampoTexto etiqueta="¿En qué zona?" valor={f.zona} maxLength={40} placeholder="Ej. Cayma" onCambio={(v) => setF({ ...f, zona: v })} />
      </div>
      <CampoNumero
        etiqueta="WhatsApp para que te escriban"
        prefijo="+51"
        entero
        valor={f.contacto}
        placeholder="999888777"
        onCambio={(v) => setF({ ...f, contacto: v })}
      />

      <label className="btn btn--suave btn--archivo">
        {f.foto ? 'Cambiar foto' : '📷 Agregar una foto (opcional)'}
        <input type="file" accept="image/*" hidden onChange={subirFoto} />
      </label>
      {f.foto && <img className="sobrante__foto sobrante__foto--grande" src={f.foto} alt="Foto de lo que vas a publicar" />}

      <Casilla marcada={f.acepto} onCambio={(v) => setF({ ...f, acepto: v })}>
        Entiendo que esto lo van a ver los demás emprendedores de ESCALA, con el número que escribí. Lo puedo borrar
        cuando quiera.
      </Casilla>
      <MensajeError>{error}</MensajeError>

      <Ayuda etiqueta="¿Qué puedo publicar?">
        Material que no vas a usar y está en buen estado: retazos, cajas, envases, recortes, sobras de producción. El
        trato y la entrega los arreglan ustedes por WhatsApp: ESCALA solo los conecta.
      </Ayuda>
    </Marco>
  )
}

// ---------- Revista ----------
const ESTADOS = {
  enviada: { nombre: 'Enviada', detalle: 'Ya la recibimos. Te escribimos si entras en la próxima edición.', color: '#b7730c' },
  revision: { nombre: 'En revisión', detalle: 'La estamos mirando junto con las demás.', color: '#2f6fdb' },
  seleccionada: { nombre: '¡Seleccionada!', detalle: 'Vas a salir en la revista. Te vamos a escribir para coordinar.', color: '#1f8a5b' },
  no_seleccionada: { nombre: 'Esta vez no', detalle: 'No entraste en esta edición, pero puedes postular a la siguiente.', color: '#7f7699' },
}

export function Revista({ perfil, r }) {
  const [{ cargando, datos }, recargar] = useDatos(() => almacen.miPostulacion())
  const [f, setF] = useState({ que_vende: '', historia: '', contacto: '', acepto: false })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const valido = limpiarTexto(f.que_vende).length >= 5 && f.acepto && !enviando

  const enviar = async () => {
    if (!valido) return
    setEnviando(true)
    setError(null)
    try {
      await almacen.postular({
        emprendimiento: perfil.emprendimiento,
        rubro: perfil.rubro,
        que_vende: limpiarTexto(f.que_vende),
        historia: limpiarTexto(f.historia) || null,
        contacto: f.contacto.replace(/\D/g, '') || null,
        foto: perfil.datos?.marca?.foto ?? null,
      })
      registrar('postulacion_revista', perfil.rubro)
      recargar()
    } catch {
      setError('No se pudo enviar. Revisa tu internet y vuelve a intentar.')
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) {
    return (
      <Marco {...marco({ titulo: 'Revista ESCALA', emoji: '📰', onAtras: () => volver('/escalemos') })}>
        <Cargando />
      </Marco>
    )
  }

  if (datos) {
    const e = ESTADOS[datos.estado] ?? ESTADOS.enviada
    return (
      <Marco {...marco({ titulo: 'Revista ESCALA', emoji: '📰', onAtras: () => volver('/escalemos') })}>
        <div className="estado-postulacion" style={{ '--c': e.color }}>
          <span className="estado-postulacion__etiqueta">Tu postulación</span>
          <strong>{e.nombre}</strong>
          <p>{e.detalle}</p>
          {datos.nota && <p className="estado-postulacion__nota">💬 {datos.nota}</p>}
        </div>
        <div className="explica">
          <strong>{datos.emprendimiento}</strong>
          <p>{datos.que_vende}</p>
          {datos.historia && <p>{datos.historia}</p>}
        </div>
        <Ayuda etiqueta="¿Y ahora qué?">
          Mientras tanto, sigue publicando en tus redes. Si sales en la revista, te avisamos por WhatsApp y coordinamos
          las fotos.
        </Ayuda>
      </Marco>
    )
  }

  return (
    <Marco
      {...marco({ titulo: 'Revista ESCALA', emoji: '📰', onAtras: () => volver('/escalemos') })}
      pie={
        <BotonSiguiente onClick={enviar} disabled={!valido} aviso="Cuenta qué vendes y marca la casilla.">
          {enviando ? 'Enviando…' : 'Enviar mi postulación'}
        </BotonSiguiente>
      }
    >
      <Pregunta sub="Cada edición mostramos emprendimientos de la red en el Instagram de ESCALA y en la revista.">
        Postula tu emprendimiento
      </Pregunta>

      <CampoTexto
        etiqueta={`¿Qué vendes? (${r.unidades})`}
        valor={f.que_vende}
        maxLength={300}
        placeholder={`Ej. ${r.unidades} a medida, con entrega en 3 días`}
        onCambio={(v) => setF({ ...f, que_vende: v })}
      />
      <CampoTexto
        etiqueta="Tu historia en pocas líneas"
        valor={f.historia}
        maxLength={400}
        placeholder="Ej. Empecé hace 2 años con una máquina prestada…"
        onCambio={(v) => setF({ ...f, historia: v })}
      />
      <CampoNumero etiqueta="WhatsApp de contacto" prefijo="+51" entero valor={f.contacto} placeholder="999888777" onCambio={(v) => setF({ ...f, contacto: v })} />

      <Casilla marcada={f.acepto} onCambio={(v) => setF({ ...f, acepto: v })}>
        Acepto que ESCALA publique el nombre de mi emprendimiento, mi foto y mi historia en la revista y en sus redes.
      </Casilla>
      <MensajeError>{error}</MensajeError>

      <Ayuda etiqueta="¿Qué foto usan?">
        La que tienes en "Mi marca". Si todavía no subiste una, hazlo antes de postular: es lo primero que mira la gente.
      </Ayuda>
    </Marco>
  )
}

// ---------- EcoEscala ----------
export function EcoEscala({ perfil }) {
  const [{ cargando, datos }, recargar] = useDatos(async () => ({
    jornadas: await almacen.jornadas(),
    entregas: await almacen.misEntregas(),
    canjes: await almacen.misCanjes(),
  }))
  const [pidiendo, setPidiendo] = useState(null)

  const puntos = puntosTotales(datos?.entregas ?? [])
  const gastados = (datos?.canjes ?? []).reduce((s, c) => s + c.puntos, 0)
  const disponibles = puntos - gastados

  const canjear = async (premio) => {
    setPidiendo(premio.id)
    try {
      await almacen.canjear(premio.nombre, premio.puntos)
      registrar('eco_canje', perfil.rubro)
      recargar()
    } finally {
      setPidiendo(null)
    }
  }

  return (
    <Marco {...marco({ titulo: 'EcoEscala', emoji: '🌱', onAtras: () => volver('/escalemos') })}>
      <div className="saldo">
        <span>Tus puntos</span>
        <strong>{disponibles}</strong>
        <small className="saldo__nota">{puntos > 0 ? `Juntaste ${puntos} y canjeaste ${gastados}` : 'Trae material a la próxima jornada y suma'}</small>
      </div>

      {cargando && <Cargando />}

      <button className="escalemos-tarjeta" style={{ '--c': '#9a6417', '--c-claro': '#f7ecd9' }} onClick={() => ir('/escalemos/sobrantes')}>
        <span className="escalemos-tarjeta__icono">🎁</span>
        <span className="escalemos-tarjeta__texto">
          <strong>Doy y busco material</strong>
          <small>Antes de reciclarlo, mira si a otro le sirve</small>
        </span>
        <span className="apartado__flecha">→</span>
      </button>

      <section className="ficha__seccion">
        <h2 className="subtitulo">📅 Próxima jornada de acopio</h2>
        {datos?.jornadas?.length ? (
          datos.jornadas.map((j) => (
            <div key={j.id} className="fecha-clave">
              <span className="fecha-clave__emoji">♻️</span>
              <span className="fecha-clave__texto">
                <strong>{fechaBonita(j.fecha)}</strong>
                <small>
                  {j.hora ? `${j.hora} · ` : ''}
                  {j.lugar}
                </small>
                {j.detalle && <small>{j.detalle}</small>}
              </span>
            </div>
          ))
        ) : (
          <div className="explica">Aún no hay una jornada agendada. Te avisaremos por aquí y por WhatsApp.</div>
        )}
      </section>

      <section className="ficha__seccion">
        <h2 className="subtitulo">♻️ Cuánto suma cada material</h2>
        <div className="materiales">
          {Object.entries(MATERIALES).map(([id, m]) => (
            <div key={id} className="material material--eco" style={{ '--c': m.color }}>
              <span className="material__texto">
                <strong>
                  {m.emoji} {m.nombre}
                </strong>
                <small>limpio y separado</small>
              </span>
              <span className="material__stock">
                <strong>{m.puntosPorKilo}</strong>
                <small>puntos por kilo</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      {datos?.entregas?.length > 0 && (
        <section className="historial">
          <h2 className="subtitulo">Lo que has entregado</h2>
          {datos.entregas.map((e) => (
            <div key={e.id} className="historial__fila historial__fila--simple">
              <span>
                {MATERIALES[e.material]?.emoji ?? '♻️'} {MATERIALES[e.material]?.nombre ?? e.material}
                <small>{Number(e.kilos)} kilos</small>
              </span>
              <strong>+{puntosDe(e.material, e.kilos)}</strong>
            </div>
          ))}
        </section>
      )}

      <section className="ficha__seccion">
        <h2 className="subtitulo">🎁 Canjea tus puntos</h2>
        {PREMIOS.map((p) => {
          const alcanza = disponibles >= p.puntos
          const pedido = (datos?.canjes ?? []).find((c) => c.premio === p.nombre && c.estado === 'pedido')
          return (
            <div key={p.id} className={`premio${alcanza ? '' : ' premio--lejos'}`}>
              <span className="fecha-clave__emoji">{p.emoji}</span>
              <span className="fecha-clave__texto">
                <strong>{p.nombre}</strong>
                <small>{p.detalle}</small>
              </span>
              {pedido ? (
                <span className="premio__pedido">Pedido ✓</span>
              ) : (
                <button className="btn btn--chico btn--principal" disabled={!alcanza || pidiendo === p.id} onClick={() => canjear(p)}>
                  {pidiendo === p.id ? '…' : `${p.puntos} pts`}
                </button>
              )}
            </div>
          )
        })}
      </section>

      <Ayuda etiqueta="¿Cómo funciona?">
        Traes tu material limpio y separado a la jornada, lo pesamos y sumas puntos. Con esos puntos canjeas asesorías,
        diseño para tus redes o un cupo en el taller. <br />
        Y si tu material le sirve a otro emprendedor, mejor aún: publícalo en "Doy y busco" y no se pierde nada.
      </Ayuda>
    </Marco>
  )
}
