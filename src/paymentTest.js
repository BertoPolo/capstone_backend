import Stripe from "stripe"

const stripe = Stripe("sk_test_...", {
  apiVersion: "2022-11-15",
  maxNetworkRetries: 1,
  httpAgent: new ProxyAgent(process.env.http_proxy),
  timeout: 1000,
  host: "api.example.com",
  port: 123,
  telemetry: true,
})

const customer = await stripe.customers.create({
  email: "customer@example.com",
})

console.log(customer.id)
