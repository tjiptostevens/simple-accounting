import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reqCompany } from "../../reqFetch";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";

const Company = () => {
  const { companyId } = useAuth();
  const [data, setData] = useState({
    company: {
      name: "",
      address: "",
      phone: "",
    },
  });

  const {
    data: company,
    isLoading,
    isError,
    error,
  } = useQuery({ queryKey: ['company'], queryFn: reqCompany });

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('company')
        .update(data.company)
        .eq('id', companyId);
      if (error) throw error;
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error! {error.message}</div>;

  return (
    <>
      <div
        className="w-full"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <div className="__content_title">Company</div>
      </div>
      <hr style={{ margin: "0" }} />
      {company &&
        company.map((e, i) => (
          <div key={i} className="flex flex-wrap" style={{ padding: "15px 0" }}>
            <div className="md:w-1/2">
              <form onSubmit={handleUpdate}>
                <div className="flex flex-wrap" style={{ margin: "0 0 10px 0" }}>
                  <label
                    className="md:w-1/4"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    Name
                  </label>
                  <div className="md:w-3/4">
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                      defaultValue={e.name}
                      onChange={(x) =>
                        setData({
                          ...data,
                          company: { ...data.company, name: x.target.value },
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-wrap" style={{ margin: "0 0 10px 0" }}>
                  <label
                    className="md:w-1/4"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    Address
                  </label>
                  <div className="md:w-3/4">
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                      defaultValue={e.address}
                      onChange={(x) =>
                        setData({
                          ...data,
                          company: {
                            ...data.company,
                            address: x.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-wrap" style={{ margin: "0 0 10px 0" }}>
                  <label
                    className="md:w-1/4"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    Phone
                  </label>
                  <div className="md:w-3/4">
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                      defaultValue={e.phone}
                      onChange={(x) =>
                        setData({
                          ...data,
                          company: { ...data.company, phone: x.target.value },
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-wrap">
                  <div className="md:w-1/4"></div>
                  <div className="md:w-3/4">
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors cursor-pointer"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ))}
    </>
  );
};

export default Company;
