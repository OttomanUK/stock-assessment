import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [

  {
    component: CNavTitle,
    name: 'Pages',
  },
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/Dashboard',
  },
  {
    component: CNavItem,
    name: 'Monte Carlo Simulation',
    to: '/MonteCarloSimulation',
    
  },
  {
    component: CNavItem,
    name: 'Stock Monte Carlo',
    to: '/StockMonteCarlo',
  
  },
  {
    component: CNavItem,
    name: 'Final Price Distribution',
    to: '/FinalPriceDistribution',
  },
  {
    component: CNavItem,
    name: 'Geometric Brownian Motion',
    to: '/GeometricBrownianMotion',
  },
  {
    component: CNavItem,
    name: 'Jump Diffusion',
    to: '/JumpDiffusion',
  },
  {
    component: CNavItem,
    name: 'Mean Reversion',
    to: '/MeanReversion',
  },
  {
    component: CNavItem,
    name: 'Portfolio Optimization',
    to: '/Stress-Induced',
  },
 
]

export default _nav
