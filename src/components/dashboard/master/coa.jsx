import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reqCoa } from "../../reqFetch";
import AddCoa from "../modal/addCoa";
import EditCoa from "../modal/editCoa";
import DeleteCoa from "../modal/deleteCoa";

const Coa = () => {
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  const [detail, setDetail] = useState(null);

  const {
    data: coa,
    isLoading,
    isError,
    error,
  } = useQuery({ queryKey: ['coa'], queryFn: reqCoa });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error! {error.message}</div>;

  return (
    <>
      <div
        className="w-full"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <div className="__content_title">Chart of Accounts</div>
        <div className="" style={{ display: "flex" }}>
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
        <div className="w-1/6">Number</div>
        <div className="md:w-5/12">Name</div>
        <div className="w-1/6">Type</div>
        <div className="w-1/6">Parent</div>
        <div className="w-1/6">Action</div>
      </div>
      {coa &&
        coa.map((e, i) => (
          <div className="__list_item flex flex-wrap" key={i}>
            <div className="w-1/6">{e.number}</div>
            <div className="md:w-5/12">{e.name}</div>
            <div className="w-1/6">{e.type}</div>
            <div className="w-1/6">{e.parent}</div>
            <div className="w-1/6">
              <i
                className="bi bi-pencil-square"
                style={{ marginRight: "5px", cursor: "pointer" }}
                onClick={() => {
                  setDetail(e);
                  setEdit(true);
                }}
              ></i>
              <i
                className="bi bi-trash"
                style={{ cursor: "pointer", color: "crimson" }}
                onClick={() => {
                  setDetail(e);
                  setDel(true);
                }}
              ></i>
            </div>
          </div>
        ))}
      {add && <AddCoa show={add} close={() => setAdd(false)} />}
      {edit && (
        <EditCoa show={edit} close={() => setEdit(false)} detail={detail} />
      )}
      {del && (
        <DeleteCoa show={del} close={() => setDel(false)} detail={detail} />
      )}
    </>
  );
};

export default Coa;
