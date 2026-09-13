import { useEffect, useState } from 'react'
import { LISTA_RUBROS } from './data/rubros.js'
import { GANANCIAS_RAPIDAS, METODO_PRECIO, MESES_FLUJO } from './config.js'
import { soles } from './lib/calc.js'
import {
  Aprende, Ayuda, BotonSiguiente, CampoNumero, Cifra, ListaItems, Logo, Marco, Pregunta,
} from './componentes.jsx'

const plural = (n, r) => `${n.toLocaleString('es-PE')} ${n === 1 ? r.unidad : r.unidades}`

export function Inicio({ ir }) {
  return (
    <div className="inicio">
      <Logo grande />
      <h1>Saca las cuentas de tu negocio</h1>
      <p>Paso a paso, con ejemplos de tu oficio. Al final vas a saber:</p>
      <ul className="inicio__lista">
        <li><span>💰</span> cuánto dinero necesitas para empezar</li>
        <li><span>🏷️</span> a qué precio vender</li>
        <li><span>🎯</span> cuánto tienes que vender al mes</li>
        <li><span>📅</span> cómo te irá los primeros meses</li>
      </ul>
      <p className="inicio__nota">No necesitas cuenta. Lo que escribas se queda guardado en tu celular.</p>
      <button className="btn btn--principal" onClick={() => ir('rubro')}>
        Empezar
      </button>
    </div>
  )
}

export function Rubro({ estado, despachar, marco }) {
  return (
    <Marco {...marco}>
      <Pregunta sub="Así te mostramos ejemplos que conoces.">¿A qué te dedicas?</Pregunta>
      <div className="rubros">
        {LISTA_RUBROS.map((r) => (
          <button
            key={r.id}
            className={`rubro${estado.rubro === r.id ? ' rubro--elegido' : ''}`}
            onClick={() => despachar({ tipo: 'elegirRubro', rubro: r.id })}
          >
            <span className="rubro__emoji">{r.emoji}</span>
            <span className="rubro__nombre">{r.nombre}</span>
            <span className="rubro__flecha">→</span>
          </button>
        ))}
      </div>
      {estado.rubro && (
        <p className="nota-suave">Si eliges otro oficio, empiezas de nuevo con sus ejemplos.</p>
      )}
    </Marco>
  )
}

export function Arranque({ estado, despachar, marco, siguiente }) {
  return (
    <Marco {...marco} pie={<BotonSiguiente onClick={siguiente} />}>
      <Pregunta sub="Marca lo que te falta comprar y pon cuánto cuesta.">
        ¿Qué necesitas para empezar?
      </Pregunta>
      <Ayuda>
        Piensa en lo que tienes que <strong>comprar una sola vez</strong> antes de tu primera venta: máquinas,
        herramientas, muebles y los primeros materiales. <br />
        Si ya tienes algo, <strong>no lo marques</strong>. Si ya tienes todo, sigue sin marcar nada.
      </Ayuda>
      <ListaItems
        items={estado.arranque}
        lista="arranque"
        despachar={despachar}
        textoTotal="Necesitas para arrancar"
      />
      <Aprende termino="inversión inicial">
        Es el dinero que pones al principio para que tu negocio funcione.
      </Aprende>
    </Marco>
  )
}

export function Fijos({ estado, despachar, marco, siguiente, r }) {
  return (
    <Marco {...marco} pie={<BotonSiguiente onClick={siguiente} />}>
      <Pregunta sub="Aunque un mes no vendas nada, igual tienes que pagarlo.">
        ¿Qué pagas cada mes, vendas o no vendas?
      </Pregunta>
      <Ayuda>
        Son pagos que llegan <strong>todos los meses</strong> y no cambian si haces más o menos {r.unidades}. <br />
        Ejemplo: el alquiler del local es igual si este mes hiciste 10 {r.unidades} o 100.
      </Ayuda>
      <ListaItems items={estado.fijos} lista="fijos" despachar={despachar} textoTotal="Pagas al mes" />
      <Aprende termino="costos fijos">Se llaman así porque no cambian aunque vendas más o menos.</Aprende>
    </Marco>
  )
}

export function Variables({ estado, despachar, marco, siguiente, r, n }) {
  return (
    <Marco
      {...marco}
      pie={<BotonSiguiente onClick={siguiente} disabled={n.variableUnidad <= 0} aviso="Marca al menos un gasto para seguir." />}
    >
      <Pregunta sub={`Piensa en ${r.ejemploUnidad}.`}>¿Qué gastas para hacer {r.un} {r.unidad}?</Pregunta>
      <Ayuda>
        Solo lo que se usa en <strong>{r.un}</strong> {r.unidad}. Si compras un paquete, divide su precio entre {r.las}{' '}
        {r.unidades} que te alcanzan. <br />
        Ejemplo: si un paquete de S/ 20 te alcanza para 40 {r.unidades}, pones S/ 0.50.
      </Ayuda>
      <ListaItems
        items={estado.variables}
        lista="variables"
        despachar={despachar}
        textoTotal={`Gastas por cada ${r.unidad}`}
      />
      <Aprende termino="costos variables">
        Cambian según cuánto trabajes: más {r.unidades}, más gasto.
      </Aprende>
    </Marco>
  )
}

export function Cantidad({ estado, despachar, marco, siguiente, r, n }) {
  return (
    <Marco
      {...marco}
      pie={<BotonSiguiente onClick={siguiente} disabled={n.cantidad <= 0} aviso="Escribe un número para seguir." />}
    >
      <Pregunta sub="Lo que puedes hacer tú, con tu tiempo y tus herramientas.">
        ¿{r.cuantas} {r.unidades} puedes hacer en un mes?
      </Pregunta>
      <CampoNumero
        grande
        entero
        prefijo={null}
        sufijo={r.unidades}
        valor={estado.cantidad}
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

export function Precio({ estado, despachar, marco, siguiente, r, n }) {
  const g = estado.ganancia
  const setG = (v) => despachar({ tipo: 'campo', campo: 'ganancia', valor: Math.max(0, Math.min(200, v)) })
  return (
    <Marco {...marco} pie={<BotonSiguiente onClick={siguiente} />}>
      <Pregunta sub="Primero, lo que te cuesta. Después, lo que quieres ganar encima.">
        ¿A cuánto vender cada {r.unidad}?
      </Pregunta>

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
        {METODO_PRECIO === 'sobre_costo' ? (
          <>
            Un {g}% quiere decir que por cada S/ 10 que te cuesta, ganas S/ {(g / 10).toLocaleString('es-PE')} más.
          </>
        ) : (
          <>Un {g}% quiere decir que de cada S/ 10 que te pagan, S/ {(g / 10).toLocaleString('es-PE')} son tu ganancia.</>
        )}{' '}
        Mira también cuánto cobran otros por {r.ejemploUnidad}: si tu precio sale muy alto, baja el porcentaje o
        revisa tus gastos.
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

export function Meta({ estado, despachar, marco, siguiente, r, n }) {
  const alcanzable = n.unidadesMeta == null || n.unidadesMeta <= n.cantidad
  return (
    <Marco {...marco} pie={<BotonSiguiente onClick={siguiente} />}>
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
        valor={estado.metaGanancia}
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
            <button className="btn btn--suave" onClick={() => despachar({ tipo: 'ir', pantalla: 'precio' })}>
              ← Revisar mi precio
            </button>
          )}
        </>
      )}
    </Marco>
  )
}

export function Flujo({ estado, despachar, marco, siguiente, r, n }) {
  useEffect(() => {
    despachar({ tipo: 'prepararFlujo' })
  }, [despachar])
  if (!estado.flujo) return null
  const maximo = Math.max(1, ...n.meses.map((m) => Math.abs(m.resultado)))
  return (
    <Marco {...marco} pie={<BotonSiguiente onClick={siguiente}>Ver mi resumen</BotonSiguiente>}>
      <Pregunta sub="Al principio casi siempre se vende poco. Cambia los números si crees otra cosa.">
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
                  value={estado.flujo[i]}
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
        {n.inversion > 0 ? (
          <>
            En {MESES_FLUJO} meses te quedan {soles(n.totalFlujo)}. Pusiste {soles(n.inversion)} para arrancar:{' '}
            {n.saldoFinal >= 0 ? (
              <strong>ya lo recuperaste</strong>
            ) : (
              <>
                <strong>te falta recuperar {soles(-n.saldoFinal)}</strong>.
              </>
            )}
          </>
        ) : (
          <>
            En {MESES_FLUJO} meses {n.totalFlujo >= 0 ? 'te quedan' : 'te faltan'}{' '}
            <strong>{soles(Math.abs(n.totalFlujo))}</strong>.
          </>
        )}
      </div>
      <Aprende termino="flujo de caja">Es el dinero que entra y sale de tu negocio cada mes.</Aprende>
    </Marco>
  )
}

function textoResumen(r, n) {
  const lineas = [
    `*Mi negocio: ${r.nombre}* (ESCALA)`,
    ``,
    `💰 Para arrancar: ${soles(n.inversion)}`,
    `📌 Pagos fijos al mes: ${soles(n.fijos)}`,
    `🧾 Me cuesta cada ${r.unidad}: ${soles(n.costoUnidad, { decimales: 2 })}`,
    `🏷️ Mi precio de venta: ${soles(n.precio)}`,
    `⚖️ Para no perder: ${n.equilibrio == null ? '—' : plural(n.equilibrio, r)} al mes`,
  ]
  if (n.unidadesMeta != null) lineas.push(`🎯 Para ganar ${soles(n.metaGanancia)}: ${plural(n.unidadesMeta, r)} al mes`)
  lineas.push(``, `📅 Mis primeros ${MESES_FLUJO} meses:`)
  n.meses.forEach((m, i) => lineas.push(`   Mes ${i + 1}: ${plural(m.unidades, r)} → ${soles(m.resultado)}`))
  return lineas.join('\n')
}

export function Resumen({ despachar, marco, r, n }) {
  const [copiado, setCopiado] = useState(false)
  const texto = textoResumen(r, n)

  const compartir = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: texto })
        return
      } catch (e) {
        if (e?.name === 'AbortError') return
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank', 'noopener')
  }
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Sin permiso de portapapeles: queda la captura de pantalla.
    }
  }
  const reiniciar = () => {
    if (window.confirm('¿Borrar todo y empezar de nuevo?')) despachar({ tipo: 'reiniciar' })
  }

  return (
    <Marco {...marco}>
      <div className="resumen">
        <div className="resumen__cabeza">
          <span className="resumen__emoji">{r.emoji}</span>
          <div>
            <span className="resumen__sobre">Las cuentas de mi negocio</span>
            <h1>{r.nombre}</h1>
          </div>
        </div>
        <div className="resumen__destacado">
          <span>Mi precio de venta</span>
          <strong>{soles(n.precio)}</strong>
          <span>por {r.unidad} · me cuesta {soles(n.costoUnidad, { decimales: 2 })}</span>
        </div>
        <div className="resumen__grilla">
          <Cifra etiqueta="Para arrancar" valor={soles(n.inversion)} />
          <Cifra etiqueta="Pagos fijos al mes" valor={soles(n.fijos)} />
          <Cifra etiqueta="Para no perder" valor={n.equilibrio == null ? '—' : plural(n.equilibrio, r)} nota="al mes" />
          {n.unidadesMeta != null ? (
            <Cifra
              etiqueta={`Para ganar ${soles(n.metaGanancia)}`}
              valor={plural(n.unidadesMeta, r)}
              nota={n.unidadesMeta <= n.cantidad ? 'al mes' : `al mes · hoy puedo hacer ${n.cantidad}`}
              tono={n.unidadesMeta <= n.cantidad ? undefined : 'mal'}
            />
          ) : (
            <Cifra etiqueta="Puedo hacer" valor={plural(n.cantidad, r)} nota="al mes" />
          )}
        </div>
        <div className="resumen__meses">
          <span className="cifra__etiqueta">Mis primeros {MESES_FLUJO} meses</span>
          {n.meses.map((m, i) => (
            <div key={i} className="resumen__mes">
              <span>Mes {i + 1}</span>
              <span className="resumen__mes-u">{plural(m.unidades, r)}</span>
              <strong className={m.resultado >= 0 ? 'pos' : 'neg'}>{soles(m.resultado)}</strong>
            </div>
          ))}
        </div>
      </div>

      <p className="nota-suave">Puedes tomarle captura a esta pantalla o enviarla.</p>
      <div className="acciones">
        <button className="btn btn--whatsapp" onClick={compartir}>
          Enviar por WhatsApp
        </button>
        <button className="btn btn--suave" onClick={copiar}>
          {copiado ? '¡Copiado!' : 'Copiar texto'}
        </button>
        <button className="btn btn--suave" onClick={() => despachar({ tipo: 'ir', pantalla: 'arranque' })}>
          Cambiar mis números
        </button>
        <button className="btn btn--texto" onClick={reiniciar}>
          Empezar de nuevo
        </button>
      </div>
    </Marco>
  )
}
