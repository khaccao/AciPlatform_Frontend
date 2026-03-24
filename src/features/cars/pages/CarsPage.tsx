import { Button } from "@mui/material";
import { ListCars } from "../components/ListCars";
import { CarDialog } from "../components/CarDialog";
import { useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { createCar } from "../store/cars.slice";
import type { CarFormValues } from "../components/CarDialog";
import type { CarResponse } from "../services/cars.type";

export const CarsPage = () => {
  const dispatch = useAppDispatch();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarResponse | undefined>(undefined);

  // Mở dialog tạo mới
  const handleOpenCreate = () => {
    setSelectedCar(undefined);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedCar(undefined);
  };

  const handleSubmit = (data: CarFormValues) => {
    dispatch(createCar(data as CarResponse));
    handleClose();
  };

  return (
    <>
      <Button onClick={handleOpenCreate} variant="contained">Thêm xe mới</Button>
      <ListCars/>
      <CarDialog
        open={openDialog}
        onClose={handleClose}
        onSubmit={handleSubmit}
        defaultValues={selectedCar}
      />
    </>
  );
};