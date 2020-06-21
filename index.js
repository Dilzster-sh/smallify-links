const express = require('express');
const helment = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const yup = require('yup');

require('dotenv').config(); // Removed after development - npm install --save-dev dotenv

const app = express();

app.use(express.static('./public'));
app.use(express.json());
app.use(morgan('tiny'));
app.use(helment());
app.use(cors());

const server = app.listen(process.env.PORT,
  function () {
    console.log("Listening on port: %d", server.address().port);
  });