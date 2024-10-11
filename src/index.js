import { Client, Events, GatewayIntentBits } from "discord.js";
import { handleCommands } from "./commands/command-handler.js";

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Load commands
handleCommands(client);

// Annnounce when the client is ready
client.once(Events.ClientReady, (c) => {
  console.log(
    `[ ${Bun.color("green", "ansi")}OK${Bun.color("white", "ansi")} ] Logged in as ${c.user.tag}`,
  );
});

// Log in to discord using the token
client.login(process.env.DISCORD_TOKEN);
