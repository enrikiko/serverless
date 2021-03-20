import { v4 as uuid } from 'uuid'
import AWS, { DynamoDB } from 'aws-sdk'
import commonMiddleware from '../lib/commonMiddleware'
import createErrors from 'http-errors'
import { getAuctionById } from './getAuction'
import validator from '@middy/validator'
import getCreateAuctionSchema from '../lib/schemas/getBidAuctionSchema'

const dynamodb = new AWS.DynamoDB.DocumentClient()

async function placeBid(event, context) {
  const { id } = event.pathParameters
  const { amount } = event.body 

  const auction = await getAuctionById(id)

  if (auction.status !== 'OPEN') {
    throw new createErrors.Forbidden(`You cannot bid on closed auctions!`)
  }
  
  if (amount <= auction.highestBid.amount){
    throw new createErrors.Forbidden(`Your bid must be higher that ${auction.highestBid.amount}`)
  }

  const params = {
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id },
      UpdateExpression: 'set highestBid.amount = :amount',
      ExpressionAttributeValues: {
          ':amount': amount
      },
      ReturnValues: 'ALL_NEW'
  }

  let updateAuction

  try {
      const result = await dynamodb.update(params).promise()
      updateAuction = result.Attributes
  } catch (error) {
    console.error(error);
    throw new  createErrors.InternalServerError(error)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updateAuction),
  };
}
  
export const handler = commonMiddleware(placeBid)
.use(validator({inputSchema: getCreateAuctionSchema}))