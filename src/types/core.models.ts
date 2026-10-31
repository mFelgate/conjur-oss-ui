export interface ApiListResponse<T> {
  items: T[]
  total?: number
}

export interface ConjurErrorDetail {
  code?: string | number
  target?: string
  message?: string
  [key: string]: unknown
}

export interface ConjurErrorBody {
  code?: string | number
  message?: string
  target?: string
  details?: ConjurErrorDetail | ConjurErrorDetail[]
  innererror?: ConjurErrorDetail
  [key: string]: unknown
}

export interface ConjurErrorResponse {
  error?: ConjurErrorBody
}

export interface ConjurV2ErrorResponse {
  code?: string | number
  message?: string
}
