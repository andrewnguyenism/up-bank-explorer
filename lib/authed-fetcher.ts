const fetcher = (url: string, token: string) =>
  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (res) => {
      if (!res.ok) {
        const error = await res.json()
        throw new Object(error) as ErrorResponse
      }
      return res
    })
    .then((res) => res.json())

export default fetcher

export interface PaginationLinks {
  prev: string | null
  next: string | null
}

export interface ErrorObject {
  status: string
  title: string
  detail: string
  source?: {
    parameter?: string
    pointer?: string
  }
}

export interface ErrorResponse {
  errors: ErrorObject[]
}
