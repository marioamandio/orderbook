import { styled } from "@mui/system";
import React from "react";

const StyledHeader = styled("div")({
  display: "flex",
  justifyContent: "space-between",
});

const Header = ({ orderBook }: { orderBook: string }) => {
  return (
    <StyledHeader>
      <div>Order book Viewer</div>
      <div>{orderBook}</div>
    </StyledHeader>
  );
};

export default Header;
