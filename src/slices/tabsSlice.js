import { createSlice } from '@reduxjs/toolkit';

const initialState = [
  { id: 1, name: 'Info' },
  { id: 2, name: 'Details' },
  { id: 3, name: 'Other' },
  { id: 4, name: 'Ending' },
];

const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    addTab: (state, action) => {
      state.push(action.payload);
    },
    removeTab: (state, action) => {
      return state.filter(tab => tab.id !== action.payload);
    },
    setTabs: (state, action) => {
      return action.payload;
    },
    reorderTabs: (state, action) => {
      // action.payload should be the new ordered array of tabs
      return action.payload;
    },
    resetTabs: () => initialState,
  },
});

export const { addTab, removeTab, setTabs, resetTabs, reorderTabs } = tabsSlice.actions;
export default tabsSlice.reducer;
