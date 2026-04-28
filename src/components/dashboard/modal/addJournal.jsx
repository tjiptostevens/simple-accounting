import React, { useState, useEffect } from "react";
import useFetch from "../../useFetch";
import urlLink from "../../config/urlLink";
import useDate from "../../useDate";
import Entry from "./entry";
import {
  AddJournalEntryFn,
  AddJournalFn,
  GetJournalLastFn,
} from "../../custom/accFn";
import Modal from "../../site/modal";
import { useQuery } from "react-query";
import { reqCoa, reqCustomer } from "../../reqFetch";

const AddJournal = (props) => {
  const loginUser = localStorage.getItem("loginUser");
  const company = localStorage.getItem("company");
  const [vis, setVis] = useState({ modal: false });
  const { data: customer } = useQuery("customer", reqCustomer);
  // const { data: coa } = useFetch('getcoa.php')
  const { data: coa, error, isError, isLoading } = useQuery("coa", reqCoa);
  const { YY, DD, MM, ss } = useDate();
  let a = JSON.parse(localStorage.getItem("period"));
  let period = a.name;

  const [data, setData] = useState({
    type: "Jurnal Umum",
    type_number: 6,
    required: true,
    name: `JV/${period}/####`,
    title: "",
    customer_id: "",
    customer: "",
    last: "0000",
    now: `${YY}-${MM}-${DD}`,
    entry: [
      // { idx: "1", acc: "", party_type: "", party: "", debit: "", credit: "" },
    ],
    month: MM,
    minute: ss,
    posting_date: `${YY}-${MM}-${DD}`,
    opening: false,
    pay_to_recd_from: "",
    user_remark: "",
    created_by: localStorage.getItem("loginUser"),
    company: localStorage.getItem("company"),
  });

  useEffect(() => {
    setTimeout(async () => {
      try {
        let res = await GetJournalLastFn(data.type);
        setData({ ...data, last: res.last });
      } catch (error) {
        console.log(error);
        setData((d) => ({
          ...d,
          last: "0000",
          msg: "Error Connection",
        }));
      }
    }, 0);
    // return () => abortCtr.abort()
    // eslint-disable-next-line
  }, [data.name]);

  const handleChange = async (e) => {
    // console.log(`${[e.target.name]}`, e.target.value)
    let nam = e.target.name;
    let val = e.target.value;
    if (nam === "type") {
      switch (parseInt(val)) {
        case 1:
          setData({
            ...data,
            name: `SC/Track/${period}/####`,
            type: "Penjualan Tracking Kredit",
            type_number: 1,
            entry: [
              {
                idx: "1",
                acc: "113",
                party_type: "",
                party: "",
                debit: 0,
                credit: "",
                disable: true,
              },
              {
                idx: "2",
                acc: "410",
                party_type: "",
                party: "",
                debit: "",
                credit: 0,
                disable: true,
              },
            ],
          });
          break;
        case 2:
          setData({
            ...data,
            name: `SC/Conta/${period}/####`,
            type: "Penjualan Container Kredit",
            type_number: 2,
            entry: [
              {
                idx: "1",
                acc: "113",
                party_type: "",
                party: "",
                debit: 0,
                credit: "",
                disable: true,
              },
              {
                idx: "2",
                acc: "420",
                party_type: "",
                party: "",
                debit: "",
                credit: 0,
                disable: true,
              },
            ],
          });
          break;
        case 3:
          setData({
            ...data,
            name: `PC/${period}/####`,
            type: "Pembelian Kredit",
            type_number: 3,
            entry: [
              {
                idx: "1",
                acc: "",
                party_type: "",
                party: "",
                debit: 0,
                credit: "",
                disable: false,
              },
              {
                idx: "2",
                acc: "211",
                party_type: "",
                party: "",
                debit: "",
                credit: 0,
                disable: true,
              },
            ],
          });
          break;
        case 4:
          setData({
            ...data,
            name: `CR/${period}/####`,
            type: "Penerimaan Kas",
            type_number: 4,
            entry: [
              {
                idx: "1",
                acc: "111",
                party_type: "",
                party: "",
                debit: 0,
                credit: "",
                disable: false,
              },
              {
                idx: "2",
                acc: "",
                party_type: "",
                party: "",
                debit: "",
                credit: 0,
                disable: false,
              },
            ],
          });
          break;
        case 5:
          setData({
            ...data,
            name: `CP/${period}/####`,
            type: "Pembayaran Kas",
            type_number: 5,
            entry: [
              {
                idx: "1",
                acc: "",
                party_type: "",
                party: "",
                debit: 0,
                credit: "",
                disable: false,
              },
              {
                idx: "2",
                acc: "111",
                party_type: "",
                party: "",
                debit: "",
                credit: 0,
                disable: false,
              },
            ],
          });
          break;
        case 6:
          setData({
            ...data,
            name: `JV/${period}/####`,
            type: "Jurnal Umum",
            type_number: 6,
            entry: [],
          });
          break;

        // default:
        //   setData({
        //     ...data,
        //     [e.target.name]: e.target.value,
        //   })
        //   break
      }
    } else {
      setData({
        ...data,
        [e.target.name]: e.target.value,
      });
    }
  };
  const handleClose = (e) => {
    console.log(data);
    setData({
      ...data,
      type: "",
      type_number: 6,
      required: !data.required,
      name: "",
      title: "",
      last: "0000",
      now: `${YY}-${MM}-${DD}`,
      entry: [],
      month: MM,
      minute: ss,
      created_by: loginUser,
      company: company,
      posting_date: `${YY}-${MM}-${DD}`,
    });
    props.handleClose(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(data);
    try {
      let res = await AddJournalFn(data);
      console.log(res);

      for (let i = 0; i < data.entry.length; i++) {
        let x = {
          ...data.entry[i],
          posting_date: data.posting_date,
          party_type: data.customer !== "" && "Customer",
          party: data.customer,
          company: company,
          created_by: loginUser,
        };
        let res1 = await AddJournalEntryFn(x);
        console.log(res1);
      }
      setData({
        type: "Jurnal Umum",
        type_number: 6,
        required: true,
        name: `JV/${period}/####`,
        title: "",
        last: "0000",
        now: `${YY}-${MM}-${DD}`,
        entry: [],
        month: MM,
        minute: ss,
        posting_date: `${YY}-${MM}-${DD}`,
        opening: false,
        pay_to_recd_from: "",
        user_remark: "",
        customer: "",
        created_by: localStorage.getItem("loginUser"),
        company: localStorage.getItem("company"),
        message: res.message,
      });
      setVis({ ...vis, modal: true, msg: res.message });
    } catch (error) {
      // display an alert message for an error
      console.log(error);
      setData({
        ...data,
        msg: "Error Connection",
      });
      setVis({ ...vis, modal: true, msg: error });
    }
  };
  const TotalDebit = () => {
    let debit = data.entry.map((e) => Number(e.debit));
    let sum = debit.reduce(function (a, b) {
      return a + b;
    }, 0);
    return sum;
  };
  const TotalCredit = () => {
    let credit = data.entry.map((e) => Number(e.credit));
    let sum = credit.reduce(function (a, b) {
      return a + b;
    }, 0);
    return sum;
  };

  // Hitung Debit & Credit
  useEffect(() => {
    setTimeout(() => {
      let td = TotalDebit();
      let tc = TotalCredit();
      setData((d) => ({ ...d, total_debit: td, total_credit: tc }));
    }, 0);
    // eslint-disable-next-line
  }, [data.entry]);
  // Handling Row
  const handleRow = ({ e, list }) => {
    let i = Number(e.target.id);
    let listDat = [...data.entry];
    listDat[i] = list;
    console.log("handleRow", list);
    console.log("list", listDat);
    setData({
      ...data,
      entry: listDat,
    });
  };
  const handleAddRow = (e) => {
    e.preventDefault();
    let idx = data.entry.length + 1;
    let entry = {
      idx: idx.toString(),
      parent: "",
      acc: "",
      party_type: "",
      party: "",
      debit: "",
      credit: "",
    };

    setData({
      ...data,
      entry: [...data.entry, entry],
    });
    console.log("handleAddRow", data);
  };
  const handleDelete = (e, vis) => {
    setVis({ modal: true, msg: "Row Deleted" });
    let i = e;
    let listDat = [...data.entry];
    let list = listDat[i];
    console.log(vis, list);
    listDat.splice(i, 1);
    console.log("list", listDat);

    setData({
      ...data,
      entry: listDat,
    });
  };
  const handleOpening = (e) => {
    console.log(e);
    let ent = coa.filter((e) => e.is_group === "0").map((e) => e.number);
    console.log(ent);
    let obj = [];
    for (let i = 0; i < ent.length; ++i) {
      obj.push({
        idx: i + 1,
        acc: ent[i],
        credit: "",
        debit: "",
        parent: `${data.name.replace("####", "")}${data.last}`,
        party: "",
        party_type: "",
        acc_type: "Opening",
      });
    }

    console.log(obj);
    setData({
      ...data,
      name: `OP/${period}/####`,
      type: "Opening",
      type_number: 7,
      entry: [...obj],
      opening: true,
    });
  };
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error! {error.message}</div>;
  }
  return (
    <>
      {console.log(data)}
      <Modal
        modal={vis.modal}
        element={<>{vis.msg}</>}
        handleClose={() => setVis({ modal: false })}
      />
      <div className="mb-3" style={{ margin: "0px", padding: "5px 0" }}>
        {data.opening ? (
          <button
            style={{ padding: "0 5px", minWidth: "unset" }}
            className="btn btn-primary btn-sm"
            onClick={() =>
              setData({
                ...data,
                opening: false,
                type: "Jurnal Umum",
                type_number: 6,
                name: `JV/${period}/####`,
                entry: [],
              })
            }
          >
            Cancel
          </button>
        ) : (
          <button
            style={{ padding: "0 5px", minWidth: "unset" }}
            className="btn btn-primary btn-sm"
            onClick={handleOpening}
          >
            Add Opening Entries
          </button>
        )}
      </div>
      {/* {JSON.stringify(data)} <br /> */}
      {/* {JSON.stringify(coa)} */}
      <form onSubmit={handleSubmit} method="post">
        <div
          className="row col-md-12"
          style={{ margin: "0px", padding: "0px" }}
        >
          {/* Journal Type */}
          <div
            className="row col-md-12 mb-2"
            style={{ margin: "0px", padding: "0px" }}
          >
            <label className="label_title">Journal Type :</label>
            <select
              required={data.required}
              disabled={data.opening}
              className="form-select"
              name="type"
              value={data.type_number}
              onChange={handleChange}
              onClick={() => setData({ ...data, entry: [] })}
            >
              <option value="1">Penjualan Tracking Kredit</option>
              <option value="2">Penjualan Container Kredit</option>
              <option value="3">Pembelian Kredit</option>
              <option value="4">Penerimaan Kas</option>
              <option value="5">Pembayaran Kas</option>
              <option value="6">Jurnal Umum</option>
              <option value="7" hidden={!data.opening}>
                Opening
              </option>
            </select>
          </div>
          {/* Numbering */}
          <div
            className="row col-md-6 mb-2"
            style={{ margin: "0px", padding: "0px" }}
          >
            <label className="label_title">
              Number <span className="text-danger">*</span>
            </label>
            <input
              required={data.required}
              disabled={true}
              onChange={handleChange}
              type="text"
              className="form-control mb-2"
              value={data.name}
              name="name"
              id="name"
            />
          </div>
          {/* Posting Date */}
          <div
            className="row col-md-6 mb-2"
            style={{ margin: "0px", padding: "0px" }}
          >
            <label className="label_title">
              Posting Date <span className="text-danger">*</span>
            </label>
            <input
              required={data.required}
              onChange={handleChange}
              type="date"
              className="form-control mb-2"
              value={data.posting_date}
              name="posting_date"
              id="posting_date"
            />
          </div>
        </div>
        {/* Customer Mobile */}
        <div
          className="row col-md-12 mb-2"
          style={{ margin: "0px", padding: "0px" }}
        >
          <label className="label_title">
            Title <span className="text-danger">*</span>
          </label>
          <input
            required={data.required}
            onChange={handleChange}
            type="text"
            className="form-control mb-2"
            value={data.title}
            name="title"
            id="title"
          />
        </div>
        <div
          className="row col-md-12 mb-2"
          style={{ margin: "0px", padding: "0px" }}
        >
          <label className="label_title">Customer</label>
          <input
            list="customer"
            className="form-control mb-2"
            style={{ padding: "5px 10px", border: "none" }}
            type="text"
            name="customer"
            value={
              data.customer.split(" - ")[1]
              // &&
              // customer?.filter((f) => f.id === data.customer).map((e) => e.name)
            }
            onChange={handleChange}
          />
          <datalist id="customer">
            {customer &&
              customer
                .filter((e) => e.status === "1")
                .map((e, i) => (
                  <option key={i} value={e.id + " - " + e.name}>
                    {e.id} - {e.name}
                  </option>
                ))}
          </datalist>
        </div>
        {/* Input data Accounting */}
        <div
          className="row col-md-12 mb-2"
          style={{ margin: "0px", padding: "0px" }}
        >
          <label className="label_title">Accounting Entries</label>
          {/* <small>{JSON.stringify(data)}</small> */}
          {/* <hr /> */}
          {/* <small>{JSON.stringify(lists)}</small> */}
          <div
            className="row col-md-12"
            style={{
              margin: "0px",
              padding: "5px 0 0 0",
            }}
          >
            <div
              className="col-md-1"
              style={{ padding: "5px 10px", border: "1px solid #b3b3b3" }}
            >
              No.
            </div>
            <div
              className="col-md-3"
              style={{ padding: "5px 10px", border: "1px solid #b3b3b3" }}
            >
              Account
            </div>
            <div
              className="col-md-2"
              style={{ padding: "5px 10px", border: "1px solid #b3b3b3" }}
            >
              Party Type
            </div>
            <div
              className="col-md-2"
              style={{ padding: "5px 10px", border: "1px solid #b3b3b3" }}
            >
              Party
            </div>
            <div
              className="col-md-2"
              style={{ padding: "5px 10px", border: "1px solid #b3b3b3" }}
            >
              Debit
            </div>
            <div
              className="col-md-2"
              style={{ padding: "5px 10px", border: "1px solid #b3b3b3" }}
            >
              Credit
            </div>
          </div>
          {data.entry &&
            data.entry.map((e, i) => (
              <Entry
                key={i}
                i={i}
                data={e}
                parent={data.name}
                last={data.last}
                handleRow={handleRow}
                handleDelete={handleDelete}
              />
            ))}

          <div
            className="row col-md-12"
            style={{
              margin: "0px",
              padding: "0px",
            }}
          >
            <div
              className="col-md-4"
              style={{ margin: "0px", padding: "5px 0" }}
            >
              <button
                style={{ padding: "0 5px", minWidth: "unset" }}
                className="btn btn-primary btn-sm"
                onClick={handleAddRow}
              >
                Add Row
              </button>
            </div>
            {data.entry.length > 0 && (
              <>
                <div
                  className="col-md-4"
                  style={{
                    padding: "5px 10px",
                    textAlign: "right",
                  }}
                >
                  Total
                </div>
                <div
                  className="col-md-2"
                  style={{
                    padding: "5px 10px",
                    border: "1px solid #b3b3b3",
                    background: "white",
                  }}
                >
                  {TotalDebit()}
                </div>
                <div
                  className="col-md-2"
                  style={{
                    padding: "5px 10px",
                    border: "1px solid #b3b3b3",
                    background: "white",
                  }}
                >
                  {TotalCredit()}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pay to / Received By */}
        <div
          className="row col-md-12 mb-2"
          style={{ margin: "0px", padding: "0px" }}
        >
          <label className="label_title">Pay To / Received By :</label>
          <input
            onChange={handleChange}
            type="text"
            className="form-control mb-2"
            value={data.pay_to_recd_from}
            name="pay_to_recd_from"
            id="pay_to_recd_from"
          />
        </div>
        {/* User Remark */}
        <div
          className="row col-md-12 mb-5"
          style={{ margin: "0px", padding: "0px" }}
        >
          <label className="label_title">User Remark</label>
          <textarea
            name="user_remark"
            onChange={handleChange}
            className="form-control mb-2"
            value={data.user_remark}
          ></textarea>
        </div>
        {/* <div>
          <p>{data.message}</p>
        </div> */}
        {/* Button */}
        {data.total_credit === data.total_debit ? (
          <button className="btn btn-primary" type="submit">
            Save
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={(e) => {
              e.preventDefault();
              alert("Journal not balanced.");
            }}
          >
            Save
          </button>
        )}
        <button className="btn btn-warning" onClick={handleClose}>
          Cancel
        </button>
      </form>
    </>
  );
};

export default AddJournal;
