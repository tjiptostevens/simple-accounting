import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { reqCompany } from '../reqFetch'

const Login = () => {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const { data: company, isLoading, isError } = useQuery({
    queryKey: ['company'],
    queryFn: reqCompany,
  })

  const [form, setForm] = useState({ email: '', password: '' })
  const [msg, setMsg]   = useState('')
  const [busy, setBusy] = useState(false)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    try {
      await signIn(form.email, form.password)
      navigate('/d', { replace: true })
    } catch (err) {
      setMsg(err.message ?? 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#161a1f]">
        <span className="text-green-400 animate-pulse">Loading…</span>
      </div>
    )
  }

  const comp = company?.[0]

  return (
    <div className="min-h-screen bg-[#161a1f] flex flex-col items-center justify-center px-4">
      {/* Card */}
      <div className="w-full max-w-md bg-[#1c2126] rounded-xl shadow-2xl overflow-hidden">
        {/* Header banner */}
        <div className="bg-green-600 px-8 py-5 text-center">
          <img
            src="/assets/img/logo192.png"
            alt="logo"
            className="w-16 h-16 mx-auto mb-2 rounded-full"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <h1 className="text-white text-xl font-bold">
            {comp?.name ?? 'Simple Accounting'}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
          <h2 className="text-white text-lg font-semibold text-center">Sign In</h2>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-400 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full bg-[#212529] border border-[#2d3340] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-[#212529] border border-[#2d3340] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition"
            />
          </div>

          {/* Error message */}
          {msg && (
            <p className="text-red-400 text-sm text-center">{msg}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm transition"
          >
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Footer info */}
        {comp && (
          <div className="px-8 pb-6 text-xs text-gray-500 space-y-0.5 border-t border-[#2d3340] pt-4">
            {comp.address && <p>{comp.address.replace(/<br ?\/?>/g, ' ')}, {comp.city}</p>}
            {comp.phone   && <p>Phone: {comp.phone}</p>}
            {comp.email   && <p>Email: {comp.email}</p>}
          </div>
        )}

        <p className="text-center text-gray-600 text-xs pb-4">
          © {new Date().getFullYear()} Simple Accounting — open source
        </p>
      </div>
    </div>
  )
}

export default Login

