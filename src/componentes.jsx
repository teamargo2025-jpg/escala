import { useId, useState } from 'react'
import { TOTAL_PASOS } from './estado.js'
import { num, soles, totalMarcado } from './lib/calc.js'

export function Logo({ grande }) {
  return (
    <span className={`logo${grande ? ' logo--grande' : ''}`}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <rect x="6" y="38" width="14" height="20" rx="3" />
        <rect x="25" y="24" width="14" height="34" rx="3" />
        <rect x="44" y="8" width="14" height="50" rx="3" />
      </svg>
      ESCALA
    </span>
  )
}

// Estructura de cada pantalla: barra de avance arriba, contenido, botón grande abajo.
export function Marco({ paso, titulo, onAtras, children, pie }) {
  return (
    <div className="marco">
      <header className="barra">
        {onAtras ? (
          <button className="btn-atras" onClick={onAtras} aria-label="Volver">
            ←
          </button>
        ) : (
          <span className="btn-atras btn-atras--vacio" />
        )}
        <div className="barra__centro">
          <div className="barra__texto">
            <span>
              Paso {paso} de {TOTAL_PASOS}
            </span>
            <strong>{titulo}</strong>
          </div>
          <div className="avance" role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL_PASOS} aria-valuenow={paso}>
            {Array.from({ length: TOTAL_PASOS }, (_, i) => (
              <span key={i} className={i < paso ? 'hecho' : ''} />
            ))}
          </div>
        </div>
      </header>
      <main className="contenido">{children}</main>
      {pie && <footer className="pie">{pie}</footer>}
    </div>
  )
}

export function BotonSiguiente({ onClick, disabled, children = 'Siguiente', aviso }) {
  return (
    <>
      {disabled && aviso && <p className="pie__aviso">{aviso}</p>}
      <button className="btn btn--principal" onClick={onClick} disabled={disabled}>
        {children}
      </button>
    </>
  )
}

export function Pregunta({ children, sub }) {
  return (
    <div className="pregunta">
      <h1>{children}</h1>
      {sub && <p>{sub}</p>}
    </div>
  )
}

// "¿Qué pongo aquí?": se abre con un toque, muestra un ejemplo del oficio.
export function Ayuda({ children, etiqueta = '¿Qué pongo aquí?' }) {
  const [abierta, setAbierta] = useState(false)
  const id = useId()
  return (
    <div className="ayuda">
      <button className="ayuda__btn" aria-expanded={abierta} aria-controls={id} onClick={() => setAbierta(!abierta)}>
        <span className="ayuda__icono">?</span> {etiqueta}
      </button>
      {abierta && (
        <div className="ayuda__caja" id={id}>
          {children}
        </div>
      )}
    </div>
  )
}

export function Aprende({ termino, children }) {
  return (
    <div className="aprende">
      <span className="aprende__etiqueta">Palabra nueva</span>
      <p>
        A esto se le llama <strong>{termino}</strong>. {children}
      </p>
    </div>
  )
}

const soloNumero = (v) => v.replace(/[^\d.,]/g, '').replace(/([.,].*)[.,]/g, '$1')

export function CampoNumero({ valor, onCambio, prefijo = 'S/', sufijo, placeholder, entero, etiqueta, grande, id }) {
  return (
    <label className={`campo${grande ? ' campo--grande' : ''}`} htmlFor={id}>
      {etiqueta && <span className="campo__etiqueta">{etiqueta}</span>}
      <span className="campo__caja">
        {prefijo && <span className="campo__prefijo">{prefijo}</span>}
        <input
          id={id}
          inputMode={entero ? 'numeric' : 'decimal'}
          value={valor}
          placeholder={placeholder}
          onChange={(e) => onCambio(entero ? e.target.value.replace(/\D/g, '') : soloNumero(e.target.value))}
          onFocus={(e) => e.target.select()}
        />
        {sufijo && <span className="campo__sufijo">{sufijo}</span>}
      </span>
    </label>
  )
}

// Lista de sugerencias marcables con precio, más "agregar otro".
export function ListaItems({ items, lista, despachar, textoTotal, textoAgregar = 'Agregar otro' }) {
  const total = totalMarcado(items)
  const cambiar = (id, cambio) => despachar({ tipo: 'item', lista, id, cambio })
  return (
    <div className="lista">
      {items.map((it) => (
        <div key={it.id} className={`item${it.marcado ? ' item--marcado' : ''}`}>
          <div className="item__fila">
            <button
              className="item__check"
              role="checkbox"
              aria-checked={it.marcado}
              aria-label={it.nombre || 'Otro'}
              onClick={() => cambiar(it.id, { marcado: !it.marcado })}
            >
              {it.marcado ? '✓' : ''}
            </button>
            {it.propio ? (
              <input
                className="item__nombre-input"
                placeholder="¿Qué es?"
                value={it.nombre}
                onChange={(e) => cambiar(it.id, { nombre: e.target.value })}
              />
            ) : (
              <span className="item__nombre" onClick={() => cambiar(it.id, { marcado: !it.marcado })}>
                {it.nombre}
              </span>
            )}
            {it.propio && (
              <button className="item__quitar" aria-label="Quitar" onClick={() => despachar({ tipo: 'quitarItem', lista, id: it.id })}>
                ✕
              </button>
            )}
          </div>
          {it.marcado && (
            <div className="item__detalle">
              <CampoNumero
                valor={it.precio}
                placeholder={it.sugerido != null ? String(it.sugerido) : '0'}
                onCambio={(v) => cambiar(it.id, { precio: v })}
              />
              {it.sugerido != null && num(it.precio) === it.sugerido && (
                <span className="item__nota">Precio de ejemplo. Cámbialo si pagas otro.</span>
              )}
              {it.ayuda && <p className="item__ayuda">{it.ayuda}</p>}
            </div>
          )}
        </div>
      ))}
      <button className="btn btn--suave" onClick={() => despachar({ tipo: 'agregarItem', lista })}>
        + {textoAgregar}
      </button>
      <div className="total">
        <span>{textoTotal}</span>
        <strong>{soles(total)}</strong>
      </div>
    </div>
  )
}

export function Cifra({ etiqueta, valor, nota, tono }) {
  return (
    <div className={`cifra${tono ? ` cifra--${tono}` : ''}`}>
      <span className="cifra__etiqueta">{etiqueta}</span>
      <strong className="cifra__valor">{valor}</strong>
      {nota && <span className="cifra__nota">{nota}</span>}
    </div>
  )
}
