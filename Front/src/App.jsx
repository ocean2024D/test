import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState(null);
  const [editTodo, setEditTodo] = useState(null);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACK_BASEURL}/api/todos`);
        setTodos(response.data);
      } catch (err) {
        console.error('Error fetching todos:', err);
      }
    };

    fetchTodos();
  }, []);

  const addTodo = async () => {
    const formData = new FormData();
    formData.append('text', newTodo);
    formData.append('dueDate', dueDate);
    if (file) formData.append('file', file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACK_BASEURL}/api/todos`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      setTodos([...todos, response.data]);
      setNewTodo('');
      setDueDate('');
      setFile(null);
    } catch (err) {
      console.error('Error adding todo:', err);
    }
  };

  const updateTodo = async (id) => {
    const formData = new FormData();
    formData.append('text', newTodo);
    formData.append('dueDate', dueDate);
    if (file) formData.append('file', file);

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_BACK_BASEURL}/api/todos/${id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      const updatedTodos = todos.map((todo) =>
        todo._id === id ? response.data : todo
      );
      setTodos(updatedTodos);
      setNewTodo('');
      setFile(null);
      setDueDate('');
      setEditTodo(null);
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_REACT_APP_BACK_BASEURL}/api/todos/${id}`);
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  };

  return (
    <div>
      <h1>Todo App</h1>
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="Enter a todo"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={() => (editTodo ? updateTodo(editTodo._id) : addTodo())}>
        {editTodo ? 'Update Todo' : 'Add Todo'}
      </button>

      <ul>
        {todos.map((todo) => (
          <li key={todo._id}>
            <span>{todo.text}</span>
            {todo.dueDate && <span> (Due: {new Date(todo.dueDate).toLocaleDateString()})</span>}
            {todo.file && (
              <a href={`${import.meta.env.VITE_REACT_APP_BACK_BASEURL}${todo.file}`} target="_blank" rel="noreferrer">
                View File
              </a>
            )}
            <button onClick={() => {
              setEditTodo(todo);
              setNewTodo(todo.text);
              setDueDate(todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '');
            }}>
              Edit
            </button>
            <button onClick={() => deleteTodo(todo._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
