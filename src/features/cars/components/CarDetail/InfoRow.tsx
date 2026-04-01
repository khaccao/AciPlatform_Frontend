import {Box, Typography} from "@mui/material";

export const InfoRow = ({
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