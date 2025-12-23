import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ActivitySubmissionForm } from '../activity-submission-form'

describe('ActivitySubmissionForm', () => {
  it('shows manual input validation errors', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined)
    render(<ActivitySubmissionForm onSubmit={onSubmit} isSubmitting={false} />)

    // Switch to manual input
    fireEvent.click(screen.getByRole('button', { name: /Manual Input/i }))

    // Click submit without entering fields
    fireEvent.click(screen.getByRole('button', { name: /Submit Activity/i }))

    await waitFor(() => expect(screen.getByText(/Please fix the highlighted fields/i)).toBeInTheDocument())

    // Provide invalid latitude
    fireEvent.change(screen.getByLabelText(/Latitude/i), { target: { value: '1000' } })
    fireEvent.click(screen.getByRole('button', { name: /Submit Activity/i }))

    await waitFor(() => expect(screen.getByText(/Latitude must be between -90 and 90/i)).toBeInTheDocument())
  })

  it('submits when valid manual input provided', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined)
    render(<ActivitySubmissionForm onSubmit={onSubmit} isSubmitting={false} />)

    fireEvent.click(screen.getByRole('button', { name: /Manual Input/i }))

    fireEvent.change(screen.getByLabelText(/Latitude/i), { target: { value: '37.7749' } })
    fireEvent.change(screen.getByLabelText(/Longitude/i), { target: { value: '-122.4194' } })
    fireEvent.change(screen.getByLabelText(/Signal Strength/i), { target: { value: '-65' } })

    fireEvent.click(screen.getByRole('button', { name: /Submit Activity/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
  })
})
