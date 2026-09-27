// Simulador y comparador de créditos: qué cuota sale, cuánto se devuelve de verdad
// y —lo que ningún simulador de banco te dice— cuánto más tienes que vender para pagarla.
import { useState } from 'react'
import { EJEMPLO_INFORMAL, OFERTAS, PLAZOS } from '../data/creditos.js'
import { APARTADO } from '../lib/apartados.js'
import { num, soles } from '../lib/calc.js'
import { comparar, esfuerzoDePago, tceaDesdeMensual } from '../lib/credito.js'
import { equilibrioMezcla, lineasDeProductos } from '../lib/equilibrio.js'
import { inventarioDe, volver } from '../negocio.js'
import { Aprende, Ayuda, CampoNumero, CampoTexto, Casilla, Cifra, Marco, Pregunta } from '../componentes.jsx'

const MONTO_POR_DEFECTO = '1000'

const pct = (n) => `${Number(n).toLocaleString('es-PE', { maximumFractionDigits: 2 })}%`

// Lo que deja cada venta: del punto de equilibrio con varios productos si lo hay,
// y si no, del precio del plan. Sirve para traducir la cuota a ventas.
function loQueDejaCadaVenta(datos, n) {
  const productos = datos.productos ?? []
  const lineas = lineasDeProductos(productos, inventarioDe(datos).materiales, { valorHora: num(datos.valorHora) })
  const eq = equilibrioMezcla(lineas, n.fijos, 0)
  if (eq) {
    // Promedio de lo que deja cada venta según la mezcla que la persona vende.
    const unidades = eq.detalle.reduce((s, l) => s + l.ventasMes, 0)
    if (unidades > 0) return eq.aportePlan / unidades
  }
  return n.aportaUnidad > 0 ? n.aportaUnidad : 0
}

export function Creditos({ datos, despachar, guardado, r, n }) {
  const guardadoPrevio = datos.credito ?? {}
  const [monto, setMonto] = useState(guardadoPrevio.monto || MONTO_POR_DEFECTO)
  const [propias, setPropias] = useState(guardadoPrevio.opciones ?? [])
  const [nueva, setNueva] = useState(null)
  const [verInformal, setVerInformal] = useState(false)

  const p = num(monto)
  const aportaUnidad = loQueDejaCadaVenta(datos, n)
  const gananciaMes = Math.max(0, n.aportaUnidad * n.cantidad - n.fijos)

  const guardar = (cambio) => despachar({ tipo: 'campo', campo: 'credito', valor: { monto, opciones: propias, ...cambio } })

  const candidatas = [
    ...OFERTAS.map((o) => ({ ...o, monto: p })),
    ...propias.map((o) => ({ ...o, monto: p })),
    ...(verInformal ? [{ ...EJEMPLO_INFORMAL, meses: 4, monto: p }] : []),
  ]
  const resultados = p > 0 ? comparar(candidatas) : []

  const agregar = () => {
    if (!nueva) return
    const meses = Math.floor(num(nueva.meses))
    const tcea = num(nueva.tcea)
    if (!nueva.entidad.trim() || meses <= 0 || tcea <= 0) return
    const lista = [...propias, { id: `propia-${Date.now()}`, entidad: nueva.entidad.trim().slice(0, 40), nombre: `${meses} meses`, meses, tcea }]
    setPropias(lista)
    setNueva(null)
    guardar({ opciones: lista })
  }

  const quitar = (id) => {
    const lista = propias.filter((o) => o.id !== id)
    setPropias(lista)
    guardar({ opciones: lista })
  }

  return (
    <Marco
      titulo={APARTADO.creditos.nombre}
      emoji={APARTADO.creditos.emoji}
      guardado={guardado}
      onAtras={() => volver('/negocio')}
    >
      <Pregunta sub="Mira cuánto te costaría de verdad, y si tu negocio aguanta la cuota. No pides nada acá: es para decidir con el número delante.">
        ¿Estás pensando en pedir un préstamo?
      </Pregunta>

      <CampoNumero
        grande
        etiqueta="¿Cuánto necesitas?"
        valor={monto}
        placeholder={MONTO_POR_DEFECTO}
        onCambio={(v) => {
          setMonto(v)
          despachar({ tipo: 'campo', campo: 'credito', valor: { monto: v, opciones: propias } })
        }}
      />
      <Ayuda>
        Pide <strong>solo lo que vas a usar</strong> y para algo que te haga vender más: material para un pedido
        grande, una máquina, arreglar tu puesto. Pedir para tapar un hueco es la forma más rápida de meterse en otro.
      </Ayuda>

      {resultados.length > 0 && (
        <>
          <h2 className="subtitulo">De la más barata a la más cara</h2>
          <div className="creditos">
            {resultados.map((o) => (
              <Opcion key={o.id} o={o} aportaUnidad={aportaUnidad} gananciaMes={gananciaMes} r={r} onQuitar={quitar} />
            ))}
          </div>
          <p className="nota-suave nota-suave--izq">
            Se ordenan por <strong>lo que devuelves en total</strong>, no por la cuota. Una cuota chica con muchos
            meses casi siempre termina costando más.
          </p>
        </>
      )}

      <h2 className="subtitulo">¿Te ofrecieron otra?</h2>
      {nueva ? (
        <div className="credito-nuevo">
          <CampoTexto autoFocus etiqueta="¿Quién te lo ofrece?" valor={nueva.entidad} maxLength={40} placeholder="Ej. Caja del barrio" onCambio={(v) => setNueva({ ...nueva, entidad: v })} />
          <div className="chips">
            {PLAZOS.map((m) => (
              <button key={m} className={`chip${Number(nueva.meses) === m ? ' chip--activo' : ''}`} onClick={() => setNueva({ ...nueva, meses: String(m) })}>
                {m} meses
              </button>
            ))}
          </div>
          <CampoNumero etiqueta="TCEA que te dijeron" prefijo={null} sufijo="%" valor={nueva.tcea} placeholder="50" onCambio={(v) => setNueva({ ...nueva, tcea: v })} />
          <Ayuda etiqueta="¿Y si no me dicen la TCEA?">
            Pídesela: <strong>están obligados a dártela</strong>. Es el único número que sirve para comparar, porque
            incluye el seguro, los portes y las comisiones. Si solo te dan la TEA, te están escondiendo cobros. <br />
            Si te cobran por mes (por ejemplo "10% mensual"), eso es <strong>{pct(tceaDesdeMensual(10))}</strong> al año.
          </Ayuda>
          <div className="credito-nuevo__botones">
            <button className="btn btn--suave" onClick={() => setNueva(null)}>Cancelar</button>
            <button className="btn btn--principal" onClick={agregar}>Comparar</button>
          </div>
        </div>
      ) : (
        <button className="btn btn--suave" onClick={() => setNueva({ entidad: '', meses: '6', tcea: '' })}>
          + Agregar otra opción
        </button>
      )}

      <Casilla marcada={verInformal} onCambio={setVerInformal}>
        Comparar también con un prestamista del mercado (ejemplo: 10% al mes)
      </Casilla>

      <Aprende termino="TCEA">
        Es lo que <strong>de verdad</strong> te cuesta el préstamo al año: los intereses más el seguro, los portes y
        las comisiones. La TEA no incluye esos cobros. Cuando compares, compara TCEA con TCEA.
      </Aprende>
    </Marco>
  )
}

function Opcion({ o, aportaUnidad, gananciaMes, r, onQuitar }) {
  const esfuerzo = esfuerzoDePago({ cuota: o.cuota, aportaUnidad, gananciaMes })
  const fueraDeRango = o.minimo && o.monto < o.minimo ? `Desde ${soles(o.minimo)}` : o.maximo && o.monto > o.maximo ? `Hasta ${soles(o.maximo)}` : null

  return (
    <article className={`credito${o.mejor ? ' credito--mejor' : ''}${o.ejemplo ? ' credito--ejemplo' : ''}`}>
      <div className="credito__cabeza">
        <div>
          <strong>{o.entidad}</strong>
          <small>
            {o.nombre} · TCEA {pct(o.tcea)}
            {o.aliado ? ' · aliado de ESCALA' : ''}
          </small>
        </div>
        {o.mejor && <span className="credito__sello">La más barata</span>}
      </div>

      <div className="credito__numeros">
        <span>Cuota al mes</span>
        <strong>{soles(o.cuota)}</strong>
        <span>Devuelves en total</span>
        <strong>{soles(o.total)}</strong>
        <span>De eso, interés</span>
        <strong className="neg">{soles(o.interes)}</strong>
      </div>

      <p className="credito__frase">
        Por cada {soles(100)} que te prestan, devuelves <strong>{soles(o.porCada100)}</strong>.
      </p>

      {o.masCaro > 0 && <p className="credito__caro">Te cuesta {soles(o.masCaro)} más que la opción más barata.</p>}
      {fueraDeRango && <p className="credito__nota">Este crédito es de {fueraDeRango}. Ajusta el monto para pedirlo.</p>}
      {o.ejemplo && <p className="credito__nota">Es un ejemplo para comparar, no una oferta. Así se ve al año lo que parece “solo 10% al mes”.</p>}

      {esfuerzo.ventasExtra != null && (
        <div className={`credito__esfuerzo credito__esfuerzo--${esfuerzo.riesgo ?? 'sin'}`}>
          Para pagar esta cuota tienes que vender <strong>{esfuerzo.ventasExtra} {esfuerzo.ventasExtra === 1 ? r.unidad : r.unidades} más al mes</strong>
          {esfuerzo.riesgo === 'no_alcanza' && ' — y hoy tu ganancia del mes no alcanza para cubrirla.'}
          {esfuerzo.riesgo === 'ajustado' && ' — se lleva más de la mitad de tu ganancia del mes.'}
          {esfuerzo.riesgo === 'alcanza' && '.'}
        </div>
      )}

      {onQuitar && String(o.id).startsWith('propia-') && (
        <button className="btn btn--chico btn--suave" onClick={() => onQuitar(o.id)}>
          Quitar
        </button>
      )}
    </article>
  )
}

export function ResumenCredito({ n }) {
  return <Cifra etiqueta="Cuota" valor={soles(n)} />
}
