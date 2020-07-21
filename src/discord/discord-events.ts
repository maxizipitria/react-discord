import Discord, { Constants } from "discord.js";
import { Subject, Observable } from "rxjs";

/**
 * Only one instance of this service should exist on the whole app
 */
export class DiscordEvents {
  public message$: Observable<Discord.Message>;
  public messageReactionAdd$: Observable<ReactionEvent>;
  public messageReactionRemove$: Observable<ReactionDetails>;
  public voiceStateUpdate$: Observable<VoiceStateUpdateEvent>;

  private _message$ = new Subject<Discord.Message>();
  private _messageReactionAdd$ = new Subject<ReactionEvent>();
  private _messageReactionRemove$ = new Subject<ReactionDetails>();
  private _voiceStateUpdate$ = new Subject<VoiceStateUpdateEvent>();

  constructor(private client: Discord.Client) {
    this.message$ = this._message$.asObservable();
    this.messageReactionAdd$ = this._messageReactionAdd$.asObservable();
    this.messageReactionRemove$ = this._messageReactionRemove$.asObservable();
    this.voiceStateUpdate$ = this._voiceStateUpdate$.asObservable();

    this.listen();
  }

  private listen() {
    this.client.on("message", (message) => {
      this._message$.next(message);
    });

    this.client.on("messageReactionAdd", (reaction, user) => {
      const myself = user.id === this.client.user?.id;
      if (myself) {
        return;
      }

      const preventReaction = async () => {
        if (reaction.message.deleted) {
          return;
        }

        try {
          await reaction.remove();
        } catch (err) {
          if (err.code !== Constants.APIErrors.UNKNOWN_MESSAGE) {
            throw new Error(err);
          }
        }
      };

      const preventUserReaction = async () => {
        if (reaction.message.deleted) {
          return;
        }

        try {
          await reaction.users.remove(user.id);
        } catch (err) {
          if (err.code !== Constants.APIErrors.UNKNOWN_MESSAGE) {
            throw new Error(err);
          }
        }
      };

      this._messageReactionAdd$.next({
        reaction,
        user,
        preventReaction,
        preventUserReaction,
      });
    });

    this.client.on("messageReactionRemove", (reaction, user) => {
      const myself = user.id === this.client.user?.id;
      if (myself) {
        return;
      }

      this._messageReactionRemove$.next({
        reaction,
        user,
      });
    });

    this.client.on("voiceStateUpdate", (previousChannel, currentVoiceChannel) => {
      const userActorId = previousChannel.member?.user.id || currentVoiceChannel.member?.user.id;
      if (!userActorId) {
        return;
      }

      this._voiceStateUpdate$.next({ userActorId, previousChannel, currentVoiceChannel });
    });
  }
}

export function filterByReactionName(...reactionName: string[]) {
  const filter = (event: ReactionEvent): boolean =>
    reactionName.indexOf(event.reaction.emoji.name) > -1;
  return filter;
}

export function filterByAuthor(...authorId: string[]) {
  const filter = (event: ReactionEvent): boolean => authorId.indexOf(event.user.id) > -1;
  return filter;
}

export function filterByMessageId(event: ReactionDetails, messageId: string) {
  return event.reaction.message.id === messageId;
}

export interface ReactionDetails {
  reaction: Discord.MessageReaction;
  user: Discord.User | Discord.PartialUser;
}

export interface ReactionEvent extends ReactionDetails {
  preventReaction(): Promise<void>;
  preventUserReaction(): Promise<void>;
}

export interface VoiceStateUpdateEvent {
  userActorId: string;
  currentVoiceChannel: Discord.VoiceState;
  // moveBack(): Promise<void>;
  previousChannel: Discord.VoiceState;
}
