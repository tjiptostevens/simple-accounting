import React from 'react'
import { NavLink } from 'react-router-dom'
import logo from '../assets/img/env.png'
import { useQuery } from '@tanstack/react-query'
import { reqPeriod } from '../reqFetch'
import { useAuth } from '../../context/AuthContext'

const NavItem = ({ to, icon, children }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors no-underline ${isActive
          ? 'bg-primary text-white font-semibold'
          : 'text-app-text opacity-70 hover:opacity-100 hover:bg-app-bg'
        }`
      }
    >
      <i className={`bi ${icon} w-4`}></i>
      {children}
    </NavLink>
  </li>
)

const SectionLabel = ({ children }) => (
  <p className="__subtitle px-4 mt-4 mb-1 text-muted">{children}</p>
)

const SideNav = () => {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const { data: period, isLoading, isError } = useQuery({
    queryKey: ['period'],
    queryFn: reqPeriod,
  })

  if (isLoading) {
    return (
      <div className="__side_nav bg-app-surface p-4 flex flex-col gap-2">
        <span className="text-muted text-xs animate-pulse">Loading…</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="__side_nav bg-app-surface p-4">
        <span className="text-red-400 text-xs">Error loading periods</span>
      </div>
    )
  }

  const activePeriod = period?.find((p) => p.status === 1)

  return (
    <aside className="__side_nav bg-app-surface py-3 flex flex-col gap-1 border-r border-app-border">
      {/* Logo / Brand */}
      <div className="px-4 mb-2 flex items-center gap-2">
        <img src={logo} alt="logo" className="w-6 h-6 rounded" />
        <span className="text-app-text font-bold text-sm">SiApp</span>
      </div>

      {/* Active Period Badge */}
      {activePeriod && (
        <div className="mx-3 mb-2 bg-primary rounded-lg px-3 py-2 text-center shadow-sm">
          <p className="__subtitle text-[10px] text-white opacity-80 mb-0.5">ACTIVE PERIOD</p>
          <NavLink to="/d/period" className="no-underline">
            <span className="text-white text-sm font-semibold">{activePeriod.name}</span>
            {activePeriod.description && (
              <p className="text-white opacity-70 text-[10px] mt-0.5">{activePeriod.description}</p>
            )}
          </NavLink>
        </div>
      )}

      <hr className="border-app-border mx-3" />

      {/* MASTER (admin only) */}
      {isAdmin && (
        <>
          <SectionLabel>MASTER</SectionLabel>
          <ul className="list-none m-0 p-0 px-2 space-y-0.5">
            <NavItem to="/d/company" icon="bi-building">Company</NavItem>
            <NavItem to="/d/chartofaccount" icon="bi-bar-chart-steps">Chart of Account</NavItem>
            <NavItem to="/d/period" icon="bi-calendar3">Period</NavItem>
            <NavItem to="/d/user" icon="bi-person-square">User</NavItem>
            <NavItem to="/d/customer" icon="bi-people">Customer</NavItem>
          </ul>
          <hr className="border-app-border mx-3 mt-2" />
        </>
      )}

      {/* ACTIVITY */}
      <SectionLabel>ACTIVITY</SectionLabel>
      <ul className="list-none m-0 p-0 px-2 space-y-0.5">
        <NavItem to="/d/journal" icon="bi-file-earmark-break">Journal</NavItem>
        <NavItem to="/d/depreciation" icon="bi-graph-down-arrow">Depreciation</NavItem>
      </ul>

      <hr className="border-app-border mx-3 mt-2" />

      {/* REPORT */}
      <SectionLabel>REPORT</SectionLabel>
      <ul className="list-none m-0 p-0 px-2 space-y-0.5">
        <NavItem to="/d/generaljournal" icon="bi-file-earmark-diff">General Journal</NavItem>
        <NavItem to="/d/closingjournal" icon="bi-file-earmark-diff">Closing Journal</NavItem>
        <NavItem to="/d/trialbalance" icon="bi-file-earmark-diff">Adj. Trial Balance</NavItem>
      </ul>

      <hr className="border-app-border mx-3 mt-2" />

      {/* FINANCIAL STATEMENT */}
      <SectionLabel>FINANCIAL STATEMENT</SectionLabel>
      <ul className="list-none m-0 p-0 px-2 space-y-0.5">
        <NavItem to="/d/profitandloss" icon="bi-file-earmark-bar-graph">Profit &amp; Loss</NavItem>
        <NavItem to="/d/equitychange" icon="bi-file-earmark-diff">Equity Change</NavItem>
        <NavItem to="/d/balancesheet" icon="bi-file-earmark-ruled">Balance Sheet</NavItem>
        <NavItem to="/d/cashflow" icon="bi-file-earmark-medical">Cash Flow</NavItem>
      </ul>
    </aside>
  )
}

export default SideNav
