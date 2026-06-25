export default function BlogPage() {
  const blogs = [
    { id: 1, title: "Top 5 thiên đường Resort biệt lập đắt đỏ bậc nhất Việt Nam", date: "15 Tháng 6, 2026", desc: "Khám phá không gian nghỉ dưỡng sang trọng, kín đáo, nơi trải nghiệm hoàng gia chạm ngõ thiên nhiên.", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&auto=format&fit=crop&q=80" },
    { id: 2, title: "Kinh nghiệm đặt phòng khách sạn 5 sao tối ưu ngân sách", date: "10 Tháng 6, 2026", desc: "Làm thế nào để tận hưởng dịch vụ cao cấp bậc nhất với mức chi phí hợp lý thông qua hệ thống thẻ hội viên.", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=80" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-serif font-bold mb-2">Cẩm nang du lịch</h1>
      <p className="text-slate-400 text-sm mb-12">Khơi nguồn cảm hứng cho chuyến hành trình tiếp theo của bạn.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogs.map((blog) => (
          <article key={blog.id} className="bg-[#0f1736] border border-slate-800/60 rounded-3xl overflow-hidden group cursor-pointer flex flex-col justify-between">
            <div className="h-64 overflow-hidden">
              <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-102 transition duration-500" />
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">{blog.date}</span>
                <h2 className="text-xl font-serif font-bold text-white group-hover:text-[#e5c158] transition duration-300 mt-1 leading-snug">{blog.title}</h2>
                <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">{blog.desc}</p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 text-xs font-bold text-[#e5c158] flex items-center gap-1 group-hover:underline">
                Đọc bài viết <span>&gt;</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}