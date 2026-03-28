import React from "react";

interface InputFieldProps {
  style?: React.CSSProperties;
  value: string;
  setValue: (val: string) => void;
  lbl?: string;
  placeholder?: string;
}

function InputField({ style, value, setValue, lbl, placeholder }: InputFieldProps) {
  return (
    <div style={{ ...styles.container, ...style }}>
      <span style={styles.lbl}>{lbl}</span>
      <input
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
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
  lbl: {
    color: "#121212",
    fontSize: 16,
  },
  input: {
    width: 278,
    height: 50,
    borderRadius: 6,
    border: "1px solid #9b9b9b",
    padding: 10,
    boxSizing: "border-box",
  },
};

export default InputField;
