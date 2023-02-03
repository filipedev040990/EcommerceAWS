import { type APIGatewayProxyEvent, type APIGatewayProxyResult, type Context } from 'aws-lambda'

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod
  const resource = event.resource

  const lambdaRequestId = context.awsRequestId
  const apiRequestId = event.requestContext.requestId

  console.log(`API Gateway RequestId: ${apiRequestId} - LambdaRequestId: ${lambdaRequestId}`)

  if (resource === '/products') {
    console.log('POST AQUI')
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'POST Products - ok' })
    }
  }

  if (resource === '/products/{id}') {
    const productId = event.pathParameters?.id as string

    if (method === 'PUT') {
      console.log('PUT AQUI')
      return {
        statusCode: 200,
        body: JSON.stringify({ message: `PUT Products - ${productId}` })
      }
    }

    if (method === 'DELETE') {
      console.log('DELETE AQUI')
      return {
        statusCode: 200,
        body: JSON.stringify({ message: `DELETE Products - ${productId}` })
      }
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ message: 'Bad request' })
  }
}
