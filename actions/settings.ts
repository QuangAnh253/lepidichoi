"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateSettings, updateLocation } from "@/server/settings-service";

// Cài đặt hiện chỉ được đọc/sửa từ trang /cai-dat, nhưng revalidate toàn
// bộ path liên quan vì Default Radius/Location sẽ được Map Engine dùng
// lại ở /hom-nay-an-gi và các route sau (Drink/Place).
const PATHS = ["/cai-dat", "/hom-nay-an-gi"] as const;

function revalidateAll() {
  for (const path of PATHS) revalidatePath(path);
}

const updateSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  musicEnabled: z.boolean().optional(),
  defaultRadiusKm: z.number().min(0.5).max(50).optional(),
});

/**
 * Server Action DUY NHẤT cho các trường cấu hình đơn giản (theme/music/
 * radius). Chỉ validate rồi gọi thẳng SettingsService —
 * không có business logic ở đây (không tự quyết định singleton, không
 * tự tính toán gì thêm).
 */
export async function updateSettingsAction(input: z.infer<typeof updateSettingsSchema>) {
  const data = updateSettingsSchema.parse(input);
  const settings = await updateSettings(data);
  revalidateAll();
  return settings;
}

const updateLocationSchema = z.object({
  kind: z.enum(["home", "lua"]),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

/**
 * Server Action cho Home Location / Lua Location. Component chỉ gửi
 * `kind` + toạ độ lấy từ marker trên bản đồ — không gửi tên, không tự
 * quyết định tạo mới hay update Location nào (SettingsService lo việc
 * đó dựa vào Settings hiện tại).
 */
export async function updateLocationAction(input: z.infer<typeof updateLocationSchema>) {
  const data = updateLocationSchema.parse(input);
  const settings = await updateLocation({
    kind: data.kind,
    coordinates: { latitude: data.latitude, longitude: data.longitude },
  });
  revalidateAll();
  return settings;
}
