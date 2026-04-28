import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import "./assets/css/home.css";
import Nav from "./site/nav";
import Dash from "./dashboard/dash";
import SideNav from "./dashboard/sideNav";
import Coa from "./dashboard/master/coa";
import Period from "./dashboard/master/period";
import Company from "./dashboard/master/company";
import Customer from "./dashboard/master/customer";
import User from "./dashboard/master/user";
import Journal from "./dashboard/activity/journal";
import Depreciation from "./dashboard/activity/depreciation";
import ProfitAndLoss from "./report/profitandloss";
import CashFlow from "./report/cashflow";
import GeneralLedger from "./report/generalledger";
import GeneralJournal from "./report/generalJournal";
import ReadXlsx from "./excel/readXlsx";
import Order from "./order";
import Payment from "./payment";
import TrialBalance from "./report/trialBalance";
import BalanceSheet from "./report/balanceSheet";
import useDate from "./useDate";
import EquityChange from "./report/equityChange";
import ClosingJournal from "./report/closingJournal";

const Home = (props) => {
  const [data, setData] = useState("");
  const { now } = useDate();
  let period = JSON.parse(localStorage.getItem("period"));
  useEffect(() => {}, []);
  if (Date.parse(now) > Date.parse(period.end)) {
    console.log(Date.parse(now) - Date.parse(period.end));
  }
  return (
    <div className="w-100" style={{ height: "100vh", width: "100vw" }}>
      {/* {console.log(Date.parse(now))}
      {console.log(Date.parse(period.end))} */}
      <Nav />
      <div className="__main">
        <div className="__body">
          <div
            className="w-100"
            style={{
              display: "flex",
              flexDirection: "row",
              height: "100%",
              maxHeight: "inherit",
            }}
          >
            {/* Sidebar */}
            <div className="__side_nav">
              <SideNav />
            </div>

            {/* Content */}
            <div className="__content">
              <Routes>
                <Route excat path="/" element={<Dash />} />
                <Route exact path="/company" element={<Company />} />
                <Route exact path="/chartofaccount" element={<Coa />} />
                <Route exact path="/period" element={<Period />} />
                <Route exact path="/customer" element={<Customer />} />
                <Route exact path="/user" element={<User />} />
                <Route exact path="/journal" element={<Journal />} />
                <Route exact path="/depreciation" element={<Depreciation />} />
                <Route
                  exact
                  path="/generaljournal"
                  element={<GeneralJournal />}
                />
                <Route
                  exact
                  path="/closingjournal"
                  element={<ClosingJournal />}
                />
                <Route exact path="/trialbalance" element={<TrialBalance />} />
                <Route
                  exact
                  path="/profitandloss"
                  element={<ProfitAndLoss />}
                />
                <Route exact path="/equitychange" element={<EquityChange />} />

                <Route exact path="/balancesheet" element={<BalanceSheet />} />
                <Route exact path="/cashflow" element={<CashFlow />} />
                <Route exact path="/read" element={<ReadXlsx />} />
                <Route exact path="/payment" element={<Payment />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
