import React from "react";
import { posState } from "store/posState";
import { parseDate } from "utils/dateFormatting";
import KitchenOrderDetails from "./KitchenOrderDetails";

const KitchenViewOrders = () => {
  const { ongoingListState } = posState.use();

  return (
    <div style={{ overflow: "auto", padding: 20, display: "flex", flexDirection: "row" }}>
      {ongoingListState?.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          {ongoingListState?.map((element, index) => {
            let date = null;

            const parsedDate = parseDate(element.date);
            if (parsedDate !== null) {
              date = parsedDate;
            }

            let cartString = "";

            element.cart?.map((cartItem, index) => {
              cartString += `${index + 1}. Name: ${cartItem.name}\n`;

              if (cartItem.quantity) {
                cartString += `     Quantity: ${cartItem.quantity}\n`;
                cartString += `     Price: $${
                  parseFloat(cartItem.price) * parseFloat(cartItem.quantity)
                }`;
              } else {
                cartString += `    Price: $${cartItem.price}`;
              }

              if (cartItem.description) {
                cartString += `     \n${cartItem.description}`;
              }

              if (cartItem.options) {
                cartString += `\n`;
                cartItem.options.map((option) => {
                  cartString += `    ${option}\n`;
                });
              }

              if (cartItem.extraDetails) {
                cartString += `     Note: ${cartItem.extraDetails}\n`;
              }

              cartString += `\n\n`;
            });

            if (element.cartNote?.length ?? 0 > 0) {
              cartString += `\nNote: ${element.cartNote}`;
            }

            return (
              <KitchenOrderDetails
                style={{ ...styles.pendingOrderItem1, marginRight: 10 }}
                element={element}
                index={index}
                date={date}
                cartString={cartString}
                key={index}
              />
            );
          })}
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
          }}
        >
          <span>No Orders Yet</span>
        </div>
      )}
    </div>
  );
};

export default KitchenViewOrders;

const styles: Record<string, React.CSSProperties> = {
  pendingOrderItem1: {
    height: 84,
    width: 415,
    marginBottom: 10,
    backgroundColor: "white",
  },
};
