import React from "react";

interface HeaderTxtProps {
  Txt: string;
  SubTxt: string;
}

function HeaderTxt({ Txt, SubTxt }: HeaderTxtProps) {
  return (
    <div style={styles.container}>
      <span style={styles.text}>{Txt}</span>
      <span style={styles.subTxt}>{SubTxt}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 32,
  },
  text: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 26,
    textAlign: "center",
  },
  subTxt: {
    fontWeight: "400",
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
  },
};

export default HeaderTxt;
