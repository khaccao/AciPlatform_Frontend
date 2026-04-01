import { Box, Typography } from "@mui/material";
import BrokenImageOutlinedIcon from "@mui/icons-material/BrokenImageOutlined";
import { useState } from "react";

type MainImageProps = {
  src: string;
};

export const MainImage = ({ src }: MainImageProps) => {
  const [broken, setBroken] = useState(false);

  return (
    <Box
      key={src}
      sx={{
        width: "100%",
        maxHeight: 500,
        borderRadius: 1.5,
        overflow: "hidden",
        bgcolor: "grey.100",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {broken ? (
        <Box sx={{ textAlign: "center", color: "text.disabled", py: 6 }}>
          <BrokenImageOutlinedIcon sx={{ fontSize: 56, mb: 1 }} />
          <Typography variant="caption">Không tải được ảnh</Typography>
        </Box>
      ) : (
        <Box
          component="img"
          src={src}
          onError={() => setBroken(true)}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            maxHeight: 500,
          }}
        />
      )}
    </Box>
  );
};
