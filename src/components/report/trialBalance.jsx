import React, { useMemo, useState } from "react";
import { useQuery } from "react-query";
import createTree from "../custom/createTree";
import BalanceLists from "../dashboard/master/balanceLists";
import BalanceTotal from "../dashboard/master/balanceTotal";
import { reqCoa, reqCoaList, reqJournalEntry, reqPeriod } from "../reqFetch";
import useFetch from "../useFetch";
import ReportList from "./reportList";
import ReportTable from "./reportTable";

const TrialBalance = () => {
  // const { data: trial } = useFetch('gettrial.php')
  const [data, setData] = useState({ period: "" });
  const [vis, setVis] = useState({ modal: false });
  let periodStorage = localStorage.getItem("period");
  // let period = JSON.parse(periodStorage);
  // const { data: coaList } = useFetch('getcoalist.php')

  const { data: period } = useQuery("period", reqPeriod);
  const { data: coa } = useQuery("coa", reqCoa);
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
      ? journalEntry?.sort((a, b) => (a.posting_date > b.posting_date ? 1 : -1))
      : journalEntry
          ?.sort((a, b) => (a.posting_date > b.posting_date ? 1 : -1))
          .filter(
            (d) =>
              new Date(d.posting_date) >=
                new Date(period[parseInt(data.period)].start) &&
              new Date(d.posting_date) <=
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

  let assetsFill = useMemo(() => {
    return (
      newCoa &&
      newCoa
        // .sort((a, b) => (a.name > b.name ? 1 : -1))
        .filter((d) => d.type === "Assets")
    );
  }, [newCoa]);
  let liabilityFill = useMemo(() => {
    return (
      newCoa &&
      newCoa
        // .sort((a, b) => (a.name > b.name ? 1 : -1))
        .filter((d) => d.type === "Liability")
    );
  }, [newCoa]);
  let equityFill = useMemo(() => {
    return (
      newCoa &&
      newCoa
        // .sort((a, b) => (a.name > b.name ? 1 : -1))
        .filter((d) => d.type === "Equity")
    );
  }, [newCoa]);
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
  const coba = createTree(newCoa);
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error! {error.message}</div>;
  }
  return (
    <>
      {/* {console.log(newCoa)} */}
      {/* {JSON.stringify(assetsFill)} */}
      {/* Component Title */}
      <div
        className="w-100"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <div className=" __content_title"> Adj. Trial Balance</div>
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
          <select
            className="form-control m-1"
            name="period"
            onChange={handleChange}
            id="period"
            style={{ minWidth: "100px" }}
          >
            <option value="">Period</option>
            {period?.map((d, i) => (
              <option value={i}>{d.name}</option>
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
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          padding: "7px 20px 7px 40px",
        }}
      >
        <div className="col-md-6">Account</div>
        <div
          className="col-md-6"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "right",
          }}
        >
          <div className="col-md-6">Debit</div>
          <div className="col-md-6">Credit</div>
        </div>
        <hr />
      </div>
      <div className="w-100" style={{ overflowY: "auto" }}>
        {newCoa && <BalanceLists list={newCoa} />}
      </div>
      <div className="w-100">
        <BalanceTotal list={newCoa} />
      </div>
    </>
  );
};

export default TrialBalance;
