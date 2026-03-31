import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { carService } from "../services/cars.service";
import type {
  CarFormValues,
  CarPagingParams,
  CarPagingResponse,
  CarResponse,
  CarsListResponse,
  GetCarByIDRespone,
} from "../services/cars.type";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchCarList = createAsyncThunk<CarsListResponse[]>(
  "cars/fetchList",
  async () => carService.list()
);

export const fetchCars = createAsyncThunk<CarPagingResponse, CarPagingParams>(
  "cars/fetchCars",
  async (params) => carService.getPaging(params)
);

export const createCar = createAsyncThunk<CarFormValues, CarFormValues>(
  "cars/createCar",
  async (car) => {
    await carService.createCar(car);
    return car;
  }
);

// updateCar nhận CarFormValues (có files mới) thay vì CarResponse
export const updateCar = createAsyncThunk<
  void,
  { id: string; car: CarFormValues }
>("cars/updateCar", async ({ id, car }) => {
  await carService.updateCar(id, car);
});

export const deleteCar = createAsyncThunk<void, string>(
  "cars/deleteCar",
  async (id) => {
    await carService.deleteCar(id);
  }
);

export const getCarById = createAsyncThunk<GetCarByIDRespone, string>(
  "cars/getCarById",
  async (id) => {
    const res = await carService.getCarById(id);
    return res;
  }
);

// ─── State ────────────────────────────────────────────────────────────────────

interface CarsState {
  list: CarsListResponse[];
  loading: boolean;
  loaded: boolean;

  cars: CarResponse[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  loadingCars: boolean;

  car: CarResponse | null;
  loadingCar: boolean;
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

  car: null,
  loadingCar: false,
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
    resetCar(state) {
      state.car = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchCarList ──
      .addCase(fetchCarList.pending, (state) => { state.loading = true; })
      .addCase(fetchCarList.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded  = true;
        state.list    = action.payload;
      })
      .addCase(fetchCarList.rejected, (state) => { state.loading = false; })

      // ── fetchCars ──
      .addCase(fetchCars.pending, (state) => { state.loadingCars = true; })
      .addCase(fetchCars.fulfilled, (state, action) => {
        state.loadingCars = false;
        state.cars        = action.payload.data;
        state.totalItems  = action.payload.totalItems;
        state.currentPage = action.payload.currentPage;
        state.pageSize    = action.payload.pageSize;
      })
      .addCase(fetchCars.rejected, (state) => { state.loadingCars = false; })

      // ── createCar ──
      .addCase(createCar.pending, (state) => { state.loadingCars = true; })
      .addCase(createCar.fulfilled, (state, action) => {
        state.loadingCars = false;
        const newCar: CarResponse = {
          ...action.payload,
          id: crypto.randomUUID(),
          file: [], // ảnh thực sẽ có sau khi refetch
        };
        state.cars.push(newCar);
        state.totalItems += 1;
        state.list.push({
          id: newCar.id,
          licensePlates: newCar.licensePlates,
          note: newCar.note,
        });
      })
      .addCase(createCar.rejected, (state) => { state.loadingCars = false; })

      // ── updateCar ──
      .addCase(updateCar.pending, (state) => { state.loadingCars = true; })
      .addCase(updateCar.fulfilled, (state, action) => {
        state.loadingCars = false;
        const { id, car: updatedCar } = action.meta.arg;
        const index = state.cars.findIndex((c) => c.id === id);
        if (index !== -1) {
          // Giữ lại existingFiles (ảnh cũ) vào field file
          state.cars[index] = {
            ...state.cars[index],
            ...updatedCar,
            file: updatedCar.existingFiles ?? state.cars[index].file,
          };
        }
        const listIndex = state.list.findIndex((c) => c.id === id);
        if (listIndex !== -1) {
          state.list[listIndex] = {
            id,
            licensePlates: updatedCar.licensePlates,
            note: updatedCar.note,
          };
        }
      })
      .addCase(updateCar.rejected, (state) => { state.loadingCars = false; })

      // ── deleteCar ──
      .addCase(deleteCar.pending, (state) => { state.loadingCars = true; })
      .addCase(deleteCar.fulfilled, (state, action) => {
        state.loadingCars = false;
        const deletedId = action.meta.arg;
        state.cars       = state.cars.filter((c) => c.id !== deletedId);
        state.list       = state.list.filter((c) => c.id !== deletedId);
        state.totalItems -= 1;
      })
      .addCase(deleteCar.rejected, (state) => { state.loadingCars = false; })

      // ── getCarById ──
      .addCase(getCarById.pending, (state) => { state.loadingCar = true; })
      .addCase(getCarById.fulfilled, (state, action) => {
        state.loadingCar = false;
        state.car = action.payload.car ?? null;
      })
      .addCase(getCarById.rejected, (state) => { state.loadingCar = false; })

  },
});

export const { resetCarList, resetCars } = carsSlice.actions;
export default carsSlice.reducer;