import { useState } from 'react'
import { RUBROS } from '../data/rubros.js'
import { MESES_FLUJO } from '../config.js'
import { APARTADO, destinoDisponible, estadoApartados } from '../lib/apartados.js'
import { hoy, mesDe, resumenMes, saldo } from '../lib/caja.js'
import { soles } from '../lib/calc.js'
import { limpiarTexto, validarEmprendimiento } from '../lib/cuenta.js'
import { ir, volver } from '../negocio.js'
import { CampoTexto, EstadoGuardado, Logo, Marco, MensajeError } from '../componentes.jsx'

export const plural = (n, r) => `${n.toLocaleString('es-PE')} ${n === 1 ? r.unidad : r.unidades}`

function detalleApartado(id, n, r, movimientos) {
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
  const r = RUBROS[perfil.rubro]
  const { lista, siguiente, planCompleto } = estadoApartados(perfil.datos.hechos)
  const hechos = perfil.datos.hechos
  const caja = resumenMes(movimientos, mesDe(hoy()))
  const hayAlgo = Object.values(hechos).some(Boolean) || movimientos.length > 0

  const destacados = [
    hechos.precio && { etiqueta: 'Precio de venta', valor: soles(n.precio), nota: `por ${r.unidad}` },
    hechos.meta && n.equilibrio != null && { etiqueta: 'Para no perder', valor: plural(n.equilibrio, r), nota: 'al mes' },
    !hechos.precio && hechos.presupuesto && { etiqueta: 'Para arrancar', valor: soles(n.inversion) },
    !hechos.precio && hechos.costos && { etiqueta: 'Te cuesta', valor: soles(n.costoUnidad, { decimales: 2 }), nota: `cada ${r.unidad}` },
    movimientos.length > 0 && {
      etiqueta: 'En caja',
      valor: soles(saldo(movimientos)),
      nota: caja.cantidad ? `este mes ${caja.resultado >= 0 ? '+ ' : ''}${soles(caja.resultado)}` : null,
      tono: saldo(movimientos) >= 0 ? 'pos' : 'neg',
    },
  ].filter(Boolean)

  return (
    <div className="lobby">
      <header className="lobby__cabeza">
        <div className="lobby__fila">
          <Logo />
          <button className="lobby__perfil" onClick={() => ir('/perfil')} aria-label="Mi cuenta">
            {perfil.nickname.slice(0, 1).toUpperCase()}
          </button>
        </div>
        <p className="lobby__hola">Hola, {perfil.nickname} 👋</p>
        <div className="lobby__negocio">
          <span className="lobby__emoji">{r.emoji}</span>
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
                <div key={d.etiqueta} className="tablero__dato">
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

        <section className="apartados">
          {lista.map((a) => {
            const esSiguiente = a.id === siguiente
            const detalle = a.estado === 'hecho' || a.id === 'caja' ? detalleApartado(a.id, n, r, movimientos) : ''
            return (
              <button
                key={a.id}
                className={`apartado apartado--${a.estado}${esSiguiente ? ' apartado--siguiente' : ''}${a.id === 'caja' ? ' apartado--caja' : ''}`}
                onClick={() => ir(`/${destinoDisponible(lista, a.id)}`)}
              >
                <span className="apartado__icono">{a.estado === 'hecho' ? '✓' : a.estado === 'bloqueado' ? '🔒' : a.emoji}</span>
                <span className="apartado__texto">
                  <span className="apartado__nombre">
                    {a.id !== 'caja' && <span className="apartado__num">{a.numero}.</span>} {a.nombre}
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
          })}
        </section>

        {hayAlgo && (
          <button className="btn btn--whatsapp" onClick={() => compartirTexto(textoResumen(perfil, r, n, movimientos))}>
            Enviar mi resumen por WhatsApp
          </button>
        )}
      </main>
    </div>
  )
}

export function Perfil({ perfil, cambiarPerfil, onSalir }) {
  const r = RUBROS[perfil.rubro]
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

      <button className="fila-opcion" onClick={() => ir('/perfil/rubro')}>
        <span className="rubro__emoji">{r.emoji}</span>
        <span>
          <small>Rubro</small>
          <strong>{r.nombre}</strong>
        </span>
        <span className="apartado__flecha">Cambiar →</span>
      </button>

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
