const mongoose = require('mongoose');
mongoose.set("strictQuery", false);

/* eslint-disable new-cap */
const notesSchema = mongoose.Schema({
  title: String,
  description: String,
});
/* eslint-enable new-cap */

const Notes = mongoose.model('Notes', notesSchema);

module.exports = Notes;

