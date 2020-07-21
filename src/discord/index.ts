import type { Client } from "discord.js";
import { DiscordEvents } from "./discord-events";

export class DiscordS {
  public events: DiscordEvents;

  constructor(discord: Client) {
    this.events = new DiscordEvents(discord);
  }
}
