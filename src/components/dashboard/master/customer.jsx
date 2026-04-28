import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reqCustomer } from "../../reqFetch";
import AddCustomer from "../modal/addCustomer";
import EditCustomer from "../modal/editCustomer";

const Customer = () => {
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(false);
  const [detail, setDetail] = useState(null);

  const {
    data: customer,
    isLoading,
    isError,
    error,
  } = useQuery({ queryKey: ['customer'], queryFn: reqCustomer });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error! {error.message}</div>;

  return (
    <>
      <div
        className="w-full"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <div className="__content_title">Customer</div>
        <div style={{ display: "flex" }}>
          <div className="col" style={{ display: "flex", alignItems: "center" }}>
            <button
              className="m-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors cursor-pointer"
              onClick={() => setAdd(true)}
            >
              <i className="bi bi-plus"></i>
              New
            </button>
          </div>
        </div>
      </div>
      <hr style={{ margin: "0" }} />
      <div className="__list_title flex flex-wrap">
        <div className="md:w-1/4">Code</div>
        <div className="md:w-5/12">Name</div>
        <div className="md:w-1/6">Action</div>
      </div>
      {customer &&
        customer.map((e, i) => (
          <div className="__list_item flex flex-wrap" key={i}>
            <div className="md:w-1/4">{e.code}</div>
            <div className="md:w-5/12">{e.name}</div>
            <div className="md:w-1/6">
              <i
                className="bi bi-pencil-square"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setDetail(e);
                  setEdit(true);
                }}
              ></i>
            </div>
          </div>
        ))}
      {add && <AddCustomer show={add} close={() => setAdd(false)} />}
      {edit && (
        <EditCustomer
          show={edit}
          close={() => setEdit(false)}
          detail={detail}
        />
      )}
    </>
  );
};

export default Customer;
