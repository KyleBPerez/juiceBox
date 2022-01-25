const { create } = require('yallist')
const { client, getAllUsers, createUser } = require('./index')

const dropTables = async () => {
  try {
    console.log('Starting to drop tables...')
    await client.query(`
      DROP TABLE IF EXISTS users;
    `)
    console.log('Finished dropping tables!')
  } catch (error) {
    console.log('Error dropping tables!')
    throw error
  }
}

const createTables = async () => {
  try {
    console.log('Starting to build tables...')
    await client.query(`
      CREATE TABLE USERS (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );
    `)
    console.log('Finished building tables!')
  } catch (error) {
    console.log('Error building tables!')
    throw error
  }
}

const createInitialUsers = async () => {
  try {
    console.log('Starting to create users...')

    const albert = await createUser({
      username: 'albert',
      password: 'bertie99',
    })

    const sandra = await createUser({
      username: 'sandra',
      password: '2sandy4me',
    })

    const glamgal = await createUser({
      username: 'glamgal',
      password: 'soglam',
    })

    console.log(albert)

    console.log('Finished creating users!')
  } catch (error) {
    console.log('Error creating users!')
    throw error
  }
}

const rebuildDB = async () => {
  try {
    client.connect()

    await dropTables()
    await createTables()
    await createInitialUsers()
  } catch (error) {
    console.error(error)
  }
}

async function testDB() {
  try {
    console.log('Starting to test database...')

    const users = await getAllUsers()
    console.log('getAllUsers:', users)

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
