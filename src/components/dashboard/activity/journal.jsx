import React, { useState, useMemo, useReducer } from 'react'
import AddJournal from '../modal/addJournal'
import useFetch from '../../useFetch'
import { useNavigate } from 'react-router-dom'
import Modal from '../../site/modal'
import { useQuery } from 'react-query'
import { reqJournal, reqJournalList, reqPeriod } from '../../reqFetch'
import { showFormattedDate } from '../../custom/dateFn'

const Journal = () => {
  let periodStorage = localStorage.getItem('period')
  let periodStor = JSON.parse(periodStorage)
  const { data: period } = useQuery('period', reqPeriod)
  const { data: journal, error, isError, isLoading } = useQuery(
    'journal',
    reqJournal,
  )
  // const { data: journal } = useFetch('getjournal.php')
  const { data: journalList } = useQuery('journallist', reqJournalList)
  // const { data: journalList } = useFetch('getjournallist.php')
  const navigate = useNavigate()
  const [data, setData] = useState({ vis: false })
  const [vis, setVis] = useState({ modal: false })

  const handleClose = (e) => {
    setVis({ ...vis, modal: false })
  }
  const handleChange = (e) => {
    console.log(`${[e.target.name]}`, e.target.value)
    setData({
      ...data,
      [e.target.name]: e.target.value,
    })
  }
  let journalFil = useMemo(() => {
    const searchRegex = data.search && new RegExp(`${data.search}`, 'gi')
    return data.period === ''
      ? journal
          ?.sort((a, b) => (a.posting_date > b.posting_date ? 1 : -1))
          .filter(
            (d) =>
              (!searchRegex || searchRegex.test(d.name + d.title + d.type)) &&
              (!data.search_type || d.type === data.search_type) &&
              (!data.end_date || d.posting_date === data.end_date),
          )
      : journal
          ?.sort((a, b) => (a.posting_date > b.posting_date ? 1 : -1))
          .filter(
            (d) =>
              (!searchRegex || searchRegex.test(d.name + d.title + d.type)) &&
              (!data.search_type || d.type === data.search_type) &&
              (!data.end_date || d.posting_date === data.end_date) &&
              (!data.period ||
                (new Date(d.posting_date) >=
                  new Date(period[parseInt(data.period)].start) &&
                  new Date(d.posting_date) <=
                    new Date(period[parseInt(data.period)].end))),
          )
  }, [journal, data.search, data.search_type, data.end_date, data.period])
  let journalListFil = useMemo(() => {
    return journalList
      ?.sort((a, b) => (a.idx > b.idx ? 1 : -1))
      .filter((d) => d.parent === data.journalDetail)
  }, [journalList, data.journalDetail])
  const handleJournalDet = (index, journalName) => {
    setData({ ...data, i: index, journalDetail: journalName, det: true })
    // console.log(index, journalName)
  }
  if (isLoading) {
    return <div>Loading...</div>
  }
  if (isError) {
    return <div>Error! {error.message}</div>
  }
  return (
    <>
      {/* {console.log(period[parseInt(data.period)])} */}
      {/* Modal Window */}
      <Modal
        modal={vis.modal}
        title={
          {
            1: 'Add Journal',
            2: '',
          }[vis.value]
        }
        element={
          {
            1: <AddJournal handleClose={handleClose} />,
            2: '',
          }[vis.value]
        }
        handleClose={handleClose}
      />

      {/* Component Title */}
      <div
        className="w-100"
        style={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <div className=" __content_title">Journal Entries</div>
        {/* add User + search */}
        <div className="" style={{ display: 'flex' }}>
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
            {/* <input
              list="type"
              className="col-md-3"
              style={{ padding: "5px 10px", border: "none" }}
              type="text"
              name="search_type"
              onChange={handleChange}
            /> */}
            <select
              className="form-control m-1"
              name="period"
              onChange={handleChange}
              id="period"
              style={{ minWidth: '100px' }}
            >
              <option value="">Period</option>
              {period?.map((d, i) => (
                <>
                  <option value={i}>{d.name}</option>
                </>
              ))}
            </select>
            <select
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
            </select>
          </div>
          <div
            className="col"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            {/* <input
              className="form-control m-1"
              type="date"
              name="start_date"
              placeholder="Type to search"
              onChange={handleChange}
            /> */}
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
            onClick={() => setVis({ ...vis, modal: !vis.modal, value: 1 })}
          >
            <i className="bi bi-plus"></i>
            New
          </button>
        </div>
      </div>

      <hr style={{ margin: '0' }} />
      <div className="w-100" style={{ height: '25px' }}></div>
      <div className="row col-md-12" style={{ paddingLeft: '25px' }}>
        <div
          className="row d-none d-md-flex col-md-12"
          style={{
            color: 'white',
            textAlign: 'left',
            padding: '7px 0',
            fontWeight: '600',
          }}
        >
          <div className="col-md-2">Number</div>
          <div className="col-md-3">Title</div>
          <div className="col-md-2">Type</div>
          <div className="col-md-2" style={{ textAlign: 'center' }}>
            Debit
          </div>
          <div className="col-md-2" style={{ textAlign: 'center' }}>
            Credit
          </div>
          <div className="col-md-1"></div>
        </div>
        <hr />
      </div>

      <div className="w-100" style={{ overflowY: 'auto' }}>
        <div className="row col-md-12" style={{ paddingLeft: '25px' }}>
          {journalFil?.map((e, i) => (
            <div key={i}>
              <div
                className="row col-md-12"
                style={{
                  color: 'white',
                  textAlign: 'left',
                  fontWeight: '100',
                }}
              >
                <div className="col-md-2 col-6">
                  <b>{e.name} </b>
                  <br />
                  <small>
                    <i>{showFormattedDate(e.posting_date)}</i>
                  </small>
                </div>
                <div className="col-md-3 col-12">{e.title}</div>
                <div className="col-md-2 col-4">{e.type}</div>
                <div className="col-md-2 col-4" style={{ textAlign: 'right' }}>
                  {Number(e.total_debit)
                    .toFixed(2)
                    .replace(/\d(?=(\d{3})+\.)/g, '$&.')}
                </div>
                <div className="col-md-2 col-4" style={{ textAlign: 'right' }}>
                  {Number(e.total_credit)
                    .toFixed(2)
                    .replace(/\d(?=(\d{3})+\.)/g, '$&.')}
                </div>
                {data.i === i && data.det ? (
                  <div
                    className="col-md-1"
                    style={{ textAlign: 'right' }}
                    onClick={() => setData({ ...data, i: i, det: false })}
                    // onMouseOver={() => setData({ ...data, i: i, det: true })}
                    // onMouseOut={() => setData({ ...data, i: i, det: false })}
                  >
                    <i
                      className="bi bi-plus-square-fill"
                      style={{ color: 'white' }}
                    ></i>
                  </div>
                ) : (
                  <div
                    className="col-md-1"
                    style={{ textAlign: 'right' }}
                    onClick={() => handleJournalDet(i, e.name)}
                    onMouseOver={(e) =>
                      (e.target.firstChild.className = 'bi bi-plus-square-fill')
                    }
                    onMouseOut={(e) =>
                      (e.target.firstChild.className = 'bi bi-plus-square')
                    }
                  >
                    <i
                      className="bi bi-plus-square"
                      style={{ color: 'white' }}
                    ></i>
                  </div>
                )}
              </div>

              {data.i === i && data.det ? (
                <>
                  <div
                    className="row-md-12"
                    style={{
                      color: 'white',
                      textAlign: 'left',
                      fontWeight: '100',
                      margin: '0px',
                    }}
                  >
                    {/* {JSON.stringify(journalListFil)} */}
                    <div
                      className="row col-md-12 card"
                      style={{
                        color: 'white',
                        textAlign: 'left',
                        padding: '7px 0',
                        fontWeight: '100',
                        fontStyle: 'italic',
                        flexDirection: 'row',
                        backgroundColor: '#1d2228',
                        margin: '0px',
                      }}
                    >
                      <div className="col-md-1"></div>
                      <div className="col-md-4">
                        <hr style={{ margin: '0', padding: '0' }} />
                        <div>
                          {e.type === 'Depreciation' ? (
                            <p>
                              <small>Ref :</small> <br />
                              {e.ref}
                              <br />
                              <small>Ref Id: </small> <br />
                              {e.ref_id}
                            </p>
                          ) : (
                            <p>
                              <small>Pay To / Receive From :</small> <br />
                              {e.pay_to_recd_from}
                              <br />
                              <small>User Remark: </small> <br />
                              {e.user_remark}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="col-md-7">
                        Detail
                        {journalListFil
                          .sort((a, b) => (a.idx > b.idx ? 1 : -1))
                          .map((e, i) => (
                            <div
                              key={i}
                              className="row col-md-12"
                              style={{
                                color: 'white',
                                textAlign: 'left',
                                padding: '7px 0',
                                fontWeight: '100',
                                fontStyle: 'italic',
                                lineHeight: '1',
                              }}
                            >
                              <div className="col-md-5 col-4">
                                <i className="bi bi-dash"></i>
                                {e.acc} - {e.acc_name}
                              </div>
                              <div
                                className="col-md-3 col-4"
                                style={{ textAlign: 'right' }}
                              >
                                {Number(e.debit)
                                  .toFixed(2)
                                  .replace(/\d(?=(\d{3})+\.)/g, '$&.')}
                              </div>
                              <div
                                className="col-md-3 col-4"
                                style={{ textAlign: 'right' }}
                              >
                                {Number(e.credit)
                                  .toFixed(2)
                                  .replace(/\d(?=(\d{3})+\.)/g, '$&.')}
                              </div>
                              <div className="col-md-1 d-none"></div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                ''
              )}

              <hr style={{ color: 'grey' }} />
            </div>
          ))}
        </div>
      </div>
      <div className="w-100" style={{ height: '50px' }}></div>
    </>
  )
}

export default Journal
