const AWS = require("aws-sdk");
const createError = require("http-errors");
const { commonMiddleware } = require("../lib/commonMiddleware");
const { getAuctionById } = require("./getAuction");
const validator = require("@middy/validator");
const { transpileSchema } = require("@middy/validator/transpile");
const placeBidSchema = require("../lib/schemas/placeBidSchema");
const dynamodb = new AWS.DynamoDB.DocumentClient();

const placeBid = async (event, context) => {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const { email } = event.requestContext.authorizer;

  const auction = await getAuctionById(id);

  // Bid identity validation
  if(email === auction.seller) {
    throw new createError.Forbidden(`You cannot bid on your own auctions!`);
  }

  // Avoid double bidding
  if(email === auction.highestBid.bidder) {
    throw new createError.Forbidden(`You are already the highest bidder`);
  }

  // Auction status validation
  if (auction.status !== "OPEN") {
    throw new createError.Forbidden(`You cannot bid on closed auctions`);
  }

  // Bid amount validation
  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(
      `Your bid must be higher then ${auction.highestBid.amount}!`
    );
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set highestBid.amount = :amount, highestBid.bidder = :bidder",
    ExpressionAttributeValues: {
      ":amount": amount,
      ":bidder": email,
    },
    ReturnValues: "ALL_NEW",
  };

  let updateAuction;

  try {
    const result = await dynamodb.update(params).promise();
    updateAuction = result.Attributes;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updateAuction),
  };
};

exports.handler = commonMiddleware(placeBid).use(
  validator({
    eventSchema: transpileSchema(placeBidSchema),
    useDefault: true,
    strict: false,
  })
);
