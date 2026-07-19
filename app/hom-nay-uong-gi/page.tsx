import { listCafes, listCafeWheelCandidates } from "@/server/drink-service";
import { getSettings } from "@/server/settings-service";
import { listCategories } from "@/server/categories";
import { CafeBoard } from "@/components/drink/cafe-board";

export const dynamic = "force-dynamic";

export default async function HomNayUongGiPage() {
  const [cafes, candidates, settings, categories] = await Promise.all([
    listCafes(),
    listCafeWheelCandidates(),
    getSettings(),
    listCategories("DRINK"),
  ]);

  const home =
    settings.homeLocation != null
      ? { latitude: settings.homeLocation.latitude, longitude: settings.homeLocation.longitude }
      : null;

  return <CafeBoard cafes={cafes} candidates={candidates} categories={categories} home={home} />;
}