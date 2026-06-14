// Test de carga de la landing de Caxandra con k6.
// Mide latencia y errores mientras sube el número de usuarios simultáneos.
//
// Correr:  k6 run stress-test.js
// Apuntar a otra URL:  BASE_URL=https://caxandra.com k6 run stress-test.js

import http from 'k6/http'
import { check, sleep } from 'k6'

const BASE_URL = __ENV.BASE_URL || 'https://caxandra.com'

export const options = {
  // "Escalera" de usuarios: sube, sostiene, sube más, y baja.
  stages: [
    { duration: '30s', target: 20 }, // calienta: 0 -> 20 usuarios
    { duration: '1m', target: 20 },  // sostiene 20
    { duration: '30s', target: 50 }, // aprieta: 20 -> 50
    { duration: '1m', target: 50 },  // sostiene 50
    { duration: '30s', target: 0 },  // enfría
  ],
  // Umbrales: si no se cumplen, k6 marca el test como FALLIDO.
  thresholds: {
    http_req_failed: ['rate<0.01'],          // menos del 1% de errores
    http_req_duration: ['p(95)<1500'],       // el 95% responde en < 1.5s
  },
}

export default function () {
  // Cada usuario virtual visita la home (la ruta de más concurrencia).
  const res = http.get(BASE_URL)

  check(res, {
    'status 200': (r) => r.status === 200,
    'trae la marca Caxandra': (r) => (r.body ?? '').includes('CAX'),
  })

  // Pausa como haría una persona real antes de la siguiente acción.
  sleep(1)
}