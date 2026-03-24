import api from "../../../core/services/api.service";
import type { CarPagingParams, CarPagingResponse, CarResponse, CarsListResponse, CreateResponse } from "./cars.type";

export const carService = {
  list: async (): Promise<CarsListResponse[]> => {
    const res = await api.get("/cars/list");
    return res.data;
  },

  getPaging: async (params: CarPagingParams): Promise<CarPagingResponse> => {
    const res = await api.get("/cars", { params });
    return res.data;
  },

  createCar: async (car: CarResponse): Promise<CreateResponse> => {
    const res = await api.post("/cars", {car});
    return res.data;
  },

  updateCar: async (id: string, car: CarResponse): Promise<CreateResponse> => {
    const res = await api.put(`/cars/${id}`, {id, car});
    return res.data;
  },

  deteleCar: async (id: string): Promise<CreateResponse> => {
    const res = await api.delete(`/cars/${id}`);
    return res.data;
  }
};