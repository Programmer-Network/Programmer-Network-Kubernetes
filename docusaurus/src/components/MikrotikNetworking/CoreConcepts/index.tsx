import DeviceChart from "../DeviceChart";
import Section from "../Section";

const CoreConcepts = () => (
  <Section description="Understanding these principles is key to knowing why we're building the network this way.">
    <div className="space-y-8">
      <div>
        <h3 className="font-bold text-xl mb-2 text-[#ffab00]">
          The Big Picture: Why We Segment
        </h3>
        <p>
          The goal is to move from a "flat" network, where all devices can talk
          to each other by default, to a segmented network built on a{" "}
          <a
            className="!font-bold"
            target="_blank"
            rel="noopener noreferrer"
            href="https://en.wikipedia.org/wiki/Zero_trust_architecture"
          >
            Zero Trust
          </a>{" "}
          philosophy. In a flat network, if a less secure device (like a phone
          or an IoT gadget) gets compromised, an attacker can immediately see
          and attempt to attack critical K3S servers.
        </p>
        <p className="mt-4">
          By segmenting, we assume{" "}
          <strong>no device is inherently trustworthy.</strong> We build digital
          walls between groups of devices. Traffic can't cross these walls
          unless we create a specific, explicit firewall rule to allow it. This
          approach drastically reduces the attack surface and contains potential
          breaches, which is essential when self-hosting production-grade
          services.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-xl mb-2 text-[#ffab00]">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://help.mikrotik.com/docs/spaces/ROS/pages/88014957/VLAN"
          >
            VLANs
          </a>{" "}
          : The Digital Walls for Isolation
        </h3>
        <p>
          <a href="https://help.mikrotik.com/docs/spaces/ROS/pages/88014957/VLAN">
            VLANs
          </a>{" "}
          (Virtual LANs) are the primary tool used to build these digital walls.
          It's helpful to think of the CRS326 switch not as one big switch, but
          as a box containing four completely separate, smaller virtual
          switches. Each VLAN (HOME_NET, K3S_CLUSTER, etc.) is one of these
          virtual switches.
        </p>
        <p className="mt-4">
          Devices plugged into ports assigned to VLAN 10 can talk to each other
          at full speed, but they are fundamentally unaware that devices on VLAN
          20 even exist. This is called <strong>Layer 2 Isolation.</strong> It's
          the most basic and powerful form of network separation, and the switch
          hardware (the CRS326) enforces it at wire-speed.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-xl mb-2 text-[#ffab00]">
          Router-on-a-Stick: The Guarded Gate for Control
        </h3>
        <p>
          Since the{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://help.mikrotik.com/docs/spaces/ROS/pages/88014957/VLAN"
          >
            VLANs
          </a>{" "}
          are isolated, we need a way to let <em>some</em> traffic pass between
          them in a controlled way. This is the job of the router (the RB3011).
          The "Router-on-a-Stick" (RoaS) model uses a single physical cable,
          configured as a <strong>VLAN Trunk</strong>, to connect the switch to
          the router.
        </p>
        <p className="mt-4">
          Every packet of data that travels over this trunk cable gets a digital
          "passport stamp" called an 802.1Q tag. This tag tells the router which
          VLAN the packet came from. The router can then inspect the packet,
          check it against the firewall rules, and decide if it's allowed to go
          to its destination VLAN. If it is, the router stamps it with a new
          passport for the destination VLAN and sends it back to the switch.
          This process provides
          <strong>centralized control and security inspection</strong> for all
          cross-network communication.
        </p>
      </div>
    </div>
    <div className="mt-8">
      <DeviceChart />
    </div>
  </Section>
);

export default CoreConcepts;
