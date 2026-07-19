"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportPlacesAction, importPlacesAction } from "@/actions/places";

export function DataPortability() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      const payload = await exportPlacesAction();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hom-nay-choi-dau-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Đã xuất file JSON.");
    } catch {
      toast.error("Xuất dữ liệu thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function handleImportFile(file: File) {
    setBusy(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const result = await importPlacesAction(json);
      toast.success(`Đã nhập ${result.imported} địa điểm.`);
    } catch {
      toast.error("Tệp không hợp lệ hoặc nhập dữ liệu thất bại.");
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={handleExport} disabled={busy} className="gap-1.5">
        <Download className="h-3.5 w-3.5" /> Xuất JSON
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={busy}
        className="gap-1.5"
      >
        <Upload className="h-3.5 w-3.5" /> Nhập JSON
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImportFile(file);
        }}
      />
    </div>
  );
}
