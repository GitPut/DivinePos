import React from "react";

interface InputWithLabelProps {
  lbl: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  CustomInput?: React.FC;
  onBlur?: () => void;
}

function InputWithLabel({
  lbl,
  placeholder,
  value,
  onChangeText,
  CustomInput,
  onBlur,
}: InputWithLabelProps) {
  return (
    <div style={styles.container}>
      <span style={styles.storeName}>{lbl}</span>
      {!CustomInput ? (
        <input
          style={styles.uRlBox1}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChangeText?.(e.target.value)}
          onBlur={onBlur}
        />
      ) : (
        <CustomInput />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: 80,
    width: "100%",
  },
  storeName: {
    fontWeight: "700",
    color: "#020202",
    fontSize: 17,
    height: 20,
    alignSelf: "stretch",
    display: "block",
  },
  uRlBox1: {
    width: "100%",
    height: 50,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    border: "1px solid #9b9b9b",
    padding: 10,
    boxSizing: "border-box",
  },
};

export default InputWithLabel;
