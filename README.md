# Up Bank Explorer

[up-bank-explorer.andrewnguyenism.com](https://up-bank-explorer.andrewnguyenism.com)

The Up Bank Explorer uses the official [Up API](https://developer.up.com.au) to show you:

- Your accounts, and their balances
- Your spending broken down by category, time period (TODO: time period comparison)

## Why does this exist?

I used [Pocketbook](https://getpocketbook.com) for a while to get insights into my spending habits as my previous banks didn't offer this information in a way that app did.

Since moving to Up, I've been using the built-in insights and categories in the app to keep track on a monthly basis. However, I wanted to view a similar breakdown for the year which was only available as the "UpYear in review" - not quite like what I got with Pocketbook.

So think of this as a Pocketbook-like UI for your Up transaction data.

## How do I use it myself?

This is an entirely client-side application, so if you want to run this locally you can!

1. Clone the repo
2. Install dependencies:

```bash
# yarn
yarn install

# npm
npm install
```

3. Start the app:

```bash
# yarn
yarn start

# npm
npm run start
```

## Technology Used

This a Next.js project, bootstraped with the [with-typescript-eslint-jest-app template](https://github.com/vercel/next.js/tree/canary/examples/with-typescript-eslint-jest). That provides:

- [Typescript](https://www.typescriptlang.org/)
- Linting with [ESLint](https://eslint.org/)
- Formatting with [Prettier](https://prettier.io/)
- Linting, typechecking and formatting on by default using [`husky`](https://github.com/typicode/husky) for commit hooks
- Testing with [Jest](https://jestjs.io/) and [`react-testing-library`](https://testing-library.com/docs/react-testing-library/intro)

I added [SWR](https://github.com/vercel/swr) to handle data fetching from the Up API.
