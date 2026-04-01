import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Typography, Divider, CircularProgress, Paper,
  Button,
} from "@mui/material";
import { Settings } from "lucide-react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import LocalGasStationOutlinedIcon from "@mui/icons-material/LocalGasStationOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import type { RootState } from "../../../store/store";
import { getCarById, updateCar } from "../store/cars.slice";
import { CarDialog } from "../components/CarsPage/CarDialog";
import type { CarFormValues } from "../components/CarsPage/CarDialog";
import { ImageGallery } from "../components/CarDetail/ImageGallery/ImageGallery";
import { toast } from "react-toastify";
import { InfoRow } from "../components/CarDetail/InfoRow";
import { PageHeader } from "../components/PageHeader/PageHeader";

const getCarImages = (car: { files?: string[]; file?: { fileUrl?: string }[] }): string[] => {
  if (car.files && car.files.length > 0) return car.files.filter(Boolean);
  if (car.file && car.file.length > 0)
    return car.file.map((f) => f.fileUrl ?? "").filter(Boolean);
  return [];
};

export const CarDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const car        = useAppSelector((s: RootState) => s.cars.car);
  const loadingCar = useAppSelector((s: RootState) => s.cars.loadingCar);

  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (id) dispatch(getCarById(id));
  }, [id, dispatch]);

  const handleSubmitEdit = async (data: CarFormValues) => {
    if (!car) return;
    await dispatch(updateCar({ id: car.id, car: { ...data, id: car.id } }))
      .unwrap()
      .then(() => {
        toast.success("Cập nhật xe thành công!");
        setOpenDialog(false);
        dispatch(getCarById(car.id));
      })
      .catch(() => toast.error("Cập nhật thất bại!"));
  };

  if (loadingCar || !car) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const images = getCarImages(car);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", display: "flex", flexDirection: "column" }}>
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
        {/* ── Top bar ── */}
        <PageHeader
          backPath="/cars"
          breadcrumbs={[
            { label: "Quản lý xe", path: "/cars" },
            { label: car.licensePlates },
          ]}
          title="Chi tiết xe"
          actions={
            <>
              <Button
                variant="contained"
                startIcon={<EditOutlinedIcon />}
                onClick={() => setOpenDialog(true)}
                size="medium"
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2,
                  boxShadow: "none",
                  "&:hover": { boxShadow: "none" },
                }}
              >
                Chỉnh sửa
              </Button>
              <Button
                variant="contained"
                startIcon={<Settings />}
                onClick={() => navigate(`/cars/${id}/car-field-setup`)}
                size="medium"
                color="warning"
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2,
                  boxShadow: "none",
                  "&:hover": { boxShadow: "none" },
                }}
              >
                Set up
              </Button>
            </>
          }
        />

        {/* Main card */}
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 2px 12px 0 rgba(0,0,0,0.04)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              minHeight: 520,
            }}
          >
            {/* Gallery column */}
            <Box
              sx={{
                flex: "0 0 55%",
                bgcolor: "grey.50",
                borderRight: { md: "1px solid" },
                borderColor: { md: "divider" },
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {images.length > 0 ? (
                <Box sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
                  <ImageGallery images={images} />
                </Box>
              ) : (
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "text.disabled",
                    gap: 1.5,
                    py: 6,
                  }}
                >
                  <Box
                    sx={{
                      width: 88,
                      height: 88,
                      borderRadius: "50%",
                      bgcolor: "grey.100",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <DirectionsCarOutlinedIcon sx={{ fontSize: 42, color: "grey.300" }} />
                  </Box>
                  <Typography variant="body2" color="text.disabled" fontWeight={500}>
                    Chưa có hình ảnh
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Info column */}
            <Box
              sx={{
                flex: 1,
                p: { xs: 2.5, md: 3.5 },
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ textTransform: "uppercase", letterSpacing: 0.8, fontSize: "0.68rem" }}
                >
                  Thông tin phương tiện
                </Typography>
                <Divider sx={{ mt: 1 }} />
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                <InfoRow
                  icon={<SpeedOutlinedIcon fontSize="small" />}
                  label="Định mức km"
                  value={car.mileageAllowance != null ? `${car.mileageAllowance} km` : "—"}
                />
                <InfoRow
                  icon={<LocalGasStationOutlinedIcon fontSize="small" />}
                  label="Lượng nhiên liệu"
                  value={car.fuelAmount != null ? `${car.fuelAmount} lít` : "—"}
                />
              </Box>

              <InfoRow
                icon={<NotesOutlinedIcon fontSize="small" />}
                label="Ghi chú"
                value={
                  <Typography
                    variant="body2"
                    color={car.note ? "text.primary" : "text.disabled"}
                    fontWeight={car.note ? 600 : 400}
                    sx={{ whiteSpace: "pre-wrap" }}
                  >
                    {car.note || "Không có ghi chú"}
                  </Typography>
                }
              />

              <InfoRow
                icon={<ArticleOutlinedIcon fontSize="small" />}
                label="Nội dung"
                value={
                  <Typography
                    variant="body2"
                    color={car.content ? "text.primary" : "text.disabled"}
                    fontWeight={car.content ? 600 : 400}
                    sx={{ whiteSpace: "pre-wrap" }}
                  >
                    {car.content || "Không có nội dung"}
                  </Typography>
                }
              />
            </Box>
          </Box>
        </Paper>
      </Box>

      <CarDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmitEdit}
        defaultValues={car}
        loading={loadingCar}
      />
    </Box>
  );
};