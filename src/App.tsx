import { styled } from "@mui/system";
import Header from "./Header";
import OrderBook from "./Orderbook";

const StyledApp = styled("div")({
  background: "#0f4555",
  padding: "2rem",
  color: "#ddd",
  maxWidth: "800px",
  margin: "auto",
  minHeight: "400px",
  textAlign: "center",
});

function App() {
  return (
    <StyledApp className="App">
      <Header orderBook={"PI_XBTUSD"} />
      <hr />
      <OrderBook />
    </StyledApp>
  );
}

export default App;
