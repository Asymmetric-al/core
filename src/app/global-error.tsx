'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect, useState } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  const handleRetry = () => {
    setIsRetrying(true)
    setRetryCount(prev => prev + 1)
    
    // On second retry, force a full page reload to clear any corrupted state/HMR cache
    if (retryCount >= 1) {
      window.location.reload()
      return
    }
    
    reset()
    
    // Reset the retrying state after a short delay
    setTimeout(() => {
      setIsRetrying(false)
    }, 1500)
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center bg-slate-50">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Something went wrong</h1>
            <p className="text-slate-500 max-w-md mx-auto">
              A critical application error occurred. We&apos;ve been notified and are looking into it.
            </p>
          </div>
          
          {error.digest && (
            <div className="px-3 py-1 bg-slate-100 rounded text-[10px] font-mono text-slate-400">
              Reference: {error.digest}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 min-w-[200px]">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              style={{ 
                borderRadius: '0.75rem', 
                backgroundColor: '#0f172a', 
                padding: '0.75rem 1.5rem', 
                color: 'white',
                border: 'none',
                cursor: isRetrying ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s',
                opacity: isRetrying ? 0.7 : 1
              }}
            >
              {isRetrying ? 'Retrying...' : 'Try again'}
            </button>
            <button
              onClick={handleGoHome}
              style={{ 
                borderRadius: '0.75rem', 
                backgroundColor: 'white', 
                padding: '0.75rem 1.5rem', 
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              Go home
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
