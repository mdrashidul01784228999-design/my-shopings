"use client";

import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- Types & Initial Data ---
interface Transaction {
  id: number;
  title: string;
  amount: number;
  status: "Completed" | "Pending" | "Failed";
  date: string;
  type: "Credit" | "Debit" | "Request";
}

const payoutProviders = [
  { name: "bKash", category: "mfs" },
  { name: "Nagad", category: "mfs" },
  { name: "Rocket", category: "mfs" },
  { name: "Upay", category: "mfs" },
  { name: "BRAC Bank", category: "bank" },
  { name: "City Bank", category: "bank" },
  { name: "Islami Bank (IBBL)", category: "bank" },
  { name: "Dutch-Bangla Bank", category: "bank" },
];

export default function PremiumWalletApp() {
  // Global States
  const [balance, setBalance] = useState<number>(4543);
  const [activeSheet, setActiveSheet] = useState<"add" | "send" | "withdraw" | "request" | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Dynamic Activity List
  const [activities, setActivities] = useState<Transaction[]>([
    { id: 1, title: "Received from Arif", amount: 1500, status: "Completed", date: "Today, 10:30 AM", type: "Credit" },
    { id: 2, title: "Withdraw to bKash (Personal)", amount: 2000, status: "Completed", date: "Yesterday, 4:15 PM", type: "Debit" },
    { id: 3, title: "Request to Sarah", amount: 500, status: "Pending", date: "Sep 15, 2:00 PM", type: "Request" },
  ]);

  // Shared Form States
  const [amount, setAmount] = useState<string>("");
  const [account, setAccount] = useState<string>("");
  const [pin, setPin] = useState<string>("");
  
  // Withdraw Specific States
  const [providerName, setProviderName] = useState<string>(payoutProviders[0].name);
  const [accountType, setAccountType] = useState<string>("Personal");

  // Captcha States
  const [captchaNum1, setCaptchaNum1] = useState<number>(0);
  const [captchaNum2, setCaptchaNum2] = useState<number>(0);
  const [captchaInput, setCaptchaInput] = useState<string>("");

  const generateCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
    setCaptchaInput("");
  };

  // Reset forms and dynamic account types
  useEffect(() => {
    setAmount("");
    setAccount("");
    setPin("");
    if (activeSheet === "add" || activeSheet === "withdraw") {
      generateCaptcha();
    }
  }, [activeSheet]);

  // Auto-switch account types when switching between Bank and MFS
  useEffect(() => {
    const selected = payoutProviders.find(p => p.name === providerName);
    if (selected?.category === "bank") {
      setAccountType("Savings");
    } else {
      setAccountType("Personal");
    }
  }, [providerName]);

  const logActivity = (title: string, amountNum: number, type: "Credit" | "Debit" | "Request", status: "Completed" | "Pending" = "Completed") => {
    const newTx: Transaction = {
      id: Date.now(),
      title,
      amount: amountNum,
      status,
      date: "Just now",
      type
    };
    setActivities(prev => [newTx, ...prev]);
  };

  // --- Core Functions ---

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return toast.error("Enter a valid amount.");
    
    // Captcha Validation
    if (parseInt(captchaInput) !== captchaNum1 + captchaNum2) {
      toast.error("Incorrect security captcha.");
      generateCaptcha();
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    
    setBalance(prev => prev + val);
    logActivity("Added from Bank", val, "Credit");
    toast.success(`Successfully added ৳${val.toLocaleString()}`);
    setIsLoading(false);
    setActiveSheet(null);
  };

  const handleSendMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!account) return toast.error("Enter recipient number.");
    if (isNaN(val) || val <= 0) return toast.error("Enter a valid amount.");
    if (val > balance) return toast.error("Insufficient balance.");
    if (pin !== "1234") return toast.error("Invalid PIN. Use 1234");

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    
    setBalance(prev => prev - val);
    logActivity(`Sent to ${account}`, val, "Debit");
    toast.success(`Successfully sent ৳${val.toLocaleString()} to ${account}`);
    setIsLoading(false);
    setActiveSheet(null);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!account) return toast.error("Enter withdrawal account number.");
    if (isNaN(val) || val <= 0) return toast.error("Enter a valid amount.");
    if (val > balance) return toast.error("Insufficient balance.");

    // Captcha Validation
    if (parseInt(captchaInput) !== captchaNum1 + captchaNum2) {
      toast.error("Incorrect security captcha.");
      generateCaptcha();
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    
    setBalance(prev => prev - val);
    logActivity(`Withdraw to ${providerName} (${accountType})`, val, "Debit");
    toast.success(`Successfully withdrawn ৳${val.toLocaleString()} to ${providerName}`);
    setIsLoading(false);
    setActiveSheet(null);
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!account) return toast.error("Enter payer name or number.");
    if (isNaN(val) || val <= 0) return toast.error("Enter a valid amount.");

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    
    logActivity(`Request to ${account}`, val, "Request", "Pending");
    toast.success(`Payment request sent to ${account}`);
    setIsLoading(false);
    setActiveSheet(null);
  };

  return (
    <div className="flex min-h-screen justify-center bg-black font-sans text-white sm:items-center sm:p-6">
      <ToastContainer position="top-center" theme="dark" autoClose={2500} toastClassName="rounded-2xl border border-slate-800 bg-[#0a1128] text-sm font-medium shadow-2xl" />

      <div className="relative w-full max-w-md flex-1 overflow-hidden bg-[#040817] shadow-2xl sm:h-[850px] sm:flex-none sm:rounded-[3rem] sm:border-[6px] sm:border-slate-800 sm:shadow-cyan-900/20">
        
        <div className="h-full overflow-y-auto overflow-x-hidden pb-24">
          
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Good Morning</p>
              <h1 className="text-2xl font-bold tracking-tight text-white">Nazmul Hasan</h1>
            </div>
            <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-slate-800 bg-slate-900 shadow-inner">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Nazmul" alt="Profile" />
            </div>
          </div>

          <div className="px-6">
            <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0a1536] via-[#0d1f4d] to-[#050a1a] p-7 shadow-2xl backdrop-blur-xl">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/20 blur-3xl"></div>
              <div className="flex items-center justify-between">
                <div className="h-9 w-12 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-200 shadow-inner" />
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400">Pro</span>
              </div>
              <div className="mt-8">
                <p className="text-xs font-medium uppercase tracking-widest text-cyan-400/80">Available Balance</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-semibold text-white/70">৳</span>
                  <span className="text-5xl font-bold tracking-tighter text-white">{balance.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-4 gap-3 px-6">
            <button onClick={() => setActiveSheet("add")} className="group flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-cyan-400 transition-all group-hover:scale-105 group-hover:bg-cyan-400 group-hover:text-black">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 group-hover:text-cyan-400">Add</span>
            </button>
            <button onClick={() => setActiveSheet("send")} className="group flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-purple-400 transition-all group-hover:scale-105 group-hover:bg-purple-400 group-hover:text-black">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 group-hover:text-purple-400">Send</span>
            </button>
            <button onClick={() => setActiveSheet("withdraw")} className="group flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-emerald-400 transition-all group-hover:scale-105 group-hover:bg-emerald-400 group-hover:text-black">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 group-hover:text-emerald-400">Withdraw</span>
            </button>
            <button onClick={() => setActiveSheet("request")} className="group flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-amber-400 transition-all group-hover:scale-105 group-hover:bg-amber-400 group-hover:text-black">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 group-hover:text-amber-400">Request</span>
            </button>
          </div>

          <div className="mt-10 px-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Recent Activity</h3>
            <div className="mt-4 space-y-3">
              {activities.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white shadow-inner ${
                      tx.type === 'Credit' ? 'bg-emerald-500/20 text-emerald-400' : 
                      tx.type === 'Debit' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {tx.type === 'Credit' ? '+' : tx.type === 'Debit' ? '-' : '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{tx.title}</p>
                      <p className="text-xs text-slate-500">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.type === 'Credit' ? 'text-emerald-400' : tx.type === 'Debit' ? 'text-white' : 'text-amber-400'}`}>
                      {tx.type === 'Debit' ? '-' : tx.type === 'Credit' ? '+' : ''}৳{tx.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- BOTTOM SHEET --- */}
        <div className={`absolute inset-0 z-40 bg-black/80 backdrop-blur-md transition-opacity duration-300 ${activeSheet ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={() => !isLoading && setActiveSheet(null)} />

        <div className={`absolute inset-x-0 bottom-0 z-50 flex max-h-[95%] flex-col rounded-t-[2.5rem] border-t border-white/10 bg-[#060b17] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${activeSheet ? "translate-y-0" : "translate-y-full"}`}>
          
          <div className="flex w-full justify-center pt-5 pb-3" onClick={() => !isLoading && setActiveSheet(null)}>
            <div className="h-1.5 w-16 cursor-pointer rounded-full bg-white/20" />
          </div>

          <div className="overflow-y-auto p-6 pt-2 pb-10">
            
            {activeSheet === "add" && (
              <form onSubmit={handleAddMoney} className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Add Money</h3>
                  <p className="mt-1 text-sm text-slate-400">Recharge your wallet instantly.</p>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Amount to Add (৳)</label>
                  <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-lg font-bold text-white outline-none focus:border-cyan-400 transition" />
                </div>
                
                {/* Security Captcha - Add Money */}
                <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-black/50 p-4">
                  <div className="flex-1 text-center font-mono text-xl font-bold tracking-widest text-cyan-400">
                    {captchaNum1} + {captchaNum2}
                  </div>
                  <span className="text-slate-500">=</span>
                  <input
                    type="number"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="?"
                    className="w-20 rounded-xl border border-white/10 bg-white/5 py-3 text-center font-mono text-lg font-bold text-white outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <button type="submit" disabled={isLoading} className="flex w-full justify-center rounded-2xl bg-cyan-400 py-4 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-cyan-300 disabled:opacity-70">
                  {isLoading ? "Processing..." : "Confirm Deposit"}
                </button>
              </form>
            )}

            {activeSheet === "send" && (
              <form onSubmit={handleSendMoney} className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Send Money</h3>
                  <p className="mt-1 text-sm text-slate-400">Transfer funds to another user.</p>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Recipient Number</label>
                  <input type="text" placeholder="01XXXXXXXXX" value={account} onChange={e => setAccount(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none focus:border-purple-400 transition" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Amount (৳)</label>
                    <input type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white outline-none focus:border-purple-400 transition" />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Wallet PIN</label>
                    <input type="password" placeholder="****" value={pin} onChange={e => setPin(e.target.value)} maxLength={4} className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-center tracking-widest text-white outline-none focus:border-purple-400 transition" />
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="flex w-full justify-center rounded-2xl bg-purple-500 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-purple-400 disabled:opacity-70">
                  {isLoading ? "Processing..." : "Send Securely"}
                </button>
              </form>
            )}

            {activeSheet === "withdraw" && (
              <form onSubmit={handleWithdraw} className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Withdraw</h3>
                  <p className="mt-1 text-sm text-slate-400">Transfer to Bank or MFS.</p>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-1/2">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Bank / MFS</label>
                    <div className="relative">
                      <select 
                        value={providerName} 
                        onChange={e => setProviderName(e.target.value)} 
                        className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-white outline-none focus:border-emerald-400 transition"
                      >
                        {payoutProviders.map(p => (
                          <option key={p.name} value={p.name} className="bg-slate-900 text-white">{p.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="w-1/2">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Type</label>
                    <div className="relative">
                      <select 
                        value={accountType} 
                        onChange={e => setAccountType(e.target.value)} 
                        className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-white outline-none focus:border-emerald-400 transition"
                      >
                        {payoutProviders.find(p => p.name === providerName)?.category === "bank" ? (
                          <>
                            <option value="Savings" className="bg-slate-900">Savings</option>
                            <option value="Current" className="bg-slate-900">Current</option>
                          </>
                        ) : (
                          <>
                            <option value="Personal" className="bg-slate-900">Personal</option>
                            <option value="Agent" className="bg-slate-900">Agent</option>
                          </>
                        )}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Account / Agent Number</label>
                  <input type="text" placeholder="Enter number" value={account} onChange={e => setAccount(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none focus:border-emerald-400 transition" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Amount (৳)</label>
                  <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-lg font-bold text-white outline-none focus:border-emerald-400 transition" />
                </div>

                {/* Security Captcha - Withdraw Money */}
                <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-black/50 p-4">
                  <div className="flex-1 text-center font-mono text-xl font-bold tracking-widest text-emerald-400">
                    {captchaNum1} + {captchaNum2}
                  </div>
                  <span className="text-slate-500">=</span>
                  <input
                    type="number"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="?"
                    className="w-20 rounded-xl border border-white/10 bg-white/5 py-3 text-center font-mono text-lg font-bold text-white outline-none focus:border-emerald-400 transition"
                  />
                </div>

                <button type="submit" disabled={isLoading} className="flex w-full justify-center rounded-2xl bg-emerald-400 py-4 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-emerald-300 disabled:opacity-70">
                  {isLoading ? "Processing..." : "Confirm Payout"}
                </button>
              </form>
            )}

            {activeSheet === "request" && (
              <form onSubmit={handleRequest} className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Request Money</h3>
                  <p className="mt-1 text-sm text-slate-400">Generate a payment link.</p>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">From (Name/Number)</label>
                  <input type="text" placeholder="John Doe" value={account} onChange={e => setAccount(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none focus:border-amber-400 transition" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Amount (৳)</label>
                  <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-lg font-bold text-white outline-none focus:border-amber-400 transition" />
                </div>
                <button type="submit" disabled={isLoading} className="flex w-full justify-center rounded-2xl bg-amber-400 py-4 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-amber-300 disabled:opacity-70">
                  {isLoading ? "Processing..." : "Send Request"}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
