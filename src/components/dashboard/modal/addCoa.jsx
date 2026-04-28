import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { reqCoa } from "../../reqFetch";
import { AddCoaFn } from "../../custom/coaFn";
import { useAuth } from "../../../context/AuthContext";

const AddCoa = ({ show, close }) => {
  const { companyId } = useAuth();
  const queryClient = useQueryClient();
  const [data, setData] = useState({
    number: "",
    name: "",
    type: "",
    parent: "0",
    is_group: 0,
  });

  const { data: coa } = useQuery({ queryKey: ['coa'], queryFn: reqCoa });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await AddCoaFn({ ...data, company_id: companyId });
      queryClient.invalidateQueries({ queryKey: ['coa'] });
      close();
    } catch (err) {
      console.log(err);
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="bg-[#212529] text-white rounded-lg p-6"
        style={{ minWidth: "400px" }}
      >
        <div className="flex justify-between items-center mb-4">
          <h5>Add Chart of Account</h5>
          <button onClick={close} className="text-white cursor-pointer">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-wrap mb-3">
            <label className="md:w-1/3 flex items-center">Number</label>
            <div className="md:w-2/3">
              <input
                type="text"
                className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                value={data.number}
                onChange={(e) => setData({ ...data, number: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-wrap mb-3">
            <label className="md:w-1/3 flex items-center">Name</label>
            <div className="md:w-2/3">
              <input
                type="text"
                className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-wrap mb-3">
            <label className="md:w-1/3 flex items-center">Type</label>
            <div className="md:w-2/3">
              <select
                className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                value={data.type}
                onChange={(e) => setData({ ...data, type: e.target.value })}
              >
                <option value="">Select Type</option>
                <option value="Assets">Assets</option>
                <option value="Liability">Liability</option>
                <option value="Equity">Equity</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap mb-3">
            <label className="md:w-1/3 flex items-center">Parent</label>
            <div className="md:w-2/3">
              <input
                type="text"
                className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                list="coa-list"
                value={data.parent}
                onChange={(e) => setData({ ...data, parent: e.target.value })}
              />
              <datalist id="coa-list">
                {coa && coa.map((e, i) => (
                  <option key={i} value={e.number}>{e.name}</option>
                ))}
              </datalist>
            </div>
          </div>
          <div className="flex flex-wrap mb-3">
            <label className="md:w-1/3 flex items-center">Is Group</label>
            <div className="md:w-2/3 flex items-center">
              <input
                type="checkbox"
                checked={data.is_group === 1}
                onChange={(e) =>
                  setData({ ...data, is_group: e.target.checked ? 1 : 0 })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={close}
              className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCoa;
