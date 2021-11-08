import fetchHap from 'make-fetch-happen'
import { FetchOptions } from 'make-fetch-happen'

export const getFetchHap = async (opts?: FetchOptions) => {
  const {
    headers = {
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
    },
    compress = true
  } = { ...opts }

  return fetchHap.defaults({
    // cachePath: './node_modules/.fetch-cache',
    timeout: 30e3,
    ...opts,
    compress,
    headers
  })
}
