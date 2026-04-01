import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Divider,
  Button,
} from "@mui/material";
import { CarFieldSetupItems } from "./CarFieldSetupItems";
import { useAppSelector, useAppDispatch } from "../../../../app/hooks";
import type { RootState } from "../../../../store/store";
import type { CarFieldSetup } from "../../services/cars.type";
import { ListX, Save } from "lucide-react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { updateCarFieldSetup } from "../../store/cars.slice";

export const CarFieldSetupList = () => {
  const { id: carId } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const carFieldSetup = useAppSelector((s: RootState) => s.cars.carFieldSetup);
  const loadingCarFieldSetup = useAppSelector((s: RootState) => s.cars.loadingCarFieldSetup);

  // Local copy để chỉnh sửa trước khi save
  const [localItems, setLocalItems] = useState<CarFieldSetup[]>(carFieldSetup ?? []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalItems(carFieldSetup ?? []);
  }, [carFieldSetup]);

  const handleChange = (index: number, updated: CarFieldSetup) => {
    setLocalItems((prev) => prev.map((item, i) => (i === index ? updated : item)));
  };

  const handleDelete = (index: number) => {
    setLocalItems((prev) => prev.filter((_, i) => i !== index));
  };


  const handleSave = () => {
    if (!carId) return;
    dispatch(updateCarFieldSetup({ carId, carFieldSetups: localItems }));
  };

  const isDirty = JSON.stringify(localItems) !== JSON.stringify(carFieldSetup);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loadingCarFieldSetup) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────────────────
  if (!localItems || localItems.length === 0) {
    return (
      <Box>
        <Paper
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            gap: 1.5,
            color: "text.disabled",
            borderStyle: "dashed",
          }}
        >
          <ListX size={40} strokeWidth={1.2} />
          <Typography variant="body2">Chưa có trường dữ liệu nào được cấu hình</Typography>
        </Paper>

      </Box>
    );
  }

  // ── List ───────────────────────────────────────────────────────────────────
  return (
    <Box>
      <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2 }}>
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            bgcolor: "grey.50",
            borderBottom: "1px solid",
            borderColor: "grey.200",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Tên trường
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Thao tác
          </Typography>
        </Box>

        <Divider />

        {/* Items */}
        <Box>
          {localItems.map((item, index) => (
            <CarFieldSetupItems
              key={item.carFieldId}
              item={item}
              onChange={(updated) => handleChange(index, updated)}
              onDelete={() => handleDelete(index)}
            />
          ))}
        </Box>

        {/* Footer count */}
        <Box
          sx={{
            px: 3,
            py: 1,
            bgcolor: "grey.50",
            borderTop: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {localItems.length} trường dữ liệu
          </Typography>
        </Box>
      </Paper>

      {/* Action buttons */}
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          startIcon={<Save size={16} />}
          onClick={handleSave}
          disabled={!isDirty || loadingCarFieldSetup}
          size="small"
        >
          Lưu tất cả
        </Button>
      </Box>
    </Box>
  );
};