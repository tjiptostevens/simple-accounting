import React, { useState } from "react";
import { AddPeriodFn } from "../../custom/periodFn";
import Modal from "../../site/modal";

const AddPeriod = (props) => {
  const [data, setData] = useState({ required: true });

  const [vis, setVis] = useState({ modal: false });
  const handleChange = (e) => {
    console.log(`${[e.target.name]}`, e.target.value);
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };
  const handleClose = (e) => {
    e.preventDefault();
    console.log(data);
    setData({ ...data, required: !data.required });
    props.handleClose(e);
    window.location.reload();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(data);
    try {
      let res = await AddPeriodFn(data);
      console.log(res);
      if (res.error) {
        throw res;
      } else {
        setVis({ ...vis, modal: true, msg: res.message });
      }
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
          window.location.reload();
        }}
      />
      <form onSubmit={handleSubmit} method="post">
        {/* Name */}
        <div
          className="flex flex-wrap w-full"
          style={{ margin: "0px", padding: "0px" }}
        >
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
        {/* Description */}
        <div
          className="flex flex-wrap w-full"
          style={{ margin: "0px", padding: "0px" }}
        >
          <label className="label_title">
            Description <span className="text-red-500">*</span>
          </label>
          <input
            required={data.required}
            onChange={handleChange}
            type="text"
            className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
            value={data.description}
            name="description"
            id="description"
          />
        </div>
        {/* start */}
        <div
          className="flex flex-wrap w-full"
          style={{ margin: "0px", padding: "0px" }}
        >
          <label className="label_title">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            required={data.required}
            onChange={handleChange}
            type="date"
            className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
            value={data.start}
            name="start"
            id="start"
          />
        </div>
        {/* end */}
        <div
          className="flex flex-wrap w-full"
          style={{ margin: "0px", padding: "0px" }}
        >
          <label className="label_title">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            required={data.required}
            onChange={handleChange}
            type="date"
            className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
            value={data.end}
            name="end"
            id="end"
          />
        </div>
        <div>
          <p>{data.message}</p>
        </div>
        {/* Button */}
        <button className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors cursor-pointer" type="submit">
          Save
        </button>
        <button
          className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-lg transition-colors cursor-pointer ml-2"
          onClick={(e) => props.handleClose(e)}
        >
          Cancel
        </button>
      </form>
    </>
  );
};

export default AddPeriod;
