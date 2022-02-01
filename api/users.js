const express = require('express')
const usersRouter = express.Router()
const { getAllUsers, getUserByUsername } = require('../db')

usersRouter.use((req, res, next) => {
  console.log('A request is being made to /users')

  next()
})

usersRouter.get('/', async (req, res) => {
  const users = await getAllUsers()

  res.send({
    users,
  })
})

usersRouter.post('/login', async (req, res, next) => {
  const { username, password } = req.body

  if (!username || !password) {
    next({
      name: 'MissingCredentialsError',
      message: 'Please supply both a username and password',
    })
  }

  try {
    const user = await getUserByUsername(username)

    if (user && user.password === password) {
      res.send({ message: "You're loggin in!" })
    }
  } catch (error) {
    console.error(error)
    next(error)
  }
})

module.exports = usersRouter
