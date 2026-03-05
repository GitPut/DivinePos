import React from "react";

interface HeaderTxtProps {
  Txt: string;
  SubTxt: string;
}

function HeaderTxt({Txt, SubTxt} : HeaderTxtProps) {
  return (
    <div style={styles.container}>
      <span style={styles.text}>{Txt}</span>
      <span style={styles.subTxt}>{SubTxt}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    height: 74,
    marginBottom: 10,
  },
  text: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 38,
  },
  subTxt: {
    fontWeight: "700",
    color: "#1c294e",
    fontSize: 22,
  },
};

export default HeaderTxt;
