import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { profile, updateProfile } from '../redux/userSlice';
import Loader from '../layout/Loader';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState("")
  const [avatar, setAvatar] = useState(null);
  const [weekdays, setWeekdays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [expertIn, setExpertIn] = useState("");



  useEffect(() => {
    dispatch(profile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatar(user.avatar ? user.avatar.url : null);
      setWeekdays(user.weekdays || []);
      setTimeSlots(user.timeSlots || []);
      setPhone(user.phone && user.phone)
      setExpertIn(user.expertIn && user.expertIn)
    }
  }, [user]);
  console.log(user);
  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelClick = () => {
    setEditMode(false);
    setName(user.name);
    setAvatar(user.avatar ? user.avatar.url : null);
    setWeekdays(user.weekdays || []);
    setTimeSlots(user.timeSlots || []);
    setPhone(user.phone)
    setExpertIn(user.expertIn)
  };

  const handleSaveClick = async () => {
    await dispatch(updateProfile({ name, avatar, phone, expertIn }));
    setEditMode(false);
    dispatch(profile());
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {loading ? (
        <Loader />
      ) : (
        <>
          {user ? (
            <div className="bg-white shadow-lg w-full md:w-[60%] lg:w-[50%] mx-auto rounded-lg py-8 px-4 sm:px-8 lg:px-12">
              <div className="flex items-center mb-4">
                <div className="relative">
                  {editMode && avatar ? (
                    <img src={avatar} alt="Avatar Preview" className="w-24 h-24 rounded-full object-cover shadow-md" />
                  ) : user.avatar ? (
                    <img src={user.avatar.url} alt="Avatar" className="w-24 h-24 rounded-full object-cover shadow-md" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-300 mr-4"></div>
                  )}
                  {editMode && (
                    <label htmlFor="profile-image" className="absolute bottom-0 right-4 bg-blue-500 rounded-full text-white p-1 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M16 6a6 6 0 11-12 0 6 6 0 0112 0zm2 6a8 8 0 10-16 0v1a1 1 0 001 1h14a1 1 0 001-1v-1z" clipRule="evenodd" />
                      </svg>
                      <input id="profile-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  )}
                </div>
                <div className='flex flex-col gap-2'>
                  <div className='h-8'> {editMode ? (
                    <input
                      placeholder='Name'
                      type="text"
                      value={name}
                      onChange={handleNameChange}
                      className="ml-4 w-full px-3 py-1 border border-gray-300 rounded focus:outline-none"
                    />
                  ) : (
                    <>
                      <h2 className="ml-4 text-xl font-bold">{user.name}</h2>
                    </>
                  )}</div>

                  <div className='h-8'><p className="ml-4 text-gray-500">{user.email}</p></div>

                  <div className='h-8'> {
                    editMode ? <input
                      type="text"
                      value={phone}
                      placeholder='Mobile No.'
                      onChange={(e) => setPhone(e.target.value)}
                      className="ml-4 w-full px-3 py-1 border border-gray-300 rounded focus:outline-none"
                    /> : <p className="ml-4 text-gray-500">{user.phone}</p>
                  }</div>
                  <div className='h-8'> {
                    editMode ? <input
                      maxLength={35}
                      type="text"
                      value={expertIn}
                      placeholder='Expert In'
                      onChange={(e) => setExpertIn(e.target.value)}
                      className="ml-4 mt-4 w-full px-3 py-1 border border-gray-300 rounded focus:outline-none"
                    /> : <p className="ml-4 text-gray-500">{user.expertIn}</p>
                  }</div>

                </div>
              </div>

              {editMode ? (
                <div className="flex justify-end">
                  <button className="text-gray-500 hover:underline mr-2" onClick={handleCancelClick}>
                    Cancel
                  </button>
                  <button disabled={loading} className="text-blue-500 hover:underline" onClick={handleSaveClick}>

                    {loading ? (
                      <div className="rounded-full mx-auto  h-[20px] w-[20px] border-2 border-blue-500 border-t-white animate-spin"></div>
                    ) : (
                      'Save'
                    )}

                  </button>
                </div>
              ) : (
                <div className="flex justify-end">
                  <button className="shadow text-blue-500 py-1 px-4" onClick={handleEditClick}>
                    Edit Profile
                  </button>
                </div>
              )}


            </div>
          ) : (
            <div className="text-center text-red-500">Error: Failed to fetch user data.</div>
          )}
        </>
      )}
    </div>
  );
};

export default Profile;
