import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import PageLoader from "../../components/PageLoader";
import toast from "react-hot-toast";
import { auth } from "../../services/api";
import gsap from "gsap";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faSignOutAlt,
  faLock,
  faTrashAlt,
  faAt,
  faIdCardAlt,
} from "@fortawesome/free-solid-svg-icons";

const AccountManagementPage = () => {
  const { user: loggedInUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");

  const pageRef = useRef(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!loggedInUser?.username) {
        setIsLoading(false);
        navigate("/login");
        return;
      }
      setIsLoading(true);
      try {
        const response = await auth.getUserProfile(loggedInUser.username);
        setProfileData(response.data);
        setNewName(response.data.name);
        setNewUsername(response.data.username);
        setNewEmail(response.data.email);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error(t("account.loadFail"));
        setProfileData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [loggedInUser, navigate, t]);

  useEffect(() => {
    if (!isLoading && pageRef.current) {
      gsap.fromTo(
        pageRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
      );
    }
  }, [isLoading]);

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "delete") {
      toast.error(t("account.deleteConfirmError"));
      return;
    }
    try {
      await auth.deleteUser();
      toast.success(t("account.deleteSuccess"));
      logout();
      navigate("/signup");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(t("account.deleteFail"));
    }
  };

  const handleNameChange = async (e) => {
    e.preventDefault();
    try {
      await auth.updateName(newName);
      toast.success(t("account.nameUpdateSuccess"));
      setProfileData((prev) => ({ ...prev, name: newName }));
    } catch (error) {
      toast.error(error.response?.data?.message || t("account.nameUpdateFail"));
    }
  };

  const handleUsernameChange = async (e) => {
    e.preventDefault();
    try {
      await auth.updateUsername(newUsername);
      toast.success(t("account.usernameUpdateSuccess"));
      localStorage.setItem("user", JSON.stringify({ ...loggedInUser, username: newUsername }));
      setProfileData((prev) => ({ ...prev, username: newUsername }));
    } catch (error) {
      toast.error(error.response?.data?.message || t("account.usernameUpdateFail"));
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error(t("account.currentPasswordRequired"));
      return;
    }
    try {
      await auth.updateEmail({ newEmail, currentPassword });
      toast.success(t("account.emailVerifyRedirect"));
      navigate(`/verify-email?email=${newEmail}`); 
    } catch (error) {
      toast.error(error.response?.data?.message || t("account.emailUpdateFail"));
    }
  };

  const handleRequestPasswordReset = async () => {
    try {
      await auth.requestOtp(profileData.email);
      setIsOtpSent(true);
      toast.success(t("account.otpSent"));
    } catch (error) {
      toast.error(error.response?.data?.msg || t("account.otpFail"));
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await auth.verifyOtp({ email: profileData.email, otp });
      if (response.data.token) {
        localStorage.setItem("passwordResetToken", response.data.token);
        setShowPasswordFields(true);
        toast.success(t("account.otpVerified"));
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || t("account.invalidOtp"));
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t("account.passwordMismatch"));
      return;
    }
    const token = localStorage.getItem("passwordResetToken");
    if (!token) {
      toast.error(t("account.tokenMissing"));
      return;
    }
    try {
      await auth.resetPassword({ newPassword, token });
      toast.success(t("account.passwordChanged"));
      setNewPassword("");
      setConfirmPassword("");
      setOtp("");
      setIsOtpSent(false);
      setShowPasswordFields(false);
      localStorage.removeItem("passwordResetToken");
    } catch (error) {
      toast.error(error.response?.data?.msg || t("account.passwordChangeFail"));
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!profileData) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p>{t("account.notFound")}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen text-white" style={{ backgroundColor: '#1a202c' }}
      ref={pageRef}
    >
      <Navbar/>
      <div className="container mt-16 mx-auto p-4 md:p-8 flex-grow">
        <div className="flex items-center mb-6">
          <h1 className="text-3xl font-bold ml-4">{t("account.title")}</h1>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between">
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
              <Link to={`/profile/${profileData.username}`} className="text-sm text-purple-400 hover:underline mt-2 flex items-center">
                <FontAwesomeIcon icon={faIdCardAlt} className="mr-1" /> {t("account.viewProfile")}
              </Link>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-4 md:mt-0 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
            {t("account.signOut")}
          </button>
        </div>

        {/* Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FontAwesomeIcon icon={faUser} className="mr-2 text-purple-400" />
              {t("account.changeName")}
            </h3>
            <form onSubmit={handleNameChange}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <button
                type="submit"
                className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {t("account.updateName")}
              </button>
            </form>
          </div>

          {/* Username */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FontAwesomeIcon icon={faAt} className="mr-2 text-indigo-400" />
              {t("account.changeUsername")}
            </h3>
            <form onSubmit={handleUsernameChange}>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <button
                type="submit"
                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {t("account.updateUsername")}
              </button>
            </form>
          </div>

          {/* Email */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-cyan-400" />
              {t("account.changeEmail")}
            </h3>
            <form onSubmit={handleEmailChange}>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  {t("account.newEmail")}
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  {t("account.currentPassword")}
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="mt-4 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {t("account.updateEmail")}
              </button>
            </form>
          </div>

          {/* Password Reset */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FontAwesomeIcon icon={faLock} className="mr-2 text-blue-400" />
              {t("account.resetPassword")}
            </h3>
            {!showPasswordFields ? (
              <form onSubmit={handleVerifyOtp}>
                {!isOtpSent ? (
                  <button
                    type="button"
                    onClick={handleRequestPasswordReset}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    {t("account.requestPasswordReset")}
                  </button>
                ) : (
                  <>
                    <p className="text-gray-400 mb-2">{t("account.otpSentMsg")}</p>
                    <input
                      type="text"
                      placeholder={t("account.enterOtp")}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      {t("account.verifyOtp")}
                    </button>
                  </>
                )}
              </form>
            ) : (
              <form onSubmit={handlePasswordChange}>
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-bold mb-2">
                    {t("account.newPassword")}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-300 text-sm font-bold mb-2">
                    {t("account.confirmNewPassword")}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {t("account.changePassword")}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-red-400 flex items-center">
            <FontAwesomeIcon icon={faTrashAlt} className="mr-2 text-red-500" />
            {t("account.dangerZone")}
          </h3>
          <p className="text-gray-400 mb-4">
            {t("account.deleteWarning")}
          </p>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <input
              type="text"
              placeholder={t("account.deletePlaceholder")}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="flex-grow w-12 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={handleDeleteAccount}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {t("account.deleteAccount")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManagementPage;