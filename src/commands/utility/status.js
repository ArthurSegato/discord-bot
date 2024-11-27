const { SlashCommandBuilder } = require("discord.js");
const { services } = require("./utility.json");
const { color } = require("bun");

// Define common headers
const headers = new Headers({
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.GLOBALPING_TOKEN}`,
});

// Define measurement locations for request testing, one for each continent
const measurementLocations = [
  { continent: "AF", limit: 1 },
  { continent: "AN", limit: 1 },
  { continent: "AS", limit: 1 },
  { continent: "EU", limit: 1 },
  { continent: "NA", limit: 1 },
  { continent: "OC", limit: 1 },
  { continent: "SA", limit: 1 },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Checks the status of all systems"),
  async execute(interaction) {
    const createServiceMeasurement = async (serviceUrl) => {
      try {
        const response = await fetch(
          "https://api.globalping.io/v1/measurements",
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              type: "http",
              target: new URL(serviceUrl).host,
              locations: measurementLocations,
              measurementOptions: {
                protocol: "https",
                request: {
                  method: "head",
                },
              },
            }),
          },
        );

        // Abort in case of a error
        if (!response.ok) throw new Error(response.statusText);

        // Extract the measurement id
        const { id } = await response.json();

        // Return it
        return id;
      } catch (err) {
        console.error(
          `[ FAIL ]${color("white", "ansi")} ${err.message} when trying to create a measurement `,
        );
      }
    };

    const fetchMeasurementResults = async (measurementId) => {
      try {
        const response = await fetch(
          `https://api.globalping.io/v1/measurements/${measurementId}`,
          { headers },
        );

        // Abort in case of a error
        if (!response.ok) throw new Error(response.statusText);

        // Extract the measurement resultd and the service measured
        const { results, target } = await response.json();

        // Case the measurement is still running wait 1s and retrieve again
        if (
          results.some((item) => {
            return item.result.status === "in-progress";
          })
        ) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return fetchMeasurementResults(measurementId);
        }

        // Return measurement
        return { target, results };
      } catch (err) {
        console.error(
          `[ FAIL ]${color("white", "ansi")} ${err.message} when trying to retrieve measurements `,
        );
      }
    };

    try {
      // Inform Discord to wait for a longer response time (15 minutes instead of 3 seconds)
      await interaction.deferReply();

      // Create measurement requests for all services and wait for the IDs
      const measurementIds = await Promise.all(
        services.map(createServiceMeasurement),
      );

      // Fetch the measurement results for all IDs
      const measurementResults = await Promise.all(
        measurementIds.map(fetchMeasurementResults),
      );

      // Construct embeds for each result
      const embeds = measurementResults.map((result) => {
        // Create fields for the embed using the results data
        const fields = result.results.flatMap((item) => [
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
        ]);

        // Determine the embed color based on measurement success
        const color = result.results.some(
          (item) => item.result.statusCodeName !== "OK",
        )
          ? "0xff6188"
          : "0xa9dc76";

        return {
          color: parseInt(color),
          // Clean up the title by removing "www."
          title: result.target.replace("www.", ""),
          // Make the embed title clickable
          url: `https://${result.target}`,
          fields,
          // Give the embed a discord compatible timestamp
          timestamp: new Date().toISOString(),
        };
      });

      await interaction.editReply({ embeds });
    } catch (err) {
      console.error(`[ FAIL ]${color("white", "ansi")} ${err.message}`);
      await interaction.editReply(err.message);
    }
  },
};
