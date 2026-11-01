"use client";

import { useState, useTransition } from "react";
import { createCheckoutSession } from "@/lib/checkout-actions";

export function ReserveButton({ carId, className }: { carId: string; className?: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);

    startTransition(async () => {
      const result = await createCheckoutSession(carId);

      if ("error" in result) {
        setError(result.error);
        return;
      }

      window.location.href = result.url;
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`inline-block rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-70 ${className ?? ""}`}
      >
        {isPending ? "Redirecionando..." : "Reservar"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
