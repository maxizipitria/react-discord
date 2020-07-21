import Discord, { Constants } from "discord.js";
import { Observable, Subject, Subscription } from "rxjs";
import { debounceTime, filter } from "rxjs/operators";
import { filterByMessageId, ReactionDetails, ReactionEvent } from "../discord/discord-events";
import { getEmbedAuthorFromUser } from "../helpers/get-author";
import type { IEmbedProps } from "../interfaces/IEmbedElementProps";
import type { IHostElement } from "../interfaces/IHostElement";
import type { IDiscordRootContainer } from "../interfaces/IRootContainer";

export type IEmbedEventTypes = "reaction-added" | "reaction-removed";

export class EmbedHostElement implements IHostElement<IEmbedProps> {
  private allowedReactionsAdded$: Observable<ReactionEvent>;
  private allowedReactionsRemoved$: Observable<ReactionDetails>;
  private reactionAdded$: Observable<ReactionEvent>;
  private reactionRemoved$: Observable<ReactionDetails>;
  private subscription = new Subscription();
  private updateQueue$ = new Subject<Discord.MessageEmbed>();

  constructor(
    public readonly container: IDiscordRootContainer,
    public props: IEmbedProps,
    public readonly message: Discord.Message,
  ) {
    this.createEvents();
    this.refreshEvents(props);

    this.updateQueue$.pipe(debounceTime(100)).subscribe(this._updateMessage.bind(this));
  }

  public dispose(): void {
    this.subscription.unsubscribe();
  }

  public async updateProps(newProps: IEmbedProps): Promise<void> {
    const { onReactionAdded, onReactionRemoved, reactions, ...embedProps } = newProps;

    this.refreshEvents(newProps);

    // Update discord message
    const embed = new Discord.MessageEmbed({
      ...embedProps,
      author: embedProps.author && getEmbedAuthorFromUser(embedProps.author),
    });

    this.updateQueue$.next(embed);
    this.props = newProps;
  }

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

  private createEvents(): void {
    const {
      discord: { events },
    } = this.container;
    const { reactions } = this.props;

    this.reactionAdded$ = events.messageReactionAdd$.pipe(
      filter((event) => {
        return this.message ? filterByMessageId(event, this.message.id) : false;
      }),
    );

    this.reactionRemoved$ = events.messageReactionRemove$.pipe(
      filter((event) => (this.message ? filterByMessageId(event, this.message.id) : false)),
    );

    this.allowedReactionsAdded$ = this.reactionAdded$.pipe(
      filter((event) => {
        const { preventReaction, preventUserReaction, reaction, user } = event;

        // If `validReactions` is not set
        // All reactions should be allowed
        if (!reactions || reactions.length === 0) {
          return false;
        }

        // If we can not find the reaction on the `validReactions`
        // Then we should deny it
        const validReaction = reactions.find((r) => r.name === reaction.emoji.name);
        if (!validReaction) {
          preventReaction();
          return false;
        }

        //
        const userIsAllowed = validReaction.allowList
          ? validReaction.allowList.indexOf(user.id) > -1
          : true;
        if (!userIsAllowed) {
          preventUserReaction();
          return false;
        }

        return true;
      }),
    );

    this.allowedReactionsRemoved$ = this.reactionRemoved$.pipe(
      filter((event) => {
        // If `validReactions` is not set
        // All reactions should be allowed
        if (!reactions || reactions.length == -0) {
          return false;
        }

        // If we can not find the reaction on the `validReactions`
        // Then we should deny it
        const validReaction = reactions.find((r) => r.name === event.reaction.emoji.name);
        if (!validReaction) {
          return false;
        }

        //
        const userIsAllowed = validReaction.allowList
          ? validReaction.allowList.indexOf(event.user.id) > -1
          : true;

        return userIsAllowed;
      }),
    );
  }

  private refreshEvents(newProps: IEmbedProps): void {
    const { onReactionAdded, onReactionRemoved, reactions } = newProps;

    // Remove previous listeners
    const oldSubscription = this.subscription;
    this.subscription = new Subscription();
    oldSubscription.unsubscribe();

    // Add new listeners
    if (onReactionAdded) {
      this.subscription.add(this.reactionAdded$.subscribe(onReactionAdded));
    }
    if (onReactionRemoved) {
      this.subscription.add(this.reactionRemoved$.subscribe(onReactionRemoved));
    }
    if (reactions) {
      for (const reaction of reactions) {
        if (reaction.onAdd) {
          this.subscription.add(
            this.allowedReactionsAdded$
              .pipe(filter((e) => e.reaction.emoji.name === reaction.name))
              .subscribe(reaction.onAdd),
          );
        }

        if (reaction.onRemove) {
          this.subscription.add(
            this.allowedReactionsRemoved$
              .pipe(filter((e) => e.reaction.emoji.name === reaction.name))
              .subscribe(reaction.onRemove),
          );
        }
      }
    }
  }

  private async _updateMessage(props: Discord.MessageEmbed): Promise<void> {
    if (!this.message.editable || this.message.deleted) {
      return;
    }

    try {
      await this.message.edit(props);
    } catch (err) {
      if (err.code !== Constants.APIErrors.UNKNOWN_MESSAGE) {
        throw err;
      }
    }
  }
}
