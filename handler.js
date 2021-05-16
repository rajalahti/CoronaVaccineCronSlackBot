const request = require("axios");
const AWS = require("aws-sdk");
AWS.config.update({ region: "eu-north-1" });
const documentClient = new AWS.DynamoDB.DocumentClient({
  region: "eu-north-1",
});
const axios = require("axios");
const { extractListingsFromHTML } = require("./helpers");
const slackToken = "TOKEN_HERE";

// First declare the params that we save to DynamoDB
const params = {
  TableName: "coronajobs",
};

module.exports.coronajob = async (event, context, callback) => {
  let oldText = await documentClient.scan(params).promise();
  oldText = oldText.Items[oldText.Count - 1].vaccinating;

  console.log(oldText);

  const response = await request(
    "https://www.espoo.fi/fi-FI/Espoon_kaupunki/Ajankohtaista/Koronavirus/Sosiaali_ja_terveyspalvelut/Koronarokotus"
  );
  const data = await response.data;
  const vaccinating = extractListingsFromHTML(data);

  if (vaccinating == oldText) {
    console.log("teksti oli sama");
  } else {
    console.log("uusi teksti");
    await documentClient
      .put({
        TableName: "coronajobs",
        Item: { vaccinating: vaccinating },
      })
      .promise();
    const url = "https://slack.com/api/chat.postMessage";
    const res = await axios.post(
      url,
      {
        channel: "#random",
        text:
          "Koronarokotuspäivitys: Espoon koronarokotusvuorossa " + vaccinating,
      },
      { headers: { authorization: `Bearer ${slackToken}` } }
    );

    return "Done", res.data;
  }
};
