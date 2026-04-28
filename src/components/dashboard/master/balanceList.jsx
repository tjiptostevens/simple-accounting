import React, { useState } from "react";

const BalanceList = ({ list, btn }) => {
  const [data, setData] = useState({ vis: false, toggle: false });
  const nestedCoa = (list.child || []).map((d) => {
    return <BalanceList key={d.number} list={d} type="child" btn={btn} />;
  });
  const nestTotal = (list) => {
    let c = 0;
    let d = 0;
    const childTotal = (data) => {
      for (const key in data) {
        if (key === "debit") {
          d += parseFloat(data[key]);
          // console.log(key, data[key]);
        } else if (key === "credit") {
          c += parseFloat(data[key]);
          // console.log(key, data[key]);
        }

        if (key === "child" && data[key]) {
          for (const idx in data[key]) {
            childTotal(data[key][idx]);
          }
        }
      }
    };
    childTotal(list);
    if (list.type === "Assets" || list.type === "Expense") {
      return d - c;
    } else {
      return c - d;
    }
  };

  return (
    <>
      <div
        style={{
          paddingLeft: list.name.split(" ")[0] === "Akum." ? "40px" : "20px",
          marginTop: "5px",
        }}
        onMouseOver={() => setData({ ...data, toggle: true })}
        onMouseLeave={() => setData({ ...data, toggle: false })}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            margin: "0 0 2px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              width: "45%",
            }}
          >
            {list.is_group === "1" ? (
              <i className="bi bi-folder" style={{ marginRight: "10px" }}></i>
            ) : (
              <i className="bi bi-file" style={{ marginRight: "10px" }}></i>
            )}
            <div style={{ color: "white" }}>
              {list.number} - {list.name}
            </div>
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
              }}
            >
              {/* {list.debit.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")} */}
              {list.debit > list.credit
                ? nestTotal(list)
                    .toString()
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + ".00"
                : "-"}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                width: "45%",
                color: "white",
              }}
            >
              {/* {list.credit.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")} */}
              {list.credit > list.debit
                ? list.name.split(" ")[0] === "Akum."
                  ? (nestTotal(list) * -1)
                      .toString()
                      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + ".00"
                  : nestTotal(list)
                      .toString()
                      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + ".00"
                : "-"}
            </div>
            {/* <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                width: "45%",
                color: "white",
              }}
            >
              {nestTotal(list)
                .toString()
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + ".00"}
            </div> */}
          </div>
        </div>
        {nestedCoa}
      </div>
    </>
  );
};
export default BalanceList;
