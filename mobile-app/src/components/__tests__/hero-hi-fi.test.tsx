import React from 'react'
import { render, screen } from '@testing-library/react'
import HeroHiFi from '../hero-hi-fi'

describe('HeroHiFi', () => {
  it('renders hero title, subtitle, and CTAs', () => {
    render(<HeroHiFi />)

    expect(screen.getByText(/Earn/i)).toBeInTheDocument()
    expect(screen.getByText(/MAP Tokens/i)).toBeInTheDocument()
    expect(screen.getByText(/by Contributing to DePIN/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Connect Wallet/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Explore Network/i })).toBeInTheDocument()
  })
})
