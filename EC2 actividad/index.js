const http = require('http');

const d = [4.5, 3.5, 2.5, 4.0];

function respuesta(res, codigo, datos) {
    res.writeHead(codigo, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(datos, null));
}

function procesarNotas() {
        let t = 0;
        for (let i = 0; i < d.length; i++) { t = t + d[i]; }
        let p = t / d.length;
        return p;
}

const s = http.createServer((req, res) => {

    if (req.url === '/salud') {
        return respuesta(res, 200, { estado: 'ok' });
    }

    if (req.url === '/equipo') {
        return respuesta(res, 200, { equipo: 'Equipo 67', integrantes: ['Daniel Maldonado', 'Juan Gonzalez', 'Juan Turizo'] });
    }

    if (req.url === '/notas') {
        let p = procesarNotas()

        return respuesta(res, 200, { promedio: p, aprobado: p >= 3.0 });
    }

    respuesta(res, 404, { error: 'Ruta no encontrada' });
});

s.listen(80);
