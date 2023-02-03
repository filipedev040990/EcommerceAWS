import type * as lambdaNodeJS from 'aws-cdk-lib/aws-lambda-nodejs'
import * as cdk from 'aws-cdk-lib'
import * as apiGateway from 'aws-cdk-lib/aws-apigateway'
import * as cwlogs from 'aws-cdk-lib/aws-logs'
import { Construct } from 'constructs'

interface ECommerceApiStackProps extends cdk.StackProps {
  productsFetchHandler: lambdaNodeJS.NodejsFunction
}

export class ECommerceApiStack extends cdk.Stack {
  constructor (scope: Construct, id: string, props: ECommerceApiStackProps) {
    super(scope, id, props)

    const logGrpup = new cwlogs.LogGroup(this, 'ECommerceLogs')

    const api = new apiGateway.RestApi(
      this,
      'ECommerApi',
      {
        restApiName: 'ECommerApi',
        cloudWatchRole: true,
        deployOptions: {
          accessLogDestination: new apiGateway.LogGroupLogDestination(logGrpup),
          accessLogFormat: apiGateway.AccessLogFormat.jsonWithStandardFields({
            httpMethod: true,
            ip: true,
            protocol: true,
            requestTime: true,
            caller: true,
            resourcePath: true,
            responseLength: true,
            status: true,
            user: true
          })
        }
      })

    const productsFetchIntegration = new apiGateway.LambdaIntegration(props.productsFetchHandler)

    const productsResource = api.root.addResource('products')
    productsResource.addMethod('GET', productsFetchIntegration)
  }
}