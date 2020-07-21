import type { DiscordS } from "../discord";
import type { IHostElement } from "./IHostElement";
import { HostElementType } from "./IHostElementType";

export interface IDiscordRootContainer {
  discord: DiscordS;
  createElement(type: HostElementType, props: any): Promise<IHostElement>;
  removeElement(element: IHostElement): Promise<void>;
}
