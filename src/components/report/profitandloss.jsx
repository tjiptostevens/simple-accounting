import React, { useState, useMemo } from 'react'
import { useQuery } from 'react-query'
import CoaLists from '../dashboard/master/coaLists'
import { reqCoa, reqCoaList, reqJournalEntry, reqPeriod } from '../reqFetch'
import useFetch from '../useFetch'
import ReportList from './reportList'
import ReportTable from './reportTable'

const ProfitAndLoss = () => {
  const [data, setData] = useState({ period: '' })
  const [vis, setVis] = useState({ modal: false })
  let periodStorage = localStorage.getItem('period')
  let periodStor = JSON.parse(periodStorage)
  const { data: period } = useQuery('period', reqPeriod)
  const { data: coa } = useQuery('coa', reqCoa)
  const { data: journalEntry } = useQuery('journalEntry', reqJournalEntry)
  const { data: coaList, error, isError, isLoading } = useQuery(
    'coaList',
    reqCoaList,
  )

  // create a new COA
  let newCoa = []
  coaList?.forEach((e) => {
    try {
      let x = {
        number: e.number,
        name: e.name,
        type: e.type,
        parent: e.parent,
        is_group: e.is_group,
        debit: '0.00',
        credit: '0.00',
        total: '0.00',
      }
      newCoa.push(x)
    } catch (error) {}
  })
  // Filter journal Entry by period
  let jE = useMemo(() => {
    return data.period === ''
      ? journalEntry?.sort((a, b) => (a.posting_date > b.posting_date ? 1 : -1))
      : journalEntry
          ?.sort((a, b) => (a.posting_date > b.posting_date ? 1 : -1))
          .filter(
            (d) =>
              new Date(d.posting_date) >=
                new Date(period[parseInt(data.period)].start) &&
              new Date(d.posting_date) <=
                new Date(period[parseInt(data.period)].end),
          )
  }, [journalEntry, period, data.period])
  // new COA by filtered Journal Entry
  jE?.forEach((e) => {
    if (e.acc !== 'Total') {
      try {
        let i = newCoa.findIndex((d) => d.number === e.acc)
        let d, c
        // console.log(e.acc, e.debit, parseInt(e.debit))
        d = parseFloat(e.debit) + parseFloat(newCoa[i].debit)
        c = parseFloat(e.credit) + parseFloat(newCoa[i].credit)
        let t = 0
        if (newCoa[i].type === 'Assets' || newCoa[i].type === 'Expense') {
          t = d - c
        } else {
          t = c - d
        }
        let y = newCoa
        let x = {
          number: newCoa[i].number,
          name: newCoa[i].name,
          type: newCoa[i].type,
          parent: newCoa[i].parent,
          is_group: newCoa[i].is_group,
          debit: d.toString() + '.00',
          credit: c.toString() + '.00',
          total: t.toString() + '.00',
        }
        y[i] = x
        newCoa = y
      } catch (error) {
        console.log(error)
      }
    }
  })
  let assets = 0
  let liability = 0
  let equity = 0
  let income = 0
  let expense = 0
  newCoa?.forEach((element) => {
    if (element.type === 'Liability') {
      liability += parseFloat(element.total)
    } else if (element.type === 'Equity') {
      equity += parseFloat(element.total)
    } else if (element.type === 'Income') {
      income += parseFloat(element.total)
    }
  })
  newCoa?.forEach((element) => {
    if (element.type === 'Assets') {
      assets += parseFloat(element.total)
    } else if (element.type === 'Expense') {
      expense += parseFloat(element.total)
    }
  })

  let assetsFill = useMemo(() => {
    return (
      newCoa &&
      newCoa
        // .sort((a, b) => (a.name > b.name ? 1 : -1))
        .filter((d) => d.type === 'Assets')
    )
  }, [newCoa])
  let liabilityFill = useMemo(() => {
    return (
      newCoa &&
      newCoa
        // .sort((a, b) => (a.name > b.name ? 1 : -1))
        .filter((d) => d.type === 'Liability')
    )
  }, [newCoa])
  let equityFill = useMemo(() => {
    return (
      newCoa &&
      newCoa
        // .sort((a, b) => (a.name > b.name ? 1 : -1))
        .filter(
          (d) =>
            d.type === 'Equity' && d.number !== '320' && d.number !== '330',
        )
    )
  }, [newCoa])
  let incomeFill = useMemo(() => {
    return (
      newCoa &&
      newCoa
        // .sort((a, b) => (a.name > b.name ? 1 : -1))
        .filter((d) => d.type === 'Income')
    )
  }, [newCoa])
  let expenseFill = useMemo(() => {
    return (
      newCoa &&
      newCoa
        // .sort((a, b) => (a.name > b.name ? 1 : -1))
        .filter((d) => d.type === 'Expense')
    )
  }, [newCoa])
  const handleClose = (e) => {
    setData({ ...data, vis: false })
  }
  const handleChange = (e) => {
    console.log(`${[e.target.name]}`, e.target.value)
    setData({
      ...data,
      [e.target.name]: e.target.value,
    })
  }

  if (isLoading) {
    return <div>Loading...</div>
  }
  if (isError) {
    return <div>Error! {error.message}</div>
  }
  return (
    <>
      {/* Component Title */}
      <div
        className="w-100"
        style={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <div className=" __content_title">Profit and Loss</div>
        {/* add User + search */}
        <div className=" __search_bar">
          {/* <div
            className="col"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <input
              className="form-control m-1"
              type="search"
              name="search"
              placeholder="Search by text"
              onChange={handleChange}
            />
          </div> */}
          <select
            className="form-control m-1"
            name="period"
            onChange={handleChange}
            id="period"
            style={{ minWidth: '100px' }}
          >
            <option value="">Period</option>
            {period?.map((d, i) => (
              <option value={i}>{d.name}</option>
            ))}
          </select>
          <button
            className="btn btn-primary m-1"
            onClick={() => window.print()}
            style={{ minWidth: 'fit-content' }}
          >
            <i className="bi bi-arrow-right-square"></i>
          </button>
          <button
            className="btn btn-primary m-1"
            onClick={() => window.print()}
            style={{ minWidth: 'fit-content' }}
          >
            <i className="bi bi-printer"></i>
          </button>
        </div>
      </div>
      <hr style={{ margin: '0' }} />
      <div className="w-100" style={{ height: '25px' }}></div>
      <div
        className="row"
        style={{
          margin: '15px 0',
          padding: '5px',
        }}
      >
        <div
          className="row"
          style={{
            margin: '0',
            padding: '25px 15px',
            color: 'white',
            borderRadius: '5px',
            textAlign: 'center',
            background: '#212529',
          }}
        >
          <div className="col-md-3">
            <div>
              <p>Total Income This Period</p>
              <h5
                style={income < 0 ? { color: 'crimson' } : { color: 'white' }}
              >
                Rp.{' '}
                {income.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') +
                  '.00'}
              </h5>
            </div>
          </div>
          <div
            className="col-md-1"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                margin: 'auto',
                border: '1px solid white',
                width: '25px',
                height: '25px',
                fontFamily: 'monospace',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'gold',
              }}
            >
              <b>-</b>
            </div>
          </div>
          <div className="col-md-3">
            <div>
              <p>Total Expense This Period</p>
              <h5
                style={expense < 0 ? { color: 'crimson' } : { color: 'white' }}
              >
                Rp.{' '}
                {expense.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') +
                  '.00'}
              </h5>
            </div>
          </div>
          <div
            className="col-md-1"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                margin: 'auto',
                border: '1px solid white',
                width: '25px',
                height: '25px',
                fontFamily: 'monospace',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#2490ef',
              }}
            >
              <b>=</b>
            </div>
          </div>
          <div className="col-md-3">
            <div>
              <p>Profit This Period</p>
              <h5
                style={
                  income - expense < 0
                    ? { color: 'crimson' }
                    : income - expense === 0
                    ? { color: 'white' }
                    : { color: 'limegreen' }
                }
              >
                Rp.{' '}
                {(income - expense)
                  .toString()
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + '.00'}
              </h5>
            </div>
          </div>
        </div>
      </div>

      <div className="w-100" style={{ overflowY: 'auto' }}>
        <div className="row col-md-12" style={{ paddingLeft: '25px' }}>
          <div
            className="row col-md-12"
            style={{
              color: 'white',
              textAlign: 'left',
              padding: '7px 0',
              fontWeight: '600',
            }}
          >
            {incomeFill && <CoaLists list={incomeFill} />}
            {/* {incomeFill && (
            <ReportList
              title={[
                [1, 1, "number"],
                [3, 3, "name"],
                [2, 3, "total"],
              ]}
              body={incomeFill}
            />
          )} */}
            <hr />
            <div
              className="w-100"
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'right',
              }}
            >
              <div style={{ width: '45%' }}></div>
              <div style={{ width: '25%' }}>Total Income</div>
              <div style={{ width: '20%' }}>
                {income.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') +
                  '.00'}{' '}
                Rp
              </div>
              <div style={{ width: '10%' }}></div>
            </div>
            <hr />
          </div>
          <div className="w-100" style={{ height: '25px' }}></div>
          <div
            className="row col-md-12"
            style={{
              color: 'white',
              textAlign: 'left',
              padding: '7px 0',
              fontWeight: '600',
            }}
          >
            {expenseFill && <CoaLists list={expenseFill} />}
            {/* {expenseFill && (
            <ReportList
              title={[
                [1, 1, 'number'],
                [3, 3, 'name'],
                [2, 3, 'total'],
              ]}
              body={expenseFill}
            />
          )} */}
            <hr />
            <div
              className="w-100"
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'right',
              }}
            >
              <div style={{ width: '45%' }}></div>
              <div style={{ width: '25%' }}>Total Expense</div>
              <div style={{ width: '20%' }}>
                {expense.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') +
                  '.00'}{' '}
                Rp
              </div>
              <div style={{ width: '10%' }}></div>
            </div>
            <hr />

            <div
              className="w-100"
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'right',
              }}
            >
              <div style={{ width: '45%' }}></div>
              <div style={{ width: '25%' }}>Total Profit</div>
              <div style={{ width: '20%' }}>
                {(income - expense)
                  .toString()
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + '.00'}{' '}
                Rp
              </div>
              <div style={{ width: '10%' }}></div>
            </div>
            <hr />
          </div>
          <div className="w-100" style={{ height: '25px' }}></div>
        </div>
      </div>
    </>
  )
}

export default ProfitAndLoss
