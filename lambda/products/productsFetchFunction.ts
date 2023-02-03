import { type APIGatewayProxyEvent, type APIGatewayProxyResult, type Context } from 'aws-lambda'

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod
  const resource = event.resource

  const lambdaRequestId = context.awsRequestId
  const apiRequestId = event.requestContext.requestId

  console.log(`API Gateway RequestId: ${apiRequestId} - LambdaRequestId: ${lambdaRequestId}`)

  if (resource === '/products') {
    if (method === 'GET') {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'GET Products - ok' })
      }
    }
  }

  if (resource === '/products/{id}') {
    const productId = event.pathParameters?.id as string

    console.log(`GET /products/${productId}`)

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `GET /products/${productId}` })
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ message: 'Bad request' })
  }
}
