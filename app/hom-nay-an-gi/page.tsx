import { listFoods, listWheelCandidates } from "@/server/foods";
import { listCategories } from "@/server/categories";
import { listRestaurants } from "@/server/restaurants";
import { getSettings } from "@/server/settings-service";
import { FoodBoard } from "@/components/food/food-board";

export const dynamic = "force-dynamic";

export default async function HomNayAnGiPage() {
  const [foods, candidates, categories, restaurants, settings] = await Promise.all([
    listFoods(),
    listWheelCandidates(),
    listCategories(),
    listRestaurants(),
    getSettings(),
  ]);

  const home =
    settings.homeLocation != null
      ? { latitude: settings.homeLocation.latitude, longitude: settings.homeLocation.longitude }
      : null;

  return (
    <FoodBoard
      foods={foods}
      candidates={candidates}
      categories={categories}
      restaurants={restaurants}
      home={home}
    />
  );
}
