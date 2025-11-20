# 🧪 Tests Frontend (Nuxt + Vitest)

## Structure

```
tests/
├── setup.ts              # Configuration globale des tests
├── stores/              # Tests des stores Pinia
├── composables/         # Tests des composables
└── components/          # Tests des composants Vue
```

## Commandes

### Lancer tous les tests
```bash
npm test
```

### Mode watch (développement)
```bash
npm run test:watch
```

### Interface UI interactive
```bash
npm run test:ui
```

### Coverage
```bash
npm run test:coverage
```

## Types de Tests

### 1. Tests de Stores (Pinia)

Test de la logique d'état et des actions.

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMyStore } from '~/stores/myStore'

describe('My Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should update state', () => {
    const store = useMyStore()
    store.myAction()
    expect(store.myState).toBe('expected')
  })
})
```

### 2. Tests de Composables

Test de la logique réutilisable.

```typescript
import { describe, it, expect } from 'vitest'
import { useMyComposable } from '~/composables/useMyComposable'

describe('useMyComposable', () => {
  it('should return correct value', () => {
    const { value } = useMyComposable()
    expect(value).toBe('expected')
  })
})
```

### 3. Tests de Composants

Test des composants Vue avec @vue/test-utils.

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '~/components/MyComponent.vue'

describe('MyComponent', () => {
  it('should render correctly', () => {
    const wrapper = mount(MyComponent, {
      props: { title: 'Test' }
    })
    
    expect(wrapper.text()).toContain('Test')
  })
})
```

## Mocks Courants

### Mock API
```typescript
vi.mock('~/utils/api', () => ({
  ApiClient: vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn()
  }))
}))
```

### Mock Runtime Config
```typescript
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBase: 'http://localhost:3001'
    }
  })
}))
```

### Mock Nuxt Composables
```typescript
vi.mock('#app', () => ({
  useRouter: () => ({
    push: vi.fn()
  }),
  useRoute: () => ({
    params: { id: '1' }
  })
}))
```

## Bonnes Pratiques

1. **Nettoyer entre les tests**
```typescript
beforeEach(() => {
  vi.clearAllMocks()
})
```

2. **Tester les cas limites**
- Succès
- Erreurs
- Null/undefined
- Cas vides

3. **Noms descriptifs**
```typescript
it('should display error message when API fails', () => {
  // ...
})
```

4. **Éviter les tests fragiles**
- Ne pas tester l'implémentation
- Tester le comportement
- Utiliser data-testid au lieu de classes CSS

## Ressources

- [Vitest](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Nuxt Test Utils](https://nuxt.com/docs/getting-started/testing)
- [Pinia Testing](https://pinia.vuejs.org/cookbook/testing.html)
