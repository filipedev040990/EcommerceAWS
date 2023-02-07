import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { v4 as uuid } from 'uuid'

export type Product = {
  id: string
  productName: string
  code: string
  price: number
  model: string
}

export class ProductRepository {
  constructor (
    private readonly ddbClient: DocumentClient,
    private readonly productsDdb: string) {}

  async getAll (): Promise<Product[]> {
    const products = await this.ddbClient.scan({
      TableName: this.productsDdb
    }).promise()

    return products.Items as Product []
  }

  async getById (productId: string): Promise<Product> {
    const product = await this.ddbClient.get({
      TableName: this.productsDdb,
      Key: {
        id: productId
      }
    }).promise()

    if (!product.Item) {
      throw new Error('Product not found')
    }

    return product.Item as Product
  }

  async create (product: Product): Promise<Product> {
    product.id = uuid()
    await this.ddbClient.put({
      TableName: this.productsDdb,
      Item: product
    }).promise()

    return product
  }

  async delete (productId: string): Promise<void> {
    await this.ddbClient.delete({
      TableName: this.productsDdb,
      Key: {
        id: productId
      }
    }).promise()
  }

  async update (productId: string, product: Product): Promise<Product> {
    const data = await this.ddbClient.update({
      TableName: this.productsDdb,
      Key: {
        id: productId
      },
      ConditionExpression: 'attibute_exists(id)',
      ReturnValues: 'UPDATED_NEW',
      UpdateExpression: 'set productName = productName, code = code, price = price, model = model',
      ExpressionAttributeValues: {
        productName: product.productName,
        code: product.code,
        price: product.price,
        model: product.model
      }
    }).promise()

    data.Attributes!.id = productId
    return data.Attributes as Product
  }
}
