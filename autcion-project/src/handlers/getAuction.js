const AWS = require("aws-sdk");
const createError = require("http-errors");
const { commonMiddleware } = require("../lib/commonMiddleware");
const dynamodb = new AWS.DynamoDB.DocumentClient();

const  getAuctionById =async (id) => {
    let auction;
  try {
    const result = await dynamodb
      .get({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
      })
      .promise();

    auction = result.Item;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
  if (!auction) {
    throw new createError.NotFound(`Auction with ID "${id}" not found!`);
  }
  return auction
};

const getAuction = async (event, context) => {
  const { id } = event.pathParameters;
    const auction = await getAuctionById(id);
  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
};

exports.handler = commonMiddleware(getAuction);
// module.exports = getAuctionById;
exports.getAuctionById = getAuctionById;
