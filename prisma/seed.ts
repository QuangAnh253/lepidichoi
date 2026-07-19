/**
 * Seed script — Phase 3A
 * Vẫn một bộ dữ liệu dùng chung (không multi-user). Thêm dữ liệu mẫu cho
 * Cafe/Drink/Place/Location/Settings để 3B-3E có sẵn vài dòng mà làm UI,
 * không cần bắt đầu từ set rỗng. Food/Restaurant/Category giữ nguyên
 * tinh thần Phase 2, chỉ đổi cách gắn Food<->Restaurant sang qua bảng
 * nối FoodRestaurant (nhiều-nhiều) thay vì field restaurantId cũ.
 */
import { PrismaClient, PriceRange, CategoryType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  // Xoá theo đúng thứ tự phụ thuộc khoá ngoại
  await prisma.foodRestaurant.deleteMany();
  await prisma.drink.deleteMany();
  await prisma.food.deleteMany();
  await prisma.place.deleteMany();
  await prisma.cafe.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.category.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.location.deleteMany();

  // --- Categories (Food) ---
  const [monNuoc, com, anVat, nuong] = await Promise.all(
    [
      { name: "Món nước", slug: "mon-nuoc", icon: "soup", color: "#B5541A" },
      { name: "Cơm", slug: "com", icon: "utensils", color: "#7A6A3F" },
      { name: "Ăn vặt", slug: "an-vat", icon: "cookie", color: "#C79A3E" },
      { name: "Nướng", slug: "nuong", icon: "flame", color: "#9C4A2E" },
    ].map((c) => prisma.category.create({ data: { ...c, type: CategoryType.FOOD } }))
  );

  // --- Categories (Place / "Topic") ---
  const [cinema, museum, park, bookstore] = await Promise.all(
    [
      { name: "Rạp phim", slug: "rap-phim", icon: "clapperboard", color: "#7A6A3F" },
      { name: "Bảo tàng", slug: "bao-tang", icon: "landmark", color: "#B5541A" },
      { name: "Công viên", slug: "cong-vien", icon: "trees", color: "#6E7A4F" },
      { name: "Hiệu sách", slug: "hieu-sach", icon: "book-open", color: "#9C4A2E" },
    ].map((c) => prisma.category.create({ data: { ...c, type: CategoryType.PLACE } }))
  );

  // --- Restaurants ---
  const quanCom = await prisma.restaurant.create({
    data: {
      name: "Quán Cơm Cô Ba",
      address: "12 Láng Hạ, Đống Đa",
      priceRange: PriceRange.BUDGET,
      latitude: 21.0159,
      longitude: 105.8138,
    },
  });
  const phoGia = await prisma.restaurant.create({
    data: {
      name: "Phở Gia Truyền",
      address: "49 Bát Đàn, Hoàn Kiếm",
      priceRange: PriceRange.BUDGET,
      latitude: 21.0335,
      longitude: 105.8483,
    },
  });
  const bunCha = await prisma.restaurant.create({
    data: {
      name: "Bún Chả Đắc Kim",
      address: "1 Hàng Mành, Hoàn Kiếm",
      priceRange: PriceRange.MID,
      latitude: 21.0332,
      longitude: 105.8497,
    },
  });

  // --- Foods (gắn quán qua bảng nối, nested create) ---
  await prisma.food.create({
    data: {
      name: "Phở bò tái",
      description: "Nước dùng ninh xương từ đêm hôm trước, hành trần thơm.",
      categoryId: monNuoc.id,
      priceRange: PriceRange.BUDGET,
      tags: ["nước", "bò", "sáng"],
      restaurantLinks: { create: [{ restaurantId: phoGia.id }] },
    },
  });
  await prisma.food.create({
    data: {
      name: "Bún chả Hà Nội",
      description: "Chả nướng than hoa, ăn kèm rau sống.",
      categoryId: nuong.id,
      priceRange: PriceRange.MID,
      tags: ["nướng", "trưa"],
      restaurantLinks: { create: [{ restaurantId: bunCha.id }] },
    },
  });
  await prisma.food.create({
    data: {
      name: "Cơm sườn nướng",
      description: "Sườn ướp mật ong nướng than, cơm tấm dẻo.",
      categoryId: com.id,
      priceRange: PriceRange.BUDGET,
      tags: ["sườn", "trưa"],
      restaurantLinks: { create: [{ restaurantId: quanCom.id }] },
    },
  });
  await prisma.food.create({
    data: {
      name: "Cơm gà xối mỡ",
      description: "Da gà giòn rụm, cơm chan mỡ hành.",
      categoryId: com.id,
      priceRange: PriceRange.MID,
      tags: ["gà", "trưa"],
      isFavorite: true,
      // Một món có thể ăn ở nhiều quán — ví dụ minh hoạ quan hệ nhiều-nhiều
      restaurantLinks: { create: [{ restaurantId: quanCom.id }, { restaurantId: phoGia.id }] },
    },
  });

  // --- Cafes + Drinks (dữ liệu mẫu tối thiểu cho Phase 3B) ---
  const theHouse = await prisma.cafe.create({
    data: {
      name: "The Note Coffee",
      address: "64 Lương Văn Can, Hoàn Kiếm",
      latitude: 21.0332,
      longitude: 105.8508,
      drinks: {
        create: [
          { name: "Cà phê sữa đá", isFavorite: true },
          { name: "Trà đào cam sả", isFavorite: false },
        ],
      },
    },
  });

  // --- Places (dữ liệu mẫu tối thiểu cho Phase 3E) ---
  await prisma.place.createMany({
    data: [
      {
        name: "Công viên Thống Nhất",
        address: "Đống Đa, Hà Nội",
        latitude: 21.0138,
        longitude: 105.8442,
        categoryId: park.id,
      },
      {
        name: "Bảo tàng Dân tộc học",
        address: "Nguyễn Văn Huyên, Cầu Giấy",
        latitude: 21.0393,
        longitude: 105.7999,
        categoryId: museum.id,
      },
      {
        name: "CGV Vincom Bà Triệu",
        address: "191 Bà Triệu, Hai Bà Trưng",
        latitude: 21.0126,
        longitude: 105.8496,
        categoryId: cinema.id,
      },
      {
        name: "Nhã Nam Bookstore",
        address: "24 Lê Đại Hành, Hai Bà Trưng",
        latitude: 21.0091,
        longitude: 105.8485,
        categoryId: bookstore.id,
      },
    ],
  });

  // --- Locations + Settings ---
  // Toạ độ minh hoạ — người dùng sẽ tự đặt lại qua "Chọn trên bản đồ" ở
  // /settings (Phase 3C). Seed chỉ cần có sẵn 1 dòng Settings (id = 1).
  const homeLocation = await prisma.location.create({
    data: { name: "Nhà Lê", latitude: 21.0285, longitude: 105.8542 },
  });
  const luaLocation = await prisma.location.create({
    data: { name: "Nhà Pi", latitude: 21.0245, longitude: 105.8412 },
  });
  await prisma.settings.create({
    data: {
      id: 1,
      homeLocationId: homeLocation.id,
      luaLocationId: luaLocation.id,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
