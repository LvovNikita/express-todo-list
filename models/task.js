const mongoose = require('mongoose');

// ----- MONGOOSE SCHEMAS -----

const Schema = mongoose.Schema;

const taskSchema = new Schema({
  // id: ObjectId,
  title: {
    type: String,
    required: true
  },
  description: String,
  date: Date,
  category: String,
  userId: Object,
});

const Task = mongoose.model('Task', taskSchema);

// ----- EXPORT -----

module.exports = Task;
