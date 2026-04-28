import React, { useState, useMemo } from 'react'
import AddAssets from '../modal/addAssets'
import Modal from '../../site/modal'
import { useNavigate } from 'react-router-dom'
import { reqAssets, reqJournal } from '../../reqFetch'
import { useQuery } from '@tanstack/react-query'

const Depreciation = () => {
  const { data: assets, error, isError, isLoading } = useQuery({ queryKey: ['assets'], queryFn: reqAssets })
  const { data: journal } = useQuery({ queryKey: ['journal'], queryFn: reqJournal })
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
        className="w-full"
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
              className="m-1 w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              type="search"
              name="search"
              placeholder="Search by text"
              onChange={handleChange}
            />
          </div>

          <button
            className="m-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors cursor-pointer"
            onClick={() => setVis({ ...vis, modal: true, value: 1 })}
          >
            <i className="bi bi-plus"></i> New
          </button>
          <button className="m-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors cursor-pointer" onClick={handleCalc}>
            <i className="bi bi-calculator"></i> Calc
          </button>
        </div>
      </div>

      <hr style={{ margin: '0' }} />
      <span>eco_value = (init_value * qty) / (lifetime * 12)</span>
      <div className="w-full" style={{ height: '25px' }}></div>
      <div className="flex flex-wrap w-full" style={{ paddingLeft: '25px' }}>
        <div
          className="hidden md:flex w-full"
          style={{
            color: 'white',
            textAlign: 'left',
            padding: '7px 0',
            fontWeight: '600',
          }}
        >
          <div className="md:w-3/12">Code - Name</div>
          <div className="md:w-2/12">Date</div>
          <div className="md:w-1/12">Qty</div>
          <div className="md:w-1/12">Lifetime</div>
          <div className="md:w-2/12" style={{ textAlign: 'center' }}>
            Init Value
          </div>
          <div className="md:w-2/12" style={{ textAlign: 'center' }}>
            Eco Value
          </div>
          <div className="md:w-1/12"></div>
        </div>
        <hr />
      </div>
      {/* {console.log(data)} */}
      <div className="flex flex-wrap w-full" style={{ paddingLeft: '25px' }}>
        {assetsFil?.map((d, i) => (
          <div key={i + '-' + d.id + '-' + d.code}>
            <div
              className="flex flex-wrap w-full"
              style={{
                color: 'white',
                textAlign: 'left',
                fontWeight: '100',
              }}
            >
              {/* {console.log(d)} */}
              <div className="md:w-3/12 w-1/2">
                {d.code} - {d.name}
              </div>
              <div className="md:w-2/12 w-1/2">{d.date}</div>
              <div className="md:w-1/12 w-3/12">{d.qty}</div>
              <div className="md:w-1/12 w-3/12">{d.lifetime} yr</div>
              <div className="md:w-2/12 w-1/2" style={{ textAlign: 'right' }}>
                {d.init_value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
              </div>
              <div className="md:w-2/12 w-1/2" style={{ textAlign: 'right' }}>
                {d.eco_value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}{' '}
              </div>

              <div
                className="md:w-1/12 w-3/12"
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
