import React from 'react'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import LandingHero from '../landing-hero'

test('LandingHero has no accessibility violations', async () => {
  const { container } = render(<LandingHero />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
