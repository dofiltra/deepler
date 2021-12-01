import { DeeplBase, TTranslateOpts, TTranslateResult } from './services/deepl/DeeplBase'
import { DeeplBrowser } from './services/deepl/DeeplBrowser'
import { DeeplFetch } from './services/deepl/DeeplFetch'
import { GTransApi } from './services/gtrans/api'

export class Deepler extends DeeplBase {
  async translate(
    opts: TTranslateOpts,
    prior: ('deepl' | 'google' | 'ya')[] = ['deepl', 'google', 'ya']
  ): Promise<TTranslateResult> {
    let result

    for (const priorName of prior) {
      if (priorName === 'deepl') {
        result = await new DeeplBrowser(this.settings).translateWithInstance(opts)
        if (result?.translatedText) {
          return result
        }
        continue
      }

      if (priorName === 'google') {
        result = await new GTransApi().translate(opts)
        if (result?.translatedText) {
          return result
        }
        continue
      }

      if (priorName === 'ya') {
        continue
      }
    }

    return { translatedText: opts.text }
  }
}

export * from './services/deepl/DeeplBase'
export * from './services/deepl/DeeplBrowser'
export * from './services/deepl/DeeplFetch'
export * from './services/gtrans/api'
