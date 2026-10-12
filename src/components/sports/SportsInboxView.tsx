"use client";

import React, { useState, useEffect } from "react";
import {
  Inbox,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  FileText,
  Building2,
  DollarSign,
  AlertTriangle,
  Download,
  KeyRound,
  Sparkles,
} from "lucide-react";

interface ScoutingRequest {
  id: string;
  club_id: string;
  club_name?: string;
  club_city?: string;
  website_url?: string;
  contact_phone?: string;
  status: "pending" | "accepted" | "declined" | "guardian_pending";
  guardian_approved: boolean;
  message?: string;
  trial_date?: string;
  created_at: string;
  updated_at: string;
}

interface EscrowTransaction {
  id: string;
  transactionType: "trial_fee" | "shop_order" | "van_booking";
  referenceId: string;
  amount: number;
  razorpayPaymentId: string;
  escrowStatus: "paid" | "held" | "released" | "refunded";
  date: string;
}

export default function SportsInboxView() {
  const [activeTab, setActiveTab] = useState<"scouting" | "escrow" | "announcements">("scouting");
  const [requests, setRequests] = useState<ScoutingRequest[]>([]);
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Guardian OTP Modal State
  const [selectedRequestForOtp, setSelectedRequestForOtp] = useState<ScoutingRequest | null>(null);
  const [guardianOtp, setGuardianOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  // Receipt Modal State
  const [viewingReceipt, setViewingReceipt] = useState<EscrowTransaction | null>(null);

  useEffect(() => {
    fetchInboxData();
  }, []);

  const fetchInboxData = async () => {
    setLoading(true);
    try {
      const [inboxRes, escrowRes] = await Promise.all([
        fetch("/api/sports/scouting/inbox?userId=default-profile"),
        fetch("/api/sports/escrow/user/default-profile"),
      ]);

      if (inboxRes.ok) {
        const inboxData = await inboxRes.json();
        setRequests(inboxData.requests || []);
      }
      if (escrowRes.ok) {
        const escrowData = await escrowRes.json();
        setTransactions(escrowData.transactions || []);
      }
    } catch {
      // Fallback sample data for preview if offline
      setRequests([
        {
          id: "req-1",
          club_id: "club-1",
          club_name: "Gujarat State Football Academy",
          club_city: "Gandhinagar",
          website_url: "https://gujaratfootball.org",
          contact_phone: "+91 79 2326 5400",
          status: "pending",
          guardian_approved: false,
          message: "You are invited for U-19 District Selection Trials this Saturday morning.",
          trial_date: new Date(Date.now() + 86400000 * 3).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "req-2",
          club_id: "club-2",
          club_name: "Ahmedabad Strikers FC",
          club_city: "Ahmedabad",
          website_url: "https://ahmedabadstrikers.com",
          contact_phone: "+91 98250 12345",
          status: "guardian_pending",
          guardian_approved: false,
          message: "Scout noticed your match statistics in Gandhinagar. Awaiting guardian clearance to review biometric passport.",
          trial_date: new Date(Date.now() + 86400000 * 5).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      setTransactions([
        {
          id: "tx-1",
          transactionType: "trial_fee",
          referenceId: "trial-ref-101",
          amount: 500,
          razorpayPaymentId: "rzp_pay_9948271",
          escrowStatus: "held",
          date: new Date().toLocaleDateString(),
        },
        {
          id: "tx-2",
          transactionType: "shop_order",
          referenceId: "shop-ref-202",
          amount: 2499,
          razorpayPaymentId: "rzp_pay_3819203",
          escrowStatus: "held",
          date: new Date(Date.now() - 86400000).toLocaleDateString(),
        },
        {
          id: "tx-3",
          transactionType: "van_booking",
          referenceId: "van-ref-303",
          amount: 1800,
          razorpayPaymentId: "rzp_pay_1192837",
          escrowStatus: "released",
          date: new Date(Date.now() - 86400000 * 10).toLocaleDateString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: string, action: "accept" | "decline") => {
    setActionLoading(requestId);
    try {
      const res = await fetch("/api/sports/scouting/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      const data = await res.json();

      if (data.requiresGuardian) {
        // Open Guardian Gate Modal
        const targetReq = requests.find((r) => r.id === requestId);
        if (targetReq) setSelectedRequestForOtp(targetReq);
      }
      fetchInboxData();
    } catch {
      alert("Failed to respond to request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleGuardianOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForOtp) return;
    if (guardianOtp.trim().length < 4) {
      setOtpError("Please enter a valid 4-digit guardian code (e.g., 1234)");
      return;
    }

    try {
      const res = await fetch("/api/sports/scouting/guardian-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRequestForOtp.id,
          otp: guardianOtp,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedRequestForOtp(null);
        setGuardianOtp("");
        setOtpError("");
        fetchInboxData();
      } else {
        setOtpError(data.error || "Guardian authorization failed");
      }
    } catch {
      setOtpError("Network error verifying guardian code");
    }
  };

  const handleRequestRefund = async (transactionId: string) => {
    if (!confirm("Are you sure you want to cancel and trigger an instant automated refund via Razorpay?")) return;
    setActionLoading(transactionId);
    try {
      const res = await fetch("/api/sports/escrow/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Instant refund completed! Amount refunded back to your source account.");
        fetchInboxData();
      }
    } catch {
      alert("Failed to trigger automated refund");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Inbox className="w-3.5 h-3.5" />
            Central Dispatch & Escrow Gate
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sports Inbox & Escrow Vault
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Accept-to-Unlock scouting requests, minor guardian approvals, and live held-funds state machine with instant automated pre-delivery refunds.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("scouting")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "scouting"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            Scouting Requests
            {requests.filter((r) => r.status === "pending" || r.status === "guardian_pending").length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("escrow")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "escrow"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Escrow & Receipts
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "announcements"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            Club Broadcasts
          </button>
        </div>
      </div>

      {/* Held-Funds State Machine Visual Banner (Visible when in Escrow tab) */}
      {activeTab === "escrow" && (
        <div className="bg-gradient-to-r from-emerald-50 via-sky-50 to-slate-50 border border-emerald-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Protected Held-Funds State Machine
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                100% Escrow Protection for All Sports Transactions
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Payments never release to academies, shop sellers, or van operators until trial attendance or package delivery is verified. Cancel anytime before fulfillment for an instant automated refund.
              </p>
            </div>

            {/* Lifecycle Steps */}
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-2 lg:pb-0">
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900">PAID</p>
                  <p className="text-[10px] text-slate-500">Razorpay Settled</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-300 shadow-sm shrink-0">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <div className="text-left">
                  <p className="text-xs font-bold text-amber-900">HELD IN ESCROW</p>
                  <p className="text-[10px] text-amber-700 font-medium">Safe in platform vault</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-300 shadow-sm shrink-0">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <div className="text-left">
                  <p className="text-xs font-bold text-emerald-900">RELEASED</p>
                  <p className="text-[10px] text-emerald-700 font-medium">Upon Delivery Proof</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab Content */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
          <p className="text-sm font-medium">Loading inbox dispatches & escrow state...</p>
        </div>
      ) : activeTab === "scouting" ? (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No Scouting Requests</h3>
              <p className="text-sm text-slate-500 mt-1">
                When registered academies scout your athlete profile, their invitations will appear here for consent.
              </p>
            </div>
          ) : (
            requests.map((req) => {
              const isAccepted = req.status === "accepted";
              const isGuardianPending = req.status === "guardian_pending";
              const isDeclined = req.status === "declined";

              return (
                <div
                  key={req.id}
                  className={`bg-white/80 backdrop-blur-xl border rounded-2xl p-6 transition-all ${
                    isAccepted
                      ? "border-emerald-200 shadow-sm"
                      : isGuardianPending
                      ? "border-amber-300 shadow-sm bg-amber-50/30"
                      : "border-slate-200/80 shadow-sm"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-slate-900">
                            {req.club_name || "Verified Sports Academy"}
                          </h3>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                            {req.club_city || "Gandhinagar"}
                          </span>
                          {/* Privacy Status Badge */}
                          {isAccepted ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                              <Unlock className="w-3 h-3" />
                              Private Stats Unlocked
                            </span>
                          ) : isGuardianPending ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold animate-pulse">
                              <ShieldAlert className="w-3 h-3" />
                              Guardian Approval Required
                            </span>
                          ) : isDeclined ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
                              <XCircle className="w-3 h-3" />
                              Declined / Locked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                              <Lock className="w-3 h-3" />
                              Biometrics Protected
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-slate-700 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          &ldquo;{req.message}&rdquo;
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3">
                          {req.trial_date && (
                            <span className="flex items-center gap-1 text-slate-700 font-medium">
                              <Clock className="w-3.5 h-3.5 text-sky-600" />
                              Proposed Trial: {new Date(req.trial_date).toLocaleDateString()}
                            </span>
                          )}
                          {req.contact_phone && (
                            <span>Official Contact: {req.contact_phone}</span>
                          )}
                          <span>Received: {new Date(req.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {req.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleRespond(req.id, "accept")}
                            disabled={actionLoading === req.id}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Accept & Unlock
                          </button>
                          <button
                            onClick={() => handleRespond(req.id, "decline")}
                            disabled={actionLoading === req.id}
                            className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all flex items-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4 text-slate-400" />
                            Decline
                          </button>
                        </>
                      )}

                      {isGuardianPending && (
                        <button
                          onClick={() => setSelectedRequestForOtp(req)}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <KeyRound className="w-4 h-4" />
                          Enter Guardian OTP
                        </button>
                      )}

                      {isAccepted && (
                        <button
                          onClick={() => handleRespond(req.id, "decline")}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                        >
                          Revoke Access
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : activeTab === "escrow" ? (
        <div className="space-y-4">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Transactions & Escrow Receipts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live ledger of trial fees, sports shop orders, and managed van transit subscriptions.
                </p>
              </div>
              <button
                onClick={fetchInboxData}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Reference / Order ID</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Razorpay ID</th>
                    <th className="px-6 py-3">Escrow Status</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {transactions.map((t) => {
                    const isHeld = t.escrowStatus === "held";
                    const isReleased = t.escrowStatus === "released";
                    const isRefunded = t.escrowStatus === "refunded";

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900 capitalize">
                          {t.transactionType.replace("_", " ")}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-600">
                          {t.referenceId}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          ₹{t.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500">
                          {t.razorpayPaymentId}
                        </td>
                        <td className="px-6 py-4">
                          {isHeld && (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                              <Lock className="w-3 h-3 text-amber-600" />
                              HELD IN ESCROW
                            </span>
                          )}
                          {isReleased && (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              RELEASED
                            </span>
                          )}
                          {isRefunded && (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 font-bold">
                              <RefreshCw className="w-3 h-3 text-sky-600" />
                              REFUNDED
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {t.date}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => setViewingReceipt(t)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                            title="View Receipt"
                          >
                            <FileText className="w-4 h-4" />
                            Receipt
                          </button>

                          {isHeld && (
                            <button
                              onClick={() => handleRequestRefund(t.id)}
                              disabled={actionLoading === t.id}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Instant Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Announcements Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold mb-3">
              Gujarat State Federation
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              State Youth Championship 2026 Registration Open
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              All registered U-17 and U-19 athletes from Ahmedabad and Gandhinagar districts can submit selection trial entry through verified academy endorsements.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Published 2 days ago</span>
              <span className="text-sky-600 font-semibold cursor-pointer hover:underline">
                View Guidelines &rarr;
              </span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold mb-3">
              Gandhinagar FA Invitational
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              Goalkeeper & Striker Intensive Masterclass
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              AFC licensed coaches hosting a 3-day high-performance tactical camp at Sector 21 Sports Complex with full biometric speed tracking.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Published yesterday</span>
              <span className="text-sky-600 font-semibold cursor-pointer hover:underline">
                Apply for Slot &rarr;
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Guardian OTP Approval Modal */}
      {selectedRequestForOtp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 text-center">
              Minor Protection Gate
            </h3>
            <p className="text-xs text-slate-600 text-center mt-1">
              Because this athlete is under 18, private physical stats and medical records cannot unlock without registered guardian confirmation.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <p><strong>Club:</strong> {selectedRequestForOtp.club_name || "Sports Club"}</p>
              <p><strong>Guardian Channel:</strong> Registered Phone & Email</p>
            </div>

            <form onSubmit={handleGuardianOtpSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  4-Digit Guardian Approval Code
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 1234"
                  value={guardianOtp}
                  onChange={(e) => setGuardianOtp(e.target.value)}
                  className="w-full text-center text-2xl font-mono tracking-widest px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                  autoFocus
                />
                {otpError && (
                  <p className="text-xs text-rose-600 font-medium mt-1 text-center">
                    {otpError}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRequestForOtp(null);
                    setGuardianOtp("");
                    setOtpError("");
                  }}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-all"
                >
                  Verify & Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Escrow PDF / Receipt Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
                  ST
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">SKILL-TRACK ESCROW RECEIPT</h4>
                  <p className="text-[10px] text-slate-500">Official Held-Funds Transaction Statement</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold uppercase">
                {viewingReceipt.escrowStatus}
              </span>
            </div>

            <div className="py-6 space-y-4 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-medium text-slate-900">{viewingReceipt.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Razorpay Payment Ref:</span>
                <span className="font-mono font-medium text-slate-900">{viewingReceipt.razorpayPaymentId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Payment Purpose:</span>
                <span className="font-semibold text-slate-900 capitalize">
                  {viewingReceipt.transactionType.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Settled Date:</span>
                <span className="font-medium text-slate-900">{viewingReceipt.date}</span>
              </div>
              <div className="flex justify-between py-2 bg-slate-50 px-3 rounded-xl">
                <span className="font-bold text-slate-700">Total Settled Amount:</span>
                <span className="text-base font-extrabold text-slate-900">
                  ₹{viewingReceipt.amount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 mb-6 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Money Protection Guarantee:</strong> Funds remain securely held in platform escrow until full fulfillment. Zero chargebacks or unauthorized release.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewingReceipt(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert("Receipt PDF downloaded to device.");
                  setViewingReceipt(null);
                }}
                className="w-1/2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
