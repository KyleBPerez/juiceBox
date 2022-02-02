require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const { client } = require('./db')
const server = express()
const { PORT } = process.env

server.use(morgan('dev'))
server.use(express.json())

server.use((req, res, next) => {
  console.log('---------Body Logger START----------')
  console.log(req.body)
  console.log('---------Body Logger END-----------')

  next()
})

server.use('/api', require('./api'))

client.connect()
server.listen(PORT, () => {
  console.log('The server is up on port:', PORT)
})
