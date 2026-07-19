import type {
  Food,
  Category,
  Restaurant,
  PriceRange,
  Settings,
  Location,
  Drink,
  Cafe,
  Place,
} from "@prisma/client";

export type {
  Food,
  Category,
  Restaurant,
  PriceRange,
  Settings,
  Location,
  Drink,
  Cafe,
  Place,
};

/**
 * Shape của Food mà UI làm việc cùng. Cố ý expose `restaurants[]` phẳng
 * thay vì `restaurantLinks[]` (bảng nối FoodRestaurant) — component
 * không cần biết Prisma join table tồn tại. Việc ánh xạ (map) từ dữ
 * liệu Prisma thô sang shape này nằm ở `server/foods.ts`.
 * Phase 3B, mục 6 (đã xác nhận).
 */
export type FoodWithRelations = Food & {
  category?: Category | null;
  restaurants: Restaurant[];
};

/**
 * Shape của Settings mà UI làm việc cùng (Phase 3C) — Settings singleton
 * kèm 2 quan hệ Location đã include sẵn. Việc đảm bảo dòng Settings
 * luôn tồn tại (id = 1) nằm ở `server/settings-service.ts`, UI không cần
 * biết chi tiết đó.
 */
export type SettingsWithLocations = Settings & {
  homeLocation: Location | null;
  luaLocation: Location | null;
};

/**
 * Shape của Cafe mà UI làm việc cùng. Kèm theo danh sách các món trong menu (drinks) và category.
 */
export type CafeWithRelations = Cafe & {
  category?: Category | null;
  drinks: Drink[];
};

/** Shape of the portable backup file used by Import/Export JSON (Cafe). */
export interface CafeExportPayload {
  exportedAt: string;
  categories: Pick<Category, "name" | "slug" | "icon" | "color">[];
  cafes: Array<
    Pick<
      Cafe,
      "name" | "address" | "latitude" | "longitude" | "imageUrl" | "menuUrl" | "url" | "googleMapUrl" | "priceRange" | "isFavorite"
    > & {
      categoryName?: string | null;
      drinks: Pick<Drink, "name" | "isFavorite">[];
    }
  >;
}

/** Shape of the portable backup file used by Import/Export JSON. */
export interface FoodExportPayload {
  exportedAt: string;
  categories: Pick<Category, "name" | "slug" | "icon" | "color">[];
  restaurants: Pick<Restaurant, "name" | "address" | "priceRange">[];
  foods: Array<
    Pick<
      Food,
      "name" | "description" | "imageUrl" | "priceRange" | "spicyLevel" | "tags" | "isFavorite"
    > & {
      categoryName?: string | null;
      /** Một món có thể gắn nhiều quán (nhiều-nhiều) — mảng tên quán thay vì 1 tên. */
      restaurantNames?: string[];
    }
  >;
}

/**
 * Shape của Place mà UI làm việc cùng — song song FoodWithRelations,
 * nhưng Place KHÔNG có bảng nối nhiều-nhiều nào (categoryId là quan hệ
 * 1-nhiều đơn giản, giống Food↔Category) nên không cần hàm mapping riêng
 * ngoài việc include `category`. Phase 4.
 */
export type PlaceWithRelations = Place & {
  category?: Category | null;
};

export type PlaceWheelCandidate =
  | { type: "PLACE"; id: string; place: PlaceWithRelations }
  | { type: "CATEGORY"; id: string; category: Category; places: PlaceWithRelations[] };

/** Shape of the portable backup file used by Import/Export JSON (Place). */
export interface PlaceExportPayload {
  exportedAt: string;
  categories: Pick<Category, "name" | "slug" | "icon" | "color">[];
  places: Array<
    Pick<
      Place,
      "name" | "address" | "latitude" | "longitude" | "imageUrl" | "url" | "googleMapUrl" | "priceRange" | "isFavorite"
    > & {
      categoryName?: string | null;
    }
  >;
}
