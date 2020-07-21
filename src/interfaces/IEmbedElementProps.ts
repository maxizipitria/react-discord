import Discord from "discord.js";
import type { IEmbedField } from "./IEmbedField";
import type { IHostElementProps } from "./IHostElement";

export interface IEmbedProps extends IHostElementProps {
  author?: Discord.User | Discord.PartialUser;
  color?: string;
  description?: string;
  fields?: IEmbedField[];
  footer?: {
    text?: string;
    iconURL?: string;
  };
  title?: string;
}
