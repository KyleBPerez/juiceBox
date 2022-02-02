const express = require('express')
const tagsRouter = express.Router()
const { getAllTags, getPostsByTagName } = require('../db')

tagsRouter.use((req, res, next) => {
  console.log('A request is being made to /tags')

  next()
})

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
  const { tagName } = req.params
  try {
    const postsByTag = await getPostsByTagName(tagName)
    res.send({ posts: postsByTag })
  } catch ({ name, message }) {
    next({
      name: `PostsTagError`,
      message: `Tag name doesn't exist or no post by tag name`,
    })
  }
})

tagsRouter.get('/', async (req, res) => {
  const tags = await getAllTags()

  res.send({
    tags,
  })
})

module.exports = tagsRouter
