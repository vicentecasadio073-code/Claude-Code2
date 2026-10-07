/**
 * TODOS los textos y datos del server están acá.
 *
 * Marcado de colores dentro de los textos:
 *   *palabra*  -> rojo (acento principal)
 *   ~palabra~  -> amarillo (acento secundario)
 *   |          -> salto de línea
 *
 * Regla: máximo 6-8 palabras por pantalla.
 */
export const CONFIG = {
  server: {
    name: 'ARKEANOS',
    nameSuffix: 'WORLD',
    ip: 'play.arkeanos.lat',
    port: '25697',
    discord: 'discord.gg/7vdnV6qvER',
    javaVersions: 'Todas las versiones',
    bedrockVersions: 'Última versión',
    lives: 3,
  },

  texts: {
    // 0-3s  GANCHO
    hook: ['¿CUÁNTO', 'VAS A', '*DURAR*?'],

    // 3-8s  LOGO + cuenta regresiva
    logoKicker: '~PRESENTA~',
    countdown: ['3', '2', '1'],

    // 8-20s  MODO HARDCORE
    hardcoreKicker: 'BIENVENIDO AL',
    hardcoreTitle: ['MODO', '*HARDCORE*'],
    hardcoreSub: 'Tenés pocas vidas.',

    noProtection: {
      title: 'SIN|*PROTECCIONES*',
      sub: 'Sin claims ni bloqueos.',
    },
    raids: {
      title: 'RAIDS Y|*PvP REAL*',
      sub: 'Todo se gana ~a la antigua~.',
    },
    betrayal: {
      title: 'CADA|*TRAICIÓN*|CUENTA',
      sub: 'Confiá… si te animás.',
    },
    lives: {
      // {n} se reemplaza por las vidas que quedan
      counter: '*{n}* VIDAS',
      counterOne: '*1* VIDA',
      punch: 'SIN SEGUNDA|*CHANCE*.',
      sub: 'Si las perdés, ~quedás fuera~.',
    },

    // 20-28s  CLANES + STREAMERS (ritmo rápido)
    clans: {
      title: 'CLANES Y|~ALIANZAS~',
      sub: 'Armá tu equipo.',
    },
    dominate: {
      title: 'DOMINÁ|EL *SERVER*',
    },
    stream: {
      title: '¿HACÉS|*STREAM*?',
      rec: 'REC',
    },
    rank: {
      title: 'RANGO|~MEDIA~|GRATIS',
      sub: 'Para streamers del server.',
    },
    ready: {
      title: '¿ESTÁS|*LISTO*?',
    },

    // 28-38s  CIERRE
    ipKicker: '~ENTRÁ YA~',
    ipLabel: 'IP',
    portLabel: 'PUERTO',
    discordLabel: 'DISCORD',
    compatTitle: 'COMPATIBILIDAD',
    editionLabel: 'EDICIÓN',
    java: 'JAVA',
    bedrock: 'BEDROCK',
    cta: '~¡ENTRÁ, ARMÁ TU HISTORIA~|~Y SOBREVIVÍ!~',
  },
} as const;
