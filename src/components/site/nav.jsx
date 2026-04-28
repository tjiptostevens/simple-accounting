import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/img/env.png";
import "../assets/css/nav.css";
import useWindow from "../useWindow";

const Nav = () => {
  const { width } = useWindow();
  const navigate = useNavigate();
  const handleLogout = (e) => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/", { replace: true });
  };
  return (
    <>
      <div className=" w-100" style={{ backgroundColor: "#1c2126" }}>
        <div className="container-fluid">
          <nav className="navbar navbar-expand navbar-dark justify-content-between sticky-top">
            <Link className="navbar-brand" to="/d">
              <img
                src={logo}
                width="30"
                height="30"
                className="d-inline-block align-top __icon"
                alt=""
              />
              {width > 450 ? "PITARA" : ""}
            </Link>
            <div className="form-inline">
              {/* Login Information */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* {width > 450 ? (
                  <>
                    <div className="">
                      <i className="m_icon bi bi-bell"></i>
                    </div>
                    <div className="__help">Help</div>
                  </>
                ) : (
                  ''
                )} */}
                <div
                  className=""
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    className="__avatar"
                    style={{
                      fontSize: "100%",
                      color: "white",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    <span>
                      {sessionStorage
                        .getItem("loginUser")
                        .split("")[0]
                        .toUpperCase()}
                    </span>
                  </div>
                  <div className="nav-logout">
                    <Link
                      to={"/"}
                      className="nav-link text-white"
                      onClick={handleLogout}
                    >
                      <i className="m_icon bi bi-box-arrow-right"></i>
                      Log Out
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Nav;
