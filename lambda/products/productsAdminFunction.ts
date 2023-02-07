import { type APIGatewayProxyEvent, type APIGatewayProxyResult, type Context } from 'aws-lambda'
import { Product, ProductRepository } from '/opt/nodejs/productsLayer'
import { DynamoDB } from 'aws-sdk'

const productDdb = process.env.PRODUCTS_DDB!
const ddbclient = new DynamoDB.DocumentClient()
const productRepository = new ProductRepository(ddbclient, productDdb)

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod
  const resource = event.resource

  const lambdaRequestId = context.awsRequestId
  const apiRequestId = event.requestContext.requestId

  console.log(`API Gateway RequestId: ${apiRequestId} - LambdaRequestId: ${lambdaRequestId}`)

  if (resource === '/products') {
    const product = JSON.parse(event.body!) as Product
    const productCreated = await productRepository.create(product)

    return {
      statusCode: 201,
      body: JSON.stringify(productCreated)
    }
  }

  if (resource === '/products/{id}') {
    const productId = event.pathParameters!.id as string

    if (method === 'PUT') {
      try {
        const product = JSON.parse(event.body!) as Product
        const productUpdated = await productRepository.update(productId, product)

        return {
          statusCode: 200,
          body: JSON.stringify(productUpdated)
        }
      } catch (ConditionalCheckFailedException) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Product not found' })
        }
      }
    }

    if (method === 'DELETE') {
      try {
        await productRepository.delete(productId)
        return {
          statusCode: 200,
          body: JSON.stringify({})
        }
      } catch (error) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Product not found' })
        }
      }
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ message: 'Bad request' })
  }
}
