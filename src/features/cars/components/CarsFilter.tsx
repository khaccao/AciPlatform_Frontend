import { useState, useEffect } from "react";
import { TextField } from "@mui/material";

type CarsFilterProps = {
  searchText: string;
  onSearchChange: (value: string) => void;
};

export const CarsFilter = ({ searchText, onSearchChange }: CarsFilterProps) => {
  const [localValue, setLocalValue] = useState(searchText);

  useEffect(() => {
    setLocalValue(searchText);
  }, [searchText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchChange(localValue);
    }
  };

  return (
    <TextField
      size="small"
      placeholder="Tìm biển số, ghi chú..."
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onKeyDown={handleKeyDown}
      sx={{ mb: 1.5, width: 300 }}
    />
  );
};