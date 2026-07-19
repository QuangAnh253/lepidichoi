"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Mật khẩu được lấy từ file .env, cách nhau bởi dấu phẩy (,)
const VALID_PASSWORDS = (process.env.APP_PASSWORDS || "")
  .split(",")
  .map(p => p.trim())
  .filter(Boolean); // Lọc bỏ các giá trị rỗng

function normalizePassword(input: string): string {
  if (!input) return "";
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Xoá dấu tiếng Việt
    .toLowerCase() // Chuyển thành chữ thường
    .replace(/[^a-z0-9]/g, ""); // Xoá toàn bộ ký tự không phải chữ cái và số (khoảng trắng, dấu chấm, gạch ngang...)
}

export async function loginAction(formData: FormData) {
  const password = formData.get("password") as string;
  const normalized = normalizePassword(password);
  
  if (VALID_PASSWORDS.includes(normalized)) {
    const cookieStore = await cookies();
    cookieStore.set("date_auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 ngày
      path: "/",
    });
  } else {
    return { success: false, error: "Mật khẩu không đúng. Vui lòng thử lại!" };
  }
  
  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("date_auth");
  redirect("/login");
}
