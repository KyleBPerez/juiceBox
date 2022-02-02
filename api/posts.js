const express = require('express')
const postsRouter = express.Router()
const { getAllPosts, createPost, updatePost, getPostById } = require('../db')
const { requireUser } = require('./utils')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env

postsRouter.use((req, res, next) => {
  console.log('A request is being made to /posts')

  next()
})

postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.postId)

    if (post && post.author.id === req.user.id) {
      const deletedPost = await updatePost(post.id, { active: false })

      res.send({ post: deletedPost })
    } else {
      next(
        post
          ? {
              name: `unauthorizedUserError`,
              message: `You can't delete a post that's not yours`,
            }
          : {
              name: `PostNotFoundError`,
              message: `That post doesn't exist`,
            }
      )
    }
  } catch ({ name, message }) {
    next({ name, message })
  }
})

postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
  const { postId } = req.params
  const { title, content, tags } = req.body

  const updateFields = {}

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/)
  }

  if (title) {
    updateFields.title = title
  }

  if (content) {
    updateFields.content = content
  }

  try {
    const originalPost = await getPostById(postId)

    if (originalPost.author.id === req.user.id) {
      const updateMyPost = await updatePost(postId, updateFields)
      console.log('post :>> ', updateMyPost)
      res.send({ post: updateMyPost })
    } else {
      next({
        name: 'UnauthorizeduserError',
        message: `You can't update a post that isn't yours`,
      })
    }
  } catch ({ name, message }) {
    next({ name, message })
  }
})

postsRouter.post('/', requireUser, async (req, res, next) => {
  const { title, content, tags = '' } = req.body
  const { id: userId } = req.user

  const tagArr = tags.trim().split(/\s+/)
  const postData = {}

  if (tagArr.length) {
    postData.tags = tagArr
  }

  try {
    postData.authorId = userId
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
})

postsRouter.get('/', async (req, res, next) => {
  try {
    const allPosts = await getAllPosts()

    const posts = allPosts.filter(
      (post) => post.active || (req.user && post.author.id === req.user.id)
    )

    res.send({
      posts,
    })
  } catch ({ name, message }) {
    next({ name, message })
  }
})

module.exports = postsRouter

// login token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2NDM3NjAxNTh9.M3Nr8koE3T01n6GVe8Ap9YH2C60xyzBxziWgMIPI_os
