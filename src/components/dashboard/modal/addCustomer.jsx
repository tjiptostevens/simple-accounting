import React, { useState } from 'react'
import { AddCustomerFn } from '../../custom/customerFn'
import Modal from '../../site/modal'

const AddCustomer = (props) => {
  const [data, setData] = useState({ required: true })

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
    setVis({ ...vis, modal: false })
    setData({ required: true, name: '', mobile: '', email: '', address: '' })
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log(data)
    try {
      let res = await AddCustomerFn(data)
      console.log(res)
      setVis({ ...vis, modal: true, msg: res.message })
    } catch (error) {
      console.log(error)
      setVis({ ...vis, modal: true, msg: error.message })
    }
  }
  return (
    <>
      <Modal
        modal={vis.modal}
        element={<>{vis.msg}</>}
        handleClose={handleClose}
      />
      <form onSubmit={handleSubmit} method="post">
        {/* Customer Name */}
        <div
          className="flex flex-wrap w-full"
          style={{ margin: '0px', padding: '0px' }}
        >
          <label className="label_title">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            required={data.required}
            onChange={handleChange}
            type="text"
            className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
            value={data.name}
            name="name"
            id="name"
          />
        </div>
        {/* Customer Mobile */}
        <div
          className="flex flex-wrap w-full"
          style={{ margin: '0px', padding: '0px' }}
        >
          <label className="label_title">
            Mobile <span className="text-red-500">*</span>
          </label>
          <input
            required={data.required}
            onChange={handleChange}
            type="number"
            className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
            value={data.mobile}
            placeholder="628123456789"
            name="mobile"
            id="mobile"
          />
        </div>
        {/* Customer Email */}
        <div
          className="flex flex-wrap w-full"
          style={{ margin: '0px', padding: '0px' }}
        >
          <label className="label_title">
            E-Mail <span className="text-red-500">*</span>
          </label>
          <input
            required={data.required}
            onChange={handleChange}
            type="email"
            className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
            value={data.email}
            name="email"
            id="email"
          />
        </div>
        {/* Customer Address */}
        <div
          className="flex flex-wrap w-full mb-5"
          style={{ margin: '0px', padding: '0px' }}
        >
          <label className="label_title">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            required={data.required}
            onChange={handleChange}
            type="address"
            className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
            value={data.address}
            name="address"
            id="address"
          />
        </div>
        <div>
          <p>{data.message}</p>
        </div>
        {/* Button */}
        <button className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors cursor-pointer" type="submit">
          Save
        </button>
        <button
          className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-lg transition-colors cursor-pointer ml-2"
          onClick={(e) => props.handleClose(e)}
        >
          Cancel
        </button>
      </form>
    </>
  )
}

export default AddCustomer
