import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  TextField,
} from "@mui/material";
import { Pencil, Trash2, FileText, User, Calendar, AlertTriangle, X, Check } from "lucide-react";
import type { CarFieldSetup } from "../../services/cars.type";
import dayjs from "dayjs";
import { useState } from "react";

interface CarFieldSetupItemsProps {
  item: CarFieldSetup;
  onChange: (updated: CarFieldSetup) => void;
  onDelete: () => void;
}

export const CarFieldSetupItems = ({ item, onChange, onDelete }: CarFieldSetupItemsProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<CarFieldSetup>({ ...item });

  const hasSetupData =
    item.valueNumber !== undefined ||
    item.fromAt ||
    item.toAt ||
    item.warningAt ||
    item.userIdString ||
    item.note ||
    item.fileLink;

  const formatDate = (date?: Date | string) =>
    date ? dayjs(date).format("DD/MM/YYYY") : null;

  const handleConfirm = () => {
    onChange(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft({ ...item });
    setEditing(false);
  };

  const updateDraft = (key: keyof CarFieldSetup, value: unknown) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  // ── Edit mode ──────────────────────────────────────────────────────────────
  if (editing) {
    return (
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "primary.100",
          bgcolor: "primary.50",
          display: "flex",
          gap: 2,
          alignItems: "flex-start",
        }}
      >
        {/* Order badge */}
        <Box
          sx={{
            minWidth: 32,
            height: 32,
            borderRadius: "50%",
            bgcolor: "primary.100",
            color: "primary.700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 600,
            flexShrink: 0,
            mt: 0.5,
          }}
        >
          {item.order}
        </Box>

        {/* Form fields */}
        <Box sx={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {/* Name - read only, do BE quản lý qua bảng CarField */}
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ width: "100%", color: "primary.800", mb: 0.25 }}
          >
            {item.name}
          </Typography>

          <TextField
            label="Giá trị số"
            size="small"
            type="number"
            value={draft.valueNumber ?? ""}
            onChange={(e) =>
              updateDraft("valueNumber", e.target.value === "" ? undefined : Number(e.target.value))
            }
            sx={{ width: 140 }}
          />

          <TextField
            label="Từ ngày"
            size="small"
            type="date"
            value={draft.fromAt ? dayjs(draft.fromAt).format("YYYY-MM-DD") : ""}
            onChange={(e) =>
              updateDraft("fromAt", e.target.value ? new Date(e.target.value) : undefined)
            }
            InputLabelProps={{ shrink: true }}
            sx={{ width: 160 }}
          />

          <TextField
            label="Đến ngày"
            size="small"
            type="date"
            value={draft.toAt ? dayjs(draft.toAt).format("YYYY-MM-DD") : ""}
            onChange={(e) =>
              updateDraft("toAt", e.target.value ? new Date(e.target.value) : undefined)
            }
            InputLabelProps={{ shrink: true }}
            sx={{ width: 160 }}
          />

          <TextField
            label="Ngày cảnh báo"
            size="small"
            type="date"
            value={draft.warningAt ? dayjs(draft.warningAt).format("YYYY-MM-DD") : ""}
            onChange={(e) =>
              updateDraft("warningAt", e.target.value ? new Date(e.target.value) : undefined)
            }
            InputLabelProps={{ shrink: true }}
            sx={{ width: 170 }}
          />

          <TextField
            label="Người phụ trách"
            size="small"
            value={draft.userIdString ?? ""}
            onChange={(e) => updateDraft("userIdString", e.target.value || undefined)}
            sx={{ width: 180 }}
          />

          <TextField
            label="Link file"
            size="small"
            value={draft.fileLink ?? ""}
            onChange={(e) => updateDraft("fileLink", e.target.value || undefined)}
            sx={{ width: 220 }}
          />

          <TextField
            label="Ghi chú"
            size="small"
            value={draft.note ?? ""}
            onChange={(e) => updateDraft("note", e.target.value || undefined)}
            multiline
            maxRows={2}
            sx={{ width: "100%" }}
          />
        </Box>

        {/* Confirm / Cancel */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flexShrink: 0 }}>
          <Tooltip title="Xác nhận">
            <IconButton size="small" color="success" onClick={handleConfirm}>
              <Check size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Huỷ">
            <IconButton size="small" onClick={handleCancel}>
              <X size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  }

  // ── View mode ──────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        px: 3,
        py: 2,
        borderBottom: "1px solid",
        borderColor: "grey.100",
        "&:last-child": { borderBottom: "none" },
        "&:hover": { bgcolor: "grey.50" },
        transition: "background-color 0.15s",
      }}
    >
      {/* Order badge */}
      <Box
        sx={{
          minWidth: 32,
          height: 32,
          borderRadius: "50%",
          bgcolor: "primary.50",
          color: "primary.700",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 600,
          flexShrink: 0,
          mt: 0.25,
        }}
      >
        {item.order}
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Typography variant="body1" fontWeight={600} noWrap>
            {item.name}
          </Typography>
          {!hasSetupData && (
            <Chip
              label="Chưa cấu hình"
              size="small"
              sx={{
                height: 20,
                fontSize: 11,
                bgcolor: "warning.50",
                color: "warning.700",
                fontWeight: 500,
              }}
            />
          )}
        </Box>

        {hasSetupData && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.75 }}>
            {item.valueNumber !== undefined && (
              <Chip
                label={`Giá trị: ${item.valueNumber}`}
                size="small"
                variant="outlined"
                sx={{ height: 22, fontSize: 12 }}
              />
            )}
            {item.fromAt && (
              <Chip
                icon={<Calendar size={12} />}
                label={`Từ: ${formatDate(item.fromAt)}`}
                size="small"
                variant="outlined"
                sx={{ height: 22, fontSize: 12 }}
              />
            )}
            {item.toAt && (
              <Chip
                icon={<Calendar size={12} />}
                label={`Đến: ${formatDate(item.toAt)}`}
                size="small"
                variant="outlined"
                sx={{ height: 22, fontSize: 12 }}
              />
            )}
            {item.warningAt && (
              <Chip
                icon={<AlertTriangle size={12} />}
                label={`Cảnh báo: ${formatDate(item.warningAt)}`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: 12,
                  bgcolor: "warning.50",
                  color: "warning.700",
                  border: "1px solid",
                  borderColor: "warning.200",
                }}
              />
            )}
            {item.userIdString && (
              <Chip
                icon={<User size={12} />}
                label={item.userIdString}
                size="small"
                variant="outlined"
                sx={{ height: 22, fontSize: 12 }}
              />
            )}
            {item.fileLink && (
              <Chip
                icon={<FileText size={12} />}
                label="File đính kèm"
                size="small"
                component="a"
                href={item.fileLink}
                target="_blank"
                clickable
                sx={{ height: 22, fontSize: 12 }}
              />
            )}
            {item.note && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ alignSelf: "center", fontStyle: "italic" }}
              >
                {item.note}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
        <Tooltip title="Chỉnh sửa">
          <IconButton size="small" onClick={() => setEditing(true)} color="primary">
            <Pencil size={16} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Xóa">
          <IconButton size="small" onClick={onDelete} color="error">
            <Trash2 size={16} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};