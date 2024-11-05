To enable **Full (Strict) SSL** for a DNS record in Cloudflare using Cloudflare's API, you can follow these steps. This involves making authenticated API requests to set SSL/TLS settings for a specified domain.

### Prerequisites
1. **API Token**: You’ll need a Cloudflare API Token with the necessary permissions for DNS and SSL settings.
2. **Zone ID**: The unique identifier for the domain (zone) you’re working with in Cloudflare.

### Step 1: Retrieve Zone ID (if not already known)
If you don’t already have the Zone ID, you can get it with a `GET` request.

```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones?name=yourdomain.com" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Content-Type: application/json"
```

This will return a list of zones. Find the `id` associated with your domain (`yourdomain.com`) and save it for the next steps.

### Step 2: Enable Full (Strict) SSL

Now, update the SSL/TLS mode for the specified domain to "Full (Strict)" mode.

```bash
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/settings/ssl" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"value":"strict"}'
```

### Explanation
- `https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/settings/ssl`: This endpoint allows you to modify the SSL settings for the zone.
- Replace `YOUR_ZONE_ID` with the actual Zone ID.
- Replace `YOUR_API_TOKEN` with your API Token.

### Step 3: Verify SSL Mode (Optional)
To verify the SSL mode, you can retrieve the current SSL setting for the zone:

```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/settings/ssl" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Content-Type: application/json"
```

This should confirm that the `value` is set to `"strict"`, meaning **Full (Strict)** SSL is enabled.

### Example Response for Verification
A successful response will look like this:
```json
{
  "result": {
    "id": "ssl",
    "value": "strict",
    ...
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

This setup will enforce Full (Strict) SSL for the specified domain in Cloudflare, meaning all traffic must be end-to-end encrypted with a valid certificate on both Cloudflare’s and your server's side.