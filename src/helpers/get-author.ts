import Discord from "discord.js";

export function getEmbedAuthorFromUser(
  user: Discord.User | Discord.PartialUser,
): Discord.MessageEmbedAuthor {
  if (!user.username) {
    throw new Error("Unable to get username");
  }

  return {
    name: user.username,
    iconURL: user.avatarURL() || user.defaultAvatarURL || undefined,
  };
}
