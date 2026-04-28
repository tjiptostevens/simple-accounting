import urlLink from "../config/urlLink";

const abortCtr = new AbortController();
const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": window.location.origin,
};
const loginUser = localStorage.getItem("loginUser");
const company = localStorage.getItem("company");

const GetJournalLastFn = async (journalType) => {
  try {
    let res = await fetch(
      `${urlLink.url}getjournallast.php?type=${journalType}`,
      {
        signal: abortCtr.signal,
        method: "GET",
        headers: headers,
      }
    );
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
const AddJournalFn = async (
  input = {
    name: `JV/{MM}/####`,
    title: "",
    user_remark: "",
    type: "Journal Umum",
    ref: "",
    ref_id: "",
    company: company,
    pay_to_recd_from: "",
    total_debit: 0,
    total_credit: 0,
    posting_date: `{YY}-{MM}-{DD}`,
    created_by: loginUser,
  }
) => {
  console.log(input);
  let x = { ...input, company: company, created_by: loginUser };
  try {
    let res = await fetch(`${urlLink.url}addjournal.php`, {
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
    // display an alert message for an error
    console.log(error);
    return error;
  }
};
const AddJournalEntryFn = async (
  input = {
    idx: "1",
    acc: "",
    party_type: null,
    party: null,
    debit: 0,
    credit: 0,
    acc_type: null,
    posting_date: `{YY}-{MM}-{DD}`,
    company: company,
  }
) => {
  let x = { ...input, company: company, created_by: loginUser };
  try {
    let res = await fetch(`${urlLink.url}addjournalentry.php`, {
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
const AddEquityChangeFn = async (
  input = {
    name: `period name`,
    opening: "",
    profit: "",
    prive: "",
    closing: "",
    company: company,
    posting_date: `{YY}-{MM}-{DD}`,
    created_by: loginUser,
  }
) => {
  console.log(input);
  let x = { ...input, company: company, created_by: loginUser };
  try {
    let res = await fetch(`${urlLink.url}addequitychange.php`, {
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
    // display an alert message for an error
    console.log(error);
    return error;
  }
};

export { AddJournalFn, AddJournalEntryFn, AddEquityChangeFn, GetJournalLastFn };
