/* tslint:disable:no-console */
import _ from 'lodash'
import crypto from 'crypto'
import { sleep } from 'time-helpers'
import { DeeplBrowser, GTransApi } from '../..'
import { TTranslateOpts, TransType, TTranslateResult, TBrowserInstance, TInstanceOpts } from '../../types/trans'
import { Proxifible } from 'dprx-types'
import { BrowserManager, devices, Page } from 'browser-manager'
import PQueue from 'p-queue'

export class Dotransa {
  static instances: TBrowserInstance[] = []

  protected static creatingInstances = false
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

  static async build(instanceOpts?: TInstanceOpts[]) {
    if (instanceOpts) {
      this.instanceOpts = instanceOpts
    }

    if (!Proxifible.proxies.length) {
      await Proxifible.loadProxies()
    }

    await this.createInstances()

    const queue = this.queue
    // let activeCount = 0
    // let completedCount = 0

    queue.concurrency = instanceOpts?.reduce((sum, instOpts) => sum + instOpts.maxInstance, 0) || 1
    queue.on('active', () => {
      // console.log(`Dotransa on item #${++activeCount}.  Size: ${queue.size}  Pending: ${queue.pending} | Date: ${new Date().toJSON()}`)
    })
    queue.on('completed', (result) => {
      //   console.log(`#${++completedCount} Dotransa completed | Date: ${new Date().toJSON()}\n`,
      //     result?.originalText?.slice(0, 30), ' --> ', result?.translatedText?.slice(0, 30)
      //   )
    })
    queue.on('error', (error) => console.log('\n---\nDotransa error', error))
    queue.on('idle', async () => {
      // console.log(`Dotransa queue is idle.  Size: ${queue.size}  Pending: ${queue.pending}`)
    })

    return new this(true)
  }

  protected static async createInstances() {
    if (this.creatingInstances) {
      while (this.creatingInstances) {
        await sleep(_.random(10e3, 15e3))
      }

      if (this.instances.length) {
        return
      }
    }

    this.creatingInstances = true
    for (const opts of this.instanceOpts) {
      const { type, maxInstance } = opts
      const newInstanceCount = maxInstance - this.instances.filter((inst) => inst?.type === type).length

      if (newInstanceCount < 1) {
        continue
      }

      switch (type) {
        case TransType.DeBro:
          await this.createDeBro(opts, newInstanceCount)
          break
        case TransType.GoBro:
          break
        case TransType.YaBro:
          break
      }
    }
    this.creatingInstances = false
  }

  protected static async closeDeadInstances() {
    this.instances = (
      await Promise.all(
        this.instances.map(async (inst) => {
          try {
            const isLive = !!(await inst.browser.isLive())
            if (isLive && inst.usedCount < inst.maxPerUse) {
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
      .filter((ins) => ins?.type === type)
      .sort((a, b) => a.usedCount - b.usedCount)
      .find((i) => i.idle)

    if (inst) {
      this.updateInstance(inst.id, {
        idle: false,
        usedCount: inst.usedCount + 1
      })
      return inst
    }

    await sleep(_.random(3e3, 7e3))
    await this.closeDeadInstances()
    await this.createInstances()
    return await this.getInstance(type)
  }

  static updateInstance(id: string, upd: any) {
    const index = this.instances.findIndex((i) => i?.id === id)
    this.instances[index] = { ...this.instances[index], ...upd }
  }

  static async closeInstance(id: string) {
    const index = this.instances.findIndex((i) => i?.id === id)
    await this.instances[index]?.browser?.close()
    delete this.instances[index]
  }

  protected static async createDeBro(opts: TInstanceOpts, newInstancesCount: number): Promise<void> {
    const { headless, maxPerUse = 100, liveMinutes = 10 } = opts
    const instanceLiveSec = liveMinutes * 60

    const isDynamicMode = _.random(true) > 0.9
    const sortBy: ('changeUrl' | 'useCount')[] = ['changeUrl', 'useCount']
    const sortOrder: ('asc' | 'desc')[] = [isDynamicMode ? 'asc' : 'desc', 'asc']
    const proxies = await Proxifible.getProxies(
      {
        filterTypes: ['http', 'https'],
        filterVersions: [4],
        sortBy,
        sortOrder,
        forceChangeIp: true
      },
      newInstancesCount
    )

    await Promise.all(
      new Array(...new Array(newInstancesCount)).map(async (x, i) => {
        await sleep(i * 2000)
        console.log(`Dotransa: Creating instance...`)

        const proxyItem = proxies[i]
        if (!proxyItem) {
          return
        }

        const id = crypto.randomBytes(16).toString('hex')
        const browser = await BrowserManager.build<BrowserManager>({
          maxOpenedBrowsers: Number.MAX_SAFE_INTEGER,
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
            resourceTypes: ['stylesheet', 'image', 'media']
          }
        })) as Page

        if (!browser || !page || page.isClosed()) {
          await Proxifible.changeUseCountProxy(proxyItem?.url(), Proxifible.limitPerProxy)
          return
        }

        page.on('response', async (response) => {
          if (response.status() !== 429) {
            return
          }
          // debugger
          await Proxifible.changeUseCountProxy(proxyItem?.url(), Proxifible.limitPerProxy)
          await this.closeInstance(id)
        })

        console.log(`Dotransa: Instance #${this.instances.length + 1} of ${opts.maxInstance}`)

        this.instances.push({
          id,
          type: TransType.DeBro,
          idle: true,
          usedCount: 0,
          maxPerUse,
          browser,
          page,
          proxyItem
        } as TBrowserInstance)
      })
    )
  }

  constructor(isBuild: boolean) {
    if (!isBuild) {
      throw new Error('use static Dotransa.build(settings)')
    }
  }

  async translate(
    opts: TTranslateOpts,
    priors: TransType[] = [TransType.DeBro, TransType.YaBro, TransType.GoApi]
  ): Promise<TTranslateResult> {
    const id = crypto.randomBytes(16).toString('hex')
    await Dotransa.queue.add(() => this.translateQueue(id, opts, priors))
    await sleep(Dotransa.queue.size * 1000)

    while (!Dotransa.translateResults[id]) {
      await sleep(_.random(1e3, 3e3))
    }

    const result = Dotransa.translateResults[id]
    delete Dotransa.translateResults[id]

    return result
  }

  protected async translateQueue(
    queueId: string,
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

    Dotransa.translateResults[queueId] = result || { translatedText: opts.text }

    return {
      translatedText: Dotransa.translateResults[queueId]?.translatedText,
      originalText: opts.text,
      targetLang: opts.targetLang
    }
  }
}
