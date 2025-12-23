import '@testing-library/jest-dom'
import { toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

// Mock IntersectionObserver used by Next.js
class MockIntersectionObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
}

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
})

// Provide requestIdleCallback polyfill for tests
if (typeof (global as any).requestIdleCallback === 'undefined') {
  ;(global as any).requestIdleCallback = function (cb: any) {
    return setTimeout(cb, 0)
  }
}
