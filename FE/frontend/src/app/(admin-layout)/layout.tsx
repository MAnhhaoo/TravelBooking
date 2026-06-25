export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-red-950 text-white p-6">
        <div className="font-bold text-lg mb-6">⚙️ HỆ THỐNG ADMIN</div>
        <nav className="space-y-2 text-sm text-red-200">
          <div className="p-2 bg-red-900 rounded text-white font-medium">📊 Tổng quan</div>
          <div className="p-2 hover:bg-red-900 rounded cursor-pointer">🏢 Duyệt Khách Sạn</div>
          <div className="p-2 hover:bg-red-900 rounded cursor-pointer">👤 Quản lý User</div>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}