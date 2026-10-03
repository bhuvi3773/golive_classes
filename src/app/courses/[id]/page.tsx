import { PlayCircle, CheckCircle2, Lock, Clock, Award } from "lucide-react";
import Link from "next/link";

export default async function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Using Promise based params for Next 15 App Router
  const id = (await params).id;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Course Hero */}
      <div className="glass-card overflow-hidden">
        <div className="h-64 md:h-96 bg-gray-900 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e2130] to-transparent"></div>
          
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
            <span className="text-sm font-semibold px-3 py-1 bg-blue-500/20 text-blue-400 rounded w-fit mb-4">DevOps</span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white max-w-3xl leading-tight">Complete Docker & Kubernetes Masterclass</h1>
            <p className="text-gray-300 mt-4 max-w-2xl text-lg">Learn how to deploy and manage scalable applications with Docker and Kubernetes from scratch. Perfect for beginners and advanced developers.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Course Content / Syllabus */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>
            
            <div className="space-y-4">
              {/* Module 1 */}
              <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                <div className="p-4 bg-white/5 font-semibold flex justify-between items-center">
                  <span>Module 1: Introduction to Containers</span>
                  <span className="text-sm text-gray-400 font-normal">3 Lectures • 45 min</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <PlayCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white">What is Docker?</p>
                      <p className="text-gray-400 text-xs mt-1">Preview available</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Lock size={18} className="text-gray-500 shrink-0 mt-0.5" />
                    <p className="text-gray-400">Installing Docker on Windows/Mac</p>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Lock size={18} className="text-gray-500 shrink-0 mt-0.5" />
                    <p className="text-gray-400">Your First Container</p>
                  </div>
                </div>
              </div>

              {/* Module 2 */}
              <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                <div className="p-4 bg-white/5 font-semibold flex justify-between items-center">
                  <span>Module 2: Advanced Docker Compose</span>
                  <span className="text-sm text-gray-400 font-normal">5 Lectures • 1.5 hrs</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <Lock size={18} className="text-gray-500 shrink-0 mt-0.5" />
                    <p className="text-gray-400">Multi-container networking</p>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Lock size={18} className="text-gray-500 shrink-0 mt-0.5" />
                    <p className="text-gray-400">Volumes and persistent data</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Card */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-8">
            <div className="text-center mb-6 border-b border-white/10 pb-6">
              <span className="text-4xl font-extrabold text-white">$49.99</span>
            </div>
            
            <button className="w-full btn-primary py-4 text-lg font-bold shadow-[0_0_20px_rgba(37,99,235,0.5)]">
              Buy Now
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">Full Lifetime Access • 30-Day Money-Back Guarantee</p>
            
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold text-white">This course includes:</h3>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <PlayCircle size={16} className="text-blue-400" />
                12 hours on-demand video
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 size={16} className="text-green-400" />
                Full source code & assignments
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Award size={16} className="text-yellow-400" />
                Certificate of completion
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Clock size={16} className="text-violet-400" />
                Access on mobile and TV
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
