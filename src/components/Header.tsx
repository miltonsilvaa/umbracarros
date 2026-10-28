import Link from "next/link";
import { Suspense } from "react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Container } from "@/components/Container";

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-center border-b border-gray-200 bg-white">
      <Container>
        <div className="flex w-full items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-gray-900">
              Umbra<span className="text-orange-500">Carros</span>
            </h1>
          </Link>

          <Suspense fallback={<div className="h-9 w-24" />}>
            <Show when="signed-in" fallback={<SignedOutActions />}>
              <UserButton />
            </Show>
          </Suspense>
        </div>
      </Container>
    </header>
  );
}

function SignedOutActions() {
  return (
    <div className="flex items-center gap-4">
      <SignInButton>
        <button className="text-sm font-medium text-gray-700 transition-colors hover:text-orange-500">
          Entrar
        </button>
      </SignInButton>
      <SignUpButton>
        <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600">
          Cadastrar
        </button>
      </SignUpButton>
    </div>
  );
}
