"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Image as ImageIcon, X } from "lucide-react";
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

  const canUpload =
    order.payment_status === "unpaid" || order.payment_status === "rejected";

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
      setSuccess("Bukti transfer berhasil diupload. Status pembayaran diperbarui.");
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onUploaded(updated);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal mengupload bukti transfer.");
    } finally {
      setIsUploading(false);
    }
  };

  const existingProofUrl = order.transfer_proof_url;

  return (
    <div className="p-4 sm:p-5 mt-4 rounded-2xl bg-white border border-brand-pink/30 shadow-xs space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/60 pb-3">
        <UploadCloud className="w-4 h-4 text-brand-pink" />
        <span>Bukti Transfer</span>
      </div>

      {existingProofUrl && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Bukti yang sudah diupload:</p>
          <a href={existingProofUrl} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={existingProofUrl}
              alt="Bukti transfer"
              className="max-h-48 rounded-lg border border-border object-contain cursor-pointer hover:opacity-90 transition-opacity"
            />
          </a>
        </div>
      )}

      {order.payment_status === "paid" && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">Pembayaran sudah diverifikasi. Upload tidak diperlukan.</span>
        </div>
      )}

      {order.payment_status === "waiting_verification" && (
        <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-lg flex items-center gap-2">
          <ImageIcon className="w-4 h-4 shrink-0 text-blue-500" />
          <span>Bukti transfer sedang ditinjau oleh admin.</span>
        </div>
      )}

      {order.payment_status === "rejected" && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="font-semibold">Bukti transfer ditolak. Silakan upload ulang bukti transfer yang valid.</span>
        </div>
      )}

      {canUpload && (
        <div className="space-y-3">
          {preview && (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview bukti transfer"
                className="max-h-40 rounded-lg border border-brand-pink/30 object-contain"
              />
              <button
                onClick={handleClearFile}
                className="absolute -top-2 -right-2 bg-white border border-border rounded-full p-0.5 hover:bg-rose-50 transition-colors"
                title="Hapus file"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          )}

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
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-brand-warm border border-border rounded-lg hover:bg-white transition-colors text-foreground shadow-sm"
            >
              <UploadCloud className="w-4 h-4 text-brand-pink" />
              {selectedFile ? "Ganti File" : "Pilih File (JPG/PNG, maks 2 MB)"}
            </label>
            {selectedFile && (
              <span className="ml-3 text-xs text-muted-foreground truncate max-w-[200px] inline-block align-middle">
                {selectedFile.name}
              </span>
            )}
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-brand-pink text-white font-semibold text-xs hover:bg-brand-pink-dark transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            <span>{isUploading ? "Mengupload..." : "Upload Bukti Transfer"}</span>
          </button>
        </div>
      )}
    </div>
  );
};
