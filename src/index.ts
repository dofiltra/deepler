import { BrowserManager, Page } from 'browser-manager'
import { ProxyList } from 'proxy-extract'

type TDeeplSettings = {
  proxy?: ProxyList.IFreeProxy
}

class Deepler {
  protected _settings?: TDeeplSettings

  constructor(s: TDeeplSettings) {
    this._settings = {
      ...s
    }
  }

  protected async getHandleJobsResult(pwrt: BrowserManager, page: Page, text: string) {
    try {
      const { result } = {
        ...(await pwrt.getRespResult(page, 'LMT_handle_jobs', text))
      } as any

      const { source_lang, target_lang, translations = [] } = { ...result } as any

      if (result.source_lang && translations.length) {
        const translatedText =
          translations.length > 0 &&
          translations[0].beams?.length > 0 &&
          translations[0].beams[0].postprocessed_sentence

        return { translatedText, source_lang, target_lang }
      }
    } catch {}

    return null
  }
}

export { Deepler }
