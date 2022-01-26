const {
  client,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  createPost,
  updatePost,
  getPostsByUser,
  getPostById,
  getAllPosts,
  createTags,
  createPostTag,
  addTagsToPost,
  getPostsByTagName,
} = require('./index')

const createTables = async () => {
  try {
    console.log('Starting to build tables...')
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true
      );
      CREATE TABLE posts(
        id SERIAL PRIMARY KEY,
        "authorId" INTEGER REFERENCES users(id) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true
      );
      CREATE TABLE tags(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );
      CREATE TABLE post_tags(
        "postId" INTEGER REFERENCES posts(id),
        "tagId" INTEGER REFERENCES tags(id),
        UNIQUE ("postId", "tagId")

      );
    `)

    console.log('Finished building tables!')
  } catch (error) {
    console.log('Error building tables!')
    throw error
  }
}

const dropTables = async () => {
  try {
    console.log('Starting to drop tables...')
    await client.query(`
      DROP TABLE IF EXISTS post_tags;
      DROP TABLE IF EXISTS tags;
      DROP TABLE IF EXISTS posts;
      DROP TABLE IF EXISTS users;
    `)
    console.log('Finished dropping tables!')
  } catch (error) {
    console.log('Error dropping tables!')
    throw error
  }
}

const createInitialUsers = async () => {
  try {
    console.log('Starting to create users...')

    const albert = await createUser({
      username: 'albert',
      password: 'bertie99',
      name: 'Albert',
      location: 'Not where Sandra is',
    })

    const sandra = await createUser({
      username: 'sandra',
      password: '2sandy4me',
      name: 'Sandra',
      location: 'Where is Albert',
    })

    const glamgal = await createUser({
      username: 'glamgal',
      password: 'soglam',
      name: 'Gimli',
      location: 'the Ered Luin',
    })

    console.log(albert)

    console.log('Finished creating users!')
  } catch (error) {
    console.log('Error creating users!')
    throw error
  }
}

const createInitialPosts = async () => {
  try {
    const [albert, sandra, glamgal] = await getAllUsers()

    await createPost({
      authorId: albert.id,
      title: 'First Post',
      content: `This is my first and last post. I can't handle the fame this post is giving me`,
      tags: ['#happy', '#youcandoanything', '#catmandoeverything'],
    })

    await createPost({
      authorId: sandra.id,
      title: 'I love Albert!',
      content: `Where iS AlBeRt I mIsS hIm So MuCh`,
      tags: ['#worst-day-ever', '#catmandoeverything'],
    })

    await createPost({
      authorId: sandra.id,
      title: 'ALBERT I NEED YOU!',
      content: `YOU CAN'T RUN FOR EVER!`,
      tags: ['#happy', '#catmandoeverything'],
    })

    await createPost({
      authorId: glamgal.id,
      title: 'Bread Braiding Tips',
      content: `Gimli here to show you all my beard braiding skills!`,
      tags: ['#youcandoanything', '#worst-day-ever', '#catmandoeverything'],
    })
  } catch (error) {
    throw error
  }
}

const rebuildDB = async () => {
  try {
    client.connect()

    await dropTables()
    await createTables()
    await createInitialUsers()
    await createInitialPosts()
  } catch (error) {
    console.error(error)
  }
}

async function testDB() {
  try {
    console.log('Starting to test database...')

    const users = await getAllUsers()
    console.log('getAllUsers:', users)

    console.log('Calling updateUser on users[0]')
    const updateUserResult = await updateUser(users[0].id, {
      name: 'Newname SoGood',
      location: 'Lesterville, KY',
    })
    console.log('updateUserResult :>> ', updateUserResult)

    console.log('Calling getAllPosts')
    const posts = await getAllPosts()
    console.log('getAllPosts :>> ', posts)

    console.log('Calling updatePost on posts[0]')
    const updatePostResult = await updatePost(posts[0].id, {
      title: 'Updated Title',
      content: 'just and editing my post',
    })
    console.log('updatePostResult :>> ', updatePostResult)

    console.log('Calling getUserById with 1')
    const albert = await getUserById(1)
    console.log('albert :>> ', albert)

    console.log('Calling updatePost on posts[1], only updating tags')
    const updatePostTagsResult = await updatePost(posts[1].id, {
      tags: ['#greenfish', '#bluefish', '#threefish', '#twofish'],
    })
    console.log('updatePostTagsResult =>>', updatePostTagsResult)

    console.log('Calling getPostsByTagName with #catmandoeverything')
    const postsWithHappy = await getPostsByTagName('#catmandoeverything')
    console.log('postsWithHappy =>>', postsWithHappy)

    console.log('Finished database tests!')
  } catch (error) {
    console.error('Error testing database!')
    throw error
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end())
