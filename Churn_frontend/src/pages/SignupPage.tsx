import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Wordmark } from '@/components/Wordmark'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { useAuth } from '@/context/AuthContext'

export function SignupPage() {
   const { signup, loading } = useAuth()
   const navigate = useNavigate()
   const [name, setName] = useState('')
   const [email, setEmail] = useState('')
   const [password, setPassword] = useState('')
   const [confirm, setConfirm] = useState('')
   const [error, setError] = useState('')

   async function handleSubmit(event: FormEvent) {
      event.preventDefault()
      setError('')
      if (!name || !email || !password) {
         setError('All fields are required')
         return
      }
      if (password.length < 6) {
         setError('Password must be at least 6 characters')
         return
      }
      if (password !== confirm) {
         setError('Passwords do not match')
         return
      }
      try {
         await signup(name, email, password)
         navigate('/')
      } catch {
         setError('Something went wrong')
      }
   }

   return (
      <div className="min-h-screen lg:grid lg:grid-cols-[0.92fr_1.08fr]">
         <main className="flex min-h-screen items-center justify-center bg-bone-50 px-6 py-10 lg:min-h-0 lg:px-14">
            <div className="w-full max-w-sm animate-rise">
               <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-900/60">
                  01 · Create account
               </span>
               <h1 className="mt-3 font-display text-4xl text-ink-900">Join Retentio</h1>
               <p className="mt-2 text-sm text-ink-900/60">Start protecting your subscriber base.</p>

               <form onSubmit={handleSubmit} className="mt-9 space-y-5">
                  <Field label="Full name">
                     <Input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
                  </Field>
                  <Field label="Email">
                     <Input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                     />
                  </Field>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                     <Field label="Password">
                        <Input
                           type="password"
                           value={password}
                           onChange={(event) => setPassword(event.target.value)}
                           autoComplete="new-password"
                        />
                     </Field>
                     <Field label="Confirm">
                        <Input
                           type="password"
                           value={confirm}
                           onChange={(event) => setConfirm(event.target.value)}
                           autoComplete="new-password"
                        />
                     </Field>
                  </div>

                  {error && <div className="font-mono text-xs text-rust-500">{error}</div>}

                  <Button type="submit" disabled={loading} variant="primary" className="w-full justify-between">
                     <span>{loading ? 'Creating...' : 'Create account'}</span>
                     <ArrowRight className="h-4 w-4" />
                  </Button>
               </form>

               <div className="mt-8 border-t border-ink-900/10 pt-6 text-sm text-ink-900/65">
                  Already have an account?{' '}
                  <Link
                     to="/login"
                     className="text-ink-900 underline decoration-ember-500 decoration-2 underline-offset-4 transition-colors hover:text-ember-600"
                  >
                     Sign in
                  </Link>
               </div>
            </div>
         </main>

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
            <div aria-hidden className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-moss-500 opacity-30 blur-[120px]" />
            <div className="relative z-10 flex h-full flex-col">
               <Wordmark size="md" variant="light" />
               <div className="flex flex-1 flex-col justify-center">
                  <span className="mb-6 font-mono text-[10px] uppercase tracking-[0.3em] text-moss-400">
                     Built for retention teams
                  </span>
                  <h2 className="max-w-xl text-balance font-display text-5xl leading-[0.96] text-bone-50 xl:text-6xl">
                     Every customer <span className="italic font-light text-moss-400">has</span> a story.
                     <br />
                     We help you finish it.
                  </h2>
                  <ol className="mt-10 max-w-md space-y-5">
                     {[
                        ['01', 'Ingest', 'Customer records flow through the Express API.'],
                        ['02', 'Predict', 'The Flask XGBoost service scores churn risk.'],
                        ['03', 'Act', 'Teams open cases, log outreach, and track offers.'],
                     ].map(([n, t, d]) => (
                        <li key={n} className="flex items-start gap-5">
                           <span className="mt-1 font-mono text-xs text-moss-400">{n}</span>
                           <div>
                              <div className="font-display text-xl text-bone-50">{t}</div>
                              <div className="mt-0.5 text-sm text-bone-300/80">{d}</div>
                           </div>
                        </li>
                     ))}
                  </ol>
               </div>
               <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone-300/50">
                  <div className="rule mb-4 border-bone-50/30 opacity-30" />
                  Powered by Flask · Express · React Vite
               </div>
            </div>
         </aside>
      </div>
   )
}
