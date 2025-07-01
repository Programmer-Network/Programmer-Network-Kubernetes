const BareMetalSection = () => (
  <section id="bare-metal" className="mb-16 md:mb-24 scroll-mt-20">
    <div className="text-center mb-12">
      <h2 className="font-bold tracking-tight text-slate-900 dark:text-slate-100">
        The Bare-Metal Gauntlet
      </h2>
      <p className="mt-4">
        In the cloud, networking and storage are managed services. On bare
        metal, they are your direct responsibility and the source of the most
        difficult challenges. This section provides a roadmap to tame them.
      </p>
    </div>

    <div className="rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6 md:p-8 mb-12">
      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">
        Networking on Hard Mode
      </h3>
      <p className="text-slate-600 dark:text-slate-300 mb-6">
        Bare-metal networking is a three-layer problem. You must solve each in
        order: Host Prep, CNI, and Load Balancing. Failure at any layer leads to
        a non-functional cluster.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4 border-r-0 md:border-r border-slate-200 dark:border-slate-700">
          <div className="text-amber-500 font-bold">1</div>
          <h4 className="font-semibold mt-2 text-slate-900 dark:text-slate-100">
            Prepare the Host
          </h4>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Disable swap, load kernel modules, and configure host firewalls.
            Most `NotReady` nodes are caused by skipping these steps.
          </p>
        </div>
        <div className="p-4 border-r-0 md:border-r border-slate-200 dark:border-slate-700">
          <div className="text-amber-500 font-bold">2</div>
          <h4 className="font-semibold mt-2 text-slate-900 dark:text-slate-100">
            Choose a CNI
          </h4>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            K3s defaults to Flannel (no Network Policies). For production
            security, disable it and install Calico to enable network
            segmentation.
          </p>
        </div>
        <div className="p-4">
          <div className="text-amber-500 font-bold">3</div>
          <h4 className="font-semibold mt-2 text-slate-900 dark:text-slate-100">
            Expose Services
          </h4>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            `LoadBalancer` services will be `Pending` forever without a
            controller. Install MetalLB to assign external IPs from your local
            network.
          </p>
        </div>
      </div>
    </div>

    <div className="rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6 md:p-8">
      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">
        The Persistent Storage Quagmire
      </h3>
      <p className="text-slate-600 dark:text-slate-300 mb-6">
        Choosing your storage solution is a critical architectural decision.
        There's no single best answer, only trade-offs. Compare the most common
        options below.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-slate-500 dark:text-slate-400">
          <thead className="text-slate-700 dark:text-slate-300 uppercase bg-slate-100 dark:bg-slate-700">
            <tr>
              <th scope="col" className="px-6 py-3">
                Solution
              </th>
              <th scope="col" className="px-6 py-3">
                Best For
              </th>
              <th scope="col" className="px-6 py-3">
                Ease of Setup
              </th>
              <th scope="col" className="px-6 py-3">
                Performance
              </th>
              <th scope="col" className="px-6 py-3">
                Resilience
              </th>
              <th scope="col" className="px-6 py-3">
                Key "Gotcha"
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b dark:border-slate-700">
              <th
                scope="row"
                className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap"
              >
                NFS
              </th>
              <td className="px-6 py-4">Homelab, simple sharing</td>
              <td className="px-6 py-4">Very Easy</td>
              <td className="px-6 py-4">Low</td>
              <td className="px-6 py-4">SPOF</td>
              <td className="px-6 py-4">Performance bottleneck</td>
            </tr>
            <tr className="border-b dark:border-slate-700">
              <th
                scope="row"
                className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap"
              >
                Longhorn
              </th>
              <td className="px-6 py-4">Small-to-medium prod</td>
              <td className="px-6 py-4">Easy</td>
              <td className="px-6 py-4">Moderate</td>
              <td className="px-6 py-4">Replicated</td>
              <td className="px-6 py-4">Slow rebuilds on node reboot</td>
            </tr>
            <tr className="border-b dark:border-slate-700">
              <th
                scope="row"
                className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap"
              >
                Ceph (Rook)
              </th>
              <td className="px-6 py-4">Large-scale prod</td>
              <td className="px-6 py-4">Complex</td>
              <td className="px-6 py-4">High</td>
              <td className="px-6 py-4">Highly Resilient</td>
              <td className="px-6 py-4">High complexity & resource use</td>
            </tr>
            <tr className="bg-white dark:bg-slate-800">
              <th
                scope="row"
                className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap"
              >
                OpenEBS Mayastor
              </th>
              <td className="px-6 py-4">Performance-critical</td>
              <td className="px-6 py-4">Moderate</td>
              <td className="px-6 py-4">Very High</td>
              <td className="px-6 py-4">Replicated</td>
              <td className="px-6 py-4">Very high CPU usage</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

export default BareMetalSection;
