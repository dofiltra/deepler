/* tslint:disable:no-console */
import _ from 'lodash'
import crypto from 'crypto'
import { sleep } from 'time-helpers'
import { DeeplBrowser, GTransApi } from '../..'
import { TTranslateOpts, TransType, TTranslateResult, TBrowserInstance, TInstanceOpts } from '../../types/trans'
import { Proxifible } from './Proxifible'
import { BrowserManager, devices, Page } from 'browser-manager'
import { ProxyItem } from 'dprx-types'
import PQueue from 'p-queue'

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
  protected static queue = new PQueue({ concurrency: 1 })
  protected static translateResults: { [id: string]: TTranslateResult } = {}

  static async build(instanceOpts: TInstanceOpts[], proxies?: ProxyItem[]) {
    Dotransa.instanceOpts = instanceOpts
    Proxifible.proxies = proxies || []
    await this.createInstances()

    const queue = Dotransa.queue
    let activeCount = 0
    let completedCount = 0

    queue.concurrency = instanceOpts.reduce((sum, instOpts) => sum + instOpts.maxInstance, 0)
    queue.on('active', () => {
      console.log(
        `Dotransa on item #${++activeCount}.  Size: ${queue.size}  Pending: ${
          queue.pending
        } | Date: ${new Date().toJSON()}`
      )
    })
    queue.on('completed', (result) => {
      console.log(
        `#${++completedCount} Dotransa completed | Date: ${new Date().toJSON()}\n`,
        result?.originalText?.slice(0, 30),
        ' --> ',
        result?.translatedText?.slice(0, 30)
      )
    })
    queue.on('error', (error) => console.log('error', error))
    queue.on('idle', async () => {
      console.log(`Dotransa queue is idle.  Size: ${queue.size}  Pending: ${queue.pending}`)
    })

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
      .filter((ins) => ins.type === type)
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
        // debugger
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
    const id = crypto.randomBytes(16).toString('hex')
    await Dotransa.queue.add(() => this.translateQueue(id, opts, priors))

    while (!Dotransa.translateResults[id]) {
      await sleep(_.random(3e3, 10e3))
    }

    const result = Dotransa.translateResults[id]
    delete Dotransa.translateResults[id]

    return result
  }

  protected async translateQueue(
    id: string,
    opts: TTranslateOpts,
    priors: TransType[] = [TransType.DeBro, TransType.YaBro, TransType.GoApi]
  ) {
    let result

    for (const prior of priors) {
      if (prior === TransType.DeBro) {
        result = await new DeeplBrowser().translate(opts)
        if (result?.translatedText) {
          break
        }
        continue
      }

      if (prior === TransType.GoApi) {
        result = await new GTransApi().translate(opts)
        if (result?.translatedText) {
          break
        }
        continue
      }

      if (prior === TransType.YaBro) {
        continue
      }
    }

    Dotransa.translateResults[id] = result || { translatedText: opts.text }

    return { translatedText: Dotransa.translateResults[id]?.translatedText, originalText: opts.text }
  }
}
