import type { FieldValues, Path, RegisterOptions, UseFormRegister } from 'react-hook-form'

interface InputProps<T extends FieldValues> {
  type: string
  placeholder: string
  name: Path<T>
  register: UseFormRegister<T>
  rules?: RegisterOptions<T, Path<T>>
  error?: string
}

export function Input<T extends FieldValues>({
  type,
  placeholder,
  name,
  register,
  rules,
  error,
}: InputProps<T>) {
  return (
    <div className="w-full">
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border-2 border-gray-300 px-3 outline-none transition-colors focus:border-orange-500"
        {...register(name, rules)}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
