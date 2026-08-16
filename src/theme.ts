// theme.ts
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#1362cb",
    },
    secondary: {
      main: "#123b5d",
    },
    background: {
      default: "#f7f9fb",
      paper: "#ffffff",
    },
    text: {
      primary: "#0b1f33",
      secondary: "#475569",
    },
  },
typography: {
  fontFamily: '"Titillium Web", "Inter", sans-serif',

  h2: {
    fontSize: "2rem",
    lineHeight: "2rem",
    fontWeight: 400,
    color: "#153b94",
  },
  h3: {
    fontSize: "1.75rem",
    lineHeight: "1.75rem",
    fontWeight: 400,
    color: "#153b94",
  },
  h4: {
    fontWeight: 400,
    color: "#153b94",
  },
  h5: {
    fontWeight: 400,
    color: "#153b94",
  },
  h6: {
    fontWeight: 400,
    color: "#153b94",
  },
},
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          borderRadius: 8,
          textTransform: "none",
          fontFamily: '"Open Sans", sans-serif',
          fontSize: "16px",
          fontWeight: 400,
          minHeight: "34px",
          paddingLeft: "12px",
          paddingRight: "12px",
          color: "#1362cb",
          border: "1px solid #3e68ff",
          backgroundColor: "#ffffff",
          boxShadow: "none",
          transition: "none",
          "&:hover": {
            backgroundColor: "#f8fafc",
            boxShadow: "none",
          },
          ...(ownerState.variant === "contained" && ownerState.color === "primary"
            ? {
                backgroundColor: "#1362cb",
                color: "#ffffff",
                border: "1px solid #1362cb",
                "&:hover": {
                  backgroundColor: "#0f4fa8",
                  boxShadow: "none",
                },
              }
            : {}),
        }),
      },
    },
    MuiAppBar: {
  styleOverrides: {
    root: {
      backgroundColor: "#ffffff",
      color: "#0b1f33",
      borderBottom: "1px solid #d9e2ec",
      boxShadow: "none",
    },
  },
},
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "1px solid #d9e2ec",
          borderRadius: 8,
          boxShadow: "none",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: "#0b1f33",
          fontWeight: 700,
          fontSize: "0.9rem",
          backgroundColor: "#eef3f8",
        },
        body: {
          color: "#475569",
          fontSize: "0.875rem",
        },
      },
    },
  },
  spacing: 8,
});
