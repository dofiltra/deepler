import { LowDbKv } from 'dbtempo'
import _ from 'lodash'

export type TDeeplSettings = {
  proxies?: [{ url: string }]
  headless?: boolean
  allowBrowser?: boolean
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

  constructor(s: TDeeplSettings) {
    this.settings = {
      allowBrowser: true,
      ...s
    }
  }

  async getProxy() {
    const { proxies = [] } = this.settings
    const db = new LowDbKv({
      dbName: `proxy-deepl-{YYYY}-{MM}-{DD}.json`
    })

    for (const proxy of _.shuffle(proxies)) {
      let { result = 0 } = await db.get(proxy.url)
      if (result >= this.limitProxyCount) {
        continue
      }
      db.add({ [proxy.url]: ++result })
      return proxy
    }

    return null
  }
}
