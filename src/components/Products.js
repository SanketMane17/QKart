import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Cart, { generateCartItemsFrom } from "./Cart";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import "./Products.css";

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState("");
  const [pageFound, setPageFound] = useState(true);
  const [items, setItems] = useState([]);
  const token = localStorage.getItem("token");
 
  const performAPICall = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${config.endpoint}/products`);
      if (response.status === 200) {
        setLoading(false);
        setProducts(response.data);
        return response.data;
      }
    } catch (e) {
      setLoading(true);
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const onLoadHandler = async () => {
      const productsData = await performAPICall();
      const cartData = await fetchCart(token);

      const cartDetails = generateCartItemsFrom(cartData, productsData);
      setItems(cartDetails);
    };

    onLoadHandler();
    // eslint-disable-next-line
  }, []);

  const performSearch = async (text) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );

      if (response.status === 200) {
        setProducts(response.data);
        setLoading(false);
        setPageFound(true);
        return response.data;
      }
    } catch (e) {
      setLoading(true);
      if (e.response) {
        if (e.response.status === 404) {
          setPageFound(false);
        }
        if (e.response.status === 500) {
          enqueueSnackbar(e.response.data.message, { variant: "error" });
          return null;
        }
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
      setLoading(false);
    }
  };

  const debounceSearch = (event, debounceTimeout) => {
    const value = event.target.value;
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      performSearch(value);
    }, 500);
    setDebounceTimeout(timeout);
  };

  const fetchCart = async (token) => {
    if (!token) return;

    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  const isItemInCart = (items, productId) => {
    if (!items.length) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].productId === productId) return true;
    }

    return false;
  };

  const updateCartData = (cartData, productsData) => {
    const cartDetails = generateCartItemsFrom(cartData, productsData);
    setItems(cartDetails);
  };

  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    if (token === null) {
      enqueueSnackbar("Login to add an item to the Cart", {
        variant: "warning",
      });
      return;
    }

    if (options.preventDuplicate && isItemInCart(items, productId)) {
      enqueueSnackbar(
        "Item already in cart. Use the cart sidebar to update quantity or remove item.",
        { variant: "warning" }
      );
      return;
    }

    try {
      const url = `${config.endpoint}/cart`;
      const response = await axios.post(
        url,
        {
          productId: productId,
          qty: qty,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      updateCartData(response.data, products);
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  return (
    <div>
      <Header>
        <TextField
          className="search-desktop"
          size="small"
          fullWidth
          InputProps={{
            className: "search",
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          onChange={(event) => debounceSearch(event, debounceTimeout)}
        />
      </Header>

      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(event) => debounceSearch(event, debounceTimeout)}
      />
      <Grid container>
        <Grid
          item
          className="product-grid"
          xs={token !== null && 12}
          md={token !== null && 9}
        >
          <Box className="hero">
            <p className="hero-heading">
              India's <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your door step
            </p>
          </Box>
          <Box>
            {pageFound ? (
              !loading ? (
                <Grid container spacing={2} className="products">
                  {products.map((p) => {
                    return (
                      <Grid item xs={12} sm={6} md={3} key={p._id}>
                        <ProductCard
                          product={p}
                          handleAddToCart={async () => {
                            return await addToCart(
                              token,
                              items,
                              products,
                              p._id,
                              1,
                              {
                                preventDuplicate: "true",
                              }
                            );
                          }}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box className="loading">
                  <CircularProgress />
                  Loading products…
                </Box>
              )
            ) : (
              <Box className="loading">
                <SentimentDissatisfied />
                <p>No products found</p>
              </Box>
            )}
          </Box>
        </Grid>
        {token !== null && (
          <Grid item xs={12} md={3}>
            <Cart
              products={products}
              items={items}
              handleQuantity={addToCart}
            />
          </Grid>
        )}
      </Grid>
      <Footer />
    </div>
  );
};

export default Products;
