import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { CarFormData } from '../../schemas/car'
import { Input } from '../Input'

interface CarFormFieldsProps {
  register: UseFormRegister<CarFormData>
  errors: FieldErrors<CarFormData>
}

export function CarFormFields({ register, errors }: CarFormFieldsProps) {
  return (
    <>
      <Input<CarFormData>
        type="text"
        name="name"
        placeholder="Ex: Honda Civic 2.0 Turbo"
        register={register}
        error={errors.name?.message}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input<CarFormData>
          type="text"
          name="brand"
          placeholder="Marca. Ex: Honda"
          register={register}
          error={errors.brand?.message}
        />
        <Input<CarFormData>
          type="text"
          name="model"
          placeholder="Modelo. Ex: Civic"
          register={register}
          error={errors.model?.message}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input<CarFormData>
          type="text"
          name="year"
          placeholder="Ano. Ex: 2021/2022"
          register={register}
          error={errors.year?.message}
        />
        <Input<CarFormData>
          type="text"
          name="km"
          placeholder="KM rodados. Ex: 35.000"
          register={register}
          error={errors.km?.message}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input<CarFormData>
          type="number"
          name="price"
          placeholder="Preço. Ex: 129000"
          register={register}
          error={errors.price?.message}
        />
        <Input<CarFormData>
          type="text"
          name="city"
          placeholder="Cidade. Ex: São Paulo"
          register={register}
          error={errors.city?.message}
        />
      </div>

      <Input<CarFormData>
        type="text"
        name="whatsapp"
        placeholder="WhatsApp. Ex: 11999999999"
        register={register}
        error={errors.whatsapp?.message}
      />

      <div>
        <textarea
          placeholder="Descrição completa do veículo..."
          className="min-h-32 w-full resize-none rounded-lg border-2 border-gray-300 px-3 py-2 outline-none transition-colors focus:border-orange-500"
          {...register('description')}
        />
        {errors.description?.message && (
          <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>
    </>
  )
}
