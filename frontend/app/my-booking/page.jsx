"use client";
import { useEffect, useState } from "react";
import { MdOutlineStar } from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";
import { GoPeople } from "react-icons/go";
import { RiVolumeMuteLine } from "react-icons/ri";
import { IoWifi } from "react-icons/io5";
import { GoClock } from "react-icons/go";
import { MdContentCopy } from "react-icons/md";
import { MdOutlineCancel } from "react-icons/md";
import { LuCalendarDays } from "react-icons/lu";





const BookingCard = ({ status, locationName, locationUnitName, location, rating, reviewCount, seats, isMute, isWifi, date, time, bookingCode, setIsCancel }) => (
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
                    <p className="mt-2">{seats}</p>

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
                    <p className="mt-2">{time}</p>

                    <div className=" h-5 w-0.5 ml-2 mr-2 bg-gray-200" />

                    <MdContentCopy size={15} />
                    <p>Booing Code: {bookingCode}</p>
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
                hover:bg-red-500 hover:text-white transition-colors duration-500"
                    onClick={() => { setIsCancel(true) }}>
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
                hover:bg-red-500 hover:text-white transition-colors duration-500"
                        onClick={() => { setIsCancel(true) }}>
                        Cancel the booking
                    </button>


                </div>
            )}


        </div>

    </>
)

const CancelledModal = ({ isCancel, onClose }) => (
    <div
        className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center transition-opacity duration-300
      ${isCancel ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
    >
        <div
            className={`w-110 h-75 bg-white rounded-xl p-4 flex flex-col items-center justify-center relative
        transform transition-transform duration-300
        ${isCancel ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            onClick={(e) => e.stopPropagation()}
        >
            <MdOutlineCancel size={90} className="text-red-600" />
            <h1 className="text-2xl mt-5 font-medium text-gray-700">
                Confirm cancellation?
            </h1>
            <p className="text-xl font-medium mt-1 text-gray-700">
                Cancellation cannot be undone
            </p>

            <div className="flex flex-row justify-around gap-5 mt-5">
                <button
                    type="button"
                    className="w-30 h-10 border border-gray-400 text-gray-400 rounded-xl cursor-pointer"
                    onClick={onClose}
                >
                    Close
                </button>

                <button
                    type="button"
                    className="w-30 h-10 border border-red-600 bg-red-600 text-white rounded-xl cursor-pointer
          font-bold hover:bg-red-700 transition-colors duration-500"
                >
                    Confirm
                </button>
            </div>
        </div>
    </div>
);


export default function MyBookingPage() {

    const [isBooking, setIsBooking] = useState(true);
    const [bookingStatus, setBookingStatus] = useState('all');
    const [isSelected, setIsSelected] = useState(false);
    const [isCancel, setIsCancel] = useState(false);


    const statusControl = (curBookingStatus) => {
        if (bookingStatus !== curBookingStatus) {
            setBookingStatus(curBookingStatus);
            setIsSelected(true);
        }
        else {
            setBookingStatus('all');
            setIsSelected(false);
        }
    }


    return (

        <>


            <CancelledModal isCancel={isCancel} onClose={() => setIsCancel(false)} />

            <div className="flex flex-col w-full h-screen p-20 pl-72 pr-95 -mt-5">

                <h1 className="text-3xl font-semibold text-purple-600">My booking</h1>

                <div className="flex flex-row gap-3">

                    <div className={`border ${isSelected && bookingStatus === 'pending' ? "bg-purple-400 text-white border-purple-400" : "bg-white text-purple-600 border-purple-600"} mt-5 p-2 rounded-xl transition-colors duration-500 cursor-pointer
                hover:bg-purple-400 hover:border-purple-400 hover:text-white `}
                        onClick={(() => { statusControl('pending'); })}>
                        <p className="text-sm">Pending payment</p>
                    </div>

                    <div className={`border ${isSelected && bookingStatus === 'hold' ? "bg-purple-400 text-white border-purple-400" : "bg-white text-purple-600 border-purple-600"} mt-5 p-2 rounded-xl transition-colors duration-500 cursor-pointer
                hover:bg-purple-400 hover:border-purple-400 hover:text-white `}
                        onClick={(() => { statusControl('hold'); })}>
                        <p className="text-sm">Waiting for approval</p>
                    </div>

                    <div className={`border ${isSelected && bookingStatus === 'confirm' ? "bg-purple-400 text-white border-purple-400" : "bg-white text-purple-600 border-purple-600"} mt-5 p-2 rounded-xl transition-colors duration-500 cursor-pointer
                hover:bg-purple-400 hover:border-purple-400 hover:text-white `}
                        onClick={(() => { statusControl('confirm'); })}>
                        <p className="text-sm">Success</p>
                    </div>

                    <div className={`border ${isSelected && bookingStatus === 'cancel' ? "bg-purple-400 text-white border-purple-400" : "bg-white text-purple-600 border-purple-600"} mt-5 p-2 rounded-xl transition-colors duration-500 cursor-pointer
                hover:bg-purple-400 hover:border-purple-400 hover:text-white `}
                        onClick={(() => { statusControl('cancel'); })}>
                        <p className="text-sm">Cancel</p>
                    </div>

                </div>

                {/* ถ้ามี Booking */}
                {isBooking ? (
                    <>
                        {bookingStatus === "all" && (
                            <>
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
                                    setIsCancel={setIsCancel}
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
                                    setIsCancel={setIsCancel}
                                />
                            </>
                        )}


                        {bookingStatus === "hold" && (
                            <>
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
                                    setIsCancel={setIsCancel}
                                />
                            </>
                        )}

                        {bookingStatus === "pending" && (
                            <>
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
                                    setIsCancel={setIsCancel}
                                />
                            </>
                        )}

                        {bookingStatus === "confirm" && (
                            <>
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
                            </>
                        )}

                        {bookingStatus === "cancel" && (
                            <>
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
                            </>
                        )}



                        <div className="flex flex-row gap-4 p-2 mt-15 justify-center pb-20 items-center">

                            <div className="w-7 h-7 rounded bg-white border-3 border-gray-300 flex justify-center items-center cursor-pointer">
                                <h1 className="text-lg text-gray-300 text-center font-bold">&lt;&lt;</h1>
                            </div>


                            <div className="w-8 h-8 rounded bg-white border-3 border-gray-300 flex justify-center items-center cursor-pointer">
                                <h1 className="text-xl text-gray-300 text-center font-bold">&lt;</h1>
                            </div>

                            <div className="w-10 h-10 rounded bg-purple-400 flex justify-center items-center cursor-pointer">
                                <h1 className="text-xl text-white text-center font-semibold">1</h1>
                            </div>

                            <div className="w-8 h-8 rounded bg-white border-3 border-gray-400 flex justify-center items-center cursor-pointer">
                                <h1 className="text-xl text-gray-400 text-center font-bold">&gt;</h1>
                            </div>

                            <div className="w-7 h-7 rounded bg-white border-3 border-gray-400 flex justify-center items-center cursor-pointer">
                                <h1 className="text-lg text-gray-400 text-center font-bold">&gt;&gt;</h1>
                            </div>


                        </div>
                    </>
                ):(
                    <div className="flex flex-col gap-5 justify-center items-center mt-40">

                        <LuCalendarDays size={170} className="text-purple-600"/>
                        <p className="text-lg">No reservations yet. Try starting search</p>

                        <button type="button" className="text-center text-white bg-purple-600 rounded-xl w-90 h-10 font-semibold cursor-pointer
                        hover:bg-purple-800 transition-colors duration-500">
                            Go to Search
                        </button>

                    </div>
                )}

            </div>
        </>
    );
}
