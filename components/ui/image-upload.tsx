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

async function compressImage(file: File, maxWidth = 1920, maxHeight = 1920, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new globalThis.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            resolve(new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            }));
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const originalFile = e.target.files?.[0];
    if (!originalFile) return;

    if (!originalFile.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    try {
      setIsUploading(true);
      
      // Compress image if it's larger than 1MB
      let fileToUpload = originalFile;
      if (originalFile.size > 1024 * 1024) {
        toast.info("Đang nén ảnh...");
        fileToUpload = await compressImage(originalFile);
      }

      if (fileToUpload.size > 4.5 * 1024 * 1024) {
        toast.error("Kích thước ảnh sau khi nén vẫn quá lớn (tối đa 4.5MB). Vui lòng chọn ảnh khác.");
        return;
      }

      const formData = new FormData();
      formData.append("image", fileToUpload);
      
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
