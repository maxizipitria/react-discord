import { ReactionDetails, ReactionEvent } from "../discord/discord-events";

export interface IReactionConfig {
  /**
   * List of User IDS allowed to react
   */
  allowList?: string[];

  /**
   * Emoji
   */
  name: string;

  /**
   * Executed it everytime this reaction is added.
   * @param event Object containing the relevant event data
   */
  onAdd?(event: ReactionEvent): void;

  /**
   * Executed it everytime this reaction is removed.
   * @param event Object containing the relevant event data
   */
  onRemove?(event: ReactionDetails): void;
}
