const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_UP_ACCESS_TOKEN}`,
    },
  }).then((res) => res.json())

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
