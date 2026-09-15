// Apartados del plan: presupuesto, costos (3 pantallas), precio, meta y flujo.
import { useEffect } from 'react'
import { GANANCIAS_RAPIDAS, METODO_PRECIO, MESES_FLUJO } from '../config.js'
import { APARTADO } from '../lib/apartados.js'
import { soles } from '../lib/calc.js'
import { ir, volver } from '../negocio.js'
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
  return (
    <Marco {...marcoDe('presupuesto', guardado)} pie={<BotonSiguiente onClick={() => terminar('presupuesto')}>Listo</BotonSiguiente>}>
      <Pregunta sub="Marca lo que te falta comprar y pon cuánto cuesta.">¿Qué necesitas para empezar?</Pregunta>
      <Ayuda>
        Piensa en lo que tienes que <strong>comprar una sola vez</strong> antes de tu primera venta: máquinas,
        herramientas, muebles y los primeros materiales. <br />
        Si ya tienes algo, <strong>no lo marques</strong>. Si ya tienes todo, toca "Listo" sin marcar nada.
      </Ayuda>
      <ListaItems items={datos.arranque} lista="arranque" despachar={despachar} textoTotal="Necesitas para arrancar" />
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

export function Meta({ datos, despachar, terminar, guardado, r, n }) {
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
