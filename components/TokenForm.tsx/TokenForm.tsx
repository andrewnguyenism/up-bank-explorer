import { ErrorResponse } from '@/lib/authed-fetcher'
import { useState } from 'react'

interface Props {
  error: ErrorResponse | void
  loading: boolean
  onLogInClick: (token: string) => void
}

export const TokenForm = ({ loading, error, onLogInClick }: Props) => {
  const [token, setToken] = useState<string>('')

  return (
    <div className="m-4 text-center">
      <label className="uppercase font-semibold" htmlFor="token">
        Personal Access Token
      </label>
      <input
        className="block border-2 p-4 w-full mx-auto mt-2"
        id="token"
        type="text"
        onChange={(event) => setToken(event.currentTarget.value)}
        placeholder="up:yeah:token"
        value={token}
      />
      {loading && <div className="mt-2">Logging in...</div>}
      {error &&
        error.errors.map((errorObject) => {
          if (errorObject.status === '401') {
            return (
              <div className="mt-2 text-red-400">
                Invalid token, please make sure you have entered it correctly.
              </div>
            )
          }
        })}
      <button
        className="border-2 py-2 px-4 mt-4"
        onClick={() => onLogInClick(token)}
      >
        Log In
      </button>
      <div className="mt-8">
        <div className="font-bold">What&apos;s a Personal Access Token?</div>
        Go to{' '}
        <a
          className="underline"
          href="https://api.up.com.au/getting_started"
          rel="noreferrer"
          target="_blank"
        >
          api.up.com.au/getting_started
        </a>{' '}
        to get your Personal Access Token
      </div>
    </div>
  )
}
