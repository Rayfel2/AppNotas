require('dotenv').config();
const mongoose = require('mongoose');
const Notes = require('./database');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const updateRouter = require('./update-router');

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/updatepage', updateRouter);
app.use((req, res, next) => {
  const clientInfo = req.headers["user-agent"];

  const ip = req.ip;

  const queryParams = req.query;

  const requestBody = req.body;

  const logdoc = {
    client: clientInfo,
    ip: ip,
    queryParams: queryParams,
    requestBody: requestBody,
  };
  console.log(req.method + " : " + req.url);
  console.log(logdoc);
  next();
});
const port = process.env.PORT || 3000;

console.log(`Servidor en ejecución en el puerto ${port}`);


// Configurar la conexión a la base de datos MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', (err) => {
  console.error('Error de conexión a MongoDB:', err);
});
db.once('open', () => {
  console.log('Conexión a MongoDB establecida.');
});



app.get("/", (req, res, next) => {
  res.redirect("/index");
});

app
    .route('/notes-add')
    .get((req, res, next) => {
      res.render('notes-add');
    })
    .post((req, res, next) => {
      console.log(req.body);
      const Note = new Notes({});

      Note.title = req.body.title;
      Note.description = req.body.description;
      // save notes first
      Note.save((err, product) => {
        if (err) console.log(err);
        console.log(product);
      });
      res.redirect('/index');
    });

app.get('/index', (req, res, next) => {
  Notes.find({}).exec((err, document) => {
    if (err) console.log(err);
    const Data = [];
    document.forEach((value) => {
      Data.push(value);
    });
    res.render('view', {data: Data});
  });
});

app.get('/delete/:__id', (req, res, next) => {
  Notes.findByIdAndRemove(
      req.params.__id,
      {useFindAndModify: false},
      (err, document) => {
        if (err) console.log(err);
        console.log(document);
      },
  );
  res.redirect('/index');
});

app.get('/updatepage/:__id', (req, res) => {
  console.log('id for get request: ' + req.id);
  Notes.findById(req.id, (err, document) => {
    console.log(document);

    res.render('updatepage', {data: document});
  });
});

app.post('/updatepage', (req, res, next) => {
  console.log('id: ' + req.id);
  Notes.findByIdAndUpdate(
      req.id,
      {title: req.body.title, description: req.body.description},
      {useFindAndModify: false},
      (err, document) => {
        console.log('updated');
      },
  );
  res.redirect('/index');
  return next();
});

// CRUD operations for Notes schema
// Create
app.post('/api/note', (req, res, next) => {
  const {title, description} = req.body;
  const note = new Notes({title, description});
  note.save((err, note) => {
    if (err) return next(err);
    res.status(200).json({note});
  });
});

// Read
// Read by id
app.get('/api/note/:id', (req, res, next) => {
  const {id} = req.params;
  Notes.findById(id, (err, note) => {
    if (err) return next(err);
    res.status(200).json(note);
  });
});
// Read all
app.get('/api/note', (req, res, next) => {
  Notes.find({}, (err, notes) => {
    if (err) return next(err);
    res.status(200).json(notes);
  });
});

// Update
app.put('/api/note/:id', (req, res, next) => {
  const {id} = req.params;
  const {title, description} = req.body;
  Notes.findByIdAndUpdate(
      id,
      {title, description},
      {new: true},
      (err, document) => {
        if (err) return next(err);
        res.status(200).json(req.body);
      },
  );
});
// Delete
app.delete('/api/note/:id', (req, res, next) => {
  const {id} = req.params;
  Notes.findByIdAndRemove(id, {useFindAndModify: false}, (err, document) => {
    if (err) return next(err);
    res
        .status(200)
        .json({deleted: true, document, message: 'Note deleted successfully'});
  });
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});


module.exports = app;
