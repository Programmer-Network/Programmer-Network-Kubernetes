import DatastoreChart from "../DatastoreChart";

const K3sInternalsSection = () => (
  <section id="k3s-internals" className="mb-16 md:mb-24 scroll-mt-20">
    <div className="text-center mb-12">
      <h2 className="font-bold tracking-tight text-slate-900 dark:text-slate-100">
        K3s In The Trenches
      </h2>
      <p className="mt-4">
        K3s has unique behaviors that can trip you up when moving from a homelab
        to production. Understanding its datastore options and HA model is key
        to building a stable cluster.
      </p>
    </div>

    <div className="rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6 md:p-8 mb-12">
      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">
        Datastore Performance: SQLite vs. Embedded `etcd`
      </h3>
      <p className="text-slate-600 dark:text-slate-300 mb-6 text-center">
        K3s defaults to SQLite for simplicity, but this is unsuitable for a
        multi-server HA cluster. The `kine` translation layer introduces
        overhead. For production, `etcd` is mandatory. This chart visualizes the
        performance cliff.
      </p>
      <DatastoreChart />
      <p className="text-center text-slate-500 dark:text-slate-400 mt-4">
        `etcd` is ~4x faster under load, with lower CPU usage. It demands faster
        disks but is the only option for a stable, multi-server production
        cluster.
      </p>
    </div>

    <div className="rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6 md:p-8">
      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">
        The Three Pillars of K3s High Availability
      </h3>
      <p className="text-slate-600 dark:text-slate-300 mb-8 text-center">
        True HA is more than just adding servers. Neglecting any of these
        pillars creates a hidden single point of failure and a false sense of
        security.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 text-amber-600 mb-4">
            👥
          </div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
            `etcd` Quorum
          </h4>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            You must have an odd number of server nodes (3, 5, etc.). This
            allows the Raft consensus algorithm to maintain a majority (quorum)
            and tolerate node failures. A 3-node cluster can lose 1 server; a
            5-node cluster can lose 2.
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 text-amber-600 mb-4">
            🎯
          </div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
            Stable API Endpoint
          </h4>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Agents and clients need a fixed IP address that floats between
            healthy servers. Without a Virtual IP (VIP), if the server you're
            targeting fails, your connection breaks. Use a load balancer or
            `keepalived` for the API server endpoint.
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 text-amber-600 mb-4">
            💾
          </div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
            Performant Hardware
          </h4>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            `etcd` is extremely sensitive to disk I/O latency. Running an HA
            cluster on slow storage like Raspberry Pi SD cards is a recipe for
            instability and data corruption. Use SSDs for your server nodes.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default K3sInternalsSection;
