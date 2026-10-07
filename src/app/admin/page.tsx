import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Course from "@/models/Course";

export default async function AdminOverview() {
  await connectToDatabase();
  
  const users = await User.find({}).populate('purchasedCourses');
  const totalCourses = await Course.countDocuments();
  
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
        <div className="glass-card-light p-6 border-l-4 border-l-blue-500 bg-white shadow-sm">
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Revenue</h3>
          <p className="text-3xl font-bold mt-2 text-slate-900">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="glass-card-light p-6 border-l-4 border-l-violet-500 bg-white shadow-sm">
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Active Students</h3>
          <p className="text-3xl font-bold mt-2 text-slate-900">{activeStudents.toLocaleString()}</p>
        </div>
        <div className="glass-card-light p-6 border-l-4 border-l-emerald-500 bg-white shadow-sm">
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Courses</h3>
          <p className="text-3xl font-bold mt-2 text-slate-900">{totalCourses.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="glass-card-light p-6 bg-white shadow-sm rounded-xl border border-slate-200">
        <h2 className="text-xl font-bold mb-4 text-slate-900">Recent Sales</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-sm">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Course</th>
                <th className="pb-3 font-medium">Date (Proxy)</th>
                <th className="pb-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {recentSales.map((sale, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-medium">{sale.user}</td>
                  <td className="py-3">{sale.course}</td>
                  <td className="py-3 text-slate-500">{new Date(sale.date).toLocaleDateString()}</td>
                  <td className="py-3 text-emerald-600 font-bold">${sale.amount.toFixed(2)}</td>
                </tr>
              ))}
              {recentSales.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">No sales recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
