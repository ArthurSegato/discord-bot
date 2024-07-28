const fs = require("node:fs");
const path = require("node:path");
const { Collection, Events } = require("discord.js");

const handleCommands = (client) => {
	// Get commands folder path
	const foldersPath = path.join(__dirname, "commands");

	// Read all sub folders
	const commandFolders = fs.readdirSync(foldersPath);

	if (client == null) {
		// Create a list of commands
		const commands = [];

		// Read each command inside the subfolder and add to list
		for (const folder of commandFolders) {
			const commandsPath = path.join(foldersPath, folder);
			const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
			for (const file of commandFiles) {
				const filePath = path.join(commandsPath, file);
				const command = require(filePath);
				if ("data" in command && "execute" in command) {
					commands.push(command.data.toJSON());
				}
				else {
					console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
				}
			}
		}

		// Return the list
		return commands;

	}
	else {
		// Create a collection of commands
		client.commands = new Collection();

		// Read each command inside the subfolder and add to collection
		for (const folder of commandFolders) {
			const commandsPath = path.join(foldersPath, folder);
			const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
			for (const file of commandFiles) {
				const filePath = path.join(commandsPath, file);
				const command = require(filePath);
				// Set a new item in the Collection with the key as the command name and the value as the exported module
				if ("data" in command && "execute" in command) {
					client.commands.set(command.data.name, command);
				}
				else {
					console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
				}
			}
		}

		// Listen for commands execution
		client.on(Events.InteractionCreate, async interaction => {
			// If not a command ignore
			if (!interaction.isChatInputCommand()) return;

			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(interaction);
			}
			catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true });
				}
				else {
					await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
				}
			}
		});
	}
};

module.exports = { handleCommands };