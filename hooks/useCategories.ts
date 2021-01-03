import useSWR from 'swr'

import fetcher, { ErrorResponse } from '@/lib/authed-fetcher'

interface UpCategoryResource {
  type: string
  id: string
  attributes: {
    name: string
  }
  relationships: {
    parent: {
      data: {
        type: string
        id: string
      } | null
      links?: {
        related: string
      }
    }
    children: {
      data: Array<{ type: string; id: string }>
      links?: {
        related: string
      }
    }
  }
  links: {
    self: string
  }
}

interface ListCategoriesResponse {
  data: UpCategoryResource[]
}

const useCategories = () => {
  const { data, error } = useSWR<ListCategoriesResponse, ErrorResponse>(
    'https://api.up.com.au/api/v1/categories',
    fetcher
  )
  return {
    categories: data,
    isLoading: !error && !data,
    isError: error,
  }
}

export default useCategories
