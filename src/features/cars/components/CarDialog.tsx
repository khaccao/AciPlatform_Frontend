/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, CircularProgress, Divider,
  Typography, Box, IconButton, Tooltip,
} from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import CloseIcon from "@mui/icons-material/Close";
import BrokenImageOutlinedIcon from "@mui/icons-material/BrokenImageOutlined";
import { useForm, Controller } from "react-hook-form";
import type { CarFileItem, CarResponse } from "../services/cars.type";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CarFormValues = {
  id?: string;
  licensePlates: string;
  note?: string;
  mileageAllowance?: number;
  fuelAmount?: number;
  content?: string;
  files?: string[];
  existingFiles?: CarFileItem[];
};

type CarDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CarFormValues) => void;
  defaultValues?: CarResponse;
  loading?: boolean;
};

const LICENSE_PLATE_REGEX = /^\d{1,2}[A-Z]-\d{4,5}$/;

// ─── Helper: lấy URLs từ car (hỗ trợ files[] và file[]) ──────────────────────
const extractUrls = (car?: CarResponse): string[] => {
  if (!car) return [];
  // BE mới: files là string[]
  if (car.files && car.files.length > 0)
    return car.files.filter(Boolean);
  // BE cũ: file là CarFileItem[]
  if (car.file && car.file.length > 0)
    return car.file.map((f) => f.fileUrl ?? "").filter(Boolean);
  return [];
};

// ─── URL Image Preview ────────────────────────────────────────────────────────
const ImageThumb = ({
  src, alt, onRemove,
}: {
  src: string; alt: string; onRemove: () => void;
}) => {
  const [broken, setBroken] = useState(false);
  return (
    <Box sx={{
      position: "relative", width: 80, height: 80,
      borderRadius: 1, overflow: "hidden", flexShrink: 0,
      border: "1px solid", borderColor: broken ? "error.light" : "divider",
      bgcolor: "grey.50", display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {broken ? (
        <BrokenImageOutlinedIcon sx={{ color: "error.light", fontSize: 32 }} />
      ) : (
        <Box component="img" src={src} alt={alt}
          onError={() => setBroken(true)}
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      <Tooltip title="Xóa ảnh">
        <IconButton size="small" onClick={onRemove} sx={{
          position: "absolute", top: 2, right: 2,
          bgcolor: "rgba(0,0,0,0.55)", color: "#fff", p: "2px",
          "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
        }}>
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
export const CarDialog = ({
  open, onClose, onSubmit, defaultValues, loading = false,
}: CarDialogProps) => {
  const isEditMode = !!defaultValues;

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput]   = useState("");
  const [urlError, setUrlError]   = useState("");

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CarFormValues>({
    defaultValues: {
      licensePlates: "", note: "", mileageAllowance: undefined,
      fuelAmount: undefined, content: "", files: [],
    },
  });

  useEffect(() => {
    if (!open) return;
    const urls = extractUrls(defaultValues);
    reset({
      licensePlates:    defaultValues?.licensePlates    ?? "",
      note:             defaultValues?.note             ?? "",
      mileageAllowance: defaultValues?.mileageAllowance ?? undefined,
      fuelAmount:       defaultValues?.fuelAmount       ?? undefined,
      content:          defaultValues?.content          ?? "",
      files:            urls,
    });
    setImageUrls(urls);
    setUrlInput("");
    setUrlError("");
  }, [open, defaultValues, reset]);

  const handleClose = () => {
    reset();
    setImageUrls([]);
    setUrlInput("");
    setUrlError("");
    onClose();
  };

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    try { new URL(trimmed); } catch {
      setUrlError("URL không hợp lệ. VD: https://example.com/image.jpg");
      return;
    }
    if (imageUrls.includes(trimmed)) {
      setUrlError("URL này đã được thêm");
      return;
    }
    setImageUrls((prev) => [...prev, trimmed]);
    setUrlInput("");
    setUrlError("");
  };

  const removeUrl = (index: number) =>
    setImageUrls((prev) => prev.filter((_, i) => i !== index));

  const handleFormSubmit = (data: CarFormValues) =>
    onSubmit({ ...data, files: imageUrls });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={600} component="div">
          {isEditMode ? "Chỉnh sửa xe" : "Thêm xe mới"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? "Cập nhật thông tin phương tiện" : "Điền thông tin để thêm xe vào hệ thống"}
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5, pb: 1 }}>
        <Stack spacing={2.5}>

          {/* Biển số xe */}
          <Controller name="licensePlates" control={control}
            rules={{
              required: "Biển số xe không được để trống",
              pattern: { value: LICENSE_PLATE_REGEX, message: "Biển số không hợp lệ. Ví dụ: 51F-12345" },
            }}
            render={({ field }) => (
              <TextField {...field} label="Biển số xe" placeholder="VD: 51F-12345"
                fullWidth required disabled={isEditMode}
                error={!!errors.licensePlates} helperText={errors.licensePlates?.message}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              />
            )}
          />

          {/* Định mức km + Lượng nhiên liệu */}
          <Stack direction="row" spacing={2}>
            <Controller name="mileageAllowance" control={control}
              render={({ field }) => (
                <TextField {...field} label="Định mức km" type="number" fullWidth
                  inputProps={{ min: 0 }}
                  onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                  value={field.value ?? ""}
                />
              )}
            />
            <Controller name="fuelAmount" control={control}
              render={({ field }) => (
                <TextField {...field} label="Lượng nhiên liệu (lít)" type="number" fullWidth
                  inputProps={{ min: 0 }}
                  onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                  value={field.value ?? ""}
                />
              )}
            />
          </Stack>

          {/* Ghi chú */}
          <Controller name="note" control={control}
            render={({ field }) => (
              <TextField {...field} label="Ghi chú" fullWidth multiline rows={2} />
            )}
          />

          {/* Nội dung */}
          <Controller name="content" control={control}
            render={({ field }) => (
              <TextField {...field} label="Nội dung" fullWidth multiline rows={3} />
            )}
          />

          {/* Hình ảnh */}
          <Box>
            <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>Hình ảnh</Typography>
            {imageUrls.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
                {imageUrls.map((url, i) => (
                  <ImageThumb key={i} src={url} alt={`image-${i}`} onRemove={() => removeUrl(i)} />
                ))}
              </Box>
            )}
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <TextField size="small" fullWidth
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); if (urlError) setUrlError(""); }}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
                error={!!urlError}
                helperText={urlError || "Nhập URL ảnh rồi nhấn Thêm hoặc Enter"}
                InputProps={{ sx: { fontSize: 13 } }}
              />
              <Button variant="outlined" size="medium"
                startIcon={<AddPhotoAlternateOutlinedIcon />}
                onClick={addUrl} disabled={loading}
                sx={{ mt: "1px", whiteSpace: "nowrap", height: "100%" }}
              >
                Thêm
              </Button>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading} variant="outlined" color="inherit"
          sx={{ minWidth: 88 }}>
          Hủy
        </Button>
        <Button variant="contained" onClick={handleSubmit(handleFormSubmit)}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{ minWidth: 100 }}>
          {isEditMode ? "Cập nhật" : "Tạo mới"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};