import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Wordmark } from '@/components/Wordmark'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { useAuth } from '@/context/AuthContext'

export function LoginPage() {
   const { login, loading } = useAuth()
   const navigate = useNavigate()
   const [email, setEmail] = useState('')
   const [password, setPassword] = useState('')
   const [error, setError] = useState('')

   async function handleSubmit(event: FormEvent) {
      event.preventDefault()
      setError('')
      if (!email || !password) {
         setError('Both fields are required')
         return
      }
      try {
         await login(email, password)
         navigate('/')
      } catch {
         setError('Invalid credentials')
      }
   }

   return (
      <div className="min-h-screen lg:grid lg:grid-cols-[1.08fr_0.92fr]">
         <AuthEditorial
            eyebrow="Churn intelligence"
            title={
               <>
                  Read the signal <span className="italic font-light text-ember-400">before</span>
                  <br />
                  the silence.
               </>
            }
            description="A predictive workspace for Retentio teams. Surface the customers most likely to leave, understand why, and act in time to keep them."
         />

         <main className="flex min-h-screen items-center justify-center bg-bone-50 px-6 py-10 lg:min-h-0 lg:px-14">
            <div className="w-full max-w-sm animate-rise">
               <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-900/60">
                  01 · Authenticate
               </span>
               <h1 className="mt-3 font-display text-4xl text-ink-900">Sign in</h1>
               <p className="mt-2 text-sm text-ink-900/60">Access your Retentio workspace.</p>

               <form onSubmit={handleSubmit} className="mt-9 space-y-5">
                  <Field label="Email">
                     <Input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="agent@retentio.com"
                        autoComplete="email"
                     />
                  </Field>
                  <Field label="Password">
                     <Input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                     />
                  </Field>

                  {error && <div className="font-mono text-xs text-rust-500">{error}</div>}

                  <Button type="submit" disabled={loading} variant="primary" className="w-full justify-between">
                     <span>{loading ? 'Signing in...' : 'Continue'}</span>
                     <ArrowRight className="h-4 w-4" />
                  </Button>
               </form>

               <div className="mt-8 border-t border-ink-900/10 pt-6 text-sm text-ink-900/65">
                  New here?{' '}
                  <Link
                     to="/signup"
                     className="text-ink-900 underline decoration-ember-500 decoration-2 underline-offset-4 transition-colors hover:text-ember-600"
                  >
                     Create an account
                  </Link>
               </div>
            </div>
         </main>
      </div>
   )
}

function AuthEditorial({
   eyebrow,
   title,
   description,
}: {
   eyebrow: string
   title: React.ReactNode
   description: string
}) {
   return (
      <aside className="relative hidden overflow-hidden bg-ink-900 px-12 py-10 text-bone-50 lg:flex lg:flex-col xl:px-16">
         <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07]"
            style={{
               backgroundImage:
                  'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
               backgroundSize: '48px 48px',
            }}
         />
         <div aria-hidden className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-ember-500 opacity-30 blur-[120px]" />
         <div className="relative z-10 flex h-full flex-col">
            <Wordmark size="md" variant="light" />
            <div className="flex flex-1 flex-col justify-center">
               <span className="mb-6 font-mono text-[10px] uppercase tracking-[0.3em] text-ember-400">
                  {eyebrow}
               </span>
               <h2 className="max-w-xl text-balance font-display text-5xl leading-[0.96] text-bone-50 xl:text-6xl">
                  {title}
               </h2>
               <p className="mt-7 max-w-md text-base leading-relaxed text-bone-300">{description}</p>
               <div className="mt-12 grid max-w-md grid-cols-3 gap-6">
                  <Stat value="21" label="Features" />
                  <Stat value="0.59" label="Risk threshold" />
                  <Stat value="XGB" label="Model" />
               </div>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone-300/50">
               <div className="rule mb-4 border-bone-50/30 opacity-30" />
               Flask ML · Express API · Better Auth
            </div>
         </div>
      </aside>
   )
}

function Stat({ value, label }: { value: string; label: string }) {
   return (
      <div>
         <div className="font-display text-3xl leading-none text-bone-50 tabular">{value}</div>
         <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-bone-300/70">
            {label}
         </div>
      </div>
   )
}
