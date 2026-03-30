import api from '../../../core/services/api.service';
import type { Car, RoadRoute, DriverRouter, FleetFilterParams } from './fleet.types';

export const fleetService = {
    // Car Management
    getCars: async (params?: FleetFilterParams) => {
        const response = await api.get('/Cars', { params });
        return response.data;
    },
    getCarList: async () => {
        const response = await api.get('/Cars/list');
        return response.data;
    },
    getCarById: async (id: number) => {
        const response = await api.get(`/Cars/${id}`);
        return response.data;
    },
    createCar: async (data: Partial<Car>) => {
        const response = await api.post('/Cars', data);
        return response.data;
    },
    updateCar: async (id: number, data: Partial<Car>) => {
        const response = await api.put(`/Cars/${id}`, data);
        return response.data;
    },
    deleteCar: async (id: number) => {
        const response = await api.delete(`/Cars/${id}`);
        return response.data;
    },
    getCarFieldSetup: async (carId: number) => {
        const response = await api.get(`/Cars/car-field-setup?carId=${carId}`);
        return response.data;
    },
    updateCarFieldSetup: async (carId: number, carFieldSetups: any[]) => {
        const response = await api.put(`/Cars/car-field-setup?carId=${carId}`, carFieldSetups);
        return response.data;
    },

    // Car Fleets
    getCarFleets: async (params?: FleetFilterParams) => {
        const response = await api.get('/CarFleets', { params });
        return response.data;
    },
    getCarFleetList: async () => {
        const response = await api.get('/CarFleets/list');
        return response.data;
    },
    createCarFleet: async (data: any) => {
        const response = await api.post('/CarFleets', data);
        return response.data;
    },
    updateCarFleet: async (id: number, data: any) => {
        const response = await api.put(`/CarFleets/${id}`, data);
        return response.data;
    },
    deleteCarFleet: async (id: number) => {
        const response = await api.delete(`/CarFleets/${id}`);
        return response.data;
    },

    // Road Routes
    getRoadRoutes: async (params?: FleetFilterParams) => {
        const response = await api.get('/RoadRoutes', { params });
        return response.data;
    },
    getRoadRouteDetail: async (id: number) => {
        const response = await api.get(`/RoadRoutes/${id}`);
        return response.data;
    },
    createRoadRoute: async (data: Partial<RoadRoute>) => {
        const response = await api.post('/RoadRoutes', data);
        return response.data;
    },
    updateRoadRoute: async (id: number, data: Partial<RoadRoute>) => {
        const response = await api.put(`/RoadRoutes/${id}`, data);
        return response.data;
    },
    deleteRoadRoute: async (id: number) => {
        const response = await api.delete(`/RoadRoutes/${id}`);
        return response.data;
    },

    // Driver Routers
    getDriverRouters: async (params?: FleetFilterParams) => {
        const response = await api.get('/DriverRouters', { params });
        return response.data;
    },
    getDriverRouterDetail: async (id: number) => {
        const response = await api.get(`/DriverRouters/${id}`);
        return response.data;
    },
    startDriverRouter: async (petrolConsumptionId: number) => {
        const response = await api.post(`/DriverRouters/start?petrolConsumptionId=${petrolConsumptionId}`);
        return response.data;
    },
    finishDriverRouter: async (petrolConsumptionId: number) => {
        const response = await api.post(`/DriverRouters/finish?petrolConsumptionId=${petrolConsumptionId}`);
        return response.data;
    },
    updateDriverRouter: async (id: number, data: Partial<DriverRouter>) => {
        const response = await api.put(`/DriverRouters/${id}`, data);
        return response.data;
    },
    deleteDriverRouter: async (id: number) => {
        const response = await api.delete(`/DriverRouters/${id}`);
        return response.data;
    },
    getPoliceCheckPoints: async (id: number) => {
        const response = await api.get(`/DriverRouters/list/police-point/${id}`);
        return response.data;
    },

    // Petrol Consumption
    getPetrolConsumptions: async (params?: FleetFilterParams) => {
        const response = await api.get('/PetrolConsumptions', { params });
        return response.data;
    },
    createPetrol: async (data: any) => {
        const response = await api.post('/PetrolConsumptions', data);
        return response.data;
    },
    updatePetrol: async (id: number, data: any) => {
        const response = await api.put(`/PetrolConsumptions/${id}`, data);
        return response.data;
    },
    deletePetrol: async (id: number) => {
        const response = await api.delete(`/PetrolConsumptions/${id}`);
        return response.data;
    },

    // Police Points
    getPoints: async (params?: FleetFilterParams) => {
        const response = await api.get('/PoliceCheckPoints', { params });
        return response.data;
    },
    createPoint: async (data: any) => {
        const response = await api.post('/PoliceCheckPoints', data);
        return response.data;
    },
    updatePoint: async (id: number, data: any) => {
        const response = await api.put(`/PoliceCheckPoints/${id}`, data);
        return response.data;
    },
    deletePoint: async (id: number) => {
        const response = await api.delete(`/PoliceCheckPoints/${id}`);
        return response.data;
    }
};
