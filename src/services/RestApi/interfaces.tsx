export type UrlParams = Record<string, any>;

export interface EndpointProps extends RequestInit {
  url       : string
  name      : string
  urlParams?: UrlParams
  baseUrl?  : string
  transform?: (data: any) => any
}
