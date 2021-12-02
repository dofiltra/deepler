import { BrowserManager, Page } from 'browser-manager'
import { ProxyItem } from 'dprx-types'

export type TTransSettings = {
  proxies?: ProxyItem[]
  headless?: boolean
  maxInstanceCount?: number
  maxInstanceUse?: number
  instanceLiveMinutes?: number
}

export enum TransPrior {
  DeBro = 'debro',
  DeApi = 'deapi',

  YaBro = 'yabro',
  YaApi = 'yaapi',

  GoBro = 'gobro',
  GoApi = 'goapi'
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

export type TBrowserInstance = {
  id: string
  browser: BrowserManager
  page: Page
  idle: boolean
  usedCount: number
  proxyItem?: ProxyItem
}
