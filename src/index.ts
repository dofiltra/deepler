import { BrowserManager, chromium, devices, Page } from 'browser-manager'
import { ProxyList } from 'proxy-extract'
import { sleep } from 'time-helpers'

type TDeeplSettings = {
  proxy?: ProxyList.IFreeProxy
}

type TTranslateOpts = {
  text: string
  targetLang: string

  maxOpenedBrowsers?: number
  tryLimit?: number
  tryIndex?: number
}

class Deepler {
  protected _settings: TDeeplSettings

  constructor(s: TDeeplSettings) {
    this._settings = {
      ...s
    }
  }

  async translate(opts: TTranslateOpts): Promise<any> {
    const { text, targetLang, maxOpenedBrowsers = 10, tryIndex = 0, tryLimit = 2 } = opts

    if (tryIndex >= tryLimit) {
      return { translatedText: text }
    }

    let proxy
    if (this._settings.proxy?.url) {
      proxy = {
        server: this._settings.proxy?.url
      }
    }

    const pwrt: BrowserManager = await BrowserManager.build({
      maxOpenedBrowsers,
      launchOpts: {
        headless: true,
        proxy
      },
      device: devices['Pixel 5']
    })
    const page = (await pwrt.newPage({
      autoCloseTimeout: 180e3,
      url: `https://www.deepl.com/translator#auto/${targetLang.toLowerCase()}/${encodeURI(text)}`,
      waitUntil: 'networkidle'
    })) as Page

    pwrt.lockClose(120)
    const el = await page.$('button.lmt__translations_as_text__text_btn')
    if (el) {
      const translatedText = await el.innerText()

      if (translatedText) {
        let hash = page.url().split('#')[1]

        if (!hash) {
          await this.type(
            page,
            text
              .split(' ')
              .filter((x) => x?.trim())
              .slice(0, 10)
              .join(' ')
          )

          try {
            await page.waitForURL((url: URL) => !!url.hash, {
              timeout: 5e3
            })
          } catch (e: any) {
            // console.log(e)
          }
          hash = page.url().split('#')[1]
        }

        if (hash) {
          const langs = hash.split('/')
          if (langs.length === 3) {
            await pwrt?.close('from translate 2')

            return {
              translatedText,
              source_lang: langs[0]?.toUpperCase(),
              target_lang: langs[1]?.toUpperCase()
            }
          }
        }

        await pwrt?.close('from translate 3')
        return { translatedText }
      }
    }

    try {
      await this.type(page, text.slice(0, 10))
      if (page.url().indexOf(targetLang) === -1) {
        await this.switchTargetLang(page, targetLang)
      }
      await sleep(5e3)

      await this.type(page, text)
      const resp = await this.getHandleJobsResult(pwrt, page, text)

      if (resp?.translatedText) {
        await pwrt?.close('from translate 4')
        return resp
      }
    } catch (e: any) {
      //   console.log(e)
    }

    await pwrt?.close('from translate 5')
    return await this.translate({
      ...opts,
      tryIndex: tryIndex + 1
    })
  }

  protected async getHandleJobsResult(pwrt: BrowserManager, page: Page, text: string) {
    try {
      const { result } = {
        ...(await pwrt.getRespResult(page, 'LMT_handle_jobs', text))
      } as any

      const { source_lang, target_lang, translations = [] } = { ...result } as any

      if (result.source_lang && translations.length) {
        const translatedText =
          translations.length > 0 &&
          translations[0].beams?.length > 0 &&
          translations[0].beams[0].postprocessed_sentence

        return { translatedText, source_lang, target_lang }
      }
    } catch {}

    return null
  }

  protected async switchTargetLang(page: Page, lang: string) {
    try {
      const selector = '.lmt__language_select--target select.lmt__language_select__mobileLangSelect'
      const value = lang === 'EN' ? '{"lang":"EN","variant":"en-US"}' : `{"lang":"${lang.toUpperCase()}"}`

      await page.selectOption(selector, value, {
        timeout: 10e3
      })
    } catch {
      const selector = '.lmt__language_select--target button'
      await page.click(selector)
      await sleep(5e3)

      const value = lang === 'EN' ? 'en-US' : `${lang.toLowerCase()}-${lang.toUpperCase()}`
      const selector2 = `[dl-test="translator-lang-option-${value}"]`
      await page.click(selector2)
    }

    await sleep(5e3)
  }

  protected async type(page: Page, text: string) {
    try {
      const isWin = process.platform === 'win32'
      const sourceSelector = 'textarea.lmt__source_textarea'

      await page.click(sourceSelector)
      await page.press(sourceSelector, isWin ? 'Control+KeyA' : 'Meta+KeyA')
      await page.press(sourceSelector, 'Backspace')
      await page.type(sourceSelector, text)

      return { result: 'ok' }
    } catch (error) {
      return { error }
    }
  }
}

export { Deepler }
