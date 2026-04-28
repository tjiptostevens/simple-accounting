import React, { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'

const AddUser = (props) => {
  const { companyId } = useAuth()
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
  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log(data)
    try {
      const { error } = await supabase.from('profiles').insert({
        first_name: data.first_name,
        last_name: data.last_name,
        mobile: data.mobile,
        role: data.role,
        company_id: companyId,
      })
      if (error) throw error
      setData({
        required: true,
        first_name: '',
        last_name: '',
        mobile: '',
        email: '',
        usr: '',
        pwd: '',
        message: 'User added successfully',
      })
    } catch (err) {
      console.log(err)
      setData({ ...data, message: err.message })
    }
  }
  return (
    <>
      <div className="modal_title">
        <b>Add User</b>
      </div>
      <div className="modal_content">
        <form onSubmit={handleSubmit} method="post">
          {/* User First Name */}
          <div
            className="flex flex-wrap w-full"
            style={{ margin: '0px', padding: '0px' }}
          >
            <label className="label_title">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              required={data.required}
              onChange={handleChange}
              type="text"
              className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
              value={data.first_name}
              name="first_name"
              id="first_name"
            />
          </div>
          {/* User Last Name */}
          <div
            className="flex flex-wrap w-full"
            style={{ margin: '0px', padding: '0px' }}
          >
            <label className="label_title">Last Name</label>
            <input
              onChange={handleChange}
              type="text"
              className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
              value={data.last_name}
              name="last_name"
              id="last_name"
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
              type="tel"
              className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
              value={data.mobile}
              name="mobile"
              id="mobile"
            />
          </div>
          {/* Role */}
          <div
            className="flex flex-wrap w-full mb-5"
            style={{ margin: '0px', padding: '0px' }}
          >
            <label className="label_title">
              Role <span className="text-red-500">*</span>
            </label>
            <input
              required={data.required}
              onChange={handleChange}
              type="text"
              className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
              value={data.role}
              name="role"
              id="role"
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

export default AddUser
