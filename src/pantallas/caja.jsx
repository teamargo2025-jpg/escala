import { useMemo, useState } from 'react'
import { APARTADO } from '../lib/apartados.js'
import { CONCEPTO_INICIAL, hoy, mesDe, moverMes, nombreDia, nombreMes, porDia, resumenMes, saldo } from '../lib/caja.js'
import { num, soles } from '../lib/calc.js'
import { limpiarTexto } from '../lib/cuenta.js'
import { ir, volver } from '../negocio.js'
import { Aprende, Ayuda, BotonSiguiente, CampoNumero, CampoTexto, Marco, Pregunta } from '../componentes.jsx'
import { plural } from './lobby.jsx'

const marco = (guardado, extra) => ({
  titulo: APARTADO.caja.nombre,
  emoji: APARTADO.caja.emoji,
  guardado,
  onAtras: () => volver('/'),
  ...extra,
})

export function Caja({ movimientos, borrarMovimiento, guardado, perfil, r, n }) {
  const [mes, setMes] = useState(() => mesDe(hoy()))
  const [abierto, setAbierto] = useState(null)
  const total = saldo(movimientos)
  const res = resumenMes(movimientos, mes)
  const dias = useMemo(() => porDia(movimientos.filter((m) => mesDe(m.fecha) === mes)), [movimientos, mes])
  const esMesActual = mes === mesDe(hoy())
  const tienePrecio = perfil.datos.hechos.precio && n.equilibrio != null

  return (
    <Marco {...marco(guardado)}>
      <div className={`saldo ${total < 0 ? 'saldo--neg' : ''}`}>
        <span>Dinero en caja</span>
        <strong>{soles(total)}</strong>
        {total < 0 && <small>Salió más de lo que entró. Revisa si falta anotar alguna venta.</small>}
      </div>

      <div className="caja__botones">
        <button className="btn btn--entrada" onClick={() => ir('/caja/entrada')}>
          <span>＋</span> Entró dinero
        </button>
        <button className="btn btn--salida" onClick={() => ir('/caja/salida')}>
          <span>−</span> Salió dinero
        </button>
      </div>

      {movimientos.length === 0 ? (
        <div className="explica">
          <p>
            Aquí anotas <strong>todo el dinero que entra y sale</strong> de tu negocio: cada venta, cada compra, cada pago.
            Así sabes cuánto tienes de verdad.
          </p>
          <button className="btn btn--suave caja__inicial" onClick={() => ir('/caja/inicial')}>
            Anotar con cuánto dinero empiezo
          </button>
        </div>
      ) : (
        <>
          <div className="mes-selector">
            <button onClick={() => setMes(moverMes(mes, -1))} aria-label="Mes anterior">‹</button>
            <strong>{nombreMes(mes)}</strong>
            <button onClick={() => setMes(moverMes(mes, 1))} disabled={esMesActual} aria-label="Mes siguiente">›</button>
          </div>

          <div className="caja__mes">
            <div>
              <span>Entró</span>
              <strong className="pos">{soles(res.entradas)}</strong>
            </div>
            <div>
              <span>Salió</span>
              <strong className="neg">{soles(res.salidas)}</strong>
            </div>
            <div>
              <span>{res.resultado >= 0 ? 'Quedó' : 'Faltó'}</span>
              <strong className={res.resultado >= 0 ? 'pos' : 'neg'}>{soles(Math.abs(res.resultado))}</strong>
            </div>
          </div>

          {tienePrecio && (
            <div className="avance-ventas">
              <p>
                {esMesActual ? 'Este mes vendiste' : 'Ese mes vendiste'} <strong>{plural(res.unidadesVendidas, r)}</strong>. Para no
                perder necesitas <strong>{plural(n.equilibrio, r)}</strong>.
              </p>
              <div className="mes__barra mes__barra--pos">
                <span style={{ width: `${Math.min(100, (res.unidadesVendidas / Math.max(1, n.equilibrio)) * 100)}%` }} />
              </div>
              <small>
                {res.unidadesVendidas >= n.equilibrio
                  ? '¡Ya pasaste tu punto de equilibrio! Lo que vendas ahora es ganancia.'
                  : `Te faltan ${plural(n.equilibrio - res.unidadesVendidas, r)}.`}
              </small>
            </div>
          )}

          {dias.length === 0 && <p className="nota-suave">No anotaste nada en {nombreMes(mes)}.</p>}
          {dias.map((d) => (
            <section key={d.fecha} className="dia">
              <header className="dia__cabeza">
                <strong>{nombreDia(d.fecha)}</strong>
                <span className={d.total >= 0 ? 'pos' : 'neg'}>
                  {d.total >= 0 ? '+ ' : ''}
                  {soles(d.total)}
                </span>
              </header>
              {d.movimientos.map((m) => (
                <div key={m.id} className="movimiento">
                  <button className="movimiento__fila" onClick={() => setAbierto(abierto === m.id ? null : m.id)}>
                    <span className={`movimiento__icono movimiento__icono--${m.tipo}`}>{m.tipo === 'entrada' ? '＋' : '−'}</span>
                    <span className="movimiento__concepto">
                      {m.concepto}
                      {m.unidades ? <small>{plural(m.unidades, r)}</small> : null}
                    </span>
                    <strong className={m.tipo === 'entrada' ? 'pos' : 'neg'}>
                      {m.tipo === 'entrada' ? '+' : '−'} {soles(Number(m.monto))}
                    </strong>
                  </button>
                  {abierto === m.id && (
                    <div className="movimiento__acciones">
                      <span>¿Te equivocaste?</span>
                      <button
                        className="btn btn--peligro btn--chico"
                        onClick={() => {
                          borrarMovimiento(m.id)
                          setAbierto(null)
                        }}
                      >
                        Borrar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </section>
          ))}
        </>
      )}

      <Aprende termino="control de caja">
        Es anotar cada día el dinero que entra y sale. Si al contar tu dinero no coincide con lo que dice aquí, falta anotar algo.
      </Aprende>
    </Marco>
  )
}

function conceptosSalida(datos, r) {
  const marcados = [...datos.variables, ...datos.fijos].filter((it) => it.marcado && limpiarTexto(it.nombre)).map((it) => limpiarTexto(it.nombre))
  const base = r.variables.slice(0, 2).map((v) => v.nombre)
  return [...new Set([...marcados, ...base, 'Pasajes'])].slice(0, 9)
}

export function NuevoMovimiento({ tipo, agregarMovimiento, perfil, r, n, guardado }) {
  const esInicial = tipo === 'inicial'
  const esEntrada = tipo !== 'salida'
  const venta = `Venta de ${r.unidades}`
  const tienePrecio = perfil.datos.hechos.precio && n.precio > 0
  const opciones = esEntrada ? [venta, 'Adelanto de un cliente', 'Préstamo', 'Otro'] : [...conceptosSalida(perfil.datos, r), 'Otro']

  const [concepto, setConcepto] = useState(esInicial ? CONCEPTO_INICIAL : null)
  const [otro, setOtro] = useState('')
  const [unidades, setUnidades] = useState('1')
  const [monto, setMonto] = useState('')
  const [montoTocado, setMontoTocado] = useState(false)
  const [fecha, setFecha] = useState(hoy())

  const esVenta = concepto === venta
  const u = Math.floor(num(unidades))
  const montoFinal = esVenta && !montoTocado && tienePrecio ? String(Math.round(u * n.precio * 100) / 100) : monto
  const textoConcepto = concepto === 'Otro' ? limpiarTexto(otro) : concepto
  const valido = textoConcepto && num(montoFinal) > 0 && (!esVenta || u > 0) && fecha <= hoy()

  const guardar = () => {
    if (!valido) return
    agregarMovimiento({
      fecha,
      tipo: esEntrada ? 'entrada' : 'salida',
      concepto: textoConcepto.slice(0, 80),
      unidades: esVenta ? u : null,
      monto: Math.round(num(montoFinal) * 100) / 100,
    })
    volver('/caja')
  }

  const ayer = hoy(new Date(Date.now() - 86400000))

  return (
    <Marco
      {...marco(guardado, { titulo: esInicial ? 'Dinero inicial' : esEntrada ? 'Entró dinero' : 'Salió dinero', onAtras: () => volver('/caja') })}
      pie={
        <BotonSiguiente onClick={guardar} disabled={!valido} aviso={!textoConcepto ? 'Elige qué fue.' : 'Escribe cuánto dinero fue.'}>
          Guardar
        </BotonSiguiente>
      }
    >
      {esInicial ? (
        <Pregunta sub="Cuenta el dinero que tienes para el negocio hoy, en efectivo y en Yape o Plin.">¿Con cuánto dinero empiezas?</Pregunta>
      ) : (
        <>
          <Pregunta>{esEntrada ? '¿Por qué entró dinero?' : '¿En qué se fue el dinero?'}</Pregunta>
          <div className="conceptos">
            {opciones.map((o) => (
              <button key={o} className={`chip chip--concepto${concepto === o ? ' chip--activo' : ''}`} onClick={() => setConcepto(o)}>
                {o}
              </button>
            ))}
          </div>
          {concepto === 'Otro' && (
            <CampoTexto autoFocus etiqueta="¿Qué fue?" valor={otro} maxLength={80} placeholder={esEntrada ? 'Ej. Arreglo de ropa' : 'Ej. Bolsas'} onCambio={setOtro} />
          )}
        </>
      )}

      {esVenta && (
        <div className="venta">
          <span className="campo__etiqueta">¿{r.cuantas} {r.unidades}?</span>
          <div className="stepper stepper--grande">
            <button onClick={() => setUnidades(String(Math.max(1, u - 1)))} aria-label="Menos">−</button>
            <input inputMode="numeric" value={unidades} onChange={(e) => setUnidades(e.target.value.replace(/\D/g, ''))} onFocus={(e) => e.target.select()} />
            <button onClick={() => setUnidades(String(u + 1))} aria-label="Más">+</button>
          </div>
          {tienePrecio && !montoTocado && (
            <small>
              {plural(u, r)} × {soles(n.precio)} (tu precio). Si cobraste otro monto, cámbialo abajo.
            </small>
          )}
        </div>
      )}

      {(concepto || esInicial) && (
        <CampoNumero
          grande
          etiqueta={esEntrada ? '¿Cuánto dinero entró?' : '¿Cuánto pagaste?'}
          valor={montoFinal}
          placeholder="0"
          onCambio={(v) => {
            setMontoTocado(true)
            setMonto(v)
          }}
        />
      )}

      {(concepto || esInicial) && (
        <div>
          <span className="campo__etiqueta">¿Cuándo?</span>
          <div className="chips chips--fecha">
            <button className={`chip${fecha === hoy() ? ' chip--activo' : ''}`} onClick={() => setFecha(hoy())}>Hoy</button>
            <button className={`chip${fecha === ayer ? ' chip--activo' : ''}`} onClick={() => setFecha(ayer)}>Ayer</button>
            <label className={`chip chip--fecha${fecha !== hoy() && fecha !== ayer ? ' chip--activo' : ''}`}>
              <input type="date" value={fecha} max={hoy()} onChange={(e) => e.target.value && setFecha(e.target.value)} aria-label="Otra fecha" />
            </label>
          </div>
        </div>
      )}

      {!esInicial && !esEntrada && (
        <Ayuda>
          Anota también los gastos pequeños: pasajes, bolsas, un almuerzo de trabajo. Si mezclas el dinero de tu casa con el
          del negocio, anota aquí solo lo del negocio.
        </Ayuda>
      )}
    </Marco>
  )
}
