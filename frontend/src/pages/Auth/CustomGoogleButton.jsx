import { GoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { googleAuth } from "../../redux/slices/authSlice";
import { toast } from "react-toastify";

export default function CustomGoogleButton({navigate}) {
  const dispatch = useDispatch();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await dispatch(googleAuth(credentialResponse)).unwrap();
      navigate("/dashboard");
      toast.success("Welcome to our site!");
    } catch (err) {
      console.error("Google authentication failed:", err);
      toast.error( "Google authentication failed.");
    }
  };

  const handleGoogleError = () => {
    toast.error("Google Authentication failed. Try again.");
  };

  return (
    <div className="flex justify-center mt-4">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap
        text="continue_with"
      />
    </div>
  );
}
