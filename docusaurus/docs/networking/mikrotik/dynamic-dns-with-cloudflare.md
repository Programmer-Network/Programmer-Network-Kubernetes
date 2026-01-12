---
title: DDNS Using Cloudflare
---

## MikroTik Scripting

After nearly two decades as programmers, I find MikroTik scripting to be one of
RouterOS’s best features. It enables creativity and extensibility, allowing me
to quickly write scripts whenever a new use case arises. The scripting language
is simple, and if you have programming experience, it should feel
straightforward.

## Why do we need a DDNS?

Without a static public IP address, setting our IP in Cloudflare (or any DNS
provider) won’t work permanently. Our current public IP might work for now, but
once our ISP changes it, our services will become inaccessible. To solve this,
we use Dynamic DNS (DDNS): we create an A record in Cloudflare (e.g.,
something.example.com) and update it automatically whenever our public IP
changes. This way, we can always point our ingress or other services to a
consistent domain name.

In our setup, we use two methods:

- Utilize the `On Up` event under the `default`
  [PPP (Point-to-Point)](https://help.mikrotik.com/docs/spaces/ROS/pages/328072/PPP)
  profile
- Use the built-in
  [Scheduler](https://help.mikrotik.com/docs/spaces/ROS/pages/40992881/Scheduler)
  (essentially, a cron) to run every X minutes to update the DNS record in
  Cloudflare.

Before using the script below, we’ll need to set up a few things in our
Cloudflare account. Specifically, we’ll need some tokens and IDs so the script
can update our DNS record via the API. This setup should only take a few
minutes.

## Get Our Cloudflare Credentials

Before configuring the router, let’s gather these four pieces of information
from our Cloudflare account:

- Our Zone ID.
- The DNS Record Name we want to update (e.g., router.ourdomain.com).
- The DNS Record ID for that specific record.
- A special API Token.

**Step A: Create the DNS Record (if it doesn't exist)**

First, we need a placeholder 'A' record in Cloudflare that the script can target
for updates.

- Log in to our Cloudflare dashboard.
- Go to the DNS settings for our domain.
- Click Add record.
- Configure it as follows:
  - Type: A
  - Name: The subdomain we want to use (e.g., router, home, m920q).
  - IPv4 address: Use a placeholder, such as our current public IP. The script
    will update this automatically as our IP changes.
  - Proxy status: Our choice. If we want Cloudflare's protection (orange cloud),
    leave it Proxied. If we want a direct connection (e.g., for a VPN), set it
    to DNS only. Note our choice for later.
  - Click Save.

**Step B: Get our Zone ID and API Token**

- Find our Zone ID: On the main `Overview page` for our domain in Cloudflare,
  scroll down. We'll find the Zone ID on the right-hand side. Copy it to a safe
  place.

- Create an API Token:
  - Click the user icon in the top right and go to My Profile.
  - Select the API Tokens tab on the left.
  - Click Create Token.
  - Find the Edit zone DNS template and click Use template.
  - Make sure to assign the following two permissions: `Zone - Zone - Read` and
    `Zone - DNS - Edit`. In simple terms, our script needs to read data from our
    DNS and update DNS records when needed.
  - Under Zone Resources, ensure we select the specific domain we want this
    token to control.
  - Click Continue to summary, then Create Token.
  - Cloudflare will display the token only once. Copy it immediately and store
    it safely.

**Step C: Get the DNS Record ID**

This ID is not visible on the dashboard. The easiest way to get it is with a
command on our PC (not the router). Open a Command Prompt (Windows) or Terminal
(Mac/Linux) and run the following, replacing the capitalized parts with our
info:

```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones/OUR_ZONE_ID/dns_records?name=OUR_DNS_RECORD_NAME" \
-H "Authorization: Bearer OUR_API_TOKEN" \
-H "Content-Type: application/json"
```

- `OUR_ZONE_ID`: The ID from Step B.
- `OUR_DNS_RECORD_NAME`: The full name, e.g., router.ourdomain.com.
- `OUR_API_TOKEN`: The token we just created.

The command returns a response. Find and copy the "id" value from it.

## DDNS Script for Cloudflare

Now, let's program the router.

**Step 1: Create the Script**

- On our MikroTik router, go to `System > Scripts`.
- Click + to add a new script. Name it e.g. `cloudflare-ddns`.
- Copy the entire code block below and paste it into the Source box.

```bash
:local cfApiToken "YOUR_API_TOKEN_HERE"
:local cfZoneId "YOUR_ZONE_ID_HERE"
:local cfDnsId "YOUR_DNS_ID_HERE"
:local cfDnsName "YOUR_DNS_NAME_HERE"
:local cfProxied true
:local currentIP
:local lastIP
:local wanInterface "YOUR_WAN_INTERFACE_HERE" # e.g. mine is named Telenor PPPoE

:log info "--- Cloudflare DDNS Start ---"

# Get current IP from the router interface
:do {
    :local ipCIDR [/ip address get [/ip address find interface=$wanInterface] address]
    :set currentIP [:pick $ipCIDR 0 [:find $ipCIDR "/"]]
} on-error={
    :log error "Cloudflare DDNS: Failed to get IP from interface '$wanInterface'. Aborting."
    :set currentIP "0"
}

# Only proceed if we successfully got a valid IP address
:if ($currentIP != "0") do={

    :log info "Cloudflare DDNS: Current IP is $currentIP. Sending update..."

    :local apiURL ("https://api.cloudflare.com/client/v4/zones/$cfZoneId/dns_records/$cfDnsId")

    :local headers {
        "Authorization: Bearer $cfApiToken"
        "Content-Type: application/json"
    }

    :local payload ("{\"type\":\"A\",\"name\":\"" . $cfDnsName . "\",\"content\":\"" . $currentIP . "\",\"ttl\":1,\"proxied\":" . $cfProxied . "}")

    /tool fetch url=$apiURL http-method=put http-header=$headers http-data=$payload output=none mode=https

    :log info "Cloudflare DDNS: Update command sent."
}

:log info "--- Cloudflare DDNS End ---"

```

Edit the five configuration lines at the top with our Cloudflare information,
and update the WAN interface as needed.

## Logging

We’ll notice the script includes several log statements. Logging is a good
engineering practice, so I recommend keeping them.

Before proceeding to the next steps, let’s test the script we just created under
`System > Scripts`.

- Open the `cloudflare-ddns` script, and click `Run Script`
- Open the `Log` menu item in the sidebar to check if everything is working
  correctly. If there are errors, they will appear in red. Most errors are
  related to permissions or similar issues, such as Cloudflare returning an HTTP
  status 400. Once everything works, we can proceed to the next steps.

**Step 2: Schedule the Script**

Navigate to `System > Scheduler`.

- Click + to add a new schedule.
- Name it Run-Cloudflare-Update.
- In the On Event box, type the script name: `cloudflare-ddns`.
- Set the interval, for example, to 00:05:00 (every 5 minutes), or adjust as
  needed.
- Click Apply and OK.

## Using the PPPoE Client "On-Up" Script

If your internet connection uses PPP (as mine does for Telenor ISP), we can use
the `On Up` event, which triggers when the connection comes up.

Typically, our public IP changes when our connection goes down and comes back
up.

- Navigate to the PPP menu on the left.
- Go to the Profiles tab.
- Open the profile that our PPPoE interface uses. This is typically the one
  named default or default-encryption.
- In the Profile settings, find the field named `On Up`.
- In this field, we'll run our previously defined script

```bash
:log info "PPP UP - running DDNS update"
 # The name here has to match the name of the
 # script we previously created under System > Scripts
/system script run cloudflare-ddns
```

- Click Apply and OK.

## For Other Connection Types

For those of you who have a different type of internet connection, the same
concept applies:

**DHCP Client (Cable/Fiber)**

If your WAN interface gets its IP via DHCP, we would:

- Go to IP -> DHCP Client
- Open our WAN DHCP client entry
- Run a script inside the Script field, e.g.
  `/system script run cloudflare-ddns`

## Sending emails for monitoring purposes

If you have [configured email](./configure-email-on-mikrotik) as described
earlier, you can receive notifications when certain events occur. Monitoring
helps us understand patterns in our network, such as how often our public IP
changes.

Let's extend the above `On Up` and `On Down` scripts to log and send an email
when these events occur:

```bash
:log info "PPP UP - running DDNS update"
/system script run cloudflare-ddns

:log info "PPP is UP - sending email"
/tool e-mail send to="hi@programmer.network" subject="PPP is UP" body=("Public IP: " . [/ip address get [/ip address find interface="Telenor PPPoE"] address])
```

And of course, when it goes down as well:

```bash
:log warning "PPP is DOWN - sending email"
/tool e-mail send to="hi@programmer.network" subject="PPP is DOWN" body="PPP connection lost"
```

In simple terms, we will want to do this in the appropriate place depending on
the connection type.
