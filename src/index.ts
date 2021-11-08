import { DeeplBase, TTranslateOpts, TTranslateResult } from './DeeplBase'
import { DeeplBrowser } from './DeeplBrowser'
import { DeeplFetch } from './DeeplFetch'

export class Deepler extends DeeplBase {
  async translate(opts: TTranslateOpts): Promise<TTranslateResult> {
    // const result = await new DeeplFetch(this.settings).translate(opts)

    // if (result?.translatedText) {
    //   return result
    // }

    return await new DeeplBrowser(this.settings).translate(opts)
  }
}
