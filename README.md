# React-Discord

### Introduction

React-discord is a small react-reconciler to use with Discord.js to make bot flows using text messages.

This library only provides only 2 host components:

- Embed
- Text

Both components make use of `reactions` to enable interactivity.

### Example

```typescript
import Discord from "discord.js";
import React from "react";
import ReactDiscord, { DiscordS, Embed, RootContainer } from "react-discord";

function MyComponent(props) {
  return <Embed title={props.text} description="Lorem ipsum dolor sit amet" />;
}

const rootContainer = new RootContainer(
  YOUR_DISCORD_CLIENT,
  textChannel, // <- You need to provide a text channel from the discord.js library
);

ReactDiscord.render(<MyComponent text="Hello World!" />, rootContainer);
```
