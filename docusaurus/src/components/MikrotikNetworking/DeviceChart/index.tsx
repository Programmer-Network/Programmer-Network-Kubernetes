import { Chart, registerables } from "chart.js";
import { useEffect, useRef } from "react";

Chart.register(...registerables);

const DeviceChart = () => {
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["RB3011 (Router)", "CRS326 (Switch)", "RB2011 (AP)"],
        datasets: [
          {
            label: "CPU Power (Normalized)",
            data: [100, 25, 43],
            backgroundColor: "rgba(255, 171, 0, 0.6)",
            borderColor: "rgba(255, 171, 0, 1)",
            borderWidth: 1,
          },
          {
            label: "RAM (Normalized)",
            data: [100, 10, 12.5],
            backgroundColor: "rgba(96, 165, 250, 0.6)",
            borderColor: "rgba(96, 165, 250, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "rgba(255, 255, 255, 0.1)" },
            ticks: {
              color: "#9ca3af",
              callback: (value: string | number) => value + "%",
            },
          },
          x: {
            grid: { display: false },
            ticks: { color: "#9ca3af" },
          },
        },
        plugins: {
          legend: { labels: { color: "#d1d5db" } },
          title: {
            display: true,
            text: "Relative Hardware Capability",
            color: "#f9fafb",
            font: { size: 16 },
          },
          tooltip: {
            callbacks: {
              label: function (context: any) {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.dataset.label === "CPU Power (Normalized)") {
                  if (context.label === "RB3011 (Router)")
                    label += "1.4 GHz Dual-Core";
                  if (context.label === "CRS326 (Switch)")
                    label += "800 MHz Single-Core";
                  if (context.label === "RB2011 (AP)")
                    label += "600 MHz Single-Core";
                } else {
                  if (context.label === "RB3011 (Router)") label += "1 GB";
                  if (context.label === "CRS326 (Switch)") label += "512 MB";
                  if (context.label === "RB2011 (AP)") label += "128 MB";
                }
                return label;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="border border-gray-800 p-6 bg-[#1c1c1c]">
      <h3 className="font-bold text-xl mb-4">Device Roles & Strengths</h3>
      <p className="mb-6">
        Each device is assigned a role that plays to its hardware strengths,
        ensuring optimal performance.
      </p>
      <div className="relative h-96 w-full max-w-3xl mx-auto">
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
};

export default DeviceChart;
