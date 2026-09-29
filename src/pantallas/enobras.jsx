// Pantallas de "todavía no": mejor decir la verdad con gracia que mostrar una
// sección a medias. La pestaña se queda en la barra a propósito: que se vea a
// dónde va ESCALA es parte de lo que se enseña en la capacitación.
import { MATERIALES } from '../data/eco.js'
import { ir, volver } from '../negocio.js'
import { Marco } from '../componentes.jsx'

// Perrito albañil. Va en SVG y no como imagen para que pese nada y se vea bien
// en cualquier pantalla, incluso sin internet. Se mueve con CSS: martilla, mueve
// las orejas y parpadea. Quien tenga activado "reducir movimiento" lo ve quieto.
function PerritoAlbanil() {
  return (
    <svg className="obras__perro" viewBox="0 0 220 190" role="img" aria-label="Fiel, un perrito blanco con casco de obra, martillando">
      <g className="perro">
        {/* orejas */}
        <ellipse className="perro__oreja perro__oreja--izq" cx="55" cy="104" rx="16" ry="27" fill="#8a5a33" />
        <ellipse className="perro__oreja perro__oreja--der" cx="145" cy="104" rx="16" ry="27" fill="#8a5a33" />

        {/* casco */}
        <path d="M58 62c0-24 19-42 42-42s42 18 42 42z" fill="#f2a917" />
        <rect x="48" y="60" width="104" height="11" rx="5.5" fill="#f2a917" />
        <rect x="94" y="22" width="12" height="40" rx="6" fill="#d98e08" />

        {/* cara: blanca, con un contorno suave para que se despegue del fondo claro */}
        <path d="M62 74h76v42a38 38 0 0 1-76 0z" fill="#fdfdff" stroke="#ddd6e6" strokeWidth="2" strokeLinejoin="round" />
        <ellipse cx="100" cy="118" rx="38" ry="34" fill="#fdfdff" stroke="#ddd6e6" strokeWidth="2" />
        <path d="M63 76h74" stroke="#fdfdff" strokeWidth="4" />

        {/* hocico */}
        <ellipse cx="100" cy="132" rx="23" ry="17" fill="#f1eef7" />
        <ellipse cx="100" cy="123" rx="7.5" ry="5.5" fill="#3b2415" />
        <path d="M100 129v7M100 136c-4 0-7-2-8-4M100 136c4 0 7-2 8-4" stroke="#3b2415" strokeWidth="2.6" strokeLinecap="round" fill="none" />

        {/* ojos */}
        <g className="perro__ojos">
          <circle cx="84" cy="103" r="5.2" fill="#3b2415" />
          <circle cx="116" cy="103" r="5.2" fill="#3b2415" />
          <circle cx="85.8" cy="101.2" r="1.8" fill="#fff" />
          <circle cx="117.8" cy="101.2" r="1.8" fill="#fff" />
        </g>

        {/* chaleco */}
        <path d="M66 156h68l6 18H60z" fill="#f2a917" />
        <path d="M86 156h28l-4 18H90z" fill="#fff" opacity="0.75" />

        {/* collar con su nombre */}
        <rect x="65" y="145" width="70" height="17" rx="8.5" fill="#c2412d" />
        <circle cx="100" cy="166" r="6.5" fill="#f2a917" stroke="#d98e08" strokeWidth="1.5" />
        <text
          x="100"
          y="157.5"
          textAnchor="middle"
          fill="#fff"
          fontSize="11"
          fontWeight="800"
          letterSpacing="1.4"
          fontFamily="Nunito, system-ui, sans-serif"
        >
          FIEL
        </text>

        {/* martillo: da el golpe y el resto del cuerpo lo acusa */}
        <g className="perro__brazo">
          {/* patita que lo sujeta */}
          <circle cx="156" cy="160" r="11" fill="#fdfdff" stroke="#ddd6e6" strokeWidth="2" />
          {/* mango y cabeza del martillo */}
          <rect x="152" y="116" width="9" height="44" rx="4.5" fill="#a9703f" />
          <rect x="140" y="106" width="34" height="15" rx="4" fill="#6b7280" />
          <rect x="166" y="102" width="12" height="23" rx="3" fill="#4b5563" />
        </g>
      </g>
    </svg>
  )
}

const MENSAJES = {
  marca: {
    titulo: 'Tu marca',
    frase: 'Estamos construyendo esto',
    detalle:
      'Acá vas a armar la cara de tu negocio: tu foto de marca y un calendario para saber qué publicar y cuándo.',
    accionTexto: 'Mientras tanto, ve a tus cuentas',
    accionRuta: '/',
  },
  escalemos: {
    titulo: 'Revista ESCALA',
    frase: 'Estamos construyendo esto',
    detalle:
      'Acá van a salir las convocatorias, ferias y talleres de la red. Y vas a poder postular tu emprendimiento para la revista.',
    accionTexto: 'Mientras tanto, ve a tus cuentas',
    accionRuta: '/',
  },
}

export function EnObras({ seccion }) {
  const m = MENSAJES[seccion] ?? MENSAJES.marca
  return (
    <div className="obras">
      <PerritoAlbanil />
      <span className="obras__cinta">🚧 En obra</span>
      <h1>{m.frase}</h1>
      <p className="obras__detalle">{m.detalle}</p>
      <p className="obras__pronto">Te avisamos apenas esté lista.</p>
      <button className="btn btn--principal" onClick={() => ir(m.accionRuta)}>
        {m.accionTexto}
      </button>
    </div>
  )
}

// EcoEscala todavía no abre, pero sí conviene que empiecen a guardar material
// desde ya: cuando se abra, llegan con algo juntado en vez de empezar de cero.
export function EcoPronto({ guardado }) {
  const materiales = Object.values(MATERIALES)
  return (
    <Marco titulo="EcoEscala" emoji="🌱" guardado={guardado} onAtras={() => volver('/')}>
      <div className="eco-pronto">
        <p className="eco-pronto__kicker">Muy pronto</p>
        <h1 className="eco-pronto__titulo">Empieza a juntar desde hoy</h1>
        <p className="eco-pronto__texto">
          Lo que hoy botas del taller sirve. Separa y guarda lo que te sobre: cuando abramos EcoEscala,{' '}
          <strong>lo que hayas juntado va a valer</strong>.
        </p>
      </div>

      <h2 className="subtitulo">Guarda esto</h2>
      <div className="eco-pronto__materiales">
        {materiales.map((m) => (
          <span key={m.nombre} className="eco-pronto__material" style={{ '--c': m.color }}>
            <span aria-hidden="true">{m.emoji}</span> {m.nombre}
          </span>
        ))}
      </div>
      <p className="nota-suave nota-suave--izq">
        Límpialo y sepáralo por tipo. Mientras más limpio y separado, mejor.
      </p>

      <div className="eco-pronto__pista">
        <span aria-hidden="true">🎁</span>
        <p>
          Lo que juntes se va a poder <strong>cambiar por cosas para tu negocio</strong>. Todavía no contamos por qué
          cosas… pero empieza a guardar.
        </p>
      </div>
    </Marco>
  )
}
