import React, { useMemo, useState } from 'react'
import CoaLists from './coaLists'
import useFetch from '../../useFetch'
import AddCoa from '../modal/addCoa'
import { useQuery } from 'react-query'
import { reqCoa, reqCoaList, reqJournalEntry, reqPeriod } from '../../reqFetch'
import Modal from '../../site/modal'

const Coa = () => {
  const [vis, setVis] = useState({ modal: false })
  const [data, setData] = useState({ period: '' })
  let periodStorage = localStorage.getItem('period')
  let periodStor = JSON.parse(periodStorage)
  const { data: period } = useQuery('period', reqPeriod)
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
        d = parseInt(e.debit) + parseInt(newCoa[i].debit)
        c = parseInt(e.credit) + parseInt(newCoa[i].credit)
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
  if (isLoading) {
    return <div>Loading...</div>
  }
  if (isError) {
    return <div>Error! {error.message}</div>
  }
  return (
    <>
      {/* Modal Window */}
      <Modal
        modal={vis.modal}
        title={
          {
            1: 'Add Coa',
            2: '',
          }[vis.value]
        }
        element={
          {
            1: <AddCoa handleClose={handleClose} />,
            2: '',
          }[vis.value]
        }
        handleClose={handleClose}
      />

      <div className="w-100">
        <div
          className="w-100"
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <span className="__content_title">Chart of Account</span>
          <span style={{ display: 'flex', flexDirection: 'row' }}>
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
            <button
              className="btn btn-primary m-1"
              onClick={() => setVis({ ...vis, modal: true, value: 1 })}
            >
              <i className="bi bi-plus" style={{ marginRight: '10px' }}></i>
              New
            </button>
          </span>
        </div>
        <hr style={{ margin: '0' }} />

        <div className="w-100" style={{ height: '25px' }}></div>
        <div
          className="row col-md-12"
          style={{
            padding: '0px 25px',
            height: '85vh',
            maxHeight: '85vh',
            overflowY: 'auto',
          }}
        >
          {newCoa && <CoaLists list={newCoa} btn={true} />}
        </div>
      </div>
    </>
  )
}

export default Coa
