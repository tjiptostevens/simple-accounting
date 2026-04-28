import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { reqCoaList, reqJournalEntry, reqPeriod } from "../reqFetch";

const Dash = () => {
  const { data: journalEntry } = useQuery({ queryKey: ['journalEntry'], queryFn: reqJournalEntry });
  const {
    data: coaList,
    error,
    isError,
    isLoading,
  } = useQuery({ queryKey: ['coaList'], queryFn: reqCoaList });
  const { data: period } = useQuery({ queryKey: ['period'], queryFn: reqPeriod });

  const activePeriod = period?.find(p => p.status === '1') ?? period?.[0];

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
    } catch (error) { }
  });
  // Filter journal Entry by period
  let jE = useMemo(() => {
    return journalEntry
      ?.sort((a, b) => (a.posting_date > b.posting_date ? 1 : -1))
      .filter(
        (d) =>
          new Date(d.posting_date) >= new Date(activePeriod?.start) &&
          new Date(d.posting_date) <= new Date(activePeriod?.end)
      );
  }, [journalEntry, period]);
  // new COA by filtered Journal Entry
  jE?.forEach((e) => {
    if (e.acc !== "Total") {
      try {
        let i = newCoa.findIndex((d) => d.number === e.acc);
        let d, c;
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
    if (element.type === "Income") {
      income += parseFloat(element.total);
    }
  });
  newCoa?.forEach((element) => {
    if (element.type === "Expense") {
      expense += parseFloat(element.total);
    }
  });
  newCoa?.forEach((element) => {
    if (element.type === "Liability") {
      liability += parseFloat(element.total);
    } else if (element.type === "Equity") {
      equity += parseFloat(element.total);
    }
  });
  newCoa?.forEach((element) => {
    if (element.type === "Assets") {
      assets += parseFloat(element.total);
    }
  });
  let pl =
    income -
    expense -
    (newCoa &&
      newCoa.filter((f) => f.number === "320").map((g) => parseFloat(g.total)));
  if (isLoading) {
    return <div className="text-app-text">Loading...</div>;
  }
  if (isError) {
    return <div className="text-red-400">Error! {error.message}</div>;
  }
  return (
    <>
      <div
        className="w-full"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <div className=" __content_title">Dashboard</div>
        <div className="" style={{ display: "flex" }}>
          <div
            className="col"
            style={{
              display: "flex",
              alignItems: "center",
              visibility: "hidden",
            }}
          >
            <button className="m-1 px-3 py-1.5 bg-primary hover:bg-secondary text-white text-sm rounded-lg transition-colors cursor-pointer border-none">
              <i className="bi bi-plus"></i>
              New
            </button>
          </div>
        </div>
      </div>
      <hr style={{ margin: "0" }} />
      <div
        className="flex flex-wrap"
        style={{
          margin: "15px 0",
          padding: "0",
        }}
      >
        <div
          className="md:w-1/4 w-1/2"
          style={{ margin: "0", padding: "5px", borderRadius: "5px" }}
        >
          <div className="bg-app-card rounded border border-app-border">
            <div className="p-3 border-b border-app-border" style={{ color: "var(--color-app-text)" }}>
              <b>CASH</b>
            </div>
            <div
              className="p-3"
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                fontSize: "24px",
              }}
            >
              <div>Rp.</div>
              <div>
                {newCoa &&
                  newCoa
                    .filter((f) => f.number === "111")
                    .map((d) =>
                      d.total.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
                    )}
              </div>
            </div>
          </div>
        </div>
        <div
          className="md:w-1/4 w-1/2"
          style={{ margin: "0", padding: "5px", borderRadius: "5px" }}
        >
          <div className="bg-app-card rounded border border-app-border">
            <div className="p-3 border-b border-app-border" style={{ color: "var(--color-app-text)" }}>
              <b>BANK</b>
            </div>
            <div
              className="p-3"
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                fontSize: "24px",
              }}
            >
              <div>Rp.</div>
              <div>
                {newCoa &&
                  newCoa
                    .filter((f) => f.number === "112")
                    .map((d) =>
                      d.total.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
                    )}
              </div>
            </div>
          </div>
        </div>
        <div
          className="md:w-1/4 w-1/2"
          style={{ margin: "0", padding: "5px", borderRadius: "5px" }}
        >
          <div className="bg-app-card rounded border border-app-border">
            <div className="p-3 border-b border-app-border" style={{ color: "var(--color-app-text)" }}>
              <b>RECEIVABLE</b>
            </div>
            <div
              className="p-3"
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                fontSize: "24px",
              }}
            >
              <div>Rp.</div>
              <div>
                {newCoa &&
                  newCoa
                    .filter((f) => f.number === "113")
                    .map((d) =>
                      d.total.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
                    )}
              </div>
            </div>
          </div>
        </div>
        <div
          className="md:w-1/4 w-1/2"
          style={{ margin: "0", padding: "5px", borderRadius: "5px" }}
        >
          <div className="bg-app-card rounded border border-app-border">
            <div className="p-3 border-b border-app-border" style={{ color: "var(--color-app-text)" }}>
              <b>PAYABLE</b>
            </div>
            <div
              className="p-3"
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                fontSize: "24px",
              }}
            >
              <div>Rp.</div>
              <div>
                {newCoa &&
                  newCoa
                    .filter((f) => f.number === "211")
                    .map((d) =>
                      d.total.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
                    )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div
        className="flex flex-wrap"
        style={{
          margin: "15px 0",
          padding: "5px",
        }}
      >
        <div
          className="flex flex-wrap border border-app-border shadow-sm"
          style={{
            margin: "0",
            padding: "25px 15px",
            color: "var(--color-app-text)",
            borderRadius: "5px",
            textAlign: "center",
            background: "var(--color-app-card)",
          }}
        >
          <div className="md:w-1/4">
            <div>
              <p>Total Assets</p>
              <h5
                style={assets < 0 ? { color: "crimson" } : { color: "var(--color-app-text)" }}
              >
                Rp.{" "}
                {assets.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") +
                  ".00"}
              </h5>
            </div>
          </div>
          <div
            className="md:w-12"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                margin: "auto",
                border: "1px solid var(--color-app-border)",
                width: "25px",
                height: "25px",
                fontFamily: "monospace",
                borderRadius: "5px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "gold",
              }}
            >
              <b>*</b>
            </div>
          </div>
          <div className="md:w-1/4">
            <div>
              <p>Total Liability</p>
              <h5
                style={
                  liability < 0 ? { color: "crimson" } : { color: "var(--color-app-text)" }
                }
              >
                Rp.{" "}
                {liability
                  .toString()
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + ".00"}
              </h5>
            </div>
          </div>
          <div
            className="md:w-12"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                margin: "auto",
                border: "1px solid var(--color-app-border)",
                width: "25px",
                height: "25px",
                fontFamily: "monospace",
                borderRadius: "5px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#2490ef",
              }}
            >
              <b>*</b>
            </div>
          </div>
          <div className="md:w-1/4">
            <div>
              <p>Total Equity</p>
              <h5
                style={equity < 0 ? { color: "crimson" } : { color: "var(--color-app-text)" }}
              >
                Rp.{" "}
                {(equity + pl)
                  .toString()
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + ".00"}
              </h5>
            </div>
          </div>
        </div>
      </div>

      {/* Profit and Loss */}
      <div
        className="flex flex-wrap"
        style={{
          margin: "15px 0",
          padding: "5px",
        }}
      >
        <div
          className="flex flex-wrap border border-app-border shadow-sm"
          style={{
            margin: "0",
            padding: "25px 15px",
            color: "var(--color-app-text)",
            borderRadius: "5px",
            textAlign: "center",
            background: "var(--color-app-card)",
          }}
        >
          <div className="md:w-1/4">
            <div>
              <p>Total Income This Period</p>
              <h5
                style={income < 0 ? { color: "crimson" } : { color: "var(--color-app-text)" }}
              >
                Rp.{" "}
                {income.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") +
                  ".00"}
              </h5>
            </div>
          </div>
          <div
            className="md:w-12"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                margin: "auto",
                border: "1px solid var(--color-app-border)",
                width: "25px",
                height: "25px",
                fontFamily: "monospace",
                borderRadius: "5px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "gold",
              }}
            >
              <b>-</b>
            </div>
          </div>
          <div className="md:w-1/4">
            <div>
              <p>Total Expense This Period</p>
              <h5
                style={expense < 0 ? { color: "crimson" } : { color: "var(--color-app-text)" }}
              >
                Rp.{" "}
                {expense.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") +
                  ".00"}
              </h5>
            </div>
          </div>
          <div
            className="md:w-12"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                margin: "auto",
                border: "1px solid var(--color-app-border)",
                width: "25px",
                height: "25px",
                fontFamily: "monospace",
                borderRadius: "5px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#2490ef",
              }}
            >
              <b>=</b>
            </div>
          </div>
          <div className="md:w-1/4">
            <div>
              <p>Profit This Period</p>
              <h5
                style={
                  income - expense < 0
                    ? { color: "crimson" }
                    : income - expense === 0
                      ? { color: "var(--color-app-text)" }
                      : { color: "limegreen" }
                }
              >
                Rp.{" "}
                {(income - expense)
                  .toString()
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + ".00"}
              </h5>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dash;
