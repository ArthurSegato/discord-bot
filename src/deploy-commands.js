import { REST, Routes } from "discord.js";
import { handleCommands } from "./commands/command-handler.js";

// Load commands
const commands = handleCommands(null);

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy commands
(async () => {
  try {
    console.log(`[ INFO ] Deploying ${commands.length} commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID,
      ),
      { body: commands },
    );

    console.log(`[ OK ] Registration complete.`);
  } catch (error) {
    console.error(`[ FAIL ] ${error}`);
  }
})();
