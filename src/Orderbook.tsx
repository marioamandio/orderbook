import { Button, useMediaQuery } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { styled } from "@mui/system";
import React, { useEffect, useMemo, useState } from "react";

type Order = [number, number];
type Orders = Order[];
type OrderBook = { asks: Orders; bids: Orders };

const StyledTable = styled(TableContainer)({
  maxWidth: "50%",
  "@media (max-width: 768px)": {
    maxWidth: "85%",
  },

  "@media (max-width: 350px)": {
    maxWidth: "95%",
  },

  margin: "auto",
  justifyContent: "center",

  "&&&& .MuiTableCell-root": {
    color: "inherit",
    border: 0,
    padding: 8,
  },
});

const updateOrders = (
  latestOrders: Orders | undefined = [],
  orders: Orders
): Orders => {
  return latestOrders
    .filter(([_, size]) => size > 0)
    .concat(orders)
    .slice(0, 15);
};

const sortByPrice = (a: Order, b: Order) => a[0] - b[0];

const socket = new WebSocket("wss://www.cryptofacilities.com/ws/v1");

const OrderBookComponent = () => {
  const [isPaused, setPause] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Event | null>(null);
  const [orders, setOrders] = useState<OrderBook>({ asks: [], bids: [] });
  const isLargeScreen = useMediaQuery("(min-width:600px)");

  //////////////////////////////////////////////////////////////////////////////////////////////

  socket.onerror = (error) => setError(error);
  socket.onclose = () => console.warn("ws closed");
  socket.onmessage = (e) => {
    if (isPaused) return;
    const { asks, bids }: OrderBook = JSON.parse(e.data);

    setOrders({
      asks: updateOrders(asks, orders.asks),
      bids: updateOrders(bids, orders.bids),
    });
  };

  useEffect(() => {
    setLoading(true);

    socket.onopen = () => {
      console.log("on open");
      socket.send(
        JSON.stringify({
          event: "subscribe",
          feed: "book_ui_1",
          product_ids: ["PI_XBTUSD"],
        })
      );
    };
    setLoading(false);
    return () => {
      socket.close();
    };
  }, []);

  useMemo(() => {
    if (isPaused) {
      setOrders({ asks: [], bids: [] });
    }
  }, [isPaused]);

  ///////////////////////////////////////////////////////////////////////////////////////////////

  if (loading && !error) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Something went wrong...</div>;
  }

  const tableHeaders = () => {
    if (isLargeScreen) {
      return (
        <TableRow>
          <TableCell align="right">Size</TableCell>
          <TableCell align="right">Price</TableCell>
          <TableCell align="right">Price</TableCell>
          <TableCell align="right">Size</TableCell>
        </TableRow>
      );
    }

    return (
      <TableRow>
        <TableCell align="center">Size</TableCell>
        <TableCell align="center">Price</TableCell>
      </TableRow>
    );
  };

  const tableRows = () => {
    if (isLargeScreen) {
      const sortedAndReversedBids = orders.bids.sort(sortByPrice).reverse();
      const sortedAsks = orders.asks.sort(sortByPrice);

      const sorter = new Array(
        Math.max(orders.asks.length, orders.bids.length)
      ).fill(true);

      return (
        <TableBody>
          {sorter.map((_, idx) => (
            <TableRow key={idx} style={{ border: 0 }}>
              <TableCell align="right">
                {sortedAndReversedBids[idx]
                  ? sortedAndReversedBids[idx][1]
                  : ""}
              </TableCell>
              <TableCell align="right" style={{ color: "#1CE815" }}>
                {sortedAndReversedBids[idx]
                  ? sortedAndReversedBids[idx][0].toFixed(2)
                  : ""}
              </TableCell>
              <TableCell align="right" style={{ color: "#FE0C0A" }}>
                {sortedAsks[idx] ? sortedAsks[idx][0].toFixed(2) : ""}
              </TableCell>
              <TableCell align="right">
                {sortedAsks[idx] ? sortedAsks[idx][1] : ""}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      );
    }

    return (
      <TableBody>
        {orders.asks
          .sort(sortByPrice)
          .reverse()
          .map(([price, size], idx: number) => (
            <TableRow key={idx} style={{ border: 0 }}>
              <TableCell align="right">{size}</TableCell>
              <TableCell align="right" style={{ color: "#FE0C0A" }}>
                {price.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        {orders.bids
          .sort(sortByPrice)
          .reverse()
          .map(([price, size], idx: number) => (
            <TableRow key={idx} style={{ border: 0 }}>
              <TableCell align="right">{size}</TableCell>
              <TableCell align="right" style={{ color: "#1CE815" }}>
                {price.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    );
  };

  return (
    <>
      <StyledTable>
        <Table aria-label="simple table">
          <TableHead>{tableHeaders()}</TableHead>
          {tableRows()}
        </Table>
      </StyledTable>
      <Button
        onClick={() => setPause(!isPaused)}
        variant="contained"
        color="success"
      >
        {isPaused ? "Start Feed" : "Stop Feed"}
      </Button>
    </>
  );
};

export default OrderBookComponent;
