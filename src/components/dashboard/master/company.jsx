import React, { useState } from 'react'
import useFetch from '../../useFetch'
import urlLink from '../../config/urlLink'
import { useNavigate } from 'react-router-dom'
import { reqCompany } from '../../reqFetch'
import { useQuery } from 'react-query'

const Company = () => {
  const { data: company, error, isError, isLoading } = useQuery(
    'company',
    reqCompany,
  )
  // const { data: company } = useFetch('getcompany.php')
  const navigate = useNavigate()
  const [file, setFile] = useState('comp ? comp.logo : "nofile.png"')
  const [data, setData] = useState({
    company: '',
    edit: true,
  })
  const [percentage, setPercentage] = useState('')
  const handleChange = (e) => {
    console.log(`${[e.target.name]}`, e.target.value)
    setData({
      ...data,
      company: { ...data.company, [e.target.name]: e.target.value },
    })
  }
  const handleUpdate = async (e) => {
    e.preventDefault()
    console.log(data)

    try {
      const abortCtr = new AbortController()
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': window.location.origin,
      }
      let res
      setTimeout(async () => {
        res = await fetch(`${urlLink.url}updatecompany.php`, {
          signal: abortCtr.signal,
          method: 'POST',
          body: JSON.stringify(data.company),
          headers: headers,
        })
        console.log(res)
        // navigate(0)
        // window.location.reload()
      }, 500)
    } catch (error) {
      console.log(error)
    }
  }
  if (isLoading) {
    return <div>Loading...</div>
  }
  if (isError) {
    return <div>Error! {error.message}</div>
  }
  return (
    <>
      {/* Component Title */}
      <div
        className="w-100"
        style={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <span className="__content_title">Company Info</span>
        {/* add User + search */}
        <span style={{ display: 'flex' }}>
          <button
            className="btn btn-primary m-1"
            onClick={() => setData({ ...data, vis: !data.vis, value: 1 })}
          >
            Edit
          </button>
        </span>
      </div>

      <hr style={{ margin: '0' }} />
      {company && company ? (
        <>
          {/* {JSON.stringify(data)} */}
          {/* {console.log(company[0])} */}
          <div className="w-100" style={{ height: '80vh', overflowY: 'auto' }}>
            {/* Logo */}
            <div className="row col-md-12" style={{ margin: '0px' }}>
              <div className="w-100" style={{ padding: '25px' }}>
                <div className="row">
                  <div className="col-md-4" style={{ maxWidth: '250px' }}>
                    <div
                      className="dashProfile"
                      style={{
                        background: `url(../assets/img/${company[0].logo}) center center /cover `,
                        width: '100px',
                        height: '100px',
                      }}
                    ></div>
                  </div>
                  <div className="col-md-8">
                    <h4>
                      <b>Company Logo</b>
                    </h4>
                    <p>
                      Your Logo is one of the defining parts of your company.
                      It'll help Customer and others establish an impression of
                      you.
                    </p>
                    <label className="btn btn-primary">
                      Change Logo
                      <input
                        type="file"
                        name="logo"
                        id="logo"
                        accept=".jpg, .jpeg, .png"
                        style={{ display: 'none' }}
                        value=""
                        onChange={async ({ target: { files } }) => {
                          console.log(files[0])
                          let dat = new FormData()
                          dat.append('photo', files[0])
                          dat.append('id', '')

                          const options = {
                            onUploadProgress: (progressEvent) => {
                              const { loaded, total } = progressEvent
                              let percent = Math.floor((loaded * 100) / total)
                              console.log(
                                `${loaded} byte of ${total} byte | ${percent}%`,
                              )

                              if (percent < 100) {
                                setPercentage(percent)
                              } else if (percent === 100) {
                                setPercentage('Uploaded')
                              }
                            },
                          }

                          // await API.post("user/photo", dat, options).then((res) => {
                          //   console.log(res);
                          //   setFile(res.data.file);

                          //   setMessage(res.data.message);
                          //   alert(message);
                          //   console.log(file);
                          //   setPercentage(100);
                          //   setBio({ ...bio, photo_location: res.data.file });
                          // });
                        }}
                      />
                    </label>
                    {percentage === 0
                      ? ''
                      : percentage === 100
                      ? 'message'
                      : percentage}
                  </div>
                </div>
              </div>
            </div>
            <div
              className="row col-md-12"
              style={{ margin: '0px', padding: '10px' }}
            >
              {/* Company Name */}
              <div
                className="row col-md-6 p-1"
                style={{ margin: '0px', padding: '0px' }}
              >
                <label className="col-md-4 col-4" htmlFor="CompanyName">
                  Perusahaan <span className="text-danger">*</span>
                  <br />
                  <small>
                    <i>Company</i>
                  </small>
                </label>
                <div className="col-md-8 col-8">
                  <input
                    required
                    onChange={handleChange}
                    type="text"
                    className="form-control"
                    name="name"
                    id="name"
                    value={data.edit ? company[0].name : data.company.name}
                    readOnly={data.edit}
                    aria-describedby="NameHelp"
                  />
                </div>
              </div>
              {/* Company Abbreviation */}
              <div
                className="row col-md-6 p-1"
                style={{ margin: '0px', padding: '0px' }}
              >
                <label className="col-md-4 col-4" htmlFor="CompanyName">
                  Singkatan <span className="text-danger">*</span>
                  <br />
                  <small>
                    <i>Singkatan</i>
                  </small>
                </label>
                <div className="col-md-8 col-8">
                  <input
                    required
                    onChange={handleChange}
                    type="text"
                    className="form-control"
                    name="abbr"
                    id="abbr"
                    value={data.edit ? company[0].abbr : data.company.abbr}
                    readOnly={data.edit}
                    aria-describedby="abbrHelp"
                  />
                </div>
              </div>
              {/* Phone Number */}
              <div
                className="row col-md-6 p-1"
                style={{ margin: '0px', padding: '0px' }}
              >
                <label className="col-md-4 col-4" htmlFor="PhoneNumber">
                  Telepon <span className="text-danger">*</span>
                  <br />
                  <small>
                    <i>Phone</i>
                  </small>
                </label>
                <div className="col-md-8 col-8">
                  <input
                    required
                    onChange={handleChange}
                    type="text"
                    className="form-control"
                    name="phone"
                    id="phone"
                    value={data.edit ? company[0].phone : data.company.phone}
                    readOnly={data.edit}
                    aria-describedby="PhoneHelp"
                  />
                </div>
              </div>
              {/* Mobile */}
              <div
                className="row col-md-6 p-1"
                style={{ margin: '0px', padding: '0px' }}
              >
                <label className="col-md-4 col-4" htmlFor="Mobile">
                  Handphone <span className="text-danger">*</span>
                  <br />
                  <small>
                    <i>Mobile</i>
                  </small>
                </label>
                <div className="col-md-8 col-8">
                  <input
                    required
                    onChange={handleChange}
                    type="text"
                    className="form-control"
                    name="mobile"
                    id="mobile"
                    value={data.edit ? company[0].mobile : data.company.mobile}
                    readOnly={data.edit}
                    aria-describedby="mobile"
                  />
                </div>
              </div>
              {/* E-mail */}
              <div
                className="row col-md-6 p-1"
                style={{ margin: '0px', padding: '0px' }}
              >
                <label className="col-md-4 col-4" htmlFor="email">
                  Surel <span className="text-danger">*</span>
                  <br />
                  <small>
                    <i>E-mail</i>
                  </small>
                </label>
                <div className="col-md-8 col-8">
                  <input
                    required
                    onChange={handleChange}
                    type="text"
                    className="form-control"
                    name="email"
                    id="email"
                    value={data.edit ? company[0].email : data.company.email}
                    readOnly={data.edit}
                    aria-describedby="email"
                  />
                </div>
              </div>
              {/* Website */}
              <div
                className="row col-md-6 p-1"
                style={{ margin: '0px', padding: '0px' }}
              >
                <label className="col-md-4 col-4" htmlFor="website">
                  Website <span className="text-danger">*</span>
                  <br />
                  <small>
                    <i>Website</i>
                  </small>
                </label>
                <div className="col-md-8 col-8">
                  <input
                    required
                    onChange={handleChange}
                    type="text"
                    className="form-control"
                    name="website"
                    id="website"
                    value={
                      data.edit ? company[0].website : data.company.website
                    }
                    readOnly={data.edit}
                    aria-describedby="website"
                  />
                </div>
              </div>
            </div>
            <div
              className="row col-md-12"
              style={{ margin: '0px', padding: '10px' }}
            >
              {/* Address */}
              <div
                className="row col-md-12 p-1"
                style={{ margin: '0px', padding: '0px' }}
              >
                <label className="col-md-2 col-4" htmlFor="address">
                  Alamat <span className="text-danger">*</span>
                  <br />
                  <small>
                    <i>Address</i>
                  </small>
                </label>
                <div className="col-md-10 col-8">
                  <textarea
                    className="form-control"
                    name="address"
                    id="address"
                    rows="5"
                    value={
                      data.edit ? company[0].address : data.company.address
                    }
                    readOnly={data.edit}
                    required
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>

              {/* City */}
              <div
                className="row col-md-6 p-1"
                style={{ margin: '0px', padding: '0px' }}
              >
                <label className="col-md-4 col-4" htmlFor="city">
                  Kota <span className="text-danger">*</span>
                  <br />
                  <small>
                    <i>City</i>
                  </small>
                </label>
                <div className="col-md-8 col-8">
                  <input
                    required
                    onChange={handleChange}
                    type="text"
                    className="form-control"
                    name="city"
                    id="city"
                    value={data.edit ? company[0].city : data.company.city}
                    readOnly={data.edit}
                    aria-describedby="city"
                  />
                </div>
              </div>
              {/* Country */}
              <div
                className="row col-md-6 p-1"
                style={{ margin: '0px', padding: '0px' }}
              >
                <label className="col-md-4 col-4" htmlFor="Country">
                  Negara <span className="text-danger">*</span>
                  <br />
                  <small>
                    <i>Country</i>
                  </small>
                </label>
                <div className="col-md-8 col-8">
                  <input
                    required
                    onChange={handleChange}
                    type="text"
                    className="form-control"
                    name="country"
                    id="country"
                    value={
                      data.edit ? company[0].country : data.company.country
                    }
                    readOnly={data.edit}
                    aria-describedby="country"
                  />
                </div>
              </div>

              {/* Other Info */}
              <div
                className="row col-md-12 p-1"
                style={{ margin: '0px', padding: '0px' }}
              >
                <label className="col-md-2 col-4" htmlFor="other">
                  Info Lain <span className="text-danger">*</span>
                  <br />
                  <small>
                    <i>Other Info</i>
                  </small>
                </label>
                <div className="col-md-10 col-8">
                  <input
                    required
                    onChange={handleChange}
                    type="text"
                    className="form-control"
                    name="other"
                    id="other"
                    value={data.edit ? company[0].other : data.company.other}
                    readOnly={data.edit}
                    aria-describedby="other"
                  />
                </div>
              </div>
            </div>
            <div className="w-100" style={{ margin: '0px', padding: '25px' }}>
              {data.edit ? (
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    setData({ ...data, company: company[0], edit: false })
                  }
                >
                  Edit
                </button>
              ) : (
                <>
                  <button className="btn btn-primary" onClick={handleUpdate}>
                    Update
                  </button>
                  <button
                    className="btn btn-warning"
                    onClick={() => setData({ ...data, edit: true })}
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div>data still loaded</div>
        </>
      )}
    </>
  )
}

export default Company
