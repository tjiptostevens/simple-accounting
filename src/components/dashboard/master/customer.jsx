import React, { useState, useMemo } from 'react'
import AddCustomer from '../modal/addCustomer'
import useFetch from '../../useFetch'
import { useQuery } from 'react-query'
import { reqCustomer } from '../../reqFetch'
import Modal from '../../site/modal'
import EditCustomer from '../modal/editCustomer'
import { EditCustomerFn } from '../../custom/customerFn'

const Customer = () => {
  const { data: customer, error, isError, isLoading } = useQuery(
    'customer',
    reqCustomer,
  )

  const [vis, setVis] = useState({ modal: false })
  // const { data: customer } = useFetch('getcustomer.php')
  const [data, setData] = useState({ vis: false })
  const refreshPage = () => {
    window.location.reload(false)
  }
  const handleClose = (e) => {
    setVis({ ...vis, modal: false })
    refreshPage()
  }
  const handleChange = (e) => {
    console.log(`${[e.target.name]}`, e.target.value)
    setData({
      ...data,
      [e.target.name]: e.target.value,
    })
  }
  const handleEdit = (e, input) => {
    console.log(e, input)
    e.preventDefault()
    setVis({ ...vis, modal: true, value: 2, data: input })
  }
  const handleDelete = async (e, input, status) => {
    e.preventDefault()
    let x = {
      ...input,
      status: status,
    }
    try {
      let res = await EditCustomerFn(x)
      console.log(res)
      if (res.error) {
        throw res
      } else {
        setVis({ ...vis, modal: true, value: 3, msg: res.message })
      }
    } catch (error) {
      console.log(error)
      setVis({ ...vis, modal: true, value: 3, msg: error.message })
    }

    // setVis({ ...vis, modal: true, value: 2, data: x })
  }
  let customerFil = useMemo(() => {
    const searchRegex = data.search && new RegExp(`${data.search}`, 'gi')
    return (
      customer &&
      customer
        .sort((a, b) => (a.name > b.name ? 1 : -1))
        .filter(
          (d) =>
            !searchRegex ||
            searchRegex.test(d.name + d.mobile + d.email + d.address),
        )
    )
  }, [customer, data.search])
  if (isLoading) {
    return <div>Loading...</div>
  }
  if (isError) {
    return <div>Error! {error.message}</div>
  }
  return (
    <>
      {/* Modal Window */}
      <Modal
        modal={vis.modal}
        title={
          { 1: 'Add Customer', 2: 'Edit Customer', 3: 'Delete Customer' }[
            vis.value
          ]
        }
        element={
          {
            1: <AddCustomer handleClose={handleClose} />,
            2: <EditCustomer handleClose={handleClose} data={vis.data} />,
            3: <>{vis.msg}</>,
          }[vis.value]
        }
        handleClose={handleClose}
      />
      {/* Component Title */}
      <div
        className="w-100"
        style={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <span className="__content_title">Customer Data</span>
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
            onClick={() => setVis({ ...vis, modal: !vis.modal, value: 1 })}
          >
            <i className="bi bi-plus"></i>
            New
          </button>
        </span>
      </div>
      <hr style={{ margin: '0' }} />
      {/* <div className="col-md-12">{JSON.stringify(customer)}</div> */}

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
          <div style={{ width: '20%' }}>Name</div>
          <div style={{ width: '11%' }}>Status</div>
          <div style={{ width: '12%' }}>Mobile</div>
          <div style={{ width: '22%' }}>Email</div>
          <div style={{ width: '25%' }}>Address</div>
          <div style={{ width: '10%' }}></div>
        </div>
        <hr />
      </div>
      <div
        className="row col-md-12"
        style={{ paddingLeft: '25px', maxHeight: '70vh', overflowY: 'auto' }}
      >
        {customerFil &&
          customerFil.map((d, i) => (
            <div key={i} className="row col-md-12">
              <div style={{ width: '20%' }}>{d.name}</div>

              {
                {
                  0: (
                    <div
                      // ref={elementRef}
                      className="text-warning"
                      style={{ width: '11%' }}
                    >
                      <i className="bi bi-check-all text-warning"></i>Inactive
                    </div>
                  ),
                  1: (
                    <div
                      // ref={elementRef}
                      className="text-success"
                      style={{ width: '11%' }}
                    >
                      <i className="bi bi-check-all text-success"></i>Active
                    </div>
                  ),
                }[d.status]
              }

              <div style={{ width: '12%' }}>{d.mobile}</div>
              <div style={{ width: '22%' }}>{d.email}</div>
              <div style={{ width: '25%' }}>{d.address}</div>

              <div
                className="btn-group btn-group-toggle"
                style={{ padding: '0 10px', width: '10%' }}
              >
                <button
                  className="btn btn-sm btn-warning"
                  style={{ padding: '2px 7px', fontSize: '10px' }}
                  onClick={(e) => handleEdit(e, d)}
                >
                  Edit
                </button>
                {d.status === '1' ? (
                  <button
                    className="btn btn-sm btn-danger"
                    style={{ padding: '2px 7px', fontSize: '10px' }}
                    onClick={(e) => handleDelete(e, d, 0)}
                  >
                    Delete
                  </button>
                ) : (
                  <button
                    className="btn btn-sm btn-light"
                    style={{ padding: '2px 7px', fontSize: '10px' }}
                    onClick={(e) => handleDelete(e, d, 1)}
                  >
                    Activate
                  </button>
                )}
              </div>
              <hr />
            </div>
          ))}
      </div>
    </>
  )
}

export default Customer
