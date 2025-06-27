"use client";

import { useEffect, useState } from "react";
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
        `${p._id},${p.recipientName},${p.status},${p.parcelType},${
          p.isCOD ? "COD" : "Prepaid"
        }`
    );
    const blob = new Blob(
      ["ID,Recipient,Status,Type,Payment Mode\n" + csvData.join("\n")],
      {
        type: "text/csv;charset=utf-8;",
      }
    );
    saveAs(blob, "parcel-report.csv");
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
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>

          <div className="bg-white p-4 shadow rounded">
            <h2 className="text-lg font-semibold mb-2">Parcel Type Stats</h2>
            <Bar
              data={{
                labels: analytics.parcelTypeStats.map((d) => d._id),
                datasets: [
                  {
                    label: "Count",
                    data: analytics.parcelTypeStats.map((d) => d.count),
                    backgroundColor: "#4F46E5",
                  },
                ],
              }}
            />
          </div>

          <div className="bg-white p-4 shadow rounded">
            <h2 className="text-lg font-semibold mb-2">Status Stats</h2>
            <Pie
              data={{
                labels: analytics.statusStats.map((d) => d._id),
                datasets: [
                  {
                    data: analytics.statusStats.map((d) => d.count),
                    backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
                  },
                ],
              }}
            />
          </div>

          <div className="bg-white p-4 shadow rounded">
            <h2 className="text-lg font-semibold mb-2">COD vs Prepaid</h2>
            <Pie
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
            />
          </div>

          <div className="bg-white p-4 shadow rounded">
            <h2 className="text-lg font-semibold mb-2">Top Agents</h2>
            <ul className="list-disc pl-5">
              {analytics.topAgentsByDelivery.map((agent, idx) => (
                <li key={idx}>
                  Agent ID: {agent._id} - {agent.count} deliveries
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p>Loading dashboard...</p>
      )}
    </main>
  );
}
