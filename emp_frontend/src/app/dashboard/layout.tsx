
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="hidden w-64 shrink-0 flex-col bg-slate-900 text-white md:flex">
        <div className="border-b border-slate-700 px-6 py-5">
          <h1 className="text-xl font-bold">EMS</h1>
          <p className="mt-1 text-sm text-slate-400">
            Employee Management
          </p>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          <Link
            href="/dashboard"
            className="block rounded-lg bg-slate-800 px-4 py-3 text-sm font-medium"
          >
            Dashboard
          </Link>

          <Link
            href="/dashboard/employees"
            className="block rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Employees
          </Link>
        </nav>

        <div className="border-t border-slate-700 px-6 py-4 text-xs text-slate-400">
          Employee Management System
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <p className="font-semibold text-slate-800">
            Employee Portal
          </p>

          <span className="text-sm text-slate-500">
            Management Dashboard
          </span>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
