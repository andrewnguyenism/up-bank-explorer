import type { AppProps } from 'next/app'

import 'tailwindcss/tailwind.css'

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <div className="font-mono">
      <div className="text-6xl uppercase font-bold m-4">Up Explorer</div>
      <Component {...pageProps} />
      <div className="text-sm uppercase text-center my-8">
        Created by Andrew Nguyen in 2021.
      </div>
    </div>
  )
}

export default MyApp
