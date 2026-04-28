import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { reqCoa, reqPeriod } from "../../reqFetch";
import useDate from "../../useDate";
import Modal from "../../site/modal";
import {
  AddJournalEntryFn,
  AddJournalFn,
  GetJournalLastFn,
} from "../../custom/accFn";
import { AddAssetsFn } from "../../custom/assetsFn";
import { useAuth } from "../../../context/AuthContext";

const AddAssets = (props) => {
  const { loginUser, companyId: company } = useAuth();
  const { YY, MM, DD } = useDate();
  const navigate = useNavigate();

  const { data: coa } = useQuery({ queryKey: ['coa'], queryFn: reqCoa });
  const { data: periodList } = useQuery({ queryKey: ['period'], queryFn: reqPeriod });

  const activePeriod = periodList?.find(p => p.status === '1') ?? periodList?.[0];
  let period = activePeriod?.name ?? '';

  let coaFil = useMemo(
    () => coa?.filter((f) => f.type === "Assets" && f.is_group === "0"),
    [coa]
  );
  const [data, setData] = useState({
    required: true,
    code: "",
    name: "",
    qty: "",
    lifetime: "",
    date: YY + "-" + MM + "-" + DD,
    acc: "",
    init_value: "",
    eco_value: "",
    description: "",
    posting_date: "",
    company: company,
    created_by: loginUser,
    message: "",
  });
  const [vis, setVis] = useState({ modal: false });
  const handleChange = (e) => {
    console.log(`${[e.target.name]}`, e.target.value);
    let nam = e.target.name;
    if (nam === "init_value") {
      let eco = 0;
      eco = Math.round((data.init_value * data.qty) / (data.lifetime * 12));
      setData({
        ...data,
        [e.target.name]: e.target.value,
        eco_value: eco,
      });
    } else {
      setData({
        ...data,
        [e.target.name]: e.target.value,
      });
    }
  };
  const handleClose = (e) => {
    console.log(data);
    props.handleClose(e);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    let assets = { ...data, id: +new Date() };
    console.log(assets);
    try {
      let res = await AddAssetsFn(assets);
      let last = await GetJournalLastFn("Depreciation");
      let journal = {
        name: `DP/${period}/${last.last}`,
        user_remark: data.name + " \n" + data.description,
        title: assets.code + " - " + assets.name,
        type: "Depreciation",
        ref: "Assets",
        ref_id: assets.id,
        posting_date: data.posting_date,
        company: company,
        created_by: loginUser,
        total_debit: data.eco_value,
        total_credit: data.eco_value,
      };
      let entry = [
        {
          idx: "1",
          parent: journal.name,
          acc: "511",
          debit: data.eco_value,
          posting_date: data.posting_date,
          company: company,
        },
        {
          idx: "2",
          parent: journal.name,
          acc: data.acc,
          credit: data.eco_value,
          posting_date: data.posting_date,
          company: company,
        },
      ];
      let resJournal = await AddJournalFn(journal);
      let resEntry1 = await AddJournalEntryFn(entry[0]);
      let resEntry2 = await AddJournalEntryFn(entry[1]);
      console.log(res, resJournal, resEntry1, resEntry2);
      setVis({ ...vis, modal: true, msg: "Assets added successfully" });
    } catch (error) {
      console.log(error);
      setVis({ ...vis, modal: true, msg: error.message });
    }
  };
  return (
    <>
      <Modal
        modal={vis.modal}
        title={""}
        element={<>{vis.msg}</>}
        handleClose={(e) => {
          setVis({ modal: false });
          navigate(0);
        }}
      />
      <form onSubmit={handleSubmit} method="post">
        <div className="flex flex-wrap w-full" style={{ margin: "0px", padding: "0px" }}>
          {/* Asset Code */}
          <div className="flex flex-wrap md:w-4/12 w-full" style={{ margin: "0px", padding: "0px" }}>
            <label className="label_title">
              Code <span className="text-red-500">*</span>
            </label>
            <input
              required={data.required}
              onChange={handleChange}
              type="text"
              className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
              value={data.code}
              name="code"
              id="code"
            />
          </div>
          {/* Customer Name */}
          <div className="flex flex-wrap md:w-4/12 w-full" style={{ margin: "0px", padding: "0px" }}>
            <label className="label_title">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              required={data.required}
              onChange={handleChange}
              type="text"
              className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
              value={data.name}
              name="name"
              id="name"
            />
          </div>
          {/* Purchase Date */}
          <div className="flex flex-wrap md:w-4/12 w-full" style={{ margin: "0px", padding: "0px" }}>
            <label className="label_title">
              Purchase Date<span className="text-red-500">*</span>
            </label>
            <input
              required={data.required}
              onChange={handleChange}
              type="date"
              className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
              value={data.date}
              name="date"
              id="date"
            />
          </div>
        </div>
        <div className="flex flex-wrap w-full" style={{ margin: "0px", padding: "0px" }}>
          {/* Customer Quantity */}
          <div className="flex flex-wrap md:w-2/12 w-full" style={{ margin: "0px", padding: "0px" }}>
            <label className="label_title">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              required={data.required}
              onChange={handleChange}
              onBlur={handleChange}
              type="tel"
              className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
              value={data.qty}
              name="qty"
              id="qty"
            />
          </div>
          {/* Customer lifetime */}
          <div className="flex flex-wrap md:w-2/12 w-full" style={{ margin: "0px", padding: "0px" }}>
            <label className="label_title">
              Lifetime <span className="text-red-500">*</span>
            </label>
            <input
              required={data.required}
              onChange={handleChange}
              onBlur={handleChange}
              type="number"
              className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
              value={data.lifetime}
              name="lifetime"
              id="lifetime"
            />
          </div>
          {/* Initial Value */}
          <div className="flex flex-wrap md:w-4/12 w-full" style={{ margin: "0px", padding: "0px" }}>
            <label className="label_title">
              Initial Value <span className="text-red-500">*</span>
            </label>
            <input
              required={data.required}
              readOnly={data.qty === "" && data.lifetime === ""}
              onChange={handleChange}
              onBlur={handleChange}
              type="tel"
              className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
              value={data.init_value}
              name="init_value"
              id="init_value"
            />
          </div>
          {/* Economic Value */}
          <div className="flex flex-wrap md:w-4/12 w-full" style={{ margin: "0px", padding: "0px" }}>
            <label className="label_title">Economic Value</label>
            <input
              onChange={handleChange}
              readOnly={true}
              type="number"
              className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
              value={data.eco_value}
              name="eco_value"
              id="eco_value"
            />
          </div>
        </div>

        <div className="w-full" style={{ height: "25px" }}></div>
        <p>
          <b>Accounting details</b>
        </p>
        <hr />
        <div className="flex flex-wrap w-full" style={{ margin: "0px", padding: "0px" }}>
          <div className="flex flex-wrap md:w-1/2 w-full" style={{ margin: "0px", padding: "0px" }}>
            <label className="label_title">
              Account <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              list="coa"
              className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
              name="acc"
              value={data.acc}
              onChange={handleChange}
            />
            <datalist id="coa">
              {coaFil &&
                coaFil.map((d, key) => (
                  <option key={key} value={d.number}>
                    {d.number + " - " + d.name}
                  </option>
                ))}
            </datalist>
          </div>
          <div className="flex flex-wrap md:w-1/2 w-full" style={{ margin: "0px", padding: "0px" }}>
            <label className="label_title">
              Posting Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
              name="posting_date"
              value={data.posting_date}
              onChange={handleChange}
            />
          </div>
        </div>
        {/* Description */}
        <div className="flex flex-wrap w-full mb-5" style={{ margin: "0px", padding: "0px" }}>
          <label className="label_title">Description</label>
          <input
            onChange={handleChange}
            type="text"
            className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
            value={data.description}
            name="description"
            id="description"
          />
        </div>
        <div>
          <p>{data.message}</p>
        </div>
        {/* Button */}
        <button className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors cursor-pointer" type="submit">
          Save
        </button>
        <button className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-lg transition-colors cursor-pointer ml-2" onClick={handleClose}>
          Cancel
        </button>
      </form>
    </>
  );
};

export default AddAssets;
