import React from "react";
import PageTitle from "../components/Typography/PageTitle";
import CustomersTable from "../components/CustomersTable";

const Customers = () => {
  return (
    <div>
      <PageTitle>Administrar Clientes</PageTitle>
      <CustomersTable resultsPerPage={10} />
    </div>
  );
};

export default Customers;

