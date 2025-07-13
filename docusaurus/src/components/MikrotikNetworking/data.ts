/*
  Centralized data store for the MikroTik Networking view.
  Keeps large static objects isolated from component logic.
*/

export const deviceConfigData = {
  lenovoM920q: {
    title: "Lenovo M920q Router",
    steps: [
      {
        title: "Internet Connection (PPPoE on VLAN)",
        description:
          "First, we establish the internet connection. My Telenor ISP requires a specific VLAN (101) for the connection, so we create a VLAN interface and then run the PPPoE client on top of it. Here in Denmark at least, to get the PPPoE credentials, you need to call the customer service. They will send you the credentials via E-mail. This step might be different for your ISP.",
        code: `# Create the VLAN interface on the physical WAN port, I'm using ether1.
# This is the port that is connected to the Telenor modem.
/interface vlan
add name=vlan101-WAN vlan-id=101 interface=ether1

# Create the PPPoE client on the new VLAN interface
# Replace with your actual ISP username and password
/interface pppoe-client
add name="Telenor PPPoE" interface=vlan101-WAN user="your_telenor_username" password="your_telenor_password" add-default-route=yes use-peer-dns=no disabled=no
          `,
      },
      {
        title: "DNS",
        description:
          "We need to set the DNS servers for the router. I'm using Cloudflare's DNS servers. This is my personal preference, you can use any DNS server you want. We might later in time setup our own DNS server, e.g. Technitium, but for now we will use Cloudflare.",
        code: `# allow-remote-requests is set to yes to allow the router to resolve domain names.
# Without this, the router will not be able to resolve domain names.
/ip dns set servers=1.1.1.1,1.0.0.1 allow-remote-requests=yes
        `,
      },
      {
        title: "Bridge & VLAN Interfaces",
        description:
          "Next, we create a bridge to group our internal networks and attach the virtual VLAN interfaces. The uplink to our switch uses ether2, which corresponds to the first SFP+ port on our Lenovo M920q. This is because, after manually installing MikroTik RouterOS, the Intel X520-DA2 SFP+ ports are detected as ether2 and ether3. If you use different hardware, your uplink port name may differ, just update the code accordingly.",
        code: `/interface bridge
add name=main-bridge vlan-filtering=no
/interface bridge port
add bridge=main-bridge interface=ether2 comment="Trunk to CRS326"

/interface vlan
add interface=main-bridge name=VLAN10_HOME vlan-id=10
add interface=main-bridge name=VLAN20_K3S vlan-id=20
add interface=main-bridge name=VLAN88_MGMT vlan-id=88
add interface=main-bridge name=VLAN99_GUEST vlan-id=99`,
      },
      {
        title: "IP Addresses",
        description: "Assign gateway IP addresses to each VLAN interface.",
        code: `/ip address
add address=192.168.10.1/24 interface=VLAN10_HOME comment="Gateway for Home LAN"
add address=192.168.20.1/24 interface=VLAN20_K3S comment="Gateway for K3S Cluster"
add address=192.168.88.1/24 interface=VLAN88_MGMT comment="Gateway for Management"
add address=192.168.99.1/24 interface=VLAN99_GUEST comment="Gateway for Guest WiFi"
`,
      },
      {
        title: "Create IP Pools",
        description:
          "Create address pools that will be used by the DHCP servers. This is the range of IP addresses that will be assigned to the clients.",
        code: `/ip pool
add name=pool_home ranges=192.168.10.100-192.168.10.254
add name=pool_k3s ranges=192.168.20.100-192.168.20.254
add name=pool_mgmt ranges=192.168.88.10-192.168.88.20
add name=pool_guest ranges=192.168.99.100-192.168.99.254`,
      },
      {
        title: "DHCP Servers",
        description:
          "Create DHCP servers so clients on each VLAN receive IP addresses automatically.",
        code: `/ip dhcp-server
add address-pool=pool_home interface=VLAN10_HOME name=dhcp_home
add address-pool=pool_k3s interface=VLAN20_K3S name=dhcp_k3s
add address-pool=pool_mgmt interface=VLAN88_MGMT name=dhcp_mgmt
add address-pool=pool_guest interface=VLAN99_GUEST name=dhcp_guest`,
      },
      {
        title: "DHCP Networks",
        description:
          "Create DHCP networks so clients receive IP addresses automatically, and also set the DNS server to the router's IP address. DNS is crucial for the clients to be able to resolve the domain names, especially for the K3S cluster. Our K3S machines will be using static DNS records, so the cluster has to be able to resolve the domain names. In simple words, during the setup we will not be using IP's but domain names.",
        code: `/ip dhcp-server network
add address=192.168.10.0/24 gateway=192.168.10.1 dns-server=192.168.10.1
add address=192.168.20.0/24 gateway=192.168.20.1 dns-server=192.168.20.1
add address=192.168.88.0/24 gateway=192.168.88.1 dns-server=192.168.88.1
add address=192.168.99.0/24 gateway=192.168.99.1 dns-server=192.168.99.1`,
      },
      {
        title: "VLAN Filtering on Router",
        description:
          "Finally for the router, we configure the bridge VLAN table and enable filtering.",
        code: `/interface bridge vlan
add bridge=main-bridge tagged=main-bridge,sfp1 vlan-ids=10,20,88,99

/interface bridge
set main-bridge vlan-filtering=yes`,
      },
    ],
  },
  crs326: {
    title: "CRS326 Switch",
    steps: [
      {
        title: "Create Main Bridge",
        description:
          "Create the main bridge interface to aggregate all switch ports. This is the foundation for VLAN-aware switching.",
        code: `/interface bridge
add name=main-bridge`,
      },
      {
        title: "Add All Physical Ports",
        description:
          "Add all physical ports (ether1-24 and both SFP+ ports) to the bridge. This ensures all traffic is handled by the bridge.",
        code: `/interface bridge port
add bridge=main-bridge interface=ether1
add bridge=main-bridge interface=ether2
add bridge=main-bridge interface=ether3
add bridge=main-bridge interface=ether4
add bridge=main-bridge interface=ether5
add bridge=main-bridge interface=ether6
add bridge=main-bridge interface=ether7
add bridge=main-bridge interface=ether8
add bridge=main-bridge interface=ether9
add bridge=main-bridge interface=ether10
add bridge=main-bridge interface=ether11
add bridge=main-bridge interface=ether12
add bridge=main-bridge interface=ether13
add bridge=main-bridge interface=ether14
add bridge=main-bridge interface=ether15
add bridge=main-bridge interface=ether16
add bridge=main-bridge interface=ether17
add bridge=main-bridge interface=ether18
add bridge=main-bridge interface=ether19
add bridge=main-bridge interface=ether20
add bridge=main-bridge interface=ether21
add bridge=main-bridge interface=ether22
add bridge=main-bridge interface=ether23
add bridge=main-bridge interface=ether24
add bridge=main-bridge interface=sfp-sfpplus1
add bridge=main-bridge interface=sfp-sfpplus2`,
      },
      {
        title: "Management VLAN & IP",
        description:
          "Create the management VLAN interface, assign the switch's management IP, and set the default route. This allows management access on VLAN 88.",
        code: `/interface vlan
add interface=main-bridge name=VLAN88_MGMT vlan-id=88

/ip address
add address=192.168.88.2/24 interface=VLAN88_MGMT
/ip route
add gateway=192.168.88.1`,
      },
      {
        title: "Set Port VLAN IDs (PVIDs)",
        description:
          "Assign the correct PVIDs to access ports. ether2 is where my PC is connected (VLAN 10), and ether17-24 are for the K3S cluster (VLAN 20). This might differ for you, but the gist of it is that you need to assign the correct PVIDs to the correct ports.",
        code: `/interface bridge port
# Your PC is on ether2, its traffic belongs to VLAN 10.
set [find where interface=ether2] pvid=10
# Your K3S Cluster is on ether17-24, its traffic belongs to VLAN 20.
set [find where interface=ether17] pvid=20
set [find where interface=ether18] pvid=20
set [find where interface=ether19] pvid=20
set [find where interface=ether20] pvid=20
set [find where interface=ether21] pvid=20
set [find where interface=ether22] pvid=20
set [find where interface=ether23] pvid=20
set [find where interface=ether24] pvid=20`,
      },
      {
        title: "VLAN Table",
        description:
          "Build the VLAN table with explicit rules for tagged and untagged ports for each VLAN.",
        code: `/interface bridge vlan
add bridge=main-bridge tagged=sfp-sfpplus1,ether1 untagged=ether2 vlan-ids=10 comment="PC on eth2, AP on eth1, Router on SFP1"
add bridge=main-bridge tagged=sfp-sfpplus1 untagged=ether17,ether18,ether19,ether20,ether21,ether22,ether23,ether24 vlan-ids=20
add bridge=main-bridge tagged=main-bridge,sfp-sfpplus1,ether1 vlan-ids=88 comment="Management access for Switch CPU, Router, AP"
add bridge=main-bridge tagged=sfp-sfpplus1,ether1 vlan-ids=99`,
      },
      {
        title: "Enable VLAN Filtering",
        description:
          "Enable VLAN filtering on the bridge. This activates all VLAN rules and enforces isolation as configured.",
        code: `/interface bridge set main-bridge vlan-filtering=yes`,
      },
      {
        title: "Recommended Enhancements",
        description:
          "Optional but recommended settings for improved performance, security, and reliability. These include protocol mode, edge/portfast, hardware offloading, loop protection, and snooping features.",
        code: `/interface bridge
set main-bridge protocol-mode=rstp
set main-bridge loop-protect=yes
set main-bridge igmp-snooping=yes
set main-bridge dhcp-snooping=yes

/interface bridge port
# Enable edge (portfast) on access ports
set [find where interface=ether2] edge=yes
set [find where interface=ether17] edge=yes
set [find where interface=ether18] edge=yes
set [find where interface=ether19] edge=yes
set [find where interface=ether20] edge=yes
set [find where interface=ether21] edge=yes
set [find where interface=ether22] edge=yes
set [find where interface=ether23] edge=yes
set [find where interface=ether24] edge=yes

# Ensure hardware offloading is enabled on all ports
set [find] hw=yes`,
      },
    ],
  },
  rb2011: {
    title: "RB2011 AP",
    steps: [
      {
        title: "Create Bridge & Add Ports",
        description:
          "Create a single bridge to link the wired uplink (ether1) and the wireless SSIDs.",
        code: `/interface bridge add name=ap-bridge
/interface bridge port
add bridge=ap-bridge interface=ether1
add bridge=ap-bridge interface=wlan_home_ssid
add bridge=ap-bridge interface=wlan_guest_ssid`,
      },
      {
        title: "Configure Wireless Radio & Security",
        description:
          "Set up the main wireless radio and security profiles for home and guest networks.",
        code: `/interface wireless
set [find default-name=wlan1] mode=ap-bridge band=2ghz-b/g/n channel-width=20/40mhz-Ce frequency=auto country=denmark disabled=no hide-ssid=yes
/interface wireless security-profiles
set [find default=yes] mode=dynamic-keys authentication-types=wpa2-psk wpa2-pre-shared-key="Your_Strong_Home_Password" name=prof_home
add name=prof_guest mode=dynamic-keys authentication-types=wpa2-psk wpa2-pre-shared-key="Your_Simple_Guest_Password"`,
      },
      {
        title: "Create VLAN-Aware Virtual SSIDs",
        description:
          "Create virtual SSIDs for Home and Guest, each with their own VLAN tag. This is the key to proper network separation.",
        code: `/interface wireless
add name=wlan_home_ssid master-interface=wlan1 ssid="MyHomeWiFi" security-profile=prof_home vlan-mode=use-tag vlan-id=10
add name=wlan_guest_ssid master-interface=wlan1 ssid="MyGuestWiFi" security-profile=prof_guest vlan-mode=use-tag vlan-id=99`,
      },
      {
        title: "Management VLAN & IP Setup",
        description:
          "Add the management VLAN interface, assign the management IP, and set the default route.",
        code: `/interface vlan add name=VLAN88_MGMT interface=ether1 vlan-id=88
/ip address add address=192.168.88.3/24 interface=VLAN88_MGMT
/ip route add gateway=192.168.88.1`,
      },
      {
        title: "Recommended Enhancements",
        description:
          "Optional but recommended settings for improved security and reliability.",
        code: `/interface bridge
# Use RSTP to prevent loops
set ap-bridge protocol-mode=rstp

/interface bridge port
# Enable edge (portfast) on SSIDs for faster client connections
set [find interface=wlan_home_ssid] edge=yes
set [find interface=wlan_guest_ssid] edge=yes

/ip service
disable [find name=telnet]
disable [find name=ftp]
disable [find name=api]
disable [find name=api-ssl]`,
      },
    ],
  },
};

export const firewallConfigData = {
  title: "Firewall Configuration (on Lenovo M920q)",
  steps: [
    {
      title: "Interface Lists",
      description:
        "We will use interface lists to create clean, scalable, and human-readable firewall rules. This is a best practice.",
      code: `/interface list
add name=LAN comment="All internal interfaces"
add name=WAN comment="All external/internet interfaces"
add name=VLANs comment="All VLAN interfaces"
add name=TRUSTED comment="Trusted user networks"
add name=UNTRUSTED comment="Untrusted/isolated networks"

/interface list member
# Ensure the WAN interface list points to the PPPoE connection
add list=WAN interface="Telenor PPPoE"
add list=VLANs interface=VLAN10_HOME,VLAN20_K3S,VLAN88_MGMT,VLAN99_GUEST
add list=LAN interface=VLAN10_HOME,VLAN20_K3S,VLAN88_MGMT,VLAN99_GUEST
add list=TRUSTED interface=VLAN10_HOME,VLAN88_MGMT
add list=UNTRUSTED interface=VLAN20_K3S,VLAN99_GUEST`,
    },
    {
      title: "Address Lists for Egress Control",
      description:
        "For core services like cert-manager to function, we need to allow specific outbound connections from our otherwise isolated K3S cluster. We use dynamic address lists to securely manage this.",
      code: `# This example uses Cloudflare. Replace the FQDN with your DNS provider's API endpoint.
# The router will resolve and keep this IP list updated automatically.
/ip firewall address-list
add address=api.cloudflare.com list=dns-provider-apis comment="Cloudflare API for cert-manager"
# Add Cloudflare IPs for ingress filtering
add address=1.1.1.1 list=cloudflare-ips
add address=1.0.0.1 list=cloudflare-ips`,
    },
    {
      title: "Input Chain (Traffic to Router)",
      description:
        "These rules protect the router itself. The order of these rules is critical.",
      code: `/ip firewall filter
add action=accept chain=input connection-state=established,related,untracked comment="Allow established/related"
add action=drop chain=input connection-state=invalid comment="Drop invalid"
add action=accept chain=input protocol=icmp comment="Allow Ping to router"
add action=accept chain=input protocol=udp in-interface-list=LAN dst-port=53 comment="Allow LAN DNS queries"
add action=accept chain=input protocol=tcp in-interface-list=LAN dst-port=53 comment="Allow LAN DNS queries (TCP)"
add action=accept chain=input src-address=192.168.10.253 comment="Allow my PC to manage router"
add action=drop chain=input in-interface-list=WAN comment="Drop all other input from WAN"
add action=drop chain=input comment="Drop all other input"`,
    },
    {
      title: "Forward Chain (Traffic through Router)",
      description:
        "Here we control traffic between VLANs and the internet, enforcing our isolation policies.",
      code: `/ip firewall filter
add action=accept chain=forward connection-state=established,related,untracked comment="Allow established/related"
add action=drop chain=forward connection-state=invalid comment="Drop invalid"
add action=accept chain=forward connection-state=new connection-nat-state=dstnat protocol=tcp dst-address=192.168.20.241 src-address-list=cloudflare-ips in-interface-list=WAN dst-port=80,443 comment="Allow incoming K3S traffic from Cloudflare"
add action=drop chain=forward connection-state=new connection-nat-state=!dstnat in-interface-list=WAN comment="Drop new connections from WAN not DSTNATed"
add action=accept chain=forward in-interface-list=TRUSTED out-interface-list=WAN comment="Allow trusted VLANs to access internet"
add action=accept chain=forward protocol=tcp src-address=192.168.20.0/24 dst-address-list=dns-provider-apis dst-port=443 comment="Allow K3S to contact DNS provider for certs"
add action=accept chain=forward src-address=192.168.10.253 dst-address=192.168.20.0/24 comment="Allow my PC to access K3S"
add action=accept chain=forward src-address=192.168.10.253 dst-address=192.168.88.0/24 comment="Allow my PC to access Management VLAN"
add action=accept chain=forward src-address=192.168.20.0/24 out-interface-list=WAN comment="Allow K3S Cluster outbound internet"
add action=drop chain=forward comment="Drop all other forward"`,
    },
    {
      title: "NAT (Port Forwarding, Hairpin, and Masquerade)",
      description:
        "These rules handle DNS bypass for K3S, port forwarding for HTTP/HTTPS to K3S Ingress, hairpin NAT for internal access, and masquerade for internet access.",
      code: `/ip firewall nat
add chain=dstnat action=accept protocol=udp src-address=192.168.20.0/24 dst-port=53 comment="Allow K3S DNS to bypass redirect"
add chain=dstnat action=dst-nat to-addresses=192.168.20.241 to-ports=80 protocol=tcp in-interface-list=WAN dst-port=80 comment="Forward HTTP to K3S Ingress"
add chain=dstnat action=dst-nat to-addresses=192.168.20.241 to-ports=443 protocol=tcp in-interface-list=WAN dst-port=443 comment="Forward HTTPS to K3S Ingress"
add chain=srcnat action=masquerade src-address=192.168.0.0/16 dst-address=192.168.20.241 comment="Correct Hairpin NAT"
add chain=srcnat action=masquerade src-address=192.168.0.0/16 out-interface-list=WAN comment="Main NAT rule for Internet Access"`,
    },
  ],
};

export const scenariosConfigData = {
  title: "Common Scenarios & Firewall Exceptions",
  steps: [
    {
      title: "Scenario 1: Granting Developer Access to K3S",
      description:
        "A common need is to allow a specific, trusted developer machine on the HOME_NET (VLAN 10) to have full access to the K3S_CLUSTER (VLAN 20) for management with tools like kubectl and ssh. We do this by adding a targeted 'accept' rule to the forward chain. This rule must be placed BEFORE the general 'Drop all inter-VLAN traffic' rule to be effective.",
      code: `# First, give the developer PC a static IP via DHCP lease, e.g., 192.168.10.50

# Add this firewall rule. It allows the PC at 192.168.10.50 to access anything on the K3S network.
/ip firewall filter
add action=accept chain=forward src-address=192.168.10.50 out-interface=VLAN20_K3S \
comment="Allow Dev PC full access to K3S Cluster" \
place-before=[find where comment="Drop all inter-VLAN traffic by default"]`,
    },
    {
      title: "Scenario 2: Exposing a Service to the Internet (Port Forwarding)",
      description:
        "Our firewall correctly blocks all incoming connections from the internet by default. To expose a service (like a web server) from the K3S cluster, we must create an explicit Destination NAT (DNAT) rule. This rule tells the router to forward traffic arriving on a specific public port to an internal IP and port within the K3S network. We also need a corresponding filter rule to allow this forwarded traffic.",
      code: `# Example: Expose a web service running at 192.168.20.150:30443 to the public on port 443 (HTTPS).

# 1. The DNAT Rule: Forwards incoming internet traffic on port 443 to the internal K3S service.
/ip firewall nat
add action=dst-nat chain=dstnat dst-port=443 in-interface-list=WAN protocol=tcp \
to-addresses=192.168.20.150 to-ports=30443 comment="Forward Web Traffic to K3S"

# 2. The Filter Rule: Allows this specific forwarded traffic to pass through the firewall.
# This rule should be placed BEFORE the final 'Drop all other forward' rule.
/ip firewall filter
add action=accept chain=forward connection-nat-state=dstnat \
in-interface-list=WAN out-interface=VLAN20_K3S protocol=tcp \
comment="Allow DNAT web traffic to K3S" \
place-before=[find where comment="Drop all other forward"]`,
    },
  ],
};

export const hardeningConfigData = {
  title: "Final Hardening Steps",
  steps: [
    {
      title: "Secure MAC Server (on ALL devices)",
      description:
        "The MAC server allows Layer 2 access via Winbox, bypassing IP firewall rules. We must restrict it to the management network.",
      code: `# Run on Lenovo M920q, CRS326, and RB2011
/tool mac-server
set allowed-interface-list=TRUSTED
/tool mac-server mac-winbox
set allowed-interface-list=TRUSTED`,
    },
    {
      title: "System Security (on ALL devices)",
      description:
        "Disable non-essential services and ensure strong user credentials are set.",
      code: `# This is a checklist, not a single script.
# 1. Set a strong password for the 'admin' user or create a new admin user.
/user set [find name=admin] password="A_Very_Strong_Password"

# 2. Disable unused services to reduce attack surface.
/ip service
disable [find name=telnet]
disable [find name=ftp]
disable [find name=api]
disable [find name=api-ssl]

# 3. (Optional) Restrict management access to a specific IP or subnet.
# This adds another layer of security.
/ip service set [find name=winbox] address=192.168.88.0/24
/ip service set [find name=ssh] address=192.168.88.0/24`,
    },
  ],
};
