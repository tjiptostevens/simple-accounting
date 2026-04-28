import React, { useState, useEffect } from "react";

const ReportTable = (props) => {
  const [data, setData] = useState("");
  useEffect(() => {
    let array = Object.keys(props.data[0]);
    let loop = [];
    array.forEach((element) => {
      let obj = { title: element };
      loop.push(obj);
    });
    setData({ ...data, header: loop, body: props.data });
  }, [data, props.data]);
  return (
    <>
      <div
        style={{
          overflow: "auto",
          height: "100%",
          width: "100%",
          fontSize: "12px",
        }}
      >
        <table className="table table-striped table-dark table-hover">
          <thead style={{ position: "sticky", top: "0" }}>
            <tr>
              {data
                ? data.header.map((e, i) => (
                    <th style={{ borderBottom: "1px solid white" }} key={i}>
                      {e.title}
                    </th>
                  ))
                : null}
            </tr>
          </thead>
          <tbody>
            {data
              ? data.body.map((e, i) => (
                  <tr key={i}>
                    {data.header.map((e1, i1) => (
                      <td key={i1}>{e[e1.title]}</td>
                    ))}
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ReportTable;
