import { listPlaces, listPlaceWheelCandidates } from "@/server/place-service";
import { listCategories } from "@/server/categories";
import { getSettings } from "@/server/settings-service";
import { PlaceBoard } from "@/components/place/place-board";

export const dynamic = "force-dynamic";

export default async function HomNayChoiDauPage() {
  const [places, candidates, categories, settings] = await Promise.all([
    listPlaces(),
    listPlaceWheelCandidates(),
    listCategories("PLACE"),
    getSettings(),
  ]);

  const home =
    settings.homeLocation != null
      ? { latitude: settings.homeLocation.latitude, longitude: settings.homeLocation.longitude }
      : null;

  return <PlaceBoard places={places} candidates={candidates} categories={categories} home={home} />;
}