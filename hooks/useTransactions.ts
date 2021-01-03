import useSWR, { useSWRInfinite } from 'swr'

import fetcher, { ErrorResponse, PaginationLinks } from '@/lib/authed-fetcher'

enum UpTransactionStatusEnum {
  HELD = 'HELD',
  SETTLED = 'SETTLED',
}

interface UpMoneyObject {
  currencyCode: string
  value: string
  valueInBaseUnits: number
}

interface UpCashbackObject {
  description: string
  amount: UpMoneyObject
}

interface UpRoundUpObject {
  amount: UpMoneyObject
  boostPortion: UpMoneyObject | null
}

interface UpHoldInfoObject {
  amount: UpMoneyObject
  foreignAmount: UpMoneyObject | null
}

export interface UpTransactionResource {
  type: string
  id: string
  attributes: {
    status: UpTransactionStatusEnum
    rawText: string | null
    description: string
    message: string | null
    holdInfo: UpHoldInfoObject | null
    roundUp: UpRoundUpObject | null
    cashback: UpCashbackObject | null
    amount: UpMoneyObject
    foreignAmount: UpMoneyObject | null
    settledAt: string | null
    createdAt: string
  }
  relationships: {
    account: {
      data: {
        type: string
        id: string
      }
      links: {
        self: string
      }
    }
    category: {
      data: {
        type: string
        id: string
      } | null
      links: {
        self: string
      }
    }
    parentCategory: {
      data: {
        type: string
        id: string
      } | null
      links: {
        self: string
      }
    }
    tags: {
      data: Array<{
        type: string
        id: string
      }>
      links: {
        self: string
      }
    }
  }
}

interface ListTransactionsResponse {
  data: UpTransactionResource[]
  links: PaginationLinks
}

interface UseTransactionsArguments {
  all?: boolean
  account?: string
  filter?: {
    since?: string
    until?: string
  }
}

const useTransactions = (
  token: string,
  { all, account, filter }: UseTransactionsArguments
) => {
  const url = account
    ? `https://api.up.com.au/api/v1/accounts/${account}/transactions`
    : `https://api.up.com.au/api/v1/transactions`
  const searchParams = new URLSearchParams({
    ...(filter?.since ? { 'filter[since]': filter.since } : {}),
    ...(filter?.until ? { 'filter[until]': filter.until } : {}),
  })
  if (all) {
    const PAGE_SIZE = 100
    const getKey = (
      pageIndex: number,
      previousPageData: ListTransactionsResponse | null
    ) => {
      if (previousPageData && !previousPageData.links.next) {
        return null
      }
      if (!previousPageData || pageIndex === 0) {
        searchParams.append('page[size]', `${PAGE_SIZE}`)
        return `${url}?${searchParams.toString()}`
      }
      return previousPageData.links.next
    }

    const { data, size, setSize, error } = useSWRInfinite<
      ListTransactionsResponse,
      ErrorResponse
    >(getKey, (url) => fetcher(url, token))
    const isLoadingInitialData = !data && !error
    const isLoadingMore =
      isLoadingInitialData ||
      (size > 0 && data && typeof data[size - 1] === 'undefined')
    const isEmpty = data?.[0]?.data.length === 0
    const isReachingEnd =
      isEmpty || (data && data[data.length - 1]?.data.length < PAGE_SIZE)

    if (!isLoadingMore && !isReachingEnd) {
      setSize(size + 1)
    }

    return {
      allTransactions: data,
      isLoading: isLoadingInitialData || isLoadingMore,
      isError: error,
    }
  } else {
    const { data, error } = useSWR<ListTransactionsResponse, ErrorResponse>(
      url,
      (url) => fetcher(url, token)
    )
    return {
      transactions: data,
      isLoading: !error && !data,
      isError: error,
    }
  }
}

export default useTransactions
