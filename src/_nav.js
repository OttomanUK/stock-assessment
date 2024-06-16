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
    name: 'MonteCarloSimulation',
    to: '/MonteCarloSimulation',
    
  },
  {
    component: CNavItem,
    name: 'HardCodedMonteCarlo',
    to: '/HardCodedMonteCarlo',
  
  },
  {
    component: CNavItem,
    name: 'FinalPriceDistribution',
    to: '/FinalPriceDistribution',
  },
 
]

export default _nav
