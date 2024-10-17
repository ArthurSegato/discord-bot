const { SlashCommandBuilder } = require("discord.js");
const { services, regions } = require("./status.json");

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

      const status = await fetch(service);

      const duration = Date.now() - timeBeginning;

      return {
        service: new URL(service).host.replace("www.", ""),
        status: [status.ok ? "up" : "down"],
        region:
          regions[status.headers.get("x-vercel-id").split("::")[0]] ?? "N/A",
        duration: [duration],
      };
    };

    await interaction.reply("Contacting services...");

    const attempts = parseInt(interaction.options.getString("attempts") ?? 5);

    const requests = [];

    for (const service of services) {
      for (let i = 0; i < attempts; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        requests.push(pingService(service));
      }
    }

    Promise.all(requests).then(async (requests) => {
      requests.reduce((result, request) => {
        for (const key in request) {
          result[key] = request[key];
        }
        return result;
      });
    });

    await interaction.editReply("Pong again!");
  },
};
