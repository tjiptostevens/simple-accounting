import React, { useState, useEffect } from 'react'
import Modal from '../../site/modal'

const AddJournalEntry = (props) => {
  const [data, setData] = useState([])
  const [vis, setVis] = useState({ modal: false })
  useEffect(() => {
    setData(props.entry)

    return () => {
      console.log(data)
    }
  }, [props.entry])
  const handleAddRow = (e) => {
    e.preventDefault()
    console.log('props')
    let idx = props.entry.length + 1
    props.handleAddRow({
      idx: idx.toString(),
      acc: '',
      party_type: '',
      party: '',
      debit: '',
      credit: '',
      company: '',
    })
  }
  const handleChange = (e) => {
    props.handleRow(e)
    setData({ ...data, [e.target.name]: e.target.value })
  }
  return (
    <>
      <Modal
        modal={vis.modal}
        title="Confirmation"
        element={<></>}
        handleClose={() => setVis({ modal: false })}
      />
      <div className="flex flex-wrap w-full" style={{ margin: '0px', padding: '0px' }}>
        <label className="label_title">Accounting Entries</label>
        <small>{JSON.stringify(data)}</small>
        <hr />
        <small>{console.log(props)}</small>
        <div
          className="flex flex-wrap w-full"
          style={{
            margin: '0px',
            padding: '5px 0 0 0',
          }}
        >
          <div
            className="md:w-1/12"
            style={{ padding: '5px 10px', border: '1px solid #b3b3b3' }}
          >
            No.
          </div>
          <div
            className="md:w-3/12"
            style={{ padding: '5px 10px', border: '1px solid #b3b3b3' }}
          >
            Account
          </div>
          <div
            className="md:w-2/12"
            style={{ padding: '5px 10px', border: '1px solid #b3b3b3' }}
          >
            Party Type
          </div>
          <div
            className="md:w-2/12"
            style={{ padding: '5px 10px', border: '1px solid #b3b3b3' }}
          >
            Party
          </div>
          <div
            className="md:w-2/12"
            style={{ padding: '5px 10px', border: '1px solid #b3b3b3' }}
          >
            Debit
          </div>
          <div
            className="md:w-2/12"
            style={{ padding: '5px 10px', border: '1px solid #b3b3b3' }}
          >
            Credit
          </div>
        </div>

        <div style={{ margin: '0px', padding: '5px 0' }}>
          <button
            style={{ padding: '0 5px', minWidth: 'unset' }}
            className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded transition-colors cursor-pointer"
            onClick={handleAddRow}
          >
            Add Row
          </button>
        </div>
      </div>
    </>
  )
}

export default AddJournalEntry
