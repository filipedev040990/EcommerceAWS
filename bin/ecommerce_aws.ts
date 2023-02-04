#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { ECommerceApiStack, ProductsAppStack } from '../lib'
import { ProductsAppLayerStack } from '../lib/productsAppLayers-stack'

const app = new cdk.App()

const env: cdk.Environment = {
  account: '421712698220',
  region: 'us-east-1'
}

const tags = {
  cost: 'ECommerce',
  team: 'Developers'
}

const productsAppLayerStack = new ProductsAppLayerStack(app, 'ProductsAppLayersStack', { env, tags })

const productsAppStack = new ProductsAppStack(app, 'ProductsApp', { env, tags })
productsAppStack.addDependency(productsAppLayerStack)

const ecommerceApiStack = new ECommerceApiStack(app, 'ECommerceApi', {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
  env,
  tags
})

ecommerceApiStack.addDependency(productsAppStack)
