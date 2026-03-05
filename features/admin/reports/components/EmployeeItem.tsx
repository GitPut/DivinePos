import React from "react";
import { MdPersonOutline } from "react-icons/md";
import { IoChevronForward } from "react-icons/io5";
import { useHistory } from "react-router-dom";
import { Employee } from "types";

interface EmployeeItemProps {
  employee: Employee;
  style?: React.CSSProperties;
}

function EmployeeItem({ employee, style }: EmployeeItemProps) {
  const history = useHistory();

  return (
    <button
      style={{ ...styles.container, ...style }}
      onClick={() => history.push(`/authed/report/editemployee/${employee.id}`)}
    >
      <div style={styles.employeeItemRowLeftContainer}>
        <div style={styles.personIconContainer}>
          <MdPersonOutline style={styles.personIcon} />
        </div>
        <span style={styles.employeeNameLbl}>{employee.name}</span>
      </div>
      <IoChevronForward style={styles.chevronRight} />
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderWidth: 0,
    borderColor: "#cfd0dd",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    background: "none",
    border: "none",
    borderBottom: "1px solid #cfd0dd",
    cursor: "pointer",
    padding: 0,
    width: "100%",
  },
  employeeItemRowLeftContainer: {
    width: 501,
    height: 48,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  personIconContainer: {
    width: 30,
    height: 30,
    backgroundColor: "#eef2ff",
    borderRadius: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  personIcon: {
    color: "rgba(0,0,0,1)",
    fontSize: 29,
  },
  employeeNameLbl: {
    color: "#121212",
    fontSize: 16,
  },
  chevronRight: {
    color: "#909ba5",
    fontSize: 25,
    marginRight: 8,
  },
};

export default EmployeeItem;
