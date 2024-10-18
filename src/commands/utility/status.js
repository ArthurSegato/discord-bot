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
    const checkServiceStatus = async (serviceUrl) => {
      const requestStartTime = Date.now();

      const response = await fetch(serviceUrl);

      const responseTime = Date.now() - requestStartTime;

      const vercelHeader = response.headers.get("x-vercel-id");

      const serviceRegion = vercelHeader
        ? (regions[vercelHeader.split("::")[0]] ?? "N/A")
        : "N/A";

      return {
        service: new URL(serviceUrl).host.replace("www.", ""),
        status: [response.ok ? "up" : "down"],
        region: serviceRegion,
        responseTime: [responseTime],
      };
    };

    await interaction.reply("Verifying service status...");

    const attemptsAmount = parseInt(
      interaction.options.getString("attempts") ?? 5,
    );

    const serviceStatusRequests = services.flatMap((serviceUrl) =>
      Array.from({ length: attemptsAmount }, async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return checkServiceStatus(serviceUrl);
      }),
    );

    const serviceRequestResults = await Promise.all(serviceStatusRequests);

    // Combine objects with the same service value
    const combinedResults = serviceRequestResults.reduce((acc, curr) => {
      const existing = acc.find((item) => item.service === curr.service);

      if (existing) {
        // Merge status and responseTime arrays
        existing.status = existing.status.concat(curr.status);
        existing.responseTime = existing.responseTime.concat(curr.responseTime);
      } else {
        // Add new service object if it doesn't exist in the accumulator
        acc.push(curr);
      }

      return acc;
    }, []);

    console.log(combinedResults);

    await interaction.editReply("rola");
  },
};
