import { useCallback, useEffect, useMemo } from 'react'
import { RUBROS } from './data/rubros.js'
import { PANTALLAS, useEstado } from './estado.js'
import { calcular } from './lib/calc.js'
import * as P from './pantallas.jsx'

const COMPONENTES = {
  rubro: P.Rubro,
  arranque: P.Arranque,
  fijos: P.Fijos,
  variables: P.Variables,
  cantidad: P.Cantidad,
  precio: P.Precio,
  meta: P.Meta,
  flujo: P.Flujo,
  resumen: P.Resumen,
}

export default function App() {
  const [estado, despachar] = useEstado()
  const ir = useCallback((pantalla) => despachar({ tipo: 'ir', pantalla }), [despachar])

  // Sin oficio elegido solo se puede estar en inicio o rubro.
  const pantalla = !estado.rubro && !['inicio', 'rubro'].includes(estado.pantalla) ? 'rubro' : estado.pantalla
  const indice = PANTALLAS.findIndex((p) => p.id === pantalla)
  const actual = PANTALLAS[indice] ?? PANTALLAS[0]
  const n = useMemo(() => calcular(estado), [estado])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pantalla])

  if (actual.id === 'inicio') return <P.Inicio ir={ir} />

  const Pantalla = COMPONENTES[actual.id]
  const marco = {
    paso: actual.paso,
    titulo: actual.titulo,
    onAtras: () => ir(PANTALLAS[indice - 1].id),
  }
  return (
    <Pantalla
      key={actual.id}
      estado={estado}
      despachar={despachar}
      marco={marco}
      siguiente={() => ir(PANTALLAS[indice + 1].id)}
      r={RUBROS[estado.rubro]}
      n={n}
    />
  )
}
