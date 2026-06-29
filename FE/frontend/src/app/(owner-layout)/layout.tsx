export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0b1329] text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950">
      {children}
    </div>
  );
}