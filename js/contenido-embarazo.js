// Contenido semana a semana del embarazo (semanas 4 a 40).
// Corresponde al documento `contenido-embarazo-semana-a-semana` de la sección 7
// de instrucciones-del-proyecto.md. Es un primer borrador para que la Parte 1
// funcione de punta a punta: antes de lanzar la app hay que revisarlo con
// una profesional, igual que el resto del contenido de salud.
//
// Por diseño, el tamaño se compara con cosas de bebé (nunca con frutas).

export const SEMANAS_EMBARAZO = [
  { semana: 4, objeto: "una cuentita de sonajero", cm: 0.2, g: null, detalle: "Recién está empezando a formarse. Todavía no se ve en una ecografía." },
  { semana: 5, objeto: "un broche de chupete", cm: 0.3, g: null, detalle: "Ya le late el corazón, aunque todavía no se escuche." },
  { semana: 6, objeto: "un botón de body", cm: 0.5, g: null, detalle: "Están empezando a formarse sus bracitos y piernitas." },
  { semana: 7, objeto: "una moneda de juguete", cm: 1, g: null, detalle: "Su cerebro crece a toda velocidad." },
  { semana: 8, objeto: "una mini pinza de chupete", cm: 1.6, g: 1, detalle: "Ya tiene deditos, aunque todavía unidos." },
  { semana: 9, objeto: "un hisopo de bebé", cm: 2.3, g: 2, detalle: "Empieza a moverse, aunque todavía no lo sientas." },
  { semana: 10, objeto: "una cuenta grande de sonajero", cm: 3.1, g: 4, detalle: "Sus órganos principales ya están formados y van madurando." },
  { semana: 11, objeto: "un broche de body", cm: 4.1, g: 7, detalle: "Ya puede abrir y cerrar las manitos." },
  { semana: 12, objeto: "un chupete chico", cm: 5.4, g: 14, detalle: "Sus reflejos están empezando a aparecer." },
  { semana: 13, objeto: "un chupete", cm: 7.4, g: 23, detalle: "Termina el primer trimestre. Sus cuerdas vocales ya se están formando." },
  { semana: 14, objeto: "una media de recién nacido", cm: 8.7, g: 43, detalle: "Puede empezar a hacer gestos con la cara." },
  { semana: 15, objeto: "un guante de recién nacido", cm: 10.1, g: 70, detalle: "Ya puede percibir la luz, aunque los ojos siguen cerrados." },
  { semana: 16, objeto: "un sonajero chico", cm: 11.6, g: 100, detalle: "El corazón bombea más sangre que nunca." },
  { semana: 17, objeto: "un gorrito de bebé", cm: 13, g: 140, detalle: "Empieza a acumular la grasita que lo va a abrigar." },
  { semana: 18, objeto: "un osito chico", cm: 14.2, g: 190, detalle: "Ya puede bostezar e hipar." },
  { semana: 19, objeto: "un body doblado", cm: 15.3, g: 240, detalle: "Se están formando sus sentidos: oído, gusto y olfato." },
  { semana: 20, objeto: "un osito mediano", cm: 25.6, g: 300, detalle: "Mitad de camino. Puede que empieces a sentir sus movimientos." },
  { semana: 21, objeto: "una muñeca de trapo", cm: 26.7, g: 360, detalle: "Sus movimientos son cada vez más fuertes." },
  { semana: 22, objeto: "un osito mediano grande", cm: 27.8, g: 430, detalle: "Sus cejas y pestañas ya están formadas." },
  { semana: 23, objeto: "una almohada de lactancia chica", cm: 28.9, g: 501, detalle: "Empieza a tener ciclos de sueño y descanso." },
  { semana: 24, objeto: "un osito mediano", cm: 30, g: 600, detalle: "Sus pulmones siguen madurando." },
  { semana: 25, objeto: "un osito grande", cm: 34.6, g: 660, detalle: "Va ganando grasita bajo la piel." },
  { semana: 26, objeto: "un almohadón chico", cm: 35.6, g: 760, detalle: "Puede abrir los ojos y reaccionar a la luz." },
  { semana: 27, objeto: "un muñeco bebote chico", cm: 36.6, g: 875, detalle: "Termina el segundo trimestre." },
  { semana: 28, objeto: "un muñeco bebote mediano", cm: 37.6, g: 1005, detalle: "Parpadea y puede tener hipo seguido." },
  { semana: 29, objeto: "un almohadón de lactancia", cm: 38.6, g: 1153, detalle: "Sus huesitos ya están firmes, salvo el cráneo." },
  { semana: 30, objeto: "un bebote grande", cm: 39.9, g: 1319, detalle: "Es un buen momento para preparar el bolso de maternidad." },
  { semana: 31, objeto: "una toalla con capucha doblada", cm: 41.1, g: 1502, detalle: "Sus movimientos cambian: ahora se acomoda más que patea." },
  { semana: 32, objeto: "una bolsa de pañales llena", cm: 42.4, g: 1702, detalle: "Sigue practicando la respiración, aunque todavía no use los pulmones." },
  { semana: 33, objeto: "un moisés de juguete", cm: 43.7, g: 1918, detalle: "Sus huesitos siguen endureciéndose." },
  { semana: 34, objeto: "una mantita doblada", cm: 45, g: 2146, detalle: "La mayoría ya se acomoda con la cabeza para abajo." },
  { semana: 35, objeto: "un moisés chico", cm: 46.2, g: 2383, detalle: "Sus riñoncitos ya funcionan del todo." },
  { semana: 36, objeto: "una bolsa del hospital llena", cm: 47.4, g: 2622, detalle: "Buen momento para revisar que el bolso de maternidad esté listo." },
  { semana: 37, objeto: "un bebé recién nacido chico", cm: 48.6, g: 2859, detalle: "Ya se considera a término. Puede nacer en cualquier momento." },
  { semana: 38, objeto: "un bebé recién nacido", cm: 49.8, g: 3083, detalle: "Sigue practicando cómo respirar y succionar." },
  { semana: 39, objeto: "un bebé recién nacido", cm: 50.7, g: 3288, detalle: "Está terminando de madurar para el gran día." },
  { semana: 40, objeto: "un bebé recién nacido", cm: 51.2, g: 3462, detalle: "¡Llegó la fecha probable de parto! Puede nacer un poco antes o después." },
];

export function contenidoDeLaSemana(semana) {
  const semanaAcotada = Math.min(Math.max(semana, 4), 40);
  return SEMANAS_EMBARAZO.find((item) => item.semana === semanaAcotada) || SEMANAS_EMBARAZO[0];
}
