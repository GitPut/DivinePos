import {
  CartItemProp,
  StoreDetailsProps,
  TransListStateItem,
} from "types";
import { parseDate } from "utils/dateFormatting";

function receiptPrint(
  element: TransListStateItem,
  storeDetails: StoreDetailsProps,
  reprint?: boolean
): { data: string[]; total: number } {
  let data: string[] = [];
  let total: number = 0;

  const orderSourceLabel = element.online ? "Online Order" : "";

  let date;

  const parsedDate = parseDate(element.date);
  if (parsedDate) {
    date = parsedDate.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
  }

  if (element.method === "deliveryOrder") {
    total += parseFloat(
      storeDetails.deliveryPrice ? storeDetails.deliveryPrice : "0"
    );
    data = element.online
      ? [
          "\x1B" + "\x40", // init
          "                                                                              ", // line break
          "\x0A",
          "\x1B" + "\x61" + "\x31", // center align
          storeDetails.name,
          "\x0A",
          storeDetails.address?.label + "\x0A",
          storeDetails.website + "\x0A",
          storeDetails.phoneNumber + "\x0A",
          date + "\x0A",
          "\x0A",
          orderSourceLabel && orderSourceLabel + "\x0A",
          `Transaction ID ${element.transNum}` + "\x0A",
          "\x0A",
          `Delivery Order: $${
            storeDetails.deliveryPrice ? storeDetails.deliveryPrice : "0"
          } Fee` + "\x0A",
          "\x0A",
          "\x0A",
          "\x0A",
          "\x1B" + "\x61" + "\x30", // left align
        ]
      : [
          "\x1B" + "\x40", // init
          "                                                                              ",
          "\x0A",
          "\x1B" + "\x61" + "\x31", // center align
          storeDetails.name,
          "\x0A",
          storeDetails.address?.label + "\x0A",
          storeDetails.website + "\x0A",
          storeDetails.phoneNumber + "\x0A",
          date + "\x0A",
          "\x0A",
          `Transaction ID ${element.transNum}` + "\x0A",
          "\x0A",
          `Delivery Order: $${
            storeDetails.deliveryPrice ? storeDetails.deliveryPrice : "0"
          } Fee` + "\x0A",
          "\x0A",
          "\x0A",
          "\x0A",
          "\x1B" + "\x61" + "\x30", // left align
        ];

    element.cart?.map((cartItem: CartItemProp) => {
      data.push(`Name: ${cartItem.name}`);
      data.push("\x0A");

      if (cartItem.quantity) {
        if (cartItem.price) {
          total +=
            parseFloat(cartItem.price ?? "0") *
            (parseFloat(cartItem.quantity) ?? 1);
        }
        data.push(`Quantity: ${cartItem.quantity}`);
        if (cartItem.price) {
          data.push("\x0A");
          data.push(
            `Price: $${(
              parseFloat(cartItem.price ?? "0") *
              (parseFloat(cartItem.quantity) ?? 1)
            ).toFixed(2)}`
          );
        }
      } else {
        if (cartItem.price) {
          total += parseFloat(cartItem.price);
          data.push(`Price: $${parseFloat(cartItem.price).toFixed(2)}`);
        }
      }

      if (cartItem.description) {
        data.push("\x0A");
        data.push(cartItem.description);
      }

      if (cartItem.options) {
        data.push("\x0A");
        cartItem.options.map((option) => {
          data.push(option);
          data.push("\x0A");
        });
      }

      if (cartItem.extraDetails) {
        data.push("Note: " + cartItem.extraDetails);
        data.push("\x0A");
      }

      data.push("\x0A" + "\x0A");
    });

    total =
      parseFloat(storeDetails.taxRate) >= 0
        ? total * (1 + parseFloat(storeDetails.taxRate) / 100)
        : total * 1.13;

    data.push(
      "\x0A",
      "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" + "\x0A",
      element.cartNote
        ? "\x0A" + "\x0A" + "Note: " + element.cartNote + "\x0A" + "\x0A"
        : "\x0A" + "\x0A",
      "Customer Name: " + element.customer?.name,
      "\x0A" + "\x0A",
      "Customer Phone #:  " + element.customer?.phone,
      "\x0A" + "\x0A",
      "Customer Address: " + element.customer?.address?.label,
      "\x0A" + "\x0A",
      `Unit #: ${
        element.customer?.unitNumber ? element.customer?.unitNumber : "N/A"
      }        Buzz Code: ${
        element.customer?.buzzCode ? element.customer?.buzzCode : "N/A"
      }\x0A\x0A`,
      `Total Including (${
        parseFloat(storeDetails.taxRate) >= 0 ? storeDetails.taxRate : "13"
      }% Tax): ` +
        "$" +
        total.toFixed(2) +
        "\x0A" +
        "\x0A",
      "------------------------------------------" + "\x0A",
      "\x0A",
      "\x0A",
      "\x0A",
      "\x0A",
      "\x0A",
      "\x0A",
      "\x0A",
      "\x1D" + "\x56" + "\x30"
    );
  } else if (element.method === "pickupOrder") {
    data = element.online
      ? [
          "\x1B" + "\x40", // init
          "                                                                              ",
          "\x0A",
          "\x1B" + "\x61" + "\x31", // center align
          storeDetails.name,
          "\x0A",
          storeDetails.address?.label + "\x0A",
          storeDetails.website + "\x0A",
          storeDetails.phoneNumber + "\x0A",
          date + "\x0A",
          "\x0A",
          orderSourceLabel && orderSourceLabel + "\x0A",
          `Transaction ID ${element.transNum}` + "\x0A",
          `                                `,
          "\x0A",
          "Pickup Order" + "\x0A",
          "\x0A",
          "\x0A",
          "\x1B" + "\x61" + "\x30", // left align
        ]
      : [
          "\x1B" + "\x40", // init
          "                                                                              ",
          "\x0A",
          "\x1B" + "\x61" + "\x31", // center align
          storeDetails.name,
          "\x0A",
          storeDetails.address?.label + "\x0A",
          storeDetails.website + "\x0A",
          storeDetails.phoneNumber + "\x0A",
          date + "\x0A",
          "\x0A",
          `Transaction ID ${element.transNum}` + "\x0A",
          `                                `,
          "\x0A",
          "Pickup Order" + "\x0A",
          "\x0A",
          "\x0A",
          "\x1B" + "\x61" + "\x30", // left align
        ];

    element.cart?.map((cartItem) => {
      data.push(`Name: ${cartItem.name}`);
      data.push("\x0A");

      if (cartItem.quantity) {
        if (cartItem.price) {
          total += parseFloat(cartItem.price) * parseFloat(cartItem.quantity);
        }
        data.push(`Quantity: ${cartItem.quantity}`);
        if (cartItem.price) {
          data.push("\x0A");
          data.push(
            `Price: $${(parseFloat(cartItem.price) * parseFloat(cartItem.quantity)).toFixed(2)}`
          );
        }
      } else {
        if (cartItem.price) {
          total += parseFloat(cartItem.price);
          data.push(`Price: $${parseFloat(cartItem.price).toFixed(2)}`);
        }
      }

      if (cartItem.description) {
        data.push("\x0A");
        data.push(cartItem.description);
      }

      if (cartItem.options) {
        data.push("\x0A");
        cartItem.options.map((option) => {
          data.push(option);
          data.push("\x0A");
        });
      }

      if (cartItem.extraDetails) {
        data.push("Note: " + cartItem.extraDetails);
        data.push("\x0A");
      }

      data.push("\x0A" + "\x0A");
    });

    total =
      parseFloat(storeDetails.taxRate) >= 0
        ? total * (1 + parseFloat(storeDetails.taxRate) / 100)
        : total * 1.13;

    data.push(
      "\x0A",
      "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" + "\x0A",
      element.cartNote
        ? "\x0A" + "\x0A" + "Note: " + element.cartNote + "\x0A" + "\x0A"
        : "\x0A" + "\x0A",
      "Customer Name: " + element.customer?.name,
      "\x0A" + "\x0A",
      "Customer Phone #:  " + element.customer?.phone,
      "\x0A" + "\x0A",
      "Customer Address: N/A                            ",
      "\x0A",
      `Total Including (${
        parseFloat(storeDetails.taxRate) >= 0 ? storeDetails.taxRate : "13"
      }% Tax): ` +
        "$" +
        total.toFixed(2) +
        "\x0A" +
        "\x0A",
      "------------------------------------------" + "\x0A",
      "\x0A",
      "\x0A",
      "\x0A",
      "\x0A",
      "\x0A",
      "\x0A",
      "\x0A",
      "\x1D" + "\x56" + "\x30"
    );
  } else if (element.method === "tableOrder") {
    const tableInfo = [];
    if (element.tableName) tableInfo.push(element.tableName);
    if (element.tableNumber) tableInfo.push(`Table #${element.tableNumber}`);
    if (element.server) tableInfo.push(`Server: ${element.server}`);
    if (element.guests) tableInfo.push(`Guests: ${element.guests}`);

    data = [
      "\x1B" + "\x40", // init
      "                                                                              ",
      "\x0A",
      "\x1B" + "\x61" + "\x31", // center align
      storeDetails.name,
      "\x0A",
      storeDetails.address?.label + "\x0A",
      storeDetails.website + "\x0A",
      storeDetails.phoneNumber + "\x0A",
      date + "\x0A",
      "\x0A",
      `Transaction ID ${element.transNum}` + "\x0A",
      "\x0A",
      ...tableInfo.map((info) => info + "\x0A"),
      "\x0A",
      "\x0A",
      "\x1B" + "\x61" + "\x30", // left align
    ];

    element.cart?.map((cartItem) => {
      data.push(`Name: ${cartItem.name}`);
      data.push("\x0A");

      if (cartItem.quantity) {
        if (cartItem.price) {
          total += parseFloat(cartItem.price) * parseFloat(cartItem.quantity);
        }
        data.push(`Quantity: ${cartItem.quantity}`);
        if (cartItem.price) {
          data.push("\x0A");
          data.push(
            `Price: $${(parseFloat(cartItem.price) * parseFloat(cartItem.quantity)).toFixed(2)}`
          );
        }
      } else {
        if (cartItem.price) {
          total += parseFloat(cartItem.price);
          data.push(`Price: $${parseFloat(cartItem.price).toFixed(2)}`);
        }
      }

      if (cartItem.description) {
        data.push("\x0A");
        data.push(cartItem.description);
      }

      if (cartItem.options) {
        data.push("\x0A");
        cartItem.options.map((option) => {
          data.push(option);
          data.push("\x0A");
        });
      }

      if (cartItem.extraDetails) {
        data.push("Note: " + cartItem.extraDetails);
        data.push("\x0A");
      }

      data.push("\x0A" + "\x0A");
    });

    total =
      parseFloat(storeDetails.taxRate) >= 0
        ? total * (1 + parseFloat(storeDetails.taxRate) / 100)
        : total * 1.13;

    if (element.paymentMethod === "Cash") {
      data.push(
        "\x0A",
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" + "\x0A",
        element.cartNote
          ? "\x0A" + "\x0A" + "Note: " + element.cartNote + "\x0A" + "\x0A"
          : "\x0A" + "\x0A",
        "Payment Method: Cash" + "\x0A" + "\x0A",
        `Total Including (${
          parseFloat(storeDetails.taxRate) >= 0
            ? parseFloat(storeDetails.taxRate)
            : "13"
        }% Tax): ` +
          "$" +
          total.toFixed(2) +
          "\x0A" +
          "\x0A",
        "Change Due: " + "$" + (element.changeDue || "0.00") + "\x0A" + "\x0A",
        "------------------------------------------" + "\x0A",
        "\x0A",
        "\x0A",
        "\x0A",
        "\x0A",
        "\x0A",
        "\x0A",
        "\x1D" + "\x56" + "\x30"
      );
    } else {
      data.push(
        "\x0A",
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" + "\x0A",
        element.cartNote
          ? "\x0A" + "\x0A" + "Note: " + element.cartNote + "\x0A" + "\x0A"
          : "\x0A" + "\x0A",
        "Payment Method: Card" + "\x0A" + "\x0A",
        `Total Including (${
          parseFloat(storeDetails.taxRate) >= 0
            ? parseFloat(storeDetails.taxRate)
            : "13"
        }% Tax): ` +
          "$" +
          total.toFixed(2) +
          "\x0A" +
          "\x0A",
        "------------------------------------------" + "\x0A",
        "\x0A",
        "\x0A",
        "\x0A",
        "\x0A",
        "\x0A",
        "\x0A",
        "\x0A",
        "\x0A",
        "\x1D" + "\x56" + "\x30"
      );
    }
  } else {
    data = [
      "\x1B" + "\x40", // init
      "                                                                              ",
      "\x0A",
      "\x1B" + "\x61" + "\x31", // center align
      storeDetails.name,
      "\x0A",
      storeDetails.address?.label + "\x0A",
      storeDetails.website + "\x0A",
      storeDetails.phoneNumber + "\x0A",
      date + "\x0A",
      "\x0A",
      `Transaction ID ${element.transNum}` + "\x0A",
      "\x0A",
      "\x0A",
      "\x0A",
      "\x1B" + "\x61" + "\x30", // left align
    ];

    element.cart?.map((cartItem) => {
      data.push(`Name: ${cartItem.name}`);
      data.push("\x0A");

      if (cartItem.quantity) {
        if (cartItem.price) {
          total += parseFloat(cartItem.price) * parseFloat(cartItem.quantity);
        }
        data.push(`Quantity: ${cartItem.quantity}`);
        if (cartItem.price) {
          data.push("\x0A");
          data.push(
            `Price: $${(parseFloat(cartItem.price) * parseFloat(cartItem.quantity)).toFixed(2)}`
          );
        }
      } else {
        if (cartItem.price) {
          total += parseFloat(cartItem.price);
          data.push(`Price: $${parseFloat(cartItem.price).toFixed(2)}`);
        }
      }

      if (cartItem.description) {
        data.push("\x0A");
        data.push(cartItem.description);
      }

      if (cartItem.options) {
        data.push("\x0A");
        cartItem.options.map((option) => {
          data.push(option);
          data.push("\x0A");
        });
      }

      if (cartItem.extraDetails) {
        data.push("Note: " + cartItem.extraDetails);
        data.push("\x0A");
      }

      data.push("\x0A" + "\x0A");
    });

    total =
      parseFloat(storeDetails.taxRate) >= 0
        ? total * (1 + parseFloat(storeDetails.taxRate) / 100)
        : total * 1.13;

    if (element.paymentMethod === "Cash") {
      data.push(
        "\x0A",
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" + "\x0A",
        element.cartNote
          ? "\x0A" + "\x0A" + "Note: " + element.cartNote + "\x0A" + "\x0A"
          : "\x0A" + "\x0A",
        "Payment Method: " + element.paymentMethod + "\x0A" + "\x0A",
        `Total Including (${
          parseFloat(storeDetails.taxRate) >= 0
            ? parseFloat(storeDetails.taxRate)
            : "13"
        }% Tax): ` +
          "$" +
          total.toFixed(2) +
          "\x0A" +
          "\x0A",
        "Change Due: " + "$" + element.changeDue + "\x0A" + "\x0A",
        "------------------------------------------" + "\x0A",
        "\x0A",
        "\x0A",
        "\x0A",
        "\x0A",
        "\x0A",
        "\x0A",
        reprint === true
          ? "\x1D" + "\x56" + "\x30"
          : "\x1D" +
              "\x56" +
              "\x30" +
              "\x10" +
              "\x14" +
              "\x01" +
              "\x00" +
              "\x05"
      );
    } else {
      data.push(
        "\x0A",
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" + "\x0A",
        element.cartNote
          ? "\x0A" + "\x0A" + "Note: " + element.cartNote + "\x0A" + "\x0A"
          : "\x0A" + "\x0A",
        "Payment Method: " + element.paymentMethod + "\x0A" + "\x0A",
        `Total Including (${
          parseFloat(storeDetails.taxRate) >= 0
            ? parseFloat(storeDetails.taxRate)
            : "13"
        }% Tax): ` +
          "$" +
          total.toFixed(2) +
          "\x0A" +
          "\x0A",
        "------------------------------------------" + "\x0A",
        "\x0A",
        "\x0A",
        "\x0A",
        "\x0A",
        "\x0A",
        "\x0A",
        "\x0A",
        "\x0A",
        "\x1D" + "\x56" + "\x30"
      );
    }
  }
  return { data: data, total: total };
}

export { receiptPrint };
export default receiptPrint;
