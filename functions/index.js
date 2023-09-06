/* eslint-disable object-curly-spacing */
const functions = require("firebase-functions");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const cors = require("cors")({origin: true});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

exports.socketServer = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    console.log("server start");

    app.use(express.static(__dirname + "/public"));

    const users = {};

    const getRandomColor = () => Math.floor(Math.random() * 16777215)
        .toString(16);
    io.on("connection", (client) => {
      console.log(client.handshake.query.token);
      console.log("connected client");

      const broadcast = (eventName, data) => {
        client.emit(eventName, data); // emit event to particular client
        client.broadcast.emit(eventName, data);
      };

      client.on("newUser", (name) => {
        users[client.id] = { name, color: getRandomColor() };
        broadcast("users", users);
      });

      client.on("message", (message) => {
        // nickname of user has changed
        if (users[client.id].name !== message.name) {
          // changing in users
          users[client.id].name = message.name;
          // letting all clients know that the name changed
          broadcast("users", users);
        }
        // send over a chat message
        broadcast("message", { ...message, color: users[client.id].color });
      });

      client.on("newMessage", (message) => {
        io.emit("message", message);
      });

      client.on("disconnect", () => {
        delete users[client.id];
        client.broadcast.emit("users", users);
      });
    });

    exports.socket = functions.https.onRequest(app);
  });
});
