import { redirect } from 'next/navigation'

// X OAuth handles both signup and signin, so redirect to login
export default function SignupPage() {
  redirect('/login')
}
