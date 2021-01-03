import useSWR from 'swr'

import fetcher, { ErrorResponse, PaginationLinks } from '@/lib/authed-fetcher'

export enum UpAccountTypeEnum {
  SAVER = 'SAVER',
  TRANSACTIONAL = 'TRANSACTIONAL',
}

interface UpMoneyObject {
  currencyCode: string
  value: string
  valueInBaseUnits: number
}

interface UpAccountResource {
  type: string
  id: string
  attributes: {
    displayName: string
    accountType: UpAccountTypeEnum
    balance: UpMoneyObject
    createdAt: string
  }
  relationships: {
    links?: {
      related: string
    }
  }
  links: {
    self: string
  }
}

interface ListAccountsResponse {
  data: UpAccountResource[]
  links: PaginationLinks
}

const useAccounts = () => {
  const { data, error } = useSWR<ListAccountsResponse, ErrorResponse>(
    'https://api.up.com.au/api/v1/accounts',
    fetcher
  )
  return {
    accounts: data,
    isLoading: !error && !data,
    isError: error,
  }
}

export default useAccounts
