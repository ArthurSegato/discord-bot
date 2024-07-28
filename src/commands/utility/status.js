const { SlashCommandBuilder } = require("discord.js");
const ms = require("ms");
const {
  commands: {
    status: { services },
  },
} = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Checks the status of all systems."),
  async execute(interaction) {
    // Create a array of promisses
    const promisses = [];

    // Ping a service and return the name, if is online or not and time
    const pingService = async (name, url) => {
      const timeBeginning = Date.now();

      const status = await fetch(url).then((r) => {
        if (r.ok) return "online";
        else return "offline";
      });

      const duration = ms(Date.now() - timeBeginning);

      return `${name} - ${status} - ${duration}`;
    };

    // Execute the ping and pass it to the promisses list
    services.forEach((s) => promisses.push(pingService(s.name, s.url)));

    // Once all pings are executed, concat them in a string and send result to discord
    Promise.all(promisses).then(async (v) => {
      let result = "";

      v.forEach((e) => (result = result.concat(`${e}\n`)));

      await interaction.reply(result);
    });
  },
};
