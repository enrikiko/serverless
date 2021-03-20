
import { v4 as uuid } from 'uuid'
import AWS, { DynamoDB } from 'aws-sdk'
import commonMiddleware from '../lib/commonMiddleware'
import createErrors from 'http-errors'


const dynamodb = new AWS.DynamoDB.DocumentClient()


export async function getAuctionById(id){
  let auction
  try {
    const result = await dynamodb.get({ 
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id }
    }).promise()
    auction = result.Item
  } catch (error) {
    console.error(error);
    throw new  createErrors.InternalServerError(error)
  }

  if(!auction) {
    throw new createErrors.NotFound(`Auction with ID "${id}" not found!`)
  }

  return auction
}

async function getAuction(event, context) {

  const auction = await getAuctionById(id)
  const { id } = event.pathParameters

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}
  
export const handler = commonMiddleware(getAuction)