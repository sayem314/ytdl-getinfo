const { writeFileSync } = require("fs");
const { join } = require("path");
const { execFileSync } = require("child_process");
const axios = require("axios");

/**
 * Updates or downloads the youtube-dl binary.
 * @return {Promise<String>} - New version number
 */
async function updateBinary() {
  const name = `yt-dlp${process.platform === "win32" ? ".exe" : ""}`;
  const resp = await axios.get(
    "https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest"
  );
  const asset = resp.data.assets.find((a) => a.name === name);

  const bin = `youtube-dl${process.platform === "win32" ? ".exe" : ""}`;
  const dest = join(__dirname, "ytdl", bin);
  const { data } = await axios.get(asset.browser_download_url, {
    responseType: "arraybuffer",
  });

  writeFileSync(dest, data, { mode: "755", encoding: "binary" });
  return execFileSync(dest, ["--version"]);
}

if (require.main === module) {
  // CLI
  console.log("Updating youtube-dl to the latest version...");
  updateBinary()
    .then((version) => {
      console.log(`Successfully downloaded youtube-dl ${version}`);
      process.exit();
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
} else {
  // Module
  module.exports = updateBinary;
}
