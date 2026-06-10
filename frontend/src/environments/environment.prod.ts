// Entorno de producción (usado por `ng build`, vía fileReplacements en angular.json)
// Railway: cambia apiUrl por la URL pública del backend,
// p. ej. 'https://<backend>.up.railway.app/api'
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8000/api',
};
