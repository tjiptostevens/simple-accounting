import React, { useState, useMemo } from 'react'
import useFetch from '../../useFetch'
import urlLink from '../../config/urlLink'
import { useQuery } from 'react-query'
import { reqCoa } from '../../reqFetch'

const AddCoa = (props) => {
  const { data: coa, error, isError, isLoading } = useQuery('coa', reqCoa)
  // const { data: coa } = useFetch('getcoa.php')
  const [data, setData] = useState({
    is_group: null,
    required: true,
    parent: props.data ? props.data.number : '0',
    type: props.data ? props.data.type : '',
    company: localStorage.getItem('company'),
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
  const handleClose = (e) => {
    e.preventDefault()
    console.log(data)
    setData({ ...data, required: !data.required })
    props.handleClose(e)
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(data)
    const abortCtr = new AbortController()
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': window.location.origin,
    }
    setTimeout(async () => {
      try {
        let res = await fetch(`${urlLink.url}addcoa.php`, {
          signal: abortCtr.signal,
          method: 'POST',
          body: JSON.stringify(data),
          headers: headers,
        })
        res = res.json
        console.log(res)
        setData({
          ...data,
          number: '',
          name: '',
          is_group: null,
          required: true,
          message: res.message,
        })
      } catch (error) {
        console.log(error)
        setData({
          ...data,
          msg: 'Error Connection',
        })
      }
      // fetch(`${urlLink.url}addCoa.php`, {
      //   signal: abortCtr.signal,
      //   method: 'POST',
      //   body: JSON.stringify(data),
      //   headers: headers,
      // })
      //   .then((res) => res.json())
      //   .then((res) => {
      //     console.log(res)
      //     setData({
      //       number: '',
      //       name: '',
      //       parent: '',
      //       is_group: null,
      //       required: true,
      //       message: res.message,
      //     })
      //   })

      //   // display an alert message for an error
      //   .catch((err) => {
      //     console.log(err)
      //     setData({
      //       ...data,
      //       msg: 'Error Connection',
      //     })
      //   })
    }, 50)
  }
  if (isLoading) {
    return <div>Loading...</div>
  }
  if (isError) {
    return <div>Error! {error.message}</div>
  }
  return (
    <>
      <form onSubmit={handleSubmit} method="post">
        {/* Account Number */}
        <div
          className="row col-md-12"
          style={{ margin: '0px', padding: '0px' }}
        >
          <label className="label_title">
            Account Number <span className="text-danger">*</span>
          </label>
          <input
            required={data.required}
            onChange={handleChange}
            type="text"
            className="form-control mb-2"
            value={data.number}
            name="number"
            id="number"
          />
        </div>
        {/* Account Name */}
        <div
          className="row col-md-12"
          style={{ margin: '0px', padding: '0px' }}
        >
          <label className="label_title">
            Account Name <span className="text-danger">*</span>
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
        {/* Account Type*/}
        <div
          className="row col-md-12"
          style={{ margin: '0px', padding: '0px' }}
        >
          <label className="label_title">
            Account Type <span className="text-danger">*</span>
          </label>
          <select
            disabled={props.data ? true : false}
            name="type"
            id="type"
            className="form-select"
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
          className="row col-md-12 mb-2"
          style={{
            margin: '0px',
            padding: '0px',
            flexWrap: 'nowrap',
            alignItems: 'center',
          }}
        >
          <input
            className="modal-check"
            type="checkbox"
            name="is_group"
            onClick={() =>
              setData({
                ...data,
                is_group: !data.is_group,
              })
            }
            checked={data.is_group}
            // onChange={handleChange}
          />
          <label className="label_title" style={{ paddingLeft: '15px' }}>
            is Group
          </label>
        </div>
        {/* Parent Name */}
        <div
          className="row col-md-12 mb-5"
          style={{ margin: '0px', padding: '0px' }}
        >
          <label className="label_title">
            Parent Name <span className="text-danger">*</span>
          </label>
          <input
            list="coa"
            className="form-select"
            style={{ padding: '5px 10px', border: 'none' }}
            type="text"
            name="parent"
            value={data.parent}
            onChange={handleChange}
            onBlur={handleChange}
          />
          <datalist id="coa">
            <option value="0">Root Account</option>
            {coa &&
              coa
                .filter((e) => e.is_group === '1' && e.type === data.type)
                .map((e, i) => (
                  <option key={i} value={e.number}>
                    {e.number} - {e.name}
                  </option>
                ))}
          </datalist>
          {/* <select
              className="form-select"
              name="parent"
              id="parent"
              onChange={handleChange}
              value={data.parent}
            > */}
          {/* {data.parent ? "" : <option value="null">Select Parent</option>} */}
          {/* <option value="0">Root Parent</option> */}
          {/* {coaFil &&
                coaFil
                  .filter((e) => e.is_group === "1")
                  .map((e, i) => (
                    <option key={i} value={e.number}>
                      {e.number} - {e.name}
                    </option>
                  ))} */}
          {/* </select> */}
        </div>
        <div>
          <p>{data.message}</p>
        </div>
        {/* Button */}
        <button className="btn btn-primary" type="submit">
          Save
        </button>
        <button className="btn btn-warning" onClick={handleClose}>
          Cancel
        </button>
      </form>
    </>
  )
}

export default AddCoa
