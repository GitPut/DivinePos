import React, { useState } from "react";
import EmployeeItem from "./components/EmployeeItem";
import { employeesState } from "store/appState";
import Modal from "shared/components/ui/Modal";
import AddEmployeeModal from "./modals/AddEmployeeModal";

const EmployeesReport = () => {
    const employees = employeesState.use()
    const [addEmployeeModal, setaddEmployeeModal] = useState(false)

    return (
        <div style={styles.container}>
            <div style={styles.topRow}>
                <span style={styles.employeeReportTopHeaderTxt}>Employee Report</span>
                <button style={styles.addEmployeeBtn} onClick={() => setaddEmployeeModal(true)}>
                    <span style={styles.addEmployeeBtnLbl}>Add Employee</span>
                </button>
            </div>
            <div style={styles.employeeMapContainer}>
                <div style={styles.innerMapContainer}>
                    <div style={styles.employeeNameTopRowHeader}>
                        <span style={styles.employeeNameHeader}>Employee Name</span>
                    </div>
                    <div style={styles.employeeMap}>
                        <div style={{ overflow: "auto", ...styles.employeeMap_contentContainerStyle }}>
                            {employees.length > 0 ?
                                employees.map((employee, index) =>
                                    <EmployeeItem key={index} style={styles.employeeItem} employee={employee} />)
                                :
                                <span>No Employees</span>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                isVisible={addEmployeeModal}
                onBackdropPress={() => setaddEmployeeModal(false)}
            >
                <div
                    style={{
                        display: "flex",
                        flex: 1,
                        height: "100%",
                        width: "100%",
                        position: "absolute",
                        left: 0,
                        top: 0,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <AddEmployeeModal setaddEmployeeModal={setaddEmployeeModal} addEmployeeModal={addEmployeeModal} />
                </div>
            </Modal>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        width: '100%',
        height: 506,
        paddingRight: 20
    },
    topRow: {
        width: '100%',
        height: 48,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    employeeReportTopHeaderTxt: {
        fontWeight: '700',
        color: "#121212",
        fontSize: 16
    },
    addEmployeeBtn: {
        width: 172,
        height: 48,
        backgroundColor: "#1c294e",
        borderRadius: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        cursor: "pointer",
    },
    addEmployeeBtnLbl: {
        color: "rgba(255,255,255,1)",
        fontSize: 14
    },
    employeeMapContainer: {
        height: 417,
        border: "1px solid #bdbfc9",
        boxShadow: "3px 3px 20px rgba(197, 199, 209, 1)",
        display: "flex",
        alignItems: "center",
        marginTop: 41,
        backgroundColor: 'white',
    },
    innerMapContainer: {
        height: 301,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        marginTop: 32,
        width: '95%'
    },
    employeeNameTopRowHeader: {
        width: '100%',
        height: 36,
        borderBottom: "1px solid #cbcdda",
        display: "flex",
        justifyContent: "flex-start",
        paddingRight: 20
    },
    employeeNameHeader: {
        fontWeight: '700',
        color: "#61656f"
    },
    employeeMap: {
        height: 266
    },
    employeeMap_contentContainerStyle: {
        height: 266,
        width: '100%',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingRight: 20
    },
    employeeItem: {
        height: 66,
        width: '100%'
    },
};

export default EmployeesReport;
