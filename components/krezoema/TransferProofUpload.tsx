"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Image as ImageIcon, X, RefreshCw } from "lucide-react";
import type { ApiOrder } from "@/lib/api/types";
import { uploadTransferProof } from "@/lib/api/ecommerce";

interface TransferProofUploadProps {
  order: ApiOrder;
  onUploaded: (updated: ApiOrder) => void;
}

const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png"];
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export const TransferProofUpload: React.FC<TransferProofUploadProps> = ({ order, onUploaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showReupload, setShowReupload] = useState(false);

  const existingProofUrl = order.transfer_proof_url;
  const isPaid = order.payment_status === "paid";

  // Can upload if:
  // 1. Not paid
  // 2. AND either unpaid, rejected, or waiting_verification with no proof yet, or user clicked re-upload
  const shouldShowUploadForm =
    !isPaid &&
    (order.payment_status === "unpaid" ||
      order.payment_status === "rejected" ||
      !existingProofUrl ||
      showReupload);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME.includes(file.type)) {
      setError("Format file tidak valid. Gunakan JPG, JPEG, atau PNG.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(`Ukuran file terlalu besar. Maksimal ${MAX_SIZE_MB} MB.`);
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await uploadTransferProof(order.id, selectedFile);
      setSuccess("Bukti transfer berhasil diupload. Status pembayaran diperbarui ke Menunggu Verifikasi.");
      setSelectedFile(null);
      setPreview(null);
      setShowReupload(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onUploaded(updated);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal mengupload bukti transfer.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 mt-4 rounded-2xl bg-white border border-brand-pink/30 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
          <UploadCloud className="w-4 h-4 text-brand-pink" />
          <span>Upload Bukti Transfer</span>
        </div>
        {order.payment_status === "unpaid" && (
          <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            Wajib Upload
          </span>
        )}
      </div>

      {/* Existing proof thumbnail */}
      {existingProofUrl && (
        <div className="space-y-2 bg-brand-warm rounded-xl p-3 border border-border/60">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">Bukti Transfer Terlampir:</p>
            {!isPaid && !showReupload && (
              <button
                type="button"
                onClick={() => setShowReupload(true)}
                className="text-[11px] font-semibold text-brand-pink hover:text-brand-pink-dark transition-colors inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Ganti Bukti
              </button>
            )}
          </div>
          <a href={existingProofUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={existingProofUrl}
              alt="Bukti transfer"
              className="max-h-48 rounded-lg border border-border object-contain cursor-pointer hover:opacity-90 transition-opacity"
            />
          </a>
          <p className="text-[10px] text-muted-foreground">Klik gambar untuk melihat ukuran penuh.</p>
        </div>
      )}

      {/* Status Badges */}
      {isPaid && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <div>
            <p className="font-semibold">Pembayaran Terverifikasi (Lunas)</p>
            <p className="text-[11px] text-emerald-700">Pembayaran telah diverifikasi admin. Upload bukti tidak diperlukan lagi.</p>
          </div>
        </div>
      )}

      {order.payment_status === "waiting_verification" && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-xl flex items-start gap-2.5">
          <ImageIcon className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-blue-950">Menunggu Verifikasi Admin</p>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              {existingProofUrl
                ? "Bukti transfer telah dikirim dan sedang diverifikasi oleh admin."
                : "Silakan upload bukti transfer Anda di bawah ini agar admin dapat memverifikasi pembayaran."}
            </p>
          </div>
        </div>
      )}

      {order.payment_status === "rejected" && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-rose-950">Bukti Transfer Ditolak</p>
            <p className="text-[11px] text-rose-800 leading-relaxed">
              Bukti transfer sebelumnya ditolak oleh admin. Silakan upload ulang bukti transfer yang jelas dan valid.
            </p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {shouldShowUploadForm && (
        <div className="space-y-3">
          {order.payment_status === "unpaid" && !existingProofUrl && (
            <p className="text-xs text-muted-foreground bg-brand-warm p-3 rounded-xl border border-border/60 leading-relaxed">
              Silakan lakukan transfer sesuai total tagihan, kemudian <strong>upload bukti struk / screenshot transfer</strong> di bawah ini agar pesanan Anda dapat diproses oleh admin.
            </p>
          )}

          {/* Preview if file chosen */}
          {preview && (
            <div className="relative inline-block border border-brand-pink/30 rounded-xl p-2 bg-brand-warm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview bukti transfer"
                className="max-h-48 rounded-lg object-contain"
              />
              <button
                type="button"
                onClick={handleClearFile}
                className="absolute -top-2 -right-2 bg-white border border-border shadow-xs rounded-full p-1 hover:bg-rose-50 text-muted-foreground hover:text-rose-600 transition-colors"
                title="Hapus file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Dropzone / File Picker */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
              id={`proof-upload-${order.id}`}
            />
            <label
              htmlFor={`proof-upload-${order.id}`}
              className="cursor-pointer block border-2 border-dashed border-brand-pink/40 hover:border-brand-pink bg-brand-warm/60 hover:bg-brand-pink-soft/20 rounded-2xl p-5 text-center transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-brand-pink-soft text-brand-pink flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-brand-pink transition-colors">
                {selectedFile ? `File Dipilih: ${selectedFile.name}` : "Klik untuk Memilih File Bukti Transfer"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Format yang didukung: JPG, JPEG, PNG (Maks. 2 MB)
              </p>
            </label>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-brand-pink hover:bg-brand-pink-dark text-white font-semibold text-xs sm:text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mengupload Bukti...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Kirim Bukti Transfer</span>
                </>
              )}
            </button>

            {showReupload && (
              <button
                type="button"
                onClick={() => {
                  setShowReupload(false);
                  handleClearFile();
                }}
                className="px-4 py-3 rounded-full border border-border text-xs font-semibold text-muted-foreground hover:bg-brand-warm transition-colors"
              >
                Batal
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
