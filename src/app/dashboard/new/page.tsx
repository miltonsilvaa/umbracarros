import { Container } from "@/components/Container";
import { CarForm } from "@/components/CarForm";

export default function NewCarPage() {
  return (
    <Container>
      <div className="mx-auto my-8 max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Cadastrar novo carro</h1>
        <CarForm />
      </div>
    </Container>
  );
}
