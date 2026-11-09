const http = require('http');

const d = [4.5, 3.5, 2.5, 4.0];

function respuesta(res, codigo, datos) {
    res.writeHead(codigo, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(datos, null));
}

function calcularPromedio(notas) {
    return notas.reduce((suma, n) => suma + n, 0) / notas.length;
}

function estaAprobado(promedio) { return promedio >= 3.0; }

const s = http.createServer((req, res) => {

    if (req.url === '/salud') {
        return respuesta(res, 200, { estado: 'ok' });
    }

    if (req.url === '/equipo') {
        return respuesta(res, 200, { equipo: 'Equipo 67', integrantes: ['Daniel Maldonado', 'Juan Gonzalez', 'Juan Turizo'] });
    }

    if (req.url === '/notas') {
        let p = calcularPromedio(d)

        return respuesta(res, 200, { promedio: p, aprobado: estaAprobado(p) });
    }

    respuesta(res, 404, { error: 'Ruta no encontrada' });
});

s.listen(80);
