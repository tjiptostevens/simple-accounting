import React, { useState, useMemo } from 'react'
import AddUser from '../modal/addUser'
import useFetch from '../../useFetch'
import { useQuery } from 'react-query'
import { reqUser } from '../../reqFetch'

const User = () => {
  const { data: user, error, isError, isLoading } = useQuery('user', reqUser)
  // const { data: user } = useFetch('getuser.php')
  const [data, setData] = useState({ vis: false })
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
  let userFil = useMemo(() => {
    const searchRegex = data.search && new RegExp(`${data.search}`, 'gi')
    return (
      user &&
      user
        .sort((a, b) => (a.name > b.name ? 1 : -1))
        .filter(
          (d) =>
            !searchRegex ||
            searchRegex.test(d.name + d.mobile + d.email + d.address),
        )
    )
  }, [user, data.search])
  if (isLoading) {
    return <div>Loading...</div>
  }
  if (isError) {
    return <div>Error! {error.message}</div>
  }
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
                1: <AddUser handleClose={handleClose} />,
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
        <span className="__content_title">User Data</span>
        {/* add User + search */}
        <span style={{ display: 'flex' }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <input
              className="form-control"
              type="search"
              name="search"
              placeholder="Type to search"
              onChange={handleChange}
            />
          </span>
          <button
            className="btn btn-primary m-1"
            onClick={() => setData({ ...data, vis: !data.vis, value: 1 })}
          >
            <i className="bi bi-plus"></i>
            New
          </button>
        </span>
      </div>

      <hr style={{ margin: '0' }} />

      {/* User View */}
      <div className="w-100" style={{ height: '25px' }}></div>
      <div className="row col-md-12" style={{ paddingLeft: '25px' }}>
        <div
          className="row col-md-12"
          style={{
            color: 'white',
            textAlign: 'left',
            padding: '7px 0',
            fontWeight: '600',
          }}
        >
          <div style={{ width: '15%' }}>First Name</div>
          <div style={{ width: '15%' }}>Last Name</div>
          <div style={{ width: '15%' }}>Mobile</div>
          <div style={{ width: '15%' }}>Email</div>
          <div style={{ width: '15%' }}>Username</div>

          <div style={{ width: '15%' }}>Password</div>
        </div>
        <hr />
      </div>
      <div
        className="row col-md-12"
        style={{ paddingLeft: '25px', maxHeight: '60vh', overflowY: 'auto' }}
      >
        {userFil &&
          userFil.map((d, i) => (
            <>
              <div key={i} className="row col-md-12">
                <div style={{ width: '15%' }}>{d.first_name}</div>
                <div style={{ width: '15%' }}>
                  {d.last_name === null ? 'null' : d.last_name}
                </div>
                <div style={{ width: '15%' }}>{d.mobile}</div>
                <div style={{ width: '15%' }}>{d.email}</div>
                <div style={{ width: '15%' }}>{d.usr}</div>

                <div style={{ width: '15%' }}>
                  <span
                    onClick={(e) => {
                      console.log(e.target.innerHTML)
                      e.target.innerHTML = `<i class="bi bi-eye-slash"></i> ${d.pwd}`
                      setTimeout(() => {
                        e.target.innerHTML = `<i class="bi bi-eye-slash"></i> ******`
                      }, 5000)
                    }}
                  >
                    <i className="bi bi-eye-slash"></i> *****
                  </span>
                </div>
                <hr />
              </div>
            </>
          ))}
      </div>
    </>
  )
}

export default User
