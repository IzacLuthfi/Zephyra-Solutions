'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  console.log("1. Mencoba login dengan:", email)

  // 1. Coba Login
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Login Gagal:", error.message)
    return { error: 'Login gagal: Email atau password salah.' }
  }

  // 2. Ambil User ID
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    console.log("2. Login Berhasil. User ID:", user.id)

    // 3. Ambil Role dari tabel Profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error("3. Gagal ambil profile:", profileError.message)
      // Jika profile error, anggap public
    }

    const role = profile?.role || 'public'
    console.log("4. Role ditemukan di Database:", role)

    // 4. Cek Logika Redirect
    if (role === 'admin') {
      console.log("5. Redirecting to /admin...")
      redirect('/admin')
    } else if (role === 'staff') {
      console.log("5. Redirecting to /staff...")
      redirect('/staff')
    } else if (role === 'hod') {
      console.log("5. Redirecting to /hod...")
      redirect('/hod')
    } else {
      console.log("5. Role tidak dikenali, redirect ke / (Home)")
      redirect('/')
    }
  }

  redirect('/')
}