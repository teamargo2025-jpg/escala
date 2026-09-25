import { useState } from 'react'
import { EMOJIS_RUBRO, LISTA_RUBROS, RUBROS, crearRubro } from '../data/rubros.js'
import { almacen, MENSAJES_ERROR, MODO_PRUEBA } from '../almacen.js'
import { registrar } from '../lib/analitica.js'
import { ir, reemplazar, volver } from '../negocio.js'
import {
  limpiarDocumento, limpiarTexto, validarApodo, validarDocumento, validarEmprendimiento,
} from '../lib/cuenta.js'
import { Ayuda, BotonSiguiente, CampoTexto, Casilla, Logo, Marco, MensajeError, Pregunta } from '../componentes.jsx'

const LO_QUE_SABRAS = [
  { emoji: '💰', texto: 'cuánto dinero necesitas para empezar', color: '#b7730c', claro: '#fff1d6' },
  { emoji: '🏷️', texto: 'a qué precio vender', color: '#c2366f', claro: '#fde2ed' },
  { emoji: '🎯', texto: 'cuánto tienes que vender al mes', color: '#2f6fdb', claro: '#e0ebfd' },
  { emoji: '📒', texto: 'cuánto dinero entra y sale cada día', color: '#1f8a5b', claro: '#dff3e8' },
]

export function Bienvenida() {
  return (
    <div className="portada">
      <header className="portada__alto">
        <Logo grande />
        <h1>Saca las cuentas de tu negocio</h1>
        <p>Paso a paso, con ejemplos de tu oficio.</p>
      </header>

      <main className="portada__cuerpo">
        {MODO_PRUEBA && <p className="modo-prueba">Modo prueba: las cuentas se guardan solo en este navegador.</p>}
        <h2 className="portada__titulo">Vas a saber:</h2>
        <ul className="portada__lista">
          {LO_QUE_SABRAS.map((x) => (
            <li key={x.texto} style={{ '--c': x.color, '--c-claro': x.claro }}>
              <span className="portada__emoji">{x.emoji}</span>
              {x.texto}
            </li>
          ))}
        </ul>
        <div className="portada__botones">
          <button className="btn btn--principal" onClick={() => ir('/crear/nombre')}>
            Crear mi cuenta
          </button>
          <button className="btn btn--suave" onClick={() => ir('/entrar')}>
            Ya tengo cuenta
          </button>
          <p className="legal__enlaces">
            <button className="enlace" onClick={() => ir('/legal/privacidad')}>Política de privacidad</button> ·{' '}
            <button className="enlace" onClick={() => ir('/legal/terminos')}>Términos y condiciones</button>
          </p>
        </div>
      </main>
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
      registrar(usuario.yaExistia ? 'sesion_iniciada' : 'cuenta_creada')
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
      <p className="legal__enlaces">
        Antes de aceptar puedes leer la{' '}
        <button className="enlace" onClick={() => ir('/legal/privacidad')}>política de privacidad</button> y los{' '}
        <button className="enlace" onClick={() => ir('/legal/terminos')}>términos y condiciones</button>.
      </p>
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
      const usuario = await almacen.ingresar({ apodo: form.apodo, documento: form.documento })
      registrar('sesion_iniciada')
      alEntrar(usuario)
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
export function ElegirRubro({ nombre, rubroActual, rubroPropioActual, anterior, onElegir, onAtras, esRegistro }) {
  const [usarAnterior, setUsarAnterior] = useState(!!anterior)
  const [confirmar, setConfirmar] = useState(null)
  const [propio, setPropio] = useState(null) // formulario de "otro oficio"
  const elegir = (id) => {
    if (rubroActual && id === rubroActual && id !== 'otro') return onAtras()
    if (rubroActual) return setConfirmar(id)
    if (id === 'otro') return setPropio({ nombre: '', unidad: '', unidades: '', genero: 'm', emoji: EMOJIS_RUBRO[0] })
    onElegir(id, usarAnterior && anterior?.rubro === id ? anterior.datos : null)
  }
  const confirmarPropio = (datosPropio) => {
    setPropio(null)
    setConfirmar(null)
    onElegir('otro', null, crearRubro(datosPropio))
  }
  if (propio) {
    return (
      <NuevoRubro
        valor={propio}
        setValor={setPropio}
        onListo={confirmarPropio}
        onAtras={() => setPropio(null)}
        esRegistro={esRegistro}
        total={TOTAL_REGISTRO}
      />
    )
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
        <button className={`rubro rubro--otro${rubroActual === 'otro' ? ' rubro--elegido' : ''}`} onClick={() => elegir('otro')}>
          <span className="rubro__emoji">{rubroActual === 'otro' ? rubroPropioActual?.emoji ?? '✏️' : '✏️'}</span>
          <span className="rubro__nombre">
            {rubroActual === 'otro' && rubroPropioActual ? rubroPropioActual.nombre : 'Otro oficio'}
            <small>Escribe el tuyo: carpintería, comida, zapatería…</small>
          </span>
          <span className="rubro__flecha">→</span>
        </button>
      </div>
      {confirmar && (
        <div className="confirmar" role="alertdialog">
          <p>
            Si cambias a <strong>{confirmar === 'otro' ? 'otro oficio' : RUBROS[confirmar].nombre}</strong>, se borran tus números de
            presupuesto, costos, precio, meta y flujo, y empiezas con los ejemplos del nuevo rubro. Tu control de caja, tu inventario y tus productos no se borran.
          </p>
          <button
            className="btn btn--peligro"
            onClick={() =>
              confirmar === 'otro'
                ? setPropio({ nombre: '', unidad: '', unidades: '', genero: 'm', emoji: EMOJIS_RUBRO[0] })
                : onElegir(confirmar, null)
            }
          >
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

// ---------- Oficio propio: la persona describe su rubro ----------
function NuevoRubro({ valor, setValor, onListo, onAtras, esRegistro, total }) {
  const v = valor
  const cambiar = (c) => setValor({ ...v, ...c })
  const nombreOk = limpiarTexto(v.nombre).length >= 3
  const unidadOk = limpiarTexto(v.unidad).length >= 3
  const listo = nombreOk && unidadOk
  const vista = crearRubro({ ...v, nombre: v.nombre || 'Mi oficio', unidad: v.unidad || 'producto' })

  return (
    <Marco
      titulo="Mi oficio"
      emoji={v.emoji}
      pasos={esRegistro ? { actual: total, total } : null}
      onAtras={onAtras}
      pie={
        <BotonSiguiente onClick={() => listo && onListo(v)} disabled={!listo} aviso="Escribe tu oficio y qué vendes.">
          Listo
        </BotonSiguiente>
      }
    >
      <Pregunta sub="Escribe tu oficio y la app se adapta a lo que tú vendes.">¿A qué te dedicas?</Pregunta>
      <CampoTexto autoFocus valor={v.nombre} placeholder="Ej. Carpintería" maxLength={40} onCambio={(x) => cambiar({ nombre: x })} />

      <div>
        <span className="campo__etiqueta">Elige un dibujo para tu oficio</span>
        <div className="conceptos">
          {EMOJIS_RUBRO.map((e) => (
            <button key={e} className={`emoji-opcion${v.emoji === e ? ' emoji-opcion--activo' : ''}`} onClick={() => cambiar({ emoji: e })} aria-label={`Dibujo ${e}`}>
              {e}
            </button>
          ))}
        </div>
      </div>

      <CampoTexto
        etiqueta="¿Qué vendes? Escríbelo en singular, uno solo"
        valor={v.unidad}
        placeholder="Ej. mueble, torta, corte, arreglo"
        maxLength={24}
        onCambio={(x) => cambiar({ unidad: x, unidades: '' })}
      />
      <Ayuda>
        Es lo que le cobras a tu cliente cada vez. Un carpintero vende <strong>muebles</strong>, una cocinera vende{' '}
        <strong>platos</strong>, un zapatero vende <strong>arreglos</strong>. <br />
        Escríbelo <strong>en singular</strong>: la app dice el resto sola.
      </Ayuda>

      {unidadOk && (
        <>
          <div>
            <span className="campo__etiqueta">¿Cómo se dice?</span>
            <div className="chips chips--dos">
              <button className={`chip${v.genero === 'm' ? ' chip--activo' : ''}`} onClick={() => cambiar({ genero: 'm' })}>
                un {vista.unidad}
              </button>
              <button className={`chip${v.genero === 'f' ? ' chip--activo' : ''}`} onClick={() => cambiar({ genero: 'f' })}>
                una {vista.unidad}
              </button>
            </div>
          </div>
          <CampoTexto
            etiqueta="Y si son varios, ¿cómo les dices?"
            valor={v.unidades || vista.unidades}
            maxLength={30}
            onCambio={(x) => cambiar({ unidades: x })}
          />
          <div className="explica">
            Así te van a preguntar las cosas: <br />
            <strong>"¿{vista.cuantas} {vista.unidades} puedes hacer en un mes?"</strong> <br />
            <strong>"¿Qué gastas para hacer {vista.un} {vista.unidad}?"</strong>
          </div>
        </>
      )}
    </Marco>
  )
}
