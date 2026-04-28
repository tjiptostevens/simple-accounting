import axios from "axios";
import urlLink from "./config/urlLink";

// let periodStorage = localStorage.getItem('period')
// let period = JSON.parse(periodStorage)

const reqCompany = async () => {
  const { data } = await axios.get(`${urlLink.url}getcompany.php`);
  return data;
};
const reqJournal = async () => {
  const { data } = await axios.get(`${urlLink.url}getjournal.php`);
  return data;
};
const reqJournalList = async () => {
  const { data } = await axios.get(`${urlLink.url}getjournallist.php`);
  return data;
};
const reqJournalEntry = async () => {
  try {
    const { data } = await axios.get(`${urlLink.url}getjournalentry.php`);
    return data;
  } catch (error) {
    console.log(error);
  }
};
const reqCoa = async () => {
  const { data } = await axios.get(`${urlLink.url}getcoav2.php`);
  return data;
};
const reqCoaList = async () => {
  const { data } = await axios.get(`${urlLink.url}getcoalist.php`);
  return data;
};
const reqPeriod = async () => {
  const { data } = await axios.get(`${urlLink.url}getperiod.php`);
  return data;
};
const reqEquityChange = async () => {
  const { data } = await axios.get(`${urlLink.url}getequitychange.php`);
  return data;
};
const reqAssets = async () => {
  const { data } = await axios.get(`${urlLink.url}getassets.php`);
  return data;
};
const reqCustomer = async () => {
  const { data } = await axios.get(`${urlLink.url}getcustomer.php`);
  return data;
};
const reqUser = async () => {
  const { data } = await axios.get(`${urlLink.url}getuser.php`);
  return data;
};

export {
  reqCompany,
  reqJournal,
  reqJournalList,
  reqJournalEntry,
  reqCoa,
  reqCoaList,
  reqPeriod,
  reqEquityChange,
  reqAssets,
  reqCustomer,
  reqUser,
};
