"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getLocationById } from "@/services/locationService";
import Swal from "sweetalert2";

export default function LocationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loc, setLoc] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { ok, data, message } = await getLocationById(id);
      if (!ok) {
        setError(message || "ไม่พบข้อมูลสถานที่");
      } else {
        setLoc(data);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading)
    return <div className="text-center text-gray-500 p-10">Loading...</div>;
  if (error)
    return (
      <div className="text-center text-red-600 p-10">
        {error}
        <div>
          <button
            onClick={() => router.push("/admin/locations")}
            className="mt-4 px-4 py-2 border rounded-md hover:bg-gray-100"
          >
            Back
          </button>
        </div>
      </div>
    );

  return (
    <section className="max-w-4xl mx-auto bg-white shadow-sm rounded-xl p-8 mt-6 border border-gray-100 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {loc.name}
        </h1>
        <button
          onClick={() => router.push("/admin/locations")}
          className="px-4 py-2 border rounded-md hover:bg-gray-100"
        >
          ← Back
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <p className="text-gray-800 bg-gray-50 border rounded-md p-2">
            {loc.description || "-"}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <p className="text-gray-800 bg-gray-50 border rounded-md p-2">
            {loc.address || "-"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Latitude
          </label>
          <p className="text-gray-800 bg-gray-50 border rounded-md p-2">
            {loc.geoLat?.toFixed(6)}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Longitude
          </label>
          <p className="text-gray-800 bg-gray-50 border rounded-md p-2">
            {loc.geoLng?.toFixed(6)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Active Status
          </label>
          <div className="mt-1">
            {loc.active ? (
              <span className="inline-block px-3 py-1 text-xs font-semibold text-white rounded-full bg-green-500">
                Active
              </span>
            ) : (
              <span className="inline-block px-3 py-1 text-xs font-semibold text-white rounded-full bg-red-500">
                Inactive
              </span>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Created At
          </label>
          <p className="text-gray-800 bg-gray-50 border rounded-md p-2">
            {new Date(loc.createdAt).toLocaleString("th-TH")}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Image
        </label>
        {loc.coverImageUrl ? (
          <img
            src={loc.coverImageUrl}
            alt={loc.name}
            className="w-64 rounded-md shadow-sm border"
          />
        ) : (
          <p className="text-gray-400">No image</p>
        )}
      </div>

      {loc.units && loc.units.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
            Units
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {loc.units.map((u) => (
              <div
                key={u.id}
                className="border rounded-lg p-4 flex gap-4 items-start hover:bg-gray-50"
              >
                <img
                  src={u.imageUrl}
                  alt={u.name}
                  className="w-20 h-20 object-cover rounded-md border"
                />
                <div>
                  <div className="font-semibold text-gray-800">{u.name}</div>
                  <div className="text-sm text-gray-600">{u.shortDesc}</div>
                  <div className="text-sm text-gray-500">
                    💺 {u.capacity} seats
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    💰 {u.priceHourly} THB/hr
                  </div>
                  <div className="mt-1">
                    {u.active ? (
                      <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
