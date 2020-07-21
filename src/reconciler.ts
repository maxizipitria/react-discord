import ReactReconciler from "react-reconciler";
import type { IHostElement } from "./interfaces/IHostElement";
import { HostElementType } from "./interfaces/IHostElementType";
import type { IDiscordRootContainer } from "./interfaces/IRootContainer";

const reconciler = ReactReconciler({
  /* configuration for how to talk to the host environment */
  /* aka "host config" */

  now: Date.now,
  supportsMutation: true,
  isPrimaryRenderer: true,
  setTimeout(handler: (...args: any[]) => void, timeout: number): NodeJS.Timeout {
    return setTimeout(handler, timeout);
  },
  clearTimeout(handle: NodeJS.Timeout): void {
    clearTimeout(handle);
  },

  async createInstance(
    type: HostElementType,
    props: Record<string, unknown>,
    rootContainerInstance: IDiscordRootContainer,
    hostContext,
    internalInstanceHandle,
  ): Promise<IHostElement> {
    return await rootContainerInstance.createElement(type, props);
  },
  async createTextInstance(
    text: string,
    rootContainerInstance: IDiscordRootContainer,
    hostContext,
    internalInstanceHandle,
  ) {
    return await rootContainerInstance.createElement(HostElementType.TEXT, { value: text });
  },

  appendChildToContainer(container, child) {
    // container.appendChild(child);
  },
  appendChild(parent, child) {
    // parent.appendChild(child);
  },
  appendInitialChild(parent, child) {
    // parent.appendChild(child);
  },

  async removeChildFromContainer(container: IDiscordRootContainer, child: Promise<IHostElement>) {
    const element = await child;
    await container.removeElement(element);
  },
  removeChild(parent, child) {
    // parent.removeChild(child);
  },
  insertInContainerBefore(container, child, before) {
    // container.insertBefore(child, before);
  },
  insertBefore(parent, child, before) {
    // parent.insertBefore(child, before);
  },

  async prepareUpdate(
    instance: Promise<IHostElement>,
    type: "embed",
    oldProps: Record<string, unknown>,
    newProps: Record<string, unknown>,
    rootContainerInstance: IDiscordRootContainer,
    currentHostContext,
  ) {
    return null;
  },
  async commitUpdate(
    instance: Promise<IHostElement>,
    updatePayload,
    type: "embed",
    oldProps: Record<string, unknown>,
    newProps: Record<string, unknown>,
    finishedWork,
  ) {
    const element = await instance;
    await element.updateProps(newProps);
  },

  // @ts-ignore
  finalizeInitialChildren() {
    // return false;
  },
  getChildHostContext() {},
  getPublicInstance() {},
  getRootHostContext() {},
  prepareForCommit() {},
  resetAfterCommit() {},
  shouldSetTextContent() {
    return false;
  },
});

export const ReactDiscord = {
  render(whatToRender: JSX.Element, where: IDiscordRootContainer) {
    const container = reconciler.createContainer(where, false, false);
    reconciler.updateContainer(whatToRender, container, null, () => null);
  },
};
