import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Invoices from "./Invoices";
import EmployeesReport from "./EmployeesList";
import EditEmployee from "./EditEmployee";

const ReportsPage = ({ match }: { match: { url: string } }) => (
  <Switch>
    <Redirect
      exact
      from={`${match.url}/`}
      to={`${match.url}/purchaseorderreport`}
    />
    <Route path={`${match.url}/invoicereport`} component={Invoices} />
    <Route path={`${match.url}/employeesreport`} component={EmployeesReport} />
    <Route
      path={`${match.url}/editemployee/:employeeId`}
      component={EditEmployee}
    />
  </Switch>
);

export default ReportsPage;
