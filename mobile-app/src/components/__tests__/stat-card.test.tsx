import React from 'react'
import { render, screen } from '@testing-library/react'
import StatCard from '../stat-card'
import { Zap } from 'lucide-react'

describe('StatCard', () => {
  it('renders title, value and change', () => {
    render(<StatCard title="Active Nodes" value="9,234" change="+12%" icon={<Zap />} />)

    expect(screen.getByText(/Active Nodes/i)).toBeInTheDocument()
    expect(screen.getByText(/9,234/i)).toBeInTheDocument()
    expect(screen.getByText(/\+12%/i)).toBeInTheDocument()
  })
})
