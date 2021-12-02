import _ from 'lodash'
import crypto from 'crypto'
import { sleep } from 'time-helpers'
import { DeeplBrowser, GTransApi } from '../..'
import { TTranslateOpts, TransType, TTranslateResult, TBrowserInstance, TInstanceOpts } from '../../types/trans'
import { Proxifible } from './Proxifible'
import { BrowserManager, devices, Page } from 'browser-manager'
import { ProxyItem } from 'dprx-types'

export class Dotransa {
  protected static creatingInstances = false
  protected static instances: TBrowserInstance[] = []
  protected static instanceOpts: TInstanceOpts[] = [
    {
      type: TransType.DeBro,
      liveMinutes: 10,
      maxPerUse: 100,
      maxInstance: 1
    },
    {
      type: TransType.GoBro,
      liveMinutes: 10,
      maxPerUse: 100,
      maxInstance: 1
    },
    {
      type: TransType.YaBro,
      liveMinutes: 10,
      maxPerUse: 100,
      maxInstance: 1
    }
  ]

  static async build(instanceOpts: TInstanceOpts[], proxies?: ProxyItem[]) {
    Dotransa.instanceOpts = instanceOpts
    Proxifible.proxies = proxies || []
    await this.createInstances()

    return new Dotransa(true)
  }

  protected static async createInstances() {
    if (Dotransa.creatingInstances) {
      while (Dotransa.creatingInstances) {
        await sleep(_.random(10e3, 15e3))
      }

      if (Dotransa.instances.length) {
        return
      }
    }

    Dotransa.creatingInstances = true
    for (const opts of Dotransa.instanceOpts) {
      const { type, maxInstance } = opts
      const newInstanceCount = maxInstance - Dotransa.instances.filter((inst) => inst.type === type).length

      if (newInstanceCount < 1) {
        continue
      }

      switch (type) {
        case TransType.DeBro:
          await Dotransa.createDeBro(opts, newInstanceCount)
          break
        case TransType.GoBro:
          break
        case TransType.YaBro:
          break
      }
    }
    Dotransa.creatingInstances = false
  }

  protected static async closeDeadInstances() {
    Dotransa.instances = (
      await Promise.all(
        Dotransa.instances.map(async (inst) => {
          try {
            const isLive = !!(await inst.browser.isLive())
            if (isLive && inst.usedCount < inst.maxUse) {
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

  static async getInstance(type: TransType): Promise<TBrowserInstance> {
    const inst = this.instances
      .filter((inst) => inst.type === type)
      .sort((a, b) => a.usedCount - b.usedCount)
      .find((i) => i.idle)

    if (inst) {
      this.updateInstance(inst.id, {
        idle: false,
        usedCount: inst.usedCount + 1
      })
      return inst
    }
    
    await sleep(_.random(5e3, 10e3))
    await this.closeDeadInstances()
    await this.createInstances()
    return await this.getInstance(type)
  }

  static updateInstance(id: string, upd: any) {
    const index = Dotransa.instances.findIndex((i) => i.id === id)
    Dotransa.instances[index] = { ...Dotransa.instances[index], ...upd }
  }

  static async closeInstance(id: string) {
    const index = Dotransa.instances.findIndex((i) => i.id === id)
    await Dotransa.instances[index]?.browser?.close()
  }

  protected static async createDeBro(opts: TInstanceOpts, newInstancesCount: number): Promise<void> {
    const { headless, maxInstance: maxCount = 1, maxPerUse: maxUse = 100, liveMinutes = 10 } = opts
    const instanceLiveSec = liveMinutes * 60

    for (let i = 0; i < newInstancesCount; i++) {
      const id = crypto.randomBytes(16).toString('hex')
      const proxyItem = await Proxifible.getProxy()
      const browser = await BrowserManager.build<BrowserManager>({
        maxOpenedBrowsers: maxCount,
        launchOpts: {
          headless: headless !== false,
          proxy: proxyItem?.toPwrt()
        },
        device: devices['Pixel 5'],
        lockCloseFirst: instanceLiveSec,
        idleCloseSeconds: instanceLiveSec
      })
      const page = (await browser!.newPage({
        url: `https://www.deepl.com/translator`,
        waitUntil: 'networkidle',
        blackList: {
          resourceTypes: ['stylesheet', 'image']
        }
      })) as Page

      if (!browser || !page) {
        continue
      }

      page.on('response', async (response) => {
        if (response.status() !== 429) {
          return
        }
        await Proxifible.incProxy(proxyItem?.url(), Proxifible.limitPerProxy)
        await this.closeInstance(id)
      })

      Dotransa.instances.push({
        id,
        type: TransType.DeBro,
        idle: true,
        usedCount: 0,
        maxUse,
        browser,
        page,
        proxyItem
      })
    }
  }

  constructor(isBuild: boolean) {
    if (!isBuild) {
      throw 'use static Dotransa.build(settings)'
    }
  }

  async translate(
    opts: TTranslateOpts,
    priors: TransType[] = [TransType.DeBro, TransType.YaBro, TransType.GoApi]
  ): Promise<TTranslateResult> {
    let result

    for (const prior of priors) {
      if (prior === TransType.DeBro) {
        result = await new DeeplBrowser().translate(opts)
        if (result?.translatedText) {
          return result
        }
        continue
      }

      if (prior === TransType.GoApi) {
        result = await new GTransApi().translate(opts)
        if (result?.translatedText) {
          return result
        }
        continue
      }

      if (prior === TransType.YaBro) {
        continue
      }
    }

    return { translatedText: opts.text }
  }
}
