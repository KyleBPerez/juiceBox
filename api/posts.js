const express = require('express')
const postsRouter = express.Router()
const { getAllPosts, createPost } = require('../db')
const { requireUser } = require('./utils')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env

postsRouter.use((req, res, next) => {
  console.log('A request is being made to /posts')

  next()
})

postsRouter.post('/', requireUser, async (req, res, next) => {
  const { title, content, tags = '' } = req.body
  const prefix = 'Bearer '
  const auth = req.header('Authorization')

  const tagArr = tags.trim().split(/\s+/)
  const postData = {}

  if (tagArr.length) {
    postData.tags = tagArr
  }

  if (!auth) {
    next()
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length)

    try {
      const { id } = jwt.verify(token, JWT_SECRET)
      postData.authorId = id
      postData.title = title
      postData.content = content
      const post = await createPost(postData)

      res.send(post)
    } catch ({ name, message }) {
      next({
        name: 'PostDataError',
        message: 'All Required feilds not filld out',
      })
    }
  } else {
    next({
      name: 'AuthorizationHeaderError',
      message: `Authorization token must start with ${prefix}`,
    })
  }
})

postsRouter.get('/', async (req, res) => {
  const posts = await getAllPosts()

  res.send({
    posts,
  })
})

module.exports = postsRouter

// login token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2NDM3NjAxNTh9.M3Nr8koE3T01n6GVe8Ap9YH2C60xyzBxziWgMIPI_os
