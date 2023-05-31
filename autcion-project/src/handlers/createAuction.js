const { v4: uuid } = require("uuid");
const AWS = require("aws-sdk");
const validator = require("@middy/validator");
const { transpileSchema } = require("@middy/validator/transpile");
const { commonMiddleware } = require("../lib/commonMiddleware");
const createError = require("http-errors");
const createAuctionsSchema = require("../lib/schemas/createAuctionSchema");

const dynamodb = new AWS.DynamoDB.DocumentClient();

const createAuction = async (event, context) => {
  const { title } = event.body;
  const { email } = event.requestContext.authorizer;
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);
  const auction = {
    id: uuid(),
    title,
    status: "OPEN",
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0,
    },
    seller: email,
  };
  try {
    await dynamodb
      .put({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: auction,
      })
      .promise();
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
};

exports.handler = commonMiddleware(createAuction).use(
  validator({
    eventSchema: transpileSchema(createAuctionsSchema),
    useDefaults: true,
    strict: false,
  })
);
