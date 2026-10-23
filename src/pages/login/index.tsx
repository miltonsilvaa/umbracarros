import { zodResolver } from '@hookform/resolvers/zod'
import { FirebaseError } from 'firebase/app'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Container } from '../../components/Container'
import { Input } from '../../components/Input'
import { useAuth } from '../../hooks/useAuth'

const schema = z.object({
  email: z.string().min(1, 'O e-mail é obrigatório').email('Digite um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export function Login() {
  const navigate = useNavigate()
  const { signed, handleLogin } = useAuth()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: 'onChange' })

  useEffect(() => {
    if (signed) navigate('/dashboard', { replace: true })
  }, [signed, navigate])

  async function onSubmit(data: FormData) {
    try {
      await handleLogin(data.email, data.password)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      if (error instanceof FirebaseError) {
        setError('password', { message: 'E-mail ou senha inválidos' })
      }
    }
  }

  return (
    <Container>
      <div className="flex min-h-[80vh] w-full flex-col items-center justify-center gap-4">
        <Link to="/" className="mb-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Web<span className="text-orange-500">Carros</span>
          </h1>
        </Link>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full max-w-xl flex-col gap-4 rounded-lg bg-white p-6 shadow-sm"
        >
          <Input<FormData>
            type="email"
            name="email"
            placeholder="Digite seu e-mail..."
            register={register}
            error={errors.email?.message}
          />
          <Input<FormData>
            type="password"
            name="password"
            placeholder="Digite sua senha..."
            register={register}
            error={errors.password?.message}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-lg bg-orange-500 font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
          >
            Acessar
          </button>
        </form>

        <Link to="/register" className="text-gray-600 transition-colors hover:text-orange-500">
          Ainda não possui uma conta? <span className="font-medium">Cadastre-se</span>
        </Link>
      </div>
    </Container>
  )
}
