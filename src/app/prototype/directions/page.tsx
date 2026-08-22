// PROTOTYPE — ticket 01. Three visual directions on one route, switchable via ?variant=.
// Throwaway: lives on the proto-01 branch, never on main.
import { Switcher } from "./switcher";
import { VARIANTS, type VariantKey } from "./variants";
import { VariantExchange } from "./variant-exchange";
import { VariantPlot } from "./variant-plot";
import { VariantStage } from "./variant-stage";

export const metadata = {
  title: "Prototype — visual directions",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string }>;
}) {
  const { variant } = await searchParams;
  const key: VariantKey = VARIANTS.some((v) => v.key === variant)
    ? (variant as VariantKey)
    : "exchange";

  return (
    <>
      {key === "exchange" && <VariantExchange />}
      {key === "plot" && <VariantPlot />}
      {key === "stage" && <VariantStage />}
      <Switcher current={key} />
    </>
  );
}
