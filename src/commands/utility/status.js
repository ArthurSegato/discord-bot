const { SlashCommandBuilder } = require("discord.js");
const { services, regions } = require("./status.json");
const { color } = require("bun");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Checks the status of all systems"),
  async execute(interaction) {
    const createMeasurement = async (service) => {
      try {
        const response = await fetch(
          "https://api.globalping.io/v1/measurements",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.GLOBALPING_TOKEN}`,
            },
            body: JSON.stringify({
              type: "http",
              target: new URL(service).host.replace("www.", ""),
              locations: [
                {
                  continent: "AF",
                  limit: 2,
                },
                {
                  continent: "AN",
                  limit: 2,
                },
                {
                  continent: "AS",
                  limit: 2,
                },
                {
                  continent: "EU",
                  limit: 2,
                },
                {
                  continent: "NA",
                  limit: 2,
                },
                {
                  continent: "OC",
                  limit: 2,
                },
                {
                  continent: "SA",
                  limit: 2,
                },
              ],
              measurementOptions: {
                protocol: "https",
                request: {
                  method: "head",
                },
              },
            }),
          },
        );

        if (!response.ok) throw new Error(response.statusText);

        const { id } = await response.json();

        return id;
      } catch (err) {
        console.error(
          `[ FAIL ]${color("white", "ansi")} ${err.message} when trying to create a measurement `,
        );
      }
    };

    const retrieveMeasurement = async (id) => {
      try {
        const response = await fetch(
          `https://api.globalping.io/v1/measurements/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.GLOBALPING_TOKEN}`,
            },
          },
        );

        if (!response.ok) throw new Error(response.statusText);

        const { results } = await response.json();
        return results;
      } catch (err) {
        console.error(err);
      }
    };

    await interaction.deferReply();

    const serviceMeasurements = await Promise.all(
      services.map(createMeasurement),
    );

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const measurementResults = await Promise.all(
      serviceMeasurements.map(retrieveMeasurement),
    );

    const embeds = measurementResults.flatMap((result) => {
      const serviceUrl = result[0].result.headers.location;
      return {
        title: new URL(serviceUrl).host.replace("www.", ""),
        url: serviceUrl,
        fields: result.flatMap((item) => {
          console.log(item);
          return [
            {
              name: "Location",
              value: `${item.probe.city}, ${item.probe.country}`,
              inline: true,
            },
            {
              name: "Status",
              value: item.result.statusCodeName,
              inline: true,
            },
            {
              name: "Ping",
              value: item.result.timings.total,
              inline: true,
            },
          ];
        }),
      };
    });

    await interaction.editReply({ embeds: embeds });
  },
};
