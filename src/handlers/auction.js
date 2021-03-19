
import { v4 as uuid } from 'uuid'
import AWS, { DynamoDB } from 'aws-sdk'
import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import httpEventNormalizar from '@middy/http-event-normalizar'
import httpErrorHanler from '@middy/http-error-handler'

const dynamodb = new AWS.DynamoDB.DocumentClient()

async function createAudition(event, context) {

    const { title } = JSON.parse(event.body)
    const now = new Date()

    const auction = {
        id: uuid(),
        title: title,
        status: 'OPEN',
        createAt: now.toISOString(),
    }

    await dynamodb.put({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: auction,
    }).promise()

    return {
      statusCode: 201,
      body: JSON.stringify({ auction }),
    };
  }
  
  export const handler = middy(createAudition);
  
  
  