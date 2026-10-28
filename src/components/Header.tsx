import Link from "next/link";
import { Container } from "@/components/Container";

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-center border-b border-gray-200 bg-white">
      <Container>
        <Link href="/">
          <h1 className="text-2xl font-bold text-gray-900">
            Umbra<span className="text-orange-500">Carros</span>
          </h1>
        </Link>
      </Container>
    </header>
  );
}
