import Discord from "discord.js";
import { DiscordS } from "./discord";
import { EmbedHostElement } from "./host-elements/embed";
import { TextHostElement } from "./host-elements/text";
import type { IEmbedProps } from "./interfaces/IEmbedElementProps";
import type { IHostElement } from "./interfaces/IHostElement";
import { HostElementType } from "./interfaces/IHostElementType";
import type { IRootContainer } from "./interfaces/IRootContainer";
import type { ITextProps } from "./interfaces/ITextElementProps";

export class RootContainer implements IRootContainer {
  public discord: DiscordS;

  constructor(discordClient: Discord.Client, public textChannel: Discord.TextChannel) {
    this.discord = new DiscordS(discordClient);
  }

  public async createElement<P = {}>(type: HostElementType, props: P): Promise<IHostElement> {
    try {
      const textChannel = this.textChannel;

      if (type === HostElementType.EMBED) {
        const discordMessageEmbed = new Discord.MessageEmbed(props);
        const discordMessage = await textChannel.send(discordMessageEmbed);

        const embedProps = props as IEmbedProps;
        const embedElement = new EmbedHostElement(this, embedProps, discordMessage);

        await embedElement.addInitialReactions();

        return embedElement;
      } else if (type === HostElementType.TEXT) {
        const textProps = props as ITextProps;
        const discordMessage = await textChannel.send(textProps.value);
        const textElement = new TextHostElement(this, textProps, discordMessage);

        return textElement;
        // return;
      }
    } catch (err) {
      throw err;
    }

    throw new Error();
  }

  public async removeElement(element: IHostElement): Promise<void> {
    if (element.dispose) {
      element.dispose();
    }

    if (element.message.deletable) {
      try {
        await element.message.delete();
      } catch (err) {
        throw err;
      }
    }
  }
}
