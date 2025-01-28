require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// CORS configuration
const corsOptions = {
  origin: [
    "https://test-gtvv.vercel.app", // Vercel frontend URL
  ],
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.static('public')); // Serve static files from public directory

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add a timestamp to the file name
  },
});

const upload = multer({ storage: storage });

// Todo model definition
const todoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date },
  file: { type: String },
});

const Todo = mongoose.model('Todo', todoSchema);

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Add new todo (with file upload)
app.post('/api/todos', upload.single('file'), async (req, res) => {
  try {
    const newTodo = new Todo({
      text: req.body.text,
      dueDate: req.body.dueDate,
      file: req.file ? `/uploads/${req.file.filename}` : undefined, // Store the file path
    });

    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add todo' });
  }
});

// Update a todo (with file upload)
app.put('/api/todos/:id', upload.single('file'), async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (req.file) {
      if (todo.file) {
        // Delete the old file
        const oldFilePath = path.join(__dirname, 'public', todo.file);
        fs.unlinkSync(oldFilePath);
      }
      todo.file = `/uploads/${req.file.filename}`; // Update file path
    }

    todo.text = req.body.text;
    todo.dueDate = req.body.dueDate;
    await todo.save();

    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete a todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (todo.file) {
      const filePath = path.join(__dirname, 'public', todo.file);
      fs.unlinkSync(filePath); // Delete associated file
    }

    await Todo.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Start server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
