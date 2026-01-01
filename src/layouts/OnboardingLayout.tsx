import { Outlet } from "react-router-dom";

export default function OnboardingLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <header className="bg-white border-b border-gray-100 p-6 flex items-center justify-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            NeointeractionHR
          </h1>
        </header>
        <main className="p-0">
          <Outlet />
        </main>
      </div>
      <footer className="mt-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Neointeraction Design. All rights
        reserved.
      </footer>
    </div>
  );
}
