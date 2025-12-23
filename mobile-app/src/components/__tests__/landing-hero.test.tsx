import React from 'react'
import { render, screen } from '@testing-library/react'
import LandingHero from '../landing-hero'

describe('LandingHero', () => {
  it('renders heading, subtitle and CTAs', () => {
    render(<LandingHero />)

    expect(screen.getByText(/Build and earn on the DePIN Network/i)).toBeInTheDocument()
    expect(screen.getByText(/Contribute WiFi signal data/i)).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Get Started|Explore Network/i }).length).toBeGreaterThan(0)
  })
})
