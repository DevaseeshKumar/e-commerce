import { Link } from "react-router-dom";

const Dashboard = () => {
    const cards = [
        { to: "/user/products", title: "Products", desc: "Browse all products", icon: <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>, color: "bg-amber-50" },
        { to: "/cart", title: "Cart", desc: "View your cart", icon: <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>, color: "bg-blue-50" },
        { to: "/orders", title: "Orders", desc: "Track your orders", icon: <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>, color: "bg-emerald-50" },
        { to: "/profile", title: "Profile", desc: "Manage your profile", icon: <svg className="w-7 h-7 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>, color: "bg-violet-50" },
    ];

    return (
        <div className="bg-gray-50 dark:bg-[#121212] min-h-screen p-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <Link key={card.to} to={card.to}>
                        <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 hover:shadow-md hover:border-gray-200 dark:hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300">
                            <div className={`w-14 h-14 ${card.color} dark:bg-opacity-20 rounded-xl flex items-center justify-center mb-4`}>
                                {card.icon}
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{card.title}</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{card.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;