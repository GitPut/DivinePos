import React from "react";
import { IoPerson } from "react-icons/io5";
import { MdStore } from "react-icons/md";
import { FiLink } from "react-icons/fi";

interface StageIconBarProps {
  stageNum: number;
}

const StageIconBar = ({ stageNum }: StageIconBarProps) => {
  return (
    <div
      style={{
        flexDirection: "row",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={
          1 <= stageNum
            ? styles.ActiveIconContainer
            : styles.notActiveIconContainer
        }
      >
        <IoPerson size={35} color="rgba(255,255,255,1)" />
      </div>
      <div
        style={
          2 <= stageNum ? styles.greyDivider : styles.darkGreyDivider
        }
      />
      <div
        style={
          2 <= stageNum
            ? styles.ActiveIconContainer
            : styles.notActiveIconContainer
        }
      >
        <MdStore size={35} color="rgba(255,255,255,1)" />
      </div>
      <div
        style={
          3 <= stageNum ? styles.greyDivider : styles.darkGreyDivider
        }
      />
      <div
        style={
          3 <= stageNum
            ? styles.ActiveIconContainer
            : styles.notActiveIconContainer
        }
      >
        <FiLink size={35} color="rgba(255,255,255,1)" />
      </div>
    </div>
  );
};

export default StageIconBar;

const styles: Record<string, React.CSSProperties> = {
  ActiveIconContainer: {
    width: 66,
    height: 66,
    backgroundColor: "rgba(51,81,243,1)",
    borderRadius: 33,
    boxShadow: "3px 3px 30px rgba(0,0,0,0.54)",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  icon: {
    color: "rgba(255,255,255,1)",
    fontSize: 35,
  },
  notActiveIconContainer: {
    width: 66,
    height: 66,
    backgroundColor: "rgba(208,213,243,1)",
    borderRadius: 33,
    boxShadow: "3px 3px 50px rgba(0,0,0,0.61)",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  greyDivider: {
    width: 71,
    height: 5,
    backgroundColor: "rgba(155,155,155,1)",
  },
  darkGreyDivider: {
    width: 71,
    height: 5,
    backgroundColor: "rgba(155,155,155,1)",
    opacity: 0.15,
  },
};
