import { Button, Box, Typography } from "@mui/material";
import { ListCars } from "../components/CarsPage/ListCars";
import { CarDialog } from "../components/CarsPage/CarDialog";
import { useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { createCar, updateCar } from "../store/cars.slice";
import type { CarFormValues } from "../components/CarsPage/CarDialog";
import type { CarResponse } from "../services/cars.type";
import { toast } from "react-toastify";
import { CarsFilter } from "../components/CarsPage/CarsFilter";

export const CarsPage = () => {
  const dispatch = useAppDispatch();

  const [openDialog, setOpenDialog]   = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarResponse | undefined>(undefined);
  const [searchText, setSearchText]   = useState("");

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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* ── Header (không scroll) ── */}
      <Box
        sx={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Danh sách xe
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Quản lý toàn bộ phương tiện
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <CarsFilter searchText={searchText} onSearchChange={setSearchText} />
          <Button
            onClick={handleOpenCreate}
            variant="contained"
            size="medium"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 1.5,
              boxShadow: "none",
              "&:hover": { boxShadow: "none" },
            }}
          >
            + Thêm xe mới
          </Button>
        </Box>
      </Box>

      {/* ── List (scroll được) ── */}
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        <ListCars searchText={searchText} />
      </Box>

      <CarDialog
        open={openDialog}
        onClose={handleClose}
        onSubmit={handleCarSubmit}
        defaultValues={selectedCar}
      />
    </Box>
  );
};