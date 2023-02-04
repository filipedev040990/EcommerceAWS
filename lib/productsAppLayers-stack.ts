import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as ssm from 'aws-cdk-lib/aws-ssm'

export class ProductsAppLayerStack extends cdk.Stack {
  readonly productsLayer: lambda.LayerVersion

  constructor (scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    this.productsLayer = new lambda.LayerVersion(this, 'ProductsLayer', {
      code: lambda.Code.fromAsset('lambda/products/layers'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],
      layerVersionName: 'ProductsLayer',
      removalPolicy: cdk.RemovalPolicy.RETAIN
    })

    // eslint-disable-next-line no-new
    new ssm.StringParameter(this, 'ProductsLayerVersionArn', {
      parameterName: 'ProductsLayerVersionArn',
      stringValue: this.productsLayer.layerVersionArn
    })
  }
}
