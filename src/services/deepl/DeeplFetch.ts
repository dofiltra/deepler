import { TransBase, TTranslateLangResponse, TTranslateOpts, TTranslateResult } from '../base/TransBase'
import { getFetchHap } from '../../fetch'

let id = 48580010

export class DeeplFetch extends TransBase {
  async translate(opts: TTranslateOpts): Promise<TTranslateResult | null> {
    const { text, targetLang } = opts
    const proxyUrl = (await this.getProxy())?.url
    const { result } = { ...(await this.getLang(text, proxyUrl)) }

    if (!result?.lang) {
      return null
    }

    return await this.getTranslate(text, targetLang, 'RU', proxyUrl) // result.lang
  }

  private async getLang(text: string, proxyUrl?: string) {
    try {
      const fh = await getFetchHap({
        proxy: proxyUrl,
        timeout: 30e3
      })
      const resp = await fh('https://www2.deepl.com/jsonrpc?method=LMT_split_into_sentences', {
        method: 'POST',
        timeout: 30e3,
        headers: {
          'cache-control': 'no-cache',
          'content-type': 'application/json',
          pragma: 'no-cache'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'LMT_split_into_sentences',
          params: {
            texts: [text.split(' ').slice(0, 10)],
            lang: {
              lang_user_selected: 'auto',
              preference: {
                weight: {
                  DE: 0.18011,
                  EN: 5.89084,
                  ES: 0.09376,
                  FR: 0.13593,
                  IT: 0.06518,
                  JA: 0.03904,
                  NL: 0.02573,
                  PL: 0.0135,
                  PT: 0.01387,
                  RU: 7.19205,
                  ZH: 0.02671,
                  CS: 0.00027,
                  DA: 0.00005,
                  ET: 0.00101,
                  FI: 0.00034,
                  HU: 0.00015,
                  LT: 0.00018,
                  LV: 0.00006,
                  RO: 0.00445,
                  SK: 0.00039,
                  SL: 0.00159,
                  SV: 0.00012,
                  BG: 0.99568
                },
                default: 'default'
              }
            }
          },
          id: ++id
        })
      })

      const data = await resp.json()

      return data as TTranslateLangResponse
    } catch (e: any) {
      //
    }

    return null
  }

  private async getTranslate(text: string, targetLang: string, sourceLang: string, proxyUrl?: string) {
    try {
      const fh = await getFetchHap({
        proxy: proxyUrl,
        timeout: 30e3
      })
      const resp = await fh('https://www2.deepl.com/jsonrpc?method=LMT_handle_jobs', {
        timeout: 30e3,
        method: 'POST',
        headers: {
          'cache-control': 'no-cache',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'LMT_handle_jobs',
          params: {
            jobs: [
              {
                kind: 'default',
                raw_en_sentence: text,
                raw_en_context_before: [],
                raw_en_context_after: [],
                preferred_num_beams: 4
              }
            ],
            lang: {
              preference: { weight: {}, default: 'default', formality: null },
              source_lang_computed: sourceLang,
              target_lang: targetLang
            },
            priority: 1,
            commonJobParams: { regionalVariant: 'en-US', browserType: 1 },
            timestamp: Date.now()
          },
          id: ++id
        })
      })

      const data = await resp.json()

      return data as TTranslateResult
    } catch {
      //
    }

    return null
  }
}
