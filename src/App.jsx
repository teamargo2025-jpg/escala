import { useCallback, useEffect, useState } from 'react'
import { rubroDe } from './data/rubros.js'
import { almacen, MENSAJES_ERROR } from './almacen.js'
import { destinoDisponible, estadoApartados } from './lib/apartados.js'
import { validarApodo, validarEmprendimiento } from './lib/cuenta.js'
import {
  datosIniciales, datosVersionAnterior, irAlInicio, olvidarVersionAnterior, reemplazar, useNegocio, useRuta, volver,
} from './negocio.js'
import { Logo, Redirigir } from './componentes.jsx'
import { Bienvenida, Crear, ElegirRubro, Entrar } from './pantallas/entrada.jsx'
import { Lobby, Perfil } from './pantallas/lobby.jsx'
import { Costos, Flujo, Meta, Precio, Presupuesto } from './pantallas/apartados.jsx'
import { Caja, NuevoMovimiento } from './pantallas/caja.jsx'
import { Inventario, Material, MovimientoInventario } from './pantallas/inventario.jsx'
import { Costeo, FichaProducto } from './pantallas/costeo.jsx'
import { Educacion, Leccion } from './pantallas/educacion.jsx'

const FORM_VACIO = { apodo: '', emprendimiento: '', documento: '', tipoDoc: 'dni', acepto: false }
const APARTADOS_PLAN = { presupuesto: Presupuesto, costos: Costos, precio: Precio, meta: Meta, flujo: Flujo }

function Cargando() {
  return (
    <div className="cargando">
      <Logo grande />
    </div>
  )
}

export default function App() {
  const ruta = useRuta()
  const [usuario, setUsuario] = useState(undefined) // undefined = revisando la sesión
  // El formulario de registro vive en memoria: el DNI nunca se guarda en el celular.
  const [form, setForm] = useState(FORM_VACIO)

  useEffect(() => {
    almacen.sesion().then(setUsuario, () => setUsuario(null))
  }, [])

  const clave = ruta.join('/')
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [clave])

  const alEntrar = useCallback((u) => {
    setForm(FORM_VACIO)
    setUsuario(u)
    irAlInicio()
  }, [])

  const salir = useCallback(async () => {
    await almacen.salir()
    setUsuario(null)
    irAlInicio()
  }, [])

  if (usuario === undefined) return <Cargando />

  if (!usuario) {
    if (ruta[0] === 'entrar') return <Entrar form={form} setForm={setForm} alEntrar={alEntrar} />
    if (ruta[0] === 'crear') {
      const paso = ruta[1]
      if (paso === 'nombre') return <Crear key={paso} paso={paso} form={form} setForm={setForm} alEntrar={alEntrar} />
      // Si se recargó a mitad del registro, se vuelve a la primera pregunta que falte.
      if (validarApodo(form.apodo)) return <Redirigir a="/crear/nombre" />
      if (paso === 'emprendimiento') return <Crear key={paso} paso={paso} form={form} setForm={setForm} alEntrar={alEntrar} />
      if (validarEmprendimiento(form.emprendimiento)) return <Redirigir a="/crear/emprendimiento" />
      if (paso === 'dni') return <Crear key={paso} paso={paso} form={form} setForm={setForm} alEntrar={alEntrar} />
    }
    if (ruta.length) return <Redirigir a="/" />
    return <Bienvenida />
  }

  return <ConCuenta key={usuario.userId} usuario={usuario} ruta={ruta} onSalir={salir} />
}

function ConCuenta({ usuario, ruta, onSalir }) {
  const neg = useNegocio(usuario)
  const [ultimoHecho, setUltimoHecho] = useState(null)
  const [anterior] = useState(datosVersionAnterior)
  const { perfil, n, despachar, guardado } = neg

  useEffect(() => {
    if (ruta.length) setUltimoHecho(null)
  }, [ruta.length])

  const terminar = useCallback(
    (apartado) => {
      despachar({ tipo: 'hecho', apartado })
      setUltimoHecho(apartado)
      irAlInicio()
    },
    [despachar],
  )

  if (!neg.cargado) return <Cargando />

  if (neg.errorCarga) {
    return (
      <div className="inicio inicio--centrado">
        <Logo grande />
        <p>{MENSAJES_ERROR[neg.errorCarga.codigo] ?? MENSAJES_ERROR.otro}</p>
        <button className="btn btn--principal" onClick={() => location.reload()}>
          Volver a intentar
        </button>
      </div>
    )
  }

  // Cuenta recién creada (o registro interrumpido): falta elegir el rubro.
  if (!perfil?.rubro) {
    return (
      <ElegirRubro
        esRegistro
        nombre={usuario.nickname}
        anterior={anterior}
        onElegir={(id, datos, rubroPropio) => {
          neg.crearNegocio(id, datos, rubroPropio)
          if (datos) olvidarVersionAnterior()
          irAlInicio()
        }}
      />
    )
  }

  const r = rubroDe(perfil)
  const comunes = { datos: perfil.datos, despachar, terminar, guardado, perfil, r, n }
  const [seccion, sub] = ruta

  if (!seccion) {
    return (
      <Lobby
        perfil={perfil}
        n={n}
        movimientos={neg.movimientos}
        guardado={guardado}
        ultimoHecho={ultimoHecho}
        cerrarAviso={() => setUltimoHecho(null)}
      />
    )
  }

  if (APARTADOS_PLAN[seccion]) {
    const destino = destinoDisponible(estadoApartados(perfil.datos.hechos).lista, seccion)
    if (destino !== seccion) return <Redirigir a={`/${destino}`} />
    const Pantalla = APARTADOS_PLAN[seccion]
    return <Pantalla key={seccion + (sub ?? '')} paso={sub} {...comunes} />
  }

  if (seccion === 'caja') {
    const caja = { ...comunes, movimientos: neg.movimientos, agregarMovimiento: neg.agregarMovimiento, borrarMovimiento: neg.borrarMovimiento }
    if (!sub) return <Caja {...caja} />
    if (['entrada', 'salida', 'inicial'].includes(sub)) return <NuevoMovimiento key={sub} tipo={sub} {...caja} />
  }

  if (seccion === 'inventario') {
    const props = { ...comunes, agregarMovimiento: neg.agregarMovimiento }
    if (!sub) return <Inventario {...props} />
    if (sub === 'nuevo') return <Material key="nuevo" {...props} />
    if (sub === 'material' && ruta[2]) return <Material key={ruta[2]} id={ruta[2]} {...props} />
    if (['compra', 'uso', 'conteo'].includes(sub)) return <MovimientoInventario key={sub} tipo={sub} {...props} />
  }

  if (seccion === 'costeo') {
    if (!sub) return <Costeo {...comunes} />
    return <FichaProducto key={sub} id={sub} {...comunes} />
  }

  if (seccion === 'educacion') {
    if (!sub) return <Educacion {...comunes} />
    return <Leccion key={sub} id={sub} {...comunes} />
  }

  if (seccion === 'perfil') {
    if (sub === 'rubro') {
      return (
        <ElegirRubro
          rubroActual={perfil.rubro}
          rubroPropioActual={perfil.datos.rubroPersonalizado}
          onAtras={() => volver('/perfil')}
          onElegir={(id, _datos, rubroPropio) => {
            // Cambiar de rubro reinicia el plan, pero no lo que no depende del oficio:
            // inventario, fichas de costo, valor de la hora y lecciones aprendidas.
            neg.cambiarPerfil((p) => ({
              ...p,
              rubro: id,
              datos: {
                ...datosIniciales(id, rubroPropio),
                inventario: p.datos.inventario,
                productos: p.datos.productos,
                valorHora: p.datos.valorHora,
                educacion: p.datos.educacion,
                hechos: p.datos.hechos?.educacion ? { educacion: true } : {},
              },
            }))
            irAlInicio()
          }}
        />
      )
    }
    return <Perfil perfil={perfil} cambiarPerfil={neg.cambiarPerfil} onSalir={onSalir} />
  }

  return <Redirigir a="/" />
}
