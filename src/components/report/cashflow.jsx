import React, { useState, useMemo } from "react";
import { useQuery } from "react-query";
import { reqCoaList, reqJournalEntry, reqPeriod } from "../reqFetch";

const CashFlow = () => {
  const [data, setData] = useState({ period: "" });
  const { data: period } = useQuery("period", reqPeriod);
  const [vis, setVis] = useState({ modal: false });
  const { data: journalEntry } = useQuery("journalEntry", reqJournalEntry);
  const {
    data: coaList,
    error,
    isError,
    isLoading,
  } = useQuery("coaList", reqCoaList);

  // create a new COA
  let newCoa = [];
  coaList?.forEach((e) => {
    try {
      let x = {
        number: e.number,
        name: e.name,
        type: e.type,
        parent: e.parent,
        is_group: e.is_group,
        debit: "0.00",
        credit: "0.00",
        total: "0.00",
      };
      newCoa.push(x);
    } catch (error) {}
  });
  // Filter journal Entry by period
  let jE = useMemo(() => {
    return data.period === ""
      ? journalEntry?.sort((a, b) => (a.created_date > b.created_date ? 1 : -1))
      : journalEntry
          ?.sort((a, b) => (a.created_date > b.created_date ? 1 : -1))
          .filter(
            (d) =>
              new Date(d.created_date) >=
                new Date(period[parseInt(data.period)].start) &&
              new Date(d.created_date) <=
                new Date(period[parseInt(data.period)].end)
          );
  }, [journalEntry, period, data.period]);
  // new COA by filtered Journal Entry
  jE?.forEach((e) => {
    if (e.acc !== "Total") {
      try {
        let i = newCoa.findIndex((d) => d.number === e.acc);
        let d, c;
        // console.log(e.acc, e.debit, parseInt(e.debit))
        d = parseInt(e.debit) + parseInt(newCoa[i].debit);
        c = parseInt(e.credit) + parseInt(newCoa[i].credit);
        let t = 0;
        if (newCoa[i].type === "Assets" || newCoa[i].type === "Expense") {
          t = d - c;
        } else {
          t = c - d;
        }
        let y = newCoa;
        let x = {
          number: newCoa[i].number,
          name: newCoa[i].name,
          type: newCoa[i].type,
          parent: newCoa[i].parent,
          is_group: newCoa[i].is_group,
          debit: d.toString() + ".00",
          credit: c.toString() + ".00",
          total: t.toString() + ".00",
        };
        y[i] = x;
        newCoa = y;
      } catch (error) {
        console.log(error);
      }
    }
  });
  const handleClose = (e) => {
    setData({ ...data, vis: false });
  };
  const handleChange = (e) => {
    console.log(`${[e.target.name]}`, e.target.value);
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      {/* Component Title */}
      <div
        className="w-100"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <div className=" __content_title">Cash Flow</div>
        {/* add User + search */}
        <div className=" __search_bar">
          <select
            className="form-control m-1"
            name="period"
            onChange={handleChange}
            id="period"
            style={{ minWidth: "100px" }}
          >
            <option value="">Period</option>
            {period?.map((d, i) => (
              <>
                <option value={i}>{d.name}</option>
              </>
            ))}
          </select>
          <button
            className="btn btn-primary m-1"
            onClick={() => window.print()}
            style={{ minWidth: "fit-content" }}
          >
            <i className="bi bi-arrow-right-square"></i>
          </button>
          <button
            className="btn btn-primary m-1"
            onClick={() => window.print()}
            style={{ minWidth: "fit-content" }}
          >
            <i className="bi bi-printer"></i>
          </button>
        </div>
      </div>
      <hr style={{ margin: "0" }} />
      <div className="w-100" style={{ height: "25px" }}></div>
      <div className="row col-md-12" style={{ paddingLeft: "25px" }}>
        <div
          className="row col-md-12"
          style={{
            color: "white",
            textAlign: "left",
            padding: "7px 0",
            fontWeight: "600",
          }}
        >
          Cash Flow from Operating Activities
          <hr />
        </div>
        <div
          className="row col-md-12"
          style={{
            color: "white",
            textAlign: "left",
            padding: "7px 0",
            fontWeight: "600",
          }}
        >
          Cash Flow from Investing Activities
          <hr />
        </div>
        <div
          className="row col-md-12"
          style={{
            color: "white",
            textAlign: "left",
            padding: "7px 0",
            fontWeight: "600",
          }}
        >
          Cash Flow from Financing Activities
          <hr />
        </div>
      </div>
      <div className="row col-md-12" style={{ paddingLeft: "25px" }}>
        Net Change in cash
      </div>
      <div className="row col-md-12" style={{ paddingLeft: "25px" }}>
        Cash Beginning
      </div>
      <div className="row col-md-12" style={{ paddingLeft: "25px" }}>
        Cash Ending
      </div>
    </>
  );
};

export default CashFlow;
