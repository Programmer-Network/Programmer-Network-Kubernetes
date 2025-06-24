/*
  Centralized data store for the MikroTik Networking view.
  Keeps large static objects isolated from component logic.
*/

export const deviceConfigData = {
  crs326: {
    title: "CRS326 Switch",
    steps: [
      {
        title: "Step 1: Bridge & Port Setup",
        description:
          "First, we create a single bridge to contain all switch ports. This is the modern way to handle VLANs on MikroTik.",
        code: `/interface bridge
add name=main-bridge vlan-filtering=no

/interface bridge port
add bridge=main-bridge interface=ether1
# ... repeat for ether2 through ether24 ...
add bridge=main-bridge interface=ether24
add bridge=main-bridge interface=sfp-sfpplus1
add bridge=main-bridge interface=sfp-sfpplus2`,
      },
      {
        title: "Step 2: VLAN & Port Assignment",
        description:
          "Next, we define the VLANs and assign K3S ports. `sfp-sfpplus1` will be the TRUNK to the router. Ports `ether1-6` will be ACCESS ports for the K3S cluster.",
        code: `/interface bridge vlan
add bridge=main-bridge tagged=sfp-sfpplus1 vlan-ids=10 comment="HOME_NET"
add bridge=main-bridge tagged=sfp-sfpplus1 vlan-ids=20 comment="K3S_CLUSTER"
add bridge=main-bridge tagged=main-bridge,sfp-sfpplus1 vlan-ids=88 comment="MGMT_NET"
add bridge=main-bridge tagged=sfp-sfpplus1 vlan-ids=99 comment="GUEST_WIFI"

/interface bridge port
# Assign K3S ports to VLAN 20
set [ find interface=ether1 ] pvid=20
set [ find interface=ether2 ] pvid=20
set [ find interface=ether3 ] pvid=20
set [ find interface=ether4 ] pvid=20
set [ find interface=ether5 ] pvid=20
set [ find interface=ether6 ] pvid=20`,
      },
      {
        title: "Step 3: Management IP & Activation",
        description:
          "We will set a management IP for the switch and then enable VLAN filtering. Warning: It is critical to have console access or a safe port before enabling VLAN filtering, as a mistake can cause a lockout.",
        code: `/interface vlan
add interface=main-bridge name=VLAN88_MGMT vlan-id=88

/ip address
add address=192.168.88.2/24 interface=VLAN88_MGMT

/ip route
add gateway=192.168.88.1

# FINAL STEP - ACTIVATE
/interface bridge
set main-bridge vlan-filtering=yes`,
      },
    ],
  },
  rb3011: {
    title: "RB3011 Router",
    steps: [
      {
        title: "Step 1: Bridge & VLAN Interfaces",
        description:
          "On the router, we create a bridge and then a virtual VLAN interface on that bridge for each network. This allows the router's CPU to process the traffic.",
        code: `/interface bridge
add name=main-bridge vlan-filtering=no
/interface bridge port
add bridge=main-bridge interface=ether1 comment="Trunk to CRS326"

/interface vlan
add interface=main-bridge name=VLAN10_HOME vlan-id=10
add interface=main-bridge name=VLAN20_K3S vlan-id=20
add interface=main-bridge name=VLAN88_MGMT vlan-id=88
add interface=main-bridge name=VLAN99_GUEST vlan-id=99`,
      },
      {
        title: "Step 2: IP Addresses & DHCP Servers",
        description:
          "Here, we assign gateway IPs to each VLAN and set up DHCP servers to provide addresses to clients.",
        code: `/ip address
add address=192.168.10.1/24 interface=VLAN10_HOME
add address=192.168.20.1/24 interface=VLAN20_K3S
add address=192.168.88.1/24 interface=VLAN88_MGMT
add address=192.168.99.1/24 interface=VLAN99_GUEST

/ip pool
add name=pool_home ranges=192.168.10.100-192.168.10.254
add name=pool_k3s ranges=192.168.20.100-192.168.20.254
add name=pool_mgmt ranges=192.168.88.10-192.168.88.20
add name=pool_guest ranges=192.168.99.100-192.168.99.254

/ip dhcp-server
add address-pool=pool_home interface=VLAN10_HOME name=dhcp_home
add address-pool=pool_k3s interface=VLAN20_K3S name=dhcp_k3s
add address-pool=pool_mgmt interface=VLAN88_MGMT name=dhcp_mgmt
add address-pool=pool_guest interface=VLAN99_GUEST name=dhcp_guest

/ip dhcp-server network
add address=192.168.10.0/24 gateway=192.168.10.1 dns-server=192.168.10.1
add address=192.168.20.0/24 gateway=192.168.20.1 dns-server=192.168.20.1
add address=192.168.88.0/24 gateway=192.168.88.1 dns-server=192.168.88.1
add address=192.168.99.0/24 gateway=192.168.99.1 dns-server=192.168.99.1`,
      },
      {
        title: "Step 3: VLAN Filtering on Router",
        description:
          "Finally for the router, we configure the bridge VLAN table and enable filtering.",
        code: `/interface bridge vlan
add bridge=main-bridge tagged=main-bridge,ether1 vlan-ids=10,20,88,99

/interface bridge
set main-bridge vlan-filtering=yes`,
      },
    ],
  },
  rb2011: {
    title: "RB2011 AP",
    steps: [
      {
        title: "Step 1: Bridge & Management IP",
        description:
          "After resetting the device, we create a bridge, add the uplink port (e.g., ether1) and wlan1, and then set a management IP.",
        code: `/interface bridge
add name=ap-bridge vlan-filtering=no
/interface bridge port
add bridge=ap-bridge interface=ether1
add bridge=ap-bridge interface=wlan1

/interface vlan
add interface=ap-bridge name=VLAN88_MGMT vlan-id=88
/ip address
add address=192.168.88.3/24 interface=VLAN88_MGMT
/ip route
add gateway=192.168.88.1`,
      },
      {
        title: "Step 2: Create VLAN-Aware SSIDs",
        description:
          "Let's create Virtual APs for the Home and Guest networks. The key is setting `vlan-mode=use-tag` and the correct `vlan-id`.",
        code: `/interface wireless security-profiles
add name=prof_home wpa2-pre-shared-key="A_Very_Strong_Password"
add name=prof_guest wpa2-pre-shared-key="A_Simple_Guest_Password"

/interface wireless
add name=wlan_home_ssid master-interface=wlan1 ssid="MyHomeWiFi" security-profile=prof_home vlan-mode=use-tag vlan-id=10
add name=wlan_guest_ssid master-interface=wlan1 ssid="MyGuestWiFi" security-profile=prof_guest vlan-mode=use-tag vlan-id=99

/interface bridge port
add bridge=ap-bridge interface=wlan_home_ssid
add bridge=ap-bridge interface=wlan_guest_ssid`,
      },
      {
        title: "Step 3: Enable VLAN Filtering",
        description:
          "Finally, we enable VLAN filtering to activate the AP's VLAN-aware configuration.",
        code: `/interface bridge vlan
add bridge=ap-bridge tagged=ap-bridge,ether1 vlan-ids=10,88,99

/interface bridge
set ap-bridge vlan-filtering=yes`,
      },
    ],
  },
};

export const firewallConfigData = {
  title: "Firewall Configuration (on RB3011)",
  steps: [
    {
      title: "Step 1: Interface Lists",
      description:
        "We will use interface lists to create clean, scalable, and human-readable firewall rules. This is a best practice.",
      code: `/interface list
add name=LAN comment="All internal interfaces"
add name=WAN comment="All external/internet interfaces"
add name=VLANs comment="All VLAN interfaces"
add name=TRUSTED comment="Trusted user networks"
add name=UNTRUSTED comment="Untrusted/isolated networks"

/interface list member
# Assume the internet connection is on ether10. This may need to be changed.
add list=WAN interface=ether10
add list=VLANs interface=VLAN10_HOME
add list=VLANs interface=VLAN20_K3S
add list=VLANs interface=VLAN88_MGMT
add list=VLANs interface=VLAN99_GUEST
add list=LAN interface=VLAN10_HOME
add list=LAN interface=VLAN20_K3S
add list=LAN interface=VLAN88_MGMT
add list=LAN interface=VLAN99_GUEST
add list=TRUSTED interface=VLAN10_HOME
add list=TRUSTED interface=VLAN88_MGMT
add list=UNTRUSTED interface=VLAN20_K3S
add list=UNTRUSTED interface=VLAN99_GUEST`,
    },
    {
      title: "Step 2: Address Lists for Egress Control",
      description:
        "For core services like cert-manager to function, we need to allow specific outbound connections from our otherwise isolated K3S cluster. We use dynamic address lists to securely manage this.",
      code: `# On the RB3011 Router
# This example uses Cloudflare. Replace the FQDN with your DNS provider's API endpoint.
# The router will resolve and keep this IP list updated automatically.
/ip firewall address-list
add address=api.cloudflare.com list=dns-provider-apis comment="Cloudflare API for cert-manager"`,
    },
    {
      title: "Step 3: Input Chain (Traffic to Router)",
      description:
        "These rules protect the router itself. The order of these rules is critical.",
      code: `/ip firewall filter
add action=accept chain=input connection-state=established,related,untracked comment="Accept established/related"
add action=drop chain=input connection-state=invalid comment="Drop invalid"
add action=accept chain=input protocol=icmp in-interface-list=TRUSTED comment="Allow ICMP from Trusted"
add action=accept chain=input dst-port=22,80,443,8291 protocol=tcp in-interface=VLAN88_MGMT comment="Allow Management Access"
add action=accept chain=input dst-port=53 protocol=tcp in-interface-list=LAN comment="Allow DNS (TCP) from LAN"
add action=accept chain=input dst-port=53 protocol=udp in-interface-list=LAN comment="Allow DNS (UDP) from LAN"
add action=accept chain=input dst-port=123 protocol=udp in-interface-list=LAN comment="Allow NTP from LAN"
add action=drop chain=input comment="Drop all other input"`,
    },
    {
      title: "Step 4: Forward Chain (Traffic through Router)",
      description:
        "Here we control traffic between VLANs and the internet, enforcing our isolation policies.",
      code: `/ip firewall filter
add action=fasttrack-connection chain=forward connection-state=established,related hw-offload=yes comment="FastTrack established/related"
add action=accept chain=forward connection-state=established,related,untracked comment="Accept established/related"
add action=drop chain=forward connection-state=invalid comment="Drop invalid"
add action=accept chain=forward in-interface-list=TRUSTED out-interface-list=WAN comment="Allow Trusted to WAN"
add action=accept chain=forward in-interface=VLAN99_GUEST out-interface-list=WAN comment="Allow Guest to WAN"
# Add rule for cert-manager BEFORE dropping inter-VLAN traffic
add action=accept chain=forward src-interface=VLAN20_K3S dst-address-list=dns-provider-apis dst-port=443 protocol=tcp comment="Allow K3S to contact DNS provider for certs"
add action=drop chain=forward in-interface-list=LAN out-interface-list=LAN comment="Drop all inter-VLAN traffic by default"
add action=drop chain=forward comment="Drop all other forward"`,
    },
    {
      title: "Step 5: NAT (Masquerade)",
      description:
        "This rule translates private internal IP addresses to a public IP for internet access.",
      code: `/ip firewall nat
add action=masquerade chain=srcnat out-interface-list=WAN comment="Masquerade for Internet Access"`,
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
      code: `# On the RB3011 Router
# First, give the developer PC a static IP via DHCP lease, e.g., 192.168.10.50

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
      code: `# On the RB3011 Router
# Example: Expose a web service running at 192.168.20.150:30443 to the public on port 443 (HTTPS).

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
      title: "Step 1: Secure MAC Server (on ALL devices)",
      description:
        "The MAC server allows Layer 2 access via Winbox, bypassing IP firewall rules. We must restrict it to the management network.",
      code: `# Run on RB3011, CRS326, and RB2011
/tool mac-server
set allowed-interface-list=TRUSTED
/tool mac-server mac-winbox
set allowed-interface-list=TRUSTED`,
    },
    {
      title: "Step 2: System Security (on ALL devices)",
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
