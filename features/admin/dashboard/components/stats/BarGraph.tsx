import React, { PureComponent } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Month {
  name: string;
  uv: number;
  pv: number;
  amt: number;
}

interface BarGraphProps {
  data: Month[];
}

const MONTH_NAMES: Record<string, string> = {
  Jan: "January",
  Feb: "February",
  Mar: "March",
  Apr: "April",
  May: "May",
  Jun: "June",
  Jul: "July",
  Aug: "August",
  Sep: "September",
  Oct: "October",
  Nov: "November",
  Dec: "December",
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const fullMonth = MONTH_NAMES[label ?? ""] || label;
    return (
      <div
        style={{
          backgroundColor: "#0f172a",
          borderRadius: 8,
          padding: "10px 14px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <span
          style={{
            fontWeight: "600",
            color: "#fff",
            fontSize: 13,
            display: "block",
            marginBottom: 4,
          }}
        >
          {fullMonth}
        </span>
        <span style={{ color: "#94a3b8", fontSize: 12, display: "block" }}>
          Orders: {payload[0].payload.pv}
        </span>
        <span style={{ color: "#94a3b8", fontSize: 12, display: "block" }}>
          Revenue: ${payload[0].payload.uv.toFixed(2)}
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
        <BarChart data={this.props.data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#94a3b8" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
          <Bar dataKey="pv" barSize={24} fill="#1470ef" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }
}
