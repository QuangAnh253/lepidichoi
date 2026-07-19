import "server-only";
import { prisma } from "@/lib/prisma";
import type { Category, CategoryType } from "@prisma/client";

/**
 * `type` mặc định "FOOD" để hành vi hiện có của Food không đổi. Drink
 * không dùng Category (schema Phase 3A không có quan hệ Category↔Drink)
 * nên hàm này chỉ được Food/Place gọi. Phase 3D, mục sửa bug Category.
 */
export async function listCategories(type: CategoryType = "FOOD"): Promise<Category[]> {
  return prisma.category.findMany({ where: { type }, orderBy: { name: "asc" } });
}
