const fs = require("node:fs").promises;
const path = require("node:path");

/**
 * @param {string|undefined} jsonFilePath
 * @param {string|undefined} targetDirectory
 */
async function applyCaptions(jsonFilePath, targetDirectory) {
  if (!jsonFilePath || !targetDirectory) {
    console.error(
      "Usage: node apply-captions.js captions.json /path/to/images",
    );
    return;
  }
  try {
    const captions = JSON.parse(await fs.readFile(jsonFilePath, "utf8"));

    console.log(`Processing ${captions.length} caption files...`);

    for (const item of captions) {
      const txtPath = path.join(targetDirectory, `${item.filename}.txt`);
      await fs.writeFile(txtPath, item.caption, "utf8");
    }

    console.log(
      `Created ${captions.length} caption files in ${targetDirectory}`,
    );
  } catch (error) {
    console.error("Error applying captions:", error);
  }
}

applyCaptions(process.argv[2], process.argv[3]);
