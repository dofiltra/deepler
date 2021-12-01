import { TransBase, TTranslateOpts, TTranslateResult } from './services/base/TransBase'
import { DeeplBrowser } from './services/deepl/DeeplBrowser'
import { GTransApi } from './services/gtrans/api'

export class Deepler extends TransBase {
  async translate(
    opts: TTranslateOpts,
    prior: ('deeplbro' | 'gapi' | 'yabro')[] = ['deeplbro', 'yabro', 'gapi']
  ): Promise<TTranslateResult> {
    let result

    for (const priorName of prior) {
      if (priorName === 'deeplbro') {
        result = await new DeeplBrowser(this.settings).translateWithInstance(opts)
        if (result?.translatedText) {
          return result
        }
        continue
      }

      if (priorName === 'gapi') {
        result = await new GTransApi(this.settings).translate(opts)
        if (result?.translatedText) {
          return result
        }
        continue
      }

      if (priorName === 'yabro') {
        continue
      }
    }

    return { translatedText: opts.text }
  }
}

export * from './services/base/TransBase'
export * from './services/deepl/DeeplBrowser'
export * from './services/deepl/DeeplFetch'
export * from './services/gtrans/api'
