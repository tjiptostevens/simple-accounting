import urlLink from "../config/urlLink";

const abortCtr = new AbortController();
const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": window.location.origin,
};
const loginUser = localStorage.getItem("loginUser");
const company = localStorage.getItem("company");

const AddPeriodFn = async (
  input = {
    name: "",
    description: "",
    start: "",
    end: "",
    status: 1,
    created_by: loginUser,
    company: company,
  }
) => {
  console.log(input);
  let x = { ...input, created_by: loginUser, company: company };
  try {
    let res = await fetch(`${urlLink.url}addperiod.php`, {
      signal: abortCtr.signal,
      method: "POST",
      body: JSON.stringify(x),
      headers: headers,
    });
    res = await res.json();
    console.log(res);
    if (res.error) {
      throw res;
    } else {
      return res;
    }
  } catch (error) {
    console.log(error);
    return error;
  } finally {
    try {
      let period = await fetch(`${urlLink.url}getperiod.php`, {
        signal: abortCtr.signal,
        method: "GET",
        headers: headers,
      });
      period = await period.json();
      period = await period.filter((f) => f.status === "1");
      console.log(period);
      localStorage.setItem("period", JSON.stringify(period[0]));
      sessionStorage.setItem("period", JSON.stringify(period[0]));
    } catch (error) {
      console.log(error);
    }
  }
};

const ClosePeriodFn = async (
  input = {
    id: "",
    name: "",
    mobile: "",
    email: "",
    address: "",
    status: "",
    modified_by: loginUser,
  }
) => {
  let x = { ...input, modified_by: loginUser };
  try {
    let res = await fetch(`${urlLink.url}editperiod.php`, {
      signal: abortCtr.signal,
      method: "POST",
      body: JSON.stringify(x),
      headers: headers,
    });
    res = await res.json();
    console.log(res);
    if (res.error) {
      throw res;
    } else {
      return res;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};
const DeletePeriodFn = async (input) => {
  try {
    let res = await fetch(`${urlLink.url}deletecustomer.php`, {
      signal: abortCtr.signal,
      method: "POST",
      body: JSON.stringify(input),
      headers: headers,
    });
    res = await res.json();
    console.log(res);
    if (res.error) {
      throw res;
    } else {
      return res;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

export { AddPeriodFn, ClosePeriodFn, DeletePeriodFn };
