import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/store/auth.slice';
import carsReducer from '../features/cars/store/cars.slice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cars: carsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
