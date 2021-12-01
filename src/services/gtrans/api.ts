import { TTranslateOpts, TTranslateResult } from '../..'
import translate from 'translate-google'

export class GTransApi {
  async translate(opts: TTranslateOpts): Promise<TTranslateResult> {
    const { text, targetLang, tryIndex = 0, tryLimit = 5 } = opts

    if (tryIndex >= tryLimit) {
      return { translatedText: text }
    }

    try {
      const gtransResult = await translate(text, { to: targetLang })
      return { translatedText: gtransResult }
    } catch {
      //
    }

    return await this.translate({
      ...opts,
      tryIndex: tryIndex + 1
    })
  }
}
