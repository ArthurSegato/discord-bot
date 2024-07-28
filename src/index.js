const { Client, Events, GatewayIntentBits } = require("discord.js");
const { handleCommands } = require("./commandHandler.js");

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Load all commands
handleCommands(client);

// Annnounce when the client is ready
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to discord using the token
client.login(process.env.DISCORD_TOKEN);
