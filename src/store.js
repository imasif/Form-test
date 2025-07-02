import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import { useDispatch } from 'react-redux'

// Example slice (replace with your own slices)
import tabsReducer from './slices/tabsSlice'

const PERSISTED_STATE_KEY = 'reduxState'

function loadState() {
    try {
        const serializedState = localStorage.getItem(PERSISTED_STATE_KEY)
        if (serializedState === null) return undefined
        return JSON.parse(serializedState)
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
        return undefined
    }
}

function saveState(state) {
    try {
        const serializedState = JSON.stringify(state)
        localStorage.setItem(PERSISTED_STATE_KEY, serializedState)
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
        return undefined
    }
}

const rootReducer = combineReducers({
    tabs: tabsReducer,
})

const preloadedState = loadState()

const store = configureStore({
    reducer: rootReducer,
    preloadedState,
})

store.subscribe(() => {
    saveState(store.getState())
})

export default store
export const useAppDispatch = () => useDispatch()
