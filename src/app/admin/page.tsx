import { getUserFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const user = await getUserFromCookie();

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    redirect('/login');
  }

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
    <div className="space-y-6 text-[#1B2E26]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-[#FAF7F0] p-5 sm:p-6 rounded-2xl border border-[#E9DFCC] border-l-4 border-l-[#24483C] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C]">Total Tuition Revenue</span>
          <p className="font-serif text-2xl sm:text-3xl font-bold mt-2 text-[#1B2E26]">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-[#FAF7F0] p-5 sm:p-6 rounded-2xl border border-[#E9DFCC] border-l-4 border-l-[#C96F4A] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C96F4A]">Enrolled Scholars</span>
          <p className="font-serif text-2xl sm:text-3xl font-bold mt-2 text-[#1B2E26]">{activeStudents.toLocaleString()}</p>
        </div>
        <div className="bg-[#FAF7F0] p-5 sm:p-6 rounded-2xl border border-[#E9DFCC] border-l-4 border-l-[#24483C] shadow-sm sm:col-span-2 md:col-span-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C]">Curricula Catalog</span>
          <p className="font-serif text-2xl sm:text-3xl font-bold mt-2 text-[#1B2E26]">{totalCourses.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="bg-[#FAF7F0] p-4 sm:p-6 md:p-8 rounded-2xl border border-[#E9DFCC] shadow-sm">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A]">Auditing Log</span>
          <h2 className="font-serif text-xl font-bold text-[#1B2E26]">Recent Enrolment Transactions</h2>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-[500px] text-left">
            <thead>
              <tr className="border-b border-[#E9DFCC] text-xs font-bold uppercase tracking-wider text-[#3D5A4C]">
                <th className="pb-3 font-semibold">Scholar Email</th>
                <th className="pb-3 font-semibold">Course Title</th>
                <th className="pb-3 font-semibold">Registration Date</th>
                <th className="pb-3 font-semibold text-right">Tuition</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-[#E9DFCC]/50 text-[#1B2E26]">
              {recentSales.map((sale, idx) => (
                <tr key={idx} className="hover:bg-[#F8F4EC] transition-colors">
                  <td className="py-3.5 font-mono text-[#1B2E26]">{sale.user}</td>
                  <td className="py-3.5 font-medium">{sale.course}</td>
                  <td className="py-3.5 text-[#556960]">{new Date(sale.date).toLocaleDateString()}</td>
                  <td className="py-3.5 text-right font-serif font-bold text-[#24483C] text-sm">${sale.amount.toFixed(2)}</td>
                </tr>
              ))}
              {recentSales.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#556960]">No sales recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
