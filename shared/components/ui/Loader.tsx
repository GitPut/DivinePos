import React from "react";
import loadingGif from "assets/loading.gif";

const Loader = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        height: "100vh",
        width: "100vw",
      }}
    >
      <img
        src={loadingGif}
        style={{ width: 450, height: 450, objectFit: "contain" }}
        alt="Loading"
        key={"loading"}
      />
    </div>
  );
};

export default Loader;
