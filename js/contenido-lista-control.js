// "Lista para el control": hitos (estilo CDC 2022), preguntas sugeridas y
// señales de alarma, para los controles de los meses 2, 4, 6, 9 y 12
// (sección 5.2 y 7: `contenido-estimulacion-0-a-12-meses`).
// Primer borrador: confirmar con una pediatra antes de lanzar. Los hitos se
// presentan siempre con la aclaración de que cada bebé tiene su ritmo, para
// no asustar ni comparar.

export const CONTROLES = [
  {
    mes: 2,
    proporcion: "la mayoría de los bebés",
    hitos: [
      "Sonríe cuando le hablás o le sonreís",
      "Se calma cuando lo/la alzás o le hablás",
      "Mira tu cara",
      "Parece prestarte atención desde lejos",
      "Mueve los dos ojos juntos, hacia el mismo lado",
      "Reacciona a los ruidos fuertes",
      "Levanta un poco la cabeza boca abajo",
      "Mueve brazos y piernas parejo de los dos lados",
    ],
    preguntas: [
      "¿Cómo viene el aumento de peso?",
      "¿Hace falta algún suplemento (vitamina D, hierro)?",
      "¿Cómo seguimos con la lactancia o la fórmula?",
    ],
  },
  {
    mes: 4,
    proporcion: "3 de cada 4 bebés",
    hitos: [
      "Sonríe solo para llamarte",
      "Se ríe bajito",
      'Hace sonidos como "ooo" y "aaa"',
      "Gira la cabeza hacia tu voz",
      "Agarra un juguete",
      "Se lleva las manos a la boca",
      "Empuja con las piernas al estar parado sobre una superficie firme",
      "Sostiene bien la cabecita",
    ],
    preguntas: [
      "¿Cuándo empezamos con las comidas?",
      "¿Es normal que todavía no duerma toda la noche?",
      "¿Hace falta protector solar?",
    ],
  },
  {
    mes: 6,
    proporcion: "la mayoría de los bebés",
    hitos: [
      "Conoce las caras familiares",
      "Le gusta mirarse al espejo",
      "Se ríe fuerte",
      "Hace sonidos de ida y vuelta con vos (como una charla)",
      "Responde a su propio nombre, a veces",
      "Se lleva cosas a la boca",
      "Pasa un juguete de una mano a la otra",
      "Se da vuelta de panza a espalda",
    ],
    preguntas: [
      "¿Cómo seguimos con las comidas?",
      "¿Qué alimentos puede empezar a probar?",
      "¿Cuándo empezamos con la antigripal?",
    ],
  },
  {
    mes: 9,
    proporcion: "la mayoría de los bebés",
    hitos: [
      "Tiene algo de miedo o vergüenza con los extraños",
      "Se pone contento/a al ver gente conocida",
      'Reacciona cuando le decís "no"',
      'Hace sonidos como "mamamama" o "papapapa"',
      "Levanta los brazos para que lo/la alces",
      "Se sienta solo/a",
      "Se arrastra o gatea",
      "Se para agarrado/a de algo",
    ],
    preguntas: [
      "¿Está bien el desarrollo motor?",
      "¿Puede comer lo mismo que el resto de la familia?",
      "¿Cuándo dejamos el chupete?",
    ],
  },
  {
    mes: 12,
    proporcion: "la mayoría de los bebés",
    hitos: [
      "Juega a las escondidas (taparse y destaparse)",
      'Dice "mamá" o "papá" dirigido a alguien',
      'Entiende un "no"',
      "Hace algún gesto, como saludar con la mano",
      "Señala cosas que le interesan",
      "Se para solo/a un instante",
      "Camina agarrado/a de los muebles",
      "Toma objetos chiquitos con dos dedos",
    ],
    preguntas: [
      "¿Cómo seguimos con la leche de vaca?",
      "¿Cuándo pasa a la cuna o a la cama?",
      "¿Qué actividades le convienen ahora?",
    ],
  },
];

export const CUANDO_CONSULTAR_SIN_ESPERAR = [
  "Fiebre",
  "No se alimenta bien o rechaza el pecho o la mamadera",
  "Está muy decaído/a o duerme mucho más de lo habitual",
  "Vómitos o diarrea que no paran",
  "Dificultad para respirar o respiración muy agitada",
  "Llanto que no se calma de ninguna manera",
];

export function controlPorMes(mes) {
  return CONTROLES.find((c) => c.mes === mes) || null;
}

export function tieneListaParaElControl(mes) {
  return CONTROLES.some((c) => c.mes === mes);
}
