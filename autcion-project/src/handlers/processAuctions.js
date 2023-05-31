const { closeAuction } = require("../lib/closeAuction");
const { getEndedAuctions } = require("../lib/getEndedAuctions");
const createError = require("http-errors");

const processAuctions = async (event, context) => {
  try {
    console.log("Processing auctions!");
    const auctionsToClose = await getEndedAuctions();
    console.log(auctionsToClose);
    const closePromises = auctionsToClose.map((auction) =>
      closeAuction(auction)
    );
    await Promise.all(closePromises);
    return {
        closed: closePromises.length
    }
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
};

exports.handler = processAuctions;
