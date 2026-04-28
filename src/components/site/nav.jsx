import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/img/env.png'
import { useAuth } from '../../context/AuthContext'
import useWindow from '../useWindow'

const Nav = () => {
  const { width } = useWindow()
  const { signOut, loginUser } = useAuth()

  const handleLogout = async (e) => {
    e.preventDefault()
    await signOut()
  }

  const initial = loginUser?.split('')[0]?.toUpperCase() ?? '?'

  return (
    <div className="w-full bg-[#1c2126] sticky top-0 z-50">
      <div className="max-w-full px-4">
        <nav className="flex items-center justify-between h-12">
          {/* Brand */}
          <Link to="/d" className="flex items-center gap-2 no-underline">
            <img
              src={logo}
              width="24"
              height="24"
              alt="logo"
              className="rounded"
            />
            {width > 450 && (
              <span className="text-white font-bold text-sm">PITARA</span>
            )}
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="__avatar text-white text-xs font-bold">
              {initial}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-gray-300 hover:text-white text-sm transition-colors no-underline bg-transparent border-none cursor-pointer"
            >
              <i className="bi bi-box-arrow-right"></i>
              {width > 450 && <span>Log Out</span>}
            </button>
          </div>
        </nav>
      </div>
    </div>
  )
}

export default Nav

