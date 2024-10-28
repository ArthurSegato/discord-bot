import { REST, Routes } from "discord.js";
import { handleCommands } from "./commands/command-handler.js";
import { color } from "bun";

// Deploy commands
(async () => {
  try {
    // Load the commands
    const commands = handleCommands(null);

    // Create an instance of the REST module
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    console.info(
      `${color("blue", "ansi")}[ INFO ]${color("white", "ansi")} Deploying ${commands.length} commands`,
    );

    // Updates the list of commands in the guild with the current set
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID,
      ),
      { body: commands },
    );

    console.info(
      `${color("green", "ansi")}[ OK ]${color("white", "ansi")} Deploy complete`,
    );
  } catch (error) {
    console.error(`[ FAIL ]${color("white", "ansi")} ${error}`);
  }
})();
