const { default: monk } = require('monk');
const { nanoid } = require('nanoid');
const express = require('express');
const helment = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const yup = require('yup');

require('dotenv').config(); // Removed after development - npm install --save-dev dotenv

const db = monk(process.env.MONGODB_URI);
const urls = db.get('urls');
const app = express();
const schema = yup.object().shape({
  url: yup.string().trim().url().required(),
  identifier: yup.string().trim().matches(/[\w\-]/i)
});
const notFound = "<h1><b>404</b>Unable to find url.</h1>";

urls.createIndex({ identifier: 1 }, { unique: true });

app.use(express.static('./public'));
app.use(express.json());
app.use(morgan('tiny'));
app.use(helment());
app.use(cors());

app.get('/:id',
  async function (req, res) {
    const { id } = req.params;
    try {
      const entry = await urls.findOne({ identifier: id });
      if (entry)
        res.redirect(entry.url);
      else
        res.status(404).send(notFound);
    }
    catch (error) {
      return res.status(404).send(notFound);
    }
  });

app.post('/new',
  // TODO: Implement some sort of rate limit
  async function (req, res, error) {
    let { id, url } = req.body;
    try {
      await schema.validate({ identifier: id, url });
      if (!id) {
        let valid = false;
        while (!valid) {
          id = nanoid(7);
          const exists = await urls.findOne({ identifier: id });
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
    res.status(404).send(notFound);
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