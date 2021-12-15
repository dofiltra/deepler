import { BrowserManager, Page } from 'browser-manager'
import { ProxyItem } from 'dprx-types'

export type TInstanceOpts = {
  type: TransType.DeBro | TransType.GoBro | TransType.YaBro
  maxInstance: number
  maxPerUse: number
  liveMinutes?: number
  headless?: boolean
}

export enum TransType {
  DeBro = 'debro',
  DeApi = 'deapi',

  YaBro = 'yabro',
  YaApi = 'yaapi',

  GoBro = 'gobro',
  GoApi = 'goapi'
}

export enum TransMode {
  Auto = 'auto',
  Expand = 'expand',
  Shorten = 'shorten'
}

export type TTranslateOpts = {
  text: string
  targetLang: string
  mode?: TransMode

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
  type: TransType
  browser: BrowserManager
  page: Page
  idle: boolean
  usedCount: number
  maxPerUse: number
  proxyItem?: ProxyItem
}
