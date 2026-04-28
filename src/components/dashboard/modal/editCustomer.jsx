import React, { useState } from 'react'
import { EditCustomerFn } from '../../custom/customerFn'
import Modal from '../../site/modal'

const EditCustomer = (props) => {
  const [data, setData] = useState({ required: true, ...props.data })
  const [vis, setVis] = useState({ modal: false })
  const handleChange = (e) => {
    console.log(`${[e.target.name]}`, e.target.value)
    setData({
      ...data,
      [e.target.name]: e.target.value,
    })
  }
  const handleClose = (e) => {
    console.log(data)
    e.preventDefault()
    setVis({ ...vis, modal: false })
    setData({ required: true, name: '', mobile: '', email: '', address: '' })
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log(data)
    try {
      let res = await EditCustomerFn(data)
      console.log(res)
      setVis({ ...vis, modal: true, msg: res.message })
    } catch (error) {
      console.log(error)
      setVis({ ...vis, modal: true, msg: error.message })
    }
    // const abortCtr = new AbortController()
    // const headers = {
    //   Accept: 'application/json',
    //   'Content-Type': 'application/json',
    //   'Access-Control-Allow-Origin': window.location.origin,
    // }
    // setTimeout(() => {
    //   fetch(`${urlLink.url}addcustomer.php`, {
    //     signal: abortCtr.signal,
    //     method: 'POST',
    //     body: JSON.stringify(data),
    //     headers: headers,
    //   })
    //     .then((res) => res.json())
    //     .then((res) => {
    //       console.log(res)
    //       setData({
    //         required: true,
    //         name: '',
    //         mobile: '',
    //         email: '',
    //         address: '',
    //         message: res.message,
    //       })
    //     })

    //     // display an alert message for an error
    //     .catch((err) => {
    //       console.log(err)
    //       setData({
    //         ...data,
    //         msg: 'Error Connection',
    //       })
    //     })
    // }, 50)
  }
  return (
    <>
      <Modal
        modal={vis.modal}
        element={<>{vis.msg}</>}
        handleClose={(e) => setVis({ modal: false })}
      />
      <form onSubmit={handleSubmit} method="post">
        {/* Customer Name */}
        <div
          className="row col-md-12"
          style={{ margin: '0px', padding: '0px' }}
        >
          <label className="label_title">
            Name <span className="text-danger">*</span>
          </label>
          <input
            required={data.required}
            onChange={handleChange}
            type="text"
            className="form-control mb-2"
            value={data.name}
            name="name"
            id="name"
          />
        </div>
        {/* Customer Mobile */}
        <div
          className="row col-md-12"
          style={{ margin: '0px', padding: '0px' }}
        >
          <label className="label_title">
            Mobile <span className="text-danger">*</span>
          </label>
          <input
            required={data.required}
            onChange={handleChange}
            type="tel"
            className="form-control mb-2"
            value={data.mobile}
            name="mobile"
            id="mobile"
          />
        </div>
        {/* Customer Email */}
        <div
          className="row col-md-12"
          style={{ margin: '0px', padding: '0px' }}
        >
          <label className="label_title">
            E-Mail <span className="text-danger">*</span>
          </label>
          <input
            required={data.required}
            onChange={handleChange}
            type="email"
            className="form-control mb-2"
            value={data.email}
            name="email"
            id="email"
          />
        </div>
        {/* Customer Address */}
        <div
          className="row col-md-12 mb-5"
          style={{ margin: '0px', padding: '0px' }}
        >
          <label className="label_title">
            Address <span className="text-danger">*</span>
          </label>
          <input
            required={data.required}
            onChange={handleChange}
            type="address"
            className="form-control mb-2"
            value={data.address}
            name="address"
            id="address"
          />
        </div>
        <div>
          <p>{data.message}</p>
        </div>
        {/* Button */}
        <button className="btn btn-primary" type="submit">
          Save
        </button>
        <button
          className="btn btn-warning"
          onClick={(e) => props.handleClose(e)}
        >
          Cancel
        </button>
      </form>
    </>
  )
}

export default EditCustomer
