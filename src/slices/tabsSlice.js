import { createSlice } from '@reduxjs/toolkit';
import infoIcon from '../assets/infoNormal.svg';
import infoActiveIcon from '../assets/infoActive.svg';
import detailsNormal from '../assets/detailsNormal.svg';
import detailsActive from '../assets/detailsActive.svg';
import endingNormal from '../assets/endingNormal.svg';
import endingActive from '../assets/endingActive.svg';

const initialTabs = [
  { id: 1, name: 'Info', icon_normal: infoIcon, icon_active: infoActiveIcon },
  { id: 2, name: 'Details', icon_normal: detailsNormal, icon_active: detailsActive },
  { id: 3, name: 'Other', icon_normal: detailsNormal, icon_active: detailsActive },
  { id: 4, name: 'Ending', icon_normal: endingNormal, icon_active: endingActive },
];

const initialState = {
  tabs: initialTabs,
  activeTabId: initialTabs[0].id,
};

const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    addTab: (state, action) => {
      state.tabs.push(action.payload);
      state.activeTabId = action.payload.id;
    },
    removeTab: (state, action) => {
      state.tabs = state.tabs.filter(tab => tab.id !== action.payload);
      if (state.activeTabId === action.payload) {
        state.activeTabId = state.tabs[0]?.id ?? null;
      }
    },
    setTabs: (state, action) => {
      state.tabs = action.payload;
    },
    reorderTabs: (state, action) => {
      state.tabs = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTabId = action.payload;
    },
    resetTabs: () => initialState,
  },
});

export const { addTab, removeTab, setTabs, resetTabs, reorderTabs, setActiveTab } = tabsSlice.actions;
export default tabsSlice.reducer;
