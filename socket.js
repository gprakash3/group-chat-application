const express = require('express');
const app = express();
const http = require('http');     
const server = http.createServer(app); 
const { Server } = require("socket.io");  
const io = new Server(server);  

const {instrument} = require('@socket.io/admin-ui');


io.on('connection', (socket) => {
  console.log('a user connected');
  console.log(socket.id);
});

module.exports = {
  getIo: (server) => {
    const io = new Server(server);
    io.on("connection", (socket) => {
      console.log('a user connected');
      console.log(socket.id);

      socket.on('send-message-commongroup', (message) =>{
        console.log(message);
        socket.broadcast.emit('receive-message-commongroup', message);
      })

      socket.on('send-message-particulargroup', (message,room) =>{
        console.log("message sending via particular group",message, room);
        socket.to(`${room}`).emit('receive-message-particulargroup', message);
        // io.emit('message', message);
      })

      socket.on('join-room', room =>{
        socket.join(room);
        console.log('joined room', room);
      });

      socket.on('new group created', message => {
        socket.broadcast.emit('updateGroupTileonAdd', message);
      })
      socket.on('user-added-in-group', (message,room) => {
        //to update the group names
        socket.to(room).emit('user_added', message);
        socket.broadcast.emit('updateGroupTileonAdd', 'update group names');
        
      })

      socket.on('user-remove-from-group', (message,room) => {
        console.log("user-remove-from-group socket.js",message, room);
        socket.to(room).emit('user_remove', message);
        socket.broadcast.emit('updategrouptileonremove', message);
      })

    });
    instrument(io,{auth:false});

    return io;
  }
}
