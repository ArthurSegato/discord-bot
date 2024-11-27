const { SlashCommandBuilder } = require("discord.js");
const { repos } = require("./utility.json");
const { color } = require("bun");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("releases")
    .setDescription("Show the latest releases of each repo"),
  async execute(interaction) {
    const retrieveLatestRelease = async (repoUrl) => {
      try {
        const response = await fetch(repoUrl, {
          method: "HEAD",
        });

        // Abort in case of a error
        if (!response.ok) throw new Error(response.statusText);

        // Return the url of the latest release
        return response.url;
      } catch (err) {
        console.error(
          `[ FAIL ]${color("white", "ansi")} ${err.message} when trying to create a measurement `,
        );
      }
    };

    try {
      // Create measurement requests for all services and wait for the IDs
      const releasesUrl = await Promise.all(repos.map(retrieveLatestRelease));

      // Construct embeds for each result
      const embeds = [
        {
          title: "Repositories",
          fields: releasesUrl.flatMap((repo) => [
            {
              name: "Project",
              value: repo.match(/\/([^/]+)\/([^/]+)\/releases/)[2],
              inline: true,
            },
            {
              name: "Version",
              value: repo.match(/\/tag\/(.*)/)[1],
              inline: true,
            },
            {
              name: "",
              value: "",
              inline: false,
            },
          ]),
          // Give the embed a discord compatible timestamp
          timestamp: new Date().toISOString(),
        },
      ];

      await interaction.reply({ embeds });
    } catch (err) {
      console.error(`[ FAIL ]${color("white", "ansi")} ${err.message}`);
      await interaction.editReply(err.message);
    }
  },
};
