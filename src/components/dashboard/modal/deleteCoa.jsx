import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DeleteCoaFn } from "../../custom/coaFn";

const DeleteCoa = ({ show, close, detail }) => {
  const queryClient = useQueryClient()
  const [data] = useState({
    is_group: detail.is_group === "0" ? false : true,
    required: true,
    parent: detail.parent,
    number: detail.number,
    name: detail.name,
    type: detail.type,
    id: detail.id,
  });
  const handleDelete = async (e) => {
    e.preventDefault()
    try {
      await DeleteCoaFn({ id: detail.id })
      queryClient.invalidateQueries({ queryKey: ['coa'] })
      close()
    } catch (err) {
      console.log(err)
    }
  };

  if (!show) return null

  return (
    <>
      <div className="modal_title">
        <b>Delete Confirmation</b>
      </div>
      <div className="modal_content">
        <p>This account will be deleted. Please Check</p>
        <p>
          <b>
            {" "}
            {data.number} - {data.name}
          </b>
        </p>
      </div>
      <div>
        <p>{data.message}</p>
      </div>
      <div>
        <p>
          <small>
            Akun tidak dapat di hapus jika sudah digunakan dalam transaksi.
          </small>
        </p>
      </div>
      {/* Button */}
      <button className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors cursor-pointer" onClick={handleDelete}>
        Delete
      </button>
      <button className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors cursor-pointer ml-2" onClick={(e) => { e.preventDefault(); close(); }}>
        Cancel
      </button>
    </>
  );
};

export default DeleteCoa;
