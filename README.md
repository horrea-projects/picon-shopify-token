# Picon – Shopify Admin API token

Small script to get a Shopify Admin API access token for the **Picon** store (`shop-picon.myshopify.com`), used by the Shopify → Microsoft Dynamics customer sync.

## How it works

The Picon app is a Shopify **Dev Dashboard** app. Unlike legacy custom apps (e.g. fanshopaperol), it has no permanent token: you get a token with the OAuth **client credentials grant**, and that token is **valid for 24 hours** (`expires_in: 86399`).

```
POST https://shop-picon.myshopify.com/admin/oauth/access_token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=<CLIENT_ID>&client_secret=<CLIENT_SECRET>
```

Response:

```json
{ "access_token": "shpat_...", "scope": "...", "expires_in": 86399 }
```

Use the token as usual in the `X-Shopify-Access-Token` header on Admin API calls.

## Usage

Requires Node.js 18+, no dependencies.

```bash
cp .env.example .env   # fill in the Client ID and Client Secret (never commit .env)
node get-token.mjs
```

## In production

Don't hardcode a token: it expires after 24 h. Your integration should:

1. Store the Client ID and Client Secret securely.
2. Request a token with the call above and cache it with its expiry time.
3. Request a new one shortly before it expires (or when an API call returns `401`).

Reference: [Shopify docs – Get API access tokens for Dev Dashboard apps](https://shopify.dev/docs/apps/build/dev-dashboard/get-api-access-tokens)
