import { useState } from 'react'
import { EJEMPLOS_INVENTARIO } from '../data/materiales.js'
import { GANANCIAS_RAPIDAS } from '../config.js'
import { APARTADO } from '../lib/apartados.js'
import { num, soles } from '../lib/calc.js'
import { limpiarTexto } from '../lib/cuenta.js'
import { MEDIDAS, alcanzaPara, costoProducto, resultadoPrecio } from '../lib/inventario.js'
import { nuevoId } from '../almacen.js'
import { inventarioDe, ir, reemplazar, volver } from '../negocio.js'
import { Aprende, Ayuda, BotonSiguiente, CampoNumero, CampoTexto, Casilla, Marco, Pregunta } from '../componentes.jsx'
import { singular } from './inventario.jsx'

const marco = (guardado, extra) => ({
  titulo: APARTADO.costeo.nombre,
  emoji: APARTADO.costeo.emoji,
  guardado,
  onAtras: () => volver('/'),
  ...extra,
})

const opcionesCosto = (datos, n) => ({ valorHora: num(datos.valorHora), fijoPorUnidad: datos.hechos?.costos ? n.fijoPorUnidad : 0 })

export function Costeo({ datos, despachar, guardado, perfil, r, n }) {
  const inv = inventarioDe(datos)
  const productos = datos.productos ?? []
  const ejemplo = EJEMPLOS_INVENTARIO[perfil.rubro]
  const nombres = new Set(productos.map((p) => p.nombre.toLowerCase()))
  const ejemplosLibres = (ejemplo?.productos ?? []).filter((e) => !nombres.has(e.nombre.toLowerCase()))

  const usarEjemplo = (e) => {
    const id = nuevoId()
    despachar({ tipo: 'producto:ejemplo', ejemplo: e, materiales: ejemplo.materiales, id })
    if (!num(datos.valorHora) && ejemplo.valorHora) despachar({ tipo: 'campo', campo: 'valorHora', valor: String(ejemplo.valorHora) })
    ir(`/costeo/${id}`)
  }

  return (
    <Marco {...marco(guardado)}>
      <Pregunta sub={`Calcula cuánto te cuesta de verdad cada ${r.unidad}, según los materiales que usa y tu tiempo.`}>
        ¿Cuánto te cuesta cada producto?
      </Pregunta>

      {productos.length > 0 && (
        <div className="materiales">
          {productos.map((p) => {
            const c = costoProducto(p, inv.materiales, opcionesCosto(datos, n))
            const res = resultadoPrecio(c.total, p.ganancia ?? datos.ganancia, p.precioVenta)
            return (
              <button key={p.id} className="material producto" onClick={() => ir(`/costeo/${p.id}`)}>
                <span className="material__texto">
                  <strong>{p.nombre}</strong>
                  <small>Te cuesta {soles(c.total, { decimales: 2 })}</small>
                  {res.actual ? (
                    <small className={res.gananciaActual >= 0 ? 'pos' : 'neg'}>
                      Lo vendes a {soles(res.actual)}: {res.gananciaActual >= 0 ? 'ganas' : 'pierdes'} {soles(Math.abs(res.gananciaActual), { decimales: 2 })}
                    </small>
                  ) : (
                    <small>Precio sugerido: {soles(res.sugerido)}</small>
                  )}
                </span>
                <span className="apartado__flecha">→</span>
              </button>
            )
          })}
        </div>
      )}

      <button className="btn btn--principal" onClick={() => ir('/costeo/nuevo')}>
        + {productos.length ? 'Otro producto' : 'Calcular mi primer producto'}
      </button>

      {ejemplosLibres.length > 0 && (
        <div className="explica">
          <p>O empieza con un ejemplo de tu oficio y cámbialo a tu medida:</p>
          <div className="conceptos conceptos--espacio">
            {ejemplosLibres.map((e) => (
              <button key={e.nombre} className="chip chip--concepto" onClick={() => usarEjemplo(e)}>
                {e.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {inv.materiales.length === 0 && (
        <p className="nota-suave nota-suave--izq">
          Tip: si primero anotas tus materiales en el <button className="enlace" onClick={() => ir('/inventario')}>inventario</button>, aquí solo eliges cuánto usa cada producto.
        </p>
      )}

      <Aprende termino="costo unitario">
        Es lo que te cuesta hacer uno solo: los materiales que usa, el pago de tu tiempo y una parte de tus pagos del mes.
      </Aprende>
    </Marco>
  )
}

export function FichaProducto({ id, datos, despachar, guardado, r, n }) {
  const inv = inventarioDe(datos)
  const existente = (datos.productos ?? []).find((p) => p.id === id)
  const [p, setP] = useState(
    () =>
      existente ?? { id: nuevoId(), nombre: '', materiales: [], horas: '', incluirFijos: true, ganancia: datos.ganancia, precioVenta: '' },
  )
  const [nuevoMat, setNuevoMat] = useState(null) // mini formulario para crear un material sin salir
  const [borrar, setBorrar] = useState(false)

  if (id !== 'nuevo' && !existente) return null
  const cambiar = (cambio) => setP((x) => ({ ...x, ...cambio }))
  const opciones = opcionesCosto(datos, n)
  const c = costoProducto(p, inv.materiales, opciones)
  const ganancia = p.ganancia ?? datos.ganancia
  const res = resultadoPrecio(c.total, ganancia, p.precioVenta)
  const libres = inv.materiales.filter((m) => !p.materiales.some((l) => l.materialId === m.id))
  // Solo si ya se contó cuánto hay de cada material que usa; si no, "alcanza para 0" confunde.
  const contados = new Set(inv.movimientos.map((mv) => mv.materialId))
  const alcanza = p.materiales.length && p.materiales.every((l) => contados.has(l.materialId)) ? alcanzaPara(p, inv.materiales) : null
  const valido = limpiarTexto(p.nombre).length >= 2

  const guardar = () => {
    if (!valido) return
    despachar({ tipo: 'producto:guardar', producto: { ...p, nombre: limpiarTexto(p.nombre) } })
    if (id === 'nuevo') reemplazar('/costeo')
    else volver('/costeo')
  }

  const crearMaterial = () => {
    const mid = nuevoId()
    despachar({ tipo: 'material:agregar', material: { id: mid, nombre: limpiarTexto(nuevoMat.nombre), medida: nuevoMat.medida, costo: nuevoMat.costo } })
    cambiar({ materiales: [...p.materiales, { materialId: mid, cantidad: '' }] })
    setNuevoMat(null)
  }

  return (
    <Marco
      {...marco(guardado, { titulo: existente ? existente.nombre : 'Nuevo producto', onAtras: () => volver('/costeo') })}
      pie={<BotonSiguiente onClick={guardar} disabled={!valido} aviso="Escribe el nombre del producto.">Guardar</BotonSiguiente>}
    >
      <CampoTexto etiqueta="¿Qué producto o servicio es?" valor={p.nombre} placeholder={`Ej. ${r.ejemploUnidad}`} onCambio={(v) => cambiar({ nombre: v })} maxLength={50} />

      {/* 1. Materiales */}
      <section className="ficha__seccion">
        <h2 className="subtitulo">1. ¿Qué materiales usa uno?</h2>
        {p.materiales.map((l, i) => {
          const linea = c.lineas[i]
          const m = linea.material
          if (!m) return null
          return (
            <div key={l.materialId} className="linea-mat">
              <div className="linea-mat__cabeza">
                <strong>{m.nombre}</strong>
                <button
                  className="item__quitar"
                  aria-label={`Quitar ${m.nombre}`}
                  onClick={() => cambiar({ materiales: p.materiales.filter((x) => x.materialId !== l.materialId) })}
                >
                  ✕
                </button>
              </div>
              <div className="linea-mat__fila">
                <CampoNumero
                  prefijo={null}
                  sufijo={m.medida}
                  valor={l.cantidad}
                  placeholder="0"
                  onCambio={(v) => cambiar({ materiales: p.materiales.map((x) => (x.materialId === l.materialId ? { ...x, cantidad: v } : x)) })}
                />
                <span className="linea-mat__subtotal">{soles(linea.subtotal, { decimales: 2 })}</span>
              </div>
              <small className={linea.sinCosto ? 'neg' : 'texto-suave'}>
                {linea.sinCosto ? 'Este material no tiene costo: ponlo en el inventario.' : `${soles(linea.costoUnidad, { decimales: 2 })} por ${singular(m.medida)}`}
              </small>
            </div>
          )
        })}

        {libres.length > 0 && (
          <label className="campo">
            <span className="campo__etiqueta">Agregar un material</span>
            <select
              className="selector"
              value=""
              onChange={(e) => e.target.value && cambiar({ materiales: [...p.materiales, { materialId: e.target.value, cantidad: '' }] })}
            >
              <option value="">Elegir de mi inventario…</option>
              {libres.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} ({m.medida})
                </option>
              ))}
            </select>
          </label>
        )}

        {nuevoMat ? (
          <div className="explica calculadora">
            <CampoTexto etiqueta="Material nuevo" valor={nuevoMat.nombre} placeholder="Ej. Encaje" onCambio={(v) => setNuevoMat({ ...nuevoMat, nombre: v })} />
            <div className="conceptos">
              {MEDIDAS.slice(0, 6).map((md) => (
                <button key={md} className={`chip chip--concepto${nuevoMat.medida === md ? ' chip--activo' : ''}`} onClick={() => setNuevoMat({ ...nuevoMat, medida: md })}>
                  {md}
                </button>
              ))}
            </div>
            <CampoNumero etiqueta={`¿Cuánto cuesta 1 (${nuevoMat.medida})?`} valor={nuevoMat.costo} onCambio={(v) => setNuevoMat({ ...nuevoMat, costo: v })} />
            <button className="btn btn--principal" disabled={limpiarTexto(nuevoMat.nombre).length < 2} onClick={crearMaterial}>
              Agregar material
            </button>
            <button className="btn btn--texto" onClick={() => setNuevoMat(null)}>Cancelar</button>
          </div>
        ) : (
          <button className="btn btn--suave" onClick={() => setNuevoMat({ nombre: '', medida: 'unidades', costo: '' })}>
            + Material que no está en mi inventario
          </button>
        )}
        <Ayuda etiqueta="¿Cómo sé cuánto usa?">
          Piensa en uno solo. Si con un rollo de 50 metros haces 60 {r.unidades}, cada una usa 50 ÷ 60 = 0.83 metros. Si un
          frasco de 1 litro te alcanza para 50 servicios, cada uno usa 0.02 litros.
        </Ayuda>
      </section>

      {/* 2. Trabajo */}
      <section className="ficha__seccion">
        <h2 className="subtitulo">2. Tu trabajo</h2>
        <div className="dos-columnas">
          <CampoNumero etiqueta="¿Cuántas horas te toma?" prefijo={null} sufijo="horas" valor={p.horas} placeholder="0" onCambio={(v) => cambiar({ horas: v })} />
          <CampoNumero
            etiqueta="¿Cuánto vale 1 hora tuya?"
            valor={datos.valorHora ?? ''}
            placeholder="6"
            onCambio={(v) => despachar({ tipo: 'campo', campo: 'valorHora', valor: v })}
          />
        </div>
        <Ayuda etiqueta="¿Cuánto vale mi hora?">
          Lo que te pagarían por trabajar una hora para otra persona en tu oficio. Si no cobras tu tiempo, trabajas gratis. El valor de la
          hora es el mismo para todos tus productos.
        </Ayuda>
      </section>

      {/* 3. Pagos del mes */}
      <section className="ficha__seccion">
        <h2 className="subtitulo">3. Parte de tus pagos del mes</h2>
        {datos.hechos?.costos ? (
          <Casilla marcada={p.incluirFijos !== false} onCambio={(v) => cambiar({ incluirFijos: v })}>
            Sumar {soles(n.fijoPorUnidad, { decimales: 2 })} por {r.unidad} de alquiler, luz y otros pagos
          </Casilla>
        ) : (
          <p className="nota-suave nota-suave--izq">
            Completa <button className="enlace" onClick={() => ir('/costos')}>Costos del mes</button> para sumar aquí tu parte de alquiler, luz y otros pagos.
          </p>
        )}
      </section>

      {/* Resultado */}
      <div className="suma">
        <div className="suma__fila">
          <span>Materiales</span>
          <span>{soles(c.deMateriales, { decimales: 2 })}</span>
        </div>
        <div className="suma__fila">
          <span>Tu trabajo</span>
          <span>+ {soles(c.manoObra, { decimales: 2 })}</span>
        </div>
        <div className="suma__fila">
          <span>Pagos del mes</span>
          <span>+ {soles(c.fijos, { decimales: 2 })}</span>
        </div>
        <div className="suma__fila suma__fila--total">
          <span>Te cuesta cada uno</span>
          <span>{soles(c.total, { decimales: 2 })}</span>
        </div>
      </div>

      <h2 className="subtitulo">¿Cuánto quieres ganar encima?</h2>
      <div className="chips">
        {GANANCIAS_RAPIDAS.map((v) => (
          <button key={v} className={`chip${ganancia === v ? ' chip--activo' : ''}`} onClick={() => cambiar({ ganancia: v })}>
            {v}%
          </button>
        ))}
      </div>
      <div className="resultado">
        <span>Precio sugerido</span>
        <strong>{soles(res.sugerido)}</strong>
        <span className="resultado__nota">Ganas {soles(res.sugerido - c.total, { decimales: 2 })} por cada uno</span>
      </div>

      <CampoNumero etiqueta="¿A cuánto lo vendes hoy?" valor={p.precioVenta} placeholder={String(res.sugerido)} onCambio={(v) => cambiar({ precioVenta: v })} />
      {res.actual > 0 && c.total > 0 && (
        <div className={`cifra ${res.gananciaActual < 0 ? 'cifra--mal' : res.actual < res.sugerido ? 'cifra--alerta' : 'cifra--bien'}`}>
          <span className="cifra__etiqueta">A {soles(res.actual)}</span>
          <strong className="cifra__valor">
            {res.gananciaActual >= 0 ? 'Ganas' : 'Pierdes'} {soles(Math.abs(res.gananciaActual), { decimales: 2 })}
          </strong>
          <span className="cifra__nota">
            {res.gananciaActual < 0
              ? 'Cada vez que vendes a ese precio pierdes dinero. Sube el precio o revisa cuánto material usas.'
              : res.actual < res.sugerido
                ? `Ganas menos del ${ganancia}% que quieres. Podrías cobrar ${soles(res.sugerido)}.`
                : '¡Tu precio cubre tus costos y tu ganancia!'}
          </span>
        </div>
      )}

      {alcanza != null && (
        <p className="nota-suave nota-suave--izq">
          📦 Con lo que tienes en tu inventario alcanza para hacer <strong>{alcanza}</strong>.
        </p>
      )}

      {existente &&
        (borrar ? (
          <div className="confirmar">
            <p>¿Borrar la ficha de <strong>{existente.nombre}</strong>? Tus materiales no se borran.</p>
            <button
              className="btn btn--peligro"
              onClick={() => {
                despachar({ tipo: 'producto:quitar', id })
                volver('/costeo')
              }}
            >
              Sí, borrar
            </button>
            <button className="btn btn--suave" onClick={() => setBorrar(false)}>No</button>
          </div>
        ) : (
          <button className="btn btn--texto" onClick={() => setBorrar(true)}>Borrar este producto</button>
        ))}
    </Marco>
  )
}
