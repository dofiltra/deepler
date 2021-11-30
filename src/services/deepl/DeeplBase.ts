import { LowDbKv } from 'dbtempo'
import { ProxyItem } from 'dprx-types'
import _ from 'lodash'

export type TDeeplSettings = {
  proxies?: ProxyItem[]
  headless?: boolean
  allowBrowser?: boolean
  maxInstanceCount?: number
  maxInstanceUse?: number
  instanceLiveMinutes?: number
}

export type TTranslateOpts = {
  text: string
  targetLang: string

  maxOpenedBrowsers?: number
  tryLimit?: number
  tryIndex?: number
}

export type TTranslateResult = {
  translatedText: string
  source_lang?: string
  target_lang?: string
}

export type TTranslateLangResponse = {
  result: {
    lang: string
    detectedLanguages: { [lang: string]: number }
  }
}

export class DeeplBase {
  protected settings: TDeeplSettings
  protected limitProxyCount = 1000
  protected proxyDb = new LowDbKv({
    dbName: `proxy-deepl-{YYYY}-{MM}-{DD}.json`
  })

  constructor(s: TDeeplSettings) {
    this.settings = {
      allowBrowser: true,
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

  async incProxy(proxyUrl?: string) {
    if (!proxyUrl) {
      return
    }
    const { result = 0 } = await this.proxyDb.get(proxyUrl)
    this.proxyDb.add({ [proxyUrl]: result + 1 })
  }
}
