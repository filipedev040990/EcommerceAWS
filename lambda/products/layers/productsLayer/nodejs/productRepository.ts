import { DocumentClient } from 'aws-sdk/clients/dynamodb'

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
}
