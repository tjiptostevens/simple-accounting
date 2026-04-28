import React, { useState, useMemo } from 'react'

const GeneralLedger = () => {
  const [journal] = useState([])
  const [data, setData] = useState({ vis: false })
  //   const elementRef = useRef(null);
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
  let journalFil = useMemo(() => {
    const searchRegex = data.search && new RegExp(`${data.search}`, 'gi')
    return (
      journal &&
      journal
        .sort((a, b) => (a.name > b.name ? 1 : -1))
        .filter(
          (d) =>
            !searchRegex ||
            searchRegex.test(d.name + d.mobile + d.email + d.address),
        )
    )
  }, [journal, data.search])
  return (
    <>
      {/* Modal Window */}
      <div
        className="__modal-window"
        style={{
          display: { true: 'block', false: 'none' }[data.vis],
          margin: '0px',
          padding: '0px',
        }}
      >
        <div
          className="flex flex-wrap md:w-1/2 w-11/12"
          style={{
            maxHeight: '95vh',
            overflowY: 'auto',
            margin: '0px',
            padding: '0px',
          }}
        >
          <div
            className="modal-close"
            onClick={() => setData({ ...data, vis: !data.vis })}
          >
            <i
              className="bi bi-x-lg"
              style={{
                textAlign: 'center',
                width: '60px',
                height: 'auto',
              }}
            ></i>
          </div>
          <div
            className="w-full"
            style={{
              textAlign: 'justify',
              height: 'auto',
            }}
          ></div>
        </div>
      </div>

      {/* User Content */}
      <div className="w-full">
        <p className="__content_title">General Ledger</p>
        <hr />
      </div>
    </>
  )
}

export default GeneralLedger
