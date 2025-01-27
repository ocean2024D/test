const mongoose = require('mongoose');

// Şema Tanımı
const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  file: {
    type: String, // Dosya veya resim URL'sini saklar
    required: false
  }
});

// Modeli Tanımlama
const Todo = mongoose.model('Todo', todoSchema);

// Şema ve Modeli Dışa Aktarma
module.exports = Todo;
