/**
 * Random Engine — thuật toán chọn ngẫu nhiên có trọng số.
 *
 * Đây là engine THUẦN DỮ LIỆU: không import Prisma, không import
 * component, không biết gì về "Food" hay "Restaurant" cụ thể. Nó chỉ
 * cần bất kỳ object nào có `id`, và tuỳ chọn `isFavorite` /
 * `isBlacklisted` / `hiddenUntil`. Nhờ vậy engine này dùng lại được cho
 * Drink/Cafe/Place ở các phase sau mà không phải viết lại.
 *
 * Thuật toán (đã xác nhận — Phase 3B mục 4):
 *   - Base weight  = 1
 *   - Favorite     → ×2
 *   - History      → xét N lần random gần nhất (mặc định 10), mỗi lần
 *                    item đó xuất hiện thì ×0.6 (0 lần = 1, 1 lần = 0.6,
 *                    2 lần = 0.36, 3 lần = 0.216, ...)
 *   - Sàn (floor)  = 0.1 — trọng số cuối cùng không bao giờ thấp hơn mức
 *                    này, TRỪ KHI item bị loại hẳn (blacklist / hide
 *                    today), lúc đó trọng số = 0 tuyệt đối.
 *
 * Mở rộng về sau (Mood/Weather/Distance/Price...): KHÔNG sửa hàm
 * `pickRandom`. Viết một `RandomEngineModifier` mới rồi truyền vào
 * `settings.modifiers` lúc gọi engine từ component/server action.
 */

export interface RandomEngineItem {
  id: string;
  isFavorite?: boolean;
  isBlacklisted?: boolean;
  hiddenUntil?: Date | string | null;
}

/** Một lượt random trong quá khứ — chỉ cần biết trỏ tới item nào và khi nào. */
export interface RandomEngineHistoryEntry {
  itemId: string | null | undefined;
  createdAt: Date | string;
}

export interface ResolvedRandomEngineSettings {
  baseWeight: number;
  favoriteMultiplier: number;
  historyWindow: number;
  historyDecay: number;
  weightFloor: number;
}

/**
 * Một bộ điều chỉnh trọng số mở rộng. Nhận item + ngữ cảnh (lịch sử đã
 * cắt theo cửa sổ, settings đã resolve), trả về một HỆ SỐ NHÂN (không
 * phải trọng số tuyệt đối) — ví dụ Weather trời mưa muốn ưu tiên món
 * nước thì trả 1.5 cho món đó, 1 cho món khác.
 */
export type RandomEngineModifier<T extends RandomEngineItem = RandomEngineItem> = (
  item: T,
  ctx: { history: RandomEngineHistoryEntry[]; settings: ResolvedRandomEngineSettings }
) => number;

export interface RandomEngineSettings<T extends RandomEngineItem = RandomEngineItem> {
  /** Trọng số khởi điểm cho mọi item. Mặc định 1. */
  baseWeight?: number;
  /** Hệ số nhân khi item được đánh dấu yêu thích. Mặc định 2. */
  favoriteMultiplier?: number;
  /** Xét bao nhiêu lượt random gần nhất khi tính phạt lặp lại. Mặc định 10. */
  historyWindow?: number;
  /** Mỗi lần item xuất hiện trong cửa sổ lịch sử, nhân thêm hệ số này. Mặc định 0.6. */
  historyDecay?: number;
  /** Sàn trọng số tối thiểu, áp dụng sau mọi phép nhân — không áp dụng cho item bị loại hẳn. Mặc định 0.1. */
  weightFloor?: number;
  /** Hook mở rộng — Mood/Weather/Distance/Price/... của các phase sau. */
  modifiers?: RandomEngineModifier<T>[];
}

export interface RandomEngineDebugEntry {
  id: string;
  baseWeight: number;
  favoriteMultiplier: number;
  historyOccurrences: number;
  historyMultiplier: number;
  modifierMultiplier: number;
  rawWeight: number;
  finalWeight: number;
  excluded: boolean;
  excludedReason?: "blacklisted" | "hidden-today";
}

export interface RandomEngineResult<T extends RandomEngineItem> {
  winner: T | null;
  /** Trọng số cuối cùng của từng item, theo id. */
  weights: Record<string, number>;
  /** Chi tiết từng bước tính trọng số — dùng để debug/hiển thị nếu cần. */
  debug: RandomEngineDebugEntry[];
}

const DEFAULT_SETTINGS: ResolvedRandomEngineSettings = {
  baseWeight: 1,
  favoriteMultiplier: 2,
  historyWindow: 10,
  historyDecay: 0.6,
  weightFloor: 0.1,
};

function isHiddenToday(hiddenUntil?: Date | string | null): boolean {
  if (!hiddenUntil) return false;
  return new Date(hiddenUntil).getTime() > Date.now();
}

/**
 * Chọn ngẫu nhiên có trọng số từ danh sách `items`, dựa trên `history`
 * gần đây và `settings` tuỳ chỉnh. Không có side-effect, không đọc/ghi
 * gì bên ngoài — component/server action chịu trách nhiệm truyền đúng
 * dữ liệu vào và xử lý `winner` trả về (ví dụ: random wheel tới đúng vị
 * trí...).
 */
export function pickRandom<T extends RandomEngineItem>(
  items: T[],
  history: RandomEngineHistoryEntry[] = [],
  settings: RandomEngineSettings<T> = {}
): RandomEngineResult<T> {
  const cfg: ResolvedRandomEngineSettings = {
    baseWeight: settings.baseWeight ?? DEFAULT_SETTINGS.baseWeight,
    favoriteMultiplier: settings.favoriteMultiplier ?? DEFAULT_SETTINGS.favoriteMultiplier,
    historyWindow: settings.historyWindow ?? DEFAULT_SETTINGS.historyWindow,
    historyDecay: settings.historyDecay ?? DEFAULT_SETTINGS.historyDecay,
    weightFloor: settings.weightFloor ?? DEFAULT_SETTINGS.weightFloor,
  };
  const modifiers = settings.modifiers ?? [];

  const recentHistory = [...history]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, cfg.historyWindow);

  const debug: RandomEngineDebugEntry[] = [];
  const weights: Record<string, number> = {};

  for (const item of items) {
    const blacklisted = !!item.isBlacklisted;
    const hiddenToday = isHiddenToday(item.hiddenUntil);
    const excluded = blacklisted || hiddenToday;

    const historyOccurrences = recentHistory.filter((h) => h.itemId === item.id).length;
    const favoriteMultiplier = item.isFavorite ? cfg.favoriteMultiplier : 1;
    const historyMultiplier = Math.pow(cfg.historyDecay, historyOccurrences);

    let modifierMultiplier = 1;
    for (const modifier of modifiers) {
      modifierMultiplier *= modifier(item, { history: recentHistory, settings: cfg });
    }

    const rawWeight = cfg.baseWeight * favoriteMultiplier * historyMultiplier * modifierMultiplier;
    const finalWeight = excluded ? 0 : Math.max(cfg.weightFloor, rawWeight);

    weights[item.id] = finalWeight;
    debug.push({
      id: item.id,
      baseWeight: cfg.baseWeight,
      favoriteMultiplier,
      historyOccurrences,
      historyMultiplier,
      modifierMultiplier,
      rawWeight,
      finalWeight,
      excluded,
      excludedReason: blacklisted ? "blacklisted" : hiddenToday ? "hidden-today" : undefined,
    });
  }

  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
  if (items.length === 0 || total <= 0) {
    return { winner: null, weights, debug };
  }

  let roll = Math.random() * total;
  let winner: T | null = null;
  for (const item of items) {
    roll -= weights[item.id];
    if (roll <= 0) {
      winner = item;
      break;
    }
  }
  // Fallback phòng sai số làm tròn dấu phẩy động khiến vòng lặp không khớp.
  winner = winner ?? items[items.length - 1];

  return { winner, weights, debug };
}