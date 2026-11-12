#!/usr/bin/env node
/**
 * Get a Shopify Admin API access token (shpat_...) for a Dev Dashboard app
 * using the OAuth client credentials grant.
 *
 * Docs: https://shopify.dev/docs/apps/build/dev-dashboard/get-api-access-tokens
 *
 * Usage:
 *   cp .env.example .env   # fill in your values
 *   node get-token.mjs
 *
 * Requires Node.js 18+ (built-in fetch). No dependencies.
 */
import { readFileSync, existsSync } from "node:fs";

// Minimal .env loader (values already set in the environment take priority)
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const store = process.env.SHOPIFY_STORE_DOMAIN;
const clientId = process.env.SHOPIFY_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

if (!store || !clientId || !clientSecret) {
  console.error("Missing SHOPIFY_STORE_DOMAIN, SHOPIFY_CLIENT_ID or SHOPIFY_CLIENT_SECRET (see .env.example)");
  process.exit(1);
}

const resp = await fetch(`https://${store}/admin/oauth/access_token`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  }).toString(),
});

const data = await resp.json().catch(() => ({}));
if (!resp.ok || data.error || !data.access_token) {
  console.error(`Token request failed (HTTP ${resp.status}):`, JSON.stringify(data, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  store,
  access_token: data.access_token,
  scope: data.scope,
  expires_in: data.expires_in,
  expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
}, null, 2));
