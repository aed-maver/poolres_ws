'use strict';
const express = require('express');
const { Server } = require('ws');
const axios = require('axios');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });
let users = [];

wss.on('connection', (ws) => {
  console.log('Client connected');
  users.push(ws);
  ws.on('message', (message) => {

      console.log(`Message is: ${message}`);
      message = JSON.parse(message);

      if(message.title === 'userAddSocket') {

        let userIndex = users.indexOf(ws);
        users[userIndex].id = message.data.userId;
        console.log('users are: ', users);

      } else {

        wss.clients.forEach(client => {

          if(client !== ws && client.readyState === ws.OPEN) {
            //client.send(message.toString());
            client.send(JSON.stringify(message));
          }

        })
      }

  });
  ws.on('close', () => {
    let url = 'https://www.aedmaver.pl/apiPoolres/api.php';
    //let url = 'http://localhost:80/apiPoolres/api.php';
    console.log('Client disconnected');
    const itemIndex = users.indexOf(ws);
    let data = { source: `DELETE FROM islogged WHERE isLoggedUserId=${users[itemIndex].id}`};
    axios.post(url, data, {
      Headers: {'Content-Type': 'application/json'}
    }).
    then(data => {});
    users.splice(itemIndex, 1);
    //console.log(users);
    
  });
});
