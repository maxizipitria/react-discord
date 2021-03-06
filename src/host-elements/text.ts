import Discord, { Constants } from "discord.js";
import type { IHostElement } from "../interfaces/IHostElement";
import type { IRootContainer } from "../interfaces/IRootContainer";
import type { ITextProps } from "../interfaces/ITextElementProps";

export class TextHostElement implements IHostElement<ITextProps> {
  constructor(
    public readonly container: IRootContainer,
    public props: ITextProps,
    public readonly message: Discord.Message,
  ) {}

  public async addInitialReactions(): Promise<void> {
    const reactions = this.props.reactions || [];

    for (const reaction of reactions) {
      if (!this.message || this.message.deleted) {
        break;
      }

      this.message.react(reaction.name).catch((err) => {
        if (err.code !== Constants.APIErrors.UNKNOWN_MESSAGE) {
          throw err;
        }
      });
    }
  }

  public async updateProps(newProps: ITextProps): Promise<void> {
    if (this.message.editable) {
      try {
        await this.message.edit(
          newProps.value,
          newProps.userMentions
            ? { allowedMentions: { users: newProps.userMentions, roles: newProps.roleMentions } }
            : undefined,
        );
      } catch (err) {
        if (err.code !== Constants.APIErrors.UNKNOWN_MESSAGE) {
          throw err;
        }
      }
    }
  }
}
