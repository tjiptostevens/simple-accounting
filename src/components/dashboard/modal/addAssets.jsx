import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "../../useFetch";
import useDate from "../../useDate";
import Modal from "../../site/modal";
import {
  AddJournalEntryFn,
  AddJournalFn,
  GetJournalLastFn,
} from "../../custom/accFn";
import { AddAssetsFn } from "../../custom/assetsFn";

const AddAssets = (props) => {
  const { YY, MM, DD } = useDate();
  const navigate = useNavigate();
  let a = JSON.parse(localStorage.getItem("period"));
  let period = a.name;

  const { data: coa } = useFetch("getcoa.php");
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
    company: localStorage.getItem("company"),
    created_by: localStorage.getItem("loginUser"),
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
    // e.preventDefault()
    console.log(data);
    // setData({ ...data, required: !data.required })
    // navigate(0)
    // window.location.reload()
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
        company: localStorage.getItem("company"),
        created_by: localStorage.getItem("loginUser"),
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
          company: localStorage.getItem("company"),
        },
        {
          idx: "2",
          parent: journal.name,
          acc: data.acc,
          credit: data.eco_value,
          posting_date: data.posting_date,
          company: localStorage.getItem("company"),
        },
      ];
      let res1 = await AddJournalFn(journal);
      await AddJournalEntryFn(entry[0]);
      await AddJournalEntryFn(entry[1]);
      setVis({ modal: true, message: res.message });
      setData({
        required: true,
        id: assets.id,
        code: "",
        name: "",
        qty: "",
        lifetime: "",
        date: YY + "-" + MM + "-" + DD,
        acc: "",
        init_value: "",
        eco_value: "",
        description: "",
        company: localStorage.getItem("company"),
        created_by: localStorage.getItem("loginUser"),
        message: res.message,
      });
    } catch (error) {
      setVis({ modal: false, message: error.message });
      setData({
        ...data,
        id: assets.id,
        msg: error.message,
      });
    }
  };
  return (
    <>
      {/* {JSON.stringify(data)} <br /> */}
      {/* {console.log(props)} */}
      {/* {JSON.stringify(coaFil)} */}
      <Modal
        modal={vis.modal}
        title=""
        element={
          <>
            <p>{vis.message}</p>
          </>
        }
        handleClose={() => setVis({ modal: false })}
      />
      <form onSubmit={handleSubmit} method="post">
        <div className="w-100" style={{ height: "25px" }}></div>
        <p>
          <b>Assets details</b>
        </p>
        <hr />
        <div
          className="row col-md-12"
          style={{ margin: "0px", padding: "0px" }}
        >
          {/* Customer Code */}
          <div
            className="row col-md-4"
            style={{ margin: "0px", padding: "0px" }}
          >
            <label className="label_title">
              Code <span className="text-danger">*</span>
            </label>
            <input
              required={data.required}
              onChange={handleChange}
              type="text"
              className="form-control mb-2"
              value={data.code}
              name="code"
              id="code"
            />
          </div>
          {/* Customer Name */}
          <div
            className="row col-md-4"
            style={{ margin: "0px", padding: "0px" }}
          >
            <label className="label_title">
              Name <span className="text-danger">*</span>
            </label>
            <input
              required={data.required}
              onChange={handleChange}
              type="text"
              className="form-control mb-2"
              value={data.name}
              name="name"
              id="name"
            />
          </div>
          {/* Purchase Date */}
          <div
            className="row col-md-4"
            style={{ margin: "0px", padding: "0px" }}
          >
            <label className="label_title">
              Purchase Date<span className="text-danger">*</span>
            </label>
            <input
              required={data.required}
              onChange={handleChange}
              type="date"
              className="form-control mb-2"
              value={data.date}
              name="date"
              id="date"
            />
          </div>
        </div>
        <div
          className="row col-md-12"
          style={{ margin: "0px", padding: "0px" }}
        >
          {/* Customer Quantity */}
          <div
            className="row col-md-2"
            style={{ margin: "0px", padding: "0px" }}
          >
            <label className="label_title">
              Quantity <span className="text-danger">*</span>
            </label>
            <input
              required={data.required}
              onChange={handleChange}
              onBlur={handleChange}
              type="tel"
              className="form-control mb-2"
              value={data.qty}
              name="qty"
              id="qty"
            />
          </div>
          {/* Customer lifetime */}
          <div
            className="row col-md-2"
            style={{ margin: "0px", padding: "0px" }}
          >
            <label className="label_title">
              Lifetime <span className="text-danger">*</span>
            </label>
            <input
              required={data.required}
              onChange={handleChange}
              onBlur={handleChange}
              type="number"
              className="form-control mb-2"
              value={data.lifetime}
              name="lifetime"
              id="lifetime"
            />
          </div>
          {/* Initial Value */}
          <div
            className="row col-md-4"
            style={{ margin: "0px", padding: "0px" }}
          >
            <label className="label_title">
              Initial Value <span className="text-danger">*</span>
            </label>
            <input
              required={data.required}
              readOnly={data.qty === "" && data.lifetime === ""}
              onChange={handleChange}
              onBlur={handleChange}
              type="tel"
              className="form-control mb-2"
              value={data.init_value}
              name="init_value"
              id="init_value"
            />
          </div>
          {/* Customer Date */}
          <div
            className="row col-md-4"
            style={{ margin: "0px", padding: "0px" }}
          >
            <label className="label_title">Economic Value</label>
            <input
              onChange={handleChange}
              readOnly={true}
              type="number"
              className="form-control mb-2"
              value={data.eco_value}
              name="eco_value"
              id="eco_value"
            />
          </div>
        </div>

        <div className="w-100" style={{ height: "25px" }}></div>
        <p>
          <b>Accounting details</b>
        </p>
        <hr />
        <div
          className="row col-md-12"
          style={{ margin: "0px", padding: "0px" }}
        >
          <div
            className="row col-md-6"
            style={{ margin: "0px", padding: "0px" }}
          >
            <label className="label_title">
              Account <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              list="coa"
              className="form-control mb-2"
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
          <div
            className="row col-md-6"
            style={{ margin: "0px", padding: "0px" }}
          >
            <label className="label_title">
              Posting Date <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              className="form-control mb-2"
              name="posting_date"
              value={data.posting_date}
              onChange={handleChange}
            />
          </div>
        </div>
        {/* Customer Address */}
        <div
          className="row col-md-12 mb-5"
          style={{ margin: "0px", padding: "0px" }}
        >
          <label className="label_title">Description</label>
          <input
            onChange={handleChange}
            type="text"
            className="form-control mb-2"
            value={data.description}
            name="description"
            id="description"
          />
        </div>
        <div>
          <p>{data.message}</p>
        </div>
        {/* Button */}
        <button className="btn btn-primary" type="submit">
          Save
        </button>
        <button className="btn btn-warning" onClick={handleClose}>
          Cancel
        </button>
      </form>
    </>
  );
};

export default AddAssets;
