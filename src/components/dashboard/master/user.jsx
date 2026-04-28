import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reqUser } from "../../reqFetch";
import AddUser from "../modal/addUser";

const User = () => {
  const [add, setAdd] = useState(false);

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({ queryKey: ['user'], queryFn: reqUser });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error! {error.message}</div>;

  return (
    <>
      <div
        className="w-full"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <div className="__content_title">User</div>
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
        <div className="md:w-5/12">Email</div>
        <div className="md:w-1/4">Name</div>
        <div className="md:w-1/4">Role</div>
      </div>
      {user &&
        user.map((e, i) => (
          <div className="__list_item flex flex-wrap" key={i}>
            <div className="md:w-5/12">{e.email}</div>
            <div className="md:w-1/4">{e.name}</div>
            <div className="md:w-1/4">{e.role}</div>
          </div>
        ))}
      {add && <AddUser show={add} close={() => setAdd(false)} />}
    </>
  );
};

export default User;
