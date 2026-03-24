import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { carService } from "../services/cars.service";
import type { CarPagingParams, CarPagingResponse, CarResponse, CarsListResponse } from "../services/cars.type";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchCarList = createAsyncThunk<CarsListResponse[]>(
  "cars/fetchList",
  async () => carService.list()
);

// Nhận params từ component để hỗ trợ server-side pagination & search
export const fetchCars = createAsyncThunk<CarPagingResponse, CarPagingParams>(
  "cars/fetchCars",
  async (params) => carService.getPaging(params)
);

export const createCar = createAsyncThunk<void, CarResponse>(
  "cars/createCar",
  async (car) => {
    await carService.createCar(car);
  }
)

export const updateCar = createAsyncThunk<void, { id: string; car: CarResponse }>(
  "cars/updateCar",
  async ({ id, car }) => {
    await carService.updateCar(id, car);
  }
)

export const deleteCar = createAsyncThunk<void, string>(
  "cars/deleteCar",
  async (id) => {
    await carService.deteleCar(id);
  }
)
// ─── State ────────────────────────────────────────────────────────────────────

interface CarsState {
  // dropdown
  list: CarsListResponse[];
  loading: boolean;
  loaded: boolean;

  // table
  cars: CarResponse[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  loadingCars: boolean;
}

const initialState: CarsState = {
  list: [],
  loading: false,
  loaded: false,

  cars: [],
  totalItems: 0,
  currentPage: 1,
  pageSize: 10,
  loadingCars: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const carsSlice = createSlice({
  name: "cars",
  initialState,
  reducers: {
    resetCarList(state) {
      state.list = [];
      state.loaded = false;
    },
    resetCars(state) {
      state.cars = [];
      state.totalItems = 0;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchCarList (dropdown) ──
      .addCase(fetchCarList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCarList.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.list = action.payload;
      })
      .addCase(fetchCarList.rejected, (state) => {
        state.loading = false;
      })

      // ── fetchCars (table) ──
      .addCase(fetchCars.pending, (state) => {
        state.loadingCars = true;
      })
      .addCase(fetchCars.fulfilled, (state, action) => {
        state.loadingCars = false;
        state.cars        = action.payload.data;
        state.totalItems  = action.payload.totalItems;
        state.currentPage = action.payload.currentPage;
        state.pageSize    = action.payload.pageSize;
      })
      .addCase(fetchCars.rejected, (state) => {
        state.loadingCars = false;
      })

      // ─ createCar & updateCar ─
      .addCase(createCar.pending, (state) => {
        state.loadingCars = true;
      })
      .addCase(createCar.fulfilled, (state, action) => {
        state.loadingCars = false;

        const newCar = action.meta.arg; 
        state.cars.push(newCar);

        state.totalItems += 1; // Tăng tổng số xe lên 1
      })
      .addCase(createCar.rejected, (state) => {
        state.loadingCars = false;
      })
      .addCase(updateCar.pending, (state) => {
        state.loadingCars = true;
      })
      .addCase(updateCar.fulfilled, (state, action) => {
        state.loadingCars = false;

        const updatedCar = action.meta.arg; // data FE gửi
        const index = state.cars.findIndex(car => car.id === updatedCar.id);

        if (index !== -1) {
          state.cars[index] = {
            ...state.cars[index],
            ...updatedCar
          };
        }
      })
      .addCase(updateCar.rejected, (state) => {
        state.loadingCars = false;
      })
      .addCase(deleteCar.pending, (state) => {
        state.loadingCars = true;
      })
      .addCase(deleteCar.fulfilled, (state, action) => {
        state.loadingCars = false;
        const deletedId = action.meta.arg; // id của xe bị xóa
        state.cars = state.cars.filter(car => car.id !== deletedId);
        state.totalItems -= 1; // Giảm tổng số xe đi 1
      })
      .addCase(deleteCar.rejected, (state) => {
        state.loadingCars = false;
      })
  },
});

export const { resetCarList, resetCars } = carsSlice.actions;
export default carsSlice.reducer;