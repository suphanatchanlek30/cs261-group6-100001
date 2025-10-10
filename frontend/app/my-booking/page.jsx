"use client";
import { useEffect, useState } from "react";
import { MdOutlineStar } from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";
import { GoPeople } from "react-icons/go";
import { RiVolumeMuteLine } from "react-icons/ri";
import { IoWifi } from "react-icons/io5";
import { GoClock } from "react-icons/go";
import { MdContentCopy } from "react-icons/md";


const BookingCard = ({ status, locationName, locationUnitName, location, rating, reviewCount, seats, isMute, isWifi, date, time, bookingCode }) => (
    <>
        <div className="flex flex-row rounded-2xl w-full h-50 mt-10 z-10 shadow relative gap-4
            transform transition-all duration-300 hover:scale-102 hover:shadow-lg cursor-pointer">

            <div className="h-full w-3 bg-white absolute left-47" />
            <img src="/login-register.png" className="rounded-2xl" alt="Logo" width={200} height={100} />

            <div className="flex flex-col pt-2 gap-3.5">

                <div className="flex flex-row items-center">

                    {status === 'confirmed' && (
                        <div className="bg-green-300 rounded-full w-45 p-1.5 ">
                            <p className="text-center font-semibold text-green-700">CONFIRMED</p>
                        </div>
                    )}

                    {status === 'cancelled' && (
                        <div className="bg-red-400/80 rounded-full w-45 p-1.5 ">
                            <p className="text-center font-semibold text-red-800">CANCELLED</p>
                        </div>
                    )}

                    {status === 'pending' && (
                        <div className="bg-cyan-400 rounded-full w-45 p-1.5 ">
                            <p className="text-center font-semibold text-cyan-800">PENDING</p>
                        </div>
                    )}

                    {status === 'hold' && (
                        <div className="bg-yellow-300 rounded-full w-45 p-1.5 ">
                            <p className="text-center font-semibold text-yellow-700">HOLD</p>
                        </div>
                    )}

                    <div className=" h-5 w-0.5 ml-6 mr-6 bg-gray-200" />

                    {[...Array(rating)].map((_, i) => (
                        <MdOutlineStar key={i} size={20} className="text-amber-400" />
                    ))}



                    <p className="ml-6 text-sm text-gray-400">({reviewCount} reviews)</p>
                </div>

                <div className="flex flex-row gap-4 items-center">
                    <h1 className="text-xl font-medium">{locationName}</h1>
                    <h2 className="text-xl font-medium text-purple-500">{locationUnitName}</h2>
                </div>

                <div className="flex flex-row -mt-2 gap-2 items-center text-gray-600 text-sm ">
                    <CiLocationOn size={20} />
                    <p>{location}</p>

                    <div className=" h-5 w-0.5 ml-2 mr-2 bg-gray-200" />
                    <GoPeople size={20} />
                    <p2 className="mt-2">{seats}</p2>

                    {isMute && (
                        <><div className=" h-5 w-0.5 ml-2 mr-2 bg-gray-200" />
                            <RiVolumeMuteLine size={20} /></>
                    )}

                    {isWifi && (
                        <><div className=" h-5 w-0.5 ml-2 mr-2 bg-gray-200" />
                            <IoWifi size={20} /></>
                    )}
                </div>

                <div className="flex flex-row -mt-2 gap-2 items-center text-gray-600 text-sm ">
                    <p>Booking Date: {date}</p>
                    <div className=" h-5 w-0.5 ml-2 mr-2 bg-gray-200" />

                    <GoClock size={20} />
                    <p2 className="mt-2">{time}</p2>

                    <div className=" h-5 w-0.5 ml-2 mr-2 bg-gray-200" />

                    <MdContentCopy size={15} />
                    <p2>Booing Code: {bookingCode}</p2>
                </div>

                <h1 className="text-purple-500 font-semibold">Total 210 Bath</h1>

            </div>

            {status === 'confirmed' && (
                <button type="button" className="absolute right-3 bottom-3 p-2 border-2 border-purple-700 rounded-xl text-purple-700 font-semibold cursor-pointer
                hover:bg-purple-700 hover:text-white transition-colors duration-500">
                    Rate & Review
                </button>
            )}

            {status === 'pending' && (
                <button type="button" className="absolute right-3 bottom-3 p-2 border-2 border-red-500 rounded-xl text-red-500 font-semibold cursor-pointer
                hover:bg-red-500 hover:text-white transition-colors duration-500">
                    Cancel the booking
                </button>
            )}

            {status === 'hold' && (
                <div className=" flex flex-col gap-3 absolute right-3 bottom-3">

                    <button type="button" className="right-3 bottom-3 p-2 border-2 border-amber-400 rounded-xl text-amber-500 font-semibold cursor-pointer
                hover:bg-amber-400 hover:text-white transition-colors duration-500">
                        payment
                    </button>

                    <button type="button" className=" right-3 bottom-3 p-2 border-2 border-red-500 rounded-xl text-red-500 font-semibold cursor-pointer
                hover:bg-red-500 hover:text-white transition-colors duration-500">
                        Cancel the booking
                    </button>


                </div>
            )}


        </div>

    </>
)




export default function MyBookingPage() {
    return (
        <div className="flex flex-col w-full h-screen p-20 pl-72 pr-95 -mt-5">

            <h1 className="text-3xl font-semibold text-purple-600">My booking</h1>

            <div className="flex flex-row gap-3">

                <div className="border border-purple-600 text-purple-600 mt-5 p-2 rounded-xl transition-colors duration-500 cursor-pointer
                hover:bg-purple-400 hover:border-purple-400 hover:text-white">
                    <p className="text-sm">Pending payment</p>
                </div>

                <div className="border border-purple-600 text-purple-600 mt-5 p-2 rounded-xl transition-colors duration-500 cursor-pointer
                hover:bg-purple-400 hover:border-purple-400 hover:text-white">
                    <p className="text-sm">Waiting for approval</p>
                </div>

                <div className="border border-purple-600 text-purple-600 mt-5 p-2 rounded-xl transition-colors duration-500 cursor-pointer
                hover:bg-purple-400 hover:border-purple-400 hover:text-white">
                    <p className="text-sm">Success</p>
                </div>

                <div className="border border-purple-600 text-purple-600 mt-5 p-2 rounded-xl transition-colors duration-500 cursor-pointer
                hover:bg-purple-400 hover:border-purple-400 hover:text-white">
                    <p className="text-sm">Cancel</p>
                </div>

            </div>

            {/*status, locationName, locationUnitName, location, rating, seats, isMute, isWifi, date, time, bookingCode] */}
            <BookingCard
                status="confirmed"
                locationName="The Meal Co-Op"
                locationUnitName="T-06 · Table 6"
                rating={5}
                reviewCount={584}
                location="Samyan Mitrtown, 2nd Floor"
                seats={2}
                isMute={true}
                isWifi={true}
                date="16/06/2568"
                time="09:00-12:00(3 hours)"
                bookingCode="meal66"
            />

            <BookingCard
                status="cancelled"
                locationName="The Meal Co-Op"
                locationUnitName="T-06 · Table 6"
                rating={5}
                reviewCount={584}
                location="Samyan Mitrtown, 2nd Floor"
                seats={2}
                isMute={true}
                isWifi={true}
                date="16/06/2568"
                time="09:00-12:00(3 hours)"
                bookingCode="meal66"
            />

            <BookingCard
                status="pending"
                locationName="The Meal Co-Op"
                locationUnitName="T-06 · Table 6"
                rating={5}
                reviewCount={584}
                location="Samyan Mitrtown, 2nd Floor"
                seats={2}
                isMute={true}
                isWifi={true}
                date="16/06/2568"
                time="09:00-12:00(3 hours)"
                bookingCode="meal66"
            />

            <BookingCard
                status="hold"
                locationName="The Meal Co-Op"
                locationUnitName="T-06 · Table 6"
                rating={5}
                reviewCount={584}
                location="Samyan Mitrtown, 2nd Floor"
                seats={2}
                isMute={true}
                isWifi={true}
                date="16/06/2568"
                time="09:00-12:00(3 hours)"
                bookingCode="meal66"
            />


        </div>
    );
}
