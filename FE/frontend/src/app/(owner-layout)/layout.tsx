export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-emerald-950 text-white p-6">
        <div className="font-bold text-lg mb-6">🔑 HOTEL OWNER</div>
        <nav className="space-y-2 text-sm text-emerald-200">
          <div className="p-2 bg-emerald-900 rounded text-white font-medium">🏨 Khách sạn của tôi</div>
          <div className="p-2 hover:bg-emerald-900 rounded cursor-pointer">🛏️ Đăng quản lý phòng</div>
          <div className="p-2 hover:bg-emerald-900 rounded cursor-pointer">💰 Lịch sử đặt phòng</div>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}