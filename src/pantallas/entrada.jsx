import { useState } from 'react'
import { LISTA_RUBROS, RUBROS } from '../data/rubros.js'
import { almacen, MENSAJES_ERROR, MODO_PRUEBA } from '../almacen.js'
import { ir, reemplazar, volver } from '../negocio.js'
import {
  limpiarDocumento, limpiarTexto, validarApodo, validarDocumento, validarEmprendimiento,
} from '../lib/cuenta.js'
import { Ayuda, BotonSiguiente, CampoTexto, Casilla, Logo, Marco, MensajeError, Pregunta } from '../componentes.jsx'

export function Bienvenida() {
  return (
    <div className="inicio">
      <Logo grande />
      {MODO_PRUEBA && <p className="modo-prueba">Modo prueba: las cuentas se guardan solo en este navegador.</p>}
      <h1>Saca las cuentas de tu negocio</h1>
      <p>Paso a paso, con ejemplos de tu oficio. Vas a saber:</p>
      <ul className="inicio__lista">
        <li><span>💰</span> cuánto dinero necesitas para empezar</li>
        <li><span>🏷️</span> a qué precio vender</li>
        <li><span>🎯</span> cuánto tienes que vender al mes</li>
        <li><span>📒</span> cuánto dinero entra y sale cada día</li>
      </ul>
      <div className="inicio__botones">
        <button className="btn btn--principal" onClick={() => ir('/crear/nombre')}>
          Crear mi cuenta
        </button>
        <button className="btn btn--claro" onClick={() => ir('/entrar')}>
          Ya tengo cuenta
        </button>
      </div>
    </div>
  )
}

// ---------- Crear cuenta: una pregunta por pantalla ----------
const PASOS_CREAR = ['nombre', 'emprendimiento', 'dni']
const TOTAL_REGISTRO = 4 // + elegir rubro, que se hace ya con la cuenta creada

function CampoDocumento({ form, setForm, onEnter }) {
  const ce = form.tipoDoc === 'ce'
  const [ver, setVer] = useState(false)
  return (
    <>
      <div className="campo-doc">
      <CampoTexto
        grande
        tipo={ver ? 'text' : 'password'}
        inputMode={ce ? 'text' : 'numeric'}
        maxLength={ce ? 12 : 8}
        autoComplete="current-password"
        valor={form.documento}
        placeholder={ce ? 'Carné de extranjería' : '8 números'}
        onCambio={(v) => setForm({ ...form, documento: limpiarDocumento(v) })}
        onEnter={onEnter}
      />
      <button className="campo-doc__ver" onClick={() => setVer(!ver)} aria-pressed={ver}>
        {ver ? 'Ocultar' : 'Ver'}
      </button>
      </div>
      <button
        className="btn btn--texto btn--izq"
        onClick={() => setForm({ ...form, tipoDoc: ce ? 'dni' : 'ce', documento: '' })}
      >
        {ce ? 'Tengo DNI' : 'No tengo DNI, tengo carné de extranjería'}
      </button>
    </>
  )
}

export function Crear({ paso, form, setForm, alEntrar }) {
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const indice = PASOS_CREAR.indexOf(paso)
  const marco = {
    titulo: 'Crear mi cuenta',
    pasos: { actual: indice + 1, total: TOTAL_REGISTRO },
    onAtras: () => volver(indice > 0 ? `/crear/${PASOS_CREAR[indice - 1]}` : '/'),
  }

  if (paso === 'nombre') {
    const invalido = validarApodo(form.apodo)
    const seguir = () => !invalido && ir('/crear/emprendimiento')
    return (
      <Marco {...marco} pie={<BotonSiguiente onClick={seguir} disabled={!!invalido} />}>
        <Pregunta sub="Con este nombre vas a entrar a la app.">¿Cómo te llamas?</Pregunta>
        <CampoTexto grande autoFocus valor={form.apodo} placeholder="Ej. Rosa" onCambio={(v) => setForm({ ...form, apodo: v })} onEnter={seguir} />
        <Ayuda>
          Puede ser tu nombre o como te dicen. Si en tu grupo hay otra persona con tu mismo nombre, agrega tu apellido:
          <strong> Rosa Quispe</strong>. <br />
          No importan las mayúsculas ni las tildes: <strong>María</strong> y <strong>maria</strong> es lo mismo.
        </Ayuda>
      </Marco>
    )
  }

  if (paso === 'emprendimiento') {
    const invalido = validarEmprendimiento(form.emprendimiento)
    const seguir = () => !invalido && ir('/crear/dni')
    return (
      <Marco {...marco} pie={<BotonSiguiente onClick={seguir} disabled={!!invalido} />}>
        <Pregunta sub={`Hola, ${limpiarTexto(form.apodo)}. Cuéntanos de tu negocio.`}>¿Cómo se llama tu emprendimiento?</Pregunta>
        <CampoTexto
          grande
          autoFocus
          valor={form.emprendimiento}
          placeholder="Ej. Confecciones Rosita"
          onCambio={(v) => setForm({ ...form, emprendimiento: v })}
          onEnter={seguir}
        />
        <Ayuda>
          Si todavía no tiene nombre, inventa uno; después lo puedes cambiar. <br />
          Ejemplos: <strong>Confecciones Rosita</strong>, <strong>Taller Don José</strong>, <strong>Estilos Karla</strong>.
        </Ayuda>
      </Marco>
    )
  }

  // paso === 'dni'
  const invalido = validarDocumento(form.documento, form.tipoDoc)
  const puede = !invalido && form.acepto && !enviando
  const crear = async () => {
    if (!puede) return
    setError(null)
    setEnviando(true)
    try {
      const usuario = await almacen.crearCuenta({
        apodo: form.apodo,
        documento: form.documento,
        emprendimiento: form.emprendimiento,
      })
      alEntrar(usuario)
    } catch (e) {
      setError(e.codigo === 'apodo_usado' ? 'apodo_usado' : e.codigo || 'otro')
      setEnviando(false)
    }
  }
  return (
    <Marco
      {...marco}
      pie={
        <BotonSiguiente
          onClick={crear}
          disabled={!puede}
          aviso={enviando ? null : !form.acepto && !invalido ? 'Marca la casilla para seguir.' : null}
        >
          {enviando ? 'Creando tu cuenta…' : 'Crear mi cuenta'}
        </BotonSiguiente>
      }
    >
      <Pregunta sub="Tu DNI es tu clave para entrar. Así solo tú ves tus números.">
        {form.tipoDoc === 'ce' ? 'Escribe tu carné de extranjería' : 'Escribe tu DNI'}
      </Pregunta>
      <CampoDocumento form={form} setForm={setForm} onEnter={crear} />
      <Ayuda etiqueta="¿Qué pasa con mi DNI?">
        Se guarda <strong>cifrado</strong>: se usa solo para comprobar que eres tú y nadie puede leerlo, ni el
        facilitador. Para entrar otro día vas a escribir tu nombre (<strong>{limpiarTexto(form.apodo)}</strong>) y
        tu DNI.
      </Ayuda>
      <Casilla marcada={form.acepto} onCambio={(v) => setForm({ ...form, acepto: v })}>
        Acepto que ESCALA guarde mi nombre, el de mi emprendimiento y mis números para mostrármelos cuando vuelva.
      </Casilla>
      <MensajeError>{error && MENSAJES_ERROR[error]}</MensajeError>
      {error === 'apodo_usado' && (
        <button
          className="btn btn--suave"
          onClick={() => ((history.state?.escala ?? 0) >= 2 ? history.go(-2) : reemplazar('/crear/nombre'))}
        >
          ← Cambiar mi nombre
        </button>
      )}
    </Marco>
  )
}

export function Entrar({ form, setForm, alEntrar }) {
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const puede = !validarApodo(form.apodo) && !validarDocumento(form.documento, form.tipoDoc) && !enviando
  const entrar = async () => {
    if (!puede) return
    setError(null)
    setEnviando(true)
    try {
      alEntrar(await almacen.ingresar({ apodo: form.apodo, documento: form.documento }))
    } catch (e) {
      setError(e.codigo || 'otro')
      setEnviando(false)
    }
  }
  return (
    <Marco
      titulo="Entrar"
      onAtras={() => volver('/')}
      pie={
        <BotonSiguiente onClick={entrar} disabled={!puede}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </BotonSiguiente>
      }
    >
      <Pregunta sub="Escribe tu nombre como lo pusiste al crear tu cuenta.">Hola de nuevo 👋</Pregunta>
      <CampoTexto
        etiqueta="Tu nombre"
        autoFocus
        autoComplete="username"
        valor={form.apodo}
        placeholder="Ej. Rosa"
        onCambio={(v) => setForm({ ...form, apodo: v })}
      />
      <div>
        <span className="campo__etiqueta">{form.tipoDoc === 'ce' ? 'Tu carné de extranjería' : 'Tu DNI'}</span>
        <CampoDocumento form={form} setForm={setForm} onEnter={entrar} />
      </div>
      <MensajeError>{error && MENSAJES_ERROR[error]}</MensajeError>
      <Ayuda etiqueta="No puedo entrar">
        Revisa que tu nombre esté escrito igual que cuando creaste la cuenta (por ejemplo, con o sin apellido). Si
        igual no puedes, pide ayuda al facilitador.
      </Ayuda>
      <button className="btn btn--texto" onClick={() => ir('/crear/nombre')}>
        No tengo cuenta: crear una
      </button>
    </Marco>
  )
}

// ---------- Rubro: último paso del registro, o cambio desde el perfil ----------
export function ElegirRubro({ nombre, rubroActual, anterior, onElegir, onAtras, esRegistro }) {
  const [usarAnterior, setUsarAnterior] = useState(!!anterior)
  const [confirmar, setConfirmar] = useState(null)
  const elegir = (id) => {
    if (rubroActual && id === rubroActual) return onAtras()
    if (rubroActual) return setConfirmar(id)
    onElegir(id, usarAnterior && anterior?.rubro === id ? anterior.datos : null)
  }
  return (
    <Marco
      titulo={esRegistro ? 'Crear mi cuenta' : 'Cambiar rubro'}
      pasos={esRegistro ? { actual: TOTAL_REGISTRO, total: TOTAL_REGISTRO } : null}
      onAtras={onAtras}
    >
      <Pregunta sub="Así te mostramos ejemplos que conoces.">
        {esRegistro ? `¡Listo, ${nombre}! ¿De qué rubro es tu emprendimiento?` : '¿De qué rubro es tu emprendimiento?'}
      </Pregunta>
      {anterior && (
        <Casilla marcada={usarAnterior} onCambio={setUsarAnterior}>
          Usar las cuentas que ya hice en este celular ({RUBROS[anterior.rubro].nombre})
        </Casilla>
      )}
      <div className="rubros">
        {LISTA_RUBROS.map((r) => (
          <button
            key={r.id}
            className={`rubro${rubroActual === r.id ? ' rubro--elegido' : ''}`}
            onClick={() => elegir(r.id)}
          >
            <span className="rubro__emoji">{r.emoji}</span>
            <span className="rubro__nombre">{r.nombre}</span>
            <span className="rubro__flecha">{rubroActual === r.id ? '✓' : '→'}</span>
          </button>
        ))}
      </div>
      {confirmar && (
        <div className="confirmar" role="alertdialog">
          <p>
            Si cambias a <strong>{RUBROS[confirmar].nombre}</strong>, se borran tus números de presupuesto, costos,
            precio, meta y flujo, y empiezas con los ejemplos del nuevo rubro. Tu control de caja no se borra.
          </p>
          <button className="btn btn--peligro" onClick={() => onElegir(confirmar, null)}>
            Sí, cambiar de rubro
          </button>
          <button className="btn btn--suave" onClick={() => setConfirmar(null)}>
            No, dejarlo como está
          </button>
        </div>
      )}
    </Marco>
  )
}
