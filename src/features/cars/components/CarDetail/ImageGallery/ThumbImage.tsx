import { Box } from "@mui/material";
import BrokenImageOutlinedIcon from "@mui/icons-material/BrokenImageOutlined";
import { useState } from "react";

type ThumbImageProps = {
  src: string;
  active: boolean;
  onClick: () => void;
};

export const ThumbImage = ({ src, active, onClick }: ThumbImageProps) => {
  const [broken, setBroken] = useState(false);
  return (
    <Box
      onClick={onClick}
      sx={{
        width: 64,
        height: 64,
        borderRadius: 1,
        overflow: "hidden",
        flexShrink: 0,
        cursor: "pointer",
        border: "2px solid",
        borderColor: active ? "primary.main" : "divider",
        bgcolor: "grey.100",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "border-color 0.15s, opacity 0.15s",
        opacity: active ? 1 : 0.65,
        "&:hover": { opacity: 1 },
      }}
    >
      {broken ? (
        <BrokenImageOutlinedIcon sx={{ color: "error.light", fontSize: 24 }} />
      ) : (
        <Box
          component="img"
          src={src}
          onError={() => setBroken(true)}
          sx={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      )}
    </Box>
  );
};
