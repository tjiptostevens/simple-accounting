import urlLink from "../config/urlLink";

const abortCtr = new AbortController();
const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": window.location.origin,
};
const loginUser = localStorage.getItem("loginUser");
const company = localStorage.getItem("company");

const AddAssetsFn = async (input) => {
  let x = { ...input, company: company, created_by: loginUser };
  try {
    let res = await fetch(`${urlLink.url}addassets.php`, {
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
const CalcAssetFn = async (input) => {
  try {
  } catch (error) {
    console.log(error);
  }
};
const DeleteAssetsFn = async (input) => {
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

export { AddAssetsFn, CalcAssetFn, DeleteAssetsFn };
