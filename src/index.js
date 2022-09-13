const express = require('express')
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json())

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers

  const user = users.find((user) =>{
    return user.username === username
  })
  
  //também pode ser user === undefined
  if(!user){
    return response.status(400).json({"error": "User doesn't exists "})
  }
  
  request.user = user

  return next()
}

function checksExistsToDo(user, id){
  const todo = user.todos.find((todo) =>{
    return todo.id === id
  })

  return todo

}

app.post('/users', (request, response) => {
  const {name, username} = request.body

  const userAlreadyExists = users.some((user) => {
    return user.username === username
  })

  if(userAlreadyExists === true){
    return response.status(400).json({"error":"User Already Exists"})
  }

  const user = { 
    id: uuidv4(), // precisa ser um uuid
    name: name, 
    username: username, 
    todos: []
  }

  users.push(user)
  //console.log(user)
  return response.status(201).json(user)

});

app.get('/users', (request, response) =>{
  return response.json(users)
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title , deadline} = request.body

  const todo = { 
    id: uuidv4(), // precisa ser um uuid
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title, deadline} = request.body

  const id = request.params.id;

  const todo = checksExistsToDo(user, id)

  if(!todo){
    return response.status(404).json({"error": "ToDo doesn't exists "})
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.status(201).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title} = request.body
  const id = request.params.id;

  const todo = checksExistsToDo(user, id)

  if(!todo){
    return response.status(404).json({"error": "ToDo doesn't exists "})
  }

  todo.done = true

  return response.status(201).json(todo)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  
  const id = request.params.id;

  const todo = checksExistsToDo(user, id)

  if(!todo){
    return response.status(404).json({"error": "ToDo doesn't exists "})
  }

  // splice
  user.todos.splice(todo, 1)

  return response.status(204).json(todo)
});

module.exports = app;