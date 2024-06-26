import React from 'react'

const Dashboard = React.lazy(() => import('./views/Front Page/Dashboard'))
const MonteCarloSimulation = React.lazy(() => import('./views/charts/MonteCarloSimulation'))
const HardCodedMonteCarlo = React.lazy(() => import('./views/charts/HardCodedMonteCarlo'))
const FinalPriceDistribution = React.lazy(() => import('./views/charts/FinalPriceDistribution'))
const BrownianMotion = React.lazy(() => import('./views/charts/BrownianMotion'))
const MeanReversion = React.lazy(() => import('./views/charts/MeanReversion'))
const JumpDiffusion = React.lazy(() => import('./views/charts/JumpDiffusion'))
const Bootstrap = React.lazy(() => import('./views/charts/Bootstrap'))
const stressSimulation = React.lazy(() => import('./views/charts/stressSimulation'))

// const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const routes = [
  
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/MonteCarloSimulation', name:'MonteCarloSimulation', element: MonteCarloSimulation},
  { path: '/StockMonteCarlo', name:'HardCodedMonteCarlo', element: HardCodedMonteCarlo},
  { path: '/FinalPriceDistribution', name:'FinalPriceDistribution', element: FinalPriceDistribution},
  { path: '/GeometricBrownianMotion', name:'Geometric Brownian Motion', element: BrownianMotion},
  { path: '/JumpDiffusion', name:'Jump Diffusion', element: JumpDiffusion},
  { path: '/MeanReversion', name:'Mean Reversion', element: MeanReversion},
  { path: '/Bootstrap', name:'Bootstrap', element: Bootstrap},
  { path: '/Stress-Induced', name:'Stress-Induced Market Volatility ', element: stressSimulation},
]

export default routes
