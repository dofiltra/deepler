import { DeeplBase, TTranslateOpts, TTranslateResult } from './services/deepl/DeeplBase'
import { DeeplBrowser } from './services/deepl/DeeplBrowser'
import { DeeplFetch } from './services/deepl/DeeplFetch'
import { GTransApi } from './services/gtrans/api'

export class Deepler extends DeeplBase {
  async translate(opts: TTranslateOpts): Promise<TTranslateResult> {
    let result
    // const result = await new DeeplFetch(this.settings).translate(opts)

    // if (result?.translatedText) {
    //   return result
    // }

    result = await new DeeplBrowser(this.settings).translateWithInstance(opts)
    if (result?.translatedText) {
      return result
    }

    result = await new GTransApi().translate(opts)
    if (result?.translatedText) {
      return result
    }

    return result
  }
}

export * from './services/deepl/DeeplBase'
export * from './services/deepl/DeeplBrowser'
export * from './services/deepl/DeeplFetch'
export * from './services/gtrans/api'
