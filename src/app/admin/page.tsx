export default function AdminOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-l-4 border-l-blue-500">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Revenue</h3>
          <p className="text-3xl font-bold mt-2">$12,450</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-violet-500">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Active Students</h3>
          <p className="text-3xl font-bold mt-2">1,248</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-green-500">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Courses</h3>
          <p className="text-3xl font-bold mt-2">24</p>
        </div>
      </div>
      
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">Recent Sales</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-sm">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Course</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3">alice@example.com</td>
                <td className="py-3">Complete Docker Masterclass</td>
                <td className="py-3">Today, 10:42 AM</td>
                <td className="py-3 text-green-400 font-medium">$49.99</td>
              </tr>
              <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3">bob@example.com</td>
                <td className="py-3">Advanced React Patterns</td>
                <td className="py-3">Yesterday</td>
                <td className="py-3 text-green-400 font-medium">$79.99</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
