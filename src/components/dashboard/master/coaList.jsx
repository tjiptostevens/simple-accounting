import React, { useState } from "react";
import AddCoa from "../modal/addCoa";
import DeleteCoa from "../modal/deleteCoa";
import EditCoa from "../modal/editCoa";
import Modal from "../../site/modal";

function CoaList({ list, btn }) {
  // const list = coaTotal(lists)
  const [data, setData] = useState({ vis: false, toggle: false });
  const [vis, setVis] = useState({ modal: false });
  const nestedCoa = (list.child || []).map((d) => {
    return <CoaList key={d.number} list={d} type="child" btn={btn} />;
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
  const handleClose = (e) => {
    setVis({ ...vis, modal: false });
  };
  const handleAddChild = (e) => {
    setVis({ ...vis, modal: true, value: 1 });
  };
  const handleEdit = (e) => {
    setVis({ ...vis, modal: true, value: 2 });
  };
  const handleDelete = (e) => {
    setVis({ ...vis, modal: true, value: 3 });
  };

  return (
    <>
      {/* {console.log(list)} */}
      {/* Modal Window */}
      <Modal
        modal={vis.modal}
        title={
          {
            1: "Add Coa",
            2: "Edit Coa",
            3: "Delete Coa",
          }[vis.value]
        }
        element={
          {
            1: <AddCoa data={list} handleClose={handleClose} />,
            2: <EditCoa data={list} handleClose={handleClose} />,
            3: <DeleteCoa data={list} handleClose={handleClose} />,
          }[vis.value]
        }
        handleClose={handleClose}
      />

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
            {btn && data.toggle && (
              <div
                className="btn-group btn-group-toggle"
                style={{ padding: "0 10px" }}
              >
                <button
                  className="btn btn-sm btn-light"
                  style={{ padding: "2px 7px", fontSize: "10px" }}
                  onClick={handleAddChild}
                >
                  Add Child
                </button>
                <button
                  className="btn btn-sm btn-warning"
                  style={{ padding: "2px 7px", fontSize: "10px" }}
                  onClick={handleEdit}
                >
                  Edit
                </button>
                {list.parent === "0" ||
                list.total > 0 ||
                list.total < 0 ||
                list.is_group === "1" ? (
                  ""
                ) : (
                  <button
                    className="btn btn-sm btn-danger"
                    style={{ padding: "2px 7px", fontSize: "10px" }}
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "45%",
              color: "white",
            }}
          >
            {/* {list.child.length > 0
              ? coaTotal(list)?.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
              : list.total.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}{' '} */}
            {nestTotal(list)
              .toString()
              .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + ".00 "}
            Rp
          </div>
          <div
            className="d-none d-md-flex"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "10%",
              color: "#646464",
            }}
          >
            {list.type}
          </div>
        </div>
        {nestedCoa}
      </div>
      {list.parent === "0" && (
        <div className="w-100" style={{ height: "15px" }}></div>
      )}
    </>
  );
}
export default CoaList;
