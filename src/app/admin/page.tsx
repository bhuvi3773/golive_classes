import prisma from "@/lib/prisma";

export default async function AdminOverview() {
  const users = await prisma.user.findMany({ include: { purchasedCourses: true } });
  const totalCourses = await prisma.course.count();
  
  let totalRevenue = 0;
  let activeStudents = 0;
  let recentSales: any[] = [];
  
  users.forEach(user => {
    if (user.purchasedCourses && user.purchasedCourses.length > 0) {
      activeStudents++;
      user.purchasedCourses.forEach((course: any) => {
        totalRevenue += (course.price || 99); // default to 99 if price missing
        recentSales.push({
          user: user.email,
          course: course.title,
          date: user.createdAt || new Date(), // using user creation date as a proxy for purchase date since we don't track it
          amount: course.price || 99
        });
      });
    }
  });

  // Sort recent sales by date descending
  recentSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  recentSales = recentSales.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-l-4 border-l-teal-400 shadow-xl border-white/5">
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Revenue</h3>
          <p className="text-3xl font-bold mt-2 text-white">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-cyan-500 shadow-xl border-white/5">
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Active Students</h3>
          <p className="text-3xl font-bold mt-2 text-white">{activeStudents.toLocaleString()}</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-emerald-500 shadow-xl border-white/5">
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Courses</h3>
          <p className="text-3xl font-bold mt-2 text-white">{totalCourses.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="glass-card p-6 shadow-2xl rounded-xl border border-white/10">
        <h2 className="text-xl font-bold mb-4 text-white">Recent Sales</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-sm">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Course</th>
                <th className="pb-3 font-medium">Date (Proxy)</th>
                <th className="pb-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-300">
              {recentSales.map((sale, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 font-medium text-white">{sale.user}</td>
                  <td className="py-3">{sale.course}</td>
                  <td className="py-3 text-slate-500">{new Date(sale.date).toLocaleDateString()}</td>
                  <td className="py-3 text-teal-400 font-bold">${sale.amount.toFixed(2)}</td>
                </tr>
              ))}
              {recentSales.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">No sales recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
