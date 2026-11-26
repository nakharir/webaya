"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import type {
  CheckoutShippingMethod,
  CheckoutState,
  PreparedCheckoutPayload,
  ApiOrder,
  ShippingRateOption,
} from "@/lib/api/types";
import { createOrder, calculateShippingRates } from "@/lib/api/ecommerce";
import { formatRupiah } from "@/lib/api/helpers";
import { cariWilayah, type WilayahEntry } from "@/lib/kodepos";
import { TransferProofUpload } from "@/components/krezoema/TransferProofUpload";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  CheckCircle2,
  Truck,
  AlertCircle,
  MapPin,
  Plus,
  Star,
  X,
  PackageCheck,
  Copy,
  Building2,
  Clock,
  Check,
  Loader2,
  Search,
} from "lucide-react";

function formatDeadline(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(d);
  } catch {
    return dateStr;
  }
}

interface CheckoutFormData {
  nama: string;
  whatsapp: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kodePos: string;
  catatan: string;
  metodePengiriman: CheckoutShippingMethod | "";
}

type FormErrors = Partial<Record<keyof CheckoutFormData, string>>;

export default function CheckoutContent() {
  const router = useRouter();
  const { items, cartTotal, cartItemCount, isHydrated, clearCart } = useCart();
  const {
    isLoggedIn,
    customer,
    addresses,
    defaultAddress,
    addAddress,
    isAddressesLoading,
    addressError,
    isHydrated: isAuthHydrated,
  } = useAuth();

  // Order creation and confirmation state
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [createdOrder, setCreatedOrder] = useState<ApiOrder | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isAccountCopied, setIsAccountCopied] = useState<boolean>(false);
  const [isTotalCopied, setIsTotalCopied] = useState<boolean>(false);

  // Checkout page guard: If not logged in, redirect to login with redirect parameter
  useEffect(() => {
    if (isHydrated && isAuthHydrated && !isLoggedIn && !isConfirmed) {
      router.replace("/login?redirect=/checkout");
    }
  }, [isHydrated, isAuthHydrated, isLoggedIn, isConfirmed, router]);

  const [formData, setFormData] = useState<CheckoutFormData>({
    nama: "",
    whatsapp: "",
    alamat: "",
    kelurahan: "",
    kecamatan: "",
    kota: "",
    provinsi: "",
    kodePos: "",
    catatan: "",
    metodePengiriman: "",
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [newAddrForm, setNewAddrForm] = useState({
    label: "Rumah",
    nama: "",
    whatsapp: "",
    alamat: "",
    kelurahan: "",
    kecamatan: "",
    kotaKabupaten: "",
    provinsi: "",
    kodePos: "",
    isDefault: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSavingNewAddress, setIsSavingNewAddress] = useState(false);
  const [newAddressError, setNewAddressError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Stage 15: Shipping Rates State
  const [shippingRates, setShippingRates] = useState<ShippingRateOption[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRateOption | null>(
    null,
  );
  const [isLoadingShipping, setIsLoadingShipping] = useState<boolean>(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [packageWeight, setPackageWeight] = useState<{
    total_weight: number;
    weight_kg: number;
  } | null>(null);

  // Initialize form with saved address if customer is logged in
  useEffect(() => {
    if (!isAuthHydrated) return;

    if (isLoggedIn && addresses.length > 0) {
      const selected = addresses.find(
        (address) => address.id === selectedAddressId,
      );
      const initial = selected || defaultAddress || addresses[0];
      if (!selected) setSelectedAddressId(initial.id);
      setFormData((prev) => ({
        ...prev,
        nama: initial.nama,
        whatsapp: initial.whatsapp,
        alamat: initial.alamat,
        kelurahan: initial.kelurahan || "",
        kecamatan: initial.kecamatan,
        kota: initial.kotaKabupaten,
        provinsi: initial.provinsi,
        kodePos: initial.kodePos,
      }));
    } else if (isLoggedIn && customer) {
      // Logged in but no addresses yet
      setFormData((prev) => ({
        ...prev,
        nama: prev.nama || customer.nama,
        whatsapp: prev.whatsapp || customer.whatsapp,
      }));
    }
  }, [
    isLoggedIn,
    isAuthHydrated,
    addresses,
    defaultAddress,
    customer,
    selectedAddressId,
  ]);

  // Sync formData when selecting an address
  const handleSelectSavedAddress = (addrId: string) => {
    setSelectedAddressId(addrId);
    const found = addresses.find((a) => a.id === addrId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        nama: found.nama,
        whatsapp: found.whatsapp,
        alamat: found.alamat,
        kelurahan: found.kelurahan || "",
        kecamatan: found.kecamatan,
        kota: found.kotaKabupaten,
        provinsi: found.provinsi,
        kodePos: found.kodePos,
      }));
      setErrors({});
    }
  };

  // Stage 15: Calculate shipping rates whenever selected address, destination, or cart items change
  useEffect(() => {
    if (!isHydrated || !isAuthHydrated || isConfirmed || items.length === 0) {
      return;
    }

    const addressIdNum = Number(selectedAddressId);
    const hasAddressId = Boolean(
      selectedAddressId && Number.isInteger(addressIdNum) && addressIdNum > 0,
    );
    const hasProvince = Boolean(
      formData.provinsi && formData.provinsi.trim().length > 0,
    );

    if (!hasAddressId && !hasProvince) {
      setShippingRates([]);
      setSelectedRate(null);
      setPackageWeight(null);
      setShippingError(null);
      return;
    }

    let isCancelled = false;

    const performCalculation = async () => {
      setIsLoadingShipping(true);
      setShippingError(null);

      try {
        const payload: {
          address_id?: number;
          province?: string;
          city?: string;
          items: {
            product_id: number;
            variant_id?: number | null;
            quantity: number;
          }[];
        } = {
          items: items.map((item) => ({
            product_id: Number(item.product.id),
            variant_id: item.selectedVariantId ?? null,
            quantity: item.quantity,
          })),
        };

        if (hasAddressId) {
          payload.address_id = addressIdNum;
        } else if (hasProvince) {
          payload.province = formData.provinsi.trim();
          if (formData.kota?.trim()) {
            payload.city = formData.kota.trim();
          }
        }

        const result = await calculateShippingRates(payload);

        if (isCancelled) return;

        const rawRates = result.rates || [];

        // Filter and map available rates strictly to allowed couriers:
        // 1. JNE Express — REG (Regular)
        // 2. J&T Express — EZ (Reguler)
        // Eliminating SiCepat and duplicate services.
        const filteredRates: ShippingRateOption[] = [];

        // 1. JNE Express — REG (Regular)
        const jneCandidate = rawRates.find(
          (r) =>
            r.courier.toLowerCase() === "jne" &&
            (r.service_code.toLowerCase() === "reg" ||
              !r.service_code.toLowerCase().includes("yes")),
        );
        if (jneCandidate) {
          filteredRates.push({
            ...jneCandidate,
            courier: "jne",
            courier_name: "JNE Express",
            service_code: "REG",
            service_name: "REG (Regular)",
            shipping_method: "JNE Express — REG (Regular)",
          });
        }

        // 2. J&T Express — EZ (Reguler)
        const jntCandidate = rawRates.find(
          (r) =>
            r.courier.toLowerCase() === "jnt" ||
            r.courier.toLowerCase() === "j&t",
        );
        if (jntCandidate) {
          filteredRates.push({
            ...jntCandidate,
            courier: "jnt",
            courier_name: "J&T Express",
            service_code: "EZ",
            service_name: "EZ (Reguler)",
            shipping_method: "J&T Express — EZ (Reguler)",
          });
        }

        const rates = filteredRates;
        setShippingRates(rates);
        setPackageWeight({
          total_weight: result.total_weight,
          weight_kg: result.weight_kg,
        });

        if (rates.length === 0) {
          setSelectedRate(null);
          setFormData((prev) => ({ ...prev, metodePengiriman: "" }));
          setShippingError(
            `Tidak ada pilihan kurir pengiriman untuk tujuan "${result.destination?.province || formData.provinsi}". Silakan hubungi admin.`,
          );
        } else {
          // Keep existing selection if it still matches, otherwise select first rate option (JNE Express — REG)
          setSelectedRate((prev) => {
            if (prev) {
              const stillValid = rates.find(
                (r) =>
                  r.courier.toLowerCase() === prev.courier.toLowerCase() &&
                  r.service_code.toLowerCase() ===
                    prev.service_code.toLowerCase(),
              );
              if (stillValid) {
                setFormData((f) => ({
                  ...f,
                  metodePengiriman: stillValid.shipping_method,
                }));
                return stillValid;
              }
            }
            const first = rates[0];
            setFormData((f) => ({
              ...f,
              metodePengiriman: first.shipping_method,
            }));
            return first;
          });
          setShippingError(null);
        }
      } catch (err: any) {
        if (isCancelled) return;
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Gagal memuat tarif pengiriman. Silakan coba kembali.";
        setShippingRates([]);
        setSelectedRate(null);
        setPackageWeight(null);
        setShippingError(msg);
      } finally {
        if (!isCancelled) {
          setIsLoadingShipping(false);
        }
      }
    };

    performCalculation();

    return () => {
      isCancelled = true;
    };
  }, [
    isHydrated,
    isAuthHydrated,
    isConfirmed,
    selectedAddressId,
    formData.provinsi,
    formData.kota,
    items,
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CheckoutFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleShippingChange = (method: CheckoutShippingMethod) => {
    setFormData((prev) => ({ ...prev, metodePengiriman: method }));
    if (errors.metodePengiriman) {
      setErrors((prev) => ({ ...prev, metodePengiriman: undefined }));
    }
  };

  const validateForm = (): { isValid: boolean; firstKey?: string } => {
    const newErrors: FormErrors = {};
    const selectedAddress = addresses.find(
      (address) => address.id === selectedAddressId,
    );

    if (!selectedAddress) {
      setCheckoutError("Pilih alamat pengiriman terlebih dahulu.");
    } else {
      setCheckoutError(null);
    }

    if (!formData.nama.trim()) {
      newErrors.nama = "Nama lengkap wajib diisi.";
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = "Nomor WhatsApp wajib diisi.";
    } else if (formData.whatsapp.trim().length < 8) {
      newErrors.whatsapp = "Nomor WhatsApp minimal 8 digit.";
    }

    if (!formData.alamat.trim()) {
      newErrors.alamat = "Alamat lengkap wajib diisi.";
    }

    if (!formData.kecamatan.trim()) {
      newErrors.kecamatan = "Kecamatan wajib diisi.";
    }

    if (!formData.kota.trim()) {
      newErrors.kota = "Kota atau kabupaten wajib diisi.";
    }

    if (!formData.provinsi.trim()) {
      newErrors.provinsi = "Provinsi wajib diisi.";
    }

    if (!formData.kodePos.trim()) {
      newErrors.kodePos = "Kode pos wajib diisi.";
    }

    if (!formData.metodePengiriman || !selectedRate) {
      newErrors.metodePengiriman = "Pilih salah satu opsi kurir & pengiriman.";
    }

    setErrors(newErrors);
    const keys = Object.keys(newErrors);
    return {
      isValid: keys.length === 0 && !!selectedAddress && !!selectedRate,
      firstKey: keys[0],
    };
  };

  const shippingLabel = (method: CheckoutShippingMethod | "") => {
    if (!method) return "Belum dipilih";
    const m = method.toLowerCase();
    if (m.includes("jne")) return "JNE Express — REG (Regular)";
    if (m.includes("jnt") || m.includes("j&t"))
      return "J&T Express — EZ (Reguler)";
    return method;
  };

  const checkoutState = useMemo<CheckoutState>(() => {
    const addressId = Number(selectedAddressId);
    return {
      addressId:
        Number.isInteger(addressId) && addressId > 0 ? addressId : null,
      shippingMethod: selectedRate
        ? selectedRate.shipping_method
        : formData.metodePengiriman || null,
      shippingCourier: selectedRate ? selectedRate.courier : null,
      shippingService: selectedRate ? selectedRate.service_code : null,
      notes: formData.catatan,
    };
  }, [
    selectedAddressId,
    selectedRate,
    formData.metodePengiriman,
    formData.catatan,
  ]);

  const preparedPayload = useMemo<PreparedCheckoutPayload | null>(() => {
    if (!checkoutState.addressId || !checkoutState.shippingMethod) return null;

    return {
      address_id: checkoutState.addressId,
      shipping_method: checkoutState.shippingMethod,
      shipping_courier: checkoutState.shippingCourier || undefined,
      shipping_service: checkoutState.shippingService || undefined,
      payment_method: "manual_transfer",
      notes: checkoutState.notes.trim() || null,
      items: items.map((item) => {
        const productId = Number(item.product.id);
        return {
          product_id: Number.isInteger(productId) ? productId : null,
          variant_id: item.selectedVariantId ?? null,
          quantity: item.quantity,
        };
      }),
    };
  }, [checkoutState, items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid, firstKey } = validateForm();
    if (!isValid) {
      if (firstKey) {
        const el = document.getElementsByName(firstKey)[0];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus();
        }
      }
      return;
    }

    if (!preparedPayload) {
      setCheckoutError("Data checkout belum lengkap. Silakan periksa kembali.");
      return;
    }

    setIsSubmitting(true);
    setCheckoutError(null);

    try {
      const order = await createOrder(preparedPayload);
      setCreatedOrder(order);
      clearCart();
      setIsConfirmed(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal membuat pesanan. Silakan periksa kembali data pesanan Anda.";
      setCheckoutError(errorMsg);
      // Cart is NOT cleared on failure!
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle adding a new address in modal
  const handleAddNewAddressModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrForm.kodePos.trim()) {
      setNewAddressError("Kode pos wajib diisi.");
      return;
    }
    if (newAddrForm.kodePos.length !== 5) {
      setNewAddressError("Kode pos harus 5 digit angka.");
      return;
    }
    if (
      !newAddrForm.provinsi.trim() ||
      !newAddrForm.kotaKabupaten.trim() ||
      !newAddrForm.kecamatan.trim()
    ) {
      setNewAddressError(
        "Data wilayah belum ditemukan. Pastikan kode pos benar.",
      );
      return;
    }
    if (!newAddrForm.kelurahan.trim()) {
      setNewAddressError("Pilih salah satu kelurahan/desa untuk kode pos ini.");
      return;
    }
    if (!newAddrForm.alamat.trim()) {
      setNewAddressError("Detail alamat lengkap wajib diisi.");
      return;
    }
    if (!newAddrForm.nama.trim()) {
      setNewAddressError("Nama penerima wajib diisi.");
      return;
    }
    if (!newAddrForm.whatsapp.trim()) {
      setNewAddressError("Nomor WhatsApp wajib diisi.");
      return;
    }

    setIsSavingNewAddress(true);
    setNewAddressError(null);
    try {
      const created = await addAddress({
        label: newAddrForm.label || "Rumah",
        nama: newAddrForm.nama.trim(),
        whatsapp: newAddrForm.whatsapp.trim(),
        alamat: newAddrForm.alamat.trim(),
        kelurahan: newAddrForm.kelurahan.trim(),
        kecamatan: newAddrForm.kecamatan.trim(),
        kotaKabupaten: newAddrForm.kotaKabupaten.trim(),
        provinsi: newAddrForm.provinsi.trim(),
        kodePos: newAddrForm.kodePos.trim(),
        isDefault: newAddrForm.isDefault,
      });

      // Auto-select the newly added address
      setSelectedAddressId(created.id);
      setFormData((prev) => ({
        ...prev,
        nama: created.nama,
        whatsapp: created.whatsapp,
        alamat: created.alamat,
        kelurahan: created.kelurahan || "",
        kecamatan: created.kecamatan,
        kota: created.kotaKabupaten,
        provinsi: created.provinsi,
        kodePos: created.kodePos,
      }));

      setIsAddressModalOpen(false);
    } catch (error: any) {
      setNewAddressError(
        error?.response?.data?.message ||
          "Gagal menyimpan alamat. Silakan coba lagi.",
      );
    } finally {
      setIsSavingNewAddress(false);
    }
  };

  // 1. Loading state
  if (!isHydrated || !isAuthHydrated) {
    return (
      <div className="w-full py-16 sm:py-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto py-12 text-sm text-muted-foreground font-sans">
            Memuat informasi checkout...
          </div>
        </div>
      </div>
    );
  }

  // 2. Empty Cart State
  if (items.length === 0 && !isConfirmed) {
    return (
      <div className="w-full py-12 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-wider text-brand-pink font-semibold block mb-2">
              KREZOEMA · CHECKOUT
            </span>
            <h1 className="font-sans text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Checkout
            </h1>
          </div>

          <div className="max-w-md mx-auto rounded-3xl bg-brand-warm border border-border/80 p-8 sm:p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-white border border-border flex items-center justify-center mx-auto mb-5 text-brand-pink shadow-xs">
              <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
            </div>

            <h2 className="font-sans text-xl sm:text-2xl font-bold text-foreground mb-2">
              Keranjangmu masih kosong
            </h2>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-8">
              Tambahkan material terlebih dahulu sebelum melanjutkan ke
              checkout.
            </p>

            <Link
              href="/koleksi"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-brand-pink text-white font-semibold text-sm hover:bg-brand-pink-dark transition-all shadow-none active:scale-95"
            >
              <span>Jelajahi Koleksi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Guest Guard: prevent flashing checkout form while redirecting to login
  if (!isLoggedIn && !isConfirmed) {
    return (
      <div className="w-full py-16 sm:py-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto py-12 text-sm text-muted-foreground font-sans">
            Mengarahkan ke halaman masuk...
          </div>
        </div>
      </div>
    );
  }

  // 4. Order Confirmation State
  if (isConfirmed && createdOrder) {
    const handleCopyOrderNumber = () => {
      if (createdOrder.order_number) {
        navigator.clipboard.writeText(createdOrder.order_number);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    };

    const handleCopyAccount = (accNo: string) => {
      navigator.clipboard.writeText(accNo);
      setIsAccountCopied(true);
      setTimeout(() => setIsAccountCopied(false), 2000);
    };

    const handleCopyTotal = (amount: number) => {
      navigator.clipboard.writeText(String(amount));
      setIsTotalCopied(true);
      setTimeout(() => setIsTotalCopied(false), 2000);
    };

    const bankName = createdOrder.payment_details?.bank_name || "BCA";
    const accountNumber =
      createdOrder.payment_details?.account_number || "8290123456";
    const accountHolder =
      createdOrder.payment_details?.account_holder || "KREZOEMA CRAFT";
    const expiresAt = createdOrder.payment_details?.expires_at;

    return (
      <div className="w-full py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white border border-border/80 p-7 sm:p-10 shadow-sm text-center">
            {/* Confirmation Icon */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 border border-emerald-100">
              <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2]" />
            </div>

            <span className="text-xs uppercase tracking-wider text-brand-pink font-semibold block mb-1.5">
              KREZOEMA · PESANAN BERHASIL DIBUAT
            </span>

            <h1 className="font-sans text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-2">
              Terima Kasih Atas Pesananmu!
            </h1>

            <p className="font-sans text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto mb-6">
              Pesanan telah tercatat di sistem KREZOEMA. Silakan lakukan
              pembayaran transfer sesuai panduan di bawah.
            </p>

            {/* Order Number Highlight Card */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-brand-warm border border-border/80 mb-6">
              <div className="text-left">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
                  Nomor Pesanan
                </span>
                <span className="font-mono text-sm sm:text-base font-bold text-brand-pink-dark">
                  {createdOrder.order_number}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyOrderNumber}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white border border-transparent hover:border-border/60 transition-colors"
                title="Salin nomor pesanan"
              >
                {isCopied ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Manual Bank Transfer Payment Box */}
            <div className="bg-white rounded-3xl border-2 border-brand-pink/20 p-5 sm:p-7 text-left mb-8 max-w-xl mx-auto shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-brand-pink-soft/60 text-brand-pink flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs uppercase tracking-wider font-bold text-foreground">
                      Pembayaran Manual Transfer
                    </h2>
                    <span className="text-[11px] text-muted-foreground">
                      Transfer manual ke rekening resmi KREZOEMA
                    </span>
                  </div>
                </div>

                {/* Payment Status Tag */}
                {createdOrder.payment_status === "waiting_verification" ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    Menunggu Verifikasi
                  </span>
                ) : createdOrder.payment_status === "paid" ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    Sudah Dibayar
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 shrink-0">
                    <AlertCircle className="w-3 h-3" />
                    Belum Dibayar
                  </span>
                )}
              </div>

              {/* Destination Bank Account Info */}
              <div className="space-y-3 bg-brand-warm rounded-2xl p-4 border border-border/60 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">
                    Bank Tujuan
                  </span>
                  <span className="text-xs font-bold text-foreground bg-white px-2.5 py-0.5 rounded-md border border-border/80">
                    {bankName}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground font-medium block">
                      Nomor Rekening
                    </span>
                    <span className="font-mono text-base font-bold text-foreground">
                      {accountNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyAccount(accountNumber)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-brand-pink-soft text-foreground border border-border hover:border-brand-pink/40 transition-colors"
                  >
                    {isAccountCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">
                          Tersalin
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Salin Rekening</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-border/40 pt-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    Nama Pemilik Rekening
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {accountHolder}
                  </span>
                </div>
              </div>

              {/* Total to pay */}
              <div className="flex items-center justify-between bg-brand-pink-soft/20 rounded-2xl p-4 border border-brand-pink/20 mb-4">
                <div>
                  <span className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider block">
                    Total Yang Harus Dibayar
                  </span>
                  <span className="font-mono text-lg font-extrabold text-brand-pink-dark">
                    {formatRupiah(createdOrder.total)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyTotal(createdOrder.total)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-brand-pink-soft text-brand-pink-dark border border-brand-pink/30 transition-colors"
                >
                  {isTotalCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">
                        Tersalin
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Total</span>
                    </>
                  )}
                </button>
              </div>

              {/* Payment Deadline if available */}
              {expiresAt && (
                <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50/80 border border-amber-200/80 rounded-xl px-3.5 py-2.5 mb-4">
                  <Clock className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    Batas Waktu Pembayaran:{" "}
                    <strong>{formatDeadline(expiresAt)}</strong>
                  </span>
                </div>
              )}

              {/* Transfer Proof Upload Component */}
              <TransferProofUpload
                order={createdOrder}
                onUploaded={(updated) => setCreatedOrder(updated)}
              />
            </div>

            {/* Order Summary Snapshot */}
            <div className="bg-brand-warm rounded-2xl border border-border/80 p-5 sm:p-6 text-left mb-8 max-w-xl mx-auto space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  Informasi Pengiriman
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  {createdOrder.status === "pending"
                    ? "Menunggu Konfirmasi"
                    : createdOrder.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Nama Penerima
                  </span>
                  <span className="font-medium text-foreground">
                    {createdOrder.shipping_name}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Nomor WhatsApp
                  </span>
                  <span className="font-medium text-foreground">
                    {createdOrder.shipping_whatsapp}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground block text-[11px]">
                    Alamat Pengiriman
                  </span>
                  <span className="font-medium text-foreground leading-snug block">
                    {createdOrder.shipping_address},{" "}
                    {createdOrder.shipping_kecamatan},{" "}
                    {createdOrder.shipping_city},{" "}
                    {createdOrder.shipping_province}{" "}
                    {createdOrder.shipping_postal_code}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Kurir & Pengiriman
                  </span>
                  <span className="font-medium text-foreground">
                    {createdOrder.shipping_courier ||
                      createdOrder.shipping_method}
                    {createdOrder.shipping_service
                      ? ` (${createdOrder.shipping_service})`
                      : ""}
                  </span>
                  {createdOrder.shipping_etd && (
                    <span className="text-[11px] text-muted-foreground block">
                      Estimasi tiba: {createdOrder.shipping_etd}
                    </span>
                  )}
                </div>
                {Boolean(createdOrder.total_weight) && (
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Total Berat Paket
                    </span>
                    <span className="font-medium text-foreground">
                      {createdOrder.total_weight}g (~
                      {createdOrder.total_weight_kg ||
                        Math.ceil((createdOrder.total_weight || 0) / 1000)}{" "}
                      kg)
                    </span>
                  </div>
                )}
                {createdOrder.notes && (
                  <div className="sm:col-span-2 pt-1 border-t border-border/40">
                    <span className="text-muted-foreground block text-[11px]">
                      Catatan
                    </span>
                    <span className="font-normal text-muted-foreground italic text-xs">
                      &ldquo;{createdOrder.notes}&rdquo;
                    </span>
                  </div>
                )}
              </div>

              {/* Items Table Snapshot */}
              <div className="border-t border-border/60 pt-3 space-y-2">
                <span className="text-muted-foreground block text-[11px] font-semibold uppercase tracking-wider">
                  Item Pesanan
                </span>
                {createdOrder.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-3 text-xs py-1 border-b border-border/30 last:border-0"
                  >
                    <div>
                      <span className="font-medium text-foreground block">
                        {item.product_name}
                      </span>
                      {item.variant_name && (
                        <span className="text-[11px] text-muted-foreground block">
                          Varian: {item.variant_name}
                        </span>
                      )}
                      <span className="text-[11px] text-muted-foreground block">
                        {item.quantity} × {formatRupiah(item.unit_price)}
                      </span>
                    </div>
                    <span className="font-semibold text-foreground self-center">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))}

                {/* Subtotal, Shipping, Total */}
                <div className="pt-2 border-t border-border/60 space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal Produk</span>
                    <span>{formatRupiah(createdOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Biaya Pengiriman</span>
                    <span>
                      {createdOrder.shipping_cost > 0
                        ? formatRupiah(createdOrder.shipping_cost)
                        : "Gratis"}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border/40 pt-2 text-sm font-bold text-foreground">
                    <span>Total Pembayaran</span>
                    <span className="text-brand-pink-dark font-mono">
                      {formatRupiah(createdOrder.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/akun/pesanan"
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-brand-pink text-white font-semibold text-sm hover:bg-brand-pink-dark transition-all shadow-none active:scale-95 text-center"
              >
                Lihat Pesanan Saya
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-white border border-border text-foreground font-semibold text-sm hover:border-brand-pink/50 hover:bg-brand-pink-soft/30 transition-all text-center"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Main Checkout Form & Summary Flow
  const totalQuantity = cartItemCount();
  const subtotalPrice = cartTotal();

  return (
    <div className="w-full py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 sm:mb-12 pb-6 border-b border-border/60 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-brand-pink font-semibold block mb-1.5">
              KREZOEMA · CHECKOUT
            </span>
            <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold sm:font-extrabold text-foreground tracking-tight mb-1">
              Lengkapi Pesananmu
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Pilih alamat tersimpan atau isi alamat baru untuk pengiriman
              pesanan.
            </p>
          </div>

          <Link
            href="/keranjang"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-brand-pink transition-colors self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Keranjang</span>
          </Link>
        </div>

        {/* Customer Account Status */}
        <div className="mb-8 p-4 rounded-2xl bg-brand-pink-soft/30 border border-brand-pink/20 flex items-center justify-between text-xs">
          <span className="text-brand-pink-dark">
            Checkout sebagai: <strong>{customer?.nama}</strong> (
            {customer?.email || customer?.whatsapp})
          </span>
          <Link
            href="/akun"
            className="text-brand-pink hover:text-brand-pink-dark font-semibold transition-colors"
          >
            Kelola Alamat
          </Link>
        </div>

        {/* Checkout Grid: 2/3 Form + 1/3 Summary */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column (2/3 on Desktop): Shipping Details */}
            <div className="lg:col-span-8 w-full space-y-8">
              {/* SECTION 1: SAVED ADDRESS SELECTOR (If logged in & addresses exist) */}
              {isLoggedIn && addresses.length > 0 && (
                <div className="rounded-3xl bg-white border border-border/80 p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div>
                      <h2 className="font-sans text-lg sm:text-xl font-bold text-foreground">
                        Pilih Alamat Pengiriman
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Pilih salah satu alamat tersimpan di akunmu.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setNewAddrForm({
                          label: "Rumah",
                          nama: customer?.nama || "",
                          whatsapp: customer?.whatsapp || "",
                          alamat: "",
                          kecamatan: "",
                          kotaKabupaten: "",
                          provinsi: "",
                          kodePos: "",
                          isDefault: false,
                        });
                        setIsAddressModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-pink hover:text-brand-pink-dark self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Alamat Baru</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <label
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr.id)}
                          className={`cursor-pointer rounded-2xl border p-4 sm:p-5 transition-all flex items-start gap-3.5 ${
                            isSelected
                              ? "border-brand-pink bg-brand-pink-soft/25 shadow-xs ring-1 ring-brand-pink"
                              : "border-border bg-white hover:border-brand-pink/30 hover:bg-brand-warm/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="savedAddressRadio"
                            value={addr.id}
                            checked={isSelected}
                            onChange={() => handleSelectSavedAddress(addr.id)}
                            className="mt-1 w-4 h-4 text-brand-pink focus:ring-brand-pink border-border"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-white border border-border text-foreground">
                                {addr.label}
                              </span>
                              {addr.isDefault && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-pink-dark bg-brand-pink-soft px-2 py-0.5 rounded-full">
                                  <Star className="w-2.5 h-2.5 fill-brand-pink text-brand-pink" />
                                  <span>Utama</span>
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-bold text-foreground">
                              {addr.nama}{" "}
                              <span className="text-xs font-normal text-muted-foreground">
                                ({addr.whatsapp})
                              </span>
                            </p>
                            <p className="text-xs text-foreground/80 leading-relaxed mt-1">
                              {addr.alamat},{" "}
                              {addr.kelurahan ? `${addr.kelurahan}, ` : ""}
                              {addr.kecamatan}, {addr.kotaKabupaten},{" "}
                              {addr.provinsi} {addr.kodePos}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {isLoggedIn && !isAddressesLoading && addresses.length === 0 && (
                <div className="rounded-3xl bg-white border border-border/80 p-6 sm:p-8">
                  <h2 className="font-sans text-lg font-bold text-foreground">
                    Belum ada alamat pengiriman.
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-4">
                    Tambahkan alamat agar dapat dipilih untuk checkout
                    berikutnya.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddAddressModal}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-4 py-2 text-xs font-semibold text-white hover:bg-brand-pink-dark"
                  >
                    <Plus className="w-4 h-4" /> Tambah Alamat
                  </button>
                </div>
              )}

              {(isAddressesLoading || addressError) && (
                <p
                  className={`text-xs ${addressError ? "text-rose-600" : "text-muted-foreground"}`}
                >
                  {addressError || "Memuat alamat tersimpan..."}
                </p>
              )}

              {/* SECTION 2: Selected address details */}
              <div className="rounded-3xl bg-white border border-border/80 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-sans text-lg sm:text-xl font-bold text-foreground">
                    Detail Alamat Terpilih
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-6">
                  Pilih atau tambahkan alamat dari buku alamatmu. Detail di
                  bawah mengikuti alamat yang dipilih.
                </p>

                {checkoutError && (
                  <p
                    className="mb-4 flex items-center gap-1 text-xs font-medium text-rose-600"
                    role="alert"
                  >
                    <AlertCircle className="h-3.5 w-3.5" /> {checkoutError}
                  </p>
                )}

                <div className="space-y-4 sm:space-y-5">
                  {/* Nama Lengkap */}
                  <div>
                    <label
                      htmlFor="nama"
                      className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5"
                    >
                      Nama Penerima <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="nama"
                      name="nama"
                      value={formData.nama}
                      readOnly
                      placeholder="Masukkan nama lengkap"
                      aria-required="true"
                      aria-invalid={!!errors.nama}
                      aria-describedby={errors.nama ? "error-nama" : undefined}
                      className={`w-full px-4 py-2.5 sm:py-3 rounded-xl bg-white border text-foreground placeholder:text-muted-foreground/60 text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.nama
                          ? "border-rose-500 focus:ring-rose-500/20"
                          : "border-border focus:ring-brand-pink/20 focus:border-brand-pink"
                      }`}
                    />
                    {errors.nama && (
                      <p
                        id="error-nama"
                        className="text-rose-600 text-xs font-medium mt-1.5 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.nama}</span>
                      </p>
                    )}
                  </div>

                  {/* Nomor WhatsApp */}
                  <div>
                    <label
                      htmlFor="whatsapp"
                      className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5"
                    >
                      Nomor WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="whatsapp"
                      name="whatsapp"
                      value={formData.whatsapp}
                      readOnly
                      placeholder="08xxxxxxxxxx"
                      aria-required="true"
                      aria-invalid={!!errors.whatsapp}
                      aria-describedby={
                        errors.whatsapp ? "error-whatsapp" : undefined
                      }
                      className={`w-full px-4 py-2.5 sm:py-3 rounded-xl bg-white border text-foreground placeholder:text-muted-foreground/60 text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.whatsapp
                          ? "border-rose-500 focus:ring-rose-500/20"
                          : "border-border focus:ring-brand-pink/20 focus:border-brand-pink"
                      }`}
                    />
                    {errors.whatsapp && (
                      <p
                        id="error-whatsapp"
                        className="text-rose-600 text-xs font-medium mt-1.5 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.whatsapp}</span>
                      </p>
                    )}
                  </div>

                  {/* Alamat Lengkap */}
                  <div>
                    <label
                      htmlFor="alamat"
                      className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5"
                    >
                      Alamat Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="alamat"
                      name="alamat"
                      rows={3}
                      value={formData.alamat}
                      readOnly
                      placeholder="Nama jalan, nomor rumah, RT/RW, atau detail alamat lainnya"
                      aria-required="true"
                      aria-invalid={!!errors.alamat}
                      aria-describedby={
                        errors.alamat ? "error-alamat" : undefined
                      }
                      className={`w-full px-4 py-2.5 sm:py-3 rounded-xl bg-white border text-foreground placeholder:text-muted-foreground/60 text-sm transition-all focus:outline-none focus:ring-2 resize-none ${
                        errors.alamat
                          ? "border-rose-500 focus:ring-rose-500/20"
                          : "border-border focus:ring-brand-pink/20 focus:border-brand-pink"
                      }`}
                    />
                    {errors.alamat && (
                      <p
                        id="error-alamat"
                        className="text-rose-600 text-xs font-medium mt-1.5 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.alamat}</span>
                      </p>
                    )}
                  </div>

                  {/* Kelurahan, Kecamatan & Kota */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="kelurahan"
                        className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5"
                      >
                        Kelurahan / Desa{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="kelurahan"
                        name="kelurahan"
                        value={formData.kelurahan}
                        readOnly
                        placeholder="Kelurahan / Desa"
                        className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-white border border-border text-foreground placeholder:text-muted-foreground/60 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="kecamatan"
                        className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5"
                      >
                        Kecamatan <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="kecamatan"
                        name="kecamatan"
                        value={formData.kecamatan}
                        readOnly
                        placeholder="Masukkan kecamatan"
                        aria-required="true"
                        aria-invalid={!!errors.kecamatan}
                        aria-describedby={
                          errors.kecamatan ? "error-kecamatan" : undefined
                        }
                        className={`w-full px-4 py-2.5 sm:py-3 rounded-xl bg-white border text-foreground placeholder:text-muted-foreground/60 text-sm transition-all focus:outline-none focus:ring-2 ${
                          errors.kecamatan
                            ? "border-rose-500 focus:ring-rose-500/20"
                            : "border-border focus:ring-brand-pink/20 focus:border-brand-pink"
                        }`}
                      />
                      {errors.kecamatan && (
                        <p
                          id="error-kecamatan"
                          className="text-rose-600 text-xs font-medium mt-1.5 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.kecamatan}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="kota"
                        className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5"
                      >
                        Kota / Kabupaten{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="kota"
                        name="kota"
                        value={formData.kota}
                        readOnly
                        placeholder="Masukkan kota atau kabupaten"
                        aria-required="true"
                        aria-invalid={!!errors.kota}
                        aria-describedby={
                          errors.kota ? "error-kota" : undefined
                        }
                        className={`w-full px-4 py-2.5 sm:py-3 rounded-xl bg-white border text-foreground placeholder:text-muted-foreground/60 text-sm transition-all focus:outline-none focus:ring-2 ${
                          errors.kota
                            ? "border-rose-500 focus:ring-rose-500/20"
                            : "border-border focus:ring-brand-pink/20 focus:border-brand-pink"
                        }`}
                      />
                      {errors.kota && (
                        <p
                          id="error-kota"
                          className="text-rose-600 text-xs font-medium mt-1.5 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.kota}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Provinsi & Kode Pos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="provinsi"
                        className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5"
                      >
                        Provinsi <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="provinsi"
                        name="provinsi"
                        value={formData.provinsi}
                        readOnly
                        placeholder="Masukkan provinsi"
                        aria-required="true"
                        aria-invalid={!!errors.provinsi}
                        aria-describedby={
                          errors.provinsi ? "error-provinsi" : undefined
                        }
                        className={`w-full px-4 py-2.5 sm:py-3 rounded-xl bg-white border text-foreground placeholder:text-muted-foreground/60 text-sm transition-all focus:outline-none focus:ring-2 ${
                          errors.provinsi
                            ? "border-rose-500 focus:ring-rose-500/20"
                            : "border-border focus:ring-brand-pink/20 focus:border-brand-pink"
                        }`}
                      />
                      {errors.provinsi && (
                        <p
                          id="error-provinsi"
                          className="text-rose-600 text-xs font-medium mt-1.5 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.provinsi}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="kodePos"
                        className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5"
                      >
                        Kode Pos <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="kodePos"
                        name="kodePos"
                        inputMode="numeric"
                        value={formData.kodePos}
                        readOnly
                        placeholder="12345"
                        aria-required="true"
                        aria-invalid={!!errors.kodePos}
                        aria-describedby={
                          errors.kodePos ? "error-kodePos" : undefined
                        }
                        className={`w-full px-4 py-2.5 sm:py-3 rounded-xl bg-white border text-foreground placeholder:text-muted-foreground/60 text-sm transition-all focus:outline-none focus:ring-2 ${
                          errors.kodePos
                            ? "border-rose-500 focus:ring-rose-500/20"
                            : "border-border focus:ring-brand-pink/20 focus:border-brand-pink"
                        }`}
                      />
                      {errors.kodePos && (
                        <p
                          id="error-kodePos"
                          className="text-rose-600 text-xs font-medium mt-1.5 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.kodePos}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Catatan Pesanan */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="catatan"
                        className="block text-xs sm:text-sm font-semibold text-foreground"
                      >
                        Catatan Pesanan
                      </label>
                      <span className="text-[11px] text-muted-foreground font-normal">
                        Opsional
                      </span>
                    </div>
                    <textarea
                      id="catatan"
                      name="catatan"
                      rows={2}
                      value={formData.catatan}
                      onChange={handleInputChange}
                      placeholder="Tambahkan catatan khusus jika diperlukan..."
                      className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-white border border-border text-foreground placeholder:text-muted-foreground/60 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: METODE PENGIRIMAN */}
              <div className="rounded-3xl bg-white border border-border/80 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-brand-pink stroke-[1.8]" />
                    <h2 className="font-sans text-lg sm:text-xl font-bold text-foreground">
                      Metode & Opsi Pengiriman
                    </h2>
                  </div>
                  {packageWeight && (
                    <span className="text-xs bg-brand-pink-soft text-brand-pink-dark px-2.5 py-0.5 rounded-full font-medium">
                      Berat Total: {packageWeight.total_weight}g (~
                      {packageWeight.weight_kg} kg)
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                  Pilih kurir dan layanan pengiriman yang Anda inginkan. Biaya
                  ongkir dihitung otomatis berdasarkan berat paket dan alamat
                  tujuan.
                </p>

                {isLoadingShipping && (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-pink" />
                    <span className="text-xs font-medium">
                      Menghitung tarif ongkos kirim...
                    </span>
                  </div>
                )}

                {shippingError && !isLoadingShipping && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>{shippingError}</span>
                  </div>
                )}

                {!isLoadingShipping && shippingRates.length > 0 && (
                  <div
                    role="radiogroup"
                    aria-label="Metode Pengiriman"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    {shippingRates.map((rate) => {
                      const isSelected =
                        selectedRate?.courier === rate.courier &&
                        selectedRate?.service_code === rate.service_code;

                      return (
                        <label
                          key={`${rate.courier}_${rate.service_code}`}
                          onClick={() => {
                            setSelectedRate(rate);
                            setFormData((prev) => ({
                              ...prev,
                              metodePengiriman: rate.shipping_method,
                            }));
                            if (errors.metodePengiriman) {
                              setErrors((prev) => ({
                                ...prev,
                                metodePengiriman: undefined,
                              }));
                            }
                          }}
                          className={`cursor-pointer rounded-2xl border p-4 transition-all flex items-start justify-between gap-3 ${
                            isSelected
                              ? "border-brand-pink bg-brand-pink-soft/25 shadow-xs ring-1 ring-brand-pink"
                              : "border-border bg-white hover:border-brand-pink/40 hover:bg-brand-warm/40"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="metodePengiriman"
                              value={rate.shipping_method}
                              checked={isSelected}
                              onChange={() => {}}
                              className="mt-1 w-4 h-4 text-brand-pink focus:ring-brand-pink border-border"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-sans text-sm font-bold text-foreground">
                                  {rate.courier_name}
                                </span>
                                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-muted text-foreground/80">
                                  {rate.service_code}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground block mt-0.5">
                                {rate.service_name}
                              </span>
                              <span className="text-[11px] text-muted-foreground/80 flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3 text-brand-pink" />
                                Estimasi {rate.etd}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-bold text-brand-pink-dark font-mono block">
                              {formatRupiah(rate.cost)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {rate.weight_kg} kg
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                {!isLoadingShipping &&
                  shippingRates.length === 0 &&
                  !shippingError && (
                    <p className="text-xs text-muted-foreground italic py-3">
                      Pilih alamat pengiriman di atas untuk melihat tarif
                      pengiriman.
                    </p>
                  )}

                {errors.metodePengiriman && (
                  <p className="text-rose-600 text-xs font-medium mt-3 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.metodePengiriman}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Right Column (1/3 on Desktop): Order Summary */}
            <div className="lg:col-span-4 w-full lg:sticky lg:top-28">
              <div className="rounded-3xl bg-brand-warm border border-border/80 p-6 sm:p-7 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-sans text-lg sm:text-xl font-bold text-foreground">
                    Ringkasan Pesanan
                  </h2>
                  <span className="text-xs font-semibold text-brand-pink bg-brand-pink-soft px-2 py-0.5 rounded-full">
                    {totalQuantity} item
                  </span>
                </div>

                {/* Items Mini List */}
                <div className="divide-y divide-border/60 border-y border-border/60 max-h-72 overflow-y-auto pr-1 mb-5">
                  {items.map((item) => {
                    const variantEntries = Object.entries(
                      item.selectedVariants,
                    );

                    return (
                      <div
                        key={item.id}
                        className="py-3.5 flex items-start gap-3"
                      >
                        <div className="w-12 h-12 rounded-lg bg-white border border-border/60 shrink-0 flex items-center justify-center overflow-hidden">
                          <div className="scale-50">
                            {item.product.category === "manik-kaca" && (
                              <div className="flex -space-x-1 items-center">
                                <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-300 shadow-sm border border-white" />
                                <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-fuchsia-300 to-rose-200 shadow-md border border-white" />
                              </div>
                            )}
                            {item.product.category === "akrilik" && (
                              <div className="grid grid-cols-2 gap-1 p-1">
                                <span className="w-4 h-4 rounded-md bg-pink-300" />
                                <span className="w-4 h-4 rounded-full bg-violet-300" />
                                <span className="w-4 h-4 rounded-full bg-amber-200" />
                                <span className="w-4 h-4 rounded-md bg-emerald-200" />
                              </div>
                            )}
                            {item.product.category === "mutiara" && (
                              <div className="flex items-center gap-1">
                                <span className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200" />
                                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-white to-amber-100 border border-white shadow-sm" />
                              </div>
                            )}
                            {item.product.category === "tali-kawat" && (
                              <div className="w-10 h-10 rounded-full border-2 border-orange-300 flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full border border-orange-400" />
                              </div>
                            )}
                            {item.product.category === "alat-crafting" && (
                              <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-border flex items-center justify-center">
                                <span className="w-1.5 h-5 rounded-sm bg-neutral-700 transform -rotate-12" />
                                <span className="w-1.5 h-5 rounded-sm bg-neutral-700 transform rotate-12 -ml-1" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-sans text-xs sm:text-sm font-semibold text-foreground truncate">
                            {item.product.name}
                          </h3>
                          {variantEntries.length > 0 && (
                            <p className="text-[11px] text-muted-foreground truncate">
                              {variantEntries
                                .map(
                                  ([k, v]) =>
                                    `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`,
                                )
                                .join(" • ")}
                            </p>
                          )}
                          <p className="text-[11px] text-muted-foreground">
                            Harga satuan: {formatRupiah(item.product.price)}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-xs">
                            <span className="text-muted-foreground">
                              × {item.quantity}
                            </span>
                            <span className="font-semibold text-foreground">
                              {formatRupiah(item.product.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotal and Shipping Breakdown */}
                <div className="space-y-2.5 pb-4 border-b border-border/60 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal Produk</span>
                    <span className="font-semibold text-foreground">
                      {formatRupiah(subtotalPrice)}
                    </span>
                  </div>
                  <div className="flex items-start justify-between text-muted-foreground">
                    <div>
                      <span>Biaya Pengiriman</span>
                      <span className="block text-[10px] text-muted-foreground/80">
                        {selectedRate
                          ? `${selectedRate.courier_name} — ${selectedRate.service_name}`
                          : "Pilih opsi pengiriman di samping"}
                      </span>
                    </div>
                    <span className="font-medium text-foreground text-right text-xs">
                      {isLoadingShipping ? (
                        <span className="text-muted-foreground italic flex items-center gap-1 justify-end">
                          <Loader2 className="w-3 h-3 animate-spin text-brand-pink" />
                          Menghitung...
                        </span>
                      ) : selectedRate ? (
                        <span className="font-mono font-semibold text-foreground">
                          {formatRupiah(selectedRate.cost)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">-</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Total Preview */}
                <div className="py-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-brand-pink block font-semibold">
                      Total Pembayaran
                    </span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      {selectedRate
                        ? "Sudah termasuk ongkos kirim"
                        : "Belum termasuk ongkir"}
                    </span>
                  </div>
                  <span className="font-sans text-xl font-bold text-foreground font-mono">
                    {formatRupiah(subtotalPrice + (selectedRate?.cost || 0))}
                  </span>
                </div>

                {/* Checkout Error Message */}
                {checkoutError && (
                  <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span className="leading-snug">{checkoutError}</span>
                  </div>
                )}

                {/* Primary Action Button: submit order to backend */}
                <button
                  type="submit"
                  disabled={isSubmitting || isLoadingShipping || !selectedRate}
                  className="w-full h-12 rounded-full bg-brand-pink text-white font-semibold text-sm hover:bg-brand-pink-dark transition-all flex items-center justify-center gap-2 shadow-none active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses Pesanan...
                    </span>
                  ) : isLoadingShipping ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Menghitung Ongkir...
                    </span>
                  ) : (
                    <>
                      <span>Konfirmasi & Buat Pesanan</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="mt-4 text-center">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Pastikan rincian pesanan dan alamat pengiriman telah sesuai
                    sebelum membuat pesanan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* QUICK ADD ADDRESS MODAL IN CHECKOUT */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-border max-w-lg w-full p-6 sm:p-8 shadow-xl my-8 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60">
              <div>
                <h3 className="font-sans text-base sm:text-lg font-bold text-foreground">
                  Tambah Alamat Baru
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Khusus pengiriman wilayah Indonesia
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewAddressModal} className="space-y-4">
              {newAddressError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{newAddressError}</span>
                </div>
              )}

              {/* 1. FIELD KODE POS (PALING ATAS) */}
              <div className="bg-brand-warm/60 p-4 rounded-2xl border border-border/80 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Kode Pos <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={newAddrForm.kodePos}
                      onChange={(e) =>
                        handleNewAddrKodePosChange(e.target.value)
                      }
                      placeholder="Masukkan 5 digit kode pos (cth: 60241, 10110)"
                      maxLength={5}
                      className={`w-full pl-9 pr-9 py-2 rounded-xl bg-white border text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                        newAddrKodePosStatus === "not_found"
                          ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
                          : newAddrKodePosStatus === "found" ||
                              (newAddrKodePosStatus === "multiple" &&
                                newAddrForm.kelurahan)
                            ? "border-emerald-400 focus:ring-emerald-500/20 focus:border-emerald-500"
                            : "border-border focus:ring-brand-pink/20 focus:border-brand-pink"
                      }`}
                    />
                    {(newAddrKodePosStatus === "found" ||
                      (newAddrKodePosStatus === "multiple" &&
                        newAddrForm.kelurahan)) && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  {newAddrKodePosStatus === "not_found" && (
                    <p className="text-rose-600 text-[11px] mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Kode pos tidak ditemukan di wilayah Indonesia. Pastikan
                        5 digit angka yang benar.
                      </span>
                    </p>
                  )}
                </div>

                {/* 2. PILIHAN WILAYAH JIKA KODE POS MEMILIKI BEBERAPA WILAYAH */}
                {newAddrKodePosStatus === "multiple" &&
                  newAddrKodePosResults.length > 1 && (
                    <div className="pt-1">
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Pilih Kelurahan / Wilayah yang Sesuai{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <p className="text-[11px] text-muted-foreground mb-2">
                        Kode pos {newAddrForm.kodePos} mencakup{" "}
                        {newAddrKodePosResults.length} kelurahan/desa. Silakan
                        pilih:
                      </p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto rounded-xl border border-border p-2 bg-white">
                        {newAddrKodePosResults.map((entry, idx) => {
                          const isSelected =
                            newAddrForm.kelurahan === entry.kelurahan &&
                            newAddrForm.kecamatan === entry.kecamatan;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleNewAddrSelectWilayah(entry)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between gap-2 ${
                                isSelected
                                  ? "bg-brand-pink text-white font-semibold shadow-xs"
                                  : "bg-brand-warm/50 hover:bg-brand-pink-soft/40 text-foreground border border-border/40"
                              }`}
                            >
                              <div>
                                <span className="font-semibold block">
                                  {entry.kelurahan}
                                </span>
                                <span
                                  className={`text-[10px] block ${isSelected ? "text-white/80" : "text-muted-foreground"}`}
                                >
                                  Kec. {entry.kecamatan}, {entry.kabupatenKota}
                                </span>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 shrink-0 text-white" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* 3. FIELD WILAYAH TERISI OTOMATIS & READ-ONLY */}
                {(newAddrForm.provinsi ||
                  newAddrForm.kotaKabupaten ||
                  newAddrForm.kecamatan ||
                  newAddrForm.kelurahan) && (
                  <div className="pt-2 border-t border-border/60">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block mb-2">
                      Data Wilayah Terisi Otomatis (Sesuai Kode Pos)
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                          Provinsi
                        </label>
                        <input
                          type="text"
                          value={newAddrForm.provinsi}
                          readOnly
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-border/70 text-xs text-foreground cursor-not-allowed select-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                          Kota / Kabupaten
                        </label>
                        <input
                          type="text"
                          value={newAddrForm.kotaKabupaten}
                          readOnly
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-border/70 text-xs text-foreground cursor-not-allowed select-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                          Kecamatan
                        </label>
                        <input
                          type="text"
                          value={newAddrForm.kecamatan}
                          readOnly
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-border/70 text-xs text-foreground cursor-not-allowed select-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                          Kelurahan / Desa
                        </label>
                        <input
                          type="text"
                          value={newAddrForm.kelurahan || "(Belum dipilih)"}
                          readOnly
                          className={`w-full px-3 py-1.5 rounded-lg border text-xs cursor-not-allowed select-none font-medium ${
                            newAddrForm.kelurahan
                              ? "bg-white border-border/70 text-foreground"
                              : "bg-rose-50 border-rose-200 text-rose-600 italic"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. DETAIL ALAMAT MANUAL */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Detail Alamat Lengkap <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={newAddrForm.alamat}
                  onChange={(e) =>
                    setNewAddrForm((prev) => ({
                      ...prev,
                      alamat: e.target.value,
                    }))
                  }
                  placeholder="Nama jalan, nomor rumah, RT/RW, nomor unit, atau patokan lokasi"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-border text-xs focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink resize-none"
                />
              </div>

              {/* 5. NAMA PENERIMA & NOMOR TELEPON */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Nama Penerima <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddrForm.nama}
                    onChange={(e) =>
                      setNewAddrForm((prev) => ({
                        ...prev,
                        nama: e.target.value,
                      }))
                    }
                    placeholder="Nama lengkap penerima"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-border text-xs focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Nomor WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={newAddrForm.whatsapp}
                    onChange={(e) =>
                      setNewAddrForm((prev) => ({
                        ...prev,
                        whatsapp: e.target.value,
                      }))
                    }
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-border text-xs focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                  />
                </div>
              </div>

              {/* 6. LABEL ALAMAT */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Label Alamat
                </label>
                <div className="flex gap-2">
                  {["Rumah", "Kantor", "Kos"].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() =>
                        setNewAddrForm((prev) => ({ ...prev, label: lbl }))
                      }
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        newAddrForm.label === lbl
                          ? "bg-brand-pink text-white shadow-xs"
                          : "bg-brand-warm text-muted-foreground border border-border"
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  disabled={isSavingNewAddress}
                  className="px-4 py-1.5 rounded-full border border-border text-xs font-medium text-foreground hover:bg-secondary"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingNewAddress}
                  className="px-5 py-1.5 rounded-full bg-brand-pink text-white text-xs font-semibold hover:bg-brand-pink-dark transition-colors disabled:opacity-60"
                >
                  {isSavingNewAddress ? "Menyimpan..." : "Gunakan Alamat Ini"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
