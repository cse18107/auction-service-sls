const AWS = require("aws-sdk");
const { commonMiddleware } = require("../lib/commonMiddleware");
const createError = require("http-errors");
const validator = require("@middy/validator");
const { transpileSchema } = require("@middy/validator/transpile");
const getAuctionsSchema = require("../lib/schemas/getAuctionsSchema");

const dynamodb = new AWS.DynamoDB.DocumentClient();

const getAuctions = async (event, context) => {
  let auctions;
  const { status } = event.queryStringParameters;

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: "statusAndEndDate",
    KeyConditionExpression: "#status = :status",
    ExpressionAttributeValues: {
      ":status": status,
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
  };

  try {
    const result = await dynamodb.query(params).promise();

    auctions = result.Items;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
};

exports.handler = commonMiddleware(getAuctions).use(
  validator({
    eventSchema: transpileSchema(getAuctionsSchema),
    useDefaults: true,
    strict: false,
  })
);
