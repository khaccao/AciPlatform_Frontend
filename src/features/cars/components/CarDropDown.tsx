import { useState } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../../../app/hooks";
import { fetchCarList } from "../store/cars.slice";
import type { CarsListResponse } from "../services/cars.type";

interface CarDropdownProps {
  value?: CarsListResponse | null;
  onChange: (car: CarsListResponse | null) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
  required?: boolean;
}

export const CarDropdown = ({
  value = null,
  onChange,
  placeholder = "Chọn xe...",
  disabled = false,
  label = "Xe",
  error,
  required = false,
}: CarDropdownProps) => {
  const dispatch = useAppDispatch();
  const list    = useAppSelector((s) => s.cars.list);
  const loading = useAppSelector((s) => s.cars.loading);
  const loaded  = useAppSelector((s) => s.cars.loaded);

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    // Chỉ gọi API nếu chưa fetch lần nào
    if (!loaded) {
      dispatch(fetchCarList());
    }
  };

  return (
    <Autocomplete
      value={value}
      open={open}
      onOpen={handleOpen}
      onClose={() => setOpen(false)}
      disabled={disabled}
      options={list}
      loading={loading}
      getOptionLabel={(option) => `${option.licensePlates} — ${option.id}`}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      filterOptions={(options, { inputValue }) =>
        options.filter(
          (o) =>
            o.licensePlates.toLowerCase().includes(inputValue.toLowerCase()) ||
            o.id.toLowerCase().includes(inputValue.toLowerCase())
        )
      }
      onChange={(_, newValue) => onChange(newValue)}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <span style={{ fontWeight: 600, marginRight: 8 }}>{option.licensePlates}</span>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>ID: {option.id}</span>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={!!error}
          helperText={error}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress size={16} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};