const { Collector, MeterProvider } = require("@opentelemetry/node");
const mongoose = require('mongoose');
const app = require('./app');

const port = process.env.PORT || 3000;

mongoose
    .connect(process.env.MONGODB_URI,
        {useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 30000})
    .then(() => {
      app.listen(port, (arg) => {
        console.log(`Server started @ ${port}.`);
      });
    })
    .catch((err) => {
      console.log(err);
    });
    const collector = new Collector();
const meterProvider = new MeterProvider(collector);

// Registro de datos de la aplicación
app.use((req, res, next) => {
  const span = meterProvider.createSpan("notes", {
    attributes: {
      client: req.headers["user-agent"],
      ip: req.connection.remoteAddress,
      queryParams: req.query,
      requestBody: req.body,
    },
  });

  next();

  span.end();
});

// Configuración del colector de OpenTelemetry ( Puerto Default de signoz )
collector.setExporter({
  type: "otlp",
  endpoint: "http://localhost:9411/v1/traces",
});
app.listen(3000, () => console.log("Servidor iniciado en el puerto 3000"));

    


/* const mongoose = require("mongoose");
const app = require("./app");

const port = process.env.PORT || 3000;
const { MONGO_DB_USR, MONGO_DB_PWD, MONGO_DB_HOST, MONGO_DB_PORT } =
  process.env;
const credentials = MONGO_DB_USR ? `${MONGO_DB_USR}:${MONGO_DB_PWD}@` : "";
const mongoURI = `mongodb://${credentials}${MONGO_DB_HOST}:${MONGO_DB_PORT}/`;

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(port, (arg) => {
      console.log(`Server started @ ${port}.`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
*/
