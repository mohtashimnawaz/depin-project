import React from 'react'
import { render, screen } from '@testing-library/react'
import HeroHiFi from '../hero-hi-fi'

describe('HeroHiFi', () => {
  it('renders hero title, subtitle, and CTAs', () => {
    render(<HeroHiFi />)

    expect(screen.getByText(/Build and earn on the DePIN Network/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Connect Wallet/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Explore Network/i })).toBeInTheDocument()
  })
})
