import React from 'react'

const Dashboard = React.lazy(() => import('./views/Front Page/Dashboard'))
const MonteCarloSimulation = React.lazy(() => import('./views/charts/MonteCarloSimulation'))
const HardCodedMonteCarlo = React.lazy(() => import('./views/charts/HardCodedMonteCarlo'))
const FinalPriceDistribution = React.lazy(() => import('./views/charts/FinalPriceDistribution'))
// const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const routes = [
  
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/MonteCarloSimulation', name:'MonteCarloSimulation', element: MonteCarloSimulation},
  { path: '/HardCodedMonteCarlo', name:'HardCodedMonteCarlo', element: HardCodedMonteCarlo},
  { path: '/FinalPriceDistribution', name:'FinalPriceDistribution', element: FinalPriceDistribution}

]

export default routes
