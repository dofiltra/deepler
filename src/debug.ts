import { ProxyList } from 'proxy-extract'
import { Deepler } from '.'
import { getFetchHap } from './fetch'

const debug = async () => {
  // console.log(data)

  const a = await new Deepler({
    // proxy: {
    //   url: 'socks5://FSOfa5:EZaEVDGtbm@45.89.19.21:16739'
    // } as ProxyList.IFreeProxy,
    headless: false
  }).translate({
    text: 'скажи что делать? и как мне быть',
    targetLang: 'EN',
    maxOpenedBrowsers: 10,
    tryLimit: 10
  })
}

debug()
