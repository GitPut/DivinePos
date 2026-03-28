import React from "react";

interface InputFieldProps {
  lbl: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: React.CSSProperties | React.CSSProperties[];
}

function InputField({
  lbl,
  placeholder,
  value,
  onChangeText,
  style,
}: InputFieldProps) {
  const combinedStyle: React.CSSProperties = Array.isArray(style)
    ? Object.assign({}, styles.container, ...style)
    : { ...styles.container, ...style };

  return (
    <div style={combinedStyle}>
      <span style={styles.storeName}>{lbl}</span>
      <input
        style={styles.uRlBox1}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  storeName: {
    fontWeight: "700",
    color: "#020202",
    fontSize: 17,
    height: 20,
    alignSelf: "stretch",
    display: "inline-block",
  },
  uRlBox1: {
    width: "100%",
    height: 50,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#9b9b9b",
    padding: 10,
    boxSizing: "border-box",
  },
};

export default InputField;
