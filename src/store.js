import { legacy_createStore as createStore } from 'redux'

// Function to load processedData from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('processedData')
    if (serializedState === null) {
      return null
    }
    return JSON.parse(serializedState)
  } catch (err) {
    console.error('Could not load state', err)
    return null
  }
}

// Function to save processedData to localStorage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state.processedData)
    localStorage.setItem('processedData', serializedState)
  } catch (err) {
    console.error('Could not save state', err)
  }
}

const initialState = {
  sidebarShow: true,
  processedData: null,
  theme: 'light',
}

const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      const newState = { ...state, ...rest }
      return newState
    default:
      return state
  }
}

const store = createStore(changeState)
export default store
