const cheerio = require("cheerio");

function extractListingsFromHTML(html) {
  const $ = cheerio.load(html);

  const nowVaccinating = $("strong").first().text();

  return nowVaccinating;
}

module.exports = {
  extractListingsFromHTML,
};
