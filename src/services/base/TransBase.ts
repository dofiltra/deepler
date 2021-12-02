import { LowDbKv } from 'dbtempo'
import { ProxyItem } from 'dprx-types'
import _ from 'lodash'
import { TTransSettings } from '../../types/trans'


export class TransBase {
  protected settings: TTransSettings
  protected limitProxyCount = 1000
  protected proxyDb = new LowDbKv({
    dbName: `proxy-deepl-{YYYY}-{MM}-{DD}.json`
  })

  constructor(s: TTransSettings) {
    this.settings = {
      instanceLiveMinutes: 15,
      maxInstanceCount: 3,
      maxInstanceUse: 100,
      ...s
    }
  }

  async getProxy() {
    const { proxies = [] } = this.settings

    const proxiesData = (await this.proxyDb.getData()) || {}
    const sortProxies = proxies.sort((a, b) => {
      const aVal = proxiesData[a.url] || 0
      const bVal = proxiesData[b.url] || 0

      return aVal - bVal
    })

    const selectedProxy = sortProxies[0]
    if (selectedProxy) {
      this.incProxy(selectedProxy.url)
      return selectedProxy
    }

    return
  }

  async incProxy(proxyUrl?: string, inc = 1) {
    if (!proxyUrl) {
      return
    }
    const { result = 0 } = await this.proxyDb.get(proxyUrl)
    this.proxyDb.add({ [proxyUrl]: result + inc })
  }
}
