import { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import type { CarResponse } from "../services/cars.type";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CarFormValues = {
  licensePlates: string;
  note?: string;
  mileageAllowance?: number;
  fuelAmount?: number;
  content?: string;
};

type CarDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CarFormValues) => void;
  defaultValues?: CarResponse;
  loading?: boolean;
};

// ─── Component ────────────────────────────────────────────────────────────────

export const CarDialog = ({
  open,
  onClose,
  onSubmit,
  defaultValues,
  loading = false,
}: CarDialogProps) => {
  const isEditMode = !!defaultValues;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CarFormValues>({
    defaultValues: {
      licensePlates: "",
      note: "",
      mileageAllowance: undefined,
      fuelAmount: undefined,
      content: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        isEditMode
          ? {
              licensePlates: defaultValues.licensePlates ?? "",
              note: defaultValues.note ?? "",
              mileageAllowance: defaultValues.mileageAllowance,
              fuelAmount: defaultValues.fuelAmount,
              content: defaultValues.content ?? "",
            }
          : {
              licensePlates: "",
              note: "",
              mileageAllowance: undefined,
              fuelAmount: undefined,
              content: "",
            }
      );
    }
  }, [open, isEditMode, defaultValues, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditMode ? "Chỉnh sửa xe" : "Thêm xe mới"}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} mt={1}>

          {/* Biển số xe — bắt buộc */}
          <Controller
            name="licensePlates"
            control={control}
            rules={{ required: "Biển số xe không được để trống" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Biển số xe *"
                fullWidth
                error={!!errors.licensePlates}
                helperText={errors.licensePlates?.message}
              />
            )}
          />

          {/* Định mức km */}
          <Controller
            name="mileageAllowance"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Định mức km"
                type="number"
                fullWidth
                inputProps={{ min: 0 }}
                onChange={(e) =>
                  field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                }
                value={field.value ?? ""}
              />
            )}
          />

          {/* Lượng nhiên liệu */}
          <Controller
            name="fuelAmount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Lượng nhiên liệu (lít)"
                type="number"
                fullWidth
                inputProps={{ min: 0 }}
                onChange={(e) =>
                  field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                }
                value={field.value ?? ""}
              />
            )}
          />

          {/* Ghi chú */}
          <Controller
            name="note"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Ghi chú" fullWidth multiline rows={2} />
            )}
          />

          {/* Nội dung */}
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Nội dung" fullWidth multiline rows={3} />
            )}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {isEditMode ? "Cập nhật" : "Tạo mới"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};