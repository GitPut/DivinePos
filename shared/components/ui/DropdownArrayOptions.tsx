import React, { useEffect, useRef, useState } from "react";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { MdClear } from "react-icons/md";

interface DropdownArrayOptionsProps {
  placeholder: string;
  value: string | null;
  setValue: (
    val?: { label: string; value?: string; id?: string },
    index?: number
  ) => void;
  options: { label: string; value?: string; id?: string }[];
  scrollY: number;
}

function DropdownArrayOptions(
  props: DropdownArrayOptionsProps
): JSX.Element {
  const { placeholder, value, setValue, options, scrollY } = props;
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const [openDropdown, setopenDropdown] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 190,
  });

  useEffect(() => {
    if (openDropdown && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom, left: rect.left, width: rect.width });
    }
  }, [openDropdown, scrollY]);

  return (
    <div>
      <button
        style={styles.dropdown}
        onClick={() => setopenDropdown((prev) => !prev)}
        ref={dropdownRef}
      >
        <span style={value ? styles.selectedText : styles.placeholder}>
          {value ? value : placeholder}
        </span>
        {value ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setValue();
            }}
            style={{ marginTop: 5, marginRight: 5, background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <MdClear size={24} color="red" />
          </button>
        ) : (
          openDropdown ? (
            <FiChevronUp style={styles.downIcon} />
          ) : (
            <FiChevronDown style={styles.downIcon} />
          )
        )}
      </button>
      {openDropdown && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 100000,
            }}
            onClick={() => setopenDropdown(false)}
          />
          <div
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              zIndex: 100001,
              backgroundColor: "white",
              borderRadius: 5,
              border: "1px solid #9e9e9e",
              maxHeight: 200,
              overflowY: "auto",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {options.map((option, listIndex) => (
              <button
                key={listIndex}
                onClick={() => {
                  setValue(option, listIndex);
                  setopenDropdown(false);
                }}
                style={{
                  width: "100%",
                  height: 42,
                  backgroundColor: "white",
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  ...(listIndex < options.length - 1
                    ? { borderBottom: "1px solid #e5e5e5" }
                    : {}),
                }}
              >
                <span style={styles.optionText}>{option.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  dropdown: {
    width: 190,
    height: 50,
    backgroundColor: "rgba(255,255,255,1)",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 5,
    border: "1px solid #9e9e9e",
    paddingLeft: 10,
    paddingRight: 10,
    cursor: "pointer",
    outline: "none",
  },
  placeholder: {
    color: "grey",
    fontSize: 14,
  },
  selectedText: {
    color: "#1e293b",
    fontSize: 14,
  },
  optionText: {
    color: "#1e293b",
    fontSize: 14,
  },
  downIcon: {
    color: "rgba(128,128,128,1)",
    fontSize: 30,
    margin: 0,
    marginTop: 2,
    marginRight: 2,
  },
};

export default DropdownArrayOptions;
