"use strict";
// Para hacer este server he usado lo que explican aqui
// ttps://www.digitalocean.com/community/tutorials/setting-up-a-node-project-with-typescript
// Me interesaba hacerlo en Typescript
// No obstante, el server que explican en ese tutorial no usa sockets.
// He usado tambien la info que hay aqui:
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const enviarEmail_1 = require("./enviarEmail");
const peticionesAPI_1 = require("./peticionesAPI");
// tslint:disable-next-line:ordered-imports
const socket_io_1 = __importDefault(require("socket.io"));
// const configMensaje = require('./);
const cors = require('cors');
const bodyParser = require('body-parser');
// const configMensaje = require('./configMensaje');
const app = express_1.default();
app.use(bodyParser.json());
app.use(cors());
const server = new http_1.default.Server(app);
const io = socket_io_1.default(server);
const peticionesAPI = new peticionesAPI_1.PeticionesAPIService();
const enviarEmail = new enviarEmail_1.EnviarEmailService();
const port = 8080;
let dashSocket;
let conectados = [];
let listaNotificacionesJuegos = [];
// try {
//     axios.get().then ((respuesta) => {
//       console.log (respuesta.data);
//     });
// } catch {
//     console.log ("Error");
// }
const host = "http://147.83.118.92";
const APIUrlProfesores = host + ":3000/api/Profesores";
const APIUrlAlumnos = host + ":3000/api/Alumnos";
const APIUrlGrupos = host + ":3000/api/Grupos";
const APIUrlMatriculas = host + ":3000/api/Matriculas";
const APIUrlEquipos = host + ":3000/api/Equipos";
io.on("connection", (socket) => {
    console.log("user connected");
    console.log("Conectados:  ");
    console.log(conectados);
    socket.on("forceDisconnect", () => {
        socket.disconnect();
    });
    socket.on("desconectarJuegoCogerTurno", (clave) => {
        listaNotificacionesJuegos = listaNotificacionesJuegos.filter((elem) => elem.clave !== clave);
    });
    socket.on("dash", (message) => {
        console.log("Se ha conectado el dashboard");
        dashSocket = socket;
    });
    socket.on("usuarioConectado", (conectado) => {
        console.log("Se conecta:  " + conectado.Nombre + " " + conectado.PrimerApellido);
        conectados.push({ id: conectado.id, soc: socket });
        console.log("Conectados:  ");
        console.log(conectados);
    });
    socket.on("recordarContraseña", (datos) => {
        peticionesAPI.EnviarEmail(datos.email, datos.nombre, datos.contrasena);
    });
    socket.on("respuestaJuegoDeCuestionario", (alumno) => {
        console.log("Notifica respuesta a juego de cuestionario el alumno " + alumno.id);
        dashSocket.emit("respuestaJuegoDeCuestionario", alumno);
    });
    socket.on("modificacionAvatar", (res) => {
        console.log("Notifica cambio en avatar ", res);
        dashSocket.emit("modificacionAvatar", res);
    });
    socket.on("notificarVotacion", (res) => {
        console.log("Notifica votacion ");
        dashSocket.emit("notificarVotacion", res);
    });
    socket.on("notificarVotaciones", (res) => {
        console.log("Notifica votaciones ");
        dashSocket.emit("notificarVotaciones", res);
    });
    socket.on("nickNameJuegoRapido", (nick) => {
        console.log("Recibo Nick: " + nick);
        dashSocket.emit("nickNameJuegoRapido", nick);
    });
    // Esto es cuando el movil va a recibir notificaciones
    socket.on("nickName+claveJuegoRapido", (datos) => {
        console.log("Recibo Nick: " + datos.n);
        dashSocket.emit("nickNameJuegoRapido", datos.n);
        // guardo el socket y la clave del juego
        listaNotificacionesJuegos.push({ soc: socket, c: datos.c });
    });
    socket.on("respuestaEncuestaRapida", (respuesta) => {
        console.log("Respuesta encuesta rapida de: " + respuesta.nick);
        dashSocket.emit("respuestaEncuestaRapida", respuesta);
    });
    socket.on("respuestaVotacionRapida", (respuesta) => {
        console.log("Respuesta encuesta rapida de: " + respuesta.nick);
        dashSocket.emit("respuestaVotacionRapida", respuesta);
    });
    socket.on("respuestaCuestionarioRapido", (respuesta) => {
        console.log("Respuesta cuestionario rapido de: " + respuesta.nick);
        dashSocket.emit("respuestaCuestionarioRapido", respuesta);
    });
    socket.on("turnoElegido", (info) => {
        console.log("Turno recibido");
        console.log(info);
        dashSocket.emit("turnoElegido:" + info.clave, info);
    });
    socket.on("usuarioDesconectado", (conectado) => {
        console.log("Se desconecta:  " + conectado.Nombre + " " + conectado.PrimerApellido);
        conectados = conectados.filter((con) => con.id !== conectado.id);
        console.log("Conectados:  ");
        console.log(conectados);
    });
    socket.on("'disconnect'", (res) => {
        console.log("Se desconecta el cliente ");
    });
    // Notificaciones para los alumnos
    // Notificación para alumnos de un juego rápido
    socket.on("notificacionTurnoCogido", (info) => {
        console.log("Recibo notificacion para juego rapido ", info.clave);
        // Saco los elementos de la lista correspondientes a los jugadores conectados a ese juego rápido
        const conectadosJuegoRapido = listaNotificacionesJuegos.filter((elem) => elem.c === info.clave);
        conectadosJuegoRapido.forEach((conectado) => {
            conectado.soc.emit("turnoCogido", info.turno);
        });
    });
    // Notificación para alumnos de un juego rápido
    socket.on("notificacionTurnoNuevo", (info) => {
        console.log("Recibo notificacion para juego rapido ", info.clave);
        // Saco los elementos de la lista correspondientes a los jugadores conectados a ese juego rápido
        const conectadosJuegoRapido = listaNotificacionesJuegos.filter((elem) => elem.c === info.clave);
        conectadosJuegoRapido.forEach((conectado) => {
            conectado.soc.emit("turnoNuevo", info.turno);
        });
    });
    // Notificación para un alumno
    socket.on("notificacionIndividual", (info) => {
        console.log("Recibo notificacion para alumno ", info);
        const conectado = conectados.filter((con) => con.id === info.alumnoId)[0];
        if (conectado !== undefined) {
            console.log("envio notificación al alumno " + info.alumnoId);
            conectado.soc.emit("notificacion", info.mensaje);
        }
    });
    // Notificaciones para los alumnos de un equipo
    socket.on("notificacionEquipo", (info) => {
        console.log("Recibo notificacion para equipo ", info);
        peticionesAPI.DameAlumnosEquipo(info.equipoId)
            .then((res) => {
            const alumnos = res.data;
            console.log("Alumnos del equipo");
            console.log(alumnos);
            alumnos.forEach((alumno) => {
                const conectado = conectados.filter((con) => con.id === alumno.id)[0];
                if (conectado !== undefined) {
                    console.log("envio notificación al alumno " + alumno.id);
                    conectado.soc.emit("notificacion", info.mensaje);
                }
            });
        }).catch((error) => {
            console.log("error");
            console.log(error);
        });
    });
    // Notificaciones para los alumnos de un grupo
    socket.on("notificacionGrupo", (info) => {
        console.log("Recibo notificacion para el grupo ", info);
        peticionesAPI.DameAlumnosGrupo(info.grupoId)
            .then((res) => {
            const alumnos = res.data;
            console.log("Alumnos del grupo");
            console.log(alumnos);
            alumnos.forEach((alumno) => {
                const conectado = conectados.filter((con) => con.id === alumno.id)[0];
                if (conectado !== undefined) {
                    console.log("envio notificación al alumno " + alumno.id);
                    conectado.soc.emit("notificacion", info.mensaje);
                }
            });
        }).catch((error) => {
            console.log("error");
            console.log(error);
        });
    });
});
server.listen(port, () => {
    console.log(`started on port: ${port}`);
});
//# sourceMappingURL=app.js.map