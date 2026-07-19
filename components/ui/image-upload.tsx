"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadImageAction } from "@/actions/upload";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 32 * 1024 * 1024) {
      toast.error("Kích thước ảnh tối đa là 32MB");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", file);
      
      const result = await uploadImageAction(formData);
      
      if (result.success && result.url) {
        onChange(result.url);
        toast.success("Tải ảnh lên thành công");
      } else {
        toast.error(result.error || "Tải ảnh thất bại");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải ảnh lên");
      console.error(error);
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={inputRef}
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />
        
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
          className="w-full gap-2 border-dashed border-2 py-8 hover:bg-muted/50"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Đang tải lên...</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">Chọn ảnh từ thiết bị (Tối đa 32MB)</span>
            </>
          )}
        </Button>
      </div>

      {value && (
        <div className="relative w-full max-w-sm overflow-hidden rounded-xl border bg-muted group">
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => onChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <img
            src={value}
            alt="Uploaded preview"
            className="w-full h-48 object-cover"
          />
        </div>
      )}
    </div>
  );
}
