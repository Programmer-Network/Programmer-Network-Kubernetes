import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useRef } from "react";

Chart.register(
  BarController,
  BarElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip
);

const DatastoreChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const isDarkMode =
    typeof window !== "undefined" &&
    document.documentElement.getAttribute("data-theme") === "dark";

  useEffect(() => {
    const fontColor = isDarkMode ? "#cbd5e1" : "#1e293b"; // slate-300 : slate-800
    const gridColor = isDarkMode ? "#334155" : "#e2e8f0"; // slate-700 : slate-200

    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["API Response Time (s)", "CPU Usage (arbitrary units)"],
          datasets: [
            {
              label: "K3s with SQLite",
              data: [1.4, 7],
              backgroundColor: "rgba(245, 158, 11, 0.6)", // amber-500
              borderColor: "rgba(245, 158, 11, 1)", // amber-500
              borderWidth: 1,
            },
            {
              label: "K3s with Embedded etcd",
              data: [0.35, 4],
              backgroundColor: "rgba(59, 130, 246, 0.6)", // blue-500
              borderColor: "rgba(59, 130, 246, 1)", // blue-500
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Datastore Performance Under Load",
              color: fontColor,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || "";
                  if (label) {
                    label += ": ";
                  }
                  if (context.parsed.y !== null) {
                    label +=
                      context.parsed.y +
                      (context.label.includes("Time") ? "s" : "");
                  }
                  return label;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: fontColor },
              grid: { color: gridColor },
            },
            x: {
              ticks: { color: fontColor },
              grid: { display: false },
            },
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [isDarkMode]);

  return (
    <div
      className="chart-container"
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "800px",
        marginLeft: "auto",
        marginRight: "auto",
        height: "400px",
        maxHeight: "50vh",
      }}
    >
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default DatastoreChart;
