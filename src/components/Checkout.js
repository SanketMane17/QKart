import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";

const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
}) => {
  const handleChange = (e) => {
    handleNewAddress(() => ({
      value: e.target.value,
      isAddingNewAddress: true,
    }));
  };

  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        minRows={4}
        placeholder="Enter your complete address"
        value={newAddress.value}
        onChange={handleChange}
      />
      <Stack direction="row" my="1rem">
        <Button
          variant="contained"
          onClick={() => addAddress(token, newAddress.value)}
        >
          Add
        </Button>
        <Button
          className="cancel-btn"
          variant="text"
          onClick={() => {
            handleNewAddress((currNewAddress) => ({
              ...currNewAddress,
              isAddingNewAddress: false,
            }));
          }}
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

const Checkout = () => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });

  // Fetch the entire products list
  const getProducts = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);

      setProducts(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  // Fetch cart data
  const fetchCart = async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };
  const getAddresses = async (token) => {
    if (!token) return;

    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses({ ...addresses, all: response.data });

      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  const addAddress = async (token, newAddress) => {
    try {
      const url = `${config.endpoint}/user/addresses`;
      const data = {
        address: newAddress,
      };

      const response = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNewAddress(() => ({
        value: "",
        isAddingNewAddress: false,
      }));

      setAddresses({ ...addresses, all: response.data });
      return response.data;
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const deleteAddress = async (token, addressId) => {
    try {
      const response = await axios.delete(
        `${config.endpoint}/user/addresses/${addressId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAddresses({ ...addresses, all: response.data });
      return response.data;
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const saveAddress = (address) => {
    setAddresses({ ...addresses, selected: address._id });
  };

  const validateRequest = (items, addresses) => {
    if (getTotalCartValue(items) > Number(localStorage.getItem("balance"))) {
      enqueueSnackbar(
        "You do not have enough balance in your wallet for this purchase",
        { variant: "warning" }
      );
      return false;
    } else if (!addresses.all.length) {
      enqueueSnackbar("Please add a new address before proceeding.", {
        variant: "warning",
      });
      return false;
    } else if (addresses.selected === "") {
      enqueueSnackbar("Please select one shipping address to proceed", {
        variant: "warning",
      });
      return false;
    }

    return true;
  };

  const performCheckout = async (token, items, addresses) => {
    if (!validateRequest(items, addresses)) return;

    try {
      const url = `${config.endpoint}/cart/checkout`;
      const data = {
        addressId: addresses.selected,
      };
      const response = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        enqueueSnackbar("Order placed successfully", { variant: "success" });

        const prevBalance = localStorage.getItem("balance");
        const newBalance = prevBalance - getTotalCartValue(items);
        localStorage.setItem("balance", newBalance);
        history.push("/thanks");
      }
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  // Fetch products and cart data on page load
  useEffect(() => {
    const onLoadHandler = async () => {
      const productsData = await getProducts();
      const cartData = await fetchCart(token);

      await getAddresses(token);

      if (productsData && cartData) {
        const cartDetails = await generateCartItemsFrom(cartData, productsData);
        setItems(cartDetails);
      }
    };
    onLoadHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const OrderData = ({ productsCount }) => {
    return (
      <Box className="table">
        <Typography className="order-details" variant="h6" alignSelf="center">
          Order Details
        </Typography>
        <table>
          <tbody>
            <tr>
              <td>Products</td>
              <td className="text-align-right">{productsCount}</td>
            </tr>
            <tr>
              <td>Subtotal</td>
              <td className="text-align-right">${getTotalCartValue(items)}</td>
            </tr>
            <tr>
              <td>Shipping charges</td>
              <td className="text-align-right">$0</td>
            </tr>
            <tr>
              <th>Total</th>
              <th className="text-align-right">${getTotalCartValue(items)}</th>
            </tr>
          </tbody>
        </table>
      </Box>
    );
  };

  const redirectToLogin = () => {
    enqueueSnackbar("You must be logged in to access checkout page", {
      variant: "info",
    });
    history.push("/login");
  };

  return (
    <>
      {!token ? (
        redirectToLogin()
      ) : (
        <>
          <Header />
          <Grid container>
            <Grid item xs={12} md={9}>
              <Box className="shipping-container" minHeight="100vh">
                <Typography color="#3C3C3C" variant="h4" my="1rem">
                  Shipping
                </Typography>
                <Typography color="#3C3C3C" my="1rem">
                  Manage all the shipping addresses you want. This way you won't
                  have to enter the shipping address manually with every order.
                  Select the address you want to get your order delivered.
                </Typography>
                <Divider />
                <Box>
                  {/* TODO: CRIO_TASK_MODULE_CHECKOUT - Display list of addresses and corresponding "Delete" buttons, if present, of which 1 can be selected */}

                  {addresses.all.length ? (
                    <Box>
                      {addresses.all.map((address) => {
                        const classForSelecttion =
                          addresses.selected === address._id
                            ? "address-item selected"
                            : "address-item not-selected";
                        return (
                          <Box
                            className={classForSelecttion}
                            key={address._id}
                            onClick={() => saveAddress(address)}
                          >
                            <Typography color="#3C3C3C">
                              {address.address}
                            </Typography>
                            <Button
                              variant="text"
                              startIcon={<Delete />}
                              onClick={() => deleteAddress(token, address._id)}
                            >
                              Delete
                            </Button>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography my="1rem">
                      No addresses found for this account. Please add one to
                      proceed
                    </Typography>
                  )}
                </Box>

                {/* TODO: CRIO_TASK_MODULE_CHECKOUT - Dislay either "Add new address" button or the <AddNewAddressView> component to edit the currently selected address */}

                {!newAddress.isAddingNewAddress ? (
                  <Button
                    color="primary"
                    variant="contained"
                    id="add-new-btn"
                    size="large"
                    onClick={() => {
                      setNewAddress((currNewAddress) => ({
                        ...currNewAddress,
                        isAddingNewAddress: true,
                      }));
                    }}
                  >
                    Add new address
                  </Button>
                ) : (
                  <AddNewAddressView
                    token={token}
                    newAddress={newAddress}
                    handleNewAddress={setNewAddress}
                    addAddress={addAddress}
                  />
                )}

                <Typography color="#3C3C3C" variant="h4" my="1rem">
                  Payment
                </Typography>
                <Typography color="#3C3C3C" my="1rem">
                  Payment Method
                </Typography>
                <Divider />

                <Box my="1rem">
                  <Typography>Wallet</Typography>
                  <Typography>
                    Pay ${getTotalCartValue(items)} of available $
                    {localStorage.getItem("balance")}
                  </Typography>
                </Box>

                <Button
                  startIcon={<CreditCard />}
                  variant="contained"
                  onClick={() => performCheckout(token, items, addresses)}
                >
                  PLACE ORDER
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={3} bgcolor="#E9F5E1">
              <Cart isReadOnly products={products} items={items} />
              <OrderData productsCount={items.length} />
            </Grid>
          </Grid>
          <Footer />
        </>
      )}
    </>
  );
};

export default Checkout;
