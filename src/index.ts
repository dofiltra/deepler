import { DeeplBase, TTranslateOpts, TTranslateResult } from './services/deepl/DeeplBase'
import { DeeplBrowser } from './services/deepl/DeeplBrowser'
import { DeeplFetch } from './services/deepl/DeeplFetch'

export class Deepler extends DeeplBase {
  async translate(opts: TTranslateOpts): Promise<TTranslateResult> {
    // const result = await new DeeplFetch(this.settings).translate(opts)

    // if (result?.translatedText) {
    //   return result
    // }

    return await new DeeplBrowser(this.settings).translateWithInstance(opts)
  }
}

export * from './services/deepl/DeeplBase'
export * from './services/deepl/DeeplBrowser'
export * from './services/deepl/DeeplFetch'
