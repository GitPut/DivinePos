import React from "react";
import loadingGif from "assets/loading2.gif";

const ComponentLoader = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(250,250,250,0.5)",
        height: "100%",
        width: "100%",
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

export default ComponentLoader;
