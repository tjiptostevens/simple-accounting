import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import "../assets/css/login.css";
import "../assets/css/modal.css";
import urlLink from "../config/urlLink";
import { reqCompany } from "../reqFetch";

const Login = (props) => {
  const {
    data: company,
    error,
    isError,
    isLoading,
  } = useQuery("company", reqCompany);
  // const { data: company } = useFetch('getcompany.php')

  useEffect(() => {
    if (localStorage.getItem("user_id")) {
      console.log(localStorage.getItem("user_id"));
    }
    if (company) {
      localStorage.setItem("company", company[0].id);
      sessionStorage.setItem("company", company[0].id);
    }
  }, [company]);

  const [data, setData] = useState({
    data: {
      usr: "",
      pwd: "",
      isRemember: false,
      error: "",
    },
    vis: false,
    msg: "",
    token: "",
    res: "",
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log(data)
    const abortCtr = new AbortController();
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": window.location.origin,
    };
    setTimeout(async () => {
      try {
        let res = await fetch(`${urlLink.url}login.php`, {
          signal: abortCtr.signal,
          method: "POST",
          body: JSON.stringify(data.data),
          headers: headers,
        });
        res = await res.json();
        // console.log(res)
        if (res.token) {
          console.log("Successfully Login");
          let period = await fetch(`${urlLink.url}getperiod.php`, {
            signal: abortCtr.signal,
            method: "POST",
            body: JSON.stringify(data.data),
            headers: headers,
          });
          period = await period.json();
          period = await period.filter((f) => f.status === "1");
          console.log(period);
          if (data.data.isRemember === true) {
            localStorage.setItem("user_id", res.token);
            localStorage.setItem("loginUser", data.data.usr);
            localStorage.setItem("period", JSON.stringify(period[0]));
            sessionStorage.setItem("user_id", res.token);
            sessionStorage.setItem("loginUser", data.data.usr);
            sessionStorage.setItem("period", JSON.stringify(period[0]));
          } else {
            localStorage.setItem("loginUser", data.data.usr);
            localStorage.setItem("period", JSON.stringify(period[0]));
            sessionStorage.setItem("user_id", res.token);
            sessionStorage.setItem("loginUser", data.data.usr);
            sessionStorage.setItem("period", JSON.stringify(period[0]));
          }
          setData({
            ...data,
            msg: res.message,
            token: res.token,
            vis: !data.vis,
            res: res.data,
          });
          return res;
        } else {
          throw res;
          // setData({
          //   ...data,
          //   msg: res.message,
          // })
        }
      } catch (err) {
        console.log(err);
        setData({
          ...data,
          msg: "Error Connection",
        });
      }
    }, 50);
  };
  const handleChange = (e) => {
    // console.log(`${[e.target.name]}`, e.target.value)
    setData({
      ...data,
      data: { ...data.data, [e.target.name]: e.target.value },
      msg: "",
    });
  };
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error! {error.message}</div>;
  }
  return (
    <>
      <div
        className="__modal-window"
        style={{ display: { true: "block", false: "none" }[data.vis] }}
      >
        <div
          className="row col-md-7 col-11"
          style={{
            maxHeight: "95vh",
            overflowY: "auto",
            margin: "0px",
            padding: "15px",
            borderRadius: "5px",
          }}
        >
          <div
            className="w-100 justify-content-around"
            style={{
              textAlign: "center",
              height: "auto",
            }}
          >
            <div style={{ fontSize: "24px" }}>{data.msg}</div>
            <hr />
          </div>
          <div
            className="w-100 justify-content-around"
            style={{
              textAlign: "center",
              height: "auto",
            }}
          >
            <Link
              to={{
                pathname: "/d",
                state: { data: data },
              }}
            >
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  textAlign: "center",
                  width: "60px",
                  height: "auto",
                }}
              >
                OK
              </button>
            </Link>
          </div>
        </div>
      </div>
      {/* {console.log(company)} */}
      <div className="form-center text-center">
        {/* {JSON.stringify(data)} */}
        {company && (
          <div className="w-100" style={{ margin: "0px", padding: "0px" }}>
            <div className="w-100">
              <b>{company[0].name}</b>
            </div>
            <hr />
            <form className="form-signin" method="post" onSubmit={handleSubmit}>
              <div className="w-100" style={{ height: "50px" }}></div>
              <div className="d-none d-sm-block">
                <img
                  className="mb-4"
                  src="./assets/img/logo512.png"
                  alt=""
                  width="72"
                  height="72"
                />
              </div>
              <h1 className="h3 mb-3 font-weight-normal">Sign in</h1>
              <label className="sr-only" htmlFor="usr">
                Username
              </label>
              <input
                className="form-control"
                type="text"
                name="usr"
                id="usr"
                placeholder="username"
                required
                autoFocus
                onChange={handleChange}
              />
              <label className="sr-only" htmlFor="pwd">
                Password
              </label>
              <input
                className="form-control"
                type="password"
                name="pwd"
                id="inputpwd"
                placeholder="password"
                required
                onChange={handleChange}
              />
              <div className="form-check checkbox mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="isRemember"
                  value={data.isRemember}
                  onClick={() =>
                    setData({
                      ...data,
                      data: { ...data.data, isRemember: !data.data.isRemember },
                    })
                  }
                />
                <label className="form-check-label"> Remember me</label>
              </div>
              <p>{data.msg}</p>
              <button
                className="btn btn-lg btn-primary btn-block"
                type="submit"
              >
                Sign in
              </button>

              <div className="w-100" style={{ height: "50px" }}></div>
              {/* <hr />
            <span>Don't have an account?</span>
            <hr /> */}
            </form>
            <div
              className="w-100"
              style={{
                textAlign: "left",
                fontSize: "12px ",
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.7) 100%), url(./assets/img/truck.webp) no-repeat center center / cover",
                filter: "grayscale(100%)",
              }}
            >
              <div
                className="col-md-4"
                style={{
                  margin: "0px",
                  padding: "25px 50px",
                }}
              >
                <p>{company[0].name}</p>

                <b> Office : </b>

                <p style={{ padding: "0 15px" }}>
                  <small style={{ whiteSpace: "pre-wrap" }}>
                    {company[0].address.split("<br />").join("")}{" "}
                    {company[0].city}-{company[0].country}
                    <br />
                  </small>
                  <small>
                    Telp/Fax : {company[0].phone} | Phone : {company[0].mobile}
                    <br />
                    E-Mail : {company[0].email}
                  </small>
                </p>
              </div>
              <div
                className="w-100"
                style={{
                  minHeight: "70px",
                  background:
                    "url(./assets/img/pitaraku.png) no-repeat center center / cover",
                }}
              >
                {/* <img
                  src="./assets/img/pitaraku.png"
                  width="100%"
                  alt="banner-pitaraku"
                /> */}
              </div>
            </div>
            <p
              className="text-muted"
              style={{ margin: "0px", padding: "25px 0px" }}
            >
              &copy; 2021-2022
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Login;
