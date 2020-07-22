# React-Discord

### Introduction

React-discord is small react-reconciler to use with Discord.js to make bot flows using text messages.

This library only provides only 2 host components:

- Embeds
- Text

Both components make use of reactions to enable interactivity with components

### Examples

```typescript
import Discord from "discord.js";
import React from "react";
import ReactDiscord, { DiscordS, Embed, RootContainer } from "react-discord";

const YOUR_DISCORD_CLIENT: Discord.Client;

function MyComponent(props) {
  return <Embed title={props.text} description="Lorem ipsum dolor sit amet" />;
}

// 1. We need to create a discord-client-wrapper
const discordWrapper = new DiscordS(YOUR_DISCORD_CLIENT);

// 2. Now we need to create the react-discord root container
const rootContainer = new RootContainer(
  discordWrapper,
  textChannel, // <- You need to provide a text channel from the discord.js library
);

// 3. Finally we can render our component
ReactDiscord.render(<MyComponent text="Hello World!" />, rootContainer);
```

### Inconviences

Discord.js allows to subscribe to some events but no way to unsubscribe later, and React creates and throws away the components constantly, creating a lot of subscriptions and generiting a lot of undesirable behaviors.

At the moment, we need to force the user to create a "Discord Wrapper" outside and pass it as an argument.
That wrapper uses RxJS and will make easier to subscribe/unsubscribe from the discord events.
