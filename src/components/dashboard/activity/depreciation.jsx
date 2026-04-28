import React, { useState, useMemo } from 'react'
import useFetch from '../../useFetch'
import AddAssets from '../modal/addAssets'
import Modal from '../../site/modal'
import { useNavigate } from 'react-router-dom'
import { reqAssets, reqJournal } from '../../reqFetch'
import { useQuery } from 'react-query'

const Depreciation = () => {
  const { data: assets, error, isError, isLoading } = useQuery(
    'assets',
    reqAssets,
  )
  const { data: journal } = useQuery('journal', reqJournal)
  // const { data: assets } = useFetch('getassets.php')
  // const { data: journal } = useFetch('getjournal.php')
  const navigate = useNavigate()
  const [vis, setVis] = useState({ modal: false })
  const [data, setData] = useState({ vis: false })
  //   const elementRef = useRef(null);
  const handleClose = (e) => {
    setVis({ ...vis, modal: false })
    // navigate(0)
    // window.location.reload()
  }
  const handleChange = (e) => {
    console.log(`${[e.target.name]}`, e.target.value)
    setData({
      ...data,
      [e.target.name]: e.target.value,
    })
  }
  let assetsFil = useMemo(() => {
    const searchRegex = data.search && new RegExp(`${data.search}`, 'gi')
    return assets
      ?.sort((a, b) => (a.date > b.date ? 1 : -1))
      .filter(
        (d) =>
          (!searchRegex || searchRegex.test(d.name + d.code)) &&
          (!data.search_type || d.type === data.search_type) &&
          (!data.end_date || d.date === data.end_date),
      )
  }, [assets, data.search, data.search_type, data.end_date])

  const handleCalc = async () => {
    try {
      // Check Journal for Depreciation
      let depJournal = await journal?.filter((f) => f.type === 'Depreciation')
      // jika depJournal RefID = assetsId dan
      console.log(depJournal)
    } catch (error) {
      console.log(error)
    }
  }
  const handleDepreciationDet = (i, code) => {
    console.log(i, code)
  }
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
          {
            1: 'Add Assets',
            2: '',
          }[vis.value]
        }
        element={
          {
            1: <AddAssets handleClose={handleClose} />,
            2: '',
          }[vis.value]
        }
        handleClose={handleClose}
      />

      {/* Component Title */}
      <div
        className="w-100"
        style={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <div className=" __content_title">Assets</div>
        {/* add User + search */}
        <div className="" style={{ display: 'flex' }}>
          <div
            className="col"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <input
              className="form-control m-1"
              type="search"
              name="search"
              placeholder="Search by text"
              onChange={handleChange}
            />
          </div>

          <button
            className="btn btn-primary m-1"
            onClick={() => setVis({ ...vis, modal: true, value: 1 })}
          >
            <i className="bi bi-plus"></i> New
          </button>
          <button className="btn btn-primary m-1" onClick={handleCalc}>
            <i className="bi bi-calculator"></i> Calc
          </button>
        </div>
      </div>

      <hr style={{ margin: '0' }} />
      <span>eco_value = (init_value * qty) / (lifetime * 12)</span>
      <div className="w-100" style={{ height: '25px' }}></div>
      <div className="row col-md-12" style={{ paddingLeft: '25px' }}>
        <div
          className="row d-none d-md-flex col-md-12"
          style={{
            color: 'white',
            textAlign: 'left',
            padding: '7px 0',
            fontWeight: '600',
          }}
        >
          <div className="col-md-3">Code - Name</div>
          <div className="col-md-2">Date</div>
          <div className="col-md-1">Qty</div>
          <div className="col-md-1">Lifetime</div>
          <div className="col-md-2" style={{ textAlign: 'center' }}>
            Init Value
          </div>
          <div className="col-md-2" style={{ textAlign: 'center' }}>
            Eco Value
          </div>
          <div className="col-md-1"></div>
        </div>
        <hr />
      </div>
      {/* {console.log(data)} */}
      <div className="row col-md-12" style={{ paddingLeft: '25px' }}>
        {assetsFil?.map((d, i) => (
          <div key={i + '-' + d.id + '-' + d.code}>
            <div
              className="row col-md-12"
              style={{
                color: 'white',
                textAlign: 'left',
                fontWeight: '100',
              }}
            >
              {/* {console.log(d)} */}
              <div className="col-md-3 col-6">
                {d.code} - {d.name}
              </div>
              <div className="col-md-2 col-6">{d.date}</div>
              <div className="col-md-1 col-3">{d.qty}</div>
              <div className="col-md-1 col-3">{d.lifetime} yr</div>
              <div className="col-md-2 col-6" style={{ textAlign: 'right' }}>
                {d.init_value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
              </div>
              <div className="col-md-2 col-6" style={{ textAlign: 'right' }}>
                {d.eco_value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}{' '}
              </div>

              <div
                className="col-md-1 col-3"
                style={{ textAlign: 'right' }}
                onClick={() => handleDepreciationDet(i, d.code)}
                onMouseOver={(e) =>
                  (e.target.firstChild.className = 'bi bi-plus-square-fill')
                }
                onMouseOut={(e) =>
                  (e.target.firstChild.className = 'bi bi-plus-square')
                }
              >
                <i className="bi bi-plus-square" style={{ color: 'white' }}></i>
              </div>
            </div>
            <hr />
          </div>
        ))}
      </div>
    </>
  )
}

export default Depreciation
