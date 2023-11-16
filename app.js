'use strict';

import { getAuth } from 'firebase/auth';

var admin = require('firebase-admin');

// const firebaseConfig = {
//   apiKey: "AIzaSyDNJy2JDwd9-Zkf3U3d6N47YFVUwrY_QLQ",
//   authDomain: "comp-3504-test-402923.firebaseapp.com",
//   projectId: "comp-3504-test-402923",
//   storageBucket: "comp-3504-test-402923.appspot.com",
//   messagingSenderId: "265241014816",
//   appId: "1:265241014816:web:21a60b96ecabf182f10245",
//   measurementId: "G-SN6VZ19VND"
// }

const serviceAccount = require('./firebase-admin.json');
const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const express = require('express');
const cors = require('cors');

const app = express();
app.use(
  cors({
    origin: null
  })
);



app.use(express.json());

app.use((req, res, next) => {
  res.set('Content-Type', 'application/json');
  next();
});

const startServer = async _ => {

  const database = require("./src/database");
  let db = await database.setup();

  const routes = require('./src/routes');
  routes.register(app, db, firebaseApp);

  const PORT = process.env.PORT || 8080;
  const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
  process.on('unhandledRejection', err => {
    console.error(err);
    throw err;
  });

  return server;
}

startServer()