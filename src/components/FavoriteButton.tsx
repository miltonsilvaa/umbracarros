"use client";

import { useOptimistic, useTransition } from "react";
import { toggleFavorite } from "@/lib/favorite-actions";

export function FavoriteButton({
  carId,
  initialFavorited,
  className,
}: {
  carId: string;
  initialFavorited: boolean;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [favorited, setFavorited] = useOptimistic(
    initialFavorited,
    (_state: boolean, next: boolean) => next,
  );

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    startTransition(async () => {
      setFavorited(!favorited);
      await toggleFavorite(carId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow transition-transform hover:scale-110 disabled:opacity-70 ${className ?? ""}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-5 w-5 ${favorited ? "fill-orange-500 stroke-orange-500" : "fill-none stroke-gray-500"}`}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20.25c-.3 0-.59-.1-.82-.3C7.1 16.5 3.75 13.52 3.75 9.75 3.75 7.13 5.88 5 8.5 5c1.5 0 2.84.73 3.5 1.88C12.66 5.73 14 5 15.5 5c2.62 0 4.75 2.13 4.75 4.75 0 3.77-3.35 6.75-7.43 10.2-.23.2-.52.3-.82.3Z"
        />
      </svg>
    </button>
  );
}
