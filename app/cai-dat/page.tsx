import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataPortability } from "@/components/food/data-portability";
import { SettingsForm } from "@/components/settings/settings-form";
import { getSettings } from "@/server/settings-service";

// Trang luôn cần dữ liệu Settings mới nhất (2 người có thể sửa từ 2 máy
// khác nhau) — giống cách /hom-nay-an-gi dùng force-dynamic.
export const dynamic = "force-dynamic";

export default async function CaiDatPage() {
  const settings = await getSettings();

  return (
    <div className="container max-w-xl py-16 sm:py-24">
      <h1 className="font-display text-3xl">Cài đặt</h1>
      <p className="mt-2 text-muted-foreground">Vài thứ nhỏ, không cần nhiều hơn thế.</p>

      <div className="mt-10">
        <SettingsForm settings={settings} />

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Dữ liệu món ăn</CardTitle>
            <CardDescription>
              Xuất ra để sao lưu, hoặc nhập vào từ một tệp JSON đã có.
            </CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <DataPortability />
          </div>
        </Card>
      </div>
    </div>
  );
}
