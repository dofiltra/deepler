import { DeeplBrowser, GTransApi } from "../.."
import { TransBase, TTransSettings, TTranslateOpts, TransPrior, TTranslateResult } from "./TransBase"

export class Dotransa extends TransBase {
  static async build(s: TTransSettings) {
    const { maxInstanceUse = 100, maxInstanceCount = 1 } = s

    return new Dotransa(s, true)
  }

  constructor(s: TTransSettings, isBuild: boolean) {
    if (!isBuild) {
      throw 'use static Dotransa.build(settings)'
    }
    super(s)
  }

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
