import { useState } from 'react'
import { EJEMPLOS_INVENTARIO } from '../data/materiales.js'
import { APARTADO } from '../lib/apartados.js'
import { hoy, nombreDia } from '../lib/caja.js'
import { num, soles } from '../lib/calc.js'
import { limpiarTexto } from '../lib/cuenta.js'
import { MEDIDAS, alcanzaPara, fmtCantidad, porAcabarse, valorInventario } from '../lib/inventario.js'
import { inventarioDe, ir, volver } from '../negocio.js'
import { Aprende, Ayuda, BotonSiguiente, CampoNumero, CampoTexto, Casilla, Marco, MensajeError, Pregunta } from '../componentes.jsx'

const marco = (guardado, extra) => ({
  titulo: APARTADO.inventario.nombre,
  emoji: APARTADO.inventario.emoji,
  guardado,
  onAtras: () => volver('/'),
  ...extra,
})

export const singular = (medida) => ({ unidades: 'unidad', metros: 'metro', kilos: 'kilo', litros: 'litro', conos: 'cono', frascos: 'frasco', tubos: 'tubo', barras: 'barra', galones: 'galón', paquetes: 'paquete' })[medida] ?? medida
export const cantidadCon = (q, medida) => `${fmtCantidad(q)} ${Number(q) === 1 ? singular(medida) : medida}`

export function Inventario({ datos, despachar, guardado, perfil }) {
  const inv = inventarioDe(datos)
  const ejemplos = EJEMPLOS_INVENTARIO[perfil.rubro]?.materiales ?? []
  const [elegidos, setElegidos] = useState(() => new Set(ejemplos.map((m) => m.clave)))
  const [verTodo, setVerTodo] = useState(false)
  const contados = new Set(inv.movimientos.map((mv) => mv.materialId))
  const bajos = porAcabarse(inv.materiales).filter((m) => contados.has(m.id))
  const sinContar = inv.materiales.filter((m) => !contados.has(m.id)).length
  const nombreDe = (id) => inv.materiales.find((m) => m.id === id)

  if (!inv.materiales.length) {
    return (
      <Marco {...marco(guardado)}>
        <Pregunta sub="Anota los materiales que compras para trabajar: así sabes cuánto tienes, cuánto te cuesta y cuándo comprar.">
          ¿Qué materiales usas?
        </Pregunta>
        {ejemplos.length > 0 && (
          <>
            <p className="nota-suave nota-suave--izq">Marca los que usas. Después pones cuánto tienes.</p>
            <div className="lista">
              {ejemplos.map((m) => (
                <Casilla
                  key={m.clave}
                  marcada={elegidos.has(m.clave)}
                  onCambio={(v) => {
                    const s = new Set(elegidos)
                    v ? s.add(m.clave) : s.delete(m.clave)
                    setElegidos(s)
                  }}
                >
                  {m.nombre} <small className="texto-suave">· por {singular(m.medida)}, ej. {soles(m.costo)}</small>
                </Casilla>
              ))}
            </div>
            <button
              className="btn btn--principal"
              disabled={!elegidos.size}
              onClick={() => despachar({ tipo: 'material:ejemplos', materiales: ejemplos.filter((m) => elegidos.has(m.clave)) })}
            >
              Agregar {elegidos.size} materiales
            </button>
          </>
        )}
        <button className="btn btn--suave" onClick={() => ir('/inventario/nuevo')}>
          + Agregar otro material
        </button>
        <Aprende termino="inventario">Es la lista de lo que tienes guardado para trabajar. Tu material es dinero.</Aprende>
      </Marco>
    )
  }

  const movs = verTodo ? inv.movimientos.slice(0, 100) : inv.movimientos.slice(0, 6)
  return (
    <Marco {...marco(guardado)}>
      <div className="saldo">
        <span>Tienes en materiales</span>
        <strong>{soles(valorInventario(inv.materiales))}</strong>
        <small className="saldo__nota">Lo que te costó lo que tienes guardado</small>
      </div>

      {bajos.length > 0 && (
        <div className="alerta-stock" role="status">
          <strong>⚠️ Se están acabando:</strong> {bajos.map((m) => m.nombre).join(', ')}. Compra pronto.
        </div>
      )}

      {sinContar > 0 && (
        <div className="explica">
          Tienes {sinContar} {sinContar === 1 ? 'material' : 'materiales'} sin cantidad. Toca <strong>Conté</strong> y escribe cuánto tienes de cada uno.
        </div>
      )}

      <div className="inv__botones">
        <button className="btn btn--entrada" onClick={() => ir('/inventario/compra')}>
          <span>＋</span> Compré
        </button>
        <button className="btn btn--salida" onClick={() => ir('/inventario/uso')}>
          <span>−</span> Usé
        </button>
        <button className="btn btn--conteo" onClick={() => ir('/inventario/conteo')}>
          <span>🔢</span> Conté
        </button>
      </div>

      <div className="materiales">
        {inv.materiales.map((m) => {
          const bajo = bajos.includes(m)
          return (
            <button key={m.id} className={`material${bajo ? ' material--bajo' : ''}`} onClick={() => ir(`/inventario/material/${m.id}`)}>
              <span className="material__texto">
                <strong>{m.nombre}</strong>
                <small>{m.costo ? `${soles(Number(m.costo), { decimales: 2 })} por ${singular(m.medida)}` : 'Sin costo: tócalo para ponerlo'}</small>
              </span>
              <span className="material__stock">
                <strong>{fmtCantidad(m.stock)}</strong>
                <small>{m.medida}</small>
              </span>
            </button>
          )
        })}
      </div>
      <button className="btn btn--suave" onClick={() => ir('/inventario/nuevo')}>
        + Agregar material
      </button>

      {inv.movimientos.length > 0 && (
        <section className="historial">
          <h2 className="subtitulo">Últimos movimientos</h2>
          {movs.map((mv) => {
            const m = nombreDe(mv.materialId)
            return (
              <div key={mv.id} className="historial__fila">
                <span className={`movimiento__icono movimiento__icono--${mv.tipo === 'compra' ? 'entrada' : mv.tipo === 'uso' ? 'salida' : 'conteo'}`}>
                  {mv.tipo === 'compra' ? '＋' : mv.tipo === 'uso' ? '−' : '='}
                </span>
                <span className="movimiento__concepto">
                  {mv.tipo === 'compra' ? 'Compré' : mv.tipo === 'uso' ? 'Usé' : 'Conté'} {m ? cantidadCon(mv.cantidad, m.medida) : fmtCantidad(mv.cantidad)} de {m?.nombre ?? 'material borrado'}
                  <small>
                    {mv.fecha ? nombreDia(mv.fecha) : ''}
                    {mv.nota ? ` · ${mv.nota}` : ''}
                    {mv.tipo === 'compra' && mv.costoTotal ? ` · ${soles(mv.costoTotal)}` : ''}
                    {mv.tipo === 'ajuste' && mv.diferencia && !mv.nota ? ` · ${mv.diferencia > 0 ? 'sobraban' : 'faltaban'} ${fmtCantidad(Math.abs(mv.diferencia))}` : ''}
                  </small>
                </span>
              </div>
            )
          })}
          {inv.movimientos.length > 6 && (
            <button className="btn btn--texto" onClick={() => setVerTodo(!verTodo)}>
              {verTodo ? 'Ver menos' : 'Ver todos'}
            </button>
          )}
        </section>
      )}
      <Aprende termino="stock">
        Es la cantidad que tienes de cada material. Cuenta tus materiales cada cierto tiempo con "Conté": si no coincide, algo se usó sin anotar o se desperdició.
      </Aprende>
    </Marco>
  )
}

// ---------- Crear o editar un material ----------
export function Material({ id, datos, despachar, guardado }) {
  const inv = inventarioDe(datos)
  const existente = id ? inv.materiales.find((m) => m.id === id) : null
  const [nombre, setNombre] = useState(existente?.nombre ?? '')
  const [medida, setMedida] = useState(existente?.medida ?? 'unidades')
  const [costo, setCosto] = useState(existente?.costo ? String(existente.costo) : '')
  const [stock, setStock] = useState('')
  const [minimo, setMinimo] = useState(existente?.minimo ? String(existente.minimo) : '')
  const [paquete, setPaquete] = useState({ abierto: false, cantidad: '', precio: '' })
  const [borrar, setBorrar] = useState(false)

  if (id && !existente) return null
  const valido = limpiarTexto(nombre).length >= 2
  const usadoEn = (datos.productos ?? []).filter((p) => p.materiales.some((l) => l.materialId === id))
  const costoPaquete = num(paquete.cantidad) > 0 && num(paquete.precio) > 0 ? num(paquete.precio) / num(paquete.cantidad) : null

  const guardar = () => {
    if (!valido) return
    const base = { nombre: limpiarTexto(nombre), medida, costo: num(costo), minimo: num(minimo) }
    if (existente) despachar({ tipo: 'material:editar', id, cambio: base })
    else despachar({ tipo: 'material:agregar', material: { ...base, stock } })
    volver('/inventario')
  }

  const historial = existente ? inv.movimientos.filter((m) => m.materialId === id).slice(0, 20) : []

  return (
    <Marco
      {...marco(guardado, { titulo: existente ? existente.nombre : 'Nuevo material', onAtras: () => volver('/inventario') })}
      pie={<BotonSiguiente onClick={guardar} disabled={!valido} aviso="Escribe el nombre del material.">Guardar</BotonSiguiente>}
    >
      {existente && (
        <div className="saldo saldo--claro">
          <span>Tienes</span>
          <strong>{cantidadCon(existente.stock, existente.medida)}</strong>
          <small>Para cambiarlo usa Compré, Usé o Conté</small>
        </div>
      )}
      <CampoTexto etiqueta="¿Qué material es?" valor={nombre} placeholder="Ej. Tela jersey" onCambio={setNombre} maxLength={50} />

      <div>
        <span className="campo__etiqueta">¿Cómo lo mides?</span>
        <div className="conceptos">
          {MEDIDAS.map((m) => (
            <button key={m} className={`chip chip--concepto${medida === m ? ' chip--activo' : ''}`} onClick={() => setMedida(m)}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <CampoNumero etiqueta={`¿Cuánto cuesta 1 ${singular(medida)}?`} valor={costo} placeholder="0" onCambio={setCosto} />
      {!paquete.abierto ? (
        <button className="btn btn--texto btn--izq" onClick={() => setPaquete({ ...paquete, abierto: true })}>
          Lo compro en paquete o rollo: calcular
        </button>
      ) : (
        <div className="explica calculadora">
          <p>
            Ej.: un rollo de 50 metros a S/ 400 → cada metro cuesta S/ 8.
          </p>
          <div className="dos-columnas">
            <CampoNumero etiqueta={`¿Cuántos ${medida} trae?`} prefijo={null} valor={paquete.cantidad} onCambio={(v) => setPaquete({ ...paquete, cantidad: v })} />
            <CampoNumero etiqueta="¿Cuánto pagaste?" valor={paquete.precio} onCambio={(v) => setPaquete({ ...paquete, precio: v })} />
          </div>
          {costoPaquete != null && (
            <button className="btn btn--suave" onClick={() => setCosto(String(Math.round(costoPaquete * 10000) / 10000))}>
              Usar {soles(costoPaquete, { decimales: 2 })} por {singular(medida)}
            </button>
          )}
        </div>
      )}

      {!existente && (
        <CampoNumero etiqueta={`¿Cuántos ${medida} tienes ahora?`} prefijo={null} sufijo={medida} valor={stock} placeholder="0" onCambio={setStock} />
      )}
      <CampoNumero etiqueta="Avísame cuando me queden menos de…" prefijo={null} sufijo={medida} valor={minimo} placeholder="0" onCambio={setMinimo} />
      <Ayuda etiqueta="¿Qué pongo de mínimo?">
        Lo que necesitas para trabajar mientras vas a comprar más. Si tardas 2 días en comprar y usas 3 {medida} al día, pon 6.
      </Ayuda>

      {existente && historial.length > 0 && (
        <section className="historial">
          <h2 className="subtitulo">Movimientos</h2>
          {historial.map((mv) => (
            <div key={mv.id} className="historial__fila historial__fila--simple">
              <span>
                {mv.tipo === 'compra' ? '＋ Compré' : mv.tipo === 'uso' ? '− Usé' : '= Conté'} {cantidadCon(mv.cantidad, existente.medida)}
                <small>
                  {mv.fecha ? nombreDia(mv.fecha) : ''}
                  {mv.nota ? ` · ${mv.nota}` : ''}
                </small>
              </span>
              {mv.costoTotal ? <strong>{soles(mv.costoTotal)}</strong> : null}
            </div>
          ))}
        </section>
      )}

      {existente &&
        (borrar ? (
          <div className="confirmar">
            <p>
              ¿Borrar <strong>{existente.nombre}</strong>?
              {usadoEn.length > 0 && ` También se quita de: ${usadoEn.map((p) => p.nombre).join(', ')}.`}
            </p>
            <button
              className="btn btn--peligro"
              onClick={() => {
                despachar({ tipo: 'material:quitar', id })
                volver('/inventario')
              }}
            >
              Sí, borrar
            </button>
            <button className="btn btn--suave" onClick={() => setBorrar(false)}>
              No
            </button>
          </div>
        ) : (
          <button className="btn btn--texto" onClick={() => setBorrar(true)}>
            Borrar este material
          </button>
        ))}
    </Marco>
  )
}

// ---------- Compré / Usé / Conté ----------
const TITULOS = { compra: 'Compré material', uso: 'Usé material', conteo: 'Conté mi material' }

export function MovimientoInventario({ tipo, datos, despachar, agregarMovimiento, guardado, r }) {
  const inv = inventarioDe(datos)
  const productos = (datos.productos ?? []).filter((p) => p.materiales.length)
  const [materialId, setMaterialId] = useState(inv.materiales.length === 1 ? inv.materiales[0].id : null)
  const [modo, setModo] = useState('material')
  const [productoId, setProductoId] = useState(null)
  const [cantidad, setCantidad] = useState('')
  const [total, setTotal] = useState('')
  const [anotarCaja, setAnotarCaja] = useState(true)

  const m = inv.materiales.find((x) => x.id === materialId)
  const producto = productos.find((p) => p.id === productoId)
  const q = num(cantidad)
  const stock = Number(m?.stock) || 0
  const primerConteo = m && !inv.movimientos.some((mv) => mv.materialId === m.id)

  const valido =
    tipo === 'uso' && modo === 'producto'
      ? producto && q > 0
      : m && (tipo === 'conteo' ? cantidad !== '' : q > 0) && (tipo !== 'compra' || num(total) > 0)

  const guardar = () => {
    if (!valido) return
    if (tipo === 'uso' && modo === 'producto') {
      despachar({ tipo: 'inventario:usarProducto', productoId, cantidad: q })
    } else {
      despachar({
        tipo: 'inventario:movimiento',
        movimiento: {
          materialId,
          tipo: tipo === 'conteo' ? 'ajuste' : tipo,
          cantidad: q,
          costoTotal: tipo === 'compra' ? num(total) : undefined,
          nota: tipo === 'conteo' && primerConteo ? 'Primer conteo' : undefined,
        },
      })
      if (tipo === 'compra' && anotarCaja) {
        agregarMovimiento({ fecha: hoy(), tipo: 'salida', concepto: `Compra de ${m.nombre}`.slice(0, 80), unidades: null, monto: Math.round(num(total) * 100) / 100 })
      }
    }
    volver('/inventario')
  }

  if (!inv.materiales.length) {
    return (
      <Marco {...marco(guardado, { titulo: TITULOS[tipo], onAtras: () => volver('/inventario') })}>
        <p>Primero agrega tus materiales.</p>
        <button className="btn btn--principal" onClick={() => volver('/inventario')}>Ir a mi inventario</button>
      </Marco>
    )
  }

  return (
    <Marco
      {...marco(guardado, { titulo: TITULOS[tipo], onAtras: () => volver('/inventario') })}
      pie={<BotonSiguiente onClick={guardar} disabled={!valido}>Guardar</BotonSiguiente>}
    >
      {tipo === 'uso' && productos.length > 0 && (
        <div className="chips chips--dos">
          <button className={`chip${modo === 'material' ? ' chip--activo' : ''}`} onClick={() => setModo('material')}>Un material</button>
          <button className={`chip${modo === 'producto' ? ' chip--activo' : ''}`} onClick={() => setModo('producto')}>Para hacer {r.unidades}</button>
        </div>
      )}

      {tipo === 'uso' && modo === 'producto' ? (
        <>
          <Pregunta sub="Se descuentan los materiales que lleva cada uno, según su ficha de costo.">¿Qué hiciste?</Pregunta>
          <div className="conceptos">
            {productos.map((p) => (
              <button key={p.id} className={`chip chip--concepto${productoId === p.id ? ' chip--activo' : ''}`} onClick={() => setProductoId(p.id)}>
                {p.nombre}
              </button>
            ))}
          </div>
          {producto && (
            <>
              <CampoNumero etiqueta="¿Cuántos hiciste?" prefijo={null} entero valor={cantidad} placeholder="1" onCambio={setCantidad} grande />
              <div className="explica">
                <p>Se va a descontar:</p>
                <ul className="lista-simple">
                  {producto.materiales.map((l) => {
                    const mat = inv.materiales.find((x) => x.id === l.materialId)
                    if (!mat) return null
                    const usa = num(l.cantidad) * (q || 1)
                    return (
                      <li key={l.materialId} className={usa > (Number(mat.stock) || 0) ? 'neg' : ''}>
                        {mat.nombre}: {cantidadCon(usa, mat.medida)} <small>(tienes {fmtCantidad(mat.stock)})</small>
                      </li>
                    )
                  })}
                </ul>
                {alcanzaPara(producto, inv.materiales) != null && (
                  <small>Con lo que tienes alcanza para {alcanzaPara(producto, inv.materiales)}.</small>
                )}
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <Pregunta>{tipo === 'compra' ? '¿Qué compraste?' : tipo === 'uso' ? '¿Qué usaste?' : '¿Qué contaste?'}</Pregunta>
          <div className="conceptos">
            {inv.materiales.map((x) => (
              <button key={x.id} className={`chip chip--concepto${materialId === x.id ? ' chip--activo' : ''}`} onClick={() => setMaterialId(x.id)}>
                {x.nombre}
              </button>
            ))}
          </div>
          {m && (
            <>
              <CampoNumero
                grande
                prefijo={null}
                sufijo={m.medida}
                etiqueta={tipo === 'compra' ? `¿Cuántos ${m.medida} compraste?` : tipo === 'uso' ? `¿Cuántos ${m.medida} usaste?` : `¿Cuántos ${m.medida} hay de verdad?`}
                valor={cantidad}
                placeholder="0"
                onCambio={setCantidad}
              />
              {tipo !== 'compra' && !primerConteo && <p className="nota-suave nota-suave--izq">Según tus anotaciones tienes {cantidadCon(stock, m.medida)}.</p>}
              {tipo === 'conteo' && primerConteo && <p className="nota-suave nota-suave--izq">Primera vez que cuentas este material: escribe cuánto tienes hoy.</p>}
              {tipo === 'uso' && q > stock && <MensajeError>Solo tienes {cantidadCon(stock, m.medida)} anotados. Se quedará en 0: revisa si falta anotar una compra.</MensajeError>}
              {tipo === 'conteo' && !primerConteo && cantidad !== '' && q !== stock && (
                <div className="explica">
                  {q < stock
                    ? `Faltan ${cantidadCon(stock - q, m.medida)}: se usaron sin anotar, se perdieron o se desperdiciaron.`
                    : `Sobran ${cantidadCon(q - stock, m.medida)}: quizá no anotaste una compra.`}
                </div>
              )}
              {tipo === 'compra' && (
                <>
                  <CampoNumero etiqueta="¿Cuánto pagaste en total?" valor={total} placeholder="0" onCambio={setTotal} />
                  {q > 0 && num(total) > 0 && (
                    <p className="nota-suave nota-suave--izq">
                      Sale a {soles(num(total) / q, { decimales: 2 })} por {singular(m.medida)}
                      {m.costo ? ` (antes ${soles(Number(m.costo), { decimales: 2 })})` : ''}.
                    </p>
                  )}
                  <Casilla marcada={anotarCaja} onCambio={setAnotarCaja}>
                    Lo pagué con dinero del negocio: anotarlo también en mi control de caja
                  </Casilla>
                </>
              )}
            </>
          )}
        </>
      )}
    </Marco>
  )
}
