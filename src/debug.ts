import { ProxyList } from 'proxy-extract'
import { Deepler } from '.'
import { getFetchHap } from './fetch'

const debug = async () => {
  const fh = await getFetchHap()
  const resp = await fh('https://www2.deepl.com/jsonrpc?method=LMT_handle_jobs', {
    timeout: 30e3,
    headers: {
      accept: '*/*',
      'accept-language':
        'en-US,en;q=0.9,ru;q=0.8,da;q=0.7,fr;q=0.6,it;q=0.5,nl;q=0.4,de;q=0.3,la;q=0.2,sl;q=0.1,pt;q=0.1,uk;q=0.1,tr;q=0.1,es;q=0.1,co;q=0.1',
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      pragma: 'no-cache',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site'
    },
    // referrer: 'https://www.deepl.com/',
    // referrerPolicy: 'strict-origin-when-cross-origin',
    body: '{"jsonrpc":"2.0","method": "LMT_handle_jobs","params":{"jobs":[{"kind":"default","raw_en_sentence":"привет как дела? что делаешь? пойдешь гулять?","raw_en_context_before":[],"raw_en_context_after":[],"preferred_num_beams":4}],"lang":{"preference":{"weight":{},"default":"default"},"source_lang_computed":"RU","target_lang":"EN"},"priority":1,"commonJobParams":{"regionalVariant":"en-US","browserType":1},"timestamp":1636369924702},"id":52420022}',
    method: 'POST'
    // mode: 'cors',
    // credentials: 'include'
  })

  console.log(await resp.json())

  // const a = await new Deepler({
  //   // proxy: {
  //   //   url: 'socks5://127.0.0.1:9050'
  //   // } as ProxyList.IFreeProxy
  // }).translate({
  //   text: 'Привет, как дела?',
  //   targetLang: 'EN',
  //   maxOpenedBrowsers: 10,
  //   tryLimit: 10
  // })
}

debug()
