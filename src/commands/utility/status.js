const { SlashCommandBuilder } = require("discord.js");
const {
  commands: {
    status: { services },
  },
} = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Checks the status of all systems")
    .addStringOption((option) =>
      option
        .setName("attempts")
        .setDescription(
          "How many attempts to ping the server will be executed (default 5)",
        ),
    ),
  async execute(interaction) {
    const pingService = async (service) => {
      const timeBeginning = Date.now();

      const status = await fetch(service).then((r) => {
        return r.ok ? "online" : "offline";
      });

      const duration = Date.now() - timeBeginning;

      return { service, status, duration };
    };

    const attempts = parseInt(interaction.options.getString("attempts") ?? 5);

    const promisses = [];

    for (const service of services) {
      for (let i = 0; i < attempts; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        promisses.push(pingService(service));
      }
    }

    Promise.all(promisses).then(async (pings) => {
      const result = "rola";

      for (const entry of pings) {
        console.log(entry.duration);
      }

      await interaction.reply(result);
    });
  },
};
