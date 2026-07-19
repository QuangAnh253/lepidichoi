import { NextResponse } from "next/server";
import { createCafeAction } from "@/actions/cafes";
import { getSettings } from "@/server/settings-service";
import { listCafes, listCafeWheelCandidates } from "@/server/drink-service";
import { listCategories } from "@/server/categories";

export async function GET() {
  try {
    const actionResult = await createCafeAction({
      name: "Test Cafe",
      address: null,
      latitude: null,
      longitude: null,
      imageUrl: null,
      uploadedImageUrl: null,
      menuUrl: null,
      url: null,
      googleMapUrl: null,
      priceRange: null,
      categoryId: null,
      drinks: []
    });
    
    // Simulate what the page does
    const [cafes, candidates, settings, categories] = await Promise.all([
      listCafes(),
      listCafeWheelCandidates(),
      getSettings(),
      listCategories("DRINK"),
    ]);
    
    return NextResponse.json({ success: true, actionResult, cafes: cafes.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
  }
}
