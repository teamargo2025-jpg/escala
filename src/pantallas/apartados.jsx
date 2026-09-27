// Apartados del plan: presupuesto, costos (3 pantallas), precio, meta y flujo.
import { useEffect } from 'react'
import { GANANCIAS_RAPIDAS, METODO_PRECIO, MESES_FLUJO } from '../config.js'
import { APARTADO } from '../lib/apartados.js'
import { num, soles } from '../lib/calc.js'
import { elQueMasDeja, equilibrioMezcla, lineasDeProductos } from '../lib/equilibrio.js'
import { mixDelMes } from '../lib/ventas.js'
import { hoy, mesDe, nombreMes } from '../lib/caja.js'
import { inventarioDe, ir, volver } from '../negocio.js'
import { Aprende, Ayuda, BotonSiguiente, CampoNumero, Cifra, ListaItems, Marco, Pregunta } from '../componentes.jsx'
import { plural } from './lobby.jsx'

const marcoDe = (id, guardado, extra) => ({
  titulo: APARTADO[id].nombre,
  emoji: APARTADO[id].emoji,
  guardado,
  onAtras: () => volver('/'),
  ...extra,
})

export function Presupuesto({ datos, despachar, terminar, guardado }) {
  // Quien ya está vendiendo no está planeando una compra: está anotando lo que ya puso.
  const andando = datos.etapa === 'andando'
  return (
    <Marco {...marcoDe('presupuesto', guardado)} pie={<BotonSiguiente onClick={() => terminar('presupuesto')}>Listo</BotonSiguiente>}>
      <Pregunta sub={andando ? 'Marca lo que compraste y pon cuánto te costó.' : 'Marca lo que te falta comprar y pon cuánto cuesta.'}>
        {andando ? '¿Qué compraste para tu negocio?' : '¿Qué necesitas para empezar?'}
      </Pregunta>
      <Ayuda>
        {andando ? (
          <>
            Lo que <strong>compraste una sola vez</strong> para trabajar: máquinas, herramientas, muebles. <br />
            Pon lo que te costó, aunque haya sido hace tiempo. Sirve para saber cuánto de eso ya recuperaste.
          </>
        ) : (
          <>
            Piensa en lo que tienes que <strong>comprar una sola vez</strong> antes de tu primera venta: máquinas,
            herramientas, muebles y los primeros materiales. <br />
            Si ya tienes algo, <strong>no lo marques</strong>. Si ya tienes todo, toca "Listo" sin marcar nada.
          </>
        )}
      </Ayuda>
      <ListaItems
        items={datos.arranque}
        lista="arranque"
        despachar={despachar}
        textoTotal={andando ? 'Tienes invertido' : 'Necesitas para arrancar'}
      />
      <Aprende termino="inversión inicial">Es el dinero que pones al principio para que tu negocio funcione.</Aprende>
    </Marco>
  )
}

export function Costos({ paso, datos, despachar, terminar, guardado, r, n }) {
  const actual = Math.min(3, Math.max(1, Number(paso) || 1))
  const marco = marcoDe('costos', guardado, {
    pasos: { actual, total: 3 },
    onAtras: () => volver(actual > 1 ? `/costos/${actual - 1}` : '/'),
  })

  if (actual === 1) {
    return (
      <Marco {...marco} pie={<BotonSiguiente onClick={() => ir('/costos/2')} />}>
        <Pregunta sub="Aunque un mes no vendas nada, igual tienes que pagarlo.">¿Qué pagas cada mes, vendas o no vendas?</Pregunta>
        <Ayuda>
          Son pagos que llegan <strong>todos los meses</strong> y no cambian si haces más o menos {r.unidades}. <br />
          Ejemplo: el alquiler del local es igual si este mes hiciste 10 {r.unidades} o 100.
        </Ayuda>
        <ListaItems items={datos.fijos} lista="fijos" despachar={despachar} textoTotal="Pagas al mes" />
        <Aprende termino="costos fijos">Se llaman así porque no cambian aunque vendas más o menos.</Aprende>
      </Marco>
    )
  }

  if (actual === 2) {
    return (
      <Marco
        {...marco}
        pie={<BotonSiguiente onClick={() => ir('/costos/3')} disabled={n.variableUnidad <= 0} aviso="Marca al menos un gasto para seguir." />}
      >
        <Pregunta sub={`Piensa en ${r.ejemploUnidad}.`}>¿Qué gastas para hacer {r.un} {r.unidad}?</Pregunta>
        <Ayuda>
          Solo lo que se usa en <strong>{r.un}</strong> {r.unidad}. Si compras un paquete, divide su precio entre {r.las}{' '}
          {r.unidades} que te alcanzan. <br />
          Ejemplo: si un paquete de S/ 20 te alcanza para 40 {r.unidades}, pones S/ 0.50.
        </Ayuda>
        <ListaItems items={datos.variables} lista="variables" despachar={despachar} textoTotal={`Gastas por cada ${r.unidad}`} />
        <Aprende termino="costos variables">Cambian según cuánto trabajes: más {r.unidades}, más gasto.</Aprende>
      </Marco>
    )
  }

  return (
    <Marco
      {...marco}
      pie={
        <BotonSiguiente onClick={() => terminar('costos')} disabled={n.cantidad <= 0 || n.variableUnidad <= 0} aviso="Escribe un número para seguir.">
          Listo
        </BotonSiguiente>
      }
    >
      <Pregunta sub="Lo que puedes hacer tú, con tu tiempo y tus herramientas.">
        ¿{r.cuantas} {r.unidades} puedes hacer en un mes?
      </Pregunta>
      <CampoNumero
        grande
        entero
        prefijo={null}
        sufijo={r.unidades}
        valor={datos.cantidad}
        placeholder={String(r.ejemploCantidad)}
        onCambio={(v) => despachar({ tipo: 'campo', campo: 'cantidad', valor: v })}
      />
      <Ayuda>
        Cuenta {r.cuantas.toLowerCase()} {r.unidades} terminas en un día o una semana normal y multiplica. <br />
        Ejemplo: {r.ejemploCalculo} <br />
        Si no sabes, pon un número parecido a {r.ejemploCantidad}; después lo puedes cambiar.
      </Ayuda>
      {n.cantidad > 0 && n.fijos > 0 && (
        <div className="explica">
          Tus costos fijos ({soles(n.fijos)}) repartidos entre {plural(n.cantidad, r)} son{' '}
          <strong>{soles(n.fijoPorUnidad, { decimales: 2 })}</strong> por cada {r.unidad}.
        </div>
      )}
    </Marco>
  )
}

export function Precio({ datos, despachar, terminar, guardado, r, n }) {
  const g = datos.ganancia
  const setG = (v) => despachar({ tipo: 'campo', campo: 'ganancia', valor: Math.max(0, Math.min(200, v)) })
  return (
    <Marco {...marcoDe('precio', guardado)} pie={<BotonSiguiente onClick={() => terminar('precio')}>Listo</BotonSiguiente>}>
      <Pregunta sub="Primero, lo que te cuesta. Después, lo que quieres ganar encima.">¿A cuánto vender cada {r.unidad}?</Pregunta>

      <div className="suma">
        <div className="suma__fila">
          <span>Materiales y gastos de {r.un} {r.unidad}</span>
          <span>{soles(n.variableUnidad, { decimales: 2 })}</span>
        </div>
        <div className="suma__fila">
          <span>Parte de tus pagos del mes</span>
          <span>+ {soles(n.fijoPorUnidad, { decimales: 2 })}</span>
        </div>
        <div className="suma__fila suma__fila--total">
          <span>Te cuesta cada {r.unidad}</span>
          <span>{soles(n.costoUnidad, { decimales: 2 })}</span>
        </div>
      </div>

      <h2 className="subtitulo">¿Cuánto quieres ganar encima?</h2>
      <div className="chips">
        {GANANCIAS_RAPIDAS.map((v) => (
          <button key={v} className={`chip${g === v ? ' chip--activo' : ''}`} onClick={() => setG(v)}>
            {v}%
          </button>
        ))}
      </div>
      <div className="ajuste">
        <button className="ajuste__btn" onClick={() => setG(g - 5)} aria-label="Menos">−</button>
        <span className="ajuste__valor">{g}%</span>
        <button className="ajuste__btn" onClick={() => setG(g + 5)} aria-label="Más">+</button>
      </div>
      <Ayuda etiqueta="¿Cuánto porcentaje pongo?">
        {METODO_PRECIO === 'sobre_costo'
          ? `Un ${g}% quiere decir que por cada S/ 10 que te cuesta, ganas S/ ${(g / 10).toLocaleString('es-PE')} más.`
          : `Un ${g}% quiere decir que de cada S/ 10 que te pagan, S/ ${(g / 10).toLocaleString('es-PE')} son tu ganancia.`}{' '}
        Mira también cuánto cobran otros por {r.ejemploUnidad}: si tu precio sale muy alto, baja el porcentaje o revisa tus gastos.
      </Ayuda>

      <div className="resultado">
        <span>Tu precio de venta</span>
        <strong>{soles(n.precio)}</strong>
        <span className="resultado__nota">
          Ganas {soles(n.gananciaUnidad, { decimales: 2 })} por cada {r.unidad}
        </span>
      </div>
      <Aprende termino="margen de ganancia">Es el porcentaje que le sumas a tu costo para ganar.</Aprende>
    </Marco>
  )
}


// Punto de equilibrio cuando hay más de un producto: se cuenta en soles de venta,
// no en unidades, porque una torta y un alfajor no se pueden sumar como "dos".
function EquilibrioVarios({ datos, despachar, n, r, movimientos = [] }) {
  const inv = inventarioDe(datos)
  const lineas = lineasDeProductos(datos.productos ?? [], inv.materiales, { valorHora: num(datos.valorHora) })
  if (lineas.length < 2) return null

  const eq = equilibrioMezcla(lineas, n.fijos, n.metaGanancia)
  const estrella = eq && elQueMasDeja(lineas)

  // Si ya anotó ventas en la caja, no tiene por qué adivinar cuánto vende de cada uno.
  const mes = mesDe(hoy())
  const real = mixDelMes(movimientos, datos.productos ?? [], mes)
  const hayReal = Object.keys(real).length > 0
  const igualALoReal = hayReal && lineas.every((l) => (real[l.id] ?? 0) === l.ventasMes)

  return (
    <section className="varios">
      <h2 className="subtitulo">Tienes {lineas.length} productos</h2>
      <p className="nota-suave nota-suave--izq">
        Con varios productos el equilibrio no se cuenta en {r.unidades}: se cuenta en <strong>soles vendidos</strong>. Dinos cuánto vendes de
        cada uno en un mes normal.
      </p>

      {hayReal && !igualALoReal && (
        <button
          className="btn btn--suave"
          onClick={() => {
            for (const l of lineas) despachar({ tipo: 'producto:campo', id: l.id, cambio: { ventasMes: String(real[l.id] ?? 0) } })
          }}
        >
          Usar lo que vendí en {nombreMes(mes).toLowerCase()}
        </button>
      )}

      <div className="mezcla">
        {lineas.map((l) => (
          <div key={l.id} className="mezcla__item">
            <div className="mezcla__texto">
              <strong>{l.nombre || 'Sin nombre'}</strong>
              {l.precio > 0 ? (
                <small>
                  A {soles(l.precio)} · te deja {soles(l.aporta, { decimales: 2 })} cada uno
                </small>
              ) : (
                <small className="neg">Le falta precio de venta</small>
              )}
            </div>
            {l.precio > 0 ? (
              <span className="mezcla__campo">
                <CampoNumero
                  entero
                  prefijo={null}
                  valor={l.ventasMes ? String(l.ventasMes) : ''}
                  placeholder="0"
                  onCambio={(v) => despachar({ tipo: 'producto:campo', id: l.id, cambio: { ventasMes: v } })}
                />
              </span>
            ) : (
              <button className="btn btn--chico btn--suave" onClick={() => ir(`/costeo/${l.id}`)}>
                Completar
              </button>
            )}
          </div>
        ))}
      </div>

      {eq ? (
        <>
          <Cifra
            tono="alerta"
            etiqueta="Para no perder, vendiendo de todo"
            valor={soles(Math.ceil(eq.soles))}
            nota={`Al mes, sumando todos tus productos. De cada ${soles(1)} que vendes, ${soles(eq.razon, { decimales: 2 })} queda para tus pagos del mes.`}
          />
          <div className="mezcla__desglose">
            <p>Con la mezcla que pusiste, eso es más o menos:</p>
            <ul>
              {eq.detalle.map((l) => (
                <li key={l.id}>
                  <strong>{l.unidades}</strong> {l.nombre} <span>({soles(Math.round(l.soles))})</span>
                </li>
              ))}
            </ul>
          </div>
          <Cifra
            tono={eq.resultadoPlan >= 0 ? 'bien' : 'mal'}
            etiqueta="Si vendes lo que pusiste arriba"
            valor={`${eq.resultadoPlan >= 0 ? 'Ganas' : 'Pierdes'} ${soles(Math.abs(Math.round(eq.resultadoPlan)))}`}
            nota={
              eq.resultadoPlan >= 0
                ? `Ya cubres tus ${soles(n.fijos)} de pagos del mes.`
                : `Te faltan ${soles(Math.ceil(eq.soles - eq.ventasPlan))} de venta para no perder.`
            }
          />
          {eq.solesMeta != null && (
            <Cifra
              etiqueta={`Para ganar ${soles(n.metaGanancia)}`}
              valor={soles(Math.ceil(eq.solesMeta))}
              nota={
                eq.solesMeta > eq.ventasPlan
                  ? `Son ${soles(Math.ceil(eq.solesMeta - eq.ventasPlan))} más de lo que vendes hoy al mes.`
                  : `Con lo que ya vendes al mes (${soles(Math.round(eq.ventasPlan))}) te alcanza.`
              }
            />
          )}
          {estrella && (
            <p className="nota-suave nota-suave--izq">
              💡 De cada sol que vendes, el que más te deja es <strong>{estrella.nombre}</strong> (
              {Math.round(estrella.margen * 100)} de cada 100 soles). Empujar ese producto te acerca más rápido.
            </p>
          )}
          {eq.sinDatos > 0 && (
            <p className="nota-suave nota-suave--izq">
              {eq.sinDatos === 1
                ? 'Hay 1 producto que no entró al cálculo: le falta el precio o cuántos vendes al mes.'
                : `Hay ${eq.sinDatos} productos que no entraron al cálculo: les falta el precio o cuántos vendes al mes.`}
            </p>
          )}
        </>
      ) : (
        <p className="nota-suave nota-suave--izq">
          Pon cuántos vendes al mes de por lo menos un producto con precio y aquí sale cuánto tienes que vender para no perder.
        </p>
      )}
      <Aprende termino="mezcla de ventas">
        Es qué parte de tus ventas es cada producto. Si vendes más del que más te deja, cubres tus pagos vendiendo menos.
      </Aprende>
    </section>
  )
}

export function Meta({ datos, despachar, terminar, guardado, r, n, movimientos }) {
  const alcanzable = n.unidadesMeta == null || n.unidadesMeta <= n.cantidad
  return (
    <Marco {...marcoDe('meta', guardado)} pie={<BotonSiguiente onClick={() => terminar('meta')}>Listo</BotonSiguiente>}>
      <Pregunta sub={`Vendiendo a ${soles(n.precio)} cada ${r.unidad}.`}>¿Cuánto tienes que vender al mes?</Pregunta>

      <Cifra
        tono="alerta"
        etiqueta="Para no perder dinero"
        valor={n.equilibrio == null ? '—' : plural(n.equilibrio, r)}
        nota={`Con eso cubres tus ${soles(n.fijos)} de pagos del mes. Menos que eso, pierdes.`}
      />
      <Aprende termino="punto de equilibrio">
        Es donde no ganas ni pierdes. Cada {r.unidad} que vendas después de ahí ya es ganancia.
      </Aprende>

      <h2 className="subtitulo">¿Cuánto quieres ganar tú al mes?</h2>
      <CampoNumero
        grande
        valor={datos.metaGanancia}
        placeholder={String(r.ejemploGananciaMes)}
        onCambio={(v) => despachar({ tipo: 'campo', campo: 'metaGanancia', valor: v })}
      />
      <Ayuda>
        Lo que te quieres llevar a tu casa, <strong>después de pagar todo</strong>. <br />
        Ejemplo: {soles(r.ejemploGananciaMes)} al mes.
      </Ayuda>

      {n.unidadesMeta != null && (
        <>
          <Cifra
            tono={alcanzable ? 'bien' : 'mal'}
            etiqueta={`Para ganar ${soles(n.metaGanancia)}`}
            valor={plural(n.unidadesMeta, r)}
            nota={
              alcanzable
                ? `Puedes hacer ${plural(n.cantidad, r)} al mes, así que sí te alcanza.`
                : `Pero dijiste que puedes hacer ${plural(n.cantidad, r)} al mes. Prueba ganar menos, subir tu precio o hacer más ${r.unidades}.`
            }
          />
          {!alcanzable && (
            <button className="btn btn--suave" onClick={() => ir('/precio')}>
              Revisar mi precio →
            </button>
          )}
        </>
      )}

      <EquilibrioVarios datos={datos} despachar={despachar} n={n} r={r} movimientos={movimientos} />
    </Marco>
  )
}

export function Flujo({ datos, despachar, terminar, guardado, r, n }) {
  useEffect(() => {
    despachar({ tipo: 'prepararFlujo' })
  }, [despachar])
  if (!datos.flujo) return null
  const maximo = Math.max(1, ...n.meses.map((m) => Math.abs(m.resultado)))
  return (
    <Marco {...marcoDe('flujo', guardado)} pie={<BotonSiguiente onClick={() => terminar('flujo')}>Listo</BotonSiguiente>}>
      <Pregunta sub="Es un plan: lo que crees que va a pasar. Al principio casi siempre se vende poco.">
        ¿{r.cuantas} {r.unidades} crees que venderás cada mes?
      </Pregunta>

      <div className="meses">
        {n.meses.map((m, i) => (
          <div key={i} className="mes">
            <div className="mes__cabeza">
              <strong>Mes {i + 1}</strong>
              <div className="stepper">
                <button
                  aria-label={`Menos ${r.unidades} en el mes ${i + 1}`}
                  onClick={() => despachar({ tipo: 'flujoMes', mes: i, valor: String(Math.max(0, m.unidades - 1)) })}
                >
                  −
                </button>
                <input
                  inputMode="numeric"
                  aria-label={`${r.unidades} en el mes ${i + 1}`}
                  value={datos.flujo[i]}
                  onChange={(e) => despachar({ tipo: 'flujoMes', mes: i, valor: e.target.value.replace(/\D/g, '') })}
                  onFocus={(e) => e.target.select()}
                />
                <button
                  aria-label={`Más ${r.unidades} en el mes ${i + 1}`}
                  onClick={() => despachar({ tipo: 'flujoMes', mes: i, valor: String(m.unidades + 1) })}
                >
                  +
                </button>
              </div>
            </div>
            <div className="mes__cuentas">
              <span>Entra</span>
              <span className="pos">{soles(m.ingresos)}</span>
              <span>Sale (materiales + pagos del mes)</span>
              <span className="neg">{soles(-m.egresos)}</span>
            </div>
            <div className={`mes__barra ${m.resultado >= 0 ? 'mes__barra--pos' : 'mes__barra--neg'}`}>
              <span style={{ width: `${Math.max(4, (Math.abs(m.resultado) / maximo) * 100)}%` }} />
            </div>
            <div className={`mes__resultado ${m.resultado >= 0 ? 'pos' : 'neg'}`}>
              {m.resultado >= 0 ? 'Te queda' : 'Te falta'} <strong>{soles(Math.abs(m.resultado))}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="explica">
        En {MESES_FLUJO} meses {n.totalFlujo >= 0 ? 'te quedan' : 'te faltan'} <strong>{soles(Math.abs(n.totalFlujo))}</strong>.
        {n.inversion > 0 && (
          <>
            {' '}Pusiste {soles(n.inversion)} para arrancar:{' '}
            {n.saldoFinal >= 0 ? <strong>ya lo recuperaste.</strong> : <strong>te falta recuperar {soles(-n.saldoFinal)}.</strong>}
          </>
        )}
      </div>
      <Aprende termino="flujo de caja">
        Es el dinero que entra y sale de tu negocio cada mes. Cuando empieces a vender, anota lo que pasa de verdad en el
        control de caja.
      </Aprende>
    </Marco>
  )
}
