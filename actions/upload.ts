"use server";

export async function uploadImageAction(formData: FormData) {
  const file = formData.get("image") as File;
  if (!file) {
    return { success: false, error: "Không tìm thấy file ảnh" };
  }
  
  if (!file.type.startsWith("image/")) {
    return { success: false, error: "File không phải là ảnh hợp lệ" };
  }
  
  // Vercel Serverless Function limit is 4.5MB for request bodies
  if (file.size > 4.5 * 1024 * 1024) {
    return { success: false, error: "Ảnh quá lớn, tối đa 4.5MB (giới hạn của Vercel)" };
  }

  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return { success: false, error: "Chưa cấu hình IMGBB_API_KEY" };
  }

  try {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    
    const body = new URLSearchParams();
    body.append("image", base64);
    
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body,
    });
    
    const data = await res.json();
    if (data.success) {
      return { success: true, url: data.data.url };
    } else {
      return { success: false, error: data.error?.message || "Lỗi khi upload ảnh lên ImgBB" };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi hệ thống khi upload" };
  }
}
