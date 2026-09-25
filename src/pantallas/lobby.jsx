import { useEffect, useRef, useState } from 'react'
import { rubroDe } from '../data/rubros.js'
import { MESES_FLUJO } from '../config.js'
import { APARTADO, GRUPOS, destinoDisponible, estadoApartados } from '../lib/apartados.js'
import { LECCIONES } from '../data/educacion.js'
import { costoProducto, porAcabarse } from '../lib/inventario.js'
import { seccionesResumen } from '../lib/resumen.js'
import { hoy, mesDe, resumenMes, saldo } from '../lib/caja.js'
import { num, soles } from '../lib/calc.js'
import { limpiarTexto, validarEmprendimiento } from '../lib/cuenta.js'
import { ir, volver } from '../negocio.js'
import { TEMAS, TEMA_POR_DEFECTO } from '../data/temas.js'
import { CampoTexto, EstadoGuardado, Logo, Marco, MensajeError } from '../componentes.jsx'
import { FotoMarca, marcaDe } from './marca.jsx'

export const plural = (n, r) => `${n.toLocaleString('es-PE')} ${n === 1 ? r.unidad : r.unidades}`

function detalleApartado(id, n, r, movimientos, datos) {
  switch (id) {
    case 'presupuesto':
      return n.inversion > 0 ? `${soles(n.inversion)} para arrancar` : 'Ya tengo todo para empezar'
    case 'costos':
      return `${soles(n.fijos)} al mes · ${soles(n.variableUnidad, { decimales: 2 })} por ${r.unidad}`
    case 'precio':
      return `${soles(n.precio)} por ${r.unidad}`
    case 'meta':
      return n.equilibrio == null ? '—' : `${plural(n.equilibrio, r)} para no perder`
    case 'flujo':
      return `${MESES_FLUJO} meses: ${n.totalFlujo >= 0 ? 'te quedan' : 'te faltan'} ${soles(Math.abs(n.totalFlujo))}`
    case 'caja':
      return movimientos.length ? `Saldo: ${soles(saldo(movimientos))}` : ''
    case 'inventario': {
      const mats = datos.inventario?.materiales ?? []
      if (!mats.length) return ''
      const contados = new Set((datos.inventario.movimientos ?? []).map((m) => m.materialId))
      const bajos = porAcabarse(mats).filter((m) => contados.has(m.id)).length
      return `${mats.length} materiales${bajos ? ` · ⚠️ ${bajos} por acabarse` : ''}`
    }
    case 'costeo': {
      const productos = datos.productos ?? []
      if (!productos.length) return ''
      const pierden = productos.filter((p) => {
        const c = costoProducto(p, datos.inventario?.materiales ?? [], { valorHora: num(datos.valorHora), fijoPorUnidad: datos.hechos?.costos ? n.fijoPorUnidad : 0 })
        return num(p.precioVenta) > 0 && num(p.precioVenta) < c.total
      }).length
      return `${productos.length} ${productos.length === 1 ? 'producto' : 'productos'}${pierden ? ` · ⚠️ ${pierden} con pérdida` : ''}`
    }
    case 'marca': {
      const m = datos.marca
      if (!m) return ''
      const pendientes = (m.contenidos ?? []).filter((c) => c.estado !== 'publicado').length
      const partes = [m.eslogan ? 'Marca lista' : null, pendientes ? `${pendientes} por grabar` : null].filter(Boolean)
      return partes.join(' · ')
    }
    case 'educacion': {
      const hechas = LECCIONES.filter((l) => datos.educacion?.[l.id]).length
      return hechas ? `${hechas} de ${LECCIONES.length} lecciones` : ''
    }
    default:
      return ''
  }
}

const QUE_ES = {
  presupuesto: 'Lo que necesitas comprar para empezar',
  costos: 'Lo que pagas cada mes y por cada venta',
  precio: 'A cuánto vender para ganar',
  meta: 'Cuánto vender al mes',
  flujo: 'Cómo te irá los primeros meses',
  caja: 'Anota el dinero que entra y sale',
  inventario: 'Cuánto material tienes y cuándo comprar',
  costeo: 'Cuánto te cuesta de verdad cada producto',
  marca: 'Tu identidad y tu calendario de contenido',
  educacion: '8 lecciones cortas para cuidar tu dinero',
}

function textoResumen(perfil, r, n, movimientos) {
  const hechos = perfil.datos.hechos
  const l = [`*${perfil.emprendimiento}* · ${r.nombre}`, `Cuentas de ${perfil.nickname} (ESCALA)`, '']
  if (hechos.presupuesto) l.push(`💰 Para arrancar: ${soles(n.inversion)}`)
  if (hechos.costos) l.push(`📌 Pagos fijos al mes: ${soles(n.fijos)}`, `🧾 Me cuesta cada ${r.unidad}: ${soles(n.costoUnidad, { decimales: 2 })}`)
  if (hechos.precio) l.push(`🏷️ Mi precio de venta: ${soles(n.precio)}`)
  if (hechos.meta) {
    l.push(`⚖️ Para no perder: ${n.equilibrio == null ? '—' : plural(n.equilibrio, r)} al mes`)
    if (n.unidadesMeta != null) l.push(`🎯 Para ganar ${soles(n.metaGanancia)}: ${plural(n.unidadesMeta, r)} al mes`)
  }
  if (hechos.flujo) {
    l.push('', `📅 Mis primeros ${MESES_FLUJO} meses:`)
    n.meses.forEach((m, i) => l.push(`   Mes ${i + 1}: ${plural(m.unidades, r)} → ${soles(m.resultado)}`))
  }
  if (movimientos.length) l.push('', `📒 Dinero en caja hoy: ${soles(saldo(movimientos))}`)
  return l.join('\n')
}

export function compartirTexto(texto) {
  if (navigator.share) {
    navigator.share({ text: texto }).catch((e) => {
      if (e?.name !== 'AbortError') window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank', 'noopener')
    })
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank', 'noopener')
  }
}

export function Lobby({ perfil, n, movimientos, guardado, ultimoHecho, cerrarAviso }) {
  const r = rubroDe(perfil)
  const { lista, siguiente, planCompleto } = estadoApartados(perfil.datos.hechos)
  const hechos = perfil.datos.hechos
  const caja = resumenMes(movimientos, mesDe(hoy()))
  const hayAlgo = Object.values(hechos).some(Boolean) || movimientos.length > 0

  const destacados = [
    hechos.precio && { etiqueta: 'Precio de venta', valor: soles(n.precio), nota: `por ${r.unidad}`, de: 'precio' },
    hechos.meta && n.equilibrio != null && { etiqueta: 'Para no perder', valor: plural(n.equilibrio, r), nota: 'al mes', de: 'meta' },
    !hechos.precio && hechos.presupuesto && { etiqueta: 'Para arrancar', valor: soles(n.inversion), de: 'presupuesto' },
    !hechos.precio && hechos.costos && { etiqueta: 'Te cuesta', valor: soles(n.costoUnidad, { decimales: 2 }), nota: `cada ${r.unidad}`, de: 'costos' },
    movimientos.length > 0 && {
      etiqueta: 'En caja',
      valor: soles(saldo(movimientos)),
      nota: caja.cantidad ? `este mes ${caja.resultado >= 0 ? '+ ' : ''}${soles(caja.resultado)}` : null,
      tono: saldo(movimientos) >= 0 ? 'pos' : 'neg',
      de: 'caja',
    },
  ].filter(Boolean)

  return (
    <div className="lobby">
      <header className="lobby__cabeza">
        <div className="lobby__fila">
          <Logo />
          <div className="lobby__acciones">
            <button className="btn-asesor" onClick={() => ir('/asesores')}>
              💬 <span>Asesor</span>
            </button>
            <button className="lobby__perfil" onClick={() => ir('/perfil')} aria-label="Mi cuenta">
              {perfil.nickname.slice(0, 1).toUpperCase()}
            </button>
          </div>
        </div>
        <p className="lobby__hola">Hola, {perfil.nickname} 👋</p>
        <div className="lobby__negocio">
          {marcaDe(perfil.datos).foto ? (
            <FotoMarca foto={marcaDe(perfil.datos).foto} nombre={perfil.emprendimiento} tamano="chica" />
          ) : (
            <span className="lobby__emoji">{r.emoji}</span>
          )}
          <div>
            <h1>{perfil.emprendimiento}</h1>
            <span>{r.nombre}</span>
          </div>
        </div>
        <EstadoGuardado estado={guardado} />
      </header>

      <main className="contenido">
        {ultimoHecho && (
          <div className="aviso-hecho" role="status">
            <span>
              {planCompleto && ultimoHecho !== 'caja' ? (
                <>🎉 <strong>¡Terminaste tu plan!</strong> Ahora anota tus ventas y gastos en el control de caja.</>
              ) : (
                <>
                  ✅ Terminaste: <strong>{APARTADO[ultimoHecho].nombre}</strong>.
                  {siguiente ? ` Ahora sigue con ${APARTADO[siguiente].nombre.toLowerCase()}.` : ''}
                </>
              )}
            </span>
            <button onClick={cerrarAviso} aria-label="Cerrar">✕</button>
          </div>
        )}

        <section className="tablero">
          <h2 className="tablero__titulo">Tu negocio hoy</h2>
          {destacados.length ? (
            <div className="tablero__grilla">
              {destacados.slice(0, 4).map((d) => (
                <div key={d.etiqueta} className="tablero__dato" style={{ '--c': APARTADO[d.de].color, '--c-claro': APARTADO[d.de].claro }}>
                  <span>{d.etiqueta}</span>
                  <strong className={d.tono || ''}>{d.valor}</strong>
                  {d.nota && <small>{d.nota}</small>}
                </div>
              ))}
            </div>
          ) : (
            <p className="tablero__vacio">Aquí vas a ver tus números más importantes. Empieza por el primer apartado 👇</p>
          )}
        </section>

        <ResumenNegocio perfil={perfil} n={n} movimientos={movimientos} r={r} />

        {siguiente && (
          <button className="siguiente-paso" onClick={() => ir(`/${siguiente}`)}>
            <span className="siguiente-paso__icono">{APARTADO[siguiente].emoji}</span>
            <span>
              <small>Sigue aquí</small>
              <strong>{APARTADO[siguiente].nombre}</strong>
            </span>
            <span className="apartado__flecha">→</span>
          </button>
        )}

        {GRUPOS.filter((g) => g.id === 'plan' || g.id === 'aprende').map((g) => (
          <section key={g.id} className="apartados">
            <h2 className="grupo__titulo" style={{ '--c': g.color }}>{g.nombre}</h2>
            {lista
              .filter((a) => a.grupo === g.id)
              .map((a) => (
                <TarjetaApartado
                  key={a.id}
                  apartado={a}
                  esSiguiente={a.id === siguiente}
                  detalle={a.estado === 'hecho' || a.grupo !== 'plan' ? detalleApartado(a.id, n, r, movimientos, perfil.datos) : ''}
                  onAbrir={() => ir(`/${destinoDisponible(lista, a.id)}`)}
                />
              ))}
          </section>
        ))}

        {hayAlgo && (
          <button className="btn btn--whatsapp" onClick={() => compartirTexto(textoResumen(perfil, r, n, movimientos))}>
            Enviar mi resumen por WhatsApp
          </button>
        )}
      </main>
    </div>
  )
}

export function Perfil({ perfil, cambiarPerfil, despachar, onSalir }) {
  const r = rubroDe(perfil)
  const [nombre, setNombre] = useState(perfil.emprendimiento)
  const [salirSeguro, setSalirSeguro] = useState(false)
  const error = validarEmprendimiento(nombre)
  const cambiado = limpiarTexto(nombre) !== perfil.emprendimiento
  return (
    <Marco titulo="Mi cuenta" onAtras={() => volver('/')}>
      <div className="perfil__cabeza">
        <span className="lobby__perfil lobby__perfil--grande">{perfil.nickname.slice(0, 1).toUpperCase()}</span>
        <div>
          <strong>{perfil.nickname}</strong>
          <span>Entras con este nombre y tu DNI</span>
        </div>
      </div>

      <CampoTexto etiqueta="Nombre de tu emprendimiento" valor={nombre} onCambio={setNombre} />
      <MensajeError>{cambiado && error}</MensajeError>
      {cambiado && !error && (
        <button
          className="btn btn--principal"
          onClick={() => {
            cambiarPerfil((p) => ({ ...p, emprendimiento: limpiarTexto(nombre) }))
            volver('/')
          }}
        >
          Guardar nombre
        </button>
      )}

      <div>
        <span className="campo__etiqueta">Color de la app</span>
        <div className="temas">
          {TEMAS.map((t) => {
            const elegido = (perfil.datos.tema ?? TEMA_POR_DEFECTO) === t.id
            return (
              <button
                key={t.id}
                className={`tema${elegido ? ' tema--elegido' : ''}`}
                style={{ '--muestra': t.muestra }}
                onClick={() => despachar({ tipo: 'campo', campo: 'tema', valor: t.id })}
                aria-pressed={elegido}
              >
                <span className="tema__color">{elegido ? '✓' : ''}</span>
                {t.nombre}
              </button>
            )
          })}
        </div>
      </div>

      <button className="fila-opcion" onClick={() => ir('/asesores')}>
        <span className="rubro__emoji">💬</span>
        <span>
          <small>¿Necesitas ayuda?</small>
          <strong>Hablar con un asesor</strong>
        </span>
        <span className="apartado__flecha">→</span>
      </button>

      <button className="fila-opcion" onClick={() => ir('/perfil/rubro')}>
        <span className="rubro__emoji">{r.emoji}</span>
        <span>
          <small>Rubro</small>
          <strong>{r.nombre}</strong>
        </span>
        <span className="apartado__flecha">Cambiar →</span>
      </button>

      <p className="legal__enlaces">
        <button className="enlace" onClick={() => ir('/legal/privacidad')}>Política de privacidad</button> ·{' '}
        <button className="enlace" onClick={() => ir('/legal/terminos')}>Términos y condiciones</button>
      </p>

      {salirSeguro ? (
        <div className="confirmar">
          <p>Para volver a entrar vas a necesitar tu nombre (<strong>{perfil.nickname}</strong>) y tu DNI.</p>
          <button className="btn btn--peligro" onClick={onSalir}>
            Salir
          </button>
          <button className="btn btn--suave" onClick={() => setSalirSeguro(false)}>
            Quedarme
          </button>
        </div>
      ) : (
        <button className="btn btn--suave" onClick={() => setSalirSeguro(true)}>
          Salir de mi cuenta
        </button>
      )}
    </Marco>
  )
}

// Resumen en tarjetas que se deslizan: lo esencial de cada apartado, y el detalle completo si lo pide.
function ResumenNegocio({ perfil, n, movimientos, r }) {
  const [verTodo, setVerTodo] = useState(false)
  const [activa, setActiva] = useState(0)
  const carrusel = useRef(null)
  const secciones = seccionesResumen({ datos: perfil.datos, n, movimientos, r, meses: MESES_FLUJO })
  if (!secciones.length) return null

  // Qué tarjeta se está viendo, para pintar los puntitos.
  useEffect(() => {
    const el = carrusel.current
    if (!el) return
    const alDeslizar = () => {
      // Posición dentro del carrusel: offsetLeft es de la página, hay que restar el del contenedor.
      const centro = el.scrollLeft + el.clientWidth / 2
      const tarjetas = [...el.children]
      const i = tarjetas.findIndex((t) => {
        const inicio = t.offsetLeft - el.offsetLeft
        return inicio <= centro && inicio + t.offsetWidth > centro
      })
      if (i >= 0) setActiva(i)
    }
    el.addEventListener('scroll', alDeslizar, { passive: true })
    return () => el.removeEventListener('scroll', alDeslizar)
  }, [secciones.length])
  const irATarjeta = (i) => {
    const el = carrusel.current
    const tarjeta = el?.children[i]
    if (!tarjeta) return
    const destino = tarjeta.offsetLeft - el.offsetLeft
    el.scrollTo({ left: destino, behavior: 'smooth' })
    // Si el navegador ignora el desplazamiento suave, se salta igual.
    setTimeout(() => {
      if (Math.abs(el.scrollLeft - destino) > 4) el.scrollLeft = destino
    }, 500)
  }

  return (
    <section className="resumen-todo">
      <div className="resumen-todo__cabeza">
        <span>
          <strong>Resumen de tu negocio</strong>
          <small>Desliza para ver cada parte →</small>
        </span>
      </div>

      <div className="carrusel" ref={carrusel}>
        {secciones.map((s) => (
          <article key={s.id} className="resumen-bloque" style={{ '--c': s.color, '--c-claro': s.claro }}>
            <button className="resumen-bloque__titulo" onClick={() => ir(`/${s.id}`)}>
              <span aria-hidden="true">{s.emoji}</span> {s.nombre} <span className="resumen-bloque__ir">Abrir →</span>
            </button>
            <dl className="resumen-bloque__filas">
              {(verTodo ? s.filas : s.clave).map((f) => (
                <div key={f.etiqueta} className={f.fuerte ? 'resumen-fila resumen-fila--fuerte' : 'resumen-fila'}>
                  <dt>{f.etiqueta}</dt>
                  <dd className={f.tono ?? ''}>{f.valor}</dd>
                </div>
              ))}
            </dl>
            {!verTodo && s.filas.length > s.clave.length && (
              <span className="resumen-bloque__mas">+{s.filas.length - s.clave.length} datos más</span>
            )}
          </article>
        ))}
      </div>

      <div className="carrusel__puntos" role="tablist" aria-label="Partes del resumen">
        {secciones.map((s, i) => (
          <button
            key={s.id}
            className={`carrusel__punto${i === activa ? ' carrusel__punto--activo' : ''}`}
            style={{ '--c': s.color }}
            aria-label={s.nombre}
            aria-selected={i === activa}
            role="tab"
            onClick={() => irATarjeta(i)}
          />
        ))}
      </div>

      <button className="btn btn--texto" onClick={() => setVerTodo(!verTodo)}>
        {verTodo ? 'Ver solo lo importante' : 'Ver todos los números'}
      </button>
    </section>
  )
}

// Una tarjeta de apartado: misma pinta en el inicio y en la pestaña Negocio.
function TarjetaApartado({ apartado: a, esSiguiente, detalle, onAbrir }) {
  return (
    <button
      className={`apartado apartado--${a.estado}${esSiguiente ? ' apartado--siguiente' : ''}`}
      style={{ '--c': a.color, '--c-claro': a.claro }}
      onClick={onAbrir}
    >
      <span className="apartado__icono">{a.estado === 'hecho' ? '✓' : a.estado === 'bloqueado' ? '🔒' : a.emoji}</span>
      <span className="apartado__texto">
        <span className="apartado__nombre">
          {a.numero && <span className="apartado__num">{a.numero}.</span>} {a.nombre}
        </span>
        <span className="apartado__detalle">
          {a.estado === 'bloqueado'
            ? `Primero: ${a.faltan.map((f) => f.nombre.toLowerCase()).join(' y ')}`
            : detalle || QUE_ES[a.id]}
        </span>
      </span>
      {esSiguiente ? <span className="apartado__chip">Sigue aquí</span> : <span className="apartado__flecha">→</span>}
    </button>
  )
}

// Los apartados de un grupo: es lo que muestra la pestaña "Negocio".
export function GrupoApartados({ perfil, n, movimientos, guardado, grupo, titulo }) {
  const r = rubroDe(perfil)
  const { lista, siguiente } = estadoApartados(perfil.datos.hechos)
  return (
    <div className="pantalla-grupo">
      <header className="lobby__cabeza lobby__cabeza--corta">
        <div className="lobby__fila">
          <strong className="pantalla-grupo__titulo">{titulo}</strong>
          <EstadoGuardado estado={guardado} />
        </div>
      </header>
      <main className="contenido">
        <section className="apartados">
          {lista
            .filter((a) => a.grupo === grupo)
            .map((a) => (
              <TarjetaApartado
                key={a.id}
                apartado={a}
                esSiguiente={a.id === siguiente}
                detalle={a.estado === 'hecho' || a.grupo !== 'plan' ? detalleApartado(a.id, n, r, movimientos, perfil.datos) : ''}
                onAbrir={() => ir(`/${destinoDisponible(lista, a.id)}`)}
              />
            ))}
        </section>
      </main>
    </div>
  )
}
