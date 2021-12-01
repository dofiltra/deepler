import { TransBase, TTranslateOpts, TTranslateResult } from '../..'
import gapiLight from 'translate-google'
import gapiWithProxy from '@vitalets/google-translate-api'
import tunnel from 'tunnel'

export class GTransApi extends TransBase {
  async translate(opts: TTranslateOpts): Promise<TTranslateResult> {
    const { text, targetLang, tryIndex = 0, tryLimit = 5 } = opts

    if (tryIndex >= tryLimit) {
      return { translatedText: text }
    }

    try {
      const gtransResult = await gapiLight(text, { to: targetLang })
      if (gtransResult) {
        return { translatedText: gtransResult }
      }
    } catch {
      //
    }

    try {
      const proxy = await this.getProxy()
      if (proxy) {
        const proxyTunnel = {
          host: proxy.ip,
          proxyAuth: `${proxy.user}:${proxy.pass}`,
          port: parseInt(proxy.port!, 10),
          headers: {
            'User-Agent': 'Node'
          }
        }
        const gtransResult = (await (gapiWithProxy as any)(
          text,
          { to: targetLang },
          {
            agent: tunnel.httpsOverHttp({
              proxy: proxyTunnel
            })
          }
        )) as gapiWithProxy.ITranslateResponse
        if (gtransResult.text) {
          return { translatedText: gtransResult.text }
        }
      }
    } catch {
      //
    }

    return await this.translate({
      ...opts,
      tryIndex: tryIndex + 1
    })
  }
}
