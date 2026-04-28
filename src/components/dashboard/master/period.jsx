import React, { useMemo, useState } from "react";
import { useQuery } from "react-query";
import {
  AddJournalEntryFn,
  AddJournalFn,
  AddEquityChangeFn,
} from "../../custom/accFn";
import { showFormattedDate } from "../../custom/dateFn";
import { ClosePeriodFn } from "../../custom/periodFn";
import { reqCoaList, reqJournalEntry, reqPeriod } from "../../reqFetch";
import Modal from "../../site/modal";
import AddPeriod from "../modal/addPeriod";

const Period = () => {
  const [vis, setVis] = useState({ modal: false });
  let periodStorage = localStorage.getItem("period");
  let periodStore = JSON.parse(periodStorage);
  const {
    data: period,
    error,
    isError,
    isLoading,
  } = useQuery("period", reqPeriod);
  const { data: journalEntry } = useQuery("journalEntry", reqJournalEntry);
  const { data: coaList } = useQuery("coaList", reqCoaList);

  const loginUser = localStorage.getItem("loginUser");
  const company = localStorage.getItem("company");
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
    return periodStore === ""
      ? journalEntry?.sort((a, b) => (a.posting_date > b.posting_date ? 1 : -1))
      : journalEntry
          ?.sort((a, b) => (a.posting_date > b.posting_date ? 1 : -1))
          .filter(
            (d) =>
              new Date(d.posting_date) >= new Date(periodStore.start) &&
              new Date(d.posting_date) <= new Date(periodStore.end)
          );
  }, [journalEntry, period, periodStore]);
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
  let equityPrive = newCoa
    ?.filter((f) => f.number === "320")
    .map((g) => g.total);
  equityPrive = equityPrive[0];
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
  let incomeFill = useMemo(() => {
    return (
      newCoa &&
      newCoa
        // .sort((a, b) => (a.name > b.name ? 1 : -1))
        .filter((d) => d.type === "Income" && d.is_group === "0")
    );
  }, [newCoa]);
  let expenseFill = useMemo(() => {
    return (
      newCoa &&
      newCoa
        // .sort((a, b) => (a.name > b.name ? 1 : -1))
        .filter((d) => d.type === "Expense" && d.is_group === "0")
    );
  }, [newCoa]);
  const handleClose = (e) => {
    // e.preventDefault()
    setVis({ ...vis, modal: false });

    window.location.reload();
  };
  const handleEdit = (e, input) => {
    console.log(e, input);
    e.preventDefault();
    setVis({ ...vis, modal: true, value: 2, data: input });
  };
  const handleClosePeriod = async (e, input, status) => {
    e.preventDefault();
    // detail Periode
    let x = {
      ...input,
      status: status,
    };
    // Income
    let dIncome = 0;
    let cIncome = 0;
    let aIncome = [];
    incomeFill.forEach((e, i) => {
      cIncome += parseFloat(e.credit);
      dIncome += parseFloat(e.debit);
      aIncome.push({
        idx: i + 1,
        parent: `CLS/${input.name}/0001`,
        acc_type: "Closing",
        acc: e.number,
        party_type: "",
        party: "",
        debit: e.credit,
        credit: e.debit,
        posting_date: input.end,
        created_by: loginUser,
        company: company,
      });
    });
    aIncome = [
      ...aIncome,
      {
        idx: aIncome.length + 1,
        parent: `CLS/${input.name}/0001`,
        acc_type: "Closing",
        acc: "330",
        party_type: "",
        party: "",
        debit: dIncome.toString() + ".00",
        credit: cIncome.toString() + ".00",
        posting_date: input.end,
        created_by: loginUser,
        company: company,
      },
    ];
    let xIncome = {
      type: "Closing",
      name: `CLS/${input.name}/0001`,
      title: "Closing Pendapatan " + input.name,
      posting_date: input.end,
      created_by: loginUser,
      company: company,
      total_debit: cIncome.toString() + ".00",
      total_credit: cIncome.toString() + ".00",
    };
    console.log("aIn", aIncome);
    // Expense
    let dExpense = 0;
    let cExpense = 0;
    let aExpense = [];
    expenseFill.forEach((e, i) => {
      cExpense += parseFloat(e.credit);
      dExpense += parseFloat(e.debit);
      aExpense.push({
        idx: i + 1,
        parent: `CLS/${input.name}/0002`,
        acc_type: "Closing",
        acc: e.number,
        party_type: "",
        party: "",
        debit: e.credit,
        credit: e.debit,
        posting_date: input.end,
        created_by: loginUser,
        company: company,
      });
    });
    aExpense = [
      ...aExpense,
      {
        idx: aExpense.length + 1,
        parent: `CLS/${input.name}/0002`,
        acc_type: "Closing",
        acc: "330",
        party_type: "",
        party: "",
        debit: dExpense.toString() + ".00",
        credit: cExpense.toString() + ".00",
        posting_date: input.end,
        created_by: loginUser,
        company: company,
      },
    ];
    let xExpense = {
      type: "Closing",
      name: `CLS/${input.name}/0002`,
      title: "Closing Beban " + input.name,
      posting_date: input.end,
      created_by: loginUser,
      company: company,
      total_debit: dExpense.toString() + ".00",
      total_credit: dExpense.toString() + ".00",
    };
    console.log("aEx", aExpense);
    // Pl
    let dPl = (cIncome - dExpense).toString() + ".00";
    let cPl = (cIncome - dExpense).toString() + ".00";
    let aPl = [
      {
        idx: 1,
        parent: `CLS/${input.name}/0003`,
        acc_type: "Closing",
        acc: "330",
        party_type: "",
        party: "",
        debit: (cIncome - dExpense).toString() + ".00",
        credit: "0.00",
        posting_date: input.end,
        created_by: loginUser,
        company: company,
      },
      {
        idx: 2,
        parent: `CLS/${input.name}/0003`,
        acc_type: "Closing",
        acc: "310",
        party_type: "",
        party: "",
        debit: "0.00",
        credit: (cIncome - dExpense).toString() + ".00",
        posting_date: input.end,
        created_by: loginUser,
        company: company,
      },
    ];
    let xPl = {
      type: "Closing",
      name: `CLS/${input.name}/0003`,
      title: "Closing Laba " + input.name,
      posting_date: input.end,
      created_by: loginUser,
      company: company,
      total_debit: cPl,
      total_credit: dPl,
    };
    console.log("aPl", aPl);
    // Prive
    let dPrive = "0.00";
    let cPrive = "0.00";
    let aPrive = [
      {
        idx: 1,
        parent: `CLS/${input.name}/0004`,
        acc_type: "Closing",
        acc: "320",
        party_type: "",
        party: "",
        debit: "0.00",
        credit: "0.00",
        posting_date: input.end,
        created_by: loginUser,
        company: company,
      },
      {
        idx: 2,
        parent: `CLS/${input.name}/0004`,
        acc_type: "Closing",
        acc: "310",
        party_type: "",
        party: "",
        debit: "0.00",
        credit: "0.00",
        posting_date: input.end,
        created_by: loginUser,
        company: company,
      },
    ];
    let xPrive = {
      type: "Closing",
      name: `CLS/${input.name}/0004`,
      title: "Closing Prive " + input.name,
      posting_date: input.end,
      created_by: loginUser,
      company: company,
      total_debit: cPrive,
      total_credit: dPrive,
    };
    let xEquity = {
      name: input.name,
      opening: equity + ".00",
      profit: income - expense + ".00",
      prive: equityPrive,
      closing: equity + (income - expense) - equityPrive + ".00",
      company: company,
      posting_date: input.end,
      created_by: loginUser,
    };
    console.log("aPrive", aPrive);
    console.log(x, xIncome, xExpense, xPl, xPrive, xEquity);
    try {
      let res = await ClosePeriodFn(x);
      let addIncome = await AddJournalFn(xIncome);
      let addExpense = await AddJournalFn(xExpense);
      let addPl = await AddJournalFn(xPl);
      let addPrive = await AddJournalFn(xPrive);
      let addEquity = await AddEquityChangeFn(xEquity);
      let arIncome = aIncome.forEach((e) => {
        AddJournalEntryFn(e);
      });
      let arExpense = aExpense.forEach((e) => {
        AddJournalEntryFn(e);
      });
      let arPl = aPl.forEach((e) => {
        AddJournalEntryFn(e);
      });
      let arPrive = aPrive.forEach((e) => {
        AddJournalEntryFn(e);
      });
      // let res = 0;
      console.log(res);
      console.log(
        addIncome,
        addExpense,
        addPl,
        addPrive,
        arIncome,
        arExpense,
        arPl,
        arPrive
      );
      if (res.error) {
        throw res;
      } else {
        setVis({ ...vis, modal: true, value: 3, msg: res.message });
      }
    } catch (error) {
      console.log(error);
      setVis({ ...vis, modal: true, value: 3, msg: error.message });
    } finally {
      setVis({ ...vis, modal: true, value: 1 });
    }

    // setVis({ ...vis, modal: true, value: 2, data: x })
  };
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error! {error.message}</div>;
  }

  return (
    <>
      {/* Modal Window */}
      <Modal
        modal={vis.modal}
        title={
          {
            1: "Add Period",
            2: "Delete Period",
          }[vis.value]
        }
        element={
          {
            1: <AddPeriod handleClose={handleClose} />,
            2: <>{vis.msg}</>,
          }[vis.value]
        }
        handleClose={handleClose}
      />
      {/* Component Title */}
      <div
        className="w-100"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <div className=" __content_title">Period</div>
        {/* add User + search */}
        <div className=" __search_bar">
          <button
            className="btn btn-primary m-1"
            onClick={() => window.print()}
            style={{ minWidth: "fit-content" }}
          >
            <i className="bi bi-printer"></i>
          </button>
          <button
            className="btn btn-primary m-1"
            onClick={() => setVis({ ...vis, modal: true, value: 1 })}
          >
            <i className="bi bi-plus" style={{ marginRight: "10px" }}></i>
            New
          </button>
        </div>
      </div>
      <hr style={{ margin: "0" }} />
      <div className="w-100" style={{ height: "25px" }}></div>

      {/* Judul */}
      <div className="row col-md-12" style={{ paddingLeft: "25px" }}>
        <div
          className="row d-none d-md-flex col-md-12"
          style={{
            color: "white",
            textAlign: "left",
            padding: "7px 0",
            fontWeight: "600",
          }}
        >
          <div className="col-md-1">Name</div>
          <div className="col-md-3">Description</div>
          <div className="col-md-2" style={{ textAlign: "center" }}>
            Start Date
          </div>
          <div className="col-md-2" style={{ textAlign: "center" }}>
            End Date
          </div>
          <div className="col-md-1">Status</div>
          <div className="col-md-2"></div>
        </div>
        <hr />
      </div>

      {/* Isi */}
      <div className="row col-md-12" style={{ paddingLeft: "25px" }}>
        {period?.map((d, i) => (
          <div key={i}>
            <div
              className="row col-md-12"
              style={{
                color: "white",
                textAlign: "left",
                fontWeight: "100",
              }}
            >
              <div
                className="col-md-1 col-6"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                {d.name}
              </div>
              <div
                className="col-md-3 col-12"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                {d.description}
              </div>
              <div
                className="col-md-2 col-4"
                style={{
                  textAlign: "right",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showFormattedDate(d.start)}
              </div>
              <div
                className="col-md-2 col-4"
                style={{
                  textAlign: "right",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showFormattedDate(d.end)}
              </div>
              <div
                className="col-md-1 col-4"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                {/* {{ 0: 'Closed', 1: 'Active' }[e.status]} */}
                {
                  {
                    0: (
                      <div
                        className="text-warning"
                        // style={{ width: '11%' }}
                      >
                        <i className="bi bi-check-all text-warning"></i>Closed
                      </div>
                    ),
                    1: (
                      <div
                        className="text-success"
                        // style={{ width: '11%' }}
                      >
                        <i className="bi bi-check-all text-success"></i>Active
                      </div>
                    ),
                  }[d.status]
                }
              </div>
              <div
                className="col-md-2 col-4"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  className="btn-group btn-group-toggle"
                  style={{ padding: "0 10px" }}
                >
                  {/* <button
                    className="btn btn-sm btn-warning"
                    style={{ padding: "2px 7px", fontSize: "10px" }}
                    onClick={(e) => handleEdit(e, d)}
                  >
                    Edit
                  </button> */}
                  {d.status === "1" ? (
                    <button
                      className="btn btn-danger"
                      onClick={(e) => handleClosePeriod(e, d, 0)}
                    >
                      Close Period
                    </button>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>

            <hr />
          </div>
        ))}
      </div>
    </>
  );
};

export default Period;
