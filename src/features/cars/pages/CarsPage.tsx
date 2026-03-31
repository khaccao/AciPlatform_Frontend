import { Button, Box } from "@mui/material";
import { ListCars } from "../components/ListCars";
import { CarDialog } from "../components/CarDialog";
import { useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { createCar, updateCar } from "../store/cars.slice";
import type { CarFormValues } from "../components/CarDialog";
import type { CarResponse } from "../services/cars.type";
import { CarDropdown } from "../components/CarDropDown";
import { toast } from "react-toastify";

export const CarsPage = () => {
  const dispatch = useAppDispatch();

  const [openDialog, setOpenDialog]   = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarResponse | undefined>(undefined);

  const handleOpenCreate = () => {
    setSelectedCar(undefined);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedCar(undefined);
  };

  const handleCarSubmit = async (data: CarFormValues) => {
    if (selectedCar) {
      await dispatch(updateCar({ id: selectedCar.id, car: { ...data, id: selectedCar.id } }))
        .unwrap()
        .then(() => {
          toast.success("Cập nhật xe thành công!");
          handleClose();
        });
    } else {
      await dispatch(createCar(data))
        .unwrap()
        .then(() => {
          toast.success("Thêm xe thành công!");
          handleClose();
        });
    }
  };

  const handleOnChange = () => {};

  const handleOpenEdit = (car: CarResponse) => {
    setSelectedCar(car);
    setOpenDialog(true);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          gap: "10px",
          width: "100%",
          px: 3,
        }}
      >
        <Button onClick={handleOpenCreate} variant="contained">
          Thêm xe mới
        </Button>
        <CarDropdown onChange={handleOnChange} />
      </Box>

      <ListCars onEditCar={handleOpenEdit} />

      <CarDialog
        open={openDialog}
        onClose={handleClose}
        onSubmit={handleCarSubmit}
        defaultValues={selectedCar}
      />
    </Box>
  );
};