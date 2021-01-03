import { useState } from 'react'

import Head from 'next/head'

import { Explorer } from '@/components/Explorer'
import fetcher, { ErrorResponse } from '@/lib/authed-fetcher'
import { TokenForm } from '@/components/TokenForm.tsx'

interface PingResponse {
  meta: {
    id: string
    statusEmoji: string
  }
}

export const Home = (): JSX.Element => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ErrorResponse | void>()
  const [token, setToken] = useState<string | null>()
  const [upId, setUpId] = useState<string | null>()

  const ping = async (token: string) => {
    setError(undefined)
    setLoading(true)
    try {
      const res: PingResponse = await fetcher(
        'https://api.up.com.au/api/v1/util/ping',
        token
      )
      if (res.meta.id) {
        setUpId(res.meta.id)
        setToken(token)
      }
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Head>
        <title>Up Explorer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!token && (
        <TokenForm error={error} loading={loading} onLogInClick={ping} />
      )}
      {token && (
        <>
          <div className="mx-4">
            <span>
              Logged in as: <span className="font-semibold">{upId}</span>
            </span>
          </div>
          <button
            className="mx-4 underline"
            onClick={() => {
              setToken(null)
            }}
          >
            Log Out?
          </button>
          <Explorer token={token} />
        </>
      )}
    </div>
  )
}

export default Home
