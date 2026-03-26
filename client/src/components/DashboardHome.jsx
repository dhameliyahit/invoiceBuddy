import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  FileText, 
  Plus, 
  Clock, 
  TrendingUp, 
  Settings,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const base_url = import.meta.env.VITE_BACKEND_URL;

const DashboardHome = () => {
  const [data, setData] = useState({ stats: null, recentInvoices: [], user: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${base_url}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(val || 0);
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
        <p className="text-gray-600 font-medium">Loading Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "Playfair Display, cursive" }}>
            Welcome Back, {data.user?.businessName || 'Business Owner'}
          </h1>
          <p className="text-gray-500 mt-1">Here is what's happening today.</p>
        </div>
        <Link 
          to="/dashboard/invoice"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105"
        >
          <Plus size={20} />
          <span>New Invoice</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatINR(data.stats?.totalRevenue)}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
            <FileText size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Invoices Issued</p>
            <p className="text-2xl font-bold text-gray-900">{data.stats?.totalInvoices || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl text-green-600">
            <IndianRupee size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Average per Invoice</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatINR(data.stats?.totalRevenue / (data.stats?.totalInvoices || 1))}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Invoices */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock size={20} className="text-gray-400" />
              Recent Invoices
            </h2>
            <Link to="/dashboard/invoice" className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-400">
                <tr>
                  <th className="px-6 py-3">Invoice No</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentInvoices.length > 0 ? (
                  data.recentInvoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-800">{inv.invoiceNo}</td>
                      <td className="px-6 py-4 text-gray-600">{inv.customer?.name}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-blue-600">{formatINR(inv.grandTotal)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                      No invoices generated yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Profile Summary */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#19183B] to-[#28274d] text-white p-6 rounded-2xl shadow-xl shadow-blue-900/10">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Settings size={20} className="text-blue-400" />
              Quick Setup
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                <span className="text-sm font-medium">Logo Configured</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                <span className="text-sm font-medium">Business Email Verified</span>
              </div>
              <p className="text-sm text-gray-400 py-2 leading-relaxed">
                Your business setup is complete. You can start generating professional invoices now.
              </p>
              <Link
                to="/dashboard/settings"
                className="block w-full text-center bg-white/10 hover:bg-white/20 text-white rounded-lg py-2 transition-colors border border-white/10 font-medium"
              >
                Update Configuration
              </Link>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="text-blue-900 font-bold mb-2">Pro Tip!</h3>
            <p className="text-sm text-blue-700 leading-relaxed">
              Use proper watermark text for your business branding. It appears on every PDF you generate for your clients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
