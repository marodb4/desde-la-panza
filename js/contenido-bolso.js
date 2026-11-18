// Checklist del bolso de maternidad, en 6 grupos (sección 5.2 y 7:
// `contenido-bolso-maternidad`). Primer borrador orientativo: cada
// maternidad pide cosas distintas (como ya dice la propia pantalla).

export const GRUPOS_BOLSO = [
  {
    id: "documentos",
    nombre: "Documentos",
    duplicaConMellizos: false,
    items: [
      "DNI",
      "Credencial de obra social o prepaga",
      "Carnet perinatal o libreta del embarazo",
      "Análisis y ecografías",
      "Grupo y factor sanguíneo",
      "Resultado del estreptococo B",
      "Carnet de vacunas",
      "Teléfono de tu obstetra y de tu acompañante",
    ],
  },
  {
    id: "bebe-ropa",
    nombre: "Para el bebé: ropa",
    duplicaConMellizos: true,
    items: [
      "3 o 4 bodys (talle RN y 1)",
      "3 o 4 enteritos o mamelucos",
      "2 pares de medias o patucos",
      "1 o 2 gorritos",
      "1 campera o saquito abrigado",
      "2 mantillas o mantas",
      "Manoplas (para que no se rasguñe)",
      "Ropa especial para la salida",
    ],
  },
  {
    id: "bebe-higiene",
    nombre: "Para el bebé: higiene",
    duplicaConMellizos: true,
    items: [
      "Pañales talle recién nacido (1 paquete)",
      "Toallitas húmedas",
      "Crema para la colita",
      "Gasas y alcohol para el cordón",
      "Cepillo o peine suave",
      "Termómetro",
    ],
  },
  {
    id: "mama-ropa",
    nombre: "Para vos: ropa",
    duplicaConMellizos: false,
    items: [
      "Camisón o ropa cómoda para amamantar",
      "Bata o salida de baño",
      "Pantuflas",
      "Ropa interior cómoda (varias)",
      "Protectores de lactancia",
      "Corpiño de lactancia",
      "Ropa para la vuelta a casa (talle embarazo)",
    ],
  },
  {
    id: "mama-aseo",
    nombre: "Para vos: aseo y otros",
    duplicaConMellizos: false,
    items: [
      "Cepillo de dientes y pasta",
      "Shampoo y jabón",
      "Toallas específicas para el posparto",
      "Cargador del celular",
      "Algo para comer o tomar durante el trabajo de parto",
      "Almohada de lactancia (si usás)",
    ],
  },
  {
    id: "parto-vuelta",
    nombre: "Para el parto y la vuelta a casa",
    duplicaConMellizos: false,
    items: [
      "Butaca para el auto (es obligatoria para volver)",
      "Celular cargado, para fotos",
      "Algo para relajarte (música, lectura)",
      "Efectivo chico (cochera, kiosco)",
      "Un bolso aparte para tus cosas de valor",
    ],
  },
];
