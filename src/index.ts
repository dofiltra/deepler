import { DeeplBase, TTranslateOpts } from './DeeplBase'
import { DeeplBrowser } from './DeeplBrowser'
import { DeeplFetch } from './DeeplFetch'

export class Deepler extends DeeplBase {
  async translate(opts: TTranslateOpts): Promise<any> {
    const result = new DeeplFetch(this.settings).translate(opts)
    
    if (result) {
      return result
    }

    return new DeeplBrowser(this.settings).translate(opts)
  }
}
