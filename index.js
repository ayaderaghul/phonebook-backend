require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('post-data', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ' '
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'))

app.get('/', (request, response) => { 
  response.send('hello world')
})

app.get('/api/persons', (request, response) => { 
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  Person.countDocuments({})
    .then(count => {
      response.send(`Phonebook has ${count} entries. ${new Date()}`)
    })
})

app.get('/api/persons/:id', (request, response, next) => { 
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
}) 

app.delete('/api/persons/:id', (request, response, next) => { 
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => { 
  const body = request.body
  
  if (!body.name || !body.number) { 
    return response.status(400).json({ 
      error: 'name or number missing' 
    })
  }

  Person.findOne({ name: body.name })
    .then(existingPerson => {
      if (existingPerson) {
        return response.status(400).json({ 
          error: 'name must be unique' 
        })
      }
      
      const person = new Person({ 
        name: body.name,
        number: body.number,
      })
      
      return person.save()
    })
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})