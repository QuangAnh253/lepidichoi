"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportCafesAction, importCafesAction } from "@/actions/cafes";

export function DataPortability() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      try {
        const data = await exportCafesAction();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `hom-nay-uong-gi-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Đã xuất dữ liệu thành công");
      } catch (error) {
        toast.error("Lỗi khi xuất dữ liệu");
        console.error(error);
      }
    });
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const payload = JSON.parse(content);
        
        if (!payload.cafes) {
          toast.error("File không hợp lệ (thiếu cafes)");
          return;
        }

        startTransition(async () => {
          const result = await importCafesAction(payload);
          toast.success(`Đã import thành công ${result.imported} quán`);
          router.refresh();
        });
      } catch (error) {
        toast.error("File JSON không hợp lệ");
        console.error(error);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept=".json"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => fileInputRef.current?.click()}
        className="gap-1.5"
      >
        <Upload className="h-3.5 w-3.5" />
        Import
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={handleExport}
        className="gap-1.5"
      >
        <Download className="h-3.5 w-3.5" />
        Export
      </Button>
    </div>
  );
}
