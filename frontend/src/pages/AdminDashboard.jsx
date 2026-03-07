
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../config/api";

const AdminDashboard = () => {

  const [stats, setStats] = useState({
    products: 0,
    users: 0,
    orders: 0,
    revenue: 0
  });

  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStats = async () => {
      try {

        const [productsRes, usersRes, ordersRes] = await Promise.all([
          fetch(`${API}/products`),
          fetch(`${API}/users/admin/users-orders`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API}/users/admin/orders`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const products = await productsRes.json();
        const users = await usersRes.json();
        const orders = await ordersRes.json();

        if (productsRes.ok && usersRes.ok && ordersRes.ok) {

          const revenue = orders.orders
            .filter(o => o.paymentStatus === "paid" || o.status === "delivered")
            .reduce((sum, o) => sum + o.totalPrice, 0);

          setStats({
            products: products.length || 0,
            users: users.users?.length || 0,
            orders: orders.orders?.length || 0,
            revenue
          });

        }

      } catch {
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 dark:border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Revenue", value: `$${stats.revenue.toFixed(2)}`, color: "var(--accent)" },
    { label: "Total Orders", value: stats.orders, color: "var(--success)" },
    { label: "Total Users", value: stats.users, color: "#BF5AF2" },
    { label: "Total Products", value: stats.products, color: "var(--warning)" }
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] py-12 px-6 bg-gray-50 dark:bg-[#121212]">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">

          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            Admin Overview
          </h1>

          <p className="text-gray-600 dark:text-gray-400">
            Track store performance and key metrics.
          </p>

        </div>


        {/* STAT CARDS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {statCards.map((stat, i) => (

            <div
              key={stat.label}
              className="p-6 rounded-2xl border flex flex-col justify-between h-40 bg-white dark:bg-[#1C1C1E] border-gray-200 dark:border-white/10 shadow-sm text-gray-900 dark:text-gray-100"
            >

              <div className="flex justify-between items-start">

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                  style={{
                    background: stat.color + "20",
                    color: stat.color
                  }}
                >
                  {stat.label[6]}
                </div>

              </div>

              <div>

                <p className="text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>

                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </h3>

              </div>

            </div>

          ))}

        </div>


        {/* QUICK ACTIONS */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">

          <div className="p-8 rounded-2xl border bg-white dark:bg-[#1C1C1E] border-gray-200 dark:border-white/10 shadow-sm">

            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-4">

              <a
  href="/admin/add-product"
  className="p-4 rounded-xl border text-center font-medium flex flex-col items-center gap-3 transition border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#252528]"
>
  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500">
    +
  </div>

  Add Product
</a>


<a
  href="/admin/view-orders"
  className="p-4 rounded-xl border text-center font-medium flex flex-col items-center gap-3 transition border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#252528]"
>
  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500">
    🛒
  </div>

  View Orders
</a>
              

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
