import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import PageLoader from "../../components/PageLoader";
import Back from "../../components/Back";
import toast from "react-hot-toast";
import { auth } from "../../services/api";
import ProfileEditModal from "../../components/modals/ProfileEditModal";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faCalendarAlt,
  faNotesMedical,
  faThumbtack,
  faTrash,
  faShareAlt,
  faCog,
  faSignOutAlt,
  faEdit
} from "@fortawesome/free-solid-svg-icons";

import gsap from "gsap";

const ProfilePage = () => {
  const { t } = useTranslation();
  const { username } = useParams();
  const { user: loggedInUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Refs for animation
  const headerRef = useRef(null);
  const sectionRefs = useRef([]);
  sectionRefs.current = [];

  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!username) {
        setIsLoading(false);
        toast.error(t("Invalid URL: Username is missing."));
        navigate("/dashboard");
        return;
      }

      setIsLoading(true);
      try {
        const response = await auth.getUserProfileWithStats(username);
        setProfileData(response.data.profile);
        setStats(response.data.stats);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error(t("Failed to load profile."));
        setProfileData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [username, navigate, t]);

  // GSAP Animations
  useEffect(() => {
    if (!isLoading && headerRef.current && sectionRefs.current.length > 0) {
      gsap.from(headerRef.current, {
        opacity: 0,
        y: -50,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(sectionRefs.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });
    }
  }, [isLoading]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!profileData) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p>{t("Profile not found or could not be loaded.")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-16 text-white" style={{ backgroundColor: '#1a202c' }}>
      <Navbar />
      <div className="container mt-16 mx-auto p-4 md:p-8 flex-grow">
        <div className="flex items-center mb-6" ref={headerRef}>
          <Back />
          <h1 className="text-3xl font-bold ml-4">{t("User Profile")}</h1>
        </div>

        {/* Header Card */}
        <div
          className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between"
          ref={addToRefs}
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center text-3xl text-gray-400">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{profileData.name}</h2>
              <p className="text-gray-400">@{profileData.username}</p>
              <p className="text-gray-400 flex items-center space-x-2">
                <FontAwesomeIcon icon={faEnvelope} />{" "}
                <span>{profileData.email}</span>
              </p>
              <p className="text-gray-400 flex items-center space-x-2">
                <FontAwesomeIcon icon={faCalendarAlt} />{" "}
                <span>{t("Joined")}: {new Date(profileData.createdAt).toDateString()}</span>
              </p>
            </div>
          </div>
        </div>

        {/* First Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bio */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6" ref={addToRefs}>
            <h3 className="text-xl font-semibold mb-2">{t("Bio")}</h3>
            <p className="text-gray-400 italic">
              {profileData.bio || t("No bio yet. Click 'Edit Profile' to add one.")}
            </p>
          </div>

          {/* Stats */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6" ref={addToRefs}>
            <h3 className="text-xl font-semibold mb-4">{t("Statistics")}</h3>
            <div className="space-y-3">
              <Link to="/notes" className="flex items-center justify-between text-gray-300 hover:text-white transition-colors duration-200">
                <span className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faNotesMedical} /> <span>{t("Total Notes")}</span>
                </span>
                <span className="font-bold">{stats?.totalNotes || 0}</span>
              </Link>
              <Link to="/notes" className="flex items-center justify-between text-gray-300 hover:text-white transition-colors duration-200">
                <span className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faThumbtack} /> <span>{t("Pinned Notes")}</span>
                </span>
                <span className="font-bold">{stats?.totalPinned || 0}</span>
              </Link>
              <Link to="/notes/trash" className="flex items-center justify-between text-gray-300 hover:text-white transition-colors duration-200">
                <span className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faTrash} /> <span>{t("In Trash")}</span>
                </span>
                <span className="font-bold">{stats?.totalTrash || 0}</span>
              </Link>
              <Link to="/notes/shared-notes" className="flex items-center justify-between text-gray-300 hover:text-white transition-colors duration-200">
                <span className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faShareAlt} /> <span>{t("Shared Notes")}</span>
                </span>
                <span className="font-bold">{stats?.totalShared || 0}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Second Section - Account Management */}
        {loggedInUser?.username === username && (
          <div className="bg-gray-800 rounded-lg shadow-xl p-6" ref={addToRefs}>
            <h3 className="text-xl font-semibold mb-4">{t("Account Management")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/account-management")}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition transform"
              >
                <FontAwesomeIcon icon={faCog} />
                <span>{t("Account Management")}</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-1 transition transform"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>{t("Logout")}</span>
              </button>

              <button
                onClick={() => setIsEditModalOpen(true)}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition transform"
              >
                <FontAwesomeIcon icon={faEdit} />
                <span>{t("Edit Profile")}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Edit Modal */}
      {loggedInUser?.username === username && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentBio={profileData.bio}
          onUpdate={(updatedData) => {
            setProfileData(prev => ({ ...prev, ...updatedData }));
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage;
