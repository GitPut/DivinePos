import React, { memo } from "react";

type FieldInputProps = {
  style?: React.CSSProperties | (React.CSSProperties | false | undefined)[];
  label?: string;
  customInput?: React.ComponentType<any>;
  customInputProps?: object;
  txtInput?: string;
  value?: string;
  textContentType?:
    | "none"
    | "URL"
    | "addressCity"
    | "addressCityAndState"
    | "addressState"
    | "countryName"
    | "creditCardNumber"
    | "emailAddress"
    | "familyName"
    | "fullStreetAddress"
    | "givenName"
    | "jobTitle"
    | "location"
    | "middleName"
    | "name"
    | "namePrefix"
    | "nameSuffix"
    | "nickname"
    | "organizationName"
    | "postalCode"
    | "streetAddressLine1"
    | "streetAddressLine2"
    | "sublocality"
    | "telephoneNumber"
    | "username"
    | "password"
    | "newPassword"
    | "oneTimeCode";
  onChangeText?: (text: string) => void;
  maxLength?: number;
};

function mergeStyles(
  ...styles: (React.CSSProperties | false | undefined | (React.CSSProperties | false | undefined)[])[]
): React.CSSProperties {
  const result: React.CSSProperties = {};
  for (const s of styles) {
    if (Array.isArray(s)) {
      Object.assign(result, mergeStyles(...s));
    } else if (s) {
      Object.assign(result, s);
    }
  }
  return result;
}

const FieldInput = memo((props: FieldInputProps) => {
  const containerStyle = Array.isArray(props.style)
    ? mergeStyles(styles.container, ...props.style)
    : mergeStyles(styles.container, props.style);

  return (
    <div style={containerStyle}>
      <span style={styles.label}>{props.label || "Label"}</span>
      {props.customInput ? (
        React.createElement(props.customInput, {
          ...props.customInputProps,
        })
      ) : (
        <input
          placeholder={props.txtInput || "Placeholder"}
          style={styles.txtInput}
          value={props.value}
          onChange={(e) => props.onChangeText?.(e.target.value)}
          maxLength={props.maxLength}
        />
      )}
    </div>
  );
}, areEqual);

FieldInput.displayName = "FieldInput";

function areEqual(
  prevProps: FieldInputProps,
  nextProps: FieldInputProps
) {
  return prevProps.value === nextProps.value;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    justifyContent: "space-between",
    gap: 6,
  },
  label: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "600",
  },
  txtInput: {
    color: "#0f172a",
    height: 52,
    fontSize: 15,
    alignSelf: "stretch",
    padding: "0 16px",
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s ease",
  },
};

export default FieldInput;
