import React, { PureComponent } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const getIntroOfPage = (label: string, orders: string, amount: string) => {
  if (label === "J\n") {
    return `January\nOrders: ${orders}\nRevenue: $${amount}`;
  }
  if (label === "F\n\n") {
    return `February\nOrders: ${orders}\nRevenue: $${amount}`;
  }
  if (label === "M\n\n\n") {
    return `March\nOrders: ${orders}\nRevenue: $${amount}`;
  }
  if (label === "A\n\n\n\n") {
    return `April\nOrders: ${orders}\nRevenue: $${amount}`;
  }
  if (label === "M\n\n\n\n\n") {
    return `May\nOrders: ${orders}\nRevenue: $${amount}`;
  }
  if (label === "J\n\n\n\n\n\n") {
    return `June\nOrders: ${orders}\nRevenue: $${amount}`;
  }
  if (label === "J\n\n\n\n\n\n\n") {
    return `July\nOrders: ${orders}\nRevenue: $${amount}`;
  }
  if (label === "A\n\n\n\n\n\n\n\n") {
    return `August\nOrders: ${orders}\nRevenue: $${amount}`;
  }
  if (label === "S\n\n\n\n\n\n\n\n\n") {
    return `September\nOrders: ${orders}\nRevenue: $${amount}`;
  }
  if (label === "O\n\n\n\n\n\n\n\n\n\n") {
    return `October\nOrders: ${orders}\nRevenue: $${amount}`;
  }
  if (label === "N\n\n\n\n\n\n\n\n\n\n\n") {
    return `November\nOrders: ${orders}\nRevenue: $${amount}`;
  }
  if (label === "D\n\n\n\n\n\n\n\n\n\n\n\n") {
    return `December\nOrders: ${orders}\nRevenue: $${amount}`;
  }
  return "";
};

interface Month {
  name: string;
  uv: number;
  pv: number;
  amt: number;
}

interface BarGraphProps {
  data: Month[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "#1c294e",
          borderRadius: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 10,
        }}
      >
        <span
          style={{
            fontWeight: "600",
            color: "rgba(255,255,255,1)",
            fontSize: 15,
            whiteSpace: "pre-line",
          }}
        >
          {getIntroOfPage(
            label ?? "",
            payload[0].payload.pv,
            payload[0].payload.uv.toFixed(2)
          )}
        </span>
      </div>
    );
  }

  return null;
};

export default class BarGraph extends PureComponent<BarGraphProps> {
  render() {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart width={150} height={50} data={this.props.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" fontFamily="Arial" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="pv" barSize={20} fill="#1c294e" />
        </BarChart>
      </ResponsiveContainer>
    );
  }
}
