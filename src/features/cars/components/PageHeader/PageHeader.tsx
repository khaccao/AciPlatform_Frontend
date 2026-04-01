import { Box, Typography, IconButton } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  /** Breadcrumb items, từ trái sang phải */
  breadcrumbs: BreadcrumbItem[];
  /** Tiêu đề trang (dòng lớn bên dưới breadcrumb) */
  title: string;
  /** Path để navigate khi bấm nút back */
  backPath: string;
  /** Các action button ở bên phải */
  actions?: React.ReactNode;
}

export const PageHeader = ({ breadcrumbs, title, backPath, actions }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
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
          onClick={() => navigate(backPath)}
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
          {/* Breadcrumb */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {breadcrumbs.map((crumb, idx) => (
              <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {idx > 0 && (
                  <Typography variant="body2" color="text.disabled">
                    /
                  </Typography>
                )}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={crumb.path ? 400 : 600}
                  sx={
                    crumb.path
                      ? { cursor: "pointer", "&:hover": { color: "primary.main" } }
                      : undefined
                  }
                  onClick={crumb.path ? () => navigate(crumb.path!) : undefined}
                >
                  {crumb.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Page title */}
          <Typography variant="body1" fontWeight={700} lineHeight={1.2} mt={0.5}>
            {title}
          </Typography>
        </Box>
      </Box>

      {/* Right – action buttons */}
      {actions && (
        <Box sx={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          {actions}
        </Box>
      )}
    </Box>
  );
};