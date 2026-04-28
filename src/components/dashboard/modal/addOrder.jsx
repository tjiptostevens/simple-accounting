import React, { useState } from 'react'

const AddOrder = (props) => {
  const [data, setData] = useState({ required: true })
  const handleChange = (e) => {
    console.log(`${[e.target.name]}`, e.target.value)
    setData({
      ...data,
      [e.target.name]: e.target.value,
    })
  }
  const handleClose = (e) => {
    console.log(data)
    setData({ ...data, required: !data.required })
    props.handleClose(e)
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('AddOrder: not yet implemented', data)
  }
  return (
    <>
      <div className="modal_title">
        <b>Add Order</b>
      </div>
      <div className="modal_content">
        <form onSubmit={handleSubmit} method="post">
          {/* Order Name */}
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
          <div>
            <p>{data.message}</p>
          </div>
          {/* Button */}
          <button className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors cursor-pointer" type="submit">
            Save
          </button>
          <button className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-lg transition-colors cursor-pointer ml-2" onClick={handleClose}>
            Cancel
          </button>
        </form>
      </div>
    </>
  )
}

export default AddOrder
