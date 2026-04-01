import { Box, IconButton, Chip } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useState } from "react";
import { MainImage } from "./MainImage";
import { ThumbImage } from "./ThumbImage";

type ImageGalleryProps = {
  images: string[];
};

export const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return <Box sx={{ bgcolor: "grey.100", height: 300, borderRadius: 1 }} />;
  }

  const prev = () => setActive((i) => (i - 1 + images.length) % images.length);
  const next = () => setActive((i) => (i + 1) % images.length);

  return (
    <Box>
      {/* Ảnh to */}
      <Box sx={{ position: "relative" }}>
        <MainImage src={images[active]} />

        {/* Nút prev/next chỉ hiện khi > 0 ảnh */}
        {images.length > 0 && (
          <>
            <IconButton
              size="small"
              onClick={prev}
              sx={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(0,0,0,0.45)",
                color: "#fff",
                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={next}
              sx={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(0,0,0,0.45)",
                color: "#fff",
                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
              }}
            >
              <ChevronRightIcon />
            </IconButton>

            {/* Bộ đếm */}
            <Chip
              label={`${active + 1} / ${images.length}`}
              size="small"
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
                bgcolor: "rgba(0,0,0,0.5)",
                color: "#fff",
                fontSize: 11,
                height: 22,
              }}
            />
          </>
        )}
      </Box>

      {/* Thumbnail strip */}
      {images.length > 0 && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            mt: 1.5,
            overflowX: "auto",
            pb: 0.5,
            "&::-webkit-scrollbar": { height: 4 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 2 },
          }}
        >
          {images.map((url, i) => (
            <ThumbImage
              key={i}
              src={url}
              active={i === active}
              onClick={() => setActive(i)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};
