import { ProxyList } from 'proxy-extract'
import { Deepler } from '.'

const debug = async () => {
  const a = await new Deepler({
    // proxy: {
    //   url: 'socks5://127.0.0.1:9050'
    // } as ProxyList.IFreeProxy
  }).translate({
    text: 'Привет, как дела?',
    targetLang: 'EN',
    maxOpenedBrowsers: 10,
    tryLimit: 10
  })
  console.log(a)
}

debug()
