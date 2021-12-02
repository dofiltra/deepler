import { BrowserManager, Page } from "browser-manager";
import { ProxyItem } from "dprx-types";

export type TBrowserInstance = {
  id: string
  browser: BrowserManager
  page: Page
  idle: boolean
  usedCount: number
  proxyItem?: ProxyItem
}
