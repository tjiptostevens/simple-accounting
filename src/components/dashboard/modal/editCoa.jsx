import React, { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { reqCoa } from '../../reqFetch'
import { EditCoaFn } from '../../custom/coaFn'

const EditCoa = ({ show, close, detail }) => {
  const queryClient = useQueryClient()
  const { data: coa } = useQuery({ queryKey: ['coa'], queryFn: reqCoa })
  const [data, setData] = useState({
    is_group: detail.is_group === '0' ? false : true,
    required: true,
    parent: detail.parent,
    number: detail.number,
    last: detail.number,
    name: detail.name,
    type: detail.type,
    id: detail.id,
  })
  const handleChange = (e) => {
    console.log(`${[e.target.name]}`, e.target.value)
    setData({
      ...data,
      [e.target.name]: e.target.value,
    })
  }
  let coaFil = useMemo(() => {
    const searchRegex =
      data.number && new RegExp(`${data.number.substring(0, 1)}`, 'gi')
    return (
      coa &&
      coa
        .sort((a, b) => (a.number > b.number ? 1 : -1))
        .filter(
          (d) => !searchRegex || searchRegex.test(d.number.substring(0, 2)),
        )
    )
  }, [coa, data.number])
  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log(data)
    try {
      await EditCoaFn(data)
      queryClient.invalidateQueries({ queryKey: ['coa'] })
      close()
    } catch (err) {
      console.log(err)
    }
  }

  if (!show) return null

  return (
    <>
      <div className="modal_title">
        <b>Edit Chart Of Account</b>
      </div>
      <div className="modal_content">
        <form onSubmit={handleSubmit} method="post">
          {/* Account Number */}
          <div
            className="flex flex-wrap w-full"
            style={{ margin: '0px', padding: '0px' }}
          >
            <label className="label_title">
              Account Number <span className="text-red-500">*</span>
            </label>
            <input
              required={data.required}
              onChange={handleChange}
              type="number"
              className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-2"
              value={data.number}
              name="number"
              id="number"
            />
          </div>
          {/* Account Name */}
          <div
            className="flex flex-wrap w-full"
            style={{ margin: '0px', padding: '0px' }}
          >
            <label className="label_title">
              Account Name <span className="text-red-500">*</span>
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
          {/* Account Type*/}
          <div
            className="flex flex-wrap w-full"
            style={{ margin: '0px', padding: '0px' }}
          >
            <label className="label_title">
              Account Type <span className="text-red-500">*</span>
            </label>
            <select
              disabled={true}
              name="type"
              id="type"
              className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              required={data.required}
              onChange={handleChange}
              value={data.type}
            >
              <option value="Assets">Assets</option>
              <option value="Liability">Liability</option>
              <option value="Equity">Equity</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>
          {/* Group */}
          <div
            className="flex flex-wrap w-full mb-2"
            style={{
              margin: '0px',
              padding: '0px',
              flexWrap: 'nowrap',
              alignItems: 'center',
            }}
          >
            <input
              disabled={
                detail.child?.length > 0 || detail.parent === '0'
              }
              className="modal-check"
              type="checkbox"
              name="is_group"
              onClick={() =>
                setData({
                  ...data,
                  is_group: !data.is_group,
                })
              }
              checked={data.parent === '0' ? true : data.is_group}
            />
            <label className="label_title" style={{ paddingLeft: '15px' }}>
              is Group
            </label>
          </div>
          {/* Parent Name */}
          <div
            className="flex flex-wrap w-full mb-5"
            style={{ margin: '0px', padding: '0px' }}
          >
            <label className="label_title">
              Parent Name <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              name="parent"
              id="parent"
              onChange={handleChange}
              value={data.parent}
            >
              {data.parent ? '' : <option value="null">Select Parent</option>}
              {data.parent === '0' ? (
                <option value="0">Root Parent</option>
              ) : (
                ''
              )}
              {coaFil &&
                coaFil
                  .filter((e) => e.is_group === '1')
                  .map((e, i) => (
                    <option key={i} value={e.number}>
                      {e.number} - {e.name}
                    </option>
                  ))}
            </select>
          </div>

          <div>
            <p>{data.message}</p>
          </div>

          {/* Button */}
          <button className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors cursor-pointer" type="submit">
            Save
          </button>
          <button className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-lg transition-colors cursor-pointer ml-2" onClick={(e) => { e.preventDefault(); close(); }}>
            Cancel
          </button>
        </form>
      </div>
    </>
  )
}

export default EditCoa
