import { Collection, Events } from "discord.js";
import { color } from "bun";

const { resolve } = require("path");
const { readdirSync } = require("fs");

const handleCommands = (client) => {
  // Create a empty list of commands
  const commandList = [];

  // Read all files in the current directory (recursively)
  const commandFiles = readdirSync(__dirname, { recursive: true }).filter(
    (file) => file.endsWith(".js") && file != "command-handler.js",
  );

  // Loop through each file found
  for (const file of commandFiles) {
    // Load each file
    const command = require(resolve(__dirname, file));

    // Skip files that are missing the "data" or "execute" properties
    if ((!"data") in command && (!"execute") in command) {
      console.log(
        `[ ${color("yellow", "ansi")}WARNING${color("white", "ansi")} ] The command at ${file} is missing a required "data" or "execute" property.`,
      );
      continue;
    }

    // Add the command to the list
    commandList.push(command);
  }

  // If commands are being deployed, return their data
  if (!client) return commandList.map((command) => command.data.toJSON());

  // If not, create a command collection for the client
  client.commands = new Collection();

  // Add the loaded commands to the client's collection
  for (const command of commandList) {
    client.commands.set(command.data.name, command);
  }

  // Listen for chat interaction events
  client.on(Events.InteractionCreate, async (interaction) => {
    // Stop if it is not a command
    if (!interaction.isChatInputCommand()) return;

    // Search for the command in the collection
    const command = interaction.client.commands.get(interaction.commandName);

    // Stop if no matching command is found
    if (!command) {
      console.error(
        `[ ${color("yellow", "ansi")}WARNING${color("white", "ansi")} ] No command matching ${interaction.commandName} was found.`,
      );
      return;
    }

    try {
      // Execute the command
      await command.execute(interaction);
    } catch (error) {
      console.error(
        `[ ${color("red", "ansi")}FAIL${color("white", "ansi")} ] ${error}`,
      );
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  });
};

export { handleCommands };
