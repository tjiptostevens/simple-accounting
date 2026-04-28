import React, { useState, useEffect } from "react";
import useFetch from "../../useFetch";
import "../../assets/css/form.css";
import { reqCoa } from "../../reqFetch";
import { useQuery } from "react-query";
const Entry = (props) => {
  const { data: coa, error, isError, isLoading } = useQuery("coa", reqCoa);
  const [data, setData] = useState({ delete: false });
  const dataList = {
    idx: (props.i + 1).toString(),
    parent: `${props.parent.replace("####", "")}${props.last}`,
    acc: props.data.acc,
    party_type: props.data.party_type,
    party: props.data.party,
    debit: props.data.debit,
    credit: props.data.credit,
    disable: props.data.disable,
  };
  const [list, setList] = useState(dataList);
  const handleChange = (e) => {
    setList({
      ...list,
      [e.target.name]: e.target.value,
      parent: `${props.parent.replace("####", "")}${props.last}`,
    });
    props.handleRow({ list, e });
  };
  const handleAcc = (e) => {
    let acc = e.target.value;
    let accArr = acc.split(" - ");
    setList({
      ...list,
      acc: e.target.value,
      acc_number: accArr[0],
      acc_name: accArr[1],
      parent: `${props.parent.replace("####", "")}${props.last}`,
    });
    // console.log(accArr)
    props.handleRow({ list, e });
  };
  const handleDelete = (e) => {
    setData({ ...data, delete: !data.delete });
    props.handleDelete(props.i, data.delete);
  };
  return (
    <>
      {/* {console.log("entry", data)} */}
      {/* {console.log("entry", props)} */}
      {/* {console.log("entry", i)} */}
      {props.data.idx && (
        <div
          key={props.i}
          className="row col-md-12 "
          style={{
            margin: "0px",
            padding: "0px",
          }}
        >
          <div
            className="col-md-1"
            style={{ padding: "5px 10px", border: "none" }}
            onClick={handleDelete}
            onMouseOver={() => setData({ delete: true })}
            onMouseOut={() => setData({ delete: false })}
          >
            <i
              className={data.delete ? "bi bi-x-square-fill" : "bi bi-square"}
              style={data.delete ? { color: "red" } : { color: "white" }}
            ></i>{" "}
            {props.data.idx}
          </div>
          <input
            list="coa"
            className="col-md-1"
            style={{ padding: "5px 10px", border: "none" }}
            type="text"
            name="acc"
            id={props.i}
            value={list.acc}
            onChange={handleChange}
            disabled={list.disable && list.disable ? list.disable : false}
          />
          <datalist id="coa">
            {coa &&
              coa
                .filter((e) => e.is_group === "0")
                .map((e, i) => (
                  <option key={i} value={e.number}>
                    {e.number} - {e.name}
                  </option>
                ))}
          </datalist>
          <input
            className="col-md-2"
            style={{ padding: "5px 10px", border: "none" }}
            type="text"
            value={
              list.acc &&
              coa?.filter((f) => f.number === list.acc).map((d) => d.name)
            }
            readOnly={true}
            disabled={list.disable && list.disable ? list.disable : false}
          />
          <input
            type="text"
            className="col-md-2"
            style={{ padding: "5px 10px", border: "none" }}
            name="party_type"
            id={props.i}
            value={list.party_type}
            onChange={handleChange}
            onBlur={handleChange}
          />
          <input
            type="text"
            className="col-md-2"
            style={{ padding: "5px 10px", border: "none" }}
            name="party"
            id={props.i}
            value={list.party}
            onChange={handleChange}
            onBlur={handleChange}
          />
          <input
            type="number"
            className="col-md-2 inp-number"
            style={{ padding: "5px 10px", border: "none" }}
            name="debit"
            id={props.i}
            value={list.debit}
            onChange={handleChange}
            onBlur={handleChange}
            pattern="[0-9]{3}.[0-9]{3}.[0-9]{3}"
          />
          <input
            type="number"
            className="col-md-2 inp-number"
            style={{ padding: "5px 10px", border: "none" }}
            name="credit"
            id={props.i}
            value={list.credit}
            onChange={handleChange}
            onBlur={handleChange}
          />

          {/* <p>{JSON.stringify(list)}</p> */}
        </div>
      )}
    </>
  );
};

export default Entry;
