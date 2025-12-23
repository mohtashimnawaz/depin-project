'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSolana } from '@/components/solana/use-solana'
import { Connection, PublicKey, Keypair } from '@solana/web3.js'

// DePIN Client types and interfaces
interface ActivityData {
  gpsLat: number
  gpsLong: number
  signalStrength: number
}

interface UserStats {
  totalSubmissions: number
  dailySubmissions: number
  totalRewardsEarned: number
  mapBalance: number
  lastSubmissionTime?: Date
  pendingVerification: boolean
}

interface CanSubmitResult {
  canSubmit: boolean
  reason?: string
  nextSubmissionTime?: Date
}

// Mock DePIN Client for development
class MockDepinClient {
  private connection: Connection
  private programId: PublicKey

  constructor(connection: Connection, programId: string) {
    this.connection = connection
    this.programId = new PublicKey(programId)
  }

  async getUserStats(userPublicKey: PublicKey): Promise<UserStats> {
    // Mock data for development
    const mockStats = {
      totalSubmissions: Math.floor(Math.random() * 100) + 10,
      dailySubmissions: Math.floor(Math.random() * 24),
      totalRewardsEarned: Math.floor(Math.random() * 500) + 50,
      mapBalance: Math.floor(Math.random() * 1000) + 100,
      lastSubmissionTime: new Date(Date.now() - Math.random() * 3600000), // Random time in last hour
      pendingVerification: Math.random() > 0.7 // 30% chance of pending verification
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockStats
  }

  async canSubmitActivity(userPublicKey: PublicKey): Promise<CanSubmitResult> {
    // Mock cooldown logic
    const lastSubmission = Date.now() - Math.random() * 7200000 // Random time in last 2 hours
    const cooldownPeriod = 3600000 // 1 hour in milliseconds
    const timeSinceLastSubmission = Date.now() - lastSubmission
    
    if (timeSinceLastSubmission < cooldownPeriod) {
      const nextSubmissionTime = new Date(lastSubmission + cooldownPeriod)
      return {
        canSubmit: false,
        reason: 'Cooldown period not met',
        nextSubmissionTime
      }
    }

    return { canSubmit: true }
  }

  async submitActivity(activityData: ActivityData, user: Keypair): Promise<string> {
    // Mock submission
    console.log('Submitting activity:', activityData)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock transaction signature
    return 'mock_transaction_signature_' + Math.random().toString(36).substr(2, 9)
  }

  async getUserMapBalance(userPublicKey: PublicKey): Promise<number> {
    // Mock balance
    return Math.floor(Math.random() * 1000) + 100
  }
}

// Configuration
const PROGRAM_ID = process.env.NEXT_PUBLIC_DEPIN_PROGRAM_ID || '7nMrAY8nNgHcyAimQJgrzM5LisT2jVaNRX2s6hvnNsxU'
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'http://localhost:8899'

export function useDepinClient() {
  const { account, connection } = useSolana()
  const [client, setClient] = useState<MockDepinClient | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [canSubmit, setCanSubmit] = useState<CanSubmitResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize client
  useEffect(() => {
    if (connection) {
      const depinClient = new MockDepinClient(connection, PROGRAM_ID)
      setClient(depinClient)
    }
  }, [connection])

  // Fetch user data
  const refreshData = useCallback(async () => {
    if (!client || !account) return

    setIsLoading(true)
    setError(null)

    try {
      const [stats, submitStatus] = await Promise.all([
        client.getUserStats(account.address),
        client.canSubmitActivity(account.address)
      ])

      setUserStats(stats)
      setCanSubmit(submitStatus)
    } catch (err) {
      console.error('Failed to fetch user data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }, [client, account])

  // Load data when client or account changes
  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Submit activity
  const submitActivity = useCallback(async (activityData: ActivityData) => {
    if (!client || !account) {
      throw new Error('Client not initialized or account not connected')
    }

    if (!canSubmit?.canSubmit) {
      throw new Error(canSubmit?.reason || 'Cannot submit activity at this time')
    }

    try {
      // For now, we'll use a mock keypair since we don't have access to the user's private key
      // In a real implementation, this would be handled by the wallet adapter
      const mockKeypair = Keypair.generate()
      
      const txSignature = await client.submitActivity(activityData, mockKeypair)
      console.log('Activity submitted:', txSignature)
      
      // Update local state to reflect pending verification
      if (userStats) {
        setUserStats({
          ...userStats,
          pendingVerification: true,
          dailySubmissions: userStats.dailySubmissions + 1,
          totalSubmissions: userStats.totalSubmissions + 1
        })
      }

      // Update submit status
      setCanSubmit({
        canSubmit: false,
        reason: 'Cooldown period active',
        nextSubmissionTime: new Date(Date.now() + 3600000) // 1 hour from now
      })

      return txSignature
    } catch (err) {
      console.error('Failed to submit activity:', err)
      throw err
    }
  }, [client, account, canSubmit, userStats])

  return {
    client,
    userStats,
    canSubmit,
    isLoading,
    error,
    submitActivity,
    refreshData
  }
}