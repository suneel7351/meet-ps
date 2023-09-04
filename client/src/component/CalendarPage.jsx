import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateSelectedDateTime } from '../redux/dateSlice';
import { BiTime } from 'react-icons/bi';
import { FiLogOut } from "react-icons/fi"
import { AiOutlineArrowLeft } from "react-icons/ai"

import { syncGoogleEvent, getProfile, logoutClient } from '../redux/clientSlice';
import Loader from '../layout/Loader';

const CalendarPage = () => {

  const { loading } = useSelector(state => state.client)
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const [disabledDates, setDisabledDates] = useState([]);

  const [event, setEvent] = useState('')
  const { events, user } = useSelector(state => state.client);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [weekdays, setWeekDays] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState("")
  const params = useParams();
  const nextPage = async () => {
    if (!time) return;
    dispatch(updateSelectedDateTime({
      date: selectedDate, timing: time, description: event && event.description,
      organizor: event && event.owner && event.owner.name && event.owner.name,
      duration: event && event.duration, name: event && event.name, eventId: event && event._id,
      loggedEmail: user && user.email && user.email,
      bookedPerson: user && user.name && user.name,
      ownerId: params.user
    }))

    navigate(`/event/share/final`)
  }
  const handleDateClick = (date) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const selectedDate = date.toLocaleDateString('en-US', options);
    setSelectedDate(selectedDate);
  };


  useEffect(() => {
    if (user) {
      const eventData = user.event && user.event.find((item) => item._id === params.eventId);
      setEvent(eventData);
      console.log(eventData.timeSlots);
      setTimeSlots(eventData.timeSlots);
      console.log(eventData.timeSlots);
      setWeekDays(eventData.weekdays);
      setHolidays(user.holidays)


    }
  }, [user, params.eventId])
  useEffect(() => {
    if (event) {
      setDuration(event?.duration)
    }
  }, [event])




  useEffect(() => {
    dispatch(getProfile(params.user))
  }, [params.user, dispatch])



  useEffect(() => {
    const syncEventWithGoogle = async () => {
      if (params.user) {
        try {
          await dispatch(syncGoogleEvent(params.user));
        } catch (error) {
          console.error(error);
        }
      }

    };

    syncEventWithGoogle();
  }, [dispatch, params.user]);



  function divideTimeRange(startTime, endTime, durationInMinutes, timeSlots) {
    const intervals = [];
    const startDate = new Date(`01/01/2000 ${startTime}`);
    const endDate = new Date(`01/01/2000 ${endTime}`);
    const durationInMillis = durationInMinutes * 60000;
    let currentTime = startDate;

    while (currentTime <= endDate) {
      const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (isTimeSlotAvailable(timeString, timeSlots, durationInMinutes)) {

        intervals.push(timeString)


      }
      currentTime = new Date(currentTime.getTime() + durationInMillis);
    }

    return intervals;
  }












  function isTimeSlotAvailable(time, timeSlots, durationInMinutes) {
    const startTimeInMillis = new Date(`01/01/2000 ${time}`).getTime();
    const endTimeInMillis = startTimeInMillis + (durationInMinutes * 60000);

    for (let i = 0; i < timeSlots.length; i++) {
      const [slotStartTime, slotEndTime] = timeSlots[i].split('-').map(slot => slot.trim());
      const slotStartTimeInMillis = new Date(`01/01/2000 ${slotStartTime}`).getTime();
      const slotEndTimeInMillis = new Date(`01/01/2000 ${slotEndTime}`).getTime();

      if (
        startTimeInMillis >= slotStartTimeInMillis &&
        endTimeInMillis <= slotEndTimeInMillis
      ) {
        return true;
      }
    }

    return false;
  }



  let timeIntervals = [];
  for (let i = 0; i < timeSlots.length; i++) {
    const [startTime, endTime] = timeSlots[i].split('-').map(slot => slot.trim());
    timeIntervals.push(
      ...divideTimeRange(
        startTime,
        endTime,
        event && event.duration,
        timeSlots
      )
    );
  }




  useEffect(() => {
    const weekdaysMap = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6
    };

    const disabled = [0, 1, 2, 3, 4, 5, 6].filter(day => !weekdays.includes(Object.keys(weekdaysMap)[day]));

    setDisabledDates(disabled);

  }, [weekdays]);






  const disableCalendar = (date) => {
    const currentDate = new Date();
    const targetDate = new Date(date);


    // Disable specific weekdays
    if (disabledDates.includes(date.getDay())) {
      return true;
    }

    // Disable past dates
    if (targetDate < currentDate && !isSameDay(targetDate, currentDate)) {
      return true;
    }




    for (const range of holidays) {
      let [startDate, endDate] = range.split('to');
      startDate = startDate.trim()
      endDate = endDate.trim()
      const [startYear, startMonth, startDay] = startDate.split('-');
      const [endYear, endMonth, endDay] = endDate.split('-');



      const start = new Date(`${startMonth}/${startDay}/${startYear}`);
      const end = new Date(`${endMonth}/${endDay}/${endYear}`);

      if (targetDate >= start && targetDate <= end) {
        return true;
      }

    }


    return false;
  };

  // Helper function to check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };






  function disableSlot() {
    const index = [];

    if (events) {
      const date1 = new Date(selectedDate);
      date1.setHours(0, 0, 0, 0);

      for (let i = 0; i < events.length; i++) {
        const date2 = new Date(events[i].date && events[i].date);
        date2.setHours(0, 0, 0, 0);

        if (date1.getTime() === date2.getTime()) {
          const [hours1, minutes1] = events[i].startTime.split(':').map(part => parseInt(part));
          const [hours2, minutes2] = events[i].endTime.split(':').map(part => parseInt(part));
          const eventDuration = duration;

          for (let j = 0; j < timeIntervals.length; j++) {
            const intervalTime = timeIntervals[j];
            const intervalEndTime = new Date(timeIntervals[j]);
            intervalEndTime.setMinutes(intervalEndTime.getMinutes() + eventDuration); // Add duration to interval end time

            // Convert event start and end times to Date objects
            const eventStartTime = new Date(`01/01/2000 ${hours1}:${minutes1}`);
            const eventEndTime = new Date(`01/01/2000 ${hours2}:${minutes2}`);

            // Convert interval start and end times to Date objects
            const intervalStartTime = new Date(`01/01/2000 ${intervalTime}`);
            const intervalEnTime = new Date(`01/01/2000 ${timeIntervals[j]}`);
            intervalEnTime.setMinutes(intervalEndTime.getMinutes() + eventDuration); // Add duration to interval end time

            // Check if the interval overlaps with the event's start time, end time, and duration
            if (
              (intervalStartTime >= eventStartTime && intervalStartTime < eventEndTime) ||
              (intervalEndTime > eventStartTime && intervalEndTime <= eventEndTime)
            ) {
              index.push(j);
            }
          }
        }
      }
    }

    return index;
  }



  let index = disableSlot()

  console.log(events, index);

  const logOutHandler = () => {
    dispatch(logoutClient())
  }












  return (
    <div className="">
      <div className='flex justify-between px-2 my-2'> <span onClick={() => navigate(-1)} className='cursor-pointer text-white bg-[#bad900] px-2 py-1 shadow'><AiOutlineArrowLeft className='text-xl' /></span>
        <button onClick={logOutHandler} className=''>   <FiLogOut className='text-2xl text-white cursor-pointer' /></button></div>
      {loading ? <Loader /> : <>
        <div className="flex flex-col md:flex-row bg-white container mx-auto border border-gray-200">
          <div className="flex-1 p-8 border-r border-gray-200">
            {/* <span className="text-gray-700">Created By {event?.owner?.name}</span> */}
            <h1 className="text-2xl">{event && event.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <BiTime className="text-xl text-gray-600" />
              <span className="text-gray-600 text-xl">{event && event.duration} min</span>
            </div>
            <div className="my-4">
              <p className="text-gray-800">{event && event.description}</p>
            </div>
            {/* <div>
              Booked with {user && user.name}
            </div> */}
          </div>
          <div className="w-full flex-[2] p-8 ">
            <Calendar
              className={"w-full mx-auto"}

              tileDisabled={({ date }) => disableCalendar(date)}
              onClickDay={handleDateClick}
              tileClassName={({ activeStartDate, date, view }) =>
                view === 'month' && selectedDate === date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                  ? 'calendar__tile calendar__tile--active'
                  : 'calendar__tile'
              }
            />

            {/* <Calendar
              className="w-full mx-auto"
              tileDisabled={({ date }) => isDateDisabled(date)}
              onClickDay={handleDateClick}
              tileClassName={({ activeStartDate, date, view }) =>
                view === 'month' && selectedDate === date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                  ? 'calendar__tile calendar__tile--active'
                  : 'calendar__tile'
              }
            /> */}


          </div>
          <div className="flex-1 flex flex-col gap-2 px-8 border-l border-gray-200 mt-4 overflow-y-auto h-[90vh]">
            <button
              onClick={nextPage}
              className="border bg-blue-500 w-16 text-center text-white px-2 py-1 text-center rounded shadow"
              disabled={time ? false : true}

            >
              Next
            </button>
            <div>
              {selectedDate && (
                <p>{selectedDate.toLocaleString()}</p>
              )}
            </div>
            <div className="flex gap-4 flex-col mt-4">



              {selectedDate && timeIntervals.length > 0 &&
                timeIntervals
                  .filter((item, i) => {
                    const currentTime = new Date();
                    const selectedDateTime = new Date(`${selectedDate} ${item}`);
                    return selectedDateTime > currentTime && !(index.length > 0 && index.includes(i));
                  })
                  .map((item, i) => (
                    <div
                      onClick={() => {
                        if (index.length > 0 && index.includes(i)) {
                          return;
                        }
                        setTime(item);
                      }}
                      key={item}
                      className={`cursor-pointer border-2 text-center rounded shadow px-4 py-2 ${time === item
                        ? 'bg-blue-500 text-white'
                        : 'border-blue-500 text-blue-500 hover:border-blue-800 hover:text-blue-800'
                        }`}
                    >
                      {item}
                    </div>
                  ))
              }



            </div>

          </div>

        </div>

      </>}
    </div>
  );
};

export default CalendarPage;















