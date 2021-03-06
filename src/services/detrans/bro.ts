/* tslint:disable:no-console */

import _ from 'lodash'
import { BrowserManager, Page } from 'browser-manager'
import { sleep } from 'time-helpers'
import { TransType, TTranslateOpts, TTranslateResult } from '../../types/trans'
import { Dotransa } from '../..'
import { RewriteMode } from 'dprx-types'
import { getSplittedTexts, groupByLimit } from 'split-helper'
import { Proxifible, DoLangApi } from 'dofiltra_api'

export class DeeplBrowser {
  protected limit = 3500

  async translate(opts: TTranslateOpts): Promise<TTranslateResult> {
    const isVialidLang = await DoLangApi.isValidLang(opts.text, opts.targetLang, 0.45)

    if (isVialidLang) {
      return { translatedText: opts.text }
    }

    const splits: string[] = await this.getSplits(opts.text)
    const groupedSplits = groupByLimit(splits, this.limit)

    return await Promise.race([
      new Promise<TTranslateResult>(async (resolve) => {
        await sleep(groupedSplits.length * 1000 * 60)
        return resolve({ translatedText: '' })
      }),

      new Promise<TTranslateResult>(async (resolve) => {
        const translatedText = (
          await Promise.all(
            groupedSplits.map(
              async (split) =>
                await this.microTranslate({
                  ...opts,
                  text: split
                })
            )
          )
        )
          .map((x) => x.translatedText || '')
          .join(' ')

        return resolve({
          translatedText
        })
      })
    ])
  }

  async microTranslate(opts: TTranslateOpts): Promise<TTranslateResult> {
    const { text, targetLang, tryIndex = 0, tryLimit = 5, mode = RewriteMode.Rewrite } = opts

    if (tryIndex >= tryLimit) {
      return { translatedText: text }
    }

    let isVialidLang = await DoLangApi.isValidLang(text, targetLang, 0.45)
    if (isVialidLang) {
      return { translatedText: opts.text }
    }

    const inst = await Dotransa.getInstance(TransType.DeBro)
    const page = inst?.page
    await Proxifible.changeUseCountProxy(inst.proxyItem?.url())

    const result: TTranslateResult | null = await new Promise(async (resolve) => {
      if (!page || page.isClosed()) {
        await sleep((tryIndex + 1) * 1000)
        return resolve(null)
      }

      try {
        // const isPauseProxy = await this.isPauseProxy(page)
        // if (isPauseProxy) {
        //   await Proxifible.changeUseCountProxy(inst.proxyItem?.url(), Proxifible.limitPerProxy)
        //   await Dotransa.closeInstance(inst.id)
        //   return resolve(null)
        // }

        await sleep(250)
        await page.goto(
          `https://www.deepl.com/translator#auto/${targetLang.toLowerCase()}/${encodeURIComponent(text)
            .replaceAll('%5C', '%5C%5C')
            .replaceAll('%2F', '%5C%2F')}`,
          {
            waitUntil: 'networkidle'
          }
        )

        const raceResult = await Promise.race([
          new Promise(async (race) => {
            setTimeout(() => race(null), 30e3)
          }),

          new Promise(async (race) => {
            const respResult = await this.getHandleJobsResult(
              inst.browser,
              page,
              text.replaceAll('\n', '').trim(),
              mode
            )
            if (respResult?.translatedText) {
              return race(respResult)
            }
          }),

          new Promise(async (race) => {
            await sleep(10e3)
            const htmlResult = await this.getResultFromHtml(page, text)
            if (htmlResult?.translatedText) {
              return race(htmlResult)
            }
          })
        ])

        if (raceResult) {
          return resolve(raceResult as TTranslateResult)
        }
      } catch (e: any) {
        console.log(e)
        return resolve(null)
      }

      try {
        await this.typing(page, text.slice(0, 50))
        if (!page.url().includes(targetLang)) {
          await this.switchTargetLang(page, targetLang)
        }
        await sleep(5e3)
        await this.typing(page, text)
        const respResult = await this.getHandleJobsResult(inst.browser!, page!, text)

        if (respResult?.translatedText) {
          return resolve(respResult)
        }

        const htmlResult = await this.getResultFromHtml(page, text)
        if (htmlResult?.translatedText) {
          return resolve(htmlResult)
        }
      } catch (e: any) {
        console.log(e)
        return resolve(null)
      }

      return resolve(null)
    })

    if (inst.page?.isClosed()) {
      await Proxifible.changeUseCountProxy(inst.proxyItem?.url(), Proxifible.limitPerProxy)
      await Dotransa.closeInstance(inst.id)
    } else {
      Dotransa.updateInstance(inst.id, {
        idle: true,
        usedCount: inst.usedCount + 1
      })
    }

    if (!result?.translatedText) {
      return await this.translate({
        ...opts,
        tryIndex: tryIndex + 1
      })
    }

    if (result?.translatedText) {
      isVialidLang = await DoLangApi.isValidLang(result.translatedText, targetLang, 0.45)
      if (!isVialidLang) {
        return await this.microTranslate({
          ...opts,
          tryIndex: tryIndex + 1
        })
      }
    }

    return result
  }

  // protected async needPauseProxy(page: Page) {
  //   try {
  //     const hasBlockedContent = !!(await page.$('.lmt__notification__blocked'))
  //     return hasBlockedContent
  //   } catch {
  //     //
  //   }
  //   return false
  // }

  protected async getHandleJobsResult(
    pwrt: BrowserManager,
    page: Page,
    text: string,
    mode: RewriteMode = RewriteMode.Rewrite
  ): Promise<TTranslateResult | null> {
    try {
      const searchText = text
      // .split('.')[0]
      const { result } = {
        ...(await pwrt.getRespResult<any>(page, 'LMT_handle_jobs', searchText))
      } as any

      const { source_lang, target_lang, translations = [] } = { ...result } as any

      if (source_lang && translations.length > 0 && translations[0].beams?.length > 0) {
        const translatedText = this.getBeamTranslateText(translations, mode)

        if (translatedText) {
          return { translatedText, source_lang, target_lang }
        }
      }
    } catch (error: any) {
      // console.log(error)
    }

    return null
  }

  protected async getTranslatedText({ page }: { page: Page }) {
    try {
      const translatedText = await page.evaluate(() => {
        const el = document.querySelectorAll('textarea')[1]
        return el?.value
      })

      if (translatedText) {
        return translatedText
      }
    } catch {
      //
    }

    try {
      return await (await page?.$('button.lmt__translations_as_text__text_btn'))?.innerText()
    } catch {
      //
    }
  }

  protected async getResultFromHtml(page: Page, text: string): Promise<TTranslateResult | null> {
    try {
      if (!page || page.isClosed()) {
        return null
      }

      let translatedText = ''

      for (let i = 0; i < 10; i++) {
        translatedText = (await this.getTranslatedText({ page })) || ''

        if (translatedText?.includes('[.')) {
          await sleep(1e3)
        } else {
          break
        }
      }

      if (!translatedText) {
        return null
      }

      const hash = page.url().split('#')[1]

      // if (!hash) {
      //   await this.typing(
      //     page,
      //     text
      //       .split(' ')
      //       .filter((x) => x?.trim())
      //       .slice(0, 10)
      //       .join(' ')
      //   )

      //   try {
      //     await page.waitForURL((url: URL) => !!url.hash, {
      //       timeout: 5e3
      //     })
      //   } catch (e: any) {
      //     // console.log(e)
      //   }
      //   hash = page.url().split('#')[1]
      // }

      if (hash) {
        const langs = hash.split('/')
        if (langs.length === 3) {
          return {
            translatedText,
            source_lang: langs[0]?.toUpperCase(),
            target_lang: langs[1]?.toUpperCase()
          } as TTranslateResult
        }
      }

      return { translatedText } as TTranslateResult
    } catch (e: any) {
      //
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
      try {
        // const selector = '.lmt__language_select--target button'
        const selector = '[dl-test="translator-target-lang-btn"]'
        await page.click(selector)
      } catch {
        await page.evaluate(() => {
          const btn: any = Array.from(document.querySelectorAll("button[type='button']")).find((x) =>
            x.className.includes('TargetLanguageToolbar')
          )
          btn?.click()
        })
      }
      await sleep(5e3)

      try {
        const value = lang === 'EN' ? 'en-US' : `${lang.toLowerCase()}-${lang.toUpperCase()}`
        const selector2 = `[dl-test="translator-lang-option-${value}"]`
        await page.click(selector2, {
          timeout: 15
        })
      } catch {
        try {
          const value = lang === 'EN' ? 'en-US' : `${lang.toLowerCase()}`
          const selector2 = `[dl-test="translator-lang-option-${value}"]`
          await page.click(selector2, {
            timeout: 15
          })
        } catch {
          //
        }
      }
    }

    await sleep(5e3)
  }

  protected async typing(page: Page, text: string) {
    try {
      const isMac = process.platform === 'darwin'
      const sourceSelector = 'textarea'

      await page.click(sourceSelector)
      await page.press(sourceSelector, isMac ? 'Meta+KeyA' : 'Control+KeyA')
      await page.press(sourceSelector, 'Backspace')
      await page.type(sourceSelector, text)

      return { result: 'ok' }
    } catch (error) {
      return { error }
    }
  }

  protected getBeamTranslateText(translations: any[], mode: RewriteMode) {
    try {
      if (!translations?.length) {
        return null
      }

      const translatedText = translations.map((trans) => this.getBeam(trans.beams, mode)).join(' ')
      return translatedText
    } catch (error: any) {
      // console.log(error)
      return null
    }
  }

  protected getBeam(beams: any[], mode: RewriteMode) {
    try {
      const texts = beams.map((beam) => beam.postprocessed_sentence || beam.sentences[0].text)

      if (mode === RewriteMode.Shorter) {
        return _.orderBy(texts, 'length', 'asc')[0]
      }
      if (mode === RewriteMode.Longer) {
        return _.orderBy(texts, 'length', 'desc')[0]
      }
      return _.shuffle(texts)[0]
    } catch (error: any) {
      // debugger
      // console.log(error)
    }

    return ''
  }

  protected async getSplits(text: string) {
    const { result: splits } = await DoLangApi.sentences(text)
    if (splits?.length) {
      return splits
    }

    return getSplittedTexts(text, this.limit)
  }
}
