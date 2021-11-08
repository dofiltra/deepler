import { DeeplBase, TTranslateOpts } from './DeeplBase'
import { getFetchHap } from './fetch'

export class DeeplFetch extends DeeplBase {
  async translate(opts: TTranslateOpts) {}

  private async getTranslate() {
    const fh = await getFetchHap()
    const resp = await fh('https://www2.deepl.com/jsonrpc?method=LMT_handle_jobs', {
      timeout: 30e3,
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'application/json'
      },
      body: '{"jsonrpc":"2.0","method": "LMT_handle_jobs","params":{"jobs":[{"kind":"default","raw_en_sentence":"привет как дела? что делаешь? пойдешь гулять?","raw_en_context_before":[],"raw_en_context_after":[],"preferred_num_beams":4}],"lang":{"preference":{"weight":{},"default":"default"},"source_lang_computed":"RU","target_lang":"EN"},"priority":1,"commonJobParams":{"regionalVariant":"en-US","browserType":1},"timestamp":1636369924702},"id":52420022}',
      method: 'POST'
    })

    const data = await resp.json()
  }
}
