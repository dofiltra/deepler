import _ from 'lodash'
import { ProxyItem } from 'dprx-types'

export type TProxyOpts = {
  filterTypes: ('http' | 'https' | 'socks5')[]
}

export class Proxifible {
  static proxies: ProxyItem[] = []
  static limitPerProxy = 1000

  static async getProxy(opts?: TProxyOpts) {
    const { filterTypes } = { ...opts }
    const sortProxies = _.sortBy(Proxifible.proxies, 'useCount').filter(
      (p) => !filterTypes?.length || filterTypes.includes(p.type)
    )

    const selectedProxy = sortProxies[0]
    if (selectedProxy) {
      await this.incProxy(selectedProxy.url())
      return selectedProxy
    }

    return
  }

  static async incProxy(proxyUrl?: string, inc = 1) {
    if (!proxyUrl) {
      return
    }

    const index = this.proxies.findIndex((p) => p.url() === proxyUrl)
    if (index > -1) {
      this.proxies[index]!.useCount! += inc
    }
  }
}
