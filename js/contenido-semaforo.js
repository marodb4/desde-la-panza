// Semáforo de alimentos (sección 7: `contenido-comidas-6-a-12-meses`).
// Primer borrador: antes de lanzar, confirmar con una nutricionista o
// pediatra (sección 7 ya marca varios de estos como "a confirmar": acelga y
// espinaca antes del año, desde cuándo yogur y quesos, soja hasta los 2 años).

export const ALIMENTOS = [
  { nombre: "Miel", estado: "no", etiqueta: "NO antes del año", porque: "Riesgo de botulismo. Ni en la comida ni en el chupete." },
  { nombre: "Sal, caldos en cubito y sopas de sobre", estado: "no", etiqueta: "NO antes del año", porque: "Sus riñones todavía son inmaduros." },
  { nombre: "Azúcar y dulces", estado: "no", etiqueta: "NO antes del año", porque: "Su gusto se está formando: mejor sin endulzar." },
  { nombre: "Leche de vaca (en mamadera)", estado: "no", etiqueta: "NO antes del año", porque: "Le puede quitar hierro. Si no toma pecho, seguí con fórmula." },
  { nombre: "Té, mate y mate cocido", estado: "no", etiqueta: "NO antes del año", porque: "Disminuyen la absorción del hierro." },
  { nombre: "Jugos (incluso caseros)", estado: "no", etiqueta: "NO antes del año", porque: "Mejor la fruta entera: el jugo es azúcar sin fibra." },
  { nombre: "Gaseosas", estado: "no", etiqueta: "NO antes del año", porque: "Solo azúcar y nada de nutrientes." },
  { nombre: "Embutidos y fiambres", estado: "no", etiqueta: "NO antes del año", porque: "Tienen mucha sal y conservantes." },
  { nombre: "Frutos secos enteros", estado: "no", etiqueta: "NO en esta etapa", porque: "Riesgo de atragantamiento. Molidos o en pasta sí, desde los 6 meses." },
  { nombre: "Uvas enteras", estado: "no", etiqueta: "NO enteras", porque: "Riesgo de atragantamiento. Cortalas siempre en 4, a lo largo." },
  { nombre: "Palomitas de maíz", estado: "no", etiqueta: "NO en esta etapa", porque: "Riesgo de atragantamiento." },

  { nombre: "Huevo", estado: "cuidado", etiqueta: "Con cuidado desde los 6 meses", porque: "Bien cocido (clara y yema). Empezá con poquita cantidad por si da alergia." },
  { nombre: "Pescado", estado: "cuidado", etiqueta: "Con cuidado desde los 6 meses", porque: "Sin espinas, bien revisado, de a poco por si da alergia." },
  { nombre: "Maní y frutos secos molidos", estado: "cuidado", etiqueta: "Con cuidado desde los 6 meses", porque: "Solo molidos o en pasta, nunca enteros. De a poco por la alergia." },
  { nombre: "Yogur y quesos", estado: "cuidado", etiqueta: "Con cuidado desde los 6-7 meses", porque: "En poca cantidad, y no reemplazan la leche materna o de fórmula." },
  { nombre: "Trigo, avena y otros con gluten", estado: "cuidado", etiqueta: "Con cuidado desde los 6 meses", porque: "Se va introduciendo de a poco, sin apuro ni demora." },
  { nombre: "Soja", estado: "cuidado", etiqueta: "Con cuidado", porque: "Se recomienda con moderación. Consultá con tu pediatra la cantidad." },
  { nombre: "Acelga y espinaca", estado: "cuidado", etiqueta: "Con cuidado, en poca cantidad", porque: "No en exceso por los nitratos naturales que tienen." },
  { nombre: "Frutillas y cítricos", estado: "cuidado", etiqueta: "Con cuidado desde los 6-7 meses", porque: "De a poco, por si irritan o dan alergia." },
  { nombre: "Dulce de leche", estado: "no", etiqueta: "NO antes del año", porque: "Es azúcar: mejor esperar a que termine de formarse el gusto por lo dulce." },

  { nombre: "Zapallo", estado: "si", etiqueta: "Sí, desde los 6 meses", porque: "Fácil de digerir y de puré." },
  { nombre: "Zanahoria", estado: "si", etiqueta: "Sí, desde los 6 meses", porque: "Cocida y en puré o bastones blandos." },
  { nombre: "Batata", estado: "si", etiqueta: "Sí, desde los 6 meses", porque: "Buena fuente de energía." },
  { nombre: "Banana", estado: "si", etiqueta: "Sí, desde los 6 meses", porque: "Blanda y fácil de aplastar con un tenedor." },
  { nombre: "Palta", estado: "si", etiqueta: "Sí, desde los 6 meses", porque: "Buena fuente de grasas saludables." },
  { nombre: "Manzana y pera", estado: "si", etiqueta: "Sí, desde los 6 meses", porque: "Cocidas, ralladas o en trocitos blandos según cómo coma." },
  { nombre: "Arroz y fideos", estado: "si", etiqueta: "Sí, desde los 6 meses", porque: "Bien cocidos y blandos." },
  { nombre: "Carne vacuna y pollo", estado: "si", etiqueta: "Sí, desde los 6 meses", porque: "Clave para el hierro. Bien cocida y triturada o desmenuzada." },
  { nombre: "Legumbres (lentejas, porotos)", estado: "si", etiqueta: "Sí, desde los 6 meses", porque: "Buena fuente de hierro. Bien cocidas y sin piel." },
];

export function buscarAlimentos(texto, filtro) {
  const normalizado = (s) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  const textoBuscado = normalizado(texto || "");

  return ALIMENTOS.filter((a) => {
    const coincideTexto = !textoBuscado || normalizado(a.nombre).includes(textoBuscado);
    const coincideFiltro = filtro === "todos" || a.estado === filtro;
    return coincideTexto && coincideFiltro;
  });
}
