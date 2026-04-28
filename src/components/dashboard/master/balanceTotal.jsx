import React from "react";

const BalanceTotal = ({ list }) => {
  let a = list.filter((f) => f.is_group === "0");
  console.log(a);
  let c = 0;
  let d = 0;
  a.forEach((e) => {
    if (parseFloat(e.total) < 0) {
      let t = parseFloat(e.total) * -1;
      if (parseFloat(e.debit) > parseFloat(e.credit)) {
        d += t;
      } else if (parseFloat(e.credit) > parseFloat(e.debit)) {
        c += t;
      }
    } else {
      if (parseFloat(e.debit) > parseFloat(e.credit)) {
        d += parseFloat(e.total);
      } else if (parseFloat(e.credit) > parseFloat(e.debit)) {
        c += parseFloat(e.total);
      }
    }
  });
  return (
    <>
      {/* {console.log(list)} */}
      <hr />
      <div style={{ paddingLeft: "20px", marginTop: "5px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            margin: "0 0 2px 0",
            color: "white",
            fontWeight: "600",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "45%",
              textAlign: "right",
            }}
          >
            Total
          </div>
          <div
            className="col-md-6"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                width: "45%",
                color: "white",
                paddingRight: "10px",
              }}
            >
              {d.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + ".00"}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                width: "45%",
                color: "white",
                paddingRight: "10px",
              }}
            >
              {c.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + ".00"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BalanceTotal;
