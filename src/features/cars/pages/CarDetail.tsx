import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Typography, Divider, CircularProgress, Paper,
  Button,
  IconButton,
} from "@mui/material";
import { ArrowLeft } from "lucide-react";
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
import { CarDialog } from "../components/CarDialog";
import type { CarFormValues } from "../components/CarDialog";
import { ImageGallery } from "../components/ImageGallery/ImageGallery";
import { toast } from "react-toastify";

const getCarImages = (car: { files?: string[]; file?: { fileUrl?: string }[] }): string[] => {
  if (car.files && car.files.length > 0) return car.files.filter(Boolean);
  if (car.file && car.file.length > 0)
    return car.file.map((f) => f.fileUrl ?? "").filter(Boolean);
  return [];
};

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      gap: 2,
      p: 2,
      borderRadius: 1.5,
      bgcolor: "grey.50",
      border: "1px solid",
      borderColor: "grey.100",
    }}
  >
    <Box
      sx={{
        mt: 0.1,
        color: "primary.main",
        opacity: 0.75,
        flexShrink: 0,
        display: "flex",
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        fontWeight={500}
        letterSpacing={0.4}
        sx={{ textTransform: "uppercase", fontSize: "0.68rem", mb: 0.4 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.5 }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

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
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.50",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Page Body ─────────────────────────────────── */}
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
        {/* ── Slim top bar: back + title + action ── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2.5,
          }}
        >
          {/* Left */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton
              onClick={() => navigate("/cars")}
              size="small"
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1.5,
                p: "5px",
                bgcolor: "background.paper",
                "&:hover": { bgcolor: "grey.100" },
              }}
            >
              <ArrowLeft size={16} />
            </IconButton>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
                  onClick={() => navigate("/cars")}
                >
                  Quản lý xe
                </Typography>
                <Typography variant="body2" color="text.disabled">/</Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>{car.licensePlates}</strong>
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                Chi tiết xe
              </Typography>
            </Box>
          </Box>

          {/* Right */}
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
        </Box>

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
            {/* ── Gallery column ── */}
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

            {/* ── Info column ── */}
            <Box
              sx={{
                flex: 1,
                p: { xs: 2.5, md: 3.5 },
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {/* Section title */}
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

              {/* Stats row */}
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

              {/* Note */}
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

              {/* Content */}
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

      {/* Dialog edit */}
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