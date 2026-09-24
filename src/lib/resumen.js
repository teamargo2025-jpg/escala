// Todos los números del negocio en un solo lugar, para verlos sin entrar a cada apartado.
import { APARTADO } from './apartados.js'
import { hoy, mesDe, resumenMes, saldo } from './caja.js'
import { num, soles } from './calc.js'
import { costoProducto, porAcabarse, valorInventario } from './inventario.js'
import { estadoLecciones } from './educacion.js'

const plural = (cantidad, r) => `${cantidad.toLocaleString('es-PE')} ${cantidad === 1 ? r.unidad : r.unidades}`

// Devuelve una sección por apartado; `filas` vacío significa "todavía no lo ha hecho".
export function seccionesResumen({ datos, n, movimientos = [], r, meses }) {
  const hechos = datos.hechos ?? {}
  const inv = datos.inventario ?? { materiales: [], movimientos: [] }
  const productos = datos.productos ?? []
  const caja = resumenMes(movimientos, mesDe(hoy()))
  const edu = estadoLecciones(datos.educacion)

  const secciones = [
    {
      id: 'presupuesto',
      falta: !hechos.presupuesto,
      filas: [{ etiqueta: 'Dinero para arrancar', valor: soles(n.inversion), fuerte: true }],
    },
    {
      id: 'costos',
      falta: !hechos.costos,
      filas: [
        { etiqueta: 'Pagas al mes, vendas o no', valor: soles(n.fijos), fuerte: true },
        { etiqueta: `Gastas por cada ${r.unidad}`, valor: soles(n.variableUnidad, { decimales: 2 }) },
        { etiqueta: `Puedes hacer al mes`, valor: n.cantidad ? plural(n.cantidad, r) : '—' },
        { etiqueta: `Parte de los pagos en cada ${r.unidad}`, valor: soles(n.fijoPorUnidad, { decimales: 2 }) },
      ],
    },
    {
      id: 'precio',
      falta: !hechos.precio,
      filas: [
        { etiqueta: `Te cuesta cada ${r.unidad}`, valor: soles(n.costoUnidad, { decimales: 2 }) },
        { etiqueta: 'Tu precio de venta', valor: soles(n.precio), fuerte: true },
        { etiqueta: `Ganas por cada ${r.unidad}`, valor: soles(n.gananciaUnidad, { decimales: 2 }), tono: n.gananciaUnidad >= 0 ? 'pos' : 'neg' },
        { etiqueta: 'Ganancia que le sumas', valor: `${datos.ganancia}%` },
      ],
    },
    {
      id: 'meta',
      falta: !hechos.meta,
      filas: [
        { etiqueta: 'Para no perder, vende al mes', valor: n.equilibrio == null ? '—' : plural(n.equilibrio, r), fuerte: true },
        ...(n.unidadesMeta != null
          ? [
              { etiqueta: `Para ganar ${soles(n.metaGanancia)}`, valor: plural(n.unidadesMeta, r) },
              {
                etiqueta: '¿Te alcanza el tiempo?',
                valor: n.unidadesMeta <= n.cantidad ? 'Sí' : 'No alcanza',
                tono: n.unidadesMeta <= n.cantidad ? 'pos' : 'neg',
              },
            ]
          : []),
      ],
    },
    {
      id: 'flujo',
      falta: !hechos.flujo,
      filas: [
        ...n.meses.map((m, i) => ({
          etiqueta: `Mes ${i + 1}: ${plural(m.unidades, r)}`,
          valor: `${m.resultado >= 0 ? 'te queda ' : 'te falta '}${soles(Math.abs(m.resultado))}`,
          tono: m.resultado >= 0 ? 'pos' : 'neg',
        })),
        { etiqueta: `En ${meses} meses`, valor: soles(n.totalFlujo), tono: n.totalFlujo >= 0 ? 'pos' : 'neg', fuerte: true },
        ...(n.inversion > 0
          ? [{ etiqueta: 'De tu inversión te falta recuperar', valor: n.saldoFinal >= 0 ? 'Nada, ya la recuperaste' : soles(-n.saldoFinal) }]
          : []),
      ],
    },
    {
      id: 'caja',
      falta: movimientos.length === 0,
      filas: [
        { etiqueta: 'Dinero en caja hoy', valor: soles(saldo(movimientos)), tono: saldo(movimientos) >= 0 ? 'pos' : 'neg', fuerte: true },
        { etiqueta: 'Entró este mes', valor: soles(caja.entradas), tono: 'pos' },
        { etiqueta: 'Salió este mes', valor: soles(caja.salidas), tono: 'neg' },
        { etiqueta: 'Vendiste este mes', valor: plural(caja.unidadesVendidas, r) },
      ],
    },
    {
      id: 'inventario',
      falta: inv.materiales.length === 0,
      filas: [
        { etiqueta: 'Tienes en materiales', valor: soles(valorInventario(inv.materiales)), fuerte: true },
        { etiqueta: 'Materiales anotados', valor: String(inv.materiales.length) },
        ...(() => {
          const contados = new Set((inv.movimientos ?? []).map((m) => m.materialId))
          const bajos = porAcabarse(inv.materiales).filter((m) => contados.has(m.id))
          return bajos.length ? [{ etiqueta: 'Se están acabando', valor: bajos.map((m) => m.nombre).join(', '), tono: 'neg' }] : []
        })(),
      ],
    },
    {
      id: 'costeo',
      falta: productos.length === 0,
      filas: productos.slice(0, 6).map((p) => {
        const c = costoProducto(p, inv.materiales, {
          valorHora: num(datos.valorHora),
          fijoPorUnidad: hechos.costos ? n.fijoPorUnidad : 0,
        })
        const precio = num(p.precioVenta)
        return {
          etiqueta: p.nombre,
          valor: precio
            ? `cuesta ${soles(c.total, { decimales: 2 })} · vendes a ${soles(precio)}`
            : `cuesta ${soles(c.total, { decimales: 2 })}`,
          tono: precio ? (precio >= c.total ? 'pos' : 'neg') : undefined,
        }
      }),
    },
    {
      id: 'educacion',
      falta: edu.completadas === 0,
      filas: [{ etiqueta: 'Lecciones terminadas', valor: `${edu.completadas} de ${edu.total}`, fuerte: true }],
    },
  ]

  return secciones
    .filter((s) => !s.falta && s.filas.length > 0)
    .map((s) => ({ ...s, nombre: APARTADO[s.id].nombre, emoji: APARTADO[s.id].emoji, color: APARTADO[s.id].color, claro: APARTADO[s.id].claro }))
}
