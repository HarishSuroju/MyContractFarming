# TODO - Fix OTP Verification for Contractor Signup

## Issues Fixed:
1. ✅ VerifyOTPPage.js sends wrong payload (userId, otp) instead of (email, otp)
2. ✅ VerifyOTPPage.js expects userId but SignUpPage passes email in state
3. ✅ Backend sendOTP hardcodes role as "contractor" instead of using frontend's role
4. ✅ Frontend handleSendOTP doesn't pass the role to backend

## Fix Plan:
- [x] Fix VerifyOTPPage.js - Use email from state and send correct payload to backend
- [x] Fix backend authController.js sendOTP - Accept role from frontend
- [x] Fix frontend SignUpPage.js handleSendOTP - Pass role to backend

## Summary of Changes:
1. **frontend/src/pages/VerifyOTPPage.js**: 
   - Changed to get `email` from location.state instead of `userId`
   - Changed API call to send `{ email, otp }` instead of `{ userId, otp }`
   - Added error handling and display of email being verified

2. **backend/controllers/authController.js**:
   - Modified sendOTP to accept `role` from frontend
   - Uses the role passed from frontend, defaults to "contractor" if not provided

3. **frontend/src/pages/SignUpPage.js**:
   - Modified handleSendOTP to pass `{ email: formData.email, role: userType }` to backend
