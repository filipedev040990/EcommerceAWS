import * as lambdaNodeJS from 'aws-cdk-lib/aws-lambda-nodejs'
import * as cdk from 'aws-cdk-lib'
import { type Construct } from 'constructs'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as ssm from 'aws-cdk-lib/aws-ssm'
import * as lambda from 'aws-cdk-lib/aws-lambda'

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

    const productsLayerArn = ssm.StringParameter.valueForStringParameter(this, 'ProductsLayerVersionArn')
    const productsLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'ProductsLayerVersionArn', productsLayerArn)

    this.productsFetchHandler = new lambdaNodeJS.NodejsFunction(
      this,
      'ProductsFetchHandler',
      {
        functionName: 'ProductsFetchFunction',
        entry: 'lambda/products/productsFetchFunction.ts',
        handler: 'handler',
        memorySize: 128,
        timeout: cdk.Duration.seconds(5),
        bundling: {
          minify: true,
          sourceMap: false
        },
        environment: {
          PRODUCTS_DDB: this.productsDdb.tableName
        },
        layers: [productsLayer]
      }
    )
    this.productsDdb.grantReadData(this.productsFetchHandler)

    this.productsAdminHandler = new lambdaNodeJS.NodejsFunction(
      this,
      'ProductsAdminHandler',
      {
        functionName: 'ProductsAdminFunction',
        entry: 'lambda/products/productsAdminFunction.ts',
        handler: 'handler',
        memorySize: 128,
        timeout: cdk.Duration.seconds(5),
        bundling: {
          minify: true,
          sourceMap: false
        },
        environment: {
          PRODUCTS_DDB: this.productsDdb.tableName
        },
        layers: [productsLayer]
      }
    )
    this.productsDdb.grantWriteData(this.productsAdminHandler)
  }
}
