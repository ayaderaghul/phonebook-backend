const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.use(express.json())
app.use(cors())

morgan.token('post-data', (req) => {
  if (req.method === 'POST') return JSON.stringify(req.body);
  return ' ';
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'));

// app.use(morgan('tiny'))

app.get('/', (request,response)=>{ 
    response.send('hello world')
})

app.get('/api/persons',(request, response)=> { 
    response.json(persons)
})

app.get('/info',(request,response)=>{
    const maxId = persons.length > 0 ? Math.max(...persons.map(p=>Number(p.id))) : 0

    response.send(`Phonebook has ${ persons.length} entries. ${Date()}`)
 })

app.get('/api/persons/:id', (request, response)=>{ 
    const id = request.params.id
    const person = persons.find(person=>person.id=== id)
    if (person){ 
        response.json(person)
    } else { 
        response.status(404).end()
    }
}) 

app.delete('/api/persons/:id', (request,response)=>{ 
    const id = request.params.id
    persons=persons.filter(person=>person.id!==id)
    response.status(204).end()
})

const generateId =()=> { 
    const id = Math.floor(Math.random() *1000)
    return String(id)
}

app.post('/api/persons', (request,response)=>{ 
    const body = request.body
    if(!body.name || !body.number) { 
        return response.status(404).json({ 
            error: 'name or number missing'
        })
    }
    const exists = (name) => persons.some(person => person.name === name)
    if (exists){ 
        return response.status(400).json({ 
            error: 'name exists'
        })
    }

    const person = { 
        name: body.name,
        number: body.number,
        id: generateId(),
    }
    persons = persons.concat(person)
    response.json(persons)
})

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`server running on port ${PORT }`)