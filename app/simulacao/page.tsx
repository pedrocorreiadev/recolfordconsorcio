import { Suspense } from "react";

import { SimulationPage } from "@/components/simulation-page";

export default function SimulacaoPage() {
  return (
    <Suspense>
      <SimulationPage />
    </Suspense>
  );
}
