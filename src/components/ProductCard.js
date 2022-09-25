import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  const { name, cost, image, rating } = product;
  return (
    <Card className="card">
      <CardMedia component="img" image={image} alt={name} />
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {name}
        </Typography>
        <Typography variant="h6" gutterBottom className="cost">
          ${cost}
        </Typography>
        <Rating name="product-rating" value={rating} readOnly precision={0.5} />
      </CardContent>
      <CardActions className="card-actions">
        <Button variant="contained" className="card-button" onClick={handleAddToCart}>
          <AddShoppingCartOutlined />
          ADD TO CART
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
