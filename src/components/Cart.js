import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Button, IconButton, Stack } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Cart.css";

export const generateCartItemsFrom = (cartData, productsData) => {
  if (!cartData) return;

  const nextCart = cartData.map((item) => ({
    ...item,
    ...productsData.find((product) => product._id === item.productId),
  }));

  return nextCart;
};

export const getTotalCartValue = (items = []) => {
  if (!items.length) return;

  return items
    .map((item) => item.cost * item.qty)
    .reduce((total, sum) => {
      return total + sum;
    }, 0);
};


const ItemQuantity = ({ value, handleAdd, handleDelete, isReadOnly }) => {
  return (
    <>
      {!isReadOnly ? (
        <Stack direction="row" alignItems="center">
          <IconButton size="small" color="primary" onClick={handleDelete}>
            <RemoveOutlined />
          </IconButton>
          <Box padding="0.5rem" data-testid="item-qty">
            {value}
          </Box>
          <IconButton size="small" color="primary" onClick={handleAdd}>
            <AddOutlined />
          </IconButton>
        </Stack>
      ) : (
        <Stack>Qty: {value}</Stack>
      )}
    </>
  );
};

const Cart = ({ products, items = [], handleQuantity, isReadOnly }) => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box className="cart">
        {items.map((item) => {
          if (item.qty > 0) {
            return (
              <Box
                display="flex"
                alignItems="flex-start"
                padding="1rem"
                key={item.productId}
              >
                <Box className="image-container">
                  <img
                    src={item.image}
                    alt={item.name}
                    width="100%"
                    height="100%"
                  />
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  height="6rem"
                  paddingX="1rem"
                >
                  <div>{item.name}</div>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <ItemQuantity
                      value={item.qty}
                      handleAdd={async () => {
                        await handleQuantity(
                          token,
                          items,
                          products,
                          item.productId,
                          item.qty + 1
                        );
                      }}
                      handleDelete={async () => {
                        await handleQuantity(
                          token,
                          items,
                          products,
                          item.productId,
                          item.qty - 1
                        );
                      }}
                      isReadOnly={isReadOnly}
                    />
                    <Box padding="0.5rem" fontWeight="700">
                      ${item.cost}
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          }
          return null;
        })}

        <Box
          padding="1rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box color="#3C3C3C" alignSelf="center">
            <h4>Order total</h4>
          </Box>
          <Box
            color="#3C3C3C"
            fontWeight="700"
            fontSize="1.5rem"
            alignSelf="center"
            data-testid="cart-total"
          >
            ${getTotalCartValue(items)}
          </Box>
        </Box>
        {!isReadOnly && (
          <Box display="flex" justifyContent="flex-end" className="cart-footer">
            <Button
              color="primary"
              variant="contained"
              startIcon={<ShoppingCart />}
              className="checkout-btn"
              onClick={() => history.push("/checkout")}
            >
              Checkout
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
};

export default Cart;
