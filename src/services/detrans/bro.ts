import _ from 'lodash'
import { BrowserManager, Page } from 'browser-manager'
import { sleep } from 'time-helpers'
import { TransMode, TransType, TTranslateOpts, TTranslateResult } from '../../types/trans'
import { Dotransa } from '../..'
import { Proxifible } from 'dprx-types'
import { getSplittedTexts } from 'split-helper'
import { DoLangApi } from 'dofiltra_api'

export class DeeplBrowser {
  protected limit = 3500

  async translate(opts: TTranslateOpts): Promise<TTranslateResult> {
    const splits = await this.getSplits(opts.text)
    let translatedText = ''

    for (const split of splits) {
      const { translatedText: microTranslatedText } = await this.microTranslate({
        ...opts,
        text: split
      })
      translatedText += microTranslatedText + ' '
    }

    return {
      translatedText
    }
  }

  async microTranslate(opts: TTranslateOpts): Promise<TTranslateResult> {
    const { text, targetLang, tryIndex = 0, tryLimit = 5, mode = TransMode.Auto } = opts

    if (tryIndex >= tryLimit) {
      return { translatedText: text }
    }

    const inst = await Dotransa.getInstance(TransType.DeBro)
    const page = inst?.page
    Proxifible.changeUseCountProxy(inst.proxyItem?.url())

    const result: TTranslateResult | null = await new Promise(async (resolve) => {
      if (!page) {
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

        await page.goto(`https://www.deepl.com/translator#auto/${targetLang.toLowerCase()}/${encodeURI(text)}`, {
          waitUntil: 'networkidle'
        })
        const respResult = await this.getHandleJobsResult(inst.browser!, page!, text.replaceAll('\n', '').trim(), mode)

        if (respResult?.translatedText) {
          return resolve(respResult)
        }

        const htmlResult = await this.getResultFromHtml(page, text)
        if (htmlResult?.translatedText) {
          return resolve(htmlResult)
        }
      } catch (e: any) {
        if (e?.message?.toLowerCase().includes('closed')) {
          await Dotransa.closeInstance(inst.id)
          return resolve(null)
        }
      }

      try {
        await this.typing(page, text.slice(0, 10))
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
        if (e?.message?.toLowerCase().includes('closed')) {
          await Dotransa.closeInstance(inst.id)
          return resolve(null)
        }
      }

      return resolve(null)
    })

    Dotransa.updateInstance(inst.id, {
      idle: true,
      usedCount: inst.usedCount + 1
    })

    if (!result) {
      return await this.translate({
        ...opts,
        tryIndex: tryIndex + 1
      })
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
    mode: TransMode = TransMode.Auto
  ) {
    try {
      const searchText = text.split('.')[0]
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

  protected async getResultFromHtml(page: Page, text: string) {
    const el = await page.$('button.lmt__translations_as_text__text_btn')
    if (el) {
      const translatedText = await el.innerText()

      if (translatedText) {
        let hash = page.url().split('#')[1]

        if (!hash) {
          await this.typing(
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
            return {
              translatedText,
              source_lang: langs[0]?.toUpperCase(),
              target_lang: langs[1]?.toUpperCase()
            }
          }
        }

        return { translatedText }
      }
    }
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

  protected async typing(page: Page, text: string) {
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

  protected getBeamTranslateText(translations: any[], mode: TransMode) {
    try {
      if (!translations?.length) {
        return null
      }

      const translatedText = translations.map((trans) => this.getBeam(trans.beams, mode)).join(' ')

      return translatedText

      // const sentencesByIds: { [id: string]: string[] } = {}

      // for (const trans of translations) {
      //   const beam = this.getBeam(trans.beams, mode)
      //   const sentence = beam.sentences[0]
      //   const id = sentence.ids[0]

      //   sentencesByIds[id] ||= []
      //   sentencesByIds[id].push(sentence.text)
      // }

      // const translatedText = Object.keys(sentencesByIds)
      //   .sort()
      //   .map((id) => {})
      //   .join(' ')

      // return translatedText
      // const translatedTexts = translations
      //   .map((translation) => {
      //     const beam = translation.beams[0]

      //     if (beam.postprocessed_sentence) {
      //       return beam.postprocessed_sentence
      //     }

      //     const sentence = beam.sentences?.length && beam.sentences[0]
      //     if (sentence?.text) {
      //       return sentence.text
      //     }
      //   })
      //   .filter((text) => text)

      // if (translations[0].beams[0].postprocessed_sentence) {
      //   return translatedTexts.join(' ')
      // }

      // // if need join
      // //  return translatedTexts.join(' ')

      // if (mode === TransMode.Shorten) {
      //   return _.orderBy(translatedTexts, 'length', 'asc')[0]
      // }

      // if (mode === TransMode.Expand) {
      //   return _.orderBy(translatedTexts, 'length', 'desc')[0]
      // }

      // return _.shuffle(translatedTexts)[0]
    } catch (error: any) {
      // console.log(error)

      return null
    }
  }

  protected getBeam(beams: any[], mode: TransMode) {
    try {
      const texts = beams.map((beam) => beam.sentences[0].text)

      if (mode === TransMode.Shorten) {
        return _.orderBy(texts, 'length', 'asc')[0]
      }
      if (mode === TransMode.Expand) {
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
    const { result } = await DoLangApi.detect(text)
    const lang = result?.length && result[0] && result[0].code

    if (lang) {
      const { result: splits } = await DoLangApi.sentences(text, lang)
      if (splits?.length) {
        return splits
      }
    }

    return getSplittedTexts(text, this.limit)
  }
}
