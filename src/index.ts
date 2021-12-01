import { TransBase, TransPrior, TTranslateOpts, TTranslateResult } from './services/base/TransBase'
import { DeeplBrowser } from './services/detrans/bro'
import { GTransApi } from './services/gtrans/api'

export class Deepler extends TransBase {
  async translate(
    opts: TTranslateOpts,
    priors: TransPrior[] = [TransPrior.DeBro, TransPrior.YaBro, TransPrior.GoApi]
  ): Promise<TTranslateResult> {
    let result

    for (const prior of priors) {
      if (prior === TransPrior.DeBro) {
        result = await new DeeplBrowser(this.settings).translateWithInstance(opts)
        if (result?.translatedText) {
          return result
        }
        continue
      }

      if (prior === TransPrior.GoApi) {
        result = await new GTransApi(this.settings).translate(opts)
        if (result?.translatedText) {
          return result
        }
        continue
      }

      if (prior === TransPrior.YaBro) {
        continue
      }
    }

    return { translatedText: opts.text }
  }
}

export * from './services/base/TransBase'
export * from './services/detrans/bro'
export * from './services/gtrans/api'
