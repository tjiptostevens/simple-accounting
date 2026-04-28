import React, { useMemo, useState } from "react";
import { useQuery } from "react-query";
import {
  reqCoaList,
  reqEquityChange,
  reqJournalEntry,
  reqPeriod,
} from "../reqFetch";

const EquityChange = () => {
  const [vis, setVis] = useState({ modal: false });
  const [data, setData] = useState({ period: "" });
  const { data: period } = useQuery("period", reqPeriod);
  const { data: journalEntry } = useQuery("journalEntry", reqJournalEntry);
  const { data: equityChange } = useQuery("equityChange", reqEquityChange);
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
  // new COA by filtered Journal Entry
  journalEntry?.forEach((e) => {
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
  let assets = 0;
  let liability = 0;
  let equity = 0;
  let income = 0;
  let expense = 0;
  newCoa?.forEach((element) => {
    if (element.type === "Liability") {
      liability += parseFloat(element.total);
    } else if (element.type === "Equity") {
      equity += parseFloat(element.total);
    } else if (element.type === "Income") {
      income += parseFloat(element.total);
    }
  });
  newCoa?.forEach((element) => {
    if (element.type === "Assets") {
      assets += parseFloat(element.total);
    } else if (element.type === "Expense") {
      expense += parseFloat(element.total);
    }
  });
  let equityPrive = newCoa
    ?.filter((f) => f.number === "320")
    .map((g) => g.total);
  equityPrive = equityPrive[0];
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error! {error.message}</div>;
  }
  return (
    <>
      {/* Component Title */}
      <div
        className="w-100"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <div className=" __content_title">Equity Change</div>
        {/* add User + search */}
        <div className=" __search_bar">
          {/* <div
            className="col"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <input
              className="form-control m-1"
              type="search"
              name="search"
              placeholder="Search by text"
              onChange={handleChange}
            />
          </div> */}
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
          <div className="col-md-2">Periode</div>
          <div className="col-md-2">Modal Awal</div>
          <div className="col-md-2">Laba</div>
          <div className="col-md-2">Prive</div>
          <div className="col-md-2">Modal Akhir</div>
        </div>
        <hr />
        {equityChange?.map((d) => (
          <>
            <div
              className="row col-md-12"
              style={{
                color: "white",
                textAlign: "left",
                padding: "7px 0",
              }}
            >
              <div className="col-md-2">{d.name}</div>
              <div className="col-md-2" style={{ textAlign: "right" }}>
                {d.opening
                  .toString()
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + ".00"}
              </div>
              <div className="col-md-2" style={{ textAlign: "right" }}>
                {d.profit.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") +
                  ".00"}
              </div>
              <div className="col-md-2" style={{ textAlign: "right" }}>
                {d.prive.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") +
                  ".00"}
              </div>
              <div className="col-md-2" style={{ textAlign: "right" }}>
                {d.closing
                  .toString()
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + ".00"}
              </div>
            </div>
          </>
        ))}
        {period &&
          period
            .filter((f) => f.status === "1")
            .map((d) => (
              <div
                className="row col-md-12"
                style={{
                  color: "white",
                  textAlign: "left",
                  padding: "7px 0",
                }}
              >
                <div className="col-md-2">{d.name}</div>
                <div className="col-md-2" style={{ textAlign: "right" }}>
                  {equity.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") +
                    ".00"}
                </div>
                <div className="col-md-2" style={{ textAlign: "right" }}>
                  {(income - expense)
                    .toString()
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + ".00"}
                </div>
                <div className="col-md-2" style={{ textAlign: "right" }}>
                  {equityPrive
                    .toString()
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}
                </div>
                <div className="col-md-2" style={{ textAlign: "right" }}>
                  {(equity + (income - expense) - equityPrive)
                    .toString()
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + ".00"}
                </div>
              </div>
            ))}
      </div>
    </>
  );
};

export default EquityChange;
