import _ from 'lodash'
import crypto from 'crypto'
import { BrowserManager, devices, Page } from 'browser-manager'
import { sleep } from 'time-helpers'
import { DeeplBase, TTranslateOpts, TTranslateResult } from './DeeplBase'
import { ProxyItem } from 'dprx-types'

export type TBrowserInstance = {
  id: string
  browser: BrowserManager
  page: Page
  idle: boolean
  usedCount: number
  proxyItem?: ProxyItem
}

export class DeeplBrowser extends DeeplBase {
  private static creatingInstances = false
  static instances: TBrowserInstance[] = []

  async translate(opts: TTranslateOpts): Promise<TTranslateResult> {
    const { text, targetLang, maxOpenedBrowsers = 10, tryIndex = 0, tryLimit = 5 } = opts

    if (tryIndex >= tryLimit) {
      return { translatedText: text }
    }

    const { headless } = this.settings

    const pwrt = await BrowserManager.build<BrowserManager>({
      maxOpenedBrowsers,
      launchOpts: {
        headless: headless !== false,
        proxy: (await this.getProxy())?.toPwrt
      },
      device: devices['Pixel 5'],
      lockCloseFirst: 300,
      idleCloseSeconds: 100
    })
    // console.log(await pwrt.checkIp())
    const page = (await pwrt!.newPage({
      url: `https://www.deepl.com/translator#auto/${targetLang.toLowerCase()}/${encodeURI(text)}`,
      waitUntil: 'networkidle'
    })) as Page

    if (!page) {
      await sleep((tryIndex + 1) * 1000)
      return await this.translate({
        ...opts,
        tryIndex: tryIndex + 1
      })
    }

    try {
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
    } catch {
      // log
    }

    try {
      await this.type(page, text.slice(0, 10))
      if (page.url().indexOf(targetLang) === -1) {
        await this.switchTargetLang(page, targetLang)
      }
      await sleep(5e3)

      await this.type(page, text)
      const resp = await this.getHandleJobsResult(pwrt!, page!, text)

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
        ...(await pwrt.getRespResult<any>(page, 'LMT_handle_jobs', text))
      } as any

      const { source_lang, target_lang, translations = [] } = { ...result } as any

      if (result.source_lang && translations.length) {
        const translatedText =
          translations.length > 0 &&
          translations[0].beams?.length > 0 &&
          translations[0].beams[0].postprocessed_sentence

        return { translatedText, source_lang, target_lang }
      }
    } catch {
      // log
    }

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

  async translateWithInstance(opts: TTranslateOpts): Promise<TTranslateResult> {
    const { text, targetLang, tryIndex = 0, tryLimit = 5 } = opts

    if (tryIndex >= tryLimit) {
      return { translatedText: text }
    }

    const inst = await this.getInstance()
    const page = inst?.page
    this.incProxy(inst.proxyItem?.url)

    const result: TTranslateResult | null = await new Promise(async (resolve) => {
      if (!page) {
        await sleep((tryIndex + 1) * 1000)
        return resolve(null)
      }

      try {
        await page.goto(`https://www.deepl.com/translator#auto/${targetLang.toLowerCase()}/`, {
          waitUntil: 'networkidle'
        })
        await sleep(1e3)

        await page.goto(`https://www.deepl.com/translator#auto/${targetLang.toLowerCase()}/${encodeURI(text)}`, {
          waitUntil: 'networkidle'
        })
        const resp = await this.getHandleJobsResult(inst.browser!, page!, text.replaceAll('\n', '').trim())

        if (resp?.translatedText) {
          return resolve(resp)
        }

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
                return resolve({
                  translatedText,
                  source_lang: langs[0]?.toUpperCase(),
                  target_lang: langs[1]?.toUpperCase()
                })
              }
            }

            return resolve({ translatedText })
          }
        }
      } catch {
        // log
      }

      try {
        await this.type(page, text.slice(0, 10))
        if (!page.url().includes(targetLang)) {
          await this.switchTargetLang(page, targetLang)
        }
        await sleep(5e3)
        await this.type(page, text)
        const resp = await this.getHandleJobsResult(inst.browser!, page!, text)

        if (resp?.translatedText) {
          return resolve(resp)
        }
      } catch (e: any) {
        //   console.log(e)
      }

      return resolve(null)
    })

    this.updateInstance(inst.id, {
      idle: true,
      usedCount: inst.usedCount + 1
    })

    if (!result) {
      return await this.translateWithInstance({
        ...opts,
        tryIndex: tryIndex + 1
      })
    }

    return result
  }

  async checkLiveInstance() {
    const { maxInstanceUse = 100 } = this.settings

    DeeplBrowser.instances = (
      await Promise.all(
        DeeplBrowser.instances.map(async (inst) => {
          try {
            const isLive = !!(await inst.browser.isLive())
            if (isLive && inst.usedCount < maxInstanceUse) {
              return inst
            }
            await inst.browser.close()
          } catch {
            //
          }
          return null
        })
      )
    ).filter((inst) => inst) as TBrowserInstance[]
  }

  async createInstances(): Promise<void> {
    if (DeeplBrowser.creatingInstances) {
      await sleep(_.random(1e3, 5e3))
      return await this.createInstances()
    }

    DeeplBrowser.creatingInstances = true
    const { headless, maxInstanceCount = 1, instanceLiveMinutes = 10 } = this.settings
    const newInstancesCount = maxInstanceCount - DeeplBrowser.instances.length
    const instanceLiveMs = instanceLiveMinutes * 60 * 1000

    for (let i = 0; i < newInstancesCount; i++) {
      const proxyItem = await this.getProxy()
      const browser = await BrowserManager.build<BrowserManager>({
        maxOpenedBrowsers: maxInstanceCount,
        launchOpts: {
          headless: headless !== false,
          proxy: proxyItem?.toPwrt
        },
        device: devices['Pixel 5'],
        lockCloseFirst: instanceLiveMs,
        idleCloseSeconds: instanceLiveMs
      })
      const page = (await browser!.newPage({
        url: `https://www.deepl.com/translator`,
        waitUntil: 'networkidle'
      })) as Page

      if (!browser || !page) {
        continue
      }

      DeeplBrowser.instances.push({
        id: crypto.randomBytes(16).toString('hex'),
        idle: true,
        usedCount: 0,
        browser,
        page,
        proxyItem
      })
    }

    DeeplBrowser.creatingInstances = false
  }

  async getInstance(): Promise<TBrowserInstance> {
    await this.checkLiveInstance()
    await this.createInstances()

    const inst = DeeplBrowser.instances.sort((a, b) => a.usedCount - b.usedCount).find((i) => i.idle)

    if (inst) {
      this.updateInstance(inst.id, {
        idle: false,
        usedCount: inst.usedCount + 1
      })
      return inst
    }

    await sleep(_.random(1e3, 5e3))
    return await this.getInstance()
  }

  private updateInstance(id: string, upd: any) {
    const index = DeeplBrowser.instances.findIndex((i) => i.id === id)
    DeeplBrowser.instances[index] = { ...DeeplBrowser.instances[index], ...upd }
  }
}
