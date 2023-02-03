import * as lambdaNodeJS from 'aws-cdk-lib/aws-lambda-nodejs'
import * as cdk from 'aws-cdk-lib'
import { type Construct } from 'constructs'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'

export class ProductsAppStack extends cdk.Stack {
  readonly productsFetchHandler: lambdaNodeJS.NodejsFunction
  readonly productsAdminHandler: lambdaNodeJS.NodejsFunction
  readonly productsDdb: dynamodb.Table

  constructor (scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props)

    this.productsDdb = new dynamodb.Table(this, 'ProductsDdb', {
      tableName: 'products',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1
    })

    this.productsFetchHandler = this.makeDefaultStack('productsFetchHandler')
    this.productsDdb.grantReadData(this.productsFetchHandler)

    this.productsAdminHandler = this.makeDefaultStack('productsAdminHandler')
    this.productsDdb.grantWriteData(this.productsAdminHandler)
  }

  makeDefaultStack = (name: string): lambdaNodeJS.NodejsFunction => {
    const stackName = this.firstLetterUpper(name)
    const fileName = this.camelize(name)

    return new lambdaNodeJS.NodejsFunction(
      this,
      stackName,
      {
        functionName: stackName,
        entry: `lambda/products/${fileName}.ts`,
        handler: 'handler',
        memorySize: 128,
        timeout: cdk.Duration.seconds(5),
        bundling: {
          minify: true,
          sourceMap: false
        },
        environment: {
          PRODUCTS_DDB: this.productsDdb.tableName
        }
      }
    )
  }

  camelize = (str: string): string => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase()
    }).replace(/\s+/g, '')
  }

  firstLetterUpper = (str: string): string => {
    return str[0].toUpperCase() + str.substring(1)
  }
}
