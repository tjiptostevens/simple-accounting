import React, { useState, useMemo } from 'react'
import { useQuery } from 'react-query'
import { showFormattedDate } from '../custom/dateFn'
import { reqJournalEntry, reqJournalList, reqPeriod } from '../reqFetch'
// import useFetch from '../useFetch'
import ReportTable from './reportTable'

const ClosingJournal = () => {
  const [data, setData] = useState({ period: '' })
  const { data: period } = useQuery('period', reqPeriod)
  const { data: generalJournal, error, isError, isLoading } = useQuery(
    'journallist',
    reqJournalList,
  )
  const nestTotal = (list,key) => {
    let c = 0;
    let d = 0;
    // let a = [...list];
    // console.log(a)
    list.forEach(e => {
      c+=parseFloat(e.credit)
      d+=parseFloat(e.debit)
    });

    if (key === "c") {
      return c;
    } else {
      return d;
    }
  };
  // const {
  //   data: generalJournal,
  //   error,
  //   isError,
  //   isLoading,
  // } = useQuery("journalEntry", reqJournalEntry);
  // const { data: generalJournal } = useFetch('getjournalentry.php')

  const handleChange = (e) => {
    console.log(`${[e.target.name]}`, e.target.value)
    setData({
      ...data,
      [e.target.name]: e.target.value,
    })
  }
  // Filter journal by period
  let gJ = useMemo(() => {
    return data.period === ''
      ? generalJournal?.sort((a, b) =>
          a.created_date > b.created_date ? 1 : -1,
        )
      : generalJournal
          ?.sort((a, b) => (a.created_date > b.created_date ? 1 : -1))
          .filter(
            (d) =>
              new Date(d.posting_date) >=
                new Date(period[parseInt(data.period)].start) &&
              new Date(d.posting_date) <=
                new Date(period[parseInt(data.period)].end),
          )
  }, [generalJournal, period, data.period])
  let newJournal = []
  gJ?.forEach((e) => {
    try {
      let i = newJournal.findIndex((d) => d.parent === e.parent)
      if (i < 0) {
        let x = { parent: e.parent, 
          posting_date: e.posting_date, 
          type: e.type, 
          child: [e] }
        newJournal.push(x)
      } else {
        let x = {
          parent: e.parent,
          posting_date: e.posting_date,          
          type: e.type, 
          child: [...newJournal[i].child, e],
        }
        newJournal[i] = x
        // console.log(newJournal[i])
      }
    } catch (error) {
      console.log(error)
    }
    // console.log(newJournal)
  })
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
        <div className=" __content_title">Closing Journal</div>
        {/* add User + search */}
        <div className=" __search_bar">
          <div
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
          </div>
          <div
            className="col"
            style={{ display: 'flex', alignItems: 'center' }}
          >
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
            {/* <select
              className="form-control m-1"
              name="search_type"
              onChange={handleChange}
              id="type"
            >
              <option value="">Journal Type</option>
              <option value="Penjualan Tracking Kredit">
                Penjualan Tracking Kredit
              </option>
              <option value="Penjualan Container Kredit">
                Penjualan Container Kredit
              </option>
              <option value="Pembelian Kredit">Pembelian Kredit</option>
              <option value="Penerimaan Kas">Penerimaan Kas</option>
              <option value="Pembayaran Kas">Pembayaran Kas</option>
              <option value="Journal Umum">Journal Umum</option>
            </select> */}
          </div>
          <div
            className="col"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <input
              className="form-control m-1"
              type="date"
              name="start_date"
              placeholder="Type to search"
              onChange={handleChange}
            />
            <input
              className="form-control m-1"
              type="date"
              name="end_date"
              value={data.end_date}
              onChange={handleChange}
            />
          </div>
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
      {/* {newJournal.length} */}
      {/* {console.log(newJournal)} */}
      {/* title */}
      <div
        className="row col-md-12"
        style={{ paddingLeft: '25px', fontSize: '18px', fontWeight: '600' }}
      >
        <div
          className="col-md-3"
          style={{
            color: 'white',
            textAlign: 'right',
            padding: '7px 25px',
            fontWeight: '600',
          }}
        >
          Transaction
        </div>
        <div
          className="col-md-6"
          style={{
            color: 'white',
            textAlign: 'left',
            padding: '7px 0',
            fontWeight: '300',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {' '}
          <div
            className="w-100"
            style={{ display: 'flex', flexDirection: 'row' }}
          >
            <div className="col-md-6">Account</div>
            <div className="col-md-3" style={{ textAlign: 'right' }}>
              Debit
            </div>
            <div className="col-md-3" style={{ textAlign: 'right' }}>
              Credit
            </div>
            <div className="w-100" style={{ height: '7px' }}></div>
          </div>
        </div>
      </div>

      <hr style={{ margin: '0' }} />
      <div className="w-100" style={{ overflowY: 'auto' }}>
        {newJournal
          .filter((f) => f.type === 'Closing' && f.parent !== '' )
          .map((d) => (
            <>
              <div className="row col-md-12" style={{ paddingLeft: '25px' }}>
                <div
                  className="col-md-3"
                  style={{
                    color: 'white',
                    textAlign: 'right',
                    padding: '7px 25px',
                    fontWeight: '600',
                  }}
                >
                  {d.parent} <br />
                  <small>
                    <i style={{ fontWeight: '200' }}>
                      {showFormattedDate(d.posting_date)}
                    </i>
                  </small>
                </div>

                <div
                  className="col-md-6"
                  style={{
                    color: 'white',
                    textAlign: 'left',
                    padding: '7px 0',
                    fontWeight: '300',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {d.child
                    .sort((a, b) => (a.idx > b.idx ? 1 : -1))
                    .map((c) => (
                      <div
                        className="w-100"
                        style={{ display: 'flex', flexDirection: 'row' }}
                      >
                        <div className="col-md-6">
                          {c.acc + ' - ' + c.acc_name}
                        </div>
                        <div
                          className="col-md-3"
                          style={{ textAlign: 'right' }}
                        >
                          {c.debit
                            .toString()
                            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                        </div>
                        <div
                          className="col-md-3"
                          style={{ textAlign: 'right' }}
                        >
                          {c.credit
                            .toString()
                            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                        </div>
                        <div className="w-100" style={{ height: '7px' }}></div>
                      </div>
                    ))}
                  <div
                    className="w-100"
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      fontWeight: '600',
                      padding: '15px 0 0 0 ',
                    }}
                  >
                    <div className="col-md-4"></div>
                    <div
                      className="col-md-2"
                      style={{
                        textAlign: 'right',
                        borderTop: 'solid 1px grey',
                      }}
                    >
                      TOTAL
                    </div>
                    <div
                      className="col-md-3"
                      style={{
                        textAlign: 'right',
                        borderTop: 'solid 1px grey',
                      }}
                    >
                      {nestTotal(d.child,'d').toString()
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + '.00'}
                    </div>
                    <div
                      className="col-md-3"
                      style={{
                        textAlign: 'right',
                        borderTop: 'solid 1px grey',
                      }}
                    >
                      {nestTotal(d.child,'c').toString()
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + '.00'}
                      
                    </div>
                    <div className="w-100" style={{ height: '7px' }}></div>
                  </div>
                </div>
              </div>
            </>
          ))}
      </div>
    </>
  )
}

export default ClosingJournal
