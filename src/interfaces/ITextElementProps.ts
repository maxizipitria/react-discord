import { IHostElementProps } from "./IHostElement";

export interface ITextProps extends IHostElementProps {
  roleMentions?: string[];
  userMentions?: string[];
  value?: string;
}
