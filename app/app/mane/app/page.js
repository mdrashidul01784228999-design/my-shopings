import Link from 'next/link';
export default function Home() {
  return (
    <main className="hero">
      <h1>🪂 BATTLE ROYALE</h1>
      <p>৩D থার্ড-পার্সন ব্যাটল রয়্যাল: লুট করুন, জোনের মধ্যে থাকুন এবং শেষ পর্যন্ত টিকে থাকুন। মোবাইল ও পিসি দুটোতেই চলবে।</p>
      <Link href="/game" className="btn">▶ খেলা শুরু করুন</Link>
      <div className="cards">
        <div className="card"><h3>🖥️ পিসি</h3>WASD = চলা, Shift = দৌড়<br/>মাউস = চারদিক দেখা<br/>বাম ক্লিক = গুলি</div>
        <div className="card"><h3>📱 মোবাইল</h3>বাম পাশে সোয়াইপ = চলা<br/>ডান পাশে সোয়াইপ = চারদিক দেখা<br/>🔫 বাটন = গুলি<br/>🏃 বাটন = দৌড়</div>
        <div className="card"><h3>🎯 লক্ষ্য</h3>১৯ জন বটকে হারান। জোনের বাইরে গেলে ড্যামেজ হবে। সবুজ বক্স = হেলথ।</div>
      </div>
    </main>
  );
}
