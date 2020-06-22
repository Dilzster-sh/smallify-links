const rateLimit = require('express-rate-limit');
const { default: monk } = require('monk');
const endpoints = require('./endpoints');
const { nanoid } = require('nanoid');
const express = require('express');
const helment = require('helmet');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const yup = require('yup');

require('dotenv').config(); // development only

const db = monk(process.env.MONGODB_URI);
const urls = db.get('urls');
const app = express();
const schema = yup.object().shape({
  url: yup.string().trim().url().required(),
  identifier: yup.string().trim().matches(/[\w\-]/i)
});

urls.createIndex({ identifier: 1 }, { unique: true });

app.use(express.static('./public'));
app.use(express.json());
app.use(morgan('tiny'));
app.use(helment());
app.use(cors());
app.use('/api', rateLimit({
  windowMs: (15e+3),
  max: 1 // 1 request per 15 seconds
}));

const notFound = path.join(__dirname, 'public', '404.html');

// Endpoint: '/api'

app.get('/api',
  async function (req, res) {
    // Return help for API
    res.status(200).json({
      message: 'OK',
      data: endpoints
    });
  });

app.get('/:id',
  async function (req, res) {
    const { id } = req.params;
    try {
      const entry = await urls.findOne({ identifier: id });
      if (!entry) throw new Error('not found');
      else res.redirect(entry.url);
    }
    catch (error) {
      res.status(404)
        .sendFile(notFound);
    }
  });

app.post('/api/create',
  async function (req, res, error) {
    let { id = nanoid(7), url } = req.body;
    try {
      await schema.validate({ identifier: id, url });

      let exists = await urls.findOne({ identifier: id });
      if (exists) {
        let valid = false;
        while (valid == false) {
          id = nanoid(7);
          exists = await urls.findOne({ identifier: id });
          if (!exists) valid = true;
        }
      }

      id = id.toLowerCase();
      const newEntry = { url, identifier: id };
      const created = await urls.insert(newEntry);
      res.status(200).json(created);
    }
    catch (error) {
      next(error);
    }
  });

app.use(
  function (req, res, next) {
    res.status(404)
      .sendFile(notFound);
  });

app.use(
  function (error, req, res, next) {
    res.status(error.status ? error.status : 500);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV == "production" ? '🗄' : error.stack
    });
  });

const server = app.listen(process.env.PORT,
  function () {
    console.log("Listening on port: %d", server.address().port);
  });