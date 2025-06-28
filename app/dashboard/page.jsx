"use client";

import { useEffect, useRef, useState } from "react";
import { fetchApi } from "@/utils/FetchApi";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Download, User, PackageSearch } from "lucide-react";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [agents, setAgents] = useState([]);

  const parcelTypeChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const codChartRef = useRef(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const analyticsData = await fetchApi("/parcels/analytics", "GET");
      const usersData = await fetchApi("/user", "GET");
      const parcelsData = await fetchApi("/parcels", "GET");
      setAnalytics(analyticsData);
      setUsers(usersData);
      setParcels(parcelsData);
      setAgents(usersData.filter((u) => u.role === "agent"));
    };
    fetchDashboardData();
  }, []);

  const handleExportCSV = () => {
    const csvData = parcels.map(
      (p) =>
        `${p._id},${p.recipientName},${p.recipientEmail},${p.status},${
          p.parcelType
        },${p.isCOD ? "COD" : "Prepaid"}`
    );

    const blob = new Blob(
      [
        "ID,Recipient Name,Recipient Email,Status,Type,Payment Mode\n" +
          csvData.join("\n"),
      ],
      { type: "text/csv;charset=utf-8;" }
    );

    saveAs(blob, "parcel-report.csv");
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF("p", "mm", "a4");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Parcel Report of CourierX", 14, 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    const summaryY = 26;
    const lineHeight = 8;

    doc.text(
      `Avg Delivery Time: ${analytics.averageDeliveryTimeHours} hrs`,
      14,
      summaryY
    );
    doc.text(
      `Completion Rate: ${analytics.deliveryCompletionRate}`,
      14,
      summaryY + lineHeight
    );
    doc.text(
      `Assign Delay: ${analytics.averageAssignDelayHours} hrs`,
      14,
      summaryY + 2 * lineHeight
    );

    // 🖼️ Charts
    const chart1 = parcelTypeChartRef.current?.toBase64Image();
    const chart2 = statusChartRef.current?.toBase64Image();
    const chart3 = codChartRef.current?.toBase64Image();

    if (chart1 && chart2 && chart3) {
      const chartsY = summaryY + 3 * lineHeight + 10;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Parcel Insights", 14, chartsY);

      // First chart: full width
      doc.addImage(chart1, "PNG", 15, chartsY + 5, 180, 70);

      // Two charts side-by-side below
      doc.addImage(chart2, "PNG", 15, chartsY + 80, 85, 60); // left
      doc.addImage(chart3, "PNG", 110, chartsY + 80, 85, 60); // right
    }

    // 📋 Table Page
    doc.addPage();
    doc.setFontSize(16);
    doc.text("Parcel Details Table", 14, 16);

    const tableColumn = [
      "ID",
      "Recipient",
      "Email",
      "Status",
      "Type",
      "Payment Mode",
    ];

    const tableRows = parcels.map((p) => [
      p._id,
      p.recipientName,
      p.recipientEmail,
      p.status,
      p.parcelType,
      p.isCOD ? "COD" : "Prepaid",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 22,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save("parcel-report.pdf");
  };

  const handleAssignAgent = async (parcelId, agentId) => {
    try {
      await fetchApi(`/parcels/${parcelId}/assign`, "PUT", {
        assignedAgentId: agentId,
      });
      alert("✅ Agent assigned!");
      const updatedParcels = await fetchApi("/parcels", "GET");
      setParcels(updatedParcels);
    } catch (error) {
      console.error("Agent assignment failed:", error);
      alert("❌ Failed to assign agent");
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold mb-6">📊 Admin Dashboard</h1>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">📦 All Booked Parcels</h2>
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-xs uppercase">
              <tr>
                <th className="px-4 py-2">Recipient</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Payment Mode</th>
                <th className="px-4 py-2">Assign Agent</th>
              </tr>
            </thead>
            <tbody>
              {parcels
                .filter((p) => p.status === "Booked")
                .map((parcel) => (
                  <tr key={parcel._id} className="border-t">
                    <td className="px-4 py-2">{parcel.recipientName}</td>
                    <td className="px-4 py-2">{parcel.parcelType}</td>
                    <td className="px-4 py-2">{parcel.status}</td>
                    <td className="px-4 py-2">
                      {parcel.isCOD ? "COD" : "Prepaid"}
                    </td>
                    <td className="px-4 py-2">
                      <select
                        defaultValue=""
                        onChange={(e) =>
                          handleAssignAgent(parcel._id, e.target.value)
                        }
                        className="border rounded px-2 py-1"
                      >
                        <option disabled value="">
                          Select Agent
                        </option>
                        {agents.map((agent) => (
                          <option key={agent._id} value={agent._id}>
                            {agent.name} ({agent.email})
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {analytics ? (
        <div className="grid md:grid-cols-2 gap-6 py-10">
          <div className="bg-white p-4 shadow rounded">
            <h2 className="text-lg font-semibold mb-2">Delivery Metrics</h2>
            <p>
              📦 Avg Delivery Time: {analytics.averageDeliveryTimeHours} hrs
            </p>
            <p>✅ Completion Rate: {analytics.deliveryCompletionRate}</p>
            <p>⏱️ Assign Delay: {analytics.averageAssignDelayHours} hrs</p>
          </div>

          <div className="bg-white p-4 shadow rounded flex items-center justify-between">
            <h2 className="text-lg font-semibold">📥 Export Parcel Report</h2>
            <div className="flex gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <Download size={16} /> CSV
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                <Download size={16} /> PDF
              </button>
            </div>
          </div>

          <div className="bg-white p-4 shadow rounded">
            <h2 className="text-lg font-semibold mb-2">Top Agents</h2>
            <ul className="list-disc pl-5">
              {analytics.topAgentsByDelivery.map((agentData, idx) => {
                const matchedAgent = agents.find(
                  (a) => a._id === agentData._id
                );
                const name = matchedAgent ? matchedAgent.name : "Unknown Agent";
                return (
                  <li key={idx}>
                    {matchedAgent
                      ? `${matchedAgent.name} (${matchedAgent.email})`
                      : "Unknown Agent"}
                    - {agentData.count} deliveries
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Parcel Type Stats */}
          <div className="bg-white p-4 shadow-lg rounded-lg col-span-2">
            <h2 className="text-lg font-semibold mb-4">📦 Parcel Type Stats</h2>
            <Bar
              ref={parcelTypeChartRef}
              data={{
                labels: analytics.parcelTypeStats.map((d) => d._id),
                datasets: [
                  {
                    label: "Parcels",
                    data: analytics.parcelTypeStats.map((d) => d.count),
                    backgroundColor: "#4F46E5",
                    borderRadius: 5,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: { enabled: true },
                  title: {
                    display: true,
                    text: "Parcel Type Distribution",
                    font: { size: 16 },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
                  },
                },
              }}
            />
          </div>

          {/* Status Stats */}
          <div className="bg-white p-4 shadow-lg rounded-lg">
            <h2 className="text-lg font-semibold mb-4">
              📍 Parcel Status Stats
            </h2>
            <Pie
              ref={statusChartRef}
              data={{
                labels: analytics.statusStats.map((d) => d._id),
                datasets: [
                  {
                    data: analytics.statusStats.map((d) => d.count),
                    backgroundColor: [
                      "#10B981",
                      "#F59E0B",
                      "#EF4444",
                      "#6366F1",
                    ],
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      color: "#374151",
                      padding: 16,
                      font: { size: 14 },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: (ctx) =>
                        `${ctx.label}: ${ctx.parsed} (${(
                          (ctx.parsed /
                            analytics.statusStats.reduce(
                              (sum, s) => sum + s.count,
                              0
                            )) *
                          100
                        ).toFixed(1)}%)`,
                    },
                  },
                },
              }}
            />
          </div>

          {/* COD vs Prepaid */}
          <div className="bg-white p-4 shadow-lg rounded-lg">
            <h2 className="text-lg font-semibold mb-4">💰 COD vs Prepaid</h2>
            <Pie
              ref={codChartRef}
              data={{
                labels: analytics.codVsPrepaid.map((d) =>
                  d._id ? "COD" : "Prepaid"
                ),
                datasets: [
                  {
                    data: analytics.codVsPrepaid.map((d) => d.count),
                    backgroundColor: ["#3B82F6", "#A855F7"],
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      color: "#374151",
                      font: { size: 14 },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: (ctx) =>
                        `${ctx.label}: ${ctx.parsed} (${(
                          (ctx.parsed /
                            analytics.codVsPrepaid.reduce(
                              (sum, s) => sum + s.count,
                              0
                            )) *
                          100
                        ).toFixed(1)}%)`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      ) : (
        <p>Loading dashboard...</p>
      )}
    </main>
  );
}
