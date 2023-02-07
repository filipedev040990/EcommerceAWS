import { type APIGatewayProxyEvent, type APIGatewayProxyResult, type Context } from 'aws-lambda'
import { ProductRepository } from '/opt/nodejs/productsLayer'
import { DynamoDB } from 'aws-sdk'

const productsDdb = process.env.PRODUCTS_DDB!
const ddbClient = new DynamoDB.DocumentClient()
const productRepository = new ProductRepository(ddbClient, productsDdb)

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  const lambdaRequestId = context.awsRequestId
  const apiRequestId = event.requestContext.requestId

  console.log(`API Gateway RequestId: ${apiRequestId} - LambdaRequestId: ${lambdaRequestId}`)

  const method = event.httpMethod
  const resource = event.resource

  if (resource === '/products') {
    if (method === 'GET') {
      const products = await productRepository.getAll()

      return {
        statusCode: 200,
        body: JSON.stringify(products)
      }
    }
  }

  if (resource === '/products/{id}') {
    const productId = event.pathParameters!.id as string
    try {
      const product = await productRepository.getById(productId)

      return {
        statusCode: 200,
        body: JSON.stringify(product)
      }
    } catch (error) {
      console.error(error)
      return {
        statusCode: 400,
        body: JSON.stringify(error)
      }
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ message: 'Bad request' })
  }
}
