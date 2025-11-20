# 🧪 Tests Backend (Vitest)

## Structure

```
tests/
├── setup.js                    # Configuration globale des tests
├── helpers/
│   ├── db.helper.js           # Helpers pour mocker la DB
│   └── factories.js           # Factories pour générer des données de test
├── unit/
│   ├── services/              # Tests des services (logique métier)
│   └── repositories/          # Tests des repositories (accès données)
└── integration/               # Tests d'intégration (routes + API)
```

## Commandes

### Lancer tous les tests
```bash
npm test
```

### Lancer les tests en mode watch (développement)
```bash
npm run test:watch
```

### Lancer avec couverture de code
```bash
npm run test:coverage
```

### Lancer uniquement les tests unitaires
```bash
npm run test:unit
```

### Lancer uniquement les tests d'intégration
```bash
npm run test:integration
```

### Interface UI interactive (recommandé pour le dev)
```bash
npm run test:ui
```

## Types de Tests

### 1. Tests Unitaires (`tests/unit/`)

**Services** : Testent la logique métier pure
- Moquent toutes les dépendances externes
- Rapides à exécuter
- Exemple : `authService.test.js`

**Repositories** : Testent les requêtes SQL
- Moquent la fonction `query()`
- Vérifient les paramètres SQL
- Exemple : `movieRepository.test.js`

### 2. Tests d'Intégration (`tests/integration/`)

**Routes** : Testent les endpoints API complets
- Utilisent Supertest
- Moquent uniquement la DB
- Testent les middlewares, validations, réponses
- Exemple : `auth.routes.test.js`

## Helpers

### `db.helper.js`

```javascript
import { vi } from 'vitest'
import { mockDbResponse, createTestUser, createTestMovie } from '../helpers/db.helper.js'

// Mocker une réponse DB
query.mockResolvedValue(mockDbResponse([{ id: 1, title: 'Test' }]))

// Créer un utilisateur de test
const user = await createTestUser({ email: 'test@example.com' })
```

### `factories.js`

```javascript
import { userFactory, movieFactory, reviewFactory } from '../helpers/factories.js'

// Générer des données de test
const userData = userFactory()
const movieData = movieFactory({ title: 'Custom Title' })
```

## Bonnes Pratiques

### 1. Structure AAA (Arrange-Act-Assert)

```javascript
it('should do something', async () => {
  // Arrange - Préparer les données et mocks
  const mockData = { id: 1 }
  query.mockResolvedValue(mockDbResponse([mockData]))
  
  // Act - Exécuter l'action à tester
  const result = await service.doSomething()
  
  // Assert - Vérifier le résultat
  expect(result).toEqual(mockData)
})
```

### 2. Nommer les tests clairement

```javascript
describe('AuthService', () => {
  describe('login', () => {
    it('should login user with correct credentials', async () => { ... })
    it('should throw error with invalid credentials', async () => { ... })
    it('should throw error with wrong password', async () => { ... })
  })
})
```

### 3. Tester les cas limites

- ✅ Succès nominal
- ✅ Erreurs attendues
- ✅ Cas limites (null, undefined, valeurs vides)
- ✅ Erreurs de validation

### 4. Nettoyer les mocks

```javascript
import { beforeEach, vi } from 'vitest'

beforeEach(() => {
  vi.clearAllMocks() // Nettoie les compteurs d'appels
})
```

## Coverage

La couverture de code mesure le % de code testé :

- **Statements** : Lignes de code exécutées
- **Branches** : Conditions (if/else) testées
- **Functions** : Fonctions appelées
- **Lines** : Lignes physiques exécutées

**Objectif** : >80% sur tout

Voir le rapport : `coverage/index.html` après `npm run test:coverage`

## Exemple : Créer un nouveau test

### 1. Service (unit test)

```javascript
// tests/unit/services/myService.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import myService from '../../../src/services/myService.js'
import myRepository from '../../../src/repositories/myRepository.js'

vi.mock('../../../src/repositories/myRepository.js')

describe('MyService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should do something', async () => {
    // Arrange
    myRepository.findSomething.mockResolvedValue({ id: 1 })
    
    // Act
    const result = await myService.doSomething()
    
    // Assert
    expect(myRepository.findSomething).toHaveBeenCalled()
    expect(result).toBeDefined()
  })
})
```

### 2. Route (integration test)

```javascript
// tests/integration/myRoutes.test.js
import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'
import { query } from '../../src/db.js'

vi.mock('../../src/db.js', () => ({ query: vi.fn() }))

describe('My Routes', () => {
  it('GET /api/my-endpoint should return data', async () => {
    // Arrange
    query.mockResolvedValue({ rows: [{ id: 1 }] })
    
    // Act
    const response = await request(app).get('/api/my-endpoint')
    
    // Assert
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('data')
  })
})
```

## Debugging Tests

### Voir les logs
```javascript
console.log('Debug:', myVariable)
```

### Lancer un seul test
```javascript
it.only('should test this one', () => { ... })
```

### Ignorer un test
```javascript
it.skip('will be fixed later', () => { ... })
```

### Augmenter le timeout
```javascript
import { it } from 'vitest'

it('slow test', async () => {
  // ...
}, 30000) // 30 secondes
```

## Ressources

- [Vitest Documentation](https://vitest.dev/)
- [Supertest](https://github.com/ladjs/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
