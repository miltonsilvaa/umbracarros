"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { carSchema, DEFAULT_CAR_IMAGE_URL, type CarFormInput, type CarFormValues } from "@/lib/validations/car";
import { createCar } from "@/app/dashboard/new/actions";

export function CarForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CarFormInput, unknown, CarFormValues>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      title: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      km: 0,
      price: 0,
      description: "",
      fuel: "",
      color: "",
      city: "",
      whatsapp: "",
      imageUrl: DEFAULT_CAR_IMAGE_URL,
    },
  });

  const onSubmit: SubmitHandler<CarFormValues> = async (values) => {
    setServerError(null);
    const result = await createCar(values);
    if (result?.error) {
      setServerError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Título" error={errors.title?.message}>
          <input {...register("title")} className={inputClass} placeholder="Honda Civic EXL 2.0" />
        </Field>

        <Field label="Marca" error={errors.brand?.message}>
          <input {...register("brand")} className={inputClass} placeholder="Honda" />
        </Field>

        <Field label="Modelo" error={errors.model?.message}>
          <input {...register("model")} className={inputClass} placeholder="Civic" />
        </Field>

        <Field label="Ano" error={errors.year?.message}>
          <input type="number" {...register("year")} className={inputClass} />
        </Field>

        <Field label="KM" error={errors.km?.message}>
          <input type="number" {...register("km")} className={inputClass} />
        </Field>

        <Field label="Preço (R$)" error={errors.price?.message}>
          <input type="number" step="0.01" {...register("price")} className={inputClass} />
        </Field>

        <Field label="Combustível" error={errors.fuel?.message}>
          <input {...register("fuel")} className={inputClass} placeholder="Flex" />
        </Field>

        <Field label="Cor" error={errors.color?.message}>
          <input {...register("color")} className={inputClass} placeholder="Preto" />
        </Field>

        <Field label="Cidade" error={errors.city?.message}>
          <input {...register("city")} className={inputClass} placeholder="São Paulo - SP" />
        </Field>

        <Field label="WhatsApp" error={errors.whatsapp?.message}>
          <input {...register("whatsapp")} className={inputClass} placeholder="11999999999" />
        </Field>
      </div>

      <Field
        label="URL da imagem"
        error={errors.imageUrl?.message}
        hint="Upload de imagem real vem em uma próxima fase — por enquanto, cole um link. Deixamos um placeholder preenchido."
      >
        <input {...register("imageUrl")} className={inputClass} placeholder={DEFAULT_CAR_IMAGE_URL} />
      </Field>

      <Field label="Descrição" error={errors.description?.message}>
        <textarea {...register("description")} rows={4} className={inputClass} />
      </Field>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Salvando..." : "Cadastrar carro"}
      </button>
    </form>
  );
}

const inputClass =
  "h-11 w-full rounded-lg border-2 border-gray-300 px-3 outline-none transition-colors focus:border-orange-500";

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
