import { faker } from '@faker-js/faker'

/**
 * Factory pour générer des données de test
 */

export const userFactory = (overrides = {}) => ({
  email: faker.internet.email(),
  password: 'Test123!@#',
  firstname: faker.person.firstName(),
  lastname: faker.person.lastName(),
  role: 'user',
  ...overrides
})

export const movieFactory = (overrides = {}) => ({
  title: faker.lorem.words(3),
  description: faker.lorem.paragraph(),
  release_date: faker.date.past().toISOString().split('T')[0],
  duration: faker.number.int({ min: 80, max: 180 }),
  poster_url: `/posters/${faker.string.uuid()}.jpg`,
  backdrop_url: `/backdrops/${faker.string.uuid()}.jpg`,
  tmdb_rating: faker.number.float({ min: 0, max: 10, precision: 0.1 }),
  tmdb_vote_count: faker.number.int({ min: 0, max: 10000 }),
  ...overrides
})

export const categoryFactory = (overrides = {}) => ({
  name: faker.lorem.word(),
  slug: faker.lorem.slug(),
  ...overrides
})

export const reviewFactory = (overrides = {}) => ({
  rating: faker.number.int({ min: 1, max: 5 }),
  comment: faker.lorem.paragraph(),
  ...overrides
})
