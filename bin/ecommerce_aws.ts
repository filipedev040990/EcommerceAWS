#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { ECommerceApiStack, ProductsAppStack } from '../lib'

const app = new cdk.App()

const env: cdk.Environment = {
  account: '029521634694',
  region: 'us-east-1'
}

const tags = {
  cost: 'ECommerce',
  team: 'Developers'
}

const productsAppStack = new ProductsAppStack(app, 'ProductsApp', { env, tags })

const ecommerceApiStack = new ECommerceApiStack(app, 'ECommerceApi', {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  env,
  tags
})

ecommerceApiStack.addDependency(productsAppStack)
