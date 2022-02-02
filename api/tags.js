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

    const activePostsByTag = postsByTag.filter(
      (post) => post.active || (req.user && post.author.id === req.user.id)
    )
    res.send({ posts: activePostsByTag })
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
