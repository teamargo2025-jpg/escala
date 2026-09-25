// Textos legales. Están escritos en lenguaje simple a propósito: los leen los participantes.
// PENDIENTE: reemplazar los datos entre [corchetes] por los de la institución responsable.
export const RESPONSABLE = {
  institucion: '[NOMBRE DE LA INSTITUCIÓN]',
  correo: '[correo@institucion.pe]',
  telefono: '916468701',
}

export const ACTUALIZADO = '25 de septiembre de 2026'

export const DOCUMENTOS = {
  privacidad: {
    titulo: 'Política de privacidad',
    emoji: '🔒',
    resumen: 'Qué datos tuyos guardamos, para qué y cómo pedir que los borremos.',
    secciones: [
      {
        titulo: 'Quién guarda tus datos',
        parrafos: [
          `ESCALA es una aplicación de capacitación de ${RESPONSABLE.institucion}. Esa institución es la responsable de tus datos y a ella puedes escribirle a ${RESPONSABLE.correo} o por WhatsApp al ${RESPONSABLE.telefono}.`,
        ],
      },
      {
        titulo: 'Qué guardamos',
        parrafos: [
          'El nombre o apodo con el que entras y el nombre de tu emprendimiento.',
          'Tu DNI o carné de extranjería, que usas como clave. Se guarda cifrado: sirve solo para comprobar que eres tú y nadie puede leerlo, ni el facilitador.',
          'Los números de tu negocio: tu presupuesto, tus costos, tu precio, tu meta, tu flujo de caja, tu control de caja, tu inventario y tus productos.',
          'Lo que escribes en tu marca: tu frase, a quién le vendes, tus palabras y la foto o logo que subas.',
          'Qué lecciones terminaste.',
        ],
      },
      {
        titulo: 'Para qué los usamos',
        parrafos: [
          'Para mostrarte tus propios números cada vez que entras, desde cualquier celular.',
          'Para saber, en conjunto y sin nombres, en qué parte de la app la gente se traba y así mejorarla.',
          'No usamos tus datos para publicidad ni se los vendemos a nadie.',
        ],
      },
      {
        titulo: 'Dónde están',
        parrafos: [
          'En servidores de Supabase (Amazon Web Services, en Sudamérica) y en el navegador de tu propio celular, para que la app siga funcionando si se corta el internet.',
          'Solo tú puedes ver tus datos: la base de datos está configurada para que cada cuenta acceda únicamente a lo suyo.',
        ],
      },
      {
        titulo: 'Cuánto tiempo',
        parrafos: [
          'Mientras uses la app o hasta que pidas que se borre tu cuenta.',
          'Si borras la app de tu celular, tus datos siguen en el servidor hasta que pidas eliminarlos.',
        ],
      },
      {
        titulo: 'Tus derechos',
        parrafos: [
          'Puedes pedir ver, corregir o borrar tus datos, y puedes oponerte a que los sigamos usando. Son los derechos que te da la Ley 29733 de Protección de Datos Personales del Perú.',
          `Para pedirlo, escribe a ${RESPONSABLE.correo} o por WhatsApp al ${RESPONSABLE.telefono}. Te responderemos en un plazo razonable y sin costo.`,
          'Dentro de la app también puedes cambiar tú misma o tú mismo el nombre de tu emprendimiento, tu rubro, tus números y tu foto.',
        ],
      },
      {
        titulo: 'Cuidados',
        parrafos: [
          'Tu clave es tu DNI, que no es un dato secreto: no compartas con nadie con qué nombre entras.',
          'Si usas un celular prestado o compartido, cierra tu sesión desde "Mi cuenta" → "Salir de mi cuenta".',
        ],
      },
      {
        titulo: 'Cambios',
        parrafos: [`Si esta política cambia, actualizaremos la fecha de arriba y te avisaremos en la app. Última actualización: ${ACTUALIZADO}.`],
      },
    ],
  },

  terminos: {
    titulo: 'Términos y condiciones',
    emoji: '📄',
    resumen: 'Para qué sirve ESCALA, qué no es, y qué esperamos de quien la usa.',
    secciones: [
      {
        titulo: 'Qué es ESCALA',
        parrafos: [
          'Es una herramienta educativa para acompañar la capacitación en costos y manejo del dinero. Te ayuda a calcular y ordenar los números de tu negocio.',
        ],
      },
      {
        titulo: 'Qué no es',
        parrafos: [
          'ESCALA no es asesoría contable, tributaria, legal ni financiera. Sus cálculos, ejemplos y precios sugeridos son referenciales y sirven para aprender.',
          'La información sobre formalización, el Nuevo RUS y los préstamos es orientativa y puede cambiar: antes de decidir, confirma en la SUNAT, la SBS o con una persona profesional.',
          'Las decisiones sobre tu negocio, tus precios y tus deudas son tuyas.',
        ],
      },
      {
        titulo: 'Tus números',
        parrafos: [
          'Los resultados dependen de lo que escribas. Si un dato está mal, el resultado también.',
          'Guarda tus números importantes también fuera de la app: puedes enviarte el resumen por WhatsApp o tomarle captura.',
        ],
      },
      {
        titulo: 'Tu cuenta',
        parrafos: [
          'Tu cuenta es personal. No entres a la cuenta de otra persona ni le des la tuya.',
          'No uses la app para subir contenido de otras personas sin permiso, ni contenido ofensivo o ilegal.',
        ],
      },
      {
        titulo: 'Disponibilidad',
        parrafos: [
          'ESCALA es gratuita y se ofrece tal como está, dentro del programa de capacitación. Puede haber momentos sin servicio por mantenimiento o por fallas de internet.',
          'Hacemos lo posible por cuidar tu información, pero ningún sistema es infalible.',
        ],
      },
      {
        titulo: 'Contacto',
        parrafos: [`Cualquier duda o reclamo: ${RESPONSABLE.correo} o WhatsApp ${RESPONSABLE.telefono}. Última actualización: ${ACTUALIZADO}.`],
      },
    ],
  },
}
