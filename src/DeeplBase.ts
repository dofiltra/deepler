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

  constructor(s: TDeeplSettings) {
    this.settings = {
      allowBrowser: true,
      ...s
    }
  }
}
