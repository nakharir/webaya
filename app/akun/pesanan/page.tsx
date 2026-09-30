"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/krezoema/Navbar";
import Footer from "@/components/krezoema/Footer";
import { useAuth } from "@/context/AuthContext";
import { getCustomerOrders } from "@/lib/api/ecommerce";
import type { ApiOrder, OrderStatus } from "@/lib/api/types";
import { formatRupiah } from "@/lib/api/helpers";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Eye,
  X,
  AlertCircle,
  Calendar,
  MapPin,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";

// Status configuration matching KREZOEMA craft modern aesthetic
const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  pending: {
    label: "Menunggu",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200/80",
    icon: Clock,
  },
  confirmed: {
    label: "Dikonfirmasi",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200/80",
    icon: CheckCircle2,
  },
  processing: {
    label: "Diproses",
    bg: "bg-indigo-50",
    text: "text-indigo-800",
    border: "border-indigo-200/80",
    icon: Package,
  },
  shipped: {
    label: "Dikirim",
    bg: "bg-cyan-50",
    text: "text-cyan-800",
    border: "border-cyan-200/80",
    icon: Truck,
  },
  completed: {
    label: "Selesai",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200/80",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Dibatalkan",
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200/80",
    icon: XCircle,
  },
};

function formatOrderDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date).replace(" pukul", ",");
  } catch {
    return dateStr;
  }
}

const ITEMS_PER_PAGE = 10;

export default function PesananPage() {
  const router = useRouter();
  const { customer, isLoggedIn, isHydrated, isLoading, logout } = useAuth();

  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch orders from existing endpoint GET /api/ecommerce/orders
  const fetchOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    setOrderError(null);
    try {
      const data = await getCustomerOrders();
      setOrders(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setOrderError("Sesi Anda telah berakhir. Silakan masuk kembali.");
      } else {
        setOrderError(
          err?.response?.data?.message ||
            "Gagal memuat daftar pesanan. Pastikan koneksi stabil dan coba lagi."
        );
      }
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (isHydrated && isLoggedIn) {
      fetchOrders();
    } else if (isHydrated && !isLoggedIn) {
      setIsLoadingOrders(false);
    }
  }, [isHydrated, isLoggedIn, fetchOrders]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return orders.slice(start, start + ITEMS_PER_PAGE);
  }, [orders, currentPage]);

  // Loading skeleton while restoring auth session
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-warm text-foreground">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20 text-muted-foreground text-sm">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-brand-pink" />
            <span>Memuat data akun Anda...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Auth Protection: Not Logged In View
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-warm text-foreground antialiased selection:bg-brand-pink-soft selection:text-brand-pink-dark">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6">
          <div className="max-w-md w-full bg-white rounded-3xl border border-border/80 p-8 sm:p-10 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-brand-pink-soft text-brand-pink-dark flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 stroke-[1.8]" />
            </div>
            <h1 className="font-sans text-xl sm:text-2xl font-bold text-foreground mb-2">
              Masuk ke Akun Anda
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed">
              Silakan masuk terlebih dahulu untuk melihat riwayat pesanan Anda di KREZOEMA.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/login?redirect=/akun/pesanan"
                className="w-full py-3 px-6 rounded-full bg-brand-pink text-white font-semibold text-xs sm:text-sm hover:bg-brand-pink-dark transition-colors shadow-sm text-center"
              >
                Masuk ke Akun
              </Link>
              <Link
                href="/register?redirect=/akun/pesanan"
                className="w-full py-3 px-6 rounded-full border border-border text-foreground font-semibold text-xs sm:text-sm hover:bg-brand-warm transition-colors text-center"
              >
                Daftar Akun Baru
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-warm text-foreground antialiased selection:bg-brand-pink-soft selection:text-brand-pink-dark">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12 lg:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header & Account Greeting */}
          <div className="mb-8 pb-6 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-brand-pink font-semibold block mb-1">
                KREZOEMA · PESANAN SAYA
              </span>
              <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                Riwayat Pesanan
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Pantau status dan detail pesanan Anda di KREZOEMA.
              </p>
            </div>

            {/* Quick Actions & Logout */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-white text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isLoggingOut ? "Keluar..." : "Keluar"}</span>
              </button>
            </div>
          </div>

          {/* Section Navigation Tabs (Consistent with /akun) */}
          <div className="flex items-center gap-2 mb-8 border-b border-border/60 pb-3">
            <Link
              href="/akun"
              className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all text-muted-foreground hover:text-foreground hover:bg-white"
            >
              Profil &amp; Alamat
            </Link>
            <Link
              href="/akun/pesanan"
              className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all bg-brand-pink text-white shadow-sm"
            >
              Pesanan Saya
            </Link>
          </div>

          {/* Loading State */}
          {isLoadingOrders && (
            <div className="space-y-4">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border border-border/80 p-6 sm:p-7 shadow-sm animate-pulse"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                    <div className="space-y-2">
                      <div className="h-5 w-48 bg-muted rounded-md" />
                      <div className="h-4 w-32 bg-muted/60 rounded-md" />
                    </div>
                    <div className="h-7 w-24 bg-muted rounded-full" />
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="h-4 w-28 bg-muted/60 rounded-md" />
                      <div className="h-6 w-36 bg-muted rounded-md" />
                    </div>
                    <div className="h-9 w-28 bg-muted rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!isLoadingOrders && orderError && (
            <div className="bg-white rounded-3xl border border-border/80 p-8 sm:p-12 text-center shadow-sm">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 stroke-[1.8]" />
              </div>
              <h2 className="font-sans text-xl font-bold text-foreground mb-2">
                Gagal Memuat Pesanan
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
                {orderError}
              </p>
              <button
                type="button"
                onClick={fetchOrders}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-pink text-white font-semibold text-xs sm:text-sm hover:bg-brand-pink-dark transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Coba Lagi</span>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingOrders && !orderError && orders.length === 0 && (
            <div className="bg-white rounded-3xl border border-border/80 p-8 sm:p-12 text-center shadow-sm">
              <div className="w-14 h-14 rounded-full bg-brand-pink-soft text-brand-pink-dark flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-7 h-7 stroke-[1.8]" />
              </div>
              <h2 className="font-sans text-xl font-bold text-foreground mb-2">
                Belum Ada Pesanan
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
                Anda belum memiliki riwayat pesanan. Temukan ragam produk kerajinan tangan modern kami dan lakukan pemesanan pertamamu.
              </p>
              <Link
                href="/koleksi"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-pink text-white font-semibold text-xs sm:text-sm hover:bg-brand-pink-dark transition-colors shadow-sm"
              >
                <span>Jelajahi Koleksi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Orders List View */}
          {!isLoadingOrders && !orderError && orders.length > 0 && (
            <div className="space-y-6">
              <div className="space-y-4">
                {paginatedOrders.map((order) => {
                  const statusCfg =
                    STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusCfg.icon;
                  const totalItems =
                    order.items?.reduce(
                      (acc, it) => acc + (it.quantity || 1),
                      0
                    ) ?? 0;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl border border-border/80 p-5 sm:p-7 shadow-xs hover:border-brand-pink/40 transition-colors"
                    >
                      {/* Top Row: Order Number, Date, Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-sans font-bold text-sm sm:text-base text-foreground tracking-tight">
                              {order.order_number}
                            </span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground/80" />
                              {formatOrderDate(order.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="self-start sm:self-auto">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusCfg.label}
                          </span>
                        </div>
                      </div>

                      {/* Middle & Bottom Row: Summary & Action */}
                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-6 text-xs sm:text-sm">
                          <div>
                            <span className="text-muted-foreground block text-[11px] mb-0.5">
                              Jumlah Item
                            </span>
                            <span className="font-medium text-foreground">
                              {totalItems} item
                              {order.items && order.items.length > 0 && (
                                <span className="text-muted-foreground text-xs ml-1">
                                  ({order.items.length} jenis)
                                </span>
                              )}
                            </span>
                          </div>

                          <div className="border-l border-border/60 pl-6">
                            <span className="text-muted-foreground block text-[11px] mb-0.5">
                              Total Pesanan
                            </span>
                            <span className="font-bold text-foreground text-sm sm:text-base">
                              {formatRupiah(order.total)}
                            </span>
                          </div>
                        </div>

                        {/* Action Button: Lihat Detail */}
                        <div className="pt-2 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-border bg-white text-xs sm:text-sm font-semibold text-foreground hover:bg-brand-warm hover:border-brand-pink/40 hover:text-brand-pink transition-colors shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Lihat Detail</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination (Responsive) */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border/60 text-xs sm:text-sm text-muted-foreground">
                  <div>
                    Menampilkan{" "}
                    <span className="font-medium text-foreground">
                      {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                    </span>{" "}
                    -{" "}
                    <span className="font-medium text-foreground">
                      {Math.min(currentPage * ITEMS_PER_PAGE, orders.length)}
                    </span>{" "}
                    dari{" "}
                    <span className="font-medium text-foreground">
                      {orders.length}
                    </span>{" "}
                    pesanan
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-border bg-white text-xs font-semibold text-foreground hover:bg-brand-warm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Sebelumnya</span>
                    </button>

                    <span className="px-2 text-xs font-medium text-foreground">
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-border bg-white text-xs font-semibold text-foreground hover:bg-brand-warm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>Selanjutnya</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* DETAIL MODAL: LIHAT DETAIL */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-3xl border border-border max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border/60">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-brand-pink font-semibold block mb-0.5">
                  Rincian Pesanan
                </span>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-sans text-base sm:text-lg font-bold text-foreground">
                    {selectedOrder.order_number}
                  </h3>
                  {(() => {
                    const statusCfg =
                      STATUS_CONFIG[selectedOrder.status] ||
                      STATUS_CONFIG.pending;
                    const StatusIcon = statusCfg.icon;
                    return (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-brand-warm transition-colors"
                aria-label="Tutup Detail"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-brand-warm border border-border/80 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Tanggal Pemesanan
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatOrderDate(selectedOrder.created_at)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Metode Pengiriman
                  </span>
                  <span className="font-semibold text-foreground uppercase">
                    {selectedOrder.shipping_method || "Reguler"}
                  </span>
                </div>
              </div>

              {/* Shipping Address Snapshot */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-pink" />
                  <span>Informasi Pengiriman</span>
                </h4>
                <div className="p-4 rounded-2xl bg-white border border-border/80 text-xs sm:text-sm space-y-1">
                  <div className="font-semibold text-foreground">
                    {selectedOrder.shipping_name ||
                      selectedOrder.shipping_address_snapshot?.recipient_name}
                  </div>
                  <div className="text-muted-foreground">
                    WhatsApp:{" "}
                    {selectedOrder.shipping_whatsapp ||
                      selectedOrder.shipping_address_snapshot?.whatsapp ||
                      "-"}
                  </div>
                  <div className="text-muted-foreground leading-relaxed pt-1">
                    {selectedOrder.shipping_address ||
                      selectedOrder.shipping_address_snapshot?.address}
                    <br />
                    {[
                      selectedOrder.shipping_kecamatan ||
                        selectedOrder.shipping_address_snapshot?.district,
                      selectedOrder.shipping_city ||
                        selectedOrder.shipping_address_snapshot?.city,
                      selectedOrder.shipping_province ||
                        selectedOrder.shipping_address_snapshot?.province,
                      selectedOrder.shipping_postal_code ||
                        selectedOrder.shipping_address_snapshot?.postal_code,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-brand-pink" />
                  <span>Daftar Produk ({selectedOrder.items?.length || 0})</span>
                </h4>
                <div className="rounded-2xl border border-border/80 divide-y divide-border/60 overflow-hidden bg-white">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">
                            {item.product_name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            {item.variant_name && (
                              <span>Varian: {item.variant_name}</span>
                            )}
                            {item.sku && <span>· SKU: {item.sku}</span>}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 sm:text-right">
                          <div className="text-muted-foreground text-xs">
                            {item.quantity} × {formatRupiah(item.unit_price)}
                          </div>
                          <div className="font-bold text-foreground">
                            {formatRupiah(item.subtotal)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-xs text-muted-foreground text-center">
                      Detail produk tidak tersedia.
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary / Cost breakdown */}
              <div className="p-4 rounded-2xl bg-brand-warm border border-border/80 space-y-2 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subtotal Produk</span>
                  <span className="font-medium text-foreground">
                    {formatRupiah(selectedOrder.subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Ongkos Kirim</span>
                  <span className="font-medium text-foreground">
                    {selectedOrder.shipping_cost === 0
                      ? "Gratis"
                      : formatRupiah(selectedOrder.shipping_cost)}
                  </span>
                </div>
                <div className="border-t border-border/60 pt-2 flex items-center justify-between font-bold text-sm sm:text-base text-foreground">
                  <span>Total Tagihan</span>
                  <span className="text-brand-pink-dark">
                    {formatRupiah(selectedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Order Notes (if any) */}
              {selectedOrder.notes && (
                <div className="p-4 rounded-2xl bg-white border border-border/80 text-xs">
                  <span className="font-semibold text-foreground block mb-1">
                    Catatan Pesanan:
                  </span>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-border/60 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                  `Halo Admin KREZOEMA, saya ingin menanyakan status pesanan saya: ${selectedOrder.order_number}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-border text-xs font-semibold text-foreground hover:bg-brand-warm transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tanya Admin via WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full sm:w-auto px-6 py-2 rounded-full bg-foreground text-background font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
