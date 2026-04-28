import React, { useMemo } from "react";
import CoaDetailFn from "../custom/coaDetailFn";

const Dash = () => {
  let periodStorage = localStorage.getItem("period");
  let period = JSON.parse(periodStorage);
  const {
    error,
    isLoading,
    isError,
    newCoa,
    assets,
    liability,
    equity,
    pl,
    income,
    expense,
  } = CoaDetailFn(period);
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error! {error.message}</div>;
  }
  return (
    <>
      {/* Component Title */}
      {/* {console.log(newCoa)} */}

      <div
        className="w-100"
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
            <button className="btn btn-primary m-1">
              <i className="bi bi-plus"></i>
              New
            </button>
          </div>
        </div>
      </div>
      <hr style={{ margin: "0" }} />
      <div
        className="row"
        style={{
          margin: "15px 0",
          padding: "0",
        }}
      >
        <div
          className="col-md-3 col-6"
          style={{ margin: "0", padding: "5px", borderRadius: "5px" }}
        >
          <div className="card bg-dark">
            <div className="card-header" style={{ color: "white" }}>
              <b>CASH</b>
            </div>
            <div
              className="card-body"
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
          className="col-md-3 col-6"
          style={{ margin: "0", padding: "5px", borderRadius: "5px" }}
        >
          <div className="card bg-dark">
            <div className="card-header" style={{ color: "white" }}>
              <b>BANK</b>
            </div>
            <div
              className="card-body"
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
          className="col-md-3 col-6"
          style={{ margin: "0", padding: "5px", borderRadius: "5px" }}
        >
          <div className="card bg-dark">
            <div className="card-header" style={{ color: "white" }}>
              <b>RECEIVABLE</b>
            </div>
            <div
              className="card-body"
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
          className="col-md-3 col-6"
          style={{ margin: "0", padding: "5px", borderRadius: "5px" }}
        >
          <div className="card bg-dark">
            <div className="card-header" style={{ color: "white" }}>
              <b>PAYABLE</b>
            </div>
            <div
              className="card-body"
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
        className="row"
        style={{
          margin: "15px 0",
          padding: "5px",
        }}
      >
        <div
          className="row"
          style={{
            margin: "0",
            padding: "25px 15px",
            color: "white",
            borderRadius: "5px",
            textAlign: "center",
            background: "#212529",
          }}
        >
          <div className="col-md-3">
            <div>
              <p>Total Assets</p>
              <h5
                style={assets < 0 ? { color: "crimson" } : { color: "white" }}
              >
                Rp.{" "}
                {assets.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") +
                  ".00"}
              </h5>
            </div>
          </div>
          <div
            className="col-md-1"
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
                border: "1px solid white",
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
          <div className="col-md-3">
            <div>
              <p>Total Liability</p>
              <h5
                style={
                  liability < 0 ? { color: "crimson" } : { color: "white" }
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
            className="col-md-1"
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
                border: "1px solid white",
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
          <div className="col-md-3">
            <div>
              <p>Total Equity</p>
              <h5
                style={equity < 0 ? { color: "crimson" } : { color: "white" }}
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
        className="row"
        style={{
          margin: "15px 0",
          padding: "5px",
        }}
      >
        <div
          className="row"
          style={{
            margin: "0",
            padding: "25px 15px",
            color: "white",
            borderRadius: "5px",
            textAlign: "center",
            background: "#212529",
          }}
        >
          <div className="col-md-3">
            <div>
              <p>Total Income This Period</p>
              <h5
                style={income < 0 ? { color: "crimson" } : { color: "white" }}
              >
                Rp.{" "}
                {income.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") +
                  ".00"}
              </h5>
            </div>
          </div>
          <div
            className="col-md-1"
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
                border: "1px solid white",
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
          <div className="col-md-3">
            <div>
              <p>Total Expense This Period</p>
              <h5
                style={expense < 0 ? { color: "crimson" } : { color: "white" }}
              >
                Rp.{" "}
                {expense.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") +
                  ".00"}
              </h5>
            </div>
          </div>
          <div
            className="col-md-1"
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
                border: "1px solid white",
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
          <div className="col-md-3">
            <div>
              <p>Profit This Period</p>
              <h5
                style={
                  income - expense < 0
                    ? { color: "crimson" }
                    : income - expense === 0
                    ? { color: "white" }
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
      {/* coa  */}
      {/* <div className="w-100">
        <div className="col-md-6">{JSON.stringify(newCoa)}</div>
        <div className="col-md-6">{JSON.stringify(coa)}</div>
      </div> */}
      {/* <div className="w-100">{newCoa && <CoaLists list={newCoa} />}</div> */}
      {/* <div className="w-100">{coa && <CoaLists list={coa} />}</div> */}
    </>
  );
};

export default Dash;
