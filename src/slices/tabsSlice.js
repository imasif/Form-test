import { createSlice } from '@reduxjs/toolkit';
import infoIcon from '../assets/infoNormal.svg';
import infoActiveIcon from '../assets/infoActive.svg';
import detailsNormal from '../assets/detailsNormal.svg';
import detailsActive from '../assets/detailsActive.svg';
import endingNormal from '../assets/endingNormal.svg';
import endingActive from '../assets/endingActive.svg';

const initialState = [
  { id: 1, name: 'Info', icon_normal: infoIcon, icon_active: infoActiveIcon,
  },
  { id: 2, name: 'Details', icon_normal: detailsNormal, icon_active: detailsActive },
  { id: 3, name: 'Other', icon_normal: detailsNormal, icon_active: detailsActive },
  { id: 4, name: 'Ending', icon_normal: endingNormal, icon_active: endingActive },
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
