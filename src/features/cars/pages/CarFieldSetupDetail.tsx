import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { PageHeader } from "../components/PageHeader/PageHeader";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import type { RootState } from "../../../store/store";
import { useEffect } from "react";
import { getCarFieldSetup } from "../store/cars.slice";
import { CarFieldSetupList } from "../components/CarFieldSetupDetail/CarFieldSetupList";

export const CarFieldSetupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const car = useAppSelector((s: RootState) => s.cars.car);
  const dispatch = useAppDispatch();


  useEffect(() => {
    if (id) {
      dispatch(getCarFieldSetup(id));
    }
  }, [id, dispatch]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.50",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flex: 1,
          px: { xs: 2, md: 4 },
          py: { xs: 2, md: 0 },
          maxWidth: 1280,
          width: "100%",
          mx: "auto",
          boxSizing: "border-box",
        }}
      >
        <PageHeader
          backPath={`/cars/${id}`}
          breadcrumbs={[
            { label: "Quản lý xe", path: "/cars" },
            { label: `${car?.licensePlates}`, path: `/cars/${id}` },
            { label: "Set up" },
          ]}
          title="Cài đặt trường dữ liệu"
          
        />

        <Box>
          <CarFieldSetupList
          />
        </Box>
      </Box>

      
    </Box>
  );
};