
import { v4 as uuid } from 'uuid'
import AWS, { DynamoDB } from 'aws-sdk'
import commonMiddleware from '../lib/commonMiddleware'
import createErrors from 'http-errors'
import validator from '@middy/validator'
import getCreateAuctionSchema from '../lib/schemas/getCreateAuctionSchema'

const dynamodb = new AWS.DynamoDB.DocumentClient()

async function createAudition(event, context) {

  const { title } = event.body
  const now = new Date()
  const endDate = new Date()
  endDate.setHours(now.getHours() + 1)

  const auction = {
      id: uuid(),
      title: title,
      status: 'OPEN',
      createAt: now.toISOString(),
      endingAt: endDate.toISOString(),
      highestBid: {
        amount: 0,
      }
  }
  try {
    await dynamodb.put({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: auction,
    }).promise() 
  } catch(error) {
    console.error(error);
    throw new  createErrors.InternalServerError(error)
  }

    return {
      statusCode: 201,
      body: JSON.stringify({ auction }),
    };
  }
  
  export const handler = commonMiddleware(createAudition)
  .use(validator({inputSchema: getCreateAuctionSchema}))
  
  
  