import { ProxyList } from 'proxy-extract'

export type TDeeplSettings = {
  proxy?: ProxyList.IFreeProxy
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

export class DeeplBase {
  protected settings: TDeeplSettings

  constructor(s: TDeeplSettings) {
    this.settings = {
      allowBrowser: true,
      ...s
    }
  }
}
