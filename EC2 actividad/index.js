const http = require('http');

const calificaciones = [4.5, 3.5, 2.5, 4.0];
const NOTA_MINIMA = 3.0

function respuesta(res, codigo, datos) {
    res.writeHead(codigo, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(datos, null));
}

function calcularPromedio(notas) {
    return notas.reduce((suma, n) => suma + n, 0) / notas.length;
}

function estaAprobado(promedio) { return promedio >= NOTA_MINIMA; }

const s = http.createServer((req, res) => {

    if (req.url === '/salud') {
        return respuesta(res, 200, { estado: 'ok' });
    }

    if (req.url === '/equipo') {
        return respuesta(res, 200, { equipo: 'Equipo 67', integrantes: ['Daniel Maldonado', 'Juan Gonzalez', 'Juan Turizo'] });
    }

    if (req.url === '/notas') {
        let promedio = calcularPromedio(calificaciones)

        return respuesta(res, 200, { promedio: promedio, aprobado: estaAprobado(promedio) });
    }

    respuesta(res, 404, { error: 'Ruta no encontrada' });
});

s.listen(80);
