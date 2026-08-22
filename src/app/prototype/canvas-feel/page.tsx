// PROTOTYPE — ticket 02. Three interaction contracts for the canvas, on one route,
// switchable via ?variant=. Throwaway: lives on the proto-02 branch, never on main.
import { Switcher } from "./switcher";
import { VARIANTS, type VariantKey } from "./variants";
import { VariantDirect } from "./variant-direct";
import { VariantLibrary } from "./variant-library";
import { VariantModal } from "./variant-modal";

export const metadata = {
  title: "Prototype — canvas feel",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string }>;
}) {
  const { variant } = await searchParams;
  const key: VariantKey = VARIANTS.some((v) => v.key === variant)
    ? (variant as VariantKey)
    : "direct";

  return (
    <>
      {key === "direct" && <VariantDirect />}
      {key === "library" && <VariantLibrary />}
      {key === "modal" && <VariantModal />}
      <Switcher current={key} />
    </>
  );
}
