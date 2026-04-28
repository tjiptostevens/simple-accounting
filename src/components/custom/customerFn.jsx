import urlLink from "../config/urlLink";

const abortCtr = new AbortController();
const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": window.location.origin,
};
const loginUser = localStorage.getItem("loginUser");
const company = localStorage.getItem("company");

const AddCustomerFn = async (
  input = {
    name: "",
    mobile: "",
    email: "",
    address: "",
    created_by: loginUser,
    company: company,
  }
) => {
  console.log(input);
  let x = { ...input, created_by: loginUser, company: company };
  console.log(x);
  try {
    let res = await fetch(`${urlLink.url}addcustomer.php`, {
      signal: abortCtr.signal,
      method: "POST",
      body: JSON.stringify(x),
      headers: headers,
    });
    console.log(res);
    res = await res.json();
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

const EditCustomerFn = async (
  input = {
    id: "",
    name: "",
    mobile: "",
    email: "",
    address: "",
    modified_by: loginUser,
  }
) => {
  try {
    let res = await fetch(`${urlLink.url}editcustomer.php`, {
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
const DeleteCustomerFn = async (input) => {
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

export { AddCustomerFn, EditCustomerFn, DeleteCustomerFn };
