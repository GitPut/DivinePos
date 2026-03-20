import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import ProductList from "./ProductList";
import CategoryList from "./CategoryList";
import OptionTemplatesList from "./OptionTemplatesList";

const ProductsPage = ({ match }: { match: { url: string } }) => (
  <Switch>
    <Redirect
      exact
      from={`${match.url}/`}
      to={`${match.url}/productlist-product`}
    />
    <Route path={`${match.url}/productlist-product`} component={ProductList} />
    <Route
      path={`${match.url}/categorylist-product`}
      component={CategoryList}
    />
    <Route
      path={`${match.url}/option-templates`}
      component={OptionTemplatesList}
    />
  </Switch>
);

export default ProductsPage;
