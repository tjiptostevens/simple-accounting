import React, { useState, useMemo } from 'react'
import AddOrder from './dashboard/modal/addOrder'

const Order = () => {
  const [order] = useState([])
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
  let orderFil = useMemo(() => {
    const searchRegex = data.search && new RegExp(`${data.search}`, 'gi')
    return (
      order &&
      order
        .sort((a, b) => (a.name > b.name ? 1 : -1))
        .filter(
          (d) =>
            !searchRegex ||
            searchRegex.test(d.name + d.mobile + d.email + d.address),
        )
    )
  }, [order, data.search])
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
          className="row col-md-6 col-11"
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
            className="w-100 justify-content-around"
            style={{
              textAlign: 'justify',
              height: 'auto',
            }}
          >
            {
              {
                1: <AddOrder handleClose={handleClose} />,
                2: '',
              }[data.value]
            }
          </div>
        </div>
      </div>

      {/* Component Title */}
      <div
        className="w-100"
        style={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <span className="__content_title">Order Entries</span>
        {/* add User + search */}
        <span style={{ display: 'flex' }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <input
              className="form-control m-1"
              type="search"
              name="search"
              placeholder="Type to search"
              onChange={handleChange}
            />
          </span>
          <span style={{ display: 'flex', alignItems: 'center' }}>
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
              placeholder="Type to search"
              onChange={handleChange}
            />
          </span>
        </span>
      </div>

      <hr style={{ margin: '0' }} />
    </>
  )
}

export default Order
